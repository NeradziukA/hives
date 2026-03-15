<script lang="ts">
  import { i18n } from '../lib/i18n.svelte.ts';
  import Badge from '../components/ui/Badge.svelte';
  import Spinner from '../components/ui/Spinner.svelte';
  import type { Player } from '../lib/types.ts';

  let {
    players, loading, onEdit, onDelete,
  }: {
    players: Player[];
    loading: boolean;
    onEdit:   (id: string) => void;
    onDelete: (id: string, username: string) => void;
  } = $props();

  function fmtCoords(lat: number | null, lng: number | null): string {
    if (lat == null || lng == null) return '—';
    return `${parseFloat(String(lat)).toFixed(4)}, ${parseFloat(String(lng)).toFixed(4)}`;
  }

  function fmtDate(s: string | null): string {
    if (!s) return '—';
    return new Date(s).toLocaleDateString(i18n.lang === 'ru' ? 'ru-RU' : 'en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
</script>

<div class="table-wrap">
  <table>
    <thead>
      <tr>
        <th>{i18n.t.colUsername}</th>
        <th>{i18n.t.colFaction}</th>
        <th>{i18n.t.colStatus}</th>
        <th>{i18n.t.colOnline}</th>
        <th>{i18n.t.colLocation}</th>
        <th>{i18n.t.colLastSeen}</th>
        <th>{i18n.t.colCreated}</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {#if loading}
        <tr class="loading-row"><td colspan="8"><Spinner /></td></tr>
      {:else if players.length === 0}
        <tr class="empty-row"><td colspan="8">{i18n.t.noData}</td></tr>
      {:else}
        {#each players as player (player.id)}
          <tr>
            <td>
              <div>{player.username}</div>
              <div class="mono">{player.id}</div>
            </td>
            <td><Badge mode="faction" faction={player.faction} /></td>
            <td><Badge mode="status" alive={player.isAlive} /></td>
            <td><Badge mode="online" online={player.isOnline} /></td>
            <td class="mono">{fmtCoords(player.lastLat, player.lastLng)}</td>
            <td class="mono">{fmtDate(player.lastSeen)}</td>
            <td class="mono">{fmtDate(player.createdAt)}</td>
            <td>
              <div class="row-actions">
                <button class="btn small secondary" onclick={() => onEdit(player.id)}>
                  {i18n.t.edit}
                </button>
                <button class="btn small danger" onclick={() => onDelete(player.id, player.username)}>
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
