<script setup lang="ts">
import { onMounted, onUnmounted, ref, useId, watch } from "vue";

/**
 * A text box for a point or topic name, with one suggestion (such as `+ Add point "…"`) in a dropdown under it.
 * The parent passes `suggestion` when there's something to add, or null. Enter or clicking the suggestion emits
 * `choose`; Escape closes the dropdown (or empties the box once it's closed), and so does clicking outside.
 */
const text = defineModel<string>({ required: true });
const { placeholder, suggestion, disabled = false } = defineProps<{ placeholder: string; suggestion: string | null; disabled?: boolean }>();
const emit = defineEmits<{ choose: [] }>();

const root = ref<HTMLElement | null>(null);
const dismissed = ref(false);
const listId = useId();

// Typing again brings a dismissed suggestion back.
watch(text, () => (dismissed.value = false));

function choose() {
  if (suggestion !== null && !dismissed.value && !disabled) emit("choose");
}

function escape() {
  if (suggestion !== null && !dismissed.value) dismissed.value = true;
  else text.value = "";
}

/** Closes the dropdown when I click or move the focus outside the box and its suggestion. */
function closeIfOutside(event: Event) {
  const target = event instanceof FocusEvent ? event.relatedTarget : event.target;
  if (target instanceof Node && !root.value?.contains(target)) dismissed.value = true;
}
onMounted(() => document.addEventListener("click", closeIfOutside));
onUnmounted(() => document.removeEventListener("click", closeIfOutside));
</script>

<template>
  <div ref="root" class="suggest" @focusout="closeIfOutside">
    <input v-model="text" :placeholder="placeholder" :aria-label="placeholder" maxlength="80"
           role="combobox" :aria-expanded="suggestion !== null && !dismissed" :aria-controls="listId"
           @keydown.enter="choose" @keydown.escape="escape" />
    <div v-if="suggestion !== null && !dismissed" :id="listId" class="dropdown">
      <button type="button" :disabled="disabled" :title="suggestion" @click="choose">{{ suggestion }}</button>
    </div>
  </div>
</template>

<style scoped>
.suggest {
  position: relative;
  flex: 1 1 180px;
  min-width: 0;
}
input {
  width: 100%;
  min-width: 0;
  min-height: 40px;
  padding: 0 14px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}
input:focus {
  outline: none;
  border-color: var(--color-accent);
}
/* Anchored under the box, the same width, above the content below it. */
.dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 20;
  padding: 4px;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--shadow-popover);
}
.dropdown button {
  display: block;
  width: 100%;
  padding: 9px 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--color-accent-strong);
  font-weight: 600;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dropdown button:hover:not(:disabled),
.dropdown button:focus-visible {
  background: var(--color-accent-soft);
}
</style>
