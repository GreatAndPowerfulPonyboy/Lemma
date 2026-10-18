<script setup lang = "ts">
import {computed, ref} from 'vue';
import {api} from "../api/client.ts";
import Menu  from "../reusable/ui/Menu.vue";
import {useHome, type MyPoint} from "./useLemma.ts";

const {row, selected = false, selecting = false} = defineProps<{ row: MyPoint, selected?: boolean, selecting?: boolean}>();
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
</script>

<template>
  <div class="Point" :class="{selected, selecting}">
    <input type="checkbox" class="select" :checked="selected" :aria-label="`Select ${row.pointName}`" @change="emit('toggle')" />
    <p class="topic">{{row.topicName ?? "Unsorted"}}</p>
    <input v-if="editing" v-model="newName" @keydown.enter="saveRename" @keydown.escape="editing = false" />
    <p v-else class = "name">{{row.pointName}}</p>
  <Menu label="Point actions">
    <template #button>...</template>
    <button type="button" @click="change('/point/delete', api.point.delete({cue: row.cue}))">Delete</button>
    <button type="button" @click="startRename">Rename</button>
    <p class="heading">Move to</p>
    <button v-for="topic in otherTopics" :key="topic.category" type="button" :disabled="working"
            @click="move([row.cue], topic.category)">{{topic.name}}</button>
    <p v-if="!otherTopics.length" class="heading">No other topics yet</p>
  </Menu>
  </div>
</template>

<style scoped>
.Point {
  position: relative;
}
/* The checkbox appears when I hover over or focus a point, and stays on every point once any is selected. */
.select {
  opacity: 0;
  transition: opacity 0.1s;
}
.Point:hover .select,
.Point:focus-within .select,
.Point.selecting .select {
  opacity: 1;
}
.Point.selected {
  outline: 2px solid var(--color-accent);
  border-radius: var(--radius-md);
  background: var(--color-accent-soft);
}
.heading {
  padding: 8px 10px 2px;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
</style>
