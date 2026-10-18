<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { api } from "../api/client.ts";
import PointsContainer from "./PointsContainer.vue";
import { useHome } from "./useLemma.ts";

const { home, error, working, refresh, change } = useHome();
onMounted(refresh);

const pointSearch = ref("");
const topicSearch = ref("");

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
const contains = (text: string, part: string) => text.toLowerCase().includes(part.trim().toLowerCase());

/** The topic whose name is exactly what's in the topic box, if any. New points go into it. */
const exactTopic = computed(() =>
  topicSearch.value.trim() === "" ? undefined : home.value?.myTopics.find((t) => same(t.name, topicSearch.value)),
);

const shown = computed(() =>
  (home.value?.myPoints ?? []).filter(
    (p) => contains(p.pointName, pointSearch.value) &&
      (topicSearch.value.trim() === "" || contains(p.topicName ?? "", topicSearch.value)),
  ),
);

const canAddPoint = computed(
  () => pointSearch.value.trim() !== "" && !(home.value?.myPoints ?? []).some((p) => same(p.pointName, pointSearch.value)),
);
const canAddTopic = computed(() => topicSearch.value.trim() !== "" && !exactTopic.value);

async function addPoint() {
  if (!canAddPoint.value) return;
  const name = pointSearch.value.trim();
  const topic = exactTopic.value;
  const result = topic
    ? await change("/point/createIn", api.point.createIn({ name, category: topic.category }))
    : await change("/point/create", api.point.create({ name }));
  if (!("error" in result)) pointSearch.value = "";
}

async function addTopic() {
  if (!canAddTopic.value) return;
  await change("/topic/create", api.topic.create({ name: topicSearch.value.trim() }));
}
</script>

<template>
  <main>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-else-if="!home">Loading…</p>

    <template v-if="home">
      <div class="controls">
        <div class="box">
          <input v-model="pointSearch" placeholder="Search or add a point"
                 @keydown.enter="addPoint" @keydown.escape="pointSearch = ''" />
          <button v-if="canAddPoint" type="button" :disabled="working" @click="addPoint">
            + Add point "{{ pointSearch.trim() }}"<template v-if="exactTopic"> to {{ exactTopic.name }}</template>
          </button>
        </div>

        <div class="box">
          <input v-model="topicSearch" placeholder="Filter by topic, or add one"
                 @keydown.enter="addTopic" @keydown.escape="topicSearch = ''" />
          <button v-if="canAddTopic" type="button" :disabled="working" @click="addTopic">
            + Add topic "{{ topicSearch.trim() }}"
          </button>
        </div>

        <button type="button" disabled>Review scheduling</button>
      </div>

      <PointsContainer :points="shown" />
    </template>
  </main>
</template>
