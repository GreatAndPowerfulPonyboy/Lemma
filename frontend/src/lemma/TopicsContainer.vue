<script setup lang="ts">
import { computed, ref } from "vue";
import { api } from "../api/client.ts";
import Dialog from "../reusable/ui/Dialog.vue";
import Menu from "../reusable/ui/Menu.vue";
import { useHome, type MyPoint, type MyTopic } from "./useLemma.ts";

/** `topics` are the topics the filters leave, chosen by HomePage; `showUnsorted` says whether the Unsorted card is one of them. */
const { topics, showUnsorted } = defineProps<{ topics: MyTopic[]; showUnsorted: boolean }>();
/** `open` asks HomePage to show the points in a topic, or in no topic when it's null. */
const emit = defineEmits<{ open: [topic: MyTopic | null] }>();

const { home, working, change, unplace } = useHome();

/** How many of my points each topic has, by category; points with no topic are counted under null. */
const counts = computed(() => {
  const counts = new Map<MyPoint["category"], number>();
  for (const point of home.value?.myPoints ?? []) counts.set(point.category, (counts.get(point.category) ?? 0) + 1);
  return counts;
});

function countOf(category: MyPoint["category"]) {
  const count = counts.value.get(category) ?? 0;
  return count === 1 ? "1 point" : `${count} points`;
}

/** Focuses an input as soon as it appears, so I can type straight away. */
const vFocus = { mounted: (el: HTMLElement) => el.focus() };

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

/** The points in a topic. */
function pointsIn(topic: MyTopic) {
  return (home.value?.myPoints ?? []).filter((p) => p.category === topic.category).map((p) => p.cue);
}

/** Takes every point out of the topic, so they become Unsorted and the topic is left empty. */
function empty(topic: MyTopic) {
  return unplace(pointsIn(topic));
}

/** The topic the delete dialog is asking about, if it's open. */
const deleting = ref<MyTopic | null>(null);

/** Deletes the topic the dialog is asking about, emptying it first if it has points, since a topic with points can't be deleted. */
async function confirmDelete() {
  const topic = deleting.value;
  if (!topic) return;
  if (pointsIn(topic).length && !(await empty(topic))) return;
  await change("/topic/delete", api.topic.delete({ category: topic.category }));
  deleting.value = null;
}

/** The topic whose "Add points" box is open, if any, and the point I'm typing into it. */
const adding = ref<MyTopic["category"] | null>(null);
const newPoint = ref("");

function startAdding(topic: MyTopic) {
  newPoint.value = "";
  adding.value = topic.category;
}

/** Adds the typed point to the topic, then empties the box and leaves it open and focused, so I can type the next one. */
async function addPoint(topic: MyTopic) {
  const name = newPoint.value.trim();
  if (name === "" || working.value) return;
  const result = await change("/point/createIn", api.point.createIn({ name, category: topic.category }));
  if (!("error" in result)) newPoint.value = "";
}
</script>

<template>
  <h4 v-if="!showUnsorted && !topics.length">No topics match.</h4>
  <ul v-else class="card-grid">
    <li v-if="showUnsorted">
      <div class="Topic card">
        <button type="button" class="open" @click="emit('open', null)">
          <span class="name">Unsorted</span>
          <span class="count">{{ countOf(null) }}</span>
        </button>
      </div>
    </li>
    <li v-for="topic in topics" :key="topic.category">
      <div class="Topic card">
        <input v-if="renaming === topic.category" v-model="newName" v-focus aria-label="New topic name" maxlength="80"
               @keydown.enter="saveRename(topic)" @keydown.escape="renaming = null" />
        <button v-else type="button" class="open" @click="emit('open', topic)">
          <span class="name">{{ topic.name }}</span>
          <span class="count">{{ countOf(topic.category) }}</span>
        </button>
        <div class="actions">
          <button type="button" class="button soft" @click="startAdding(topic)">Add points</button>
          <Menu label="Edit topic" align="start">
            <template #button><span class="edit">Edit topic</span></template>
            <button type="button" @click="startRename(topic)">Rename</button>
            <button type="button" :disabled="working || !pointsIn(topic).length" @click="empty(topic)">
              <span>Empty topic<span class="detail">Moves its points to Unsorted</span></span>
            </button>
            <button type="button" @click="deleting = topic">Delete</button>
          </Menu>
        </div>
        <input v-if="adding === topic.category" v-model="newPoint" v-focus maxlength="80"
               :placeholder="`New point in ${topic.name}`" :aria-label="`New point in ${topic.name}`"
               @keydown.enter="addPoint(topic)" @keydown.escape="adding = null" />
      </div>
    </li>
  </ul>
  <Dialog v-if="deleting" :title="`Delete ${deleting.name}?`" @close="deleting = null">
    <p v-if="pointsIn(deleting).length">
      It has {{ countOf(deleting.category) }}. Deleting it empties it first, so they move to Unsorted.
    </p>
    <p v-else>This topic has no points.</p>
    <div class="confirm">
      <button type="button" class="button outline" @click="deleting = null">Cancel</button>
      <button type="button" class="button danger" :disabled="working" @click="confirmDelete">
        {{ pointsIn(deleting).length ? "Empty and delete" : "Delete" }}
      </button>
    </div>
  </Dialog>
</template>

<style scoped>
.Topic {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  border: 2px solid transparent;
}
.Topic:hover {
  border-color: var(--color-border);
}
/* The topic's name and count; clicking them shows the topic's points. */
.open {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-1);
  min-width: 0;
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
.confirm {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
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
