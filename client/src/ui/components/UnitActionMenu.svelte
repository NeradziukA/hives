<script lang="ts">
  import { gameState } from "../gameState.svelte.ts";

  const MAIN_UNIT_ID = "__self__";

  let label = $derived(
    gameState.selectedUnitId === MAIN_UNIT_ID
      ? "You"
      : gameState.selectedUnitId?.slice(0, 8) ?? ""
  );

  function dismiss() {
    gameState.selectedUnitId = null;
  }
</script>

{#if gameState.selectedUnitId}
  <div class="menu">
    <span class="unit-id">Unit: {label}</span>
    <div class="actions">
      <button disabled>Follow</button>
      <button disabled>Message</button>
      <button onclick={dismiss}>✕</button>
    </div>
  </div>
{/if}

<style>
  .menu {
    position: fixed;
    bottom: 60px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.88);
    border: 1px solid rgba(114, 181, 58, 0.5);
    color: #72b53a;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    letter-spacing: 0.08em;
    padding: 10px 18px;
    display: flex;
    align-items: center;
    gap: 16px;
    z-index: 6;
    pointer-events: auto;
  }

  .unit-id {
    opacity: 0.7;
    text-transform: uppercase;
  }

  .actions {
    display: flex;
    gap: 8px;
  }

  button {
    background: transparent;
    border: 1px solid rgba(114, 181, 58, 0.4);
    color: #72b53a;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.08em;
    padding: 4px 10px;
    cursor: pointer;
    text-transform: uppercase;
    transition: background 0.15s;
  }

  button:hover:not(:disabled) {
    background: rgba(114, 181, 58, 0.15);
  }

  button:disabled {
    opacity: 0.3;
    cursor: default;
  }
</style>
