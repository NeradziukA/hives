<script lang="ts">
  import { i18n } from '../lib/i18n.svelte.ts';
  import ToggleFilter from '../components/ui/ToggleFilter.svelte';

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
  <ToggleFilter bind:value={filterActiveOnly} label={i18n.t.filterActiveOnly}
    onToggle={onSearch} />
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
  .search-actions { display: flex; gap: 8px; align-self: flex-end; margin-left: auto; }
</style>
