<script setup lang="ts">
/**
 * What a tab (or part of one) shows when it has nothing to list: a dashed panel on the zone with a short heading,
 * one line of help, and optionally a button, whose click is the `action` event.
 */
defineProps<{ heading: string; help: string; action?: string }>();
const emit = defineEmits<{ action: [] }>();
</script>

<template>
  <div class="empty-state content-width">
    <h3>{{ heading }}</h3>
    <p>{{ help }}</p>
    <button v-if="action" type="button" class="button outline" @click="emit('action')">{{ action }}</button>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  max-width: 480px;
  padding: var(--space-8) var(--space-6);
  border: 1px dashed var(--color-on-zone-muted);
  border-radius: var(--radius-lg);
  background: var(--color-zone-panel);
  text-align: center;
  cursor: auto;
}
h3 {
  font-size: var(--text-lg);
  color: var(--color-on-zone);
}
p {
  color: var(--color-on-zone-muted);
}
.button {
  margin-top: var(--space-2);
}
</style>
