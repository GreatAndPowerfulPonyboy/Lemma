<script setup lang="ts">
import { ref } from "vue";
import Dialog from "../reusable/ui/Dialog.vue";
import { useHome, type MyPoint } from "./useLemma.ts";

/** Asks for the prompt to recall `cues` under, prefilled with `name`, then opens it and starts an attempt. */
const { cues, name = "" } = defineProps<{ cues: MyPoint["cue"][]; name?: string }>();
const emit = defineEmits<{ close: [] }>();

const { working, startPrompt } = useHome();
const prompt = ref(name);

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

async function start() {
  if (prompt.value.trim() === "" || working.value) return;
  // On success the recall screen replaces the home screen, which closes this dialog with it.
  if (!(await startPrompt(prompt.value, cues))) emit("close");
}
</script>

<template>
  <Dialog title="What will you explain?" :subtitle="`Recall ${plural(cues.length, 'point')} from memory`" @close="emit('close')">
    <input v-model="prompt" class="prompt" maxlength="200" placeholder="Explain …" aria-label="Prompt" autofocus
           @keydown.enter="start" />
    <div class="dialog-buttons">
      <button type="button" class="button outline" @click="emit('close')">Cancel</button>
      <button type="button" class="button primary" :disabled="working || prompt.trim() === ''" @click="start">Start</button>
    </div>
  </Dialog>
</template>

<style scoped>
.prompt {
  min-height: 44px;
  padding: 0 14px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}
.prompt:focus {
  outline: none;
  border-color: var(--color-accent);
}
</style>
