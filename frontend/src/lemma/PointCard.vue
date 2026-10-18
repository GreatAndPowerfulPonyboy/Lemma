<script setup lang = "ts">
import {computed, ref} from 'vue';
import {api} from "../api/client.ts";
import Menu  from "../reusable/ui/Menu.vue";
import {useHome, type MyPoint} from "./useLemma.ts";

const {row} = defineProps<{ row: MyPoint}>();

const editing = ref(false);
const newName = ref("");

const {home, change} = useHome();
function startRename() {
  newName.value = row.pointName;
  editing.value = true;
}
async function saveRename() {
  const result = await change("/point/rename", api.point.rename({cue: row.cue, name: newName.value}))
  if (!("error" in result)) editing.value = false;
}
</script>

<template>
  <div class="Point">
    <p class="topic">{{row.topicName ?? "Unsorted"}}</p>
    <input v-if="editing" v-model="newName" @keydown.enter="saveRename" @keydown.escape="editing = false" />
    <p v-else class = "name">{{row.pointName}}</p>
  <Menu label="Point actions">
    <template #button>...</template>
    <button type="button" @click="change('/point/delete', api.point.delete({cue: row.cue}))">Delete</button>
    <button type="button" @click="startRename">Rename</button>
  </Menu>
  </div>
</template>

