<script setup lang="ts">
import { ref } from "vue";
import { api } from "../api/client.ts";
import Dialog from "../reusable/ui/Dialog.vue";
import { useHome, type MyPoint } from "./useLemma.ts";

/**
 * Writes an answer for a point, which makes it a card, or edits the answer it has. `answer` is the point's current
 * answer, or null when it has none yet.
 */
const { cue, pointName, answer } = defineProps<{ cue: MyPoint["cue"]; pointName: string; answer: string | null }>();
const emit = defineEmits<{ close: [] }>();

const { change, working } = useHome();
const text = ref(answer ?? "");

async function save() {
  if (text.value.trim() === "" || working.value) return;
  const result = answer === null
    ? await change("/card/write", api.card.write({ cue, answer: text.value }))
    : await change("/card/revise", api.card.revise({ cue, answer: text.value }));
  if (!("error" in result)) emit("close");
}
</script>

<template>
  <Dialog :title="answer === null ? 'Write an answer' : 'Edit the answer'" :subtitle="pointName" @close="emit('close')">
    <p class="note">Write what a good answer covers. You'll grade later attempts against it.</p>
    <textarea v-model="text" aria-label="Answer" maxlength="5000" autofocus></textarea>
    <div class="dialog-buttons">
      <button type="button" class="button outline" @click="emit('close')">Cancel</button>
      <button type="button" class="button primary" :disabled="working || text.trim() === ''" @click="save">Save</button>
    </div>
  </Dialog>
</template>

<style scoped>
.note {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
textarea {
  min-height: 160px;
  padding: var(--space-3);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font: inherit;
  color: inherit;
  resize: vertical;
}
textarea:focus {
  outline: none;
  border-color: var(--color-accent);
}
</style>
