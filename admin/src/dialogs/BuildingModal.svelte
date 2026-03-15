<script lang="ts">
  import { i18n } from '../lib/i18n.svelte.ts';
  import { apiFetch, safeJson } from '../lib/api.ts';
  import { toast } from '../lib/toast.svelte.ts';
  import { Faction, BuildingType } from '../lib/types.ts';
  import type { Building } from '../lib/types.ts';

  interface Props {
    open: boolean;
    buildingId: string | null;
    onsaved: () => void;
    onclose: () => void;
  }

  const { open, buildingId, onsaved, onclose }: Props = $props();

  const DEFAULTS = { type: BuildingType.INCUBATOR, name: '', lat: '', lng: '', revealRadius: '10', faction: '', active: true };

  let saving = $state(false);
  let form   = $state({ ...DEFAULTS });
  let err    = $state('');

  const isEdit = $derived(buildingId !== null);
  const title  = $derived(isEdit ? i18n.t.modalEditBuildingTitle : i18n.t.modalCreateBuildingTitle);

  $effect(() => {
    if (open) {
      if (buildingId) loadBuilding(buildingId);
      else { form = { ...DEFAULTS }; err = ''; }
    }
  });

  async function loadBuilding(id: string) {
    const res = await apiFetch('/admin/api/buildings');
    if (!res.ok) return;
    const data = await safeJson<{ buildings: Building[] }>(res);
    const b = data.buildings.find(x => x.id === id);
    if (!b) return;
    form = {
      type: b.type,
      name: b.name ?? '',
      lat: String(b.lat),
      lng: String(b.lng),
      revealRadius: String(b.revealRadius),
      faction: b.faction ?? '',
      active: b.active,
    };
    err = '';
  }

  async function save() {
    if (!form.type || !form.lat || !form.lng || !form.revealRadius) {
      err = i18n.t.errRequired; return;
    }
    saving = true; err = '';
    try {
      const body = {
        type: form.type,
        name: form.name.trim() || null,
        lat: parseFloat(form.lat),
        lng: parseFloat(form.lng),
        revealRadius: parseInt(form.revealRadius),
        faction: form.faction.trim() || null,
        active: form.active,
      };
      const res = isEdit
        ? await apiFetch(`/admin/api/buildings/${buildingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        : await apiFetch('/admin/api/buildings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

      if (!res.ok) { toast.show(i18n.t.errGeneric, true); return; }
      toast.show(isEdit ? i18n.t.savedOk : i18n.t.createdBuildingOk);
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
          <label for="b-type">{i18n.t.fieldType}</label>
          <select id="b-type" bind:value={form.type}>
            {#each Object.values(BuildingType) as t}<option value={t}>{i18n.t.buildingTypes[t]}</option>{/each}
          </select>
        </div>
        <div class="field">
          <label for="b-name">{i18n.t.colName}</label>
          <input id="b-name" type="text" bind:value={form.name} />
        </div>
        <div class="row">
          <div class="field">
            <label for="b-lat">{i18n.t.fieldLat}</label>
            <input id="b-lat" type="number" step="any" bind:value={form.lat} />
          </div>
          <div class="field">
            <label for="b-lng">{i18n.t.fieldLng}</label>
            <input id="b-lng" type="number" step="any" bind:value={form.lng} />
          </div>
        </div>
        <div class="row">
          <div class="field">
            <label for="b-radius">{i18n.t.fieldRevealRadius}</label>
            <input id="b-radius" type="number" min="0" bind:value={form.revealRadius} />
          </div>
          <div class="field">
            <label for="b-faction">{i18n.t.fieldFaction}</label>
            <select id="b-faction" bind:value={form.faction}>
              <option value="">—</option>
              {#each Object.values(Faction) as f}<option value={f}>{i18n.t.factions[f]}</option>{/each}
            </select>
          </div>
        </div>
        <div class="field">
          <label for="b-active">{i18n.t.fieldActive}</label>
          <select id="b-active" bind:value={form.active}>
            <option value={true}>{i18n.t.optionYes}</option>
            <option value={false}>{i18n.t.optionNo}</option>
          </select>
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
    width: 420px; max-width: calc(100vw - 32px);
    background: var(--bg3); border: 1px solid var(--border);
    display: flex; flex-direction: column;
  }
  .modal-header {
    padding: 16px 20px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center;
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
  .modal-body { padding: 20px; display: flex; flex-direction: column; gap: 12px; }
  .field { display: flex; flex-direction: column; gap: 4px; flex: 1; }
  .field label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-dim); }
.row { display: flex; gap: 12px; }
  .err { font-size: 11px; color: var(--red); margin: 0; }
  .modal-footer {
    padding: 16px 20px; border-top: 1px solid var(--border);
    display: flex; justify-content: flex-end; gap: 8px;
  }
</style>
