<script lang="ts">
  import { gameState } from "../../gameState.svelte.ts";

  // Line-height 1.4 × font-size 12px × 10 lines + padding
  const LINE_HEIGHT_PX = 12 * 1.4;
  const MAX_LINES = 10;
  const MAX_HEIGHT = LINE_HEIGHT_PX * MAX_LINES;

  let collapsed = $state(true);
  let filter = $state<string | null>(null);
  let listEl: HTMLElement | null = $state(null);

  // Parse "[Username]: text" — returns { sender, text } or null if no sender prefix
  function parse(raw: string): { sender: string; text: string } | null {
    const m = raw.match(/^\[([^\]]+)\]:\s*([\s\S]*)$/);
    return m ? { sender: m[1], text: m[2] } : null;
  }

  let visible = $derived(
    filter
      ? gameState.messageHistory.filter(m => parse(m.text)?.sender === filter)
      : gameState.messageHistory
  );

  let lastMsg = $derived(
    filter
      ? (visible.at(-1)?.text ?? `[${filter}] filtered`)
      : (gameState.messageHistory.at(-1)?.text ?? "")
  );

  $effect(() => {
    if (!collapsed && listEl && visible.length) {
      listEl.scrollTop = listEl.scrollHeight;
    }
  });

  function setFilter(sender: string) {
    filter = sender;
  }

  function clearFilter() {
    filter = null;
  }
</script>

<div class="panel">
  <div class="bar">
    <span class="last-msg">{lastMsg}</span>
    {#if filter}
      <button class="chip" onclick={clearFilter} title="Clear filter">
        {filter} ✕
      </button>
    {/if}
    <button
      class="toggle"
      onclick={() => (collapsed = !collapsed)}
      aria-label={collapsed ? "Expand messages" : "Collapse messages"}
    >{collapsed ? "▲" : "▼"}</button>
  </div>

  {#if !collapsed}
    <div class="history" bind:this={listEl} style="max-height:{MAX_HEIGHT}px">
      {#each visible as msg (msg.id)}
        {@const parsed = parse(msg.text)}
        <div class="entry">
          {#if parsed}
            <button class="sender" onclick={() => setFilter(parsed.sender)}>[{parsed.sender}]</button>: {parsed.text}
          {:else}
            {msg.text}
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .panel {
    position: fixed;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    width: min(480px, calc(100vw - 100px));
    background: rgba(0, 0, 0, 0.82);
    border: 1px solid rgba(var(--accent-rgb), 0.4);
    color: var(--accent);
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.06em;
    pointer-events: auto;
    z-index: 5;
  }

  .bar {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
  }

  .last-msg {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    opacity: 0.85;
    min-width: 0;
  }

  .chip {
    background: rgba(var(--accent-rgb), 0.15);
    border: 1px solid rgba(var(--accent-rgb), 0.4);
    color: var(--accent);
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    padding: 1px 6px;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .chip:hover {
    background: rgba(var(--accent-rgb), 0.28);
  }

  .toggle {
    background: transparent;
    border: none;
    color: var(--accent);
    font-size: 10px;
    cursor: pointer;
    padding: 0 2px;
    line-height: 1;
    opacity: 0.6;
    flex-shrink: 0;
  }

  .toggle:hover {
    opacity: 1;
  }

  .history {
    overflow-y: auto;
    border-top: 1px solid rgba(var(--accent-rgb), 0.2);
    padding: 6px 10px;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .history::-webkit-scrollbar {
    width: 4px;
  }

  .history::-webkit-scrollbar-thumb {
    background: rgba(var(--accent-rgb), 0.3);
  }

  .entry {
    opacity: 0.75;
    line-height: 1.4;
    word-break: break-word;
    white-space: pre-wrap;
  }

  .sender {
    background: transparent;
    border: none;
    color: var(--accent);
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.06em;
    padding: 0;
    cursor: pointer;
    opacity: 0.9;
    text-decoration: underline;
    text-underline-offset: 2px;
    text-decoration-style: dotted;
  }

  .sender:hover {
    opacity: 1;
  }
</style>
