<script lang="ts">
  export type SidebarAction = {
    label: string;
    onclick: () => void;
    disabled?: boolean;
  };

  let {
    open,
    onclose,
    actions,
  }: { open: boolean; onclose: () => void; actions: SidebarAction[] } = $props();
</script>

{#if open}
  <button class="backdrop" onclick={onclose} aria-label="Close sidebar"></button>
{/if}

<div class="sidebar" class:open>
  <button class="close-btn" onclick={onclose}>✕</button>
  <nav class="nav">
    {#each actions as action (action.label)}
      <button
        class="btn"
        disabled={action.disabled}
        onclick={() => { action.onclick(); onclose(); }}
      >
        {action.label}
      </button>
    {/each}
  </nav>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 90;
    background: rgba(0, 0, 0, 0.4);
    cursor: default;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 100;
    width: 240px;
    background: rgba(0, 0, 0, 0.92);
    border-right: 1px solid rgba(var(--accent-rgb), 0.25);
    display: flex;
    flex-direction: column;
    padding: 16px 0;
    transform: translateX(-100%);
    transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .close-btn {
    align-self: flex-end;
    margin-right: 12px;
    margin-bottom: 16px;
    background: transparent;
    border: none;
    color: rgba(var(--accent-rgb), 0.5);
    font-size: 16px;
    cursor: pointer;
    padding: 4px 8px;
    transition: color 0.15s;
  }

  .close-btn:hover {
    color: var(--accent);
  }

  .nav {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0 16px;
  }

  .btn {
    width: 100%;
    padding: 14px 24px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    background: rgba(0, 0, 0, 0.7);
    border: 1px solid rgba(var(--accent-rgb), 0.4);
    color: var(--accent);
    cursor: pointer;
    transition:
      background 0.15s,
      border-color 0.15s,
      color 0.15s;
  }

  .btn:hover:not(:disabled) {
    background: rgba(var(--accent-rgb), 0.12);
    border-color: var(--accent);
    color: #fff;
  }

  .btn:disabled {
    opacity: 0.3;
    cursor: default;
    border-color: rgba(var(--accent-rgb), 0.2);
  }
</style>
