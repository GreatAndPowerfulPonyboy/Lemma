<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import Icon from "../reusable/ui/Icon.vue";
import FilterRow from "./FilterRow.vue";
import HomeTabs from "./HomeTabs.vue";
import PointsContainer from "./PointsContainer.vue";
import PointSearch from "./PointSearch.vue";
import PromptsContainer from "./PromptsContainer.vue";
import ScheduleContainer from "./ScheduleContainer.vue";
import SuggestedContainer from "./SuggestedContainer.vue";
import SharedContainer from "./SharedContainer.vue";
import TopicsContainer from "./TopicsContainer.vue";
import TopicSearch from "./TopicSearch.vue";
import { useHome, type MyTopic, type Tab } from "./useLemma.ts";

const { home, error, notice, refresh, tab } = useHome();
onMounted(refresh);

const pointSearch = ref("");
const topicSearch = ref("");

/** True when I'm looking only at points with no topic. */
const unsorted = ref(false);

/** The tabs, in order. Each later feature that needs a tab adds one here. Scheduling counts the prompts due now. */
const tabs = computed<{ id: Tab; label: string }[]>(() => {
  const dueCount = home.value?.dueChecks.length ?? 0;
  return [
    { id: "points", label: "Points" },
    { id: "topics", label: "Topics" },
    { id: "prompts", label: "Prompts" },
    { id: "shared", label: "Shared" },
    { id: "scheduling", label: dueCount ? `Scheduling · ${dueCount}` : "Scheduling" },
    { id: "suggested", label: "Suggested cards" },
  ];
});

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
 * Whether a search box on the Points tab has text, so the clear button only shows when it would do something.
 * Unsorted isn't counted: clicking it again turns it off.
 */
const filtering = computed(() => pointSearch.value.trim() !== "" || topicSearch.value.trim() !== "");

/** Empties the Points tab's search boxes. */
function clearFilters() {
  pointSearch.value = "";
  topicSearch.value = "";
}

/** Opening a topic card goes back to my points, filtered to that topic, or to points with no topic for the Unsorted card. */
function openTopic(topic: MyTopic | null) {
  unsorted.value = topic === null;
  topicSearch.value = topic?.name ?? "";
  tab.value = "points";
}
</script>

<template>
  <main class="home">
    <div class="tools">
      <p v-if="error" class="error content-width">{{ error }}</p>
      <p v-else-if="!home" class="content-width">Loading…</p>
      <HomeTabs v-if="home" v-model="tab" :tabs="tabs" />
      <p v-if="home && notice" class="notice content-width" role="status">{{ notice }}</p>
      <!-- Each tab shows only the filters that apply to it; only Points and Topics have any yet. -->
      <FilterRow v-if="home && (tab === 'points' || tab === 'topics')">
        <PointSearch v-if="tab === 'points'" v-model="pointSearch" :topic="exactTopic" />
        <TopicSearch v-model="topicSearch" v-model:unsorted="unsorted" :topic="exactTopic" />
        <button v-if="tab === 'points'" type="button" class="button outline" :class="{ unused: !filtering }" @click="clearFilters">
          <Icon name="trash" />Clear filters
        </button>
      </FilterRow>
    </div>

    <template v-if="home">
      <!-- Separates the tools above from the content below, where a selection rectangle can start. -->
      <hr class="zone-divider" />

      <!-- Switching tabs unmounts the last one, so its selection is cleared and its bar never acts on hidden items. -->
      <div :id="`panel-${tab}`" class="panel" role="tabpanel" :aria-labelledby="`tab-${tab}`">
        <TopicsContainer v-if="tab === 'topics'" :topics="shownTopics" :show-unsorted="showUnsortedCard" @open="openTopic" />
        <PromptsContainer v-else-if="tab === 'prompts'" />
        <SharedContainer v-else-if="tab === 'shared'" />
        <ScheduleContainer v-else-if="tab === 'scheduling'" />
        <SuggestedContainer v-else-if="tab === 'suggested'" />
        <PointsContainer v-else :points="shown" :has-points="hasPoints" />
      </div>
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
/* The tools zone above the divider; its contents keep the content width. */
.tools {
  background: var(--color-header);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-6) var(--space-5);
}
/* The tab's content fills the rest of the window, as the content area did before there were tabs. */
.panel {
  display: flex;
  flex: 1;
  flex-direction: column;
}
/* What my last action did, such as discarding a prompt. */
.notice {
  font-size: var(--text-sm);
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
