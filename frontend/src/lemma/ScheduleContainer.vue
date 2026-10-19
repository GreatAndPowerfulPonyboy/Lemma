<script setup lang="ts">
import { computed } from "vue";
import { useHome, type ScheduledCheck } from "./useLemma.ts";

const { home, working, startOrResume } = useHome();

/** The prompts due now, earliest first, each with whether it has an attempt to resume. */
const due = computed(() => home.value?.dueChecks ?? []);
/** The rest of my tracked prompts, earliest first. A prompt that's due shows only under "Due now". */
const upcoming = computed(() => {
  const dueNow = new Set(due.value.map((d) => d.check));
  return (home.value?.scheduledChecks ?? []).filter((s) => !dueNow.has(s.check));
});

/** Starts or resumes a due prompt, using what the Prompts tab knows about its unfinished attempt. */
function start(prompt: ScheduledCheck) {
  const mine = home.value?.myChecks.find((c) => c.check === prompt.check);
  if (mine) startOrResume(mine);
}
const resumable = (prompt: ScheduledCheck) =>
  home.value?.myChecks.find((c) => c.check === prompt.check)?.current.attempt != null;

const date = (due: string) => new Date(due).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
</script>

<template>
  <section class="content-area">
    <div v-if="due.length || upcoming.length" class="schedule content-width">
      <div v-if="due.length">
        <h3>Due now</h3>
        <ul class="rows">
          <li v-for="prompt in due" :key="prompt.check" class="card row">
            <span class="name">{{ prompt.name }}<span class="when">due {{ date(prompt.due) }}</span></span>
            <button type="button" class="button primary" :disabled="working" @click="start(prompt)">
              {{ resumable(prompt) ? "Resume" : "Start" }}
            </button>
          </li>
        </ul>
      </div>
      <div v-if="upcoming.length">
        <h3>Coming up</h3>
        <ul class="rows">
          <li v-for="prompt in upcoming" :key="prompt.check" class="card row">
            <span class="name">{{ prompt.name }}<span class="when">due {{ date(prompt.due) }}</span></span>
          </li>
        </ul>
      </div>
    </div>
    <h4 v-else class="content-width">Nothing scheduled yet. Choose Track in a prompt's menu on the Prompts tab.</h4>
  </section>
</template>

<style scoped>
/* Nothing on this tab can be selected, so the background keeps the normal cursor instead of the crosshair. */
.content-area {
  cursor: auto;
}
.schedule {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}
h3 {
  margin-bottom: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
/* One prompt per row, like the Prompts tab. */
.rows {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: 0;
  list-style: none;
}
.row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-height: 56px;
  padding: var(--space-3) var(--space-4);
}
.name {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  font-weight: 600;
  overflow-wrap: anywhere;
}
.when {
  font-size: var(--text-xs);
  font-weight: 400;
  color: var(--color-text-muted);
}
</style>
