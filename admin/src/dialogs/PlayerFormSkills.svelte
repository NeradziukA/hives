<script lang="ts">
  import { i18n } from '../lib/i18n.svelte.ts';
  import type { PlayerFormState } from './playerFormState.svelte.ts';

  let { form }: { form: PlayerFormState } = $props();
</script>

<div class="section-title">{i18n.t.sectionSkills}</div>

{#each [
  ['f-heavy-weapon', 'heavyWeapon',  i18n.t.fieldHeavyWeapon],
  ['f-two-handed',   'twoHanded',    i18n.t.fieldTwoHanded],
  ['f-camouflage',   'camouflage',   i18n.t.fieldCamouflage],
  ['f-regeneration', 'regeneration', i18n.t.fieldRegeneration],
  ['f-stench',       'stench',       i18n.t.fieldStench],
] as [id, key, label]}
  <div class="form-group">
    <label class="form-label" for={id}>{label}</label>
    <input {id} type="number" name={key} bind:value={form[key as keyof PlayerFormState] as number} />
  </div>
{/each}
