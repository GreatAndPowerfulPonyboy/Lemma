<script setup lang="ts">
import { computed, ref } from "vue";
import type { MyTopic } from "./useLemma.ts";

/**
 * Chooses a topic to move points to: a "Find a topic" box above a short list that scrolls, filtered as I type.
 * Enter picks the first match. Meant to sit inside a Menu: picking a topic closes it, typing in the box doesn't.
 */
const { topics } = defineProps<{ topics: MyTopic[] }>();
const emit = defineEmits<{ pick: [topic: MyTopic] }>();

const search = ref("");
const list = ref<HTMLElement | null>(null);

const matches = computed(() => topics.filter((t) => t.name.toLowerCase().includes(search.value.trim().toLowerCase())));

/** Enter does what clicking the first match does, so the menu closes the same way. */
function pickFirst() {
  list.value?.querySelector("button")?.click();
}
</script>

<template>
  <div class="picker">
    <!-- A click in the box mustn't reach the Menu, which closes on any click inside it. -->
    <input v-model="search" placeholder="Find a topic" aria-label="Find a topic" maxlength="80"
           @click.stop @keydown.enter.prevent="pickFirst" />
    <div ref="list" class="list">
      <button v-for="topic in matches" :key="topic.category" type="button" @click="emit('pick', topic)">
        {{ topic.name }}
      </button>
      <p v-if="!topics.length" class="none">No other topics yet</p>
      <p v-else-if="!matches.length" class="none">No topic matches</p>
    </div>
  </div>
</template>

<style scoped>
.picker {
  flex: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
input {
  min-width: 0;
  min-height: 36px;
  margin: 0 4px;
  padding: 0 10px;
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
}
input:focus {
  outline: none;
  border-color: var(--color-accent);
}
/* About six topics tall; the rest scroll. */
.list {
  display: flex;
  flex-direction: column;
  max-height: calc(6 * 40px);
  overflow-y: auto;
}
.list button {
  flex: none;
  padding: 9px 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  text-align: left;
  overflow-wrap: anywhere;
}
.list button:hover,
.list button:focus-visible {
  background: var(--color-page);
}
.none {
  padding: 8px 10px;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
</style>
