<script lang="ts">
  import MenuButton from "./MenuButton.svelte";
  import Sidebar, { type SidebarAction } from "./Sidebar.svelte";

  let {
    actions,
    children,
  }: { actions: SidebarAction[]; children?: import("svelte").Snippet } = $props();

  let sidebarOpen = $state(false);
</script>

<div class="layout">
  <MenuButton onclick={() => (sidebarOpen = true)} />
  <Sidebar
    open={sidebarOpen}
    onclose={() => (sidebarOpen = false)}
    {actions}
  />
  {@render children?.()}
</div>

<style>
  .layout {
    position: fixed;
    inset: 0;
    z-index: 10;
    pointer-events: none;
  }
  .layout :global(*) {
    pointer-events: auto;
  }
</style>
