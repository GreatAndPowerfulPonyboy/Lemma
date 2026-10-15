<script setup lang="ts">
import { onMounted, ref } from "vue";
import { api } from "../api/client.ts";
import { type Point, type Topic, useHome } from "./useHome.ts";

const emit = defineEmits<{ recall: [topic: Topic] }>();
const { topics, error, working, refresh, change } = useHome();
const newTopic = ref("");
/** The text in each topic's "add a point" box, by topic. */
const newPoint = ref<Record<string, string>>({});

onMounted(refresh);

async function createTopic() {
  if (await change("/topics/create", api.topics.create({ name: newTopic.value }))) newTopic.value = "";
}

async function renameTopic(topic: Topic) {
  const name = window.prompt("Rename topic", topic.name);
  if (name !== null) await change("/topics/rename", api.topics.rename({ category: topic.category, name }));
}

async function deleteTopic(topic: Topic) {
  await change("/topics/delete", api.topics.delete({ category: topic.category }));
}

async function createPoint(topic: Topic) {
  const name = newPoint.value[topic.category] ?? "";
  if (await change("/cues/create", api.cues.create({ category: topic.category, name }))) newPoint.value[topic.category] = "";
}

async function renamePoint(point: Point) {
  const name = window.prompt("Rename point", point.name);
  if (name !== null) await change("/cues/rename", api.cues.rename({ cue: point.cue, name }));
}

async function movePoint(point: Point, event: Event) {
  const category = (event.target as HTMLSelectElement).value;
  await change("/cues/move", api.cues.move({ cue: point.cue, category }));
}

async function deletePoint(point: Point) {
  await change("/cues/delete", api.cues.delete({ cue: point.cue }));
}
</script>

<template>
  <section class="home">
    <p v-if="error" class="banner" role="alert">{{ error }}</p>

    <form class="row" @submit.prevent="createTopic">
      <input v-model="newTopic" placeholder="New topic, e.g. Proof of the spectral theorem" aria-label="New topic" />
      <button class="button primary" :disabled="working || newTopic.trim() === ''">Add topic</button>
    </form>

    <p v-if="topics && topics.length === 0" class="empty">
      No topics yet. Add a topic, then name the points you want to be able to explain from memory.
    </p>

    <article v-for="topic in topics ?? []" :key="topic.category" class="topic">
      <header class="topic-head">
        <h2>{{ topic.name }}</h2>
        <div class="actions">
          <button class="button primary" :disabled="working || topic.points.length === 0" @click="emit('recall', topic)">
            Recall
          </button>
          <button class="button soft" :disabled="working" @click="renameTopic(topic)">Rename</button>
          <button class="button soft" :disabled="working" @click="deleteTopic(topic)">Delete</button>
        </div>
      </header>

      <ul class="points">
        <li v-for="point in topic.points" :key="point.cue" class="point">
          <span class="point-name">{{ point.name }}</span>
          <select
            v-if="(topics ?? []).length > 1"
            :value="topic.category"
            :disabled="working"
            aria-label="Move to topic"
            @change="movePoint(point, $event)"
          >
            <option v-for="other in topics ?? []" :key="other.category" :value="other.category">{{ other.name }}</option>
          </select>
          <button class="button soft" :disabled="working" @click="renamePoint(point)">Rename</button>
          <button class="button soft" :disabled="working" @click="deletePoint(point)">Delete</button>
        </li>
      </ul>

      <form class="row" @submit.prevent="createPoint(topic)">
        <input
          v-model="newPoint[topic.category]"
          placeholder="A point to cover, by name only"
          :aria-label="`New point in ${topic.name}`"
        />
        <button class="button outline" :disabled="working || (newPoint[topic.category] ?? '').trim() === ''">Add point</button>
      </form>
    </article>
  </section>
</template>

<style scoped>
.home { max-width: 760px; margin: 0 auto; display: grid; gap: var(--space-4); }
.row { display: flex; gap: var(--space-2); }
.row input { flex: 1; }
.banner { padding: 10px 12px; border-radius: var(--radius-sm); background: #fdecec; color: #8a1c1c; }
.empty { color: var(--color-text-muted); }
.topic { border: 1px solid var(--color-border, #ddd); border-radius: var(--radius-md, 10px); padding: var(--space-4); display: grid; gap: var(--space-3); }
.topic-head { display: flex; justify-content: space-between; align-items: center; gap: var(--space-2); flex-wrap: wrap; }
.topic-head h2 { font-size: var(--text-lg); margin: 0; }
.actions { display: flex; gap: var(--space-2); }
.points { list-style: none; padding: 0; margin: 0; display: grid; gap: var(--space-1); }
.point { display: flex; align-items: center; gap: var(--space-2); }
.point-name { flex: 1; }
</style>
