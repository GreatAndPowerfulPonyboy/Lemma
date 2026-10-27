<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { api } from "../api/client.ts";
import Dialog from "../reusable/ui/Dialog.vue";
import { useHome, type AttemptShown, type CheckShown } from "./useLemma.ts";

/** What I typed on the recall screen, or null when I resumed an attempt, since it isn't saved anywhere. */
const { account } = defineProps<{ account: string | null }>();

const { attempt, call, change, error, working, hasResults, abandonAttempt, goHome } = useHome();

/** True while the dialog asks me to confirm discarding a prompt that has never been finished. */
const confirming = ref(false);

/** Abandons the attempt, first asking when that would discard the prompt too. */
async function abandon() {
  if (!shown.value) return;
  const kept = await hasResults(shown.value.check);
  if (kept === false) confirming.value = true;
  else if (kept) await discard();
}

/** A refusal usually means another tab finished the attempt, so reloading it shows where it stands now. */
async function discard() {
  confirming.value = false;
  if (!(await abandonAttempt())) await load();
}

const shown = ref<AttemptShown | null>(null);

/**
 * Loads the attempt's points, split into mentioned and missed. A closed attempt waits for its prompt's schedule
 * too, so the finished buttons appear together instead of "Add to Scheduling" arriving a moment later.
 */
async function load() {
  if (attempt.value === null) return;
  const result = await call("/attempt/show", api.attempt.show({ attempt: attempt.value }));
  // Its prompt may have been deleted in another tab; then only the sentence and "Back to home" are left.
  if ("error" in result) {
    error.value = result.error;
    shown.value = null;
    return;
  }
  if (result.status === "CLOSED") await loadSchedule(result.check);
  shown.value = result;
}
onMounted(load);

type Point = AttemptShown["subject"][number];

/** Moves a point to the other list, reloading the attempt afterwards. */
function mark(point: Point, as: "mentioned" | "missed") {
  if (attempt.value === null) return;
  // The banner is about my last action; reloading the attempt doesn't clear it the way reloading the homepage does.
  error.value = null;
  const request = { attempt: attempt.value, cue: point.cue };
  if (as === "mentioned") change("/attempt/mention", api.attempt.mention(request), load);
  else change("/attempt/omit", api.attempt.omit(request), load);
}

/** Closes the attempt, which fixes its result. */
function finish() {
  error.value = null;
  if (attempt.value !== null) change("/attempt/close", api.attempt.close({ attempt: attempt.value }), load);
}

/** Closed here or in another tab, or abandoned in another tab: either way it can't be corrected any more. */
const finished = computed(() => shown.value?.status === "CLOSED" || shown.value?.status === "ABANDONED");
const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

/** The prompt's schedule, loaded with a closed attempt, so an untracked prompt can offer to be tracked. */
const schedule = ref<CheckShown["schedule"] | null>(null);

async function loadSchedule(check: AttemptShown["check"]) {
  const result = await call("/check/show", api.check.show({ check }));
  if ("error" in result) error.value = result.error;
  else schedule.value = result.schedule;
}

function track() {
  const check = shown.value?.check;
  if (check) change("/check/track", api.check.track({ check }), () => loadSchedule(check));
}
</script>

<template>
  <main class="screen content-width">
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="!shown && !error">Loading…</p>
    <button v-if="!shown && error" type="button" class="button primary back" @click="goHome">Back to home</button>
    <template v-if="shown">
      <h1>{{ shown.checkName }}</h1>
      <div class="sides">
        <section>
          <h2>Your explanation</h2>
          <p v-if="account === null" class="muted">Your typed account isn't saved.</p>
          <p v-else class="account">{{ account }}</p>
        </section>
        <section>
          <h2>Mentioned</h2>
          <ul>
            <li v-for="point in shown.mentioned" :key="point.cue">
              <span class="point">{{ point.pointName }}<span v-if="point.answer !== null" class="answer">{{ point.answer }}</span></span>
              <button v-if="!finished" type="button" class="text-button" :disabled="working"
                      @click="mark(point, 'missed')">Missed it</button>
            </li>
            <li v-if="!shown.mentioned.length" class="muted">None yet.</li>
          </ul>
          <h2>Missed</h2>
          <ul>
            <li v-for="point in shown.omitted" :key="point.cue">
              <span class="point">{{ point.pointName }}<span v-if="point.answer !== null" class="answer">{{ point.answer }}</span></span>
              <button v-if="!finished" type="button" class="text-button" :disabled="working"
                      @click="mark(point, 'mentioned')">Mentioned it</button>
            </li>
            <li v-if="!shown.omitted.length" class="muted">None.</li>
          </ul>
        </section>
      </div>
      <div v-if="finished" class="buttons">
        <p v-if="shown.status === 'ABANDONED'" class="summary">This attempt was abandoned in another tab.</p>
        <p v-else class="summary">You recalled {{ shown.mentioned.length }} of {{ plural(shown.subject.length, "point") }}</p>
        <button v-if="schedule && !schedule.tracked" type="button" class="button outline" :disabled="working"
                @click="track">Add to Scheduling</button>
        <span v-else-if="schedule?.tracked" class="muted">In Scheduling</span>
        <button type="button" class="button primary" @click="goHome">Back to home</button>
      </div>
      <div v-else class="buttons">
        <button type="button" class="button outline" :disabled="working" @click="abandon">Abandon</button>
        <button type="button" class="button primary" :disabled="working" @click="finish">Finish</button>
      </div>
      <Dialog v-if="confirming" title="Discard this prompt?" :subtitle="shown.checkName" @close="confirming = false">
        <p>You haven't finished it yet, so it won't be saved.</p>
        <div class="dialog-buttons">
          <button type="button" class="button outline" @click="confirming = false">Cancel</button>
          <button type="button" class="button danger" :disabled="working" @click="discard">Discard</button>
        </div>
      </Dialog>
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
h2 {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
/* The account on one side and the points on the other, one above the other when the window is narrow. */
.sides {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
  gap: var(--space-6);
}
section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.account {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
ul {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-bottom: var(--space-3);
  padding: 0;
  list-style: none;
}
li {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--space-3);
  overflow-wrap: anywhere;
}
/* A card's answer sits under its point, to grade what I said against. */
.point {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.answer {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  white-space: pre-wrap;
}
.text-button {
  flex: none;
  font-size: var(--text-sm);
}
.muted {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
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
.summary {
  margin-right: auto;
  font-weight: 600;
}
@media (max-width: 600px) {
  .screen {
    padding-inline: var(--space-4);
  }
}
</style>
