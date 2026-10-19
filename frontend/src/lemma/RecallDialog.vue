<script setup lang="ts">
import { computed, ref } from "vue";
import Dialog from "../reusable/ui/Dialog.vue";
import { useHome, type MyPoint } from "./useLemma.ts";

/**
 * Asks for the prompt to recall `points` under, prefilled with `name`, then opens it and starts an attempt. With
 * `choose`, it lists the points with a checkbox each, all ticked, so I can leave some out first.
 */
const { points, name = "", choose = false } = defineProps<{ points: MyPoint[]; name?: string; choose?: boolean }>();
const emit = defineEmits<{ close: [] }>();

const { working, startPrompt } = useHome();
const prompt = ref(name);

const ticked = ref(new Set(points.map((p) => p.cue)));
const cues = computed(() => points.filter((p) => ticked.value.has(p.cue)).map((p) => p.cue));

function tick(cue: MyPoint["cue"]) {
  const next = new Set(ticked.value);
  if (!next.delete(cue)) next.add(cue);
  ticked.value = next;
}

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

async function start() {
  if (prompt.value.trim() === "" || !cues.value.length || working.value) return;
  // On success the recall screen replaces the home screen, which closes this dialog with it.
  if (!(await startPrompt(prompt.value, cues.value))) emit("close");
}
</script>

<template>
  <Dialog title="What will you explain?" :subtitle="`Recall ${plural(cues.length, 'point')} from memory`" @close="emit('close')">
    <input v-model="prompt" class="prompt" maxlength="200" placeholder="Explain …" aria-label="Prompt" autofocus
           @keydown.enter="start" />
    <ul v-if="choose" class="choices">
      <li v-for="point in points" :key="point.cue">
        <label><input type="checkbox" :checked="ticked.has(point.cue)" @change="tick(point.cue)" />{{ point.pointName }}</label>
      </li>
    </ul>
    <div class="dialog-buttons">
      <button type="button" class="button outline" @click="emit('close')">Cancel</button>
      <button type="button" class="button primary" :disabled="working || prompt.trim() === '' || !cues.length" @click="start">Start</button>
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
/* A long topic's points scroll inside the dialog. */
.choices {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  max-height: 240px;
  overflow-y: auto;
  padding: 0;
  list-style: none;
}
.choices label {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  overflow-wrap: anywhere;
}
.choices input {
  margin-top: 4px;
}
.prompt:focus {
  outline: none;
  border-color: var(--color-accent);
}
</style>
