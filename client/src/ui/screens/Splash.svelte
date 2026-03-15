<script lang="ts">
  import { _ } from "svelte-i18n";
</script>

<div class="loader">
  <div class="ring"></div>
  <span class="label">{$_("splash.loading")}</span>
</div>

<style>
  .loader {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translateX(-50%);
    z-index: 20;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .ring {
    width: 56px;
    height: 56px;
    border: 3px solid rgba(var(--accent-rgb), 0.2);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.3em;
    color: rgba(var(--accent-rgb), 0.6);
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
