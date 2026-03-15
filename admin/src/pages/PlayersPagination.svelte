<script lang="ts">
  let {
    currentPage, totalPages, totalUsers, pageFrom, pageTo, onPage,
  }: {
    currentPage: number;
    totalPages:  number;
    totalUsers:  number;
    pageFrom:    number;
    pageTo:      number;
    onPage:      (dir: number) => void;
  } = $props();

  import { i18n } from '../lib/i18n.svelte.ts';
</script>

<div class="pagination">
  <span class="page-info">
    {totalUsers > 0 ? i18n.t.pageInfo(pageFrom, pageTo, totalUsers) : ''}
  </span>
  <div class="page-controls">
    <button class="btn small icon-btn" disabled={currentPage <= 1}
      onclick={() => onPage(-1)} aria-label="Previous page">‹</button>
    <span class="page-num">{currentPage} / {totalPages}</span>
    <button class="btn small icon-btn" disabled={currentPage >= totalPages}
      onclick={() => onPage(1)} aria-label="Next page">›</button>
  </div>
</div>

<style>
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
