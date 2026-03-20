<script lang="ts">
  import { _ } from "svelte-i18n";
  import { gameState } from "../../gameState.svelte.ts";
  import MessageLog from "./MessageLog.svelte";

  const MAIN_UNIT_ID = "__self__";

  let lastMessage = $derived(gameState.messages.at(-1)?.text ?? "");

  let displayMsg = $derived(
    lastMessage
      ? lastMessage
      : gameState.selectedUnitId && gameState.selectedUnitId !== MAIN_UNIT_ID
        ? `${$_('types.' + gameState.selectedObjectType, { default: gameState.selectedObjectType ?? '' })} · ${gameState.selectedUnitUsername ?? gameState.selectedUnitId.slice(0, 8)}`
        : ""
  );


</script>

<div class="hud">
  <MessageLog message={displayMsg} />
</div>

<style>
  .hud {
    position: fixed;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.82);
    border: 1px solid rgba(var(--accent-rgb), 0.4);
    color: var(--accent);
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    letter-spacing: 0.08em;
    padding: 6px 18px;
    display: flex;
    align-items: center;
    pointer-events: none;
    z-index: 5;
  }
</style>
