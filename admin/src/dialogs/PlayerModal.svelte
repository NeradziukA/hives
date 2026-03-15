<script lang="ts">
  import { i18n } from '../lib/i18n.svelte.ts';
  import { apiFetch } from '../lib/api.ts';
  import { toast } from '../lib/toast.svelte.ts';
  import Spinner from '../components/ui/Spinner.svelte';
  import type { Player } from '../lib/types.ts';

  interface Props {
    open: boolean;
    playerId: string | null;
    onsaved: () => void;
    onclose: () => void;
  }

  const { open, playerId, onsaved, onclose }: Props = $props();

  const UNIT_TYPES = ['HUMAN_A', 'HUMAN_B', 'ZOMBIE_A', 'ZOMBIE_B'];
  const FACTIONS = ['humans', 'zombies'];
  const ROLES = ['', 'transformation', 'boss', 'general', 'scientist', 'soldier', 'quest_master'];

  let loadingPlayer = $state(false);
  let saving = $state(false);

  // Form fields
  let username = $state('');
  let password = $state('');
  let unitType = $state('HUMAN_A');
  let faction = $state('humans');
  let role = $state('');
  let isAlive = $state('true');
  let hp = $state(100);
  let maxHp = $state(100);
  let strength = $state(10);
  let defense = $state(10);
  let agility = $state(10);
  let speed = $state(10);
  let intelligence = $state(10);
  let leadership = $state(0);
  let vision = $state(10);
  let vaccineLevel = $state(0);
  let bagSize = $state(5);
  let mutation = $state(0);
  let heavyWeapon = $state(0);
  let twoHanded = $state(0);
  let camouflage = $state(0);
  let regeneration = $state(0);
  let stench = $state(0);

  function resetForm() {
    username = '';
    password = '';
    unitType = 'HUMAN_A';
    faction = 'humans';
    role = '';
    isAlive = 'true';
    hp = 100;
    maxHp = 100;
    strength = 10;
    defense = 10;
    agility = 10;
    speed = 10;
    intelligence = 10;
    leadership = 0;
    vision = 10;
    vaccineLevel = 0;
    bagSize = 5;
    mutation = 0;
    heavyWeapon = 0;
    twoHanded = 0;
    camouflage = 0;
    regeneration = 0;
    stench = 0;
  }

  function populateForm(p: Player) {
    username = p.username ?? '';
    password = '';
    unitType = p.unitType ?? 'HUMAN_A';
    faction = p.faction ?? 'humans';
    role = p.role ?? '';
    isAlive = p.isAlive !== false ? 'true' : 'false';
    hp = p.hp ?? 100;
    maxHp = p.maxHp ?? 100;
    strength = p.strength ?? 10;
    defense = p.defense ?? 10;
    agility = p.agility ?? 10;
    speed = p.speed ?? 10;
    intelligence = p.intelligence ?? 10;
    leadership = p.leadership ?? 0;
    vision = p.vision ?? 10;
    vaccineLevel = p.vaccineLevel ?? 0;
    bagSize = p.bagSize ?? 5;
    mutation = p.mutation ?? 0;
    heavyWeapon = p.heavyWeapon ?? 0;
    twoHanded = p.twoHanded ?? 0;
    camouflage = p.camouflage ?? 0;
    regeneration = p.regeneration ?? 0;
    stench = p.stench ?? 0;
  }

  $effect(() => {
    if (open) {
      if (playerId) {
        loadPlayer(playerId);
      } else {
        resetForm();
      }
    }
  });

  async function loadPlayer(id: string) {
    loadingPlayer = true;
    try {
      const res = await apiFetch('/admin/api/users/' + id);
      if (res.status === 401) return;
      if (!res.ok) {
        onclose();
        toast.show(i18n.t.errGeneric, true);
        return;
      }
      const data = await res.json();
      populateForm(data);
    } catch {
      onclose();
      toast.show(i18n.t.errGeneric, true);
    } finally {
      loadingPlayer = false;
    }
  }

  async function save() {
    const isEdit = playerId !== null;

    if (!isEdit && (!username.trim() || !password)) {
      toast.show(i18n.t.errRequired, true);
      return;
    }

    const payload: Record<string, unknown> = {
      username,
      unitType,
      faction,
      role: role || null,
      isAlive: isAlive === 'true',
      hp,
      maxHp,
      strength,
      defense,
      agility,
      speed,
      intelligence,
      leadership,
      vision,
      vaccineLevel,
      bagSize,
      mutation,
      heavyWeapon,
      twoHanded,
      camouflage,
      regeneration,
      stench,
    };

    if (password) payload.password = password;

    saving = true;
    try {
      const url = isEdit ? '/admin/api/users/' + playerId : '/admin/api/users';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) return;
      if (res.status === 409) { toast.show(i18n.t.errExists, true); return; }
      if (!res.ok) { toast.show(i18n.t.errGeneric, true); return; }
      toast.show(isEdit ? i18n.t.savedOk : i18n.t.createdOk);
      onsaved();
      onclose();
    } catch {
      toast.show(i18n.t.errGeneric, true);
    } finally {
      saving = false;
    }
  }

  const isEdit = $derived(playerId !== null);
  const title = $derived(isEdit ? i18n.t.modalEditTitle : i18n.t.modalCreateTitle);
