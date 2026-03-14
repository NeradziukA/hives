<script lang="ts">
  let { message }: { message: string } = $props();
</script>

<span class="msg">{message}</span>

<style>
  .msg {
    white-space: nowrap;
    min-width: 180px;
  }
</style>
