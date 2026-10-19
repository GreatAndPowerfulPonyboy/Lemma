<script setup lang = "ts">
import {computed, ref} from 'vue';
import {api} from "../api/client.ts";
import Dialog from "../reusable/ui/Dialog.vue";
import Menu  from "../reusable/ui/Menu.vue";
import {useHome, type MyPoint} from "./useLemma.ts";

/** `touched` means a selection rectangle is over this card, so it will be selected when I let go. */
const {row, selected = false, selecting = false, touched = false} = defineProps<{ row: MyPoint, selected?: boolean, selecting?: boolean, touched?: boolean}>();
/** `toggle` selects or unselects this point. */
const emit = defineEmits<{ toggle: [] }>();

const editing = ref(false);
const newName = ref("");

const {home, working, change, move} = useHome();

/** Every topic except the one this point is already in. */
const otherTopics = computed(() => (home.value?.myTopics ?? []).filter((t) => t.category !== row.category));

function startRename() {
  newName.value = row.pointName;
  editing.value = true;
}
async function saveRename() {
  const result = await change("/point/rename", api.point.rename({cue: row.cue, name: newName.value}))
  if (!("error" in result)) editing.value = false;
}

/** True while the dialog asks me to confirm deleting this point, since a deleted point can't be brought back. */
const confirmingDelete = ref(false);

async function deletePoint() {
  await change("/point/delete", api.point.delete({cue: row.cue}));
  confirmingDelete.value = false;
}

/** True for clicks on the card's own controls (the select target, the menu, the rename box, the dialog), which do their own thing. */
function onControl(event: Event) {
  return event.target instanceof Element && event.target.closest("button, input, .menu, dialog") !== null;
}

/** Clicking the card's background toggles it. The select button in the corner does the same for the keyboard. */
function clickCard(event: MouseEvent) {
  if (!onControl(event)) emit("toggle");
}
</script>

<template>
  <div class="Point card" :class="{selected, selecting, touched}" @click="clickCard">
    <button type="button" class="select" :aria-pressed="selected" :aria-label="`Select ${row.pointName}`"
            @click="emit('toggle')">
      <span v-if="selected" aria-hidden="true">✓</span>
    </button>
    <p class="topic">{{row.topicName ?? "Unsorted"}}</p>
    <div class="line">
      <input v-if="editing" v-model="newName" aria-label="New point name" maxlength="80"
             @keydown.enter="saveRename" @keydown.escape="editing = false" />
      <p v-else class = "name">{{row.pointName}}</p>
      <Menu label="Edit point" align="start">
        <template #button><span class="edit">Edit point</span></template>
        <button type="button" @click="confirmingDelete = true">Delete</button>
        <button type="button" @click="startRename">Rename</button>
        <p class="heading">Move to</p>
        <button v-for="topic in otherTopics" :key="topic.category" type="button" :disabled="working"
                @click="move([row.cue], topic.category)">{{topic.name}}</button>
        <p v-if="!otherTopics.length" class="heading">No other topics yet</p>
      </Menu>
    </div>
  <Dialog v-if="confirmingDelete" title="Delete this point?" :subtitle="row.pointName" @close="confirmingDelete = false">
    <p>This can't be undone.</p>
    <div class="confirm">
      <button type="button" class="button outline" @click="confirmingDelete = false">Cancel</button>
      <button type="button" class="button danger" :disabled="working" @click="deletePoint">Delete</button>
    </div>
  </Dialog>
  </div>
</template>

<style scoped>
.Point {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-4);
  border: 2px solid transparent;
  cursor: pointer;
}
/* The whole card is clickable, so hovering it outlines it. */
.Point:hover {
  border-color: var(--color-border);
}
.Point.selected {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
}
/* Under a selection rectangle: a dashed outline previews that letting go will select this card. */
.Point.touched {
  border-color: var(--color-accent);
  border-style: dashed;
  background: var(--color-accent-soft);
}
.topic {
  /* Leaves room for the select target in the corner. */
  padding-right: 36px;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  overflow-wrap: anywhere;
}
.line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}
.name {
  min-width: 0;
  overflow-wrap: anywhere;
}
.line input {
  flex: 1 1 140px;
  min-width: 0;
}
.edit {
  padding: 0 var(--space-3);
  font-size: var(--text-sm);
}
/* The select target: a circle in the top-right corner that appears when I hover over or focus a point, and stays on every point once any is selected. */
.select {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 2px solid var(--color-border);
  border-radius: 50%;
  background: var(--color-surface);
  color: #ffffff;
  font-size: var(--text-xs);
  font-weight: 700;
  opacity: 0;
  transition: opacity 0.1s;
}
.Point:hover .select,
.Point:focus-within .select,
.Point.selecting .select,
.Point.touched .select {
  opacity: 1;
}
.select:hover {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
}
.select[aria-pressed="true"] {
  border-color: var(--color-accent);
  background: var(--color-accent);
}
.heading {
  padding: 8px 10px 2px;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
.confirm {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}
</style>
