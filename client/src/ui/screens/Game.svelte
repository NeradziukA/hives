<script lang="ts">
  import { _ } from "svelte-i18n";
  import Layout from "../components/Layout.svelte";
  import GameHud from "../components/hud/GameHud.svelte";
  import UnitActionMenu from "../components/UnitActionMenu.svelte";
  import UnitPicker from "../components/UnitPicker.svelte";
  import ZoomSlider from "../components/ZoomSlider.svelte";
  import { gameState } from "../gameState.svelte.ts";

  let { onprofile, onlogout }: { onprofile: () => void; onlogout: () => void } = $props();

  // Camera: height = 0.004 * zoom degrees above ground, FOV = 50°.
  // Visible world half-height = 0.004 * zoom * tan(25°) * 111320 meters.
  // Fog inner radius = visionRadius / visible_half_height * 50 (screen %).
  const TAN25 = Math.tan((25 * Math.PI) / 180); // ≈ 0.4663
  const CAM_BASE = 0.004 * 111320; // meters per zoom unit
  let fogInner = $derived(
    Math.min(88, Math.round((gameState.effectiveVisionRadius / (CAM_BASE * TAN25 * gameState.zoom)) * 50))
  );
  let fogOuter = $derived(Math.min(fogInner + 18, 100));
</script>

<Layout actions={[
  { label: $_("menu.continue"), onclick: () => {}, disabled: true },
  { label: $_("menu.profile"),  onclick: onprofile },
  { label: $_("menu.logout"),   onclick: onlogout },
]}>
  <!-- Three.js canvas is rendered in the background layer of App.svelte -->
  <ZoomSlider />
  <UnitPicker />
  <UnitActionMenu />
  <GameHud />
  <div
    class="fog"
    style="--fog-inner:{fogInner}%; --fog-outer:{fogOuter}%"
  ></div>
</Layout>

<style>
  .fog {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 2;
    background: radial-gradient(
      ellipse at center,
      transparent var(--fog-inner),
      rgba(10, 18, 8, 0.55) calc(var(--fog-inner) + 2%),
      rgba(10, 18, 8, 0.88) var(--fog-outer),
      rgba(10, 18, 8, 0.97) 100%
    );
  }
</style>
