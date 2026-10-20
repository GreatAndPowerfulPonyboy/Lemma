<script setup lang="ts">
import { onMounted, ref } from "vue";
import { api } from "../api/client.ts";
import Dialog from "../reusable/ui/Dialog.vue";
import Menu from "../reusable/ui/Menu.vue";
import ShareDialog from "./ShareDialog.vue";
import { useHome, type CheckShown, type MyCheck } from "./useLemma.ts";

const { home, working, call, change, error, recentCheck, startOrResume } = useHome();

/** Whether a prompt is on my schedule, so its menu offers Track or Untrack. */
const isTracked = (check: Check) => (home.value?.scheduledChecks ?? []).some((s) => s.check === check);

function track(prompt: MyCheck) {
  const request = { check: prompt.check };
  if (isTracked(prompt.check)) change("/check/untrack", api.check.untrack(request));
  else change("/check/track", api.check.track(request));
}

type Check = MyCheck["check"];

/** The rows I've opened, and what /check/show said about each. Several can be open at once. */
const expanded = ref(new Set<Check>());
const details = ref(new Map<Check, CheckShown>());
/** The rows where I chose "Show all" attempts instead of the latest few. */
const showingAll = ref(new Set<Check>());

/** How many of a prompt's latest attempts show before "Show all". */
const latestCount = 5;

/** Loads a row's points and attempts. A refusal is shown in the banner. */
async function load(check: Check) {
  const result = await call("/check/show", api.check.show({ check }));
  if ("error" in result) error.value = result.error;
  else details.value = new Map(details.value).set(check, result);
}

function toggle(check: Check) {
  const next = new Set(expanded.value);
  if (next.delete(check)) expanded.value = next;
  else {
    expanded.value = next.add(check);
    load(check);
  }
}

/** Coming back from an attempt opens that prompt's row, freshly loaded, so its newest result shows first. */
onMounted(() => {
  if (recentCheck.value === null) return;
  expanded.value = new Set([recentCheck.value]);
  load(recentCheck.value);
  recentCheck.value = null;
});

/** True for clicks on a row's own controls, which do their own thing. */
function onControl(event: Event) {
  return event.target instanceof Element && event.target.closest("button, input, .menu, dialog") !== null;
}

/** Clicking a row's background opens or closes it. The name button does the same for the keyboard. */
function clickRow(event: MouseEvent, check: Check) {
  if (!onControl(event)) toggle(check);
}

/** The attempts a row lists: finished ones only, since abandoned and unfinished attempts have no result. */
function results(check: Check) {
  const closed = (details.value.get(check)?.attempts ?? []).filter((a) => a.status === "CLOSED");
  return showingAll.value.has(check) ? closed : closed.slice(0, latestCount);
}
const closedCount = (check: Check) => (details.value.get(check)?.attempts ?? []).filter((a) => a.status === "CLOSED").length;
const percent = (credit: number) => `${Math.round(credit * 100)}%`;

function showAll(check: Check) {
  showingAll.value = new Set(showingAll.value).add(check);
}

/** Focuses an input as soon as it appears, so I can type straight away. */
const vFocus = { mounted: (el: HTMLElement) => el.focus() };

/** The prompt I'm renaming, if any, and the name I'm typing for it. */
const renaming = ref<Check | null>(null);
const newName = ref("");

function startRename(prompt: MyCheck) {
  newName.value = prompt.name;
  renaming.value = prompt.check;
}
async function saveRename(prompt: MyCheck) {
  const result = await change("/check/rename", api.check.rename({ check: prompt.check, name: newName.value }));
  if (!("error" in result)) renaming.value = null;
}

/** The prompt the dialog asks me to confirm deleting, since its attempts go with it. */
const deleting = ref<MyCheck | null>(null);

/** The prompt the Share dialog is open for, if any. */
const sharing = ref<MyCheck | null>(null);

async function confirmDelete() {
  const prompt = deleting.value;
  if (!prompt) return;
  const result = await change("/check/delete", api.check.delete({ check: prompt.check }));
  if (!("error" in result)) {
    const next = new Set(expanded.value);
    next.delete(prompt.check);
    expanded.value = next;
  }
  deleting.value = null;
}
</script>

