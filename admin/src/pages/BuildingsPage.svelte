<script lang="ts">
  import { i18n } from '../lib/i18n.svelte.ts';
  import { apiFetch, safeJson } from '../lib/api.ts';
  import { toast } from '../lib/toast.svelte.ts';
  import ConfirmDialog from '../dialogs/ConfirmDialog.svelte';
  import BuildingModal from '../dialogs/BuildingModal.svelte';
  import BuildingsSearchBar from './BuildingsSearchBar.svelte';
  import BuildingsTable from './BuildingsTable.svelte';
  import Pagination from './Pagination.svelte';
  import PageHeader from '../components/ui/PageHeader.svelte';
  import type { Building } from '../lib/types.ts';

  const PAGE_LIMIT = 20;

  let buildings    = $state<Building[]>([]);
  let totalItems   = $state(0);
  let currentPage  = $state(1);
  let loading      = $state(false);

  let searchQ          = $state('');
  let filterActiveOnly = $state(false);

  const totalPages = $derived(Math.ceil(totalItems / PAGE_LIMIT) || 1);
  const pageFrom   = $derived(totalItems === 0 ? 0 : (currentPage - 1) * PAGE_LIMIT + 1);
  const pageTo     = $derived(Math.min(currentPage * PAGE_LIMIT, totalItems));

  let confirmOpen       = $state(false);
  let pendingDeleteId   = $state<string | null>(null);
  let pendingDeleteName = $state('');
  let modalOpen         = $state(false);
  let editingId         = $state<string | null>(null);

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  async function fetchBuildings(page?: number) {
    if (page !== undefined) currentPage = page;
    loading = true;
    const params = new URLSearchParams({ page: String(currentPage), limit: String(PAGE_LIMIT) });
    if (searchQ.trim()) params.set('q', searchQ.trim());
    if (filterActiveOnly) params.set('active', 'true');
    try {
      const res = await apiFetch('/admin/api/buildings?' + params);
      if (res.status === 401) return;
      const data = await safeJson<{ buildings: Building[]; total: number }>(res);
      buildings  = data.buildings;
      totalItems = data.total;
    } catch {
      toast.show(i18n.t.errGeneric, true);
    } finally {
      loading = false;
    }
  }

  function debounceSearch() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fetchBuildings(1), 400);
  }

  function resetSearch() {
    searchQ = ''; filterActiveOnly = false;
    fetchBuildings(1);
  }

  function goPage(dir: number) {
    const next = currentPage + dir;
    if (next < 1 || next > totalPages) return;
    currentPage = next;
    fetchBuildings();
  }

  function openDelete(id: string, name: string) {
    pendingDeleteId = id; pendingDeleteName = name; confirmOpen = true;
  }

  function closeConfirm() {
    confirmOpen = false; pendingDeleteId = null; pendingDeleteName = '';
  }

  async function doDelete() {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    closeConfirm();
    try {
      const res = await apiFetch('/admin/api/buildings/' + id, { method: 'DELETE' });
      if (res.status === 401) return;
      if (!res.ok) { toast.show(i18n.t.errGeneric, true); return; }
      toast.show(i18n.t.deletedBuildingOk);
      fetchBuildings();
    } catch {
      toast.show(i18n.t.errGeneric, true);
    }
  }

  fetchBuildings();
</script>

<div class="page">
  <PageHeader title={i18n.t.buildingsTitle} newLabel={i18n.t.createBuilding}
    onNew={() => { editingId = null; modalOpen = true; }} />

  <BuildingsSearchBar
    bind:searchQ bind:filterActiveOnly
    onSearch={fetchBuildings}
    onDebounce={debounceSearch}
    onReset={resetSearch}
  />

  <BuildingsTable
    {buildings} {loading}
    onEdit={(id) => { editingId = id; modalOpen = true; }}
    onDelete={openDelete}
  />

  <Pagination
    {currentPage} {totalPages} total={totalItems} {pageFrom} {pageTo}
    onPage={goPage}
  />
</div>

<ConfirmDialog
  open={confirmOpen}
  title={i18n.t.confirmDeleteBuildingTitle}
  body={i18n.t.confirmDeleteBuildingBody(pendingDeleteName)}
  onconfirm={doDelete}
  oncancel={closeConfirm}
/>

<BuildingModal
  open={modalOpen}
  buildingId={editingId}
  onsaved={() => fetchBuildings()}
  onclose={() => { modalOpen = false; }}
/>

<style>
  .page { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
</style>
