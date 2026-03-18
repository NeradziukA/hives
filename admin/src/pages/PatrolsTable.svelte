<script lang="ts">
  import { i18n } from '../lib/i18n.svelte.ts';
  import Badge from '../components/ui/Badge.svelte';
  import Spinner from '../components/ui/Spinner.svelte';
  import type { NpcPatrol } from '../lib/types.ts';

  let {
    patrols, loading, onEdit, onDelete,
  }: {
    patrols:  NpcPatrol[];
    loading:  boolean;
    onEdit:   (id: string) => void;
    onDelete: (id: string, name: string) => void;
  } = $props();
</script>

<div class="table-wrap">
  <table>
    <thead>
      <tr>
        <th>{i18n.t.colNpc}</th>
        <th>{i18n.t.colSpeed}</th>
        <th>{i18n.t.colWaypoints}</th>
        <th>{i18n.t.colPatrolActive}</th>
        <th>{i18n.t.colCreated}</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {#if loading}
        <tr class="loading-row"><td colspan="6"><Spinner /></td></tr>
      {:else if patrols.length === 0}
        <tr class="empty-row"><td colspan="6">{i18n.t.noPatrols}</td></tr>
      {:else}
        {#each patrols as p (p.id)}
          <tr>
            <td>{p.npcUsername ?? p.npcId ?? '—'}</td>
            <td class="mono">{p.speed}</td>
            <td class="mono">{p.waypoints.length}</td>
            <td><Badge mode="active" alive={p.isActive} /></td>
            <td class="mono">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}</td>
            <td>
              <div class="row-actions">
                <button class="btn small secondary" onclick={() => onEdit(p.id)}>
                  {i18n.t.edit}
                </button>
                <button class="btn small danger" onclick={() => onDelete(p.id, p.npcUsername ?? p.id)}>
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
  .empty-row td { color: var(--text-dim); text-align: center; padding: 40px; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; }
  .loading-row td { text-align: center; padding: 40px; }
  .row-actions { display: flex; gap: 6px; }
</style>
