<script setup lang="ts">
import { onMounted } from "vue";
import PasswordForm from "./reusable/PasswordForm.vue";
import SignIn from "./reusable/SignIn.vue";
import { useSession } from "./reusable/session.ts";
import Avatar from "./reusable/ui/Avatar.vue";
import Menu from "./reusable/ui/Menu.vue";
import Home from "./lemma/HomePage.vue";
import { useHome } from "./lemma/useLemma.ts";
const { me, checked, load, signOut } = useSession();
const { reset } = useHome();
onMounted(load);

/** Signs out and clears my points and topics, so the next person to sign in on this tab never sees them. */
async function signOutAndReset() {
  await signOut();
  reset();
}
</script>

<template>
  <header v-if="me" class="topbar">
    <span class="brand"><span class="logo" aria-hidden="true">L</span>Lemma</span>
    <Menu label="Account">
      <template #button><Avatar :username="me.username" :size="36" /></template>
      <p class="signed-in">Signed in as <strong>{{ me.username }}</strong></p>
      <button type="button" @click="signOutAndReset">Sign out</button>
    </Menu>
  </header>
  <main v-if="checked" class="content">
    <Home v-if="me"/>
    <SignIn v-else icon="box" lead="Heighten your understanding with free recall">
      <PasswordForm />
    </SignIn>
  </main>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  max-width: 1168px;
  margin: 0 auto;
  padding: 18px 24px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: var(--text-lg);
  font-weight: 700;
}
.logo {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: var(--radius-sm);
  background: var(--color-accent);
  color: #ffffff;
  font-size: var(--text-lg);
  font-weight: 800;
  line-height: 1;
}
.signed-in {
  padding: 8px 10px;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
.signed-in strong {
  color: var(--color-text);
}
.content {
  padding: var(--space-2) var(--space-6) var(--space-12);
}
@media (max-width: 600px) {
  .topbar {
    padding: 14px 16px;
  }
  .content {
    padding: var(--space-1) var(--space-4) var(--space-8);
  }
}
</style>
