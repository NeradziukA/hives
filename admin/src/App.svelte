<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from './lib/auth.svelte.ts';
  import { i18n } from './lib/i18n.svelte.ts';
  import type { Lang } from './lib/types.ts';
  import { safeJson } from './lib/api.ts';
  import LoginDialog from './dialogs/LoginDialog.svelte';
  import Sidebar from './components/Sidebar.svelte';
  import Toast from './components/Toast.svelte';
  import PlayersPage from './pages/PlayersPage.svelte';
  import BuildingsPage from './pages/BuildingsPage.svelte';

  let authenticated = $state(false);
  let activeSection = $state('users');
  let sidebarOpen = $state(typeof window !== 'undefined' ? window.innerWidth > 768 : true);

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
            const data = await safeJson<{ accessToken: string }>(refreshRes);
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
    {#if sidebarOpen}
      <Sidebar
        activeSection={activeSection}
        onsectionChange={onSectionChange}
        onlogout={onLogout}
        onlangChange={onLangChange}
        oncloseSidebar={() => sidebarOpen = false}
      />
    {/if}
    <main class="main">
      {#if !sidebarOpen}
        <button class="sidebar-toggle" onclick={() => sidebarOpen = true} title="Показать меню">☰</button>
      {/if}
      {#if activeSection === 'users'}
        <PlayersPage />
      {:else if activeSection === 'buildings'}
        <BuildingsPage />
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
    position: relative;
  }
  .sidebar-toggle {
    position: absolute;
    top: 19px;
    left: 10px;
    z-index: 10;
    width: 32px;
    height: 32px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    background: var(--bg3);
    border: 1px solid var(--border);
    color: var(--text-dim);
    border-radius: 4px;
    cursor: pointer;
    transition: color 0.15s, background 0.15s;
  }
  .sidebar-toggle:hover {
    color: var(--text);
    background: var(--bg2);
  }
</style>
