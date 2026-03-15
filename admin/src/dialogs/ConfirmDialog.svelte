<script lang="ts">
  import { i18n } from '../lib/i18n.svelte.ts';

  interface Props {
    open: boolean;
    title: string;
    body: string;
    onconfirm: () => void;
    oncancel: () => void;
  }

  const { open, title, body, onconfirm, oncancel }: Props = $props();
</script>

{#if open}
  <div class="overlay">
    <div class="confirm-box">
      <p class="confirm-title">{title}</p>
      <p class="confirm-body">{body}</p>
      <div class="confirm-actions">
        <button class="btn secondary" onclick={oncancel}>{i18n.t.cancel}</button>
        <button class="btn danger" onclick={onconfirm}>{i18n.t.confirm}</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.85);
    display: flex; align-items: center; justify-content: center;
    z-index: 100;
  }
  .confirm-box {
    width: 360px;
    border: 1px solid rgba(255,68,68,0.4);
    background: var(--bg3);
    padding: 32px 28px;
    display: flex; flex-direction: column; gap: 16px;
  }
  .confirm-title {
    font-size: 13px; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--red); margin: 0;
  }
  .confirm-body { color: var(--text); font-size: 13px; line-height: 1.6; margin: 0; }
  .confirm-actions { display: flex; gap: 10px; justify-content: flex-end; }
</style>
