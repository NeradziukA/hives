<script lang="ts">
  import { i18n } from '../lib/i18n.svelte.ts';
  import Badge from '../components/ui/Badge.svelte';
  import Spinner from '../components/ui/Spinner.svelte';
  import type { Building } from '../lib/types.ts';

  let {
    buildings, loading, onEdit, onDelete,
  }: {
    buildings: Building[];
    loading: boolean;
    onEdit:   (id: string) => void;
    onDelete: (id: string, name: string) => void;
  } = $props();

  function fmtCoords(lat: number, lng: number): string {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
</script>

<div class="table-wrap">
  <table>
    <thead>
      <tr>
        <th>{i18n.t.colType}</th>
        <th>{i18n.t.colName}</th>
        <th>{i18n.t.colFaction}</th>
        <th>{i18n.t.colLocation}</th>
        <th>{i18n.t.colRevealRadius}</th>
        <th>{i18n.t.colCapturedBy}</th>
        <th>{i18n.t.colActive}</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {#if loading}
        <tr class="loading-row"><td colspan="8"><Spinner /></td></tr>
      {:else if buildings.length === 0}
        <tr class="empty-row"><td colspan="8">{i18n.t.noBuildings}</td></tr>
      {:else}
        {#each buildings as b (b.id)}
          <tr>
            <td><span class="type-tag">{b.type}</span></td>
            <td>{b.name ?? '—'}</td>
            <td>{b.faction ?? '—'}</td>
            <td class="mono">{fmtCoords(b.lat, b.lng)}</td>
            <td class="mono">{b.revealRadius}</td>
            <td class="mono">{b.capturedBy ?? '—'}</td>
            <td><Badge mode="active" alive={b.active} /></td>
            <td>
              <div class="row-actions">
                <button class="btn small secondary" onclick={() => onEdit(b.id)}>
                  {i18n.t.edit}
                </button>
                <button class="btn small danger" onclick={() => onDelete(b.id, b.name ?? b.id)}>
                  {i18n.t.delete}
                </button>
              </div>
            </td>
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
</div>

<style>
  .table-wrap { flex: 1; overflow-y: auto; padding: 0 28px; }
  table { width: 100%; border-collapse: collapse; margin-top: 4px; }
  thead tr { border-bottom: 1px solid var(--border); }
  th {
    padding: 10px 10px 10px 0; text-align: left;
    font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--text-dim); font-weight: 500; white-space: nowrap;
  }
  td {
    padding: 9px 10px 9px 0;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    vertical-align: middle; font-size: 12px; color: var(--text);
  }
  tr:hover td { background: rgba(255,255,255,0.02); }
  .mono { font-family: var(--font); font-size: 11px; color: var(--text-dim); }
  .type-tag {
    font-size: 10px; padding: 2px 6px;
    background: var(--bg3); border: 1px solid var(--border);
    border-radius: 2px; color: var(--text-dim); white-space: nowrap;
  }
.empty-row td { color: var(--text-dim); text-align: center; padding: 40px; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; }
  .loading-row td { text-align: center; padding: 40px; }
  .row-actions { display: flex; gap: 6px; }
</style>
