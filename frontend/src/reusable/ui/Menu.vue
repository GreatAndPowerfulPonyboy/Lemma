<script setup lang="ts">
import { nextTick, onUnmounted, ref } from "vue";
import Icon from "./Icon.vue";

/** `align` picks which edge of the button the popover lines up with: "end" (the default) opens it leftwards from the button's right edge, "start" rightwards from its left edge. */
withDefaults(defineProps<{ label: string; align?: "start" | "end" }>(), { align: "end" });
const open = ref(false);
const root = ref<HTMLElement | null>(null);
const button = ref<HTMLButtonElement | null>(null);
const items = ref<HTMLElement | null>(null);

/** How far the popover is slid sideways, whether it opens above the button, and how tall it may be, so it stays inside the window. */
const shift = ref(0);
const above = ref(false);
const maxHeight = ref<number | null>(null);

/**
 * Keeps the open popover inside the window, with an 8px margin: slides it back past either side, opens it on
 * whichever side of the button has more room when it doesn't fit below, and if it's still too tall for that
 * side, caps its height so it scrolls.
 */
function keepOnScreen() {
  const box = items.value?.getBoundingClientRect();
  const anchor = button.value?.getBoundingClientRect();
  if (!box || !anchor) return;
  const margin = 8;
  if (box.right > window.innerWidth - margin) shift.value = window.innerWidth - margin - box.right;
  else if (box.left < margin) shift.value = margin - box.left;
  const roomBelow = window.innerHeight - margin - anchor.bottom - 6;
  const roomAbove = anchor.top - margin - 6;
  if (box.height > roomBelow && roomAbove > roomBelow) above.value = true;
  const room = above.value ? roomAbove : roomBelow;
  if (box.height > room) maxHeight.value = room;
}

/** Closes the menu when I click or move the focus outside it. */
function closeIfOutside(event: Event) {
  const target = event instanceof FocusEvent ? event.relatedTarget : event.target;
  if (target instanceof Node && !root.value?.contains(target)) close();
}

/** Pressing Escape closes the menu and moves the focus back to the menu button. */
function escape() {
  close();
  button.value?.focus();
}

async function toggle() {
  open.value = !open.value;
  if (open.value) {
    document.addEventListener("click", closeIfOutside);
    shift.value = 0;
    above.value = false;
    maxHeight.value = null;
    await nextTick();
    keepOnScreen();
  } else document.removeEventListener("click", closeIfOutside);
}

function close() {
  open.value = false;
  document.removeEventListener("click", closeIfOutside);
}

onUnmounted(close);
</script>

<template>
  <div ref="root" class="menu" @keydown.escape="escape" @focusout="closeIfOutside">
    <button ref="button" type="button" class="icon-button" :aria-label="label" :aria-expanded="open" @click="toggle">
      <slot name="button"><Icon name="more" /></slot>
    </button>
    <div v-if="open" ref="items" class="items" :class="[align, { above }]" :style="{ transform: `translateX(${shift}px)`, maxHeight: maxHeight === null ? undefined : `${maxHeight}px` }" @click="close">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.menu {
  position: relative;
}
/* An icon or avatar stays a 36px circle; a text label such as "Edit point" widens the button into a pill. */
.menu > .icon-button {
  width: auto;
  min-width: 36px;
  border-radius: var(--radius-full);
  white-space: nowrap;
}
.icon-button[aria-expanded="true"] {
  color: var(--color-text);
  background: var(--color-line);
}
.items {
  position: absolute;
  top: calc(100% + 6px);
  z-index: 10;
  display: flex;
  flex-direction: column;
  width: max-content;
  min-width: 200px;
  max-width: min(280px, calc(100vw - 16px));
  overflow-y: auto;
  padding: 6px;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--shadow-popover);
}
.items.end {
  right: 0;
}
.items.start {
  left: 0;
}
.items.above {
  top: auto;
  bottom: calc(100% + 6px);
}
/* Each item is a button with an icon and a label, and an optional `.detail` line under the label. */
.items :slotted(button) {
  flex: none;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 9px 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  text-align: left;
  overflow-wrap: anywhere;
}
.items :slotted(button:hover) {
  background: var(--color-page);
}
.items :slotted(svg) {
  flex: none;
  margin-top: 2px;
}
.items :slotted(.detail) {
  display: block;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
</style>
