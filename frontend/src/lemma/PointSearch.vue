<script setup lang="ts">
import { computed } from "vue";
import { api } from "../api/client.ts";
import SuggestBox from "./SuggestBox.vue";
import { useHome, type MyTopic } from "./useLemma.ts";

/** The text in the box, owned by HomePage. `topic` is the topic named exactly in the topic box, if any; a new point goes into it. */
const search = defineModel<string>({ required: true });
const { topic } = defineProps<{ topic: MyTopic | undefined }>();

const { home, working, change } = useHome();

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** I can add the text as a point when it isn't blank and I have no point with that name yet. */
const canAdd = computed(
  () => search.value.trim() !== "" && !(home.value?.myPoints ?? []).some((p) => same(p.pointName, search.value)),
);

const suggestion = computed(() =>
  canAdd.value ? `+ Add point "${search.value.trim()}"${topic ? ` to ${topic.name}` : ""}` : null,
);

async function add() {
  if (!canAdd.value) return;
  const name = search.value.trim();
  const result = topic
    ? await change("/point/createIn", api.point.createIn({ name, category: topic.category }))
    : await change("/point/create", api.point.create({ name }));
  if (!("error" in result)) search.value = "";
}
</script>

<template>
  <div class="search">
    <SuggestBox v-model="search" placeholder="Search or add a point" :suggestion="suggestion" :disabled="working"
                @choose="add" />
  </div>
</template>

<style scoped>
.search {
  display: flex;
  flex: 1 1 260px;
  min-width: 0;
  align-items: center;
}
</style>
