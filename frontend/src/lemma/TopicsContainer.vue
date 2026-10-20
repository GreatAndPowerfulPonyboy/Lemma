<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import { api } from "../api/client.ts";
import Dialog from "../reusable/ui/Dialog.vue";
import Menu from "../reusable/ui/Menu.vue";
import RecallDialog from "./RecallDialog.vue";
import { useBoxSelect, useDragTip } from "./useBoxSelect.ts";
import EmptyState from "./EmptyState.vue";
import { useHome, type MyPoint, type MyTopic } from "./useLemma.ts";

/** `topics` are the topics the filters leave, chosen by HomePage; `showUnsorted` says whether the Unsorted card is one of them. */
const { topics, showUnsorted } = defineProps<{ topics: MyTopic[]; showUnsorted: boolean }>();
/** `open` asks HomePage to show the points in a topic, or in no topic when it's null. */
const emit = defineEmits<{ open: [topic: MyTopic | null] }>();

const { home, working, change, unplace, pointsIn, emptyTopics, emptyAndDeleteTopics } = useHome();

/** How many of my points each topic has, by category; points with no topic are counted under null. */
const counts = computed(() => {
  const counts = new Map<MyPoint["category"], number>();
  for (const point of home.value?.myPoints ?? []) counts.set(point.category, (counts.get(point.category) ?? 0) + 1);
  return counts;
});

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;
const countOf = (category: MyPoint["category"]) => plural(counts.value.get(category) ?? 0, "point");

/** Focuses an input as soon as it appears, so I can type straight away. */
const vFocus = { mounted: (el: HTMLElement) => el.focus() };

/** The topics I've ticked. The Unsorted card isn't a topic, so it's never one of them. */
const ticked = ref(new Set<MyTopic["category"]>());
const selected = computed(() => topics.filter((t) => ticked.value.has(t.category)));

/** The area I can drag a selection rectangle in: everything below the divider. */
const area = ref<HTMLElement | null>(null);
const { box, boxStyle, touched, press, justDragged } = useBoxSelect<MyTopic["category"]>(area, (categories) => {
  ticked.value = new Set([...ticked.value, ...categories]);
});

const { dragTipShowing, showDragTip, hideDragTip } = useDragTip(() => selected.value.length);

/** Selecting a topic by clicking shows the drag tip, the first time ever. */
function toggle(category: MyTopic["category"]) {
  if (justDragged()) return;
  const next = new Set(ticked.value);
  if (!next.delete(category)) {
    next.add(category);
    showDragTip();
  }
  ticked.value = next;
}
function clear() {
  ticked.value = new Set();
}

/** True for clicks on a card's own controls, which do their own thing. */
function onControl(event: Event) {
  return event.target instanceof Element && event.target.closest("button, input, .menu, dialog") !== null;
}

/** Clicking a topic card's background toggles it. The select button in the corner does the same for the keyboard. */
function clickCard(event: MouseEvent, topic: MyTopic) {
  if (!onControl(event)) toggle(topic.category);
}

/** The topic I'm renaming, if any, and the name I'm typing for it. */
const renaming = ref<MyTopic["category"] | null>(null);
const newName = ref("");

function startRename(topic: MyTopic) {
  newName.value = topic.name;
  renaming.value = topic.category;
}
async function saveRename(topic: MyTopic) {
  const result = await change("/topic/rename", api.topic.rename({ category: topic.category, newName: newName.value }));
  if (!("error" in result)) renaming.value = null;
}

/**
 * What the confirmation dialog is asking about, if it's open: emptying some topics, or deleting them (emptying
 * them first, since a topic with points can't be deleted). Deleting one topic from its menu asks the same way.
 */
const confirming = ref<{ action: "empty" | "delete"; topics: MyTopic[] } | null>(null);

/** How the dialog names the topics: by name for one, by count for several. */
const confirmingName = computed(() => {
  const chosen = confirming.value?.topics ?? [];
  return chosen.length === 1 ? chosen[0]!.name : plural(chosen.length, "topic");
});
const confirmingPoints = computed(() => pointsIn((confirming.value?.topics ?? []).map((t) => t.category)).length);

