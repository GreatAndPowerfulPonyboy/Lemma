<script setup lang="ts">
import { onMounted, ref } from "vue";
import { api } from "../api/client.ts";
import { useHome, type SharedPrompt, type SharedShown } from "./useLemma.ts";

const { call, error, working, copyShared } = useHome();

type Check = SharedPrompt["check"];

/** The prompts others have shared with me, loaded when the tab opens. */
const shared = ref<SharedPrompt[] | null>(null);

async function loadShared() {
  const result = await call("/shared", api.shared());
  if ("error" in result) error.value = result.error;
  else shared.value = result.shared;
}
onMounted(loadShared);

/** The rows I've opened, and what /shared/show said about each, as on the Prompts tab. */
const expanded = ref(new Set<Check>());
const details = ref(new Map<Check, SharedShown>());

async function load(check: Check) {
  const result = await call("/shared/show", api.shared.show({ check }));
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

/** True for clicks on a row's own controls, which do their own thing. */
function onControl(event: Event) {
  return event.target instanceof Element && event.target.closest("button") !== null;
}

/** Clicking a row's background opens or closes it. The name button does the same for the keyboard. */
function clickRow(event: MouseEvent, check: Check) {
  if (!onControl(event)) toggle(check);
}

/** The prompts I've copied since opening the tab, so each says where its copy went. */
const copied = ref(new Set<Check>());

async function copy(check: Check) {
  if (await copyShared(check)) copied.value = new Set(copied.value).add(check);
  // A refusal may mean it was unshared or deleted in the meantime, so the list is reloaded to show that.
  else await loadShared();
}
</script>

<template>
  <section class="content-area">
    <p v-if="!shared" class="content-width">Loading…</p>
    <ul v-else-if="shared.length" class="prompts content-width">
      <li v-for="prompt in shared" :key="prompt.check">
        <div class="Prompt card" @click="clickRow($event, prompt.check)">
          <div class="row">
            <button type="button" class="name" :aria-expanded="expanded.has(prompt.check)"
                    :aria-controls="`shared-${prompt.check}`" @click="toggle(prompt.check)">
              {{ prompt.name }}
              <span class="from">from {{ prompt.ownerUsername }}</span>
            </button>
            <button type="button" class="button primary" :disabled="working" @click="copy(prompt.check)">Copy to my prompts</button>
          </div>
          <p v-if="copied.has(prompt.check)" class="copied">Copied. It's in your Prompts, and its points are in Unsorted.</p>
          <div v-if="expanded.has(prompt.check)" :id="`shared-${prompt.check}`" class="details">
            <p v-if="!details.has(prompt.check)" class="muted">Loading…</p>
            <div v-else>
              <h3>Points</h3>
              <ul class="points">
                <li v-for="(point, index) in details.get(prompt.check)!.points" :key="index">{{ point.pointName }}</li>
              </ul>
            </div>
          </div>
        </div>
      </li>
    </ul>
    <h4 v-else class="content-width">Nothing shared with you yet.</h4>
  </section>
</template>

<style scoped>
/* Nothing on this tab can be selected, so the background keeps the normal cursor instead of the crosshair. */
.content-area {
  cursor: auto;
}
/* One prompt per row, like the Prompts tab. */
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
  display: flex;
  flex: 1;
  flex-direction: column;
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
.from {
  font-size: var(--text-xs);
  font-weight: 400;
  color: var(--color-text-muted);
}
.copied {
  font-size: var(--text-sm);
  color: var(--color-accent-strong);
}
.details {
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
.muted {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
</style>
