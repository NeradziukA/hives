<script lang="ts">
  import { i18n } from '../lib/i18n.svelte.ts';
  import { apiFetch, safeJson } from '../lib/api.ts';
  import { toast } from '../lib/toast.svelte.ts';
  import type { NpcPatrol, Waypoint, Player } from '../lib/types.ts';
  import { PlayerRole } from '../lib/types.ts';

  interface Props {
    open:      boolean;
    patrolId:  string | null;
    onsaved:   () => void;
    onclose:   () => void;
  }

  const { open, patrolId, onsaved, onclose }: Props = $props();

  type WaypointForm = { lat: string; lng: string; order: string };

  const DEFAULTS = { npcId: '', speed: '1.4', isActive: true };

  let saving    = $state(false);
  let form      = $state({ ...DEFAULTS });
  let waypoints = $state<WaypointForm[]>([]);
  let err       = $state('');
  let npcs      = $state<Player[]>([]);

  const isEdit = $derived(patrolId !== null);
  const title  = $derived(isEdit ? i18n.t.modalEditPatrolTitle : i18n.t.modalCreatePatrolTitle);

  $effect(() => {
    if (open) {
      loadNpcs();
      if (patrolId) loadPatrol(patrolId);
      else { form = { ...DEFAULTS }; waypoints = []; err = ''; }
    }
  });

  async function loadNpcs() {
    try {
      const res = await apiFetch('/admin/api/users?limit=100');
      if (!res.ok) return;
      const data = await safeJson<{ users: Player[] }>(res);
      npcs = data.users.filter(u => u.role !== null);
    } catch {
      // silently ignore
    }
  }

  async function loadPatrol(id: string) {
    try {
      const res = await apiFetch('/admin/api/patrols/' + id);
      if (!res.ok) return;
      const p = await safeJson<NpcPatrol>(res);
      form = {
        npcId:    p.npcId ?? '',
        speed:    String(p.speed),
        isActive: p.isActive,
      };
      waypoints = p.waypoints
        .sort((a, b) => a.order - b.order)
        .map(w => ({ lat: String(w.lat), lng: String(w.lng), order: String(w.order) }));
      err = '';
    } catch {
      // silently ignore
    }
  }

  function addWaypoint() {
    const nextOrder = waypoints.length > 0
      ? Math.max(...waypoints.map(w => parseInt(w.order) || 0)) + 1
      : 1;
    waypoints = [...waypoints, { lat: '', lng: '', order: String(nextOrder) }];
  }

  function removeWaypoint(index: number) {
    waypoints = waypoints.filter((_, i) => i !== index);
  }

  async function save() {
    if (!form.npcId || !form.speed) {
      err = i18n.t.errPatrolRequired; return;
    }
    if (waypoints.length === 0) {
      err = i18n.t.errNoWaypoints; return;
    }

    const parsedWaypoints: Waypoint[] = waypoints.map(w => ({
      lat:   parseFloat(w.lat),
      lng:   parseFloat(w.lng),
      order: parseInt(w.order),
    }));

    saving = true; err = '';
    try {
      const body = {
        npcId:     form.npcId,
        speed:     parseFloat(form.speed),
        waypoints: parsedWaypoints,
        isActive:  form.isActive,
      };
      const res = isEdit
        ? await apiFetch(`/admin/api/patrols/${patrolId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        : await apiFetch('/admin/api/patrols', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

      if (!res.ok) { toast.show(i18n.t.errGeneric, true); return; }
      toast.show(isEdit ? i18n.t.savedOk : i18n.t.createdPatrolOk);
      onsaved();
      onclose();
    } catch {
      toast.show(i18n.t.errGeneric, true);
    } finally {
      saving = false;
    }
  }

  function onOverlayClick(e: MouseEvent) {
    if (e.target === e.currentTarget) onclose();
  }
</script>

{#if open}
  <div class="overlay" role="presentation" onclick={onOverlayClick} onkeydown={() => {}}>
    <div class="modal" role="dialog" aria-modal="true" aria-label={title}>
      <div class="modal-header">
        <span class="modal-title">{title}</span>
        <button class="close-btn" onclick={onclose} aria-label="Close">✕</button>
      </div>

      <div class="modal-body">
        <div class="field">
          <label for="p-npc">{i18n.t.fieldNpcId}</label>
          <select id="p-npc" bind:value={form.npcId}>
            <option value="">—</option>
            {#each npcs as npc (npc.id)}
              <option value={npc.id}>{npc.username} ({npc.role ?? '—'})</option>
            {/each}
          </select>
        </div>

        <div class="row">
          <div class="field">
            <label for="p-speed">{i18n.t.fieldSpeed}</label>
            <input id="p-speed" type="number" step="0.1" min="0.1" bind:value={form.speed} />
          </div>
          <div class="field">
            <label for="p-active">{i18n.t.fieldPatrolActive}</label>
            <select id="p-active" bind:value={form.isActive}>
              <option value={true}>{i18n.t.optionYes}</option>
              <option value={false}>{i18n.t.optionNo}</option>
            </select>
          </div>
        </div>

        <div class="waypoints-section">
          <div class="waypoints-header">
            <span class="section-label">{i18n.t.fieldWaypoints}</span>
            <button class="btn small" onclick={addWaypoint}>{i18n.t.addWaypoint}</button>
          </div>
          {#if waypoints.length > 0}
            <div class="waypoints-list">
              {#each waypoints as wp, i (i)}
                <div class="waypoint-row">
                  <span class="wp-index">{i + 1}</span>
                  <div class="field">
                    <label for="wp-lat-{i}">{i18n.t.fieldLat}</label>
                    <input id="wp-lat-{i}" type="number" step="any" bind:value={wp.lat} placeholder="lat" />
                  </div>
                  <div class="field">
                    <label for="wp-lng-{i}">{i18n.t.fieldLng}</label>
                    <input id="wp-lng-{i}" type="number" step="any" bind:value={wp.lng} placeholder="lng" />
                  </div>
                  <div class="field wp-order">
                    <label for="wp-order-{i}">{i18n.t.colOrder}</label>
                    <input id="wp-order-{i}" type="number" min="1" bind:value={wp.order} />
                  </div>
                  <button class="btn small danger wp-remove" onclick={() => removeWaypoint(i)} aria-label={i18n.t.removeWaypoint}>
                    {i18n.t.removeWaypoint}
                  </button>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        {#if err}<p class="err">{err}</p>{/if}
      </div>

      <div class="modal-footer">
        <button class="btn secondary" onclick={onclose}>{i18n.t.cancel}</button>
        <button class="btn" onclick={save} disabled={saving}>{i18n.t.save}</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.7);
    display: flex; align-items: center; justify-content: center;
    z-index: 50;
  }
  .modal {
    width: 520px; max-width: calc(100vw - 32px); max-height: calc(100dvh - 32px);
    background: var(--bg3); border: 1px solid var(--border);
    display: flex; flex-direction: column;
  }
  .modal-header {
    padding: 16px 20px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; flex-shrink: 0;
  }
  .modal-title {
    flex: 1; font-size: 12px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.12em; color: var(--text);
  }
  .close-btn {
    background: none; border: none; color: var(--text-dim);
    font-size: 14px; cursor: pointer; padding: 0 4px;
  }
  .close-btn:hover { color: var(--text); }
  .modal-body { padding: 20px; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; }
  .field { display: flex; flex-direction: column; gap: 4px; flex: 1; }
  .field label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-dim); }
  .row { display: flex; gap: 12px; }
  .err { font-size: 11px; color: var(--red); margin: 0; }
  .modal-footer {
    padding: 16px 20px; border-top: 1px solid var(--border);
    display: flex; justify-content: flex-end; gap: 8px; flex-shrink: 0;
  }
  .waypoints-section { display: flex; flex-direction: column; gap: 8px; }
  .waypoints-header {
    display: flex; align-items: center; justify-content: space-between;
  }
  .section-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-dim); }
  .waypoints-list { display: flex; flex-direction: column; gap: 6px; }
  .waypoint-row {
    display: flex; gap: 8px; align-items: flex-end;
    background: var(--bg2); padding: 8px; border: 1px solid var(--border);
  }
  .wp-index {
    font-size: 10px; color: var(--text-dim); min-width: 16px;
    align-self: flex-end; padding-bottom: 6px;
  }
  .wp-order { max-width: 72px; }
  .wp-remove { align-self: flex-end; flex-shrink: 0; }
</style>
