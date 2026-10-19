<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import Icon from "../reusable/ui/Icon.vue";
import FilterRow from "./FilterRow.vue";
import PointsContainer from "./PointsContainer.vue";
import PointSearch from "./PointSearch.vue";
import TopicsContainer from "./TopicsContainer.vue";
import TopicSearch from "./TopicSearch.vue";
import { useHome, type MyTopic } from "./useLemma.ts";

const { home, error, refresh } = useHome();
onMounted(refresh);

const pointSearch = ref("");
const topicSearch = ref("");

/** True when I'm looking only at points with no topic. */
const unsorted = ref(false);

/** Whether the main area shows my points or my topics. */
const view = ref<"points" | "topics">("points");

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
const contains = (text: string, part: string) => text.toLowerCase().includes(part.trim().toLowerCase());

/** The topic whose name is exactly what's in the topic box, if any. New points go into it. */
const exactTopic = computed(() =>
  topicSearch.value.trim() === "" ? undefined : home.value?.myTopics.find((t) => same(t.name, topicSearch.value)),
);

const shown = computed(() =>
  (home.value?.myPoints ?? []).filter(
    (p) => contains(p.pointName, pointSearch.value) &&
      (unsorted.value
        ? p.category === null
        : topicSearch.value.trim() === "" || contains(p.topicName ?? "", topicSearch.value)),
  ),
);

/** The topics the Topics view shows: those whose name contains the topic box's text, or none while Unsorted is on. */
const shownTopics = computed(() =>
  unsorted.value ? [] : (home.value?.myTopics ?? []).filter((t) => contains(t.name, topicSearch.value)),
);

/** The Unsorted card shows unless I'm filtering by a topic name. */
const showUnsortedCard = computed(() => unsorted.value || topicSearch.value.trim() === "");

/** Whether I have any points at all, so the empty list can tell "none yet" apart from "none match". */
const hasPoints = computed(() => (home.value?.myPoints.length ?? 0) > 0);

/**
 * Whether a search box I can see has text, so the clear button only shows when it would do something. The point
 * box is hidden in the Topics view, so it doesn't count there. Unsorted isn't counted: clicking it again turns it off.
 */
const filtering = computed(
  () => (view.value === "points" && pointSearch.value.trim() !== "") || topicSearch.value.trim() !== "",
);

/** Empties the search boxes I can see. */
function clearFilters() {
  if (view.value === "points") pointSearch.value = "";
  topicSearch.value = "";
}

/** Opening a topic card goes back to my points, filtered to that topic, or to points with no topic for the Unsorted card. */
function openTopic(topic: MyTopic | null) {
  unsorted.value = topic === null;
  topicSearch.value = topic?.name ?? "";
  view.value = "points";
}
</script>

<template>
  <main class="home">
    <div class="tools">
      <p v-if="error" class="error content-width">{{ error }}</p>
      <p v-else-if="!home" class="content-width">Loading…</p>
      <FilterRow v-if="home">
        <!-- Searching points does nothing in the Topics view, so the box is only there in the points view. -->
        <PointSearch v-if="view === 'points'" v-model="pointSearch" :topic="exactTopic" />
        <TopicSearch v-model="topicSearch" v-model:unsorted="unsorted" :topic="exactTopic" />
        <button type="button" class="button" :class="view === 'topics' ? 'primary' : 'outline'"
                :aria-pressed="view === 'topics'" @click="view = view === 'topics' ? 'points' : 'topics'">Topics</button>
        <button type="button" class="button outline" disabled>Review scheduling</button>
        <button type="button" class="button outline" :class="{ unused: !filtering }" @click="clearFilters">
          <Icon name="trash" />Clear filters
        </button>
      </FilterRow>
    </div>

    <template v-if="home">
      <!-- Separates the tools above from the content below, where a selection rectangle can start. -->
      <hr class="zone-divider" />

      <TopicsContainer v-if="view === 'topics'" :topics="shownTopics" :show-unsorted="showUnsortedCard" @open="openTopic" />
      <PointsContainer v-else :points="shown" :has-points="hasPoints" />
    </template>
  </main>
</template>

<style scoped>
/* The full width of the window and as tall as the top bar leaves, so the content area below the divider can fill it. */
.home {
  display: flex;
  flex: 1;
  flex-direction: column;
}
/* The tools zone above the divider keeps the page's colour; its contents keep the content width. */
.tools {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-6) var(--space-5);
}
.zone-divider {
  border: 0;
  border-top: 1px solid var(--color-border);
}
@media (max-width: 600px) {
  .tools {
    padding-inline: var(--space-4);
  }
}
/* Clear filters keeps its space while there's nothing to clear, so it appearing never moves the other controls. Hidden this way, it also leaves the tab order. */
.unused {
  visibility: hidden;
}
</style>
