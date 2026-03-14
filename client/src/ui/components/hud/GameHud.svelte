<script lang="ts">
  import { gameState } from "../../gameState.svelte.ts";
  import ZoomDisplay from "./ZoomDisplay.svelte";
  import MessageLog from "./MessageLog.svelte";

  let lastMsg = $derived(gameState.messages.at(-1)?.text ?? "");
</script>

<div class="hud">
  <ZoomDisplay zoom={gameState.zoom} />
  <span class="divider">│</span>
  <MessageLog message={lastMsg} />
</div>

<style>
  .hud {
    position: fixed;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.82);
    border: 1px solid rgba(114, 181, 58, 0.4);
    color: #72b53a;
    font-family: monospace;
    font-size: 13px;
    letter-spacing: 0.08em;
    padding: 6px 18px;
    display: flex;
    align-items: center;
    gap: 14px;
    pointer-events: none;
    z-index: 5;
  }

  .divider {
    opacity: 0.4;
  }
</style>
