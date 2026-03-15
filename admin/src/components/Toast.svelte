<script lang="ts">
  import { toast } from '../lib/toast.svelte.ts';
</script>

<div id="toast" class:show={toast.visible} class:err={toast.isError}>
  {toast.message}
</div>

<style>
  #toast {
    position: fixed; bottom: 24px; right: 24px;
    padding: 12px 20px;
    background: var(--bg3);
    border-left: 3px solid var(--green);
    font-size: 12px; letter-spacing: 0.05em;
    color: var(--text-bright);
    z-index: 200;
    transform: translateX(120%);
    transition: transform 0.25s;
  }
  #toast.show { transform: translateX(0); }
  #toast.err { border-left-color: var(--red); }
</style>
