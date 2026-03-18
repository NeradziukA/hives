<script lang="ts">
  import { i18n } from '../lib/i18n.svelte.ts';
  import { apiFetch, safeJson } from '../lib/api.ts';
  import { toast } from '../lib/toast.svelte.ts';
  import ConfirmDialog from '../dialogs/ConfirmDialog.svelte';
  import PatrolModal from '../dialogs/PatrolModal.svelte';
  import PatrolsSearchBar from './PatrolsSearchBar.svelte';
  import PatrolsTable from './PatrolsTable.svelte';
  import Pagination from './Pagination.svelte';
  import PageHeader from '../components/ui/PageHeader.svelte';
  import type { NpcPatrol, PatrolListResponse } from '../lib/types.ts';

  const PAGE_LIMIT = 20;

  let patrols     = $state<NpcPatrol[]>([]);
  let totalItems  = $state(0);
  let currentPage = $state(1);
  let loading     = $state(false);

  let filterActiveOnly = $state(false);

  const totalPages = $derived(Math.ceil(totalItems / PAGE_LIMIT) || 1);
  const pageFrom   = $derived(totalItems === 0 ? 0 : (currentPage - 1) * PAGE_LIMIT + 1);
  const pageTo     = $derived(Math.min(currentPage * PAGE_LIMIT, totalItems));

  let confirmOpen       = $state(false);
  let pendingDeleteId   = $state<string | null>(null);
  let pendingDeleteName = $state('');
  let modalOpen         = $state(false);
  let editingId         = $state<string | null>(null);

  async function fetchPatrols(page?: number) {
    if (page !== undefined) currentPage = page;
    loading = true;
    const params = new URLSearchParams({ page: String(currentPage), limit: String(PAGE_LIMIT) });
    if (filterActiveOnly) params.set('active', 'true');
    try {
      const res = await apiFetch('/admin/api/patrols?' + params);
      if (res.status === 401) return;
      const data = await safeJson<PatrolListResponse>(res);
      patrols    = data.patrols;
      totalItems = data.total;
    } catch {
      toast.show(i18n.t.errGeneric, true);
    } finally {
      loading = false;
    }
  }

  function resetSearch() {
    filterActiveOnly = false;
    fetchPatrols(1);
  }

  function goPage(dir: number) {
    const next = currentPage + dir;
    if (next < 1 || next > totalPages) return;
    currentPage = next;
    fetchPatrols();
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
      const res = await apiFetch('/admin/api/patrols/' + id, { method: 'DELETE' });
      if (res.status === 401) return;
      if (!res.ok) { toast.show(i18n.t.errGeneric, true); return; }
      toast.show(i18n.t.deletedPatrolOk);
      fetchPatrols();
    } catch {
      toast.show(i18n.t.errGeneric, true);
    }
  }

  fetchPatrols();
</script>

<div class="page">
  <PageHeader title={i18n.t.patrolsTitle} newLabel={i18n.t.createPatrol}
    onNew={() => { editingId = null; modalOpen = true; }} />

  <PatrolsSearchBar
    bind:filterActiveOnly
    onSearch={fetchPatrols}
    onReset={resetSearch}
  />

  <PatrolsTable
    {patrols} {loading}
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
  title={i18n.t.confirmDeletePatrolTitle}
  body={i18n.t.confirmDeletePatrolBody(pendingDeleteName)}
  onconfirm={doDelete}
  oncancel={closeConfirm}
/>

<PatrolModal
  open={modalOpen}
  patrolId={editingId}
  onsaved={() => fetchPatrols()}
  onclose={() => { modalOpen = false; }}
/>

<style>
  .page { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
</style>
