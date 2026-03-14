<script lang="ts">
  import { gameState } from "../../gameState.svelte.ts";
  import MessageLog from "./MessageLog.svelte";

  let lastMsg = $derived(gameState.messages.at(-1)?.text ?? "");
</script>

<div class="hud">
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
    pointer-events: none;
    z-index: 5;
  }
</style>
