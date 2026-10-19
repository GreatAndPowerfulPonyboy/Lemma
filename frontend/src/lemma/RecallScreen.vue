<script setup lang="ts">
import { onMounted, ref } from "vue";
import { api } from "../api/client.ts";
import { mentions } from "./matching.ts";
import { useHome, type AttemptShown } from "./useLemma.ts";

/** `submitted` hands what I typed to the results screen, through App. It never goes to the server. */
const emit = defineEmits<{ submitted: [account: string] }>();

const { attempt, call, error, working, submitAttempt, abandonAttempt } = useHome();

/** The attempt's prompt and points. The points stay hidden here; they're only used to guess which ones I mentioned. */
const shown = ref<AttemptShown | null>(null);
/** What I type from memory. It lives only here. */
const account = ref("");

onMounted(async () => {
  if (attempt.value === null) return;
  const result = await call("/attempt/show", api.attempt.show({ attempt: attempt.value }));
  if ("error" in result) error.value = result.error;
  else shown.value = result;
});

/** Submits, marking each point my account seems to mention; I correct the guesses on the results screen. */
async function submit() {
  if (!shown.value) return;
  const said = account.value;
  const cues = shown.value.subject.filter((point) => mentions(said, point.pointName)).map((point) => point.cue);
  emit("submitted", said);
  await submitAttempt(cues);
}
</script>

<template>
  <main class="screen content-width">
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="!shown && !error">Loading…</p>
    <template v-if="shown">
      <h1>{{ shown.checkName }}</h1>
      <p class="muted">Explain it from memory. Your points stay hidden until you submit.</p>
      <textarea v-model="account" aria-label="Your explanation" placeholder="Start typing…" autofocus></textarea>
      <div class="buttons">
        <button type="button" class="button outline" :disabled="working" @click="abandonAttempt">Abandon</button>
        <button type="button" class="button primary" :disabled="working" @click="submit">Submit</button>
      </div>
    </template>
  </main>
</template>

<style scoped>
.screen {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-6) var(--space-12);
}
h1 {
  font-size: var(--text-2xl);
  overflow-wrap: anywhere;
}
.muted {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
textarea {
  min-height: 50vh;
  padding: var(--space-4);
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
.buttons {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}
@media (max-width: 600px) {
  .screen {
    padding-inline: var(--space-4);
  }
}
</style>