</script>

{#if open}
  <div class="overlay">
    <div class="modal-box">
      <div class="modal-header">
        <p class="modal-title">{title}</p>
        <button class="btn icon-btn" onclick={onclose}>✕</button>
      </div>

      <div class="modal-body">
        {#if loadingPlayer}
          <div class="loading-center">
            <Spinner />
          </div>
        {:else}
          <div class="form-grid">
            <!-- Base section -->
            <div class="section-title">{i18n.t.sectionBase}</div>

            <div class="form-group full">
              <label class="form-label">{i18n.t.fieldUsername}</label>
              <input type="text" bind:value={username} />
            </div>

            <div class="form-group full">
              <label class="form-label">
                {isEdit ? i18n.t.fieldNewPassword : i18n.t.fieldPassword}
              </label>
              <input type="password" autocomplete="new-password" bind:value={password} />
            </div>

            <div class="form-group">
              <label class="form-label">{i18n.t.fieldUnitType}</label>
              <select bind:value={unitType}>
                {#each UNIT_TYPES as ut}
                  <option value={ut}>{ut}</option>
                {/each}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">{i18n.t.fieldFaction}</label>
              <select bind:value={faction}>
                {#each FACTIONS as f}
                  <option value={f}>{f}</option>
                {/each}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">{i18n.t.fieldRole}</label>
              <select bind:value={role}>
                {#each ROLES as r}
                  <option value={r}>{r || '—'}</option>
                {/each}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">{i18n.t.fieldIsAlive}</label>
              <select bind:value={isAlive}>
                <option value="true">{i18n.t.optionAlive}</option>
                <option value="false">{i18n.t.optionDead}</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">{i18n.t.fieldHp}</label>
              <input type="number" bind:value={hp} />
            </div>

            <div class="form-group">
              <label class="form-label">{i18n.t.fieldMaxHp}</label>
              <input type="number" bind:value={maxHp} />
            </div>

            <!-- Attributes section -->
            <div class="section-title">{i18n.t.sectionAttributes}</div>

            <div class="form-group">
              <label class="form-label">{i18n.t.fieldStrength}</label>
              <input type="number" bind:value={strength} />
            </div>

            <div class="form-group">
              <label class="form-label">{i18n.t.fieldDefense}</label>
              <input type="number" bind:value={defense} />
            </div>

            <div class="form-group">
              <label class="form-label">{i18n.t.fieldAgility}</label>
              <input type="number" bind:value={agility} />
            </div>

            <div class="form-group">
              <label class="form-label">{i18n.t.fieldSpeed}</label>
              <input type="number" bind:value={speed} />
            </div>

            <div class="form-group">
              <label class="form-label">{i18n.t.fieldIntelligence}</label>
              <input type="number" bind:value={intelligence} />
            </div>

            <div class="form-group">
              <label class="form-label">{i18n.t.fieldLeadership}</label>
              <input type="number" bind:value={leadership} />
            </div>

            <div class="form-group">
              <label class="form-label">{i18n.t.fieldVision}</label>
              <input type="number" bind:value={vision} />
            </div>

            <div class="form-group">
              <label class="form-label">{i18n.t.fieldVaccineLevel}</label>
              <input type="number" bind:value={vaccineLevel} />
            </div>

            <div class="form-group">
              <label class="form-label">{i18n.t.fieldBagSize}</label>
              <input type="number" bind:value={bagSize} />
            </div>

            <div class="form-group">
              <label class="form-label">{i18n.t.fieldMutation}</label>
              <input type="number" bind:value={mutation} />
            </div>

            <!-- Skills section -->
            <div class="section-title">{i18n.t.sectionSkills}</div>

            <div class="form-group">
              <label class="form-label">{i18n.t.fieldHeavyWeapon}</label>
              <input type="number" bind:value={heavyWeapon} />
            </div>

            <div class="form-group">
              <label class="form-label">{i18n.t.fieldTwoHanded}</label>
              <input type="number" bind:value={twoHanded} />
            </div>

            <div class="form-group">
              <label class="form-label">{i18n.t.fieldCamouflage}</label>
              <input type="number" bind:value={camouflage} />
            </div>

            <div class="form-group">
              <label class="form-label">{i18n.t.fieldRegeneration}</label>
              <input type="number" bind:value={regeneration} />
            </div>

            <div class="form-group">
              <label class="form-label">{i18n.t.fieldStench}</label>
              <input type="number" bind:value={stench} />
            </div>
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
  .form-group { display: flex; flex-direction: column; gap: 5px; }
  .form-group.full { grid-column: 1 / -1; }
  .form-label { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-dim); }
  .section-title {
    font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--text-dim); grid-column: 1 / -1;
    padding-bottom: 6px; border-bottom: 1px solid var(--border);
    margin-top: 6px;
  }
  .loading-center {
    display: flex; align-items: center; justify-content: center;
    padding: 40px;
    grid-column: 1 / -1;
  }
</style>
