<script lang="ts">
  interface Props {
    value:    boolean;
    label:    string;
    onToggle: () => void;
    alignEnd?: boolean;
  }

  let { value = $bindable(), label, onToggle, alignEnd = false }: Props = $props();
</script>

<div class="toggle-group" class:align-end={alignEnd}>
  <button class="toggle" class:active={value}
    onclick={() => { value = !value; onToggle(); }}
    aria-pressed={value} aria-label={label}>
    <span class="toggle-thumb"></span>
  </button>
  <span class="toggle-label">{label}</span>
</div>

<style>
  .toggle-group {
    display: flex; flex-direction: row; align-items: center; gap: 8px;
    align-self: flex-end; height: 28px;
  }
  .toggle-group.align-end { margin-left: auto; }
  .toggle-label { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-dim); }
  .toggle {
    width: 36px; height: 18px;
    background: var(--border); border: 1px solid var(--border);
    border-radius: 0; padding: 0; cursor: pointer;
    position: relative; transition: background 0.15s, border-color 0.15s; flex-shrink: 0;
  }
  .toggle.active { background: var(--green-bg); border-color: var(--green); }
  .toggle-thumb {
    position: absolute; top: 2px; left: 2px;
    width: 12px; height: 12px;
    background: var(--text-dim); transition: left 0.15s, background 0.15s;
  }
  .toggle.active .toggle-thumb { left: 20px; background: var(--green); }
  @media (max-width: 640px) {
    .toggle-group.align-end { margin-left: 0; }
  }
</style>
