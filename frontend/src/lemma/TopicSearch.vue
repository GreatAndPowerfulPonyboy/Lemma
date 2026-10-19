<script setup lang="ts">
import { computed } from "vue";
import { api } from "../api/client.ts";
import SuggestBox from "./SuggestBox.vue";
import { useHome, type MyTopic } from "./useLemma.ts";

/**
 * The text in the box and the Unsorted toggle, both owned by HomePage. Unsorted replaces the topic filter, so
 * turning it on empties the box and typing in the box turns it off. `topic` is the topic named exactly in the box, if any.
 */
const search = defineModel<string>({ required: true });
const unsorted = defineModel<boolean>("unsorted", { required: true });
const { topic } = defineProps<{ topic: MyTopic | undefined }>();

const { working, change } = useHome();

function toggleUnsorted() {
  unsorted.value = !unsorted.value;
  if (unsorted.value) search.value = "";
}

function typeTopic(text: string) {
  search.value = text;
  if (text !== "") unsorted.value = false;
}

const canAdd = computed(() => search.value.trim() !== "" && !topic);
const suggestion = computed(() => (canAdd.value ? `+ Add topic "${search.value.trim()}"` : null));

/** Creates the topic, then empties the box, so the new topic (which has no points yet) doesn't filter the list to nothing. */
async function add() {
  if (!canAdd.value) return;
  const result = await change("/topic/create", api.topic.create({ name: search.value.trim() }));
  if (!("error" in result)) search.value = "";
}
</script>

<template>
  <div class="search">
    <SuggestBox :model-value="search" placeholder="Filter by topic, or add one" :suggestion="suggestion"
                :disabled="working" @update:model-value="typeTopic" @choose="add" />
    <button type="button" class="button" :class="unsorted ? 'primary' : 'outline'" :aria-pressed="unsorted"
            @click="toggleUnsorted">Unsorted</button>
  </div>
</template>

<style scoped>
.search {
  display: flex;
  flex: 1 1 320px;
  min-width: 0;
  align-items: center;
  gap: var(--space-2);
}
</style>
