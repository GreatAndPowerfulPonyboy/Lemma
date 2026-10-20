<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import PasswordForm from "./reusable/PasswordForm.vue";
import SignIn from "./reusable/SignIn.vue";
import { useSession } from "./reusable/session.ts";
import Avatar from "./reusable/ui/Avatar.vue";
import Menu from "./reusable/ui/Menu.vue";
import Home from "./lemma/HomePage.vue";
import RecallScreen from "./lemma/RecallScreen.vue";
import ResultsScreen from "./lemma/ResultsScreen.vue";
import { useHome } from "./lemma/useLemma.ts";
const { me, checked, load, signOut } = useSession();
const { reset, screen } = useHome();
onMounted(load);

/** What I typed on the recall screen, kept here so the results screen can show it beside my points. It's never sent, and it's forgotten when I go back home. */
const account = ref<string | null>(null);
watch(screen, (shown) => {
  if (shown === "home") account.value = null;
});

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
    <template v-if="me">
      <RecallScreen v-if="screen === 'recall'" @submitted="account = $event" />
      <ResultsScreen v-else-if="screen === 'results'" :account="account" />
      <Home v-else />
    </template>
    <div v-else class="sign-in-page">
      <SignIn icon="box" lead="Heighten your understanding with free recall">
        <PasswordForm />
      </SignIn>
    </div>
  </main>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  /* Inside #app's flex column, auto margins would shrink the bar to its contents; this keeps it full width up to the limit. */
  width: 100%;
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
  color: var(--color-on-accent);
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
/* Takes the window's height below the top bar, so the home screen can fill it edge to edge; the home screen sets its own gutters. */
.content {
  display: flex;
  flex: 1;
  flex-direction: column;
}
.sign-in-page {
  padding: var(--space-2) var(--space-6) var(--space-12);
}
/* The recall screen fills the window below the top bar with the header colour. */
.content:has(> .recall) {
  background: var(--color-header);
}
@media (max-width: 600px) {
  .topbar {
    padding: 14px 16px;
  }
  .sign-in-page {
    padding: var(--space-1) var(--space-4) var(--space-8);
  }
}
</style>