<template>
  <section class="content-area">
    <ul v-if="home?.myChecks.length" class="prompts content-width">
      <li v-for="prompt in home.myChecks" :key="prompt.check">
        <div class="Prompt card" :class="{ open: expanded.has(prompt.check) }" @click="clickRow($event, prompt.check)">
          <div class="row">
            <input v-if="renaming === prompt.check" v-model="newName" v-focus aria-label="New prompt name" maxlength="200"
                   @keydown.enter="saveRename(prompt)" @keydown.escape="renaming = null" />
            <button v-else type="button" class="name" :aria-expanded="expanded.has(prompt.check)"
                    :aria-controls="`prompt-${prompt.check}`" @click="toggle(prompt.check)">
              {{ prompt.name }}
            </button>
            <!-- An empty prompt can be neither started nor resumed until it has points again. -->
            <button type="button" class="button primary" :disabled="working || !prompt.pointCount"
                    :title="!prompt.pointCount ? 'This prompt has no points, so there is nothing to recall yet.' : undefined"
                    @click="startOrResume(prompt)">
              {{ prompt.current.attempt === null ? "Start" : "Resume" }}
            </button>
            <Menu label="Edit prompt">
              <button type="button" @click="startRename(prompt)">Rename</button>
              <button type="button" @click="sharing = prompt">Share…</button>
              <button type="button" @click="track(prompt)">{{ isTracked(prompt.check) ? "Untrack" : "Track" }}</button>
              <button type="button" @click="deleting = prompt">Delete</button>
            </Menu>
          </div>
          <p v-if="!prompt.pointCount" class="muted">No points. Add some from the Points tab.</p>
          <div v-if="expanded.has(prompt.check)" :id="`prompt-${prompt.check}`" class="details">
            <p v-if="!details.has(prompt.check)" class="muted">Loading…</p>
            <template v-else>
              <div>
                <h3>Points</h3>
                <ul class="points">
                  <li v-for="point in details.get(prompt.check)!.subject" :key="point.cue">{{ point.pointName }}</li>
                </ul>
              </div>
              <div>
                <h3>Attempts</h3>
                <ul v-if="closedCount(prompt.check)" class="attempts">
                  <li v-for="result in results(prompt.check)" :key="result.attempt">{{ percent(result.credit) }}</li>
                </ul>
                <p v-else class="muted">No finished attempts yet.</p>
                <button v-if="!showingAll.has(prompt.check) && closedCount(prompt.check) > latestCount" type="button"
                        class="text-button" @click="showAll(prompt.check)">Show all</button>
              </div>
            </template>
          </div>
        </div>
      </li>
    </ul>
    <h4 v-else class="content-width">No prompts yet. Select points and choose Recall selected.</h4>

    <ShareDialog v-if="sharing" :prompt="sharing" @close="sharing = null" />
    <Dialog v-if="deleting" title="Delete this prompt?" :subtitle="deleting.name" @close="deleting = null">
      <p>Its attempts will be deleted too. Its points stay.</p>
      <div class="dialog-buttons">
        <button type="button" class="button outline" @click="deleting = null">Cancel</button>
        <button type="button" class="button danger" :disabled="working" @click="confirmDelete">Delete</button>
      </div>
    </Dialog>
  </section>
</template>

<style scoped>
/* Nothing on this tab can be selected yet, so the background keeps the normal cursor instead of the crosshair. */
.content-area {
  cursor: auto;
}
/* One prompt per row, so opening one never leaves gaps the way a card grid would. */
.prompts {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: 0;
  list-style: none;
}
.Prompt {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 2px solid transparent;
  cursor: pointer;
}
.Prompt:hover {
  border-color: var(--color-border);
}
.row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.name {
  flex: 1;
  min-width: 0;
  padding: 0;
  border: 0;
  background: none;
  font-weight: 600;
  text-align: left;
  overflow-wrap: anywhere;
}
.name:hover {
  color: var(--color-accent);
}
.row input {
  flex: 1;
  min-width: 0;
  min-height: 40px;
  padding: 0 14px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}
.row input:focus {
  outline: none;
  border-color: var(--color-accent);
}
.details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(240px, 100%), 1fr));
  gap: var(--space-4);
  cursor: auto;
}
h3 {
  margin-bottom: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
/* A long list of points scrolls inside the row instead of pushing the other prompts off the screen. */
.points {
  max-height: 240px;
  overflow-y: auto;
  padding-left: var(--space-5);
}
.attempts {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding: 0;
  list-style: none;
}
.attempts li {
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
  background: var(--color-accent-soft);
  color: var(--color-accent-strong);
  font-size: var(--text-sm);
  font-weight: 600;
}
.muted {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
</style>
