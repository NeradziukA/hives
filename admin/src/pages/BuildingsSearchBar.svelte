<script lang="ts">
  import { i18n } from '../lib/i18n.svelte.ts';
  import ToggleFilter from '../components/ui/ToggleFilter.svelte';

  interface Props {
    searchQ:          string;
    filterActiveOnly: boolean;
    onSearch:         () => void;
    onDebounce:       () => void;
    onReset:          () => void;
  }

  let {
    searchQ        = $bindable(),
    filterActiveOnly = $bindable(),
    onSearch, onDebounce, onReset,
  }: Props = $props();
</script>

<div class="search-bar">
  <div class="search-group">
    <span class="search-label">{i18n.t.searchName}</span>
    <input type="text" name="search-q" bind:value={searchQ}
      oninput={onDebounce} onkeydown={(e) => e.key === 'Enter' && onSearch()} />
  </div>
  <ToggleFilter bind:value={filterActiveOnly} label={i18n.t.filterActiveOnly}
    onToggle={onSearch} alignEnd={true} />
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
  .search-group { display: flex; flex-direction: column; gap: 4px; }
  .search-label { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-dim); }
  .search-group input { width: 220px; }
  .search-actions { display: flex; gap: 8px; align-self: flex-end; }
</style>
