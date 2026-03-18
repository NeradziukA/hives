<script lang="ts">
  import { i18n } from '../lib/i18n.svelte.ts';

  interface Props {
    filterActiveOnly: boolean;
    onSearch:         () => void;
    onReset:          () => void;
  }

  let {
    filterActiveOnly = $bindable(),
    onSearch, onReset,
  }: Props = $props();
</script>

<div class="search-bar">
  <div class="toggle-group">
    <button class="toggle" class:active={filterActiveOnly}
      onclick={() => { filterActiveOnly = !filterActiveOnly; onSearch(); }}
      aria-pressed={filterActiveOnly} aria-label={i18n.t.filterActiveOnly}>
      <span class="toggle-thumb"></span>
    </button>
    <span class="toggle-label">{i18n.t.filterActiveOnly}</span>
  </div>
  <div class="search-actions">
    <button class="btn small secondary" onclick={onReset}>{i18n.t.reset}</button>
  </div>
</div>

<style>
  .search-bar {
    padding: 12px 28px;
    border-bottom: 1px solid var(--border);
    display: flex; gap: 8px; align-items: flex-end;
    flex-wrap: wrap; background: var(--bg2);
  }
  .toggle-group {
    display: flex; flex-direction: row; align-items: center; gap: 8px;
    align-self: flex-end; height: 28px;
  }
  .toggle-label { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-dim); }
  .toggle {
    width: 36px; height: 18px;
    background: var(--border); border: 1px solid var(--border);
    border-radius: 0; padding: 0; cursor: pointer;
    position: relative; transition: background 0.15s, border-color 0.15s; flex-shrink: 0;
  }
  .toggle.active { background: var(--green-bg); border-color: var(--green); }
  .toggle-thumb {
    position: absolute; top: 2px; left: 2px;
    width: 12px; height: 12px;
    background: var(--text-dim); transition: left 0.15s, background 0.15s;
  }
  .toggle.active .toggle-thumb { left: 20px; background: var(--green); }
  .search-actions { display: flex; gap: 8px; align-self: flex-end; margin-left: auto; }
</style>
