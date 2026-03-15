<script lang="ts">
  import { i18n } from '../lib/i18n.svelte.ts';
  import { apiFetch, safeJson } from '../lib/api.ts';
  import { toast } from '../lib/toast.svelte.ts';
  import ConfirmDialog from '../dialogs/ConfirmDialog.svelte';
  import PlayerModal from '../dialogs/PlayerModal.svelte';
  import PlayersSearchBar from './PlayersSearchBar.svelte';
  import PlayersTable from './PlayersTable.svelte';
  import PlayersPagination from './PlayersPagination.svelte';
  import type { Player } from '../lib/types.ts';

  const PAGE_LIMIT = 20;

  let players    = $state<Player[]>([]);
  let totalUsers = $state(0);
  let currentPage = $state(1);
  let loading    = $state(false);

  let searchQ          = $state('');
  let searchLat        = $state('');
  let searchLng        = $state('');
  let searchRadius     = $state('');
  let filterOnlineOnly = $state(true);

  let confirmOpen      = $state(false);
  let pendingDeleteId  = $state<string | null>(null);
  let pendingDeleteName = $state('');
  let modalOpen        = $state(false);
  let editingPlayerId  = $state<string | null>(null);

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const totalPages = $derived(Math.ceil(totalUsers / PAGE_LIMIT) || 1);
  const pageFrom   = $derived(totalUsers === 0 ? 0 : (currentPage - 1) * PAGE_LIMIT + 1);
  const pageTo     = $derived(Math.min(currentPage * PAGE_LIMIT, totalUsers));

  async function fetchUsers(page?: number) {
    if (page !== undefined) currentPage = page;
    loading = true;
    const params = new URLSearchParams({ page: String(currentPage), limit: String(PAGE_LIMIT) });
    if (searchQ.trim())  params.set('q', searchQ.trim());
    if (searchLat)       params.set('lat', searchLat);
    if (searchLng)       params.set('lng', searchLng);
    if (searchRadius)    params.set('radius', searchRadius);
    if (filterOnlineOnly) params.set('online', 'true');
    try {
      const res = await apiFetch('/admin/api/users?' + params);
      if (res.status === 401) return;
      const data = await safeJson<{ users: Player[]; total: number }>(res);
      players = data.users;
      totalUsers = data.total;
    } catch {
      toast.show(i18n.t.errGeneric, true);
    } finally {
      loading = false;
    }
  }

  function debounceSearch() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fetchUsers(), 400);
  }

  function resetSearch() {
    searchQ = ''; searchLat = ''; searchLng = ''; searchRadius = '';
    filterOnlineOnly = true; currentPage = 1;
    fetchUsers();
  }

  function goPage(dir: number) {
    const next = currentPage + dir;
    if (next < 1 || next > totalPages) return;
    currentPage = next;
    fetchUsers();
  }

  function openDelete(id: string, username: string) {
    pendingDeleteId = id; pendingDeleteName = username; confirmOpen = true;
  }

  function closeConfirm() {
    confirmOpen = false; pendingDeleteId = null; pendingDeleteName = '';
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

  fetchUsers();
</script>

<div class="page">
  <div class="page-header">
    <p class="page-title">{i18n.t.usersTitle}</p>
    <button class="btn small" onclick={() => { editingPlayerId = null; modalOpen = true; }}>
      {i18n.t.createUser}
    </button>
  </div>

  <PlayersSearchBar
    bind:searchQ bind:searchLat bind:searchLng bind:searchRadius bind:filterOnlineOnly
    onSearch={() => fetchUsers(1)}
    onDebounce={debounceSearch}
    onReset={resetSearch}
  />

  <PlayersTable
    {players} {loading}
    onEdit={(id) => { editingPlayerId = id; modalOpen = true; }}
    onDelete={openDelete}
  />

  <PlayersPagination
    {currentPage} {totalPages} {totalUsers} {pageFrom} {pageTo}
    onPage={goPage}
  />
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
  onsaved={() => fetchUsers()}
  onclose={() => { modalOpen = false; }}
/>

<style>
  .page { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
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
