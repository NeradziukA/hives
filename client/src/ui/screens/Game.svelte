<script lang="ts">
  import { _ } from "svelte-i18n";
  import Layout from "../components/Layout.svelte";

  let { onprofile }: { onprofile: () => void } = $props();
</script>

<Layout actions={[
  { label: $_("menu.continue"), onclick: () => {}, disabled: true },
  { label: $_("menu.profile"),  onclick: onprofile },
]}>
  <!-- Three.js canvas is rendered in the background layer of App.svelte -->
</Layout>
