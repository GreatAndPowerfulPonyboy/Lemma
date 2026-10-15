<script setup lang="ts">
import { computed, ref } from "vue";
import type { LemmaWireHttp } from "../../../generated/wire.ts";
import { api } from "../api/client.ts";
import { mentions } from "./matching.ts";
import { type Topic, useHome } from "./useHome.ts";

type Result = LemmaWireHttp["/checks/show"]["output"]["result"][number];
type Check = LemmaWireHttp["/checks/open"]["output"]["check"];
type Cue = Topic["points"][number]["cue"];

const props = defineProps<{ topic: Topic }>();
const emit = defineEmits<{ done: [] }>();
const { call } = useHome();

/** commit: choose points; recall: give the account; results: correct and close. */
const step = ref<"commit" | "recall" | "results">("commit");
const name = ref(`${props.topic.name}, ${new Date().toLocaleDateString()}`);
/** The due points start ticked; if none is due, every point does. */
const duePoints = props.topic.points.filter((point) => point.due !== null && new Date(point.due).getTime() <= Date.now());
const chosen = ref<Set<Cue>>(new Set((duePoints.length > 0 ? duePoints : props.topic.points).map((point) => point.cue)));
const account = ref("");
const check = ref<Check | null>(null);
const result = ref<Result | null>(null);
const error = ref<string | null>(null);
const working = ref(false);

const chosenCount = computed(() => chosen.value.size);

function toggle(cue: Cue) {
  const next = new Set(chosen.value);
  if (next.has(cue)) next.delete(cue);
  else next.add(cue);
  chosen.value = next;
}

/** Runs one step against the server and shows the first refusal, if any. Returns false when a call was refused. */
async function run(action: () => Promise<boolean>) {
  working.value = true;
  error.value = null;
  const ok = await action().catch(() => {
    error.value = "Something went wrong. Try again.";
    return false;
  });
  working.value = false;
  return ok;
}

async function reload() {
  if (check.value === null) return false;
  const shown = await call("/checks/show", api.checks.show({ check: check.value }));
  if ("error" in shown) {
    error.value = shown.error;
    return false;
  }
  result.value = shown.result[0] ?? null;
  return true;
}

/** Opens the check and includes each chosen point, in the topic's order. */
async function start() {
  await run(async () => {
    const opened = await call("/checks/open", api.checks.open({ name: name.value }));
    if ("error" in opened) return (error.value = opened.error), false;
    check.value = opened.check;
    for (const point of props.topic.points) {
      if (!chosen.value.has(point.cue)) continue;
      const included = await call("/checks/include", api.checks.include({ check: opened.check, cue: point.cue }));
      if ("error" in included) return (error.value = included.error), false;
    }
    step.value = "recall";
    return true;
  });
}

/** Submits the check, which marks every point omitted, then marks the points the account seems to mention. */
async function submit() {
  await run(async () => {
    if (check.value === null) return false;
    const submitted = await call("/checks/submit", api.checks.submit({ check: check.value }));
    if ("error" in submitted) return (error.value = submitted.error), false;
    for (const point of props.topic.points) {
      if (!chosen.value.has(point.cue) || !mentions(account.value, point.name)) continue;
      const marked = await call("/checks/mention", api.checks.mention({ check: check.value, cue: point.cue }));
      if ("error" in marked) return (error.value = marked.error), false;
    }
    account.value = "";
    step.value = "results";
    return reload();
  });
}

async function correct(cue: Cue, to: "mentioned" | "omitted") {
  await run(async () => {
    if (check.value === null) return false;
    const request =
      to === "mentioned"
        ? call("/checks/mention", api.checks.mention({ check: check.value, cue }))
        : call("/checks/omit", api.checks.omit({ check: check.value, cue }));
    const corrected = await request;
    if ("error" in corrected) return (error.value = corrected.error), false;
    return reload();
  });
}

async function close() {
  await run(async () => {
    if (check.value === null) return false;
    const closed = await call("/checks/close", api.checks.close({ check: check.value }));
    if ("error" in closed) return (error.value = closed.error), false;
    emit("done");
    return true;
  });
}

/** Leaves without a result. A check that was opened is abandoned, so it doesn't linger half-finished. */
async function leave() {
  if (check.value !== null && step.value !== "results") {
    await run(async () => {
      await call("/checks/abandon", api.checks.abandon({ check: check.value as Check }));
      return true;
    });
  }
  emit("done");
}
</script>

<template>
  <section class="recall">
    <p v-if="error" class="banner" role="alert">{{ error }}</p>

    <template v-if="step === 'commit'">
      <h2>Recall: {{ topic.name }}</h2>
      <p class="hint">Tick the points you commit to explaining. They'll be hidden while you recall.</p>
      <label class="field">Session name <input v-model="name" /></label>
      <ul class="points">
        <li v-for="point in topic.points" :key="point.cue">
          <label><input type="checkbox" :checked="chosen.has(point.cue)" @change="toggle(point.cue)" /> {{ point.name }}</label>
        </li>
      </ul>
      <div class="actions">
        <button class="button primary" :disabled="working || chosenCount === 0 || name.trim() === ''" @click="start">
          Commit to {{ chosenCount }} point{{ chosenCount === 1 ? "" : "s" }}
        </button>
        <button class="button soft" :disabled="working" @click="leave">Back</button>
      </div>
    </template>

    <template v-else-if="step === 'recall'">
      <h2>{{ topic.name }}</h2>
      <p class="hint">Explain the topic from memory, as if to an examiner. Your points are hidden until you submit, and your account isn't saved.</p>
      <textarea v-model="account" rows="12" placeholder="Start explaining…" aria-label="Your account"></textarea>
      <div class="actions">
        <button class="button primary" :disabled="working || account.trim() === ''" @click="submit">Submit</button>
        <button class="button soft" :disabled="working" @click="leave">Abandon</button>
      </div>
    </template>

    <template v-else-if="result">
      <h2>{{ result.name }}</h2>
      <p class="hint">The matching is a guess. Move any point it got wrong, then close the session.</p>
      <div class="columns">
        <div>
          <h3>Covered ({{ result.mentioned.length }})</h3>
          <ul class="points">
            <li v-for="point in result.mentioned" :key="point.cue">
              <span>{{ point.name }}</span>
              <button class="button soft" :disabled="working" @click="correct(point.cue, 'omitted')">Not covered</button>
            </li>
          </ul>
        </div>
        <div>
          <h3>Not covered ({{ result.omitted.length }})</h3>
          <ul class="points">
            <li v-for="point in result.omitted" :key="point.cue">
              <span>{{ point.name }}</span>
              <button class="button soft" :disabled="working" @click="correct(point.cue, 'mentioned')">Covered</button>
            </li>
          </ul>
        </div>
      </div>
      <div class="actions">
        <button class="button primary" :disabled="working" @click="close">Close session</button>
      </div>
    </template>
  </section>
</template>

<style scoped>
.recall { max-width: 760px; margin: 0 auto; display: grid; gap: var(--space-4); }
.hint { color: var(--color-text-muted); }
.banner { padding: 10px 12px; border-radius: var(--radius-sm); background: #fdecec; color: #8a1c1c; }
.field { display: grid; gap: var(--space-1); }
.points { list-style: none; padding: 0; margin: 0; display: grid; gap: var(--space-2); }
.points li { display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); }
.actions { display: flex; gap: var(--space-2); }
.columns { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
textarea { width: 100%; font: inherit; padding: 10px; }
@media (max-width: 600px) { .columns { grid-template-columns: 1fr; } }
</style>
