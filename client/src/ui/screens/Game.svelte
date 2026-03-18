<script lang="ts">
  import { _ } from "svelte-i18n";
  import Layout from "../components/Layout.svelte";
  import GameHud from "../components/hud/GameHud.svelte";
  import UnitActionMenu from "../components/UnitActionMenu.svelte";
  import ZoomSlider from "../components/ZoomSlider.svelte";

  let { onprofile, onlogout }: { onprofile: () => void; onlogout: () => void } = $props();
</script>

<Layout actions={[
  { label: $_("menu.continue"), onclick: () => {}, disabled: true },
  { label: $_("menu.profile"),  onclick: onprofile },
  { label: $_("menu.logout"),   onclick: onlogout },
]}>
  <!-- Three.js canvas is rendered in the background layer of App.svelte -->
  <ZoomSlider />
  <UnitActionMenu />
  <GameHud />
</Layout>
