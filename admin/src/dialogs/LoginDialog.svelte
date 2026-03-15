<script lang="ts">
  import { i18n } from '../lib/i18n.svelte.ts';
  import { auth } from '../lib/auth.svelte.ts';
  import { safeJson } from '../lib/api.ts';

  interface Props {
    onsuccess: () => void;
  }

  const { onsuccess }: Props = $props();

  let username = $state('');
  let password = $state('');
  let error = $state('');
  let loading = $state(false);

  async function doLogin() {
    if (!username.trim() || !password) return;
    loading = true;
    error = '';
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      if (!res.ok) {
        error = i18n.t.loginErr;
        return;
      }
      const data = await safeJson<{ accessToken: string; refreshToken: string }>(res);
      auth.save(data.accessToken, data.refreshToken);
      onsuccess();
    } catch {
      error = i18n.t.loginErr;
    } finally {
      loading = false;
    }
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') doLogin();
  }
</script>

<div class="overlay">
  <div class="login-box">
    <p class="login-title">{i18n.t.loginTitle}</p>
    <input
      type="text"
      placeholder={i18n.t.loginUser}
      autocomplete="username"
      bind:value={username}
      onkeydown={onKeydown}
      disabled={loading}
    />
    <input
      type="password"
      placeholder={i18n.t.loginPass}
      autocomplete="current-password"
      bind:value={password}
      onkeydown={onKeydown}
      disabled={loading}
    />
    <button class="btn full" onclick={doLogin} disabled={loading}>
      {i18n.t.loginBtn}
    </button>
    {#if error}
      <p class="error-msg">{error}</p>
    {/if}
  </div>
</div>

<style>
  .overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.85);
    display: flex; align-items: center; justify-content: center;
    z-index: 100;
  }
  .login-box {
    width: 320px;
    border: 1px solid var(--green-dim);
    background: var(--bg3);
    padding: 40px 32px;
    display: flex; flex-direction: column; gap: 14px;
  }
  .login-title {
    font-size: 15px; font-weight: 700;
    letter-spacing: 0.15em; text-transform: uppercase;
    color: var(--green); margin: 0 0 8px;
    text-align: center;
  }
</style>
