<script setup lang="ts">
import { onMounted, ref } from "vue";
import { api } from "../api/client.ts";
import { mentions } from "./matching.ts";
import { useHome, type AttemptShown } from "./useLemma.ts";

/** `submitted` hands what I typed to the results screen, through App. It never goes to the server. */
const emit = defineEmits<{ submitted: [account: string] }>();

const { attempt, screen, call, error, working, submitAttempt, abandonAttempt, goHome } = useHome();

/** The attempt's prompt and points. The points stay hidden here; they're only used to guess which ones I mentioned. */
const shown = ref<AttemptShown | null>(null);
/** What I type from memory. It lives only here. */
const account = ref("");

/**
 * Loads the attempt. If it was submitted in another tab, its results open instead, with what I typed here; if it
 * was finished there, this screen says so and only offers to go back.
 */
async function load() {
  if (attempt.value === null) return;
  const result = await call("/attempt/show", api.attempt.show({ attempt: attempt.value }));
  // Its prompt may have been deleted in another tab; then only the sentence and "Back to home" are left.
  if ("error" in result) {
    error.value = result.error;
    shown.value = null;
  } else {
    // The attempt's status now explains any refusal, so the banner's sentence is no longer needed.
    error.value = null;
    shown.value = result;
    if (result.status === "GRADED") screen.value = "results";
  }
}
onMounted(load);

/** Submits, marking each point my account seems to mention; I correct the guesses on the results screen. */
async function submit() {
  if (!shown.value) return;
  const said = account.value;
  const cues = shown.value.subject.filter((point) => mentions(said, point.pointName)).map((point) => point.cue);
  emit("submitted", said);
  // A refusal usually means another tab changed the attempt, so reloading it shows where it stands now.
  if (!(await submitAttempt(cues))) await load();
}

async function abandon() {
  if (!(await abandonAttempt())) await load();
}
</script>

<template>
  <main class="screen recall content-width">
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="!shown && !error">Loading…</p>
    <button v-if="!shown && error" type="button" class="button primary back" @click="goHome">Back to home</button>
    <template v-if="shown">
      <h1>{{ shown.checkName }}</h1>
      <p class="muted">Explain it from memory. Your points stay hidden until you submit.</p>
      <textarea v-model="account" aria-label="Your explanation" placeholder="Start typing…" autofocus
                :readonly="shown.status !== 'OPEN'"></textarea>
      <div v-if="shown.status !== 'OPEN'" class="buttons">
        <p class="finished">This attempt was {{ shown.status === "ABANDONED" ? "abandoned" : "finished" }} in another tab.</p>
        <button type="button" class="button primary" @click="goHome">Back to home</button>
      </div>
      <div v-else class="buttons">
        <button type="button" class="button outline" :disabled="working" @click="abandon">Abandon</button>
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
/* Secondary text on the header colour: --color-text-muted is too faint there for WCAG AA. */
.muted {
  font-size: var(--text-sm);
  color: var(--color-tab);
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
  align-items: center;
  gap: var(--space-3);
}
.back {
  align-self: flex-start;
}
.finished {
  margin-right: auto;
  font-weight: 600;
}
@media (max-width: 600px) {
  .screen {
    padding-inline: var(--space-4);
  }
}
</style>
