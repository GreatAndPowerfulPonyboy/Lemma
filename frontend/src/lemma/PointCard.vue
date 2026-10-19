<script setup lang = "ts">
import {computed, ref} from 'vue';
import {api} from "../api/client.ts";
import Dialog from "../reusable/ui/Dialog.vue";
import Menu  from "../reusable/ui/Menu.vue";
import AnswerDialog from "./AnswerDialog.vue";
import DrillDialog from "./DrillDialog.vue";
import TopicPicker from "./TopicPicker.vue";
import {useHome, type MyPoint, type MyTopic} from "./useLemma.ts";

/** `touched` means a selection rectangle is over this card, so it will be selected when I let go. */
const {row, selected = false, selecting = false, touched = false} = defineProps<{ row: MyPoint, selected?: boolean, selecting?: boolean, touched?: boolean}>();
/** `toggle` selects or unselects this point. */
const emit = defineEmits<{ toggle: [] }>();

const editing = ref(false);
const newName = ref("");

const {home, change, move, working} = useHome();

/** Every topic except the one this point is already in. */
const otherTopics = computed(() => (home.value?.myTopics ?? []).filter((t) => t.category !== row.category));

function startRename() {
  newName.value = row.pointName;
  editing.value = true;
}
async function saveRename() {
  const result = await change("/point/rename", api.point.rename({cue: row.cue, name: newName.value}))
  if (!("error" in result)) editing.value = false;
}

/** Moving one point from its own menu doesn't ask first; only moving several from the bar does. */
function moveTo(topic: MyTopic) {
  move([row.cue], topic.category);
}

/** True while the dialog asks me to confirm deleting this point, since a deleted point can't be brought back. */
const confirmingDelete = ref(false);

async function deletePoint() {
  await change("/point/delete", api.point.delete({cue: row.cue}));
  confirmingDelete.value = false;
}

/** Which dialog about this point's answer is open: writing or editing it, drilling it, or confirming its removal. */
const answering = ref<"write" | "drill" | "remove" | null>(null);

/** True while the card shows its answer in place of its name. */
const flipped = ref(false);

async function removeAnswer() {
  await change("/card/remove", api.card.remove({cue: row.cue}));
  answering.value = null;
  flipped.value = false;
}

/** True for clicks on the card's own controls (the select target, the menu, the rename box, the dialog), which do their own thing. */
function onControl(event: Event) {
  return event.target instanceof Element && event.target.closest("button, input, .menu, dialog") !== null;
}

/** Clicking the card's background toggles it. The select button in the corner does the same for the keyboard. */
function clickCard(event: MouseEvent) {
  if (!onControl(event)) emit("toggle");
}
</script>

<template>
  <div class="Point card selectable" :class="{selected, selecting, touched}" @click="clickCard">
    <button type="button" class="select-target" :aria-pressed="selected" :aria-label="`Select ${row.pointName}`"
            @click="emit('toggle')">
      <span v-if="selected" aria-hidden="true">✓</span>
    </button>
    <p class="topic">{{row.topicName ?? "Unsorted"}}</p>
    <div class="line">
      <input v-if="editing" v-model="newName" aria-label="New point name" maxlength="80"
             @keydown.enter="saveRename" @keydown.escape="editing = false" />
      <p v-else-if="flipped && row.answer !== null" class="answer">{{row.answer}}</p>
      <p v-else class = "name">{{row.pointName}}</p>
      <Menu label="Edit point" align="start">
        <template #button><span class="edit">Edit point</span></template>
        <button type="button" @click="startRename">Rename</button>
        <button type="button" @click="confirmingDelete = true">Delete</button>
        <button type="button" @click="answering = 'write'">{{row.answer === null ? "Write answer" : "Edit answer"}}</button>
        <template v-if="row.answer !== null">
          <button type="button" @click="answering = 'drill'">Drill</button>
          <button type="button" @click="answering = 'remove'">Remove answer</button>
        </template>
        <p class="heading">Move to</p>
        <TopicPicker :topics="otherTopics" @pick="moveTo" />
      </Menu>
    </div>
    <!-- A card's background selects it, so flipping has its own button. -->
    <button v-if="row.answer !== null" type="button" class="text-button flip" :aria-pressed="flipped"
            @click="flipped = !flipped">{{flipped ? "Show point" : "Tap to flip"}}</button>
  <AnswerDialog v-if="answering === 'write'" :cue="row.cue" :point-name="row.pointName" :answer="row.answer"
                @close="answering = null" />
  <DrillDialog v-if="answering === 'drill' && row.answer !== null" :point-name="row.pointName" :answer="row.answer"
               @close="answering = null" />
  <Dialog v-if="answering === 'remove'" title="Remove this answer?" :subtitle="row.pointName" @close="answering = null">
    <p>The point stays, but it stops being a card. The answer can't be brought back.</p>
    <div class="dialog-buttons">
      <button type="button" class="button outline" @click="answering = null">Cancel</button>
      <button type="button" class="button danger" :disabled="working" @click="removeAnswer">Remove</button>
    </div>
  </Dialog>
  <Dialog v-if="confirmingDelete" title="Delete this point?" :subtitle="row.pointName" @close="confirmingDelete = false">
    <p>This can't be undone.</p>
    <div class="dialog-buttons">
      <button type="button" class="button outline" @click="confirmingDelete = false">Cancel</button>
      <button type="button" class="button danger" :disabled="working" @click="deletePoint">Delete</button>
    </div>
  </Dialog>
  </div>
</template>

<style scoped>
.Point {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-4);
}
.topic {
  /* Leaves room for the select target in the corner. */
  padding-right: 36px;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  overflow-wrap: anywhere;
}
.line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}
.name {
  min-width: 0;
  overflow-wrap: anywhere;
}
.line input {
  flex: 1 1 140px;
  min-width: 0;
}
.edit {
  padding: 0 var(--space-3);
  font-size: var(--text-sm);
}
.answer {
  min-width: 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.flip {
  align-self: flex-start;
  font-size: var(--text-xs);
}
.heading {
  flex: none;
  padding: 8px 10px 2px;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
</style>
