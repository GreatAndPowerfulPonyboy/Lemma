<script setup lang="ts">
import { ref } from "vue";
import AnswerDialog from "./AnswerDialog.vue";
import EmptyState from "./EmptyState.vue";
import { useHome, type SuggestedCard } from "./useLemma.ts";

/** The promotion queue: points I keep missing, which have earned an answer. Writing one makes the point a card. */
const { home } = useHome();

/** The suggested point I'm writing an answer for, if any. */
const writing = ref<SuggestedCard | null>(null);
</script>

<template>
  <section class="content-area">
    <template v-if="home?.suggestedCards.length">
      <p class="intro content-width">You've missed these points in at least three attempts. Write an answer to turn one into a card.</p>
      <ul class="rows content-width">
        <li v-for="point in home.suggestedCards" :key="point.cue" class="card row">
          <span class="name">{{ point.pointName }}<span class="misses">missed {{ point.misses }} times</span></span>
          <button type="button" class="button primary" @click="writing = point">Write answer</button>
        </li>
      </ul>
    </template>
    <EmptyState v-else heading="No suggestions yet" help="Points you miss in three attempts show up here." />
    <AnswerDialog v-if="writing" :cue="writing.cue" :point-name="writing.pointName" :answer="null" @close="writing = null" />
  </section>
</template>

<style scoped>
/* Nothing on this tab can be selected, so the background keeps the normal cursor instead of the crosshair. */
.content-area {
  cursor: auto;
}
.intro {
  font-size: var(--text-sm);
  color: var(--color-on-zone-muted);
}
/* One point per row, like the Prompts tab. */
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
.misses {
  font-size: var(--text-xs);
  font-weight: 400;
  color: var(--color-text-muted);
}
</style>
