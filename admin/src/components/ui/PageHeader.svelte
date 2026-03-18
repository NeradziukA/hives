<script lang="ts">
  interface Props {
    title:    string;
    newLabel: string;
    onNew:    () => void;
  }

  let { title, newLabel, onNew }: Props = $props();
</script>

<div class="page-header">
  <p class="page-title">{title}</p>
  <button class="btn small" onclick={onNew}>{newLabel}</button>
</div>

<style>
  .page-header {
    padding: 20px 28px 16px 56px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 16px;
  }
  .page-title {
    font-size: 14px; font-weight: 700;
    letter-spacing: 0.15em; text-transform: uppercase;
    color: var(--text-bright); margin: 0; flex: 1;
  }
</style>
