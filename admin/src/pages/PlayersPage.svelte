<script lang="ts">
  import { i18n } from '../lib/i18n.svelte.ts';
  import { apiFetch } from '../lib/api.ts';
  import { toast } from '../lib/toast.svelte.ts';
  import Badge from '../components/ui/Badge.svelte';
  import Spinner from '../components/ui/Spinner.svelte';
  import ConfirmDialog from '../dialogs/ConfirmDialog.svelte';
  import PlayerModal from '../dialogs/PlayerModal.svelte';
  import type { Player } from '../lib/types.ts';

  const PAGE_LIMIT = 20;

  let players = $state<Player[]>([]);
  let totalUsers = $state(0);
  let currentPage = $state(1);
  let loading = $state(false);

  // Search params
  let searchQ = $state('');
  let searchLat = $state('');
  let searchLng = $state('');
  let searchRadius = $state('');
  let filterOnlineOnly = $state(true);

  // Delete confirm
  let confirmOpen = $state(false);
  let pendingDeleteId = $state<string | null>(null);
  let pendingDeleteName = $state('');

  // Player modal
  let modalOpen = $state(false);
  let editingPlayerId = $state<string | null>(null);

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  function debounceSearch() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fetchUsers(), 400);
  }

  async function fetchUsers(page?: number) {
    if (page !== undefined) currentPage = page;
    loading = true;
    const params = new URLSearchParams({ page: String(currentPage), limit: String(PAGE_LIMIT) });
    if (searchQ.trim()) params.set('q', searchQ.trim());
    if (searchLat) params.set('lat', searchLat);
    if (searchLng) params.set('lng', searchLng);
    if (searchRadius) params.set('radius', searchRadius);
    if (filterOnlineOnly) params.set('online', 'true');

    try {
      const res = await apiFetch('/admin/api/users?' + params);
      if (res.status === 401) return;
      const data = await res.json();
      players = data.users;
      totalUsers = data.total;
    } catch {
      toast.show(i18n.t.errGeneric, true);
    } finally {
      loading = false;
    }
  }

  function resetSearch() {
    searchQ = '';
    searchLat = '';
    searchLng = '';
    searchRadius = '';
    filterOnlineOnly = true;
    currentPage = 1;
    fetchUsers();
  }

  function goPage(dir: number) {
    const totalPages = Math.ceil(totalUsers / PAGE_LIMIT) || 1;
    const next = currentPage + dir;
    if (next < 1 || next > totalPages) return;
    currentPage = next;
    fetchUsers();
  }

  function openCreate() {
    editingPlayerId = null;
    modalOpen = true;
  }

  function openEdit(id: string) {
    editingPlayerId = id;
    modalOpen = true;
  }

  function openDelete(id: string, username: string) {
    pendingDeleteId = id;
    pendingDeleteName = username;
    confirmOpen = true;
  }

  function closeConfirm() {
    confirmOpen = false;
    pendingDeleteId = null;
    pendingDeleteName = '';
  }

  async function doDelete() {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    closeConfirm();
    try {
      const res = await apiFetch('/admin/api/users/' + id, { method: 'DELETE' });
      if (res.status === 401) return;
      if (!res.ok) { toast.show(i18n.t.errGeneric, true); return; }
      toast.show(i18n.t.deletedOk);
      fetchUsers();
    } catch {
      toast.show(i18n.t.errGeneric, true);
    }
  }

  function onModalSaved() {
    fetchUsers();
  }

  function fmtCoords(lat: number | null, lng: number | null): string {
    if (lat == null || lng == null) return '—';
    return `${parseFloat(String(lat)).toFixed(4)}, ${parseFloat(String(lng)).toFixed(4)}`;
  }

  function fmtDate(s: string | null): string {
    if (!s) return '—';
    const d = new Date(s);
    return d.toLocaleDateString(i18n.lang === 'ru' ? 'ru-RU' : 'en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  const totalPages = $derived(Math.ceil(totalUsers / PAGE_LIMIT) || 1);
  const pageFrom = $derived(totalUsers === 0 ? 0 : (currentPage - 1) * PAGE_LIMIT + 1);
  const pageTo = $derived(Math.min(currentPage * PAGE_LIMIT, totalUsers));

  // Initial load
  fetchUsers();
</script>

<div class="page">
  <!-- Header -->
  <div class="page-header">
    <p class="page-title">{i18n.t.usersTitle}</p>
    <button class="btn small" onclick={openCreate}>{i18n.t.createUser}</button>
  </div>

  <!-- Search bar -->
  <div class="search-bar">
    <div class="search-group">
      <span class="search-label">{i18n.t.searchName}</span>
      <input
        type="text"
        bind:value={searchQ}
        oninput={debounceSearch}
        onkeydown={(e) => e.key === 'Enter' && fetchUsers()}
      />
    </div>
    <div class="search-group narrow">
      <span class="search-label">{i18n.t.searchLat}</span>
      <input
        type="number"
        step="any"
        bind:value={searchLat}
        onkeydown={(e) => e.key === 'Enter' && fetchUsers()}
      />
    </div>
    <div class="search-group narrow">
      <span class="search-label">{i18n.t.searchLng}</span>
      <input
        type="number"
        step="any"
        bind:value={searchLng}
        onkeydown={(e) => e.key === 'Enter' && fetchUsers()}
      />
    </div>
    <div class="search-group narrow">
      <span class="search-label">{i18n.t.searchRad}</span>
      <input
        type="number"
        step="any"
        min="0"
        bind:value={searchRadius}
        onkeydown={(e) => e.key === 'Enter' && fetchUsers()}
      />
    </div>
    <div class="search-group toggle-group">
      <span class="search-label">{i18n.t.filterOnlineOnly}</span>
      <button
        class="toggle"
        class:active={filterOnlineOnly}
        onclick={() => { filterOnlineOnly = !filterOnlineOnly; fetchUsers(1); }}
        aria-pressed={filterOnlineOnly}
      >
        <span class="toggle-thumb"></span>
      </button>
    </div>
    <div class="search-actions">
      <button class="btn small" onclick={() => fetchUsers()}>{i18n.t.search}</button>
      <button class="btn small secondary" onclick={resetSearch}>{i18n.t.reset}</button>
    </div>
  </div>

  <!-- Table -->
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
          <tr class="loading-row">
            <td colspan="8"><Spinner /></td>
          </tr>
        {:else if players.length === 0}
          <tr class="empty-row">
            <td colspan="8">{i18n.t.noData}</td>
          </tr>
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
                  <button class="btn small secondary" onclick={() => openEdit(player.id)}>
                    {i18n.t.edit}
                  </button>
                  <button class="btn small danger" onclick={() => openDelete(player.id, player.username)}>
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

  <!-- Pagination -->
  <div class="pagination">
    <span class="page-info">
      {totalUsers > 0 ? i18n.t.pageInfo(pageFrom, pageTo, totalUsers) : ''}
    </span>
    <div class="page-controls">
      <button class="btn small icon-btn" disabled={currentPage <= 1} onclick={() => goPage(-1)}>‹</button>
      <span class="page-num">{currentPage} / {totalPages}</span>
      <button class="btn small icon-btn" disabled={currentPage >= totalPages} onclick={() => goPage(1)}>›</button>
    </div>
  </div>
</div>

<ConfirmDialog
  open={confirmOpen}
  title={i18n.t.confirmDeleteTitle}
  body={i18n.t.confirmDeleteBody(pendingDeleteName)}
  onconfirm={doDelete}
  oncancel={closeConfirm}
/>

<PlayerModal
  open={modalOpen}
  playerId={editingPlayerId}
  onsaved={onModalSaved}
  onclose={() => { modalOpen = false; }}
/>

<style>
  .page {
    flex: 1; display: flex; flex-direction: column; overflow: hidden;
  }
  .page-header {
    padding: 20px 28px 16px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 16px;
  }
  .page-title {
    font-size: 14px; font-weight: 700;
    letter-spacing: 0.15em; text-transform: uppercase;
    color: var(--text-bright); margin: 0; flex: 1;
  }
  .search-bar {
    padding: 12px 28px;
    border-bottom: 1px solid var(--border);
    display: flex; gap: 8px; align-items: flex-end;
    flex-wrap: wrap; background: var(--bg2);
  }
  .search-bar .toggle-group { margin-left: auto; }
  .search-group { display: flex; flex-direction: column; gap: 4px; }
  .search-label { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-dim); }
  .search-group input { width: 180px; }
  .search-group.narrow input { width: 110px; }
  .toggle-group { justify-content: flex-start; }
  .toggle {
    width: 36px; height: 18px;
    background: var(--border);
    border: 1px solid var(--border);
    border-radius: 0;
    padding: 0; cursor: pointer;
    position: relative;
    transition: background 0.15s, border-color 0.15s;
    flex-shrink: 0;
  }
  .toggle.active {
    background: rgba(68,204,255,0.15);
    border-color: #4cf;
  }
  .toggle-thumb {
    position: absolute;
    top: 2px; left: 2px;
    width: 12px; height: 12px;
    background: var(--text-dim);
    transition: left 0.15s, background 0.15s;
  }
  .toggle.active .toggle-thumb {
    left: 20px;
    background: #4cf;
  }
  .search-actions { display: flex; gap: 8px; align-self: flex-end; }
  .table-wrap { flex: 1; overflow-y: auto; padding: 0 28px; }
  table { width: 100%; border-collapse: collapse; margin-top: 4px; }
  thead tr { border-bottom: 1px solid var(--border); }
  th {
    padding: 10px 10px 10px 0;
    text-align: left; font-size: 10px;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--text-dim); font-weight: 500;
    white-space: nowrap;
  }
  td {
    padding: 9px 10px 9px 0;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    vertical-align: middle;
    font-size: 12px; color: var(--text);
  }
  tr:hover td { background: rgba(255,255,255,0.02); }
  .mono { font-family: var(--font); font-size: 11px; color: var(--text-dim); }
  .empty-row td {
    color: var(--text-dim); text-align: center; padding: 40px;
    font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;
  }
  .loading-row td { text-align: center; padding: 40px; }
  .row-actions { display: flex; gap: 6px; }
  .pagination {
    padding: 14px 28px;
    border-top: 1px solid var(--border);
    display: flex; align-items: center; gap: 8px;
    background: var(--bg2);
  }
  .page-info { flex: 1; font-size: 12px; color: var(--text-dim); letter-spacing: 0.05em; }
  .page-controls { display: flex; gap: 6px; align-items: center; }
  .page-num { font-size: 12px; color: var(--text); padding: 0 8px; }
</style>
