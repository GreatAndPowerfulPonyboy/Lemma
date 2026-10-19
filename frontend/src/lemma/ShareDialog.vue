<script setup lang="ts">
import { onMounted, ref } from "vue";
import { api } from "../api/client.ts";
import Dialog from "../reusable/ui/Dialog.vue";
import { useHome, type CheckShown, type MyCheck } from "./useLemma.ts";

/** Shares `prompt` with people by username, and lists who it's shared with so I can stop sharing. */
const { prompt } = defineProps<{ prompt: MyCheck }>();
const emit = defineEmits<{ close: [] }>();

const { call, change, error, working } = useHome();

const username = ref("");
const recipients = ref<CheckShown["recipients"]>([]);

/** Loads who the prompt is shared with. */
async function load() {
  const result = await call("/check/show", api.check.show({ check: prompt.check }));
  if ("error" in result) error.value = result.error;
  else recipients.value = result.recipients;
}
onMounted(load);

async function share() {
  if (username.value.trim() === "" || working.value) return;
  // The sentence above the box is about my last try; reloading the recipients doesn't clear it.
  error.value = null;
  const result = await change("/check/share", api.check.share({ check: prompt.check, username: username.value.trim() }), load);
  if (!("error" in result)) username.value = "";
}

function stopSharing(recipient: string) {
  error.value = null;
  change("/check/unshare", api.check.unshare({ check: prompt.check, username: recipient }), load);
}
</script>

<template>
  <Dialog title="Share this prompt" :subtitle="prompt.name" @close="emit('close')">
    <p class="note">People you share with can copy this prompt. Their copies are theirs to keep, even if you stop sharing.</p>
    <p v-if="error" class="refusal">{{ error }}</p>
    <div class="add">
      <input v-model="username" aria-label="Username" placeholder="Username" autofocus @keydown.enter="share" />
      <button type="button" class="button primary" :disabled="working || username.trim() === ''" @click="share">Share</button>
    </div>
    <ul v-if="recipients.length" class="recipients">
      <li v-for="recipient in recipients" :key="recipient.username">
        <span>{{ recipient.username }}</span>
        <button type="button" class="text-button" :disabled="working" @click="stopSharing(recipient.username)">Stop sharing</button>
      </li>
    </ul>
    <p v-else class="note">Not shared with anyone yet.</p>
  </Dialog>
</template>

<style scoped>
.note {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
.add {
  display: flex;
  gap: var(--space-2);
}
.add input {
  flex: 1;
  min-width: 0;
  min-height: 40px;
  padding: 0 14px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}
.add input:focus {
  outline: none;
  border-color: var(--color-accent);
}
.recipients {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: 0;
  list-style: none;
}
.recipients li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
  overflow-wrap: anywhere;
}
</style>
