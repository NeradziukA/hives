<script lang="ts">
  import { i18n } from '../lib/i18n.svelte.ts';
  import { apiFetch, safeJson } from '../lib/api.ts';
  import { toast } from '../lib/toast.svelte.ts';
  import Spinner from '../components/ui/Spinner.svelte';
  import type { Player } from '../lib/types.ts';
  import PlayerFormBase from './PlayerFormBase.svelte';
  import PlayerFormAttributes from './PlayerFormAttributes.svelte';
  import PlayerFormSkills from './PlayerFormSkills.svelte';
  import { FORM_DEFAULTS, populateForm, type PlayerFormState } from './playerFormState.svelte.ts';

  interface Props {
    open: boolean;
    playerId: string | null;
    onsaved: () => void;
    onclose: () => void;
  }

  const { open, playerId, onsaved, onclose }: Props = $props();

  let loadingPlayer = $state(false);
  let saving        = $state(false);
  let form          = $state<PlayerFormState>({ ...FORM_DEFAULTS });

  const isEdit = $derived(playerId !== null);
  const title  = $derived(isEdit ? i18n.t.modalEditTitle : i18n.t.modalCreateTitle);

  $effect(() => {
    if (open) {
      if (playerId) loadPlayer(playerId);
      else form = { ...FORM_DEFAULTS };
    }
  });

  async function loadPlayer(id: string) {
    loadingPlayer = true;
    try {
      const res = await apiFetch('/admin/api/users/' + id);
      if (res.status === 401) return;
      if (!res.ok) { onclose(); toast.show(i18n.t.errGeneric, true); return; }
      const data = await safeJson<Player>(res);
      populateForm(form, data);
    } catch {
      onclose();
      toast.show(i18n.t.errGeneric, true);
    } finally {
      loadingPlayer = false;
    }
  }

  async function save() {
    if (!isEdit && (!form.username.trim() || !form.password)) {
      toast.show(i18n.t.errRequired, true);
      return;
    }

    const payload: Record<string, unknown> = {
      ...form,
      role:    form.role || null,
      isAlive: form.isAlive === 'true',
    };
    if (!form.password) delete payload.password;

    saving = true;
    try {
      const url    = isEdit ? '/admin/api/users/' + playerId : '/admin/api/users';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) return;
      if (res.status === 409) { toast.show(i18n.t.errExists, true); return; }
      if (!res.ok)            { toast.show(i18n.t.errGeneric, true); return; }
      toast.show(isEdit ? i18n.t.savedOk : i18n.t.createdOk);
      onsaved();
      onclose();
    } catch {
      toast.show(i18n.t.errGeneric, true);
    } finally {
      saving = false;
    }
  }
</script>

{#if open}
  <div class="overlay">
    <div class="modal-box">
      <div class="modal-header">
        <p class="modal-title">{title}</p>
        <button class="btn icon-btn" onclick={onclose} aria-label="Close">✕</button>
      </div>

      <div class="modal-body">
        {#if loadingPlayer}
          <div class="loading-center"><Spinner /></div>
        {:else}
          <div class="form-grid">
            <PlayerFormBase {form} {isEdit} />
            <PlayerFormAttributes {form} />
            <PlayerFormSkills {form} />
          </div>
        {/if}
      </div>

      <div class="modal-footer">
        <button class="btn secondary" onclick={onclose}>{i18n.t.cancel}</button>
        <button class="btn" onclick={save} disabled={saving || loadingPlayer}>
          {i18n.t.save}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.85);
    display: flex; align-items: center; justify-content: center;
    z-index: 100;
  }
  .modal-box {
    width: 580px; max-height: 90vh;
    border: 1px solid var(--green-dim);
    background: var(--bg3);
    display: flex; flex-direction: column;
    overflow: hidden;
  }
  .modal-header {
    padding: 20px 24px 16px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center;
  }
  .modal-title {
    font-size: 13px; font-weight: 700;
    letter-spacing: 0.15em; text-transform: uppercase;
    color: var(--green); flex: 1; margin: 0;
  }
  .modal-body { padding: 20px 24px; overflow-y: auto; flex: 1; }
  .modal-footer {
    padding: 16px 24px;
    border-top: 1px solid var(--border);
    display: flex; gap: 10px; justify-content: flex-end;
  }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .loading-center {
    display: flex; align-items: center; justify-content: center;
    padding: 40px;
  }
</style>