async function confirm() {
  const asked = confirming.value;
  if (!asked) return;
  const categories = asked.topics.map((t) => t.category);
  const done = asked.action === "empty" ? await emptyTopics(categories) : await emptyAndDeleteTopics(categories);
  if (done) clear();
  confirming.value = null;
}

/** The topic whose points the dialog asks me to name a prompt for, if it's open. */
const recalling = ref<MyTopic | null>(null);

/** The selected topics have at least one point, so emptying them would do something. */
const selectedHavePoints = computed(() => pointsIn(selected.value.map((t) => t.category)).length > 0);

/**
 * The card whose "Add points" box is open, if any: a topic's category, or "unsorted" for the Unsorted card.
 * Closing the box, by Escape, its × button or a click outside its card, throws away whatever I typed.
 */
const adding = ref<MyTopic["category"] | "unsorted" | null>(null);
const newPoint = ref("");

function startAdding(key: MyTopic["category"] | "unsorted") {
  newPoint.value = "";
  adding.value = key;
}
function stopAdding() {
  adding.value = null;
  newPoint.value = "";
}

/** Adds the typed point to the topic, or to no topic for the Unsorted card, then empties the box and leaves it open and focused, so I can type the next one. */
async function addPoint(topic: MyTopic | null) {
  const name = newPoint.value.trim();
  if (name === "" || working.value) return;
  const result = topic
    ? await change("/point/createIn", api.point.createIn({ name, category: topic.category }))
    : await change("/point/create", api.point.create({ name }));
  if (!("error" in result)) newPoint.value = "";
}

/** A click anywhere outside the card whose box is open closes it. */
function closeIfOutside(event: MouseEvent) {
  if (event.target instanceof Element && !event.target.closest(".Topic.adding")) stopAdding();
}
watch(adding, (key) => {
  if (key === null) document.removeEventListener("click", closeIfOutside);
  else document.addEventListener("click", closeIfOutside);
});
onUnmounted(() => document.removeEventListener("click", closeIfOutside));
</script>

