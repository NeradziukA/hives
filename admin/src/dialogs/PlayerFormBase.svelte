<script lang="ts">
  import { i18n } from '../lib/i18n.svelte.ts';
  import type { PlayerFormState } from './playerFormState.svelte.ts';

  const UNIT_TYPES = ['HUMAN_A', 'HUMAN_B', 'ZOMBIE_A', 'ZOMBIE_B'];
  const FACTIONS   = ['humans', 'zombies'];
  const ROLES      = ['', 'transformation', 'boss', 'general', 'scientist', 'soldier', 'quest_master'];

  let { form, isEdit }: { form: PlayerFormState; isEdit: boolean } = $props();
</script>

<div class="section-title">{i18n.t.sectionBase}</div>

<div class="form-group full">
  <label class="form-label" for="f-username">{i18n.t.fieldUsername}</label>
  <input id="f-username" type="text" name="username" bind:value={form.username} />
</div>

<div class="form-group full">
  <label class="form-label" for="f-password">
    {isEdit ? i18n.t.fieldNewPassword : i18n.t.fieldPassword}
  </label>
  <input id="f-password" type="password" name="password" autocomplete="new-password" bind:value={form.password} />
</div>

<div class="form-group">
  <label class="form-label" for="f-unit-type">{i18n.t.fieldUnitType}</label>
  <select id="f-unit-type" name="unit-type" bind:value={form.unitType}>
    {#each UNIT_TYPES as ut}<option value={ut}>{ut}</option>{/each}
  </select>
</div>

<div class="form-group">
  <label class="form-label" for="f-faction">{i18n.t.fieldFaction}</label>
  <select id="f-faction" name="faction" bind:value={form.faction}>
    {#each FACTIONS as f}<option value={f}>{f}</option>{/each}
  </select>
</div>

<div class="form-group">
  <label class="form-label" for="f-role">{i18n.t.fieldRole}</label>
  <select id="f-role" name="role" bind:value={form.role}>
    {#each ROLES as r}<option value={r}>{r || '—'}</option>{/each}
  </select>
</div>

<div class="form-group">
  <label class="form-label" for="f-is-alive">{i18n.t.fieldIsAlive}</label>
  <select id="f-is-alive" name="is-alive" bind:value={form.isAlive}>
    <option value="true">{i18n.t.optionAlive}</option>
    <option value="false">{i18n.t.optionDead}</option>
  </select>
</div>

<div class="form-group">
  <label class="form-label" for="f-hp">{i18n.t.fieldHp}</label>
  <input id="f-hp" type="number" name="hp" bind:value={form.hp} />
</div>

<div class="form-group">
  <label class="form-label" for="f-max-hp">{i18n.t.fieldMaxHp}</label>
  <input id="f-max-hp" type="number" name="max-hp" bind:value={form.maxHp} />
</div>
