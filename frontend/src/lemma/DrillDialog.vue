<script setup lang="ts">
import { ref } from "vue";
import Dialog from "../reusable/ui/Dialog.vue";

/** Practises one card on its own: the point first, then its answer once I've tried to produce it. */
const { pointName, answer } = defineProps<{ pointName: string; answer: string }>();
const emit = defineEmits<{ close: [] }>();

const revealed = ref(false);
</script>

<template>
  <Dialog title="Drill this card" @close="emit('close')">
    <p class="point">{{ pointName }}</p>
    <p v-if="revealed" class="answer">{{ answer }}</p>
    <p v-else class="note">Say or write the answer from memory, then check it.</p>
    <div class="dialog-buttons">
      <button v-if="!revealed" type="button" class="button primary" autofocus @click="revealed = true">Show answer</button>
      <button v-else type="button" class="button primary" autofocus @click="emit('close')">Done</button>
    </div>
  </Dialog>
</template>

<style scoped>
.point {
  font-size: var(--text-lg);
  font-weight: 600;
  overflow-wrap: anywhere;
}
.answer {
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--color-page);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.note {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
</style>