<template>
  <section ref="area" class="content-area" :class="{ dragging: box !== null }" @pointerdown="press">
    <div v-if="selected.length" class="bulk" role="toolbar" aria-label="Selected topics">
      <span>{{ plural(selected.length, "topic") }} selected</span>
      <button type="button" class="button outline" :disabled="!selectedHavePoints"
              @click="confirming = { action: 'empty', topics: selected }">Empty</button>
      <button type="button" class="button danger" @click="confirming = { action: 'delete', topics: selected }">Empty and delete</button>
      <button type="button" class="button outline" @click="clear">Clear</button>
      <p v-if="dragTipShowing" class="tip">
        Tip: drag across the background to select several.
        <button type="button" class="icon-button" aria-label="Dismiss tip" @click="hideDragTip">×</button>
      </p>
    </div>

    <EmptyState v-if="!showUnsorted && !topics.length" heading="No topics match"
                help="Try a different topic search, or turn off Unsorted." />
    <ul v-else class="card-grid content-width">
      <li v-if="showUnsorted">
        <div class="Topic card" :class="{ adding: adding === 'unsorted' }">
          <button type="button" class="open" @click="emit('open', null)">
            <span class="name">Unsorted</span>
            <span class="count">{{ countOf(null) }}</span>
          </button>
          <div class="actions">
            <button type="button" class="button soft" @click="startAdding('unsorted')">Add points</button>
          </div>
          <div v-if="adding === 'unsorted'" class="add">
            <div class="add-box">
              <input v-model="newPoint" v-focus maxlength="80" placeholder="New unsorted point" aria-label="New unsorted point"
                     @keydown.enter="addPoint(null)" @keydown.escape="stopAdding" />
              <button type="button" class="icon-button" aria-label="Close" @click="stopAdding">×</button>
            </div>
            <p class="hint">Enter to add · Esc to close</p>
          </div>
        </div>
      </li>
      <li v-for="topic in topics" :key="topic.category" :data-key="topic.category">
        <div class="Topic card selectable" @click="clickCard($event, topic)"
             :class="{ selected: ticked.has(topic.category), selecting: selected.length > 0, touched: touched.has(topic.category), adding: adding === topic.category }">
          <button type="button" class="select-target" :aria-pressed="ticked.has(topic.category)"
                  :aria-label="`Select ${topic.name}`" @click="toggle(topic.category)">
            <span v-if="ticked.has(topic.category)" aria-hidden="true">✓</span>
          </button>
          <input v-if="renaming === topic.category" v-model="newName" v-focus aria-label="New topic name" maxlength="80"
                 @keydown.enter="saveRename(topic)" @keydown.escape="renaming = null" />
          <button v-else type="button" class="open" @click="emit('open', topic)">
            <span class="name">{{ topic.name }}</span>
            <span class="count">{{ countOf(topic.category) }}</span>
          </button>
          <div class="actions">
            <button type="button" class="button soft" @click="startAdding(topic.category)">Add points</button>
            <button type="button" class="button outline" :disabled="!pointsIn([topic.category]).length"
                    @click="recalling = topic">Recall this topic</button>
            <Menu label="Edit topic" align="start">
              <template #button><span class="edit">Edit topic</span></template>
              <button type="button" @click="startRename(topic)">Rename</button>
              <button type="button" :disabled="working || !pointsIn([topic.category]).length" @click="unplace(pointsIn([topic.category]))">
                <span>Empty topic<span class="detail">Moves its points to Unsorted</span></span>
              </button>
              <button type="button" @click="confirming = { action: 'delete', topics: [topic] }">Delete</button>
            </Menu>
          </div>
          <div v-if="adding === topic.category" class="add">
            <div class="add-box">
              <input v-model="newPoint" v-focus maxlength="80"
                     :placeholder="`New point in ${topic.name}`" :aria-label="`New point in ${topic.name}`"
                     @keydown.enter="addPoint(topic)" @keydown.escape="stopAdding" />
              <button type="button" class="icon-button" aria-label="Close" @click="stopAdding">×</button>
            </div>
            <p class="hint">Enter to add · Esc to close</p>
          </div>
        </div>
      </li>
    </ul>

    <div v-if="box" class="selection-box" :style="boxStyle" aria-hidden="true"></div>

    <Dialog v-if="confirming" @close="confirming = null"
            :title="confirming.action === 'empty' ? `Empty ${confirmingName}?` : `Delete ${confirmingName}?`">
      <p v-if="confirming.action === 'empty'">{{ plural(confirmingPoints, "point") }} will move to Unsorted.</p>
      <p v-else-if="confirmingPoints">
        {{ plural(confirmingPoints, "point") }} will move to Unsorted first, then
        {{ confirming.topics.length === 1 ? "the topic" : `the ${plural(confirming.topics.length, "topic")}` }} will be deleted.
      </p>
      <p v-else>{{ confirming.topics.length === 1 ? "This topic has" : "These topics have" }} no points.</p>
      <div class="dialog-buttons">
        <button type="button" class="button outline" @click="confirming = null">Cancel</button>
        <button type="button" class="button danger" :disabled="working" @click="confirm">
          {{ confirming.action === "empty" ? "Empty" : confirmingPoints ? "Empty and delete" : "Delete" }}
        </button>
      </div>
    </Dialog>
    <RecallDialog v-if="recalling" :points="(home?.myPoints ?? []).filter((p) => p.category === recalling!.category)"
                  :name="`Explain ${recalling.name}`" choose
                  @close="recalling = null" />
  </section>
</template>

<style scoped>
.Topic {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
}
/* The Unsorted card isn't selectable, so it gets the same outline-on-hover by itself. */
.Topic:not(.selectable) {
  border: 2px solid transparent;
}
.Topic:not(.selectable):hover {
  border-color: var(--color-border);
}
/* The topic's name and count; clicking them shows the topic's points. */
.open {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-1);
  min-width: 0;
  /* Leaves room for the select target in the corner. */
  margin-right: 36px;
  padding: 0;
  border: 0;
  background: none;
  text-align: left;
}
.open:hover .name {
  color: var(--color-accent);
}
.name {
  font-weight: 600;
  overflow-wrap: anywhere;
}
.count {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}
.edit {
  padding: 0 var(--space-3);
  font-size: var(--text-sm);
}
.add {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.add-box {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}
.hint {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
input {
  width: 100%;
  min-width: 0;
  min-height: 40px;
  padding: 0 14px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}
input:focus {
  outline: none;
  border-color: var(--color-accent);
}
</style>
