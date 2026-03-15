<script lang="ts">
  import { i18n } from '../lib/i18n.svelte.ts';
  import type { PlayerFormState } from './playerFormState.svelte.ts';

  let { form }: { form: PlayerFormState } = $props();
</script>

<div class="section-title">{i18n.t.sectionAttributes}</div>

{#each [
  ['f-strength',     'strength',      i18n.t.fieldStrength],
  ['f-defense',      'defense',       i18n.t.fieldDefense],
  ['f-agility',      'agility',       i18n.t.fieldAgility],
  ['f-speed',        'speed',         i18n.t.fieldSpeed],
  ['f-intelligence', 'intelligence',  i18n.t.fieldIntelligence],
  ['f-leadership',   'leadership',    i18n.t.fieldLeadership],
  ['f-vision',       'vision',        i18n.t.fieldVision],
  ['f-vaccine',      'vaccineLevel',  i18n.t.fieldVaccineLevel],
  ['f-bag',          'bagSize',       i18n.t.fieldBagSize],
  ['f-mutation',     'mutation',      i18n.t.fieldMutation],
] as [id, key, label]}
  <div class="form-group">
    <label class="form-label" for={id}>{label}</label>
    <input {id} type="number" name={key} bind:value={form[key as keyof PlayerFormState] as number} />
  </div>
{/each}
