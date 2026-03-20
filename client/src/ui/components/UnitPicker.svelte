<script lang="ts">
  import { gameState } from "../gameState.svelte.ts";

  function select(idx: number) {
    const c = gameState.unitPickerCandidates[idx];
    gameState.selectedUnitId = c.unitId;
    gameState.selectedObjectType = c.objectType;
    gameState.selectedUnitUsername = c.username;
    gameState.unitPickerCandidates = [];
  }

  function dismiss() {
    gameState.unitPickerCandidates = [];
  }
</script>

{#if gameState.unitPickerCandidates.length > 1}
  <div class="picker">
    <div class="header">
      <span class="label">Select</span>
      <button class="dismiss" onclick={dismiss} aria-label="Dismiss">✕</button>
    </div>
    <div class="list">
      {#each gameState.unitPickerCandidates as c, i}
        <button onclick={() => select(i)}>
          <span class="name">{c.username ?? c.unitId.slice(0, 8)}</span>
          {#if c.objectType}
            <span class="type">{c.objectType}</span>
          {/if}
        </button>
      {/each}
    </div>
  </div>
{/if}

<style>
  .picker {
    position: fixed;
    top: 56px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.88);
    border: 1px solid rgba(var(--accent-rgb), 0.5);
    color: var(--accent);
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    letter-spacing: 0.08em;
    padding: 10px 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 6;
    pointer-events: auto;
    min-width: 160px;
    max-width: min(280px, calc(100vw - 80px));
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .label {
    opacity: 0.5;
    text-transform: uppercase;
    font-size: 11px;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  button {
    background: transparent;
    border: 1px solid rgba(var(--accent-rgb), 0.4);
    color: var(--accent);
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.08em;
    padding: 8px 10px;
    cursor: pointer;
    text-transform: uppercase;
    transition: background 0.15s;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    text-align: left;
  }

  button:hover {
    background: rgba(var(--accent-rgb), 0.15);
  }

  .name {
    flex: 1;
  }

  .type {
    opacity: 0.45;
    font-size: 10px;
    flex-shrink: 0;
  }

  .dismiss {
    background: transparent;
    border: none;
    color: var(--accent);
    font-size: 12px;
    padding: 0 2px;
    cursor: pointer;
    opacity: 0.5;
    line-height: 1;
  }

  .dismiss:hover {
    opacity: 1;
  }
</style>
