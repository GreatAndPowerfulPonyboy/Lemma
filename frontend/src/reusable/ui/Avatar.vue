<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(defineProps<{ username: string; size?: number }>(), { size: 28 });

/** Pairs of background and text colors, defined in tokens.css; a username always maps to the same pair. */
const colors = [1, 2, 3, 4, 5, 6].map((n) => [`var(--color-avatar-${n}-bg)`, `var(--color-avatar-${n}-text)`]);

const style = computed(() => {
  const sum = [...props.username].reduce((total, letter) => total + letter.charCodeAt(0), 0);
  const [background, color] = colors[sum % colors.length]!;
  return { background, color, width: `${props.size}px`, height: `${props.size}px`, fontSize: `${props.size * 0.43}px` };
});
</script>

<template>
  <span class="avatar" :style="style" :title="username">{{ username[0]?.toUpperCase() }}</span>
</template>

<style scoped>
.avatar {
  display: inline-grid;
  place-items: center;
  flex: none;
  border-radius: 50%;
  font-weight: 700;
  line-height: 1;
}
</style>
