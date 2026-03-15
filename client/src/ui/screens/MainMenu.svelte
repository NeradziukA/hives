<script lang="ts">
  import { untrack } from "svelte";
  import { _ } from "svelte-i18n";

  let {
    hasSavedSession,
    username = "",
    onconnect,
    oncontinue,
    onprofile,
  }: {
    hasSavedSession: boolean;
    username?: string;
    onconnect: (username: string, password: string) => Promise<void>;
    oncontinue: () => Promise<void>;
    onprofile: () => void;
  } = $props();

  let loginUsername = $state("");
  let password = $state("");
  let status = $state<"idle" | "loading" | "error">("idle");
  let errorMsg = $state("");
  let showLoginForm = $state(untrack(() => !hasSavedSession));

  async function submit() {
    if (!loginUsername || !password) return;
    status = "loading";
    errorMsg = "";
    try {
      await onconnect(loginUsername, password);
    } catch (e) {
      status = "error";
      errorMsg = e instanceof Error ? e.message : "Connection failed";
    }
  }

  async function handleContinue() {
    status = "loading";
    errorMsg = "";
    try {
      await oncontinue();
    } catch (e) {
      status = "error";
      errorMsg = e instanceof Error ? e.message : "Session expired";
      showLoginForm = true;
    }
  }
</script>

<div class="nav">
  {#if !showLoginForm && username}
    <p class="greeting">{username}</p>
  {/if}
  {#if !showLoginForm}
    <button class="btn" onclick={handleContinue} disabled={status === "loading"}>
      {status === "loading" ? "..." : $_("menu.continue")}
    </button>
    <button class="btn btn-secondary" onclick={() => (showLoginForm = true)} disabled={status === "loading"}>
      {$_("menu.switch_user")}
    </button>
  {:else}
    <input class="input" type="text" placeholder={$_("menu.username")} bind:value={loginUsername} disabled={status === "loading"} />
    <input class="input" type="password" placeholder={$_("menu.password")} bind:value={password} disabled={status === "loading"} onkeydown={(e) => e.key === "Enter" && submit()} />
    <button class="btn" onclick={submit} disabled={status === "loading"}>
      {status === "loading" ? "..." : $_("menu.connect")}
    </button>
  {/if}
  {#if errorMsg}
    <p class="error">{errorMsg}</p>
  {/if}
  {#if !showLoginForm}
    <button class="btn btn-secondary" onclick={onprofile}>{$_("menu.profile")}</button>
  {/if}
</div>

<style>
  .nav {
    position: fixed;
    top: 44%;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 260px;
  }

  .input {
    width: 100%;
    padding: 12px 16px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    letter-spacing: 0.05em;
    background: rgba(0, 0, 0, 0.7);
    border: 1px solid rgba(114, 181, 58, 0.4);
    color: #ccc;
    outline: none;
    box-sizing: border-box;
    animation: btn-in 0.4s ease forwards;
    opacity: 0;
  }

  .input:focus {
    border-color: #72b53a;
    color: #fff;
  }

  .input:disabled {
    opacity: 0.5;
  }

  .input:nth-child(1) { animation-delay: 0.6s; }
  .input:nth-child(2) { animation-delay: 0.8s; }

  .btn {
    width: 100%;
    padding: 14px 24px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    background: rgba(0, 0, 0, 0.7);
    border: 1px solid rgba(114, 181, 58, 0.4);
    color: #72b53a;
    cursor: pointer;
    opacity: 0;
    animation: btn-in 0.4s ease forwards;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
  }

  .btn:nth-of-type(1) { animation-delay: 0.6s; }
  .btn:nth-of-type(2) { animation-delay: 0.8s; }
  .btn:nth-of-type(3) { animation-delay: 1.0s; }

  .btn:hover:not(:disabled) {
    background: rgba(114, 181, 58, 0.12);
    border-color: #72b53a;
    color: #fff;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .btn-secondary {
    color: #888;
    border-color: rgba(255,255,255,0.15);
  }

  .greeting {
    font-family: 'JetBrains Mono', monospace;
    font-size: 16px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #72b53a;
    margin: 0;
    text-align: center;
    animation: btn-in 0.4s ease forwards;
    opacity: 0;
  }

  .error {
    color: #f44;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    margin: 0;
    animation: btn-in 0.2s ease forwards;
  }

  @keyframes btn-in {
    from { transform: scale(0); opacity: 0; }
    to   { transform: scale(1); opacity: 1; }
  }
</style>
