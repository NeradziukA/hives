<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from './lib/auth.svelte.ts';
  import { i18n } from './lib/i18n.svelte.ts';
  import type { Lang } from './lib/types.ts';
  import LoginDialog from './dialogs/LoginDialog.svelte';
  import Sidebar from './components/Sidebar.svelte';
  import Toast from './components/Toast.svelte';
  import PlayersPage from './pages/PlayersPage.svelte';

  let authenticated = $state(false);
  let activeSection = $state('users');

  onMount(async () => {
    const token = auth.token;
    if (token) {
      try {
        const res = await fetch('/admin/api/users?limit=1', {
          headers: { Authorization: 'Bearer ' + token },
        });
        if (res.ok) {
          authenticated = true;
          return;
        }
        // Try refresh
        if (auth.refreshToken) {
          const refreshRes = await fetch('/api/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: auth.refreshToken }),
          });
          if (refreshRes.ok) {
            const data = await refreshRes.json();
            auth.save(data.accessToken);
            authenticated = true;
            return;
          }
        }
      } catch {
        // fall through to show login
      }
      auth.clear();
    }
    // Show login dialog (already shown by default via authenticated = false)
  });

  function onLoginSuccess() {
    authenticated = true;
  }

  function onLogout() {
    auth.clear();
    location.reload();
  }

  function onSectionChange(section: string) {
    activeSection = section;
  }

  function onLangChange(lang: Lang) {
    i18n.set(lang);
  }
</script>

{#if !authenticated}
  <LoginDialog onsuccess={onLoginSuccess} />
{:else}
  <div class="app-shell">
    <Sidebar
      activeSection={activeSection}
      onsectionChange={onSectionChange}
      onlogout={onLogout}
      onlangChange={onLangChange}
    />
    <main class="main">
      {#if activeSection === 'users'}
        <PlayersPage />
      {/if}
    </main>
  </div>
{/if}

<Toast />

<style>
  .app-shell {
    display: flex;
    height: 100vh;
  }
  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
</style>
