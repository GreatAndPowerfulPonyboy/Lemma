<script setup lang = "ts">
import {computed, ref} from 'vue';
import Dialog from "../reusable/ui/Dialog.vue";
import Menu from "../reusable/ui/Menu.vue";
import PointCard from "./PointCard.vue";
import RecallDialog from "./RecallDialog.vue";
import TopicPicker from "./TopicPicker.vue";
import {useBoxSelect, useDragTip} from "./useBoxSelect.ts";
import {useHome, type MyPoint, type MyTopic} from "./useLemma.ts";
/** `hasPoints` is false when I have no points at all, and true when I have some but the filters hide them all. */
const {points, hasPoints} = defineProps<{points: MyPoint[], hasPoints: boolean}>();

const {home, working, move} = useHome();

/** The points I've ticked. Points hidden by a search stay ticked but aren't moved until they show again. */
const ticked = ref(new Set<MyPoint["cue"]>());
const selected = computed(() => points.filter((p) => ticked.value.has(p.cue)));

/** The area I can drag a selection rectangle in: everything below the divider. */
const area = ref<HTMLElement | null>(null);
const {box, boxStyle, touched, press, justDragged} = useBoxSelect<MyPoint["cue"]>(area, (cues) => {
  ticked.value = new Set([...ticked.value, ...cues]);
});

const {dragTipShowing, showDragTip, hideDragTip} = useDragTip(() => selected.value.length);

/** Selecting a point by clicking shows the drag tip, the first time ever. */
function toggle(cue: MyPoint["cue"]) {
  if (justDragged()) return;
  const next = new Set(ticked.value);
  if (!next.delete(cue)) {
    next.add(cue);
    showDragTip();
  }
  ticked.value = next;
}
function selectAll() {
  ticked.value = new Set(points.map((p) => p.cue));
}
function clear() {
  ticked.value = new Set();
}

/** Moving this many points or more from the bar asks first; fewer move straight away. */
const confirmMovesFrom = 10;

/** The topic I picked in the bar's "Move to topic" menu, while the dialog asks me to confirm the move. */
const movingTo = ref<MyTopic | null>(null);

/** The selected points that would actually move to a topic: those not already in it. */
const movingInto = (topic: MyTopic | null) => selected.value.filter((p) => p.category !== topic?.category);
const moving = computed(() => movingInto(movingTo.value));

/** Picking a topic in the bar moves the points, asking first only when there are many of them. */
async function pickTopic(topic: MyTopic) {
  const cues = movingInto(topic).map((p) => p.cue);
  if (cues.length >= confirmMovesFrom) movingTo.value = topic;
  else if (await move(cues, topic.category)) clear();
}

/** How many topics the moving points come from, with Unsorted counted as one. */
const sourceCount = computed(() => new Set(moving.value.map((p) => p.category)).size);

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

/** True while the dialog asks what to call a prompt for the selected points. */
const recalling = ref(false);

async function confirmMove() {
  const topic = movingTo.value;
  if (!topic) return;
  if (await move(moving.value.map((p) => p.cue), topic.category)) clear();
  movingTo.value = null;
}
</script>

<template>
  <section ref="area" class="content-area" :class="{dragging: box !== null}" @pointerdown="press">
    <div v-if="selected.length" class="bulk" role="toolbar" aria-label="Selected points">
      <span>{{selected.length}} selected</span>
      <button type="button" @click="selectAll">Select all</button>
      <Menu label="Move selected points">
        <template #button>Move to topic</template>
        <TopicPicker :topics="home?.myTopics ?? []" @pick="pickTopic" />
      </Menu>
      <button type="button" @click="recalling = true">Recall selected</button>
      <button type="button" @click="clear">Clear</button>
      <p v-if="dragTipShowing" class="tip">
        Tip: drag across the background to select several.
        <button type="button" class="icon-button" aria-label="Dismiss tip" @click="hideDragTip">×</button>
      </p>
    </div>
    <ul v-if="points.length" class="card-grid content-width">
      <li v-for="point in points" :key="point.cue" :data-key="point.cue">
        <PointCard :row="point" :selected="ticked.has(point.cue)" :selecting="selected.length > 0"
                   :touched="touched.has(point.cue)" @toggle="toggle(point.cue)"></PointCard>
      </li>
    </ul>
    <h4 v-else-if="hasPoints" class="content-width">No points match.</h4>
    <h4 v-else class="content-width">No points yet. Type one above to capture it.</h4>
    <div v-if="box" class="selection-box" :style="boxStyle" aria-hidden="true"></div>
    <Dialog v-if="movingTo" hide-close @close="movingTo = null"
            :title="`Move ${plural(moving.length, 'point')} from ${plural(sourceCount, 'topic')} to ${movingTo.name}?`">
      <div class="dialog-buttons">
        <button type="button" class="button outline" @click="movingTo = null">Cancel</button>
        <button type="button" class="button primary" :disabled="working" autofocus @click="confirmMove">Move</button>
      </div>
    </Dialog>
    <RecallDialog v-if="recalling" :points="selected" @close="recalling = false" />
  </section>
</template>
