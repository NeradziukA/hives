<script lang="ts">
  import { _ } from "svelte-i18n";
  import Layout from "../components/Layout.svelte";
  import GameHud from "../components/hud/GameHud.svelte";
  import UnitActionMenu from "../components/UnitActionMenu.svelte";
  import ZoomSlider from "../components/ZoomSlider.svelte";

  let { onprofile }: { onprofile: () => void } = $props();
</script>

<Layout actions={[
  { label: $_("menu.continue"), onclick: () => {}, disabled: true },
  { label: $_("menu.profile"),  onclick: onprofile },
]}>
  {#snippet children()}
    <!-- Three.js canvas is rendered in the background layer of App.svelte -->
    <ZoomSlider />
    <UnitActionMenu />
    <GameHud />
  {/snippet}
</Layout>
