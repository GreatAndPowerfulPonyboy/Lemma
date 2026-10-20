<script setup lang="ts">
import { ref } from "vue";

/**
 * The home screen's tabs, from `tabs` in order. The chosen one is the v-model. Only the chosen tab is in the tab
 * order; the arrow keys (and Home and End) move the focus to another tab without choosing it, and Enter, Space or
 * a click chooses it. Each tab controls the panel whose id is `panel-<id>`.
 */
const { tabs } = defineProps<{ tabs: { id: string; label: string }[] }>();
const chosen = defineModel<string>({ required: true });

const buttons = ref<HTMLButtonElement[]>([]);

/** Moves the focus to the tab at `index`, wrapping around at either end. */
function focusTab(index: number) {
  const tab = tabs[(index + tabs.length) % tabs.length]!;
  buttons.value.find((button) => button.id === `tab-${tab.id}`)?.focus();
}

function key(event: KeyboardEvent, index: number) {
  const moves: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 };
  if (!(event.key in moves)) return;
  event.preventDefault();
  focusTab(moves[event.key]!);
}
</script>

<template>
  <div class="tabs content-width" role="tablist" aria-label="Home">
    <button v-for="(tab, index) in tabs" :id="`tab-${tab.id}`" :key="tab.id" ref="buttons" type="button" role="tab"
            :aria-selected="chosen === tab.id" :aria-controls="`panel-${tab.id}`" :tabindex="chosen === tab.id ? 0 : -1"
            @click="chosen = tab.id" @keydown="key($event, index)">
      {{ tab.label }}
    </button>
  </div>
</template>

<style scoped>
.tabs {
  display: flex;
  gap: var(--space-1);
  border-bottom: 1px solid var(--color-border);
}
/* A tab at rest fades to the active colour on hover. The selected tab is already that colour, with a bar under it in the zone's colour. */
[role="tab"] {
  margin-bottom: -1px;
  padding: var(--space-2) var(--space-4);
  border: 0;
  border-bottom: 2px solid transparent;
  background: none;
  color: var(--color-tab);
  font-weight: 600;
  transition: color 150ms;
}
[role="tab"]:hover,
[role="tab"][aria-selected="true"] {
  color: var(--color-tab-active);
}
[role="tab"][aria-selected="true"] {
  border-bottom-color: var(--color-zone);
}
</style>
