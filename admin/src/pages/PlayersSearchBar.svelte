<script lang="ts">
  import { i18n } from '../lib/i18n.svelte.ts';
  import ToggleFilter from '../components/ui/ToggleFilter.svelte';

  interface Props {
    searchQ:          string;
    searchLat:        string;
    searchLng:        string;
    searchRadius:     string;
    filterOnlineOnly: boolean;
    onSearch:         () => void;
    onDebounce:       () => void;
    onReset:          () => void;
  }

  let {
    searchQ        = $bindable(),
    searchLat      = $bindable(),
    searchLng      = $bindable(),
    searchRadius   = $bindable(),
    filterOnlineOnly = $bindable(),
    onSearch, onDebounce, onReset,
  }: Props = $props();
</script>

<div class="search-bar">
  <div class="search-group">
    <span class="search-label">{i18n.t.searchName}</span>
    <input type="text" name="search-name" bind:value={searchQ}
      oninput={onDebounce} onkeydown={(e) => e.key === 'Enter' && onSearch()} />
  </div>
  <div class="search-group narrow">
    <span class="search-label">{i18n.t.searchLat}</span>
    <input type="number" name="search-lat" step="any" bind:value={searchLat}
      onkeydown={(e) => e.key === 'Enter' && onSearch()} />
  </div>
  <div class="search-group narrow">
    <span class="search-label">{i18n.t.searchLng}</span>
    <input type="number" name="search-lng" step="any" bind:value={searchLng}
      onkeydown={(e) => e.key === 'Enter' && onSearch()} />
  </div>
  <div class="search-group narrow">
    <span class="search-label">{i18n.t.searchRad}</span>
    <input type="number" name="search-radius" step="any" min="0" bind:value={searchRadius}
      onkeydown={(e) => e.key === 'Enter' && onSearch()} />
  </div>
  <ToggleFilter bind:value={filterOnlineOnly} label={i18n.t.filterOnlineOnly}
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
  .search-group input { width: 180px; }
  .search-group.narrow input { width: 110px; }
  .search-actions { display: flex; gap: 8px; align-self: flex-end; }
  @media (max-width: 640px) {
    .search-bar { padding: 8px 12px; gap: 6px; }
    .search-group input { width: 120px; }
    .search-group.narrow input { width: 72px; }
  }
</style>
