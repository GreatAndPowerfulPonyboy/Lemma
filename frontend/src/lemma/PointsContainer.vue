<script setup lang = "ts">
import {computed, ref} from 'vue';
import Menu from "../reusable/ui/Menu.vue";
import {useHome, type MyPoint, type MyTopic} from "./useLemma.ts";
import PointCard from "./PointCard.vue";
const {points} = defineProps<{points: MyPoint[]}>();

const {home, working, move} = useHome();

/** The points I've ticked. Points hidden by a search stay ticked but aren't moved until they show again. */
const ticked = ref(new Set<MyPoint["cue"]>());
const selected = computed(() => points.filter((p) => ticked.value.has(p.cue)));

function toggle(cue: MyPoint["cue"]) {
  const next = new Set(ticked.value);
  if (!next.delete(cue)) next.add(cue);
  ticked.value = next;
}
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
  <section v-if="points.length" class="points">
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
    <div>
      <ul>
        <li v-for="point in points" :key="point.cue">
          <PointCard :row="point" :selected="ticked.has(point.cue)" :selecting="selected.length > 0"
                     @toggle="toggle(point.cue)"></PointCard>
        </li>
      </ul>
    </div>
  </section>
  <section v-else>
    <h4>Add A point!</h4>
  </section>
</template>

<style scoped>
.bulk {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}
.heading {
  padding: 8px 10px;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
</style>
