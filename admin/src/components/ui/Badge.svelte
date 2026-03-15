<script lang="ts">
  import { i18n } from '../../lib/i18n.svelte.ts';

  interface Props {
    faction?: string;
    alive?: boolean;
    mode: 'faction' | 'status';
  }

  const { faction, alive, mode }: Props = $props();
</script>

{#if mode === 'faction'}
  <span class="badge faction-{faction}">{faction || '—'}</span>
{:else}
  <span class="badge" class:alive={alive} class:dead={!alive}>
    {alive ? i18n.t.statusAlive : i18n.t.statusDead}
  </span>
{/if}

<style>
  .badge {
    display: inline-block; padding: 2px 7px;
    font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase;
    border: 1px solid; border-radius: 0;
  }
  .badge.alive { color: var(--green); border-color: var(--green-dim); background: var(--green-bg); }
  .badge.dead { color: #f84; border-color: rgba(255,136,68,0.35); background: rgba(255,136,68,0.06); }
  :global(.badge.faction-humans) { color: #5af; border-color: rgba(85,170,255,0.35); background: rgba(85,170,255,0.06); }
  :global(.badge.faction-zombies) { color: #f84; border-color: rgba(255,136,68,0.35); background: rgba(255,136,68,0.06); }
</style>
