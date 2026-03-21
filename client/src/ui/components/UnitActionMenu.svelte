<script lang="ts">
  import { gameState } from "../gameState.svelte.ts";
  import { sendWsMessage } from "../../webSocketHandler.ts";
  import { UNIT_MESSAGE_MAX_LENGTH } from "../../../../lib/constants.ts";

  const MAIN_UNIT_ID = "__self__";

  let label = $derived(
    gameState.selectedUnitId === MAIN_UNIT_ID
      ? "You"
      : gameState.selectedUnitUsername ?? gameState.selectedUnitId?.slice(0, 8) ?? ""
  );

  let messageText = $state("");

  function dismiss() {
    gameState.selectedUnitId = null;
    gameState.messagingMode = false;
    messageText = "";
  }

  function cancelMessage() {
    gameState.messagingMode = false;
    messageText = "";
  }

  function sendMessage() {
    const text = messageText.trim();
    if (!text || !gameState.selectedUnitId) return;
    const srcId = localStorage.getItem("playerId") ?? "";
    sendWsMessage({
      type: "UNIT_MESSAGE",
      srcId,
      payload: { dstId: gameState.selectedUnitId, text },
    });
    messageText = "";
    gameState.messagingMode = false;
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === "Enter") sendMessage();
    if (e.key === "Escape") cancelMessage();
  }
</script>

{#if gameState.selectedUnitId}
  <div class="menu">
    <div class="header">
      <span class="unit-id">{label}</span>
      <button class="btn-dismiss" onclick={dismiss} aria-label="Dismiss">✕</button>
    </div>
    {#if !gameState.messagingMode}
      <div class="actions">
        <button disabled>Follow</button>
        <button
          onclick={() => (gameState.messagingMode = true)}
          disabled={gameState.selectedUnitId === MAIN_UNIT_ID}
        >Message</button>
      </div>
    {:else}
      <input
        class="msg-input"
        bind:value={messageText}
        onkeydown={onKeydown}
        placeholder="Message to {label}…"
        maxlength={UNIT_MESSAGE_MAX_LENGTH}
      />
      <div class="msg-footer">
        <span class="char-hint" class:warn={messageText.length > UNIT_MESSAGE_MAX_LENGTH * 0.9}>
          {UNIT_MESSAGE_MAX_LENGTH - messageText.length}
        </span>
        <button onclick={sendMessage}>Send</button>
      </div>
    {/if}
  </div>
{/if}

<style>
  .menu {
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
    min-width: 180px;
    max-width: min(320px, calc(100vw - 80px));
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .unit-id {
    opacity: 0.7;
    text-transform: uppercase;
    font-size: 12px;
  }

  .btn-dismiss {
    background: transparent;
    border: none;
    color: var(--accent);
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    padding: 0 2px;
    cursor: pointer;
    opacity: 0.5;
    line-height: 1;
  }

  .btn-dismiss:hover {
    opacity: 1;
  }

  .actions {
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
    text-align: left;
  }

  button:hover:not(:disabled) {
    background: rgba(var(--accent-rgb), 0.15);
  }

  button:disabled {
    opacity: 0.3;
    cursor: default;
  }

  .msg-input {
    background: transparent;
    border: none;
    border-bottom: 1px solid rgba(var(--accent-rgb), 0.6);
    color: var(--accent);
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    letter-spacing: 0.08em;
    outline: none;
    width: 100%;
    padding: 2px 0;
  }

  .msg-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 2px;
  }

  .msg-input::placeholder {
    opacity: 0.4;
  }

  .char-hint {
    opacity: 0.35;
    font-size: 11px;
    min-width: 2.5em;
    text-align: right;
    flex-shrink: 0;
  }

  .char-hint.warn {
    opacity: 0.8;
    color: #f0a;
  }
</style>
