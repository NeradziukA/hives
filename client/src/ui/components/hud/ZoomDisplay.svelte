<script lang="ts">
  let { zoom }: { zoom: number } = $props();
</script>

<span class="zoom">⊕ {zoom.toFixed(1)}×</span>

<style>
  .zoom {
    white-space: nowrap;
  }
</style>
