<script setup lang="ts">
/** Lays out the home screen's controls (put inside it) on one line, vertically centred, wrapping onto more lines when the window is narrow. */
</script>

<template>
  <div class="filter-row">
    <slot />
  </div>
</template>

<style scoped>
.filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
}
</style>
