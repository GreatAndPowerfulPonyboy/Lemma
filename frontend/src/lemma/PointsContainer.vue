<script setup lang = "ts">
import {computed, onUnmounted, ref} from 'vue';
import Menu from "../reusable/ui/Menu.vue";
import {useHome, type MyPoint, type MyTopic} from "./useLemma.ts";
import PointCard from "./PointCard.vue";
/** `hasPoints` is false when I have no points at all, and true when I have some but the filters hide them all. */
const {points, hasPoints} = defineProps<{points: MyPoint[], hasPoints: boolean}>();

const {home, working, move} = useHome();

/** The points I've ticked. Points hidden by a search stay ticked but aren't moved until they show again. */
const ticked = ref(new Set<MyPoint["cue"]>());
const selected = computed(() => points.filter((p) => ticked.value.has(p.cue)));

function toggle(cue: MyPoint["cue"]) {
  // A rectangle that ends on the card it started on also fires a click there; that click isn't a toggle.
  if (justDragged) return;
  const next = new Set(ticked.value);
  if (!next.delete(cue)) next.add(cue);
  ticked.value = next;
}

/**
 * The selection rectangle, in window coordinates, while I drag inside the points area; null otherwise.
 * `x` and `y` are where I pressed, `toX` and `toY` where the pointer is now.
 */
const box = ref<{ x: number; y: number; toX: number; toY: number } | null>(null);
const grid = ref<HTMLElement | null>(null);

/** Where I pressed, until I either let go (a click) or move far enough to start a rectangle. */
let pressedAt: { x: number; y: number } | null = null;
let justDragged = false;

/** How far, in pixels, the pointer must move while pressed before a press counts as a drag rather than a click. */
const dragDistance = 5;

/** The rectangle as CSS, whichever way I dragged. */
const boxStyle = computed(() => {
  if (!box.value) return {};
  const { x, y, toX, toY } = box.value;
  return {
    left: `${Math.min(x, toX)}px`,
    top: `${Math.min(y, toY)}px`,
    width: `${Math.abs(toX - x)}px`,
    height: `${Math.abs(toY - y)}px`,
  };
});

/**
 * Pressing the main mouse button anywhere in the points area, on a card or between them, can start a rectangle.
 * Presses on buttons, inputs, menus and the selected-points bar are left alone, so those controls work as usual.
 */
function press(event: PointerEvent) {
  if (event.pointerType !== "mouse" || event.button !== 0) return;
  if (event.target instanceof Element && event.target.closest("button, input, .menu, dialog, .bulk")) return;
  event.preventDefault(); // stops the drag from highlighting text
  pressedAt = { x: event.clientX, y: event.clientY };
  window.addEventListener("pointermove", growBox);
  window.addEventListener("pointerup", endBox);
}

/** The points whose cards the rectangle touches right now. They're highlighted while I drag, and selected when I let go. */
const touched = ref(new Set<MyPoint["cue"]>());

/** Finds every card that overlaps the rectangle, by comparing each card's position on screen with it. */
function cardsUnderBox() {
  const found = new Set<MyPoint["cue"]>();
  if (!box.value) return found;
  const { x, y, toX, toY } = box.value;
  const left = Math.min(x, toX), right = Math.max(x, toX), top = Math.min(y, toY), bottom = Math.max(y, toY);
  for (const card of grid.value?.querySelectorAll<HTMLElement>("[data-cue]") ?? []) {
    const r = card.getBoundingClientRect();
    if (r.left <= right && r.right >= left && r.top <= bottom && r.bottom >= top) found.add(card.dataset.cue as MyPoint["cue"]);
  }
  return found;
}

/** Draws the rectangle once the pointer has moved far enough from where I pressed, then follows the pointer and updates which cards it touches. */
function growBox(event: PointerEvent) {
  if (!pressedAt) return;
  if (!box.value && Math.hypot(event.clientX - pressedAt.x, event.clientY - pressedAt.y) < dragDistance) return;
  window.getSelection()?.removeAllRanges();
  box.value = { x: pressedAt.x, y: pressedAt.y, toX: event.clientX, toY: event.clientY };
  touched.value = cardsUnderBox();
}

/** Adds the touched cards to the selection, then removes the rectangle. A press that never moved far enough was a click, and is left to the card. */
function endBox() {
  window.removeEventListener("pointermove", growBox);
  window.removeEventListener("pointerup", endBox);
  pressedAt = null;
  if (!box.value) return;
  justDragged = true;
  setTimeout(() => (justDragged = false));
  ticked.value = new Set([...ticked.value, ...touched.value]);
  touched.value = new Set();
  box.value = null;
}
onUnmounted(endBox);

function selectAll() {
  ticked.value = new Set(points.map((p) => p.cue));
}
function clear() {
  ticked.value = new Set();
}

async function moveSelected(category: MyTopic["category"]) {
  if (await move(selected.value.map((p) => p.cue), category)) clear();
}
</script>

<template>
  <section v-if="points.length" class="points" :class="{dragging: box !== null}" @pointerdown="press">
    <div v-if="selected.length" class="bulk" role="toolbar" aria-label="Selected points">
      <span>{{selected.length}} selected</span>
      <button type="button" @click="selectAll">Select all</button>
      <Menu label="Move selected points">
        <template #button>Move to topic</template>
        <button v-for="topic in home?.myTopics ?? []" :key="topic.category" type="button" :disabled="working"
                @click="moveSelected(topic.category)">{{topic.name}}</button>
        <p v-if="!home?.myTopics.length" class="heading">Add a topic first</p>
      </Menu>
      <button type="button" @click="clear">Clear</button>
    </div>
    <ul ref="grid" class="card-grid">
      <li v-for="point in points" :key="point.cue" :data-cue="point.cue">
        <PointCard :row="point" :selected="ticked.has(point.cue)" :selecting="selected.length > 0"
                   :touched="touched.has(point.cue)" @toggle="toggle(point.cue)"></PointCard>
      </li>
    </ul>
    <div v-if="box" class="box" :style="boxStyle" aria-hidden="true"></div>
  </section>
  <section v-else-if="hasPoints">
    <h4>No points match.</h4>
  </section>
  <section v-else>
    <h4>No points yet. Type one above to capture it.</h4>
  </section>
</template>

<style scoped>
/* Tall enough to leave empty background below the cards, where a selection rectangle can start, and padded at the bottom so the pinned bar never covers the last row. */
.points {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  min-height: 60vh;
  padding-bottom: 88px;
}
/* While I drag a selection rectangle, text isn't highlighted. */
.dragging {
  user-select: none;
}
.box {
  position: fixed;
  z-index: 15;
  border: 1px solid var(--color-accent);
  border-radius: 2px;
  background: color-mix(in srgb, var(--color-accent) 15%, transparent);
  pointer-events: none;
}
/* Pinned to the bottom of the screen, so it appearing never moves the cards under the pointer. */
.bulk {
  position: fixed;
  bottom: var(--space-4);
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  width: max-content;
  max-width: calc(100vw - 32px);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--shadow-popover);
}
.heading {
  padding: 8px 10px;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
</style>
