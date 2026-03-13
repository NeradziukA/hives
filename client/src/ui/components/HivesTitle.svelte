<script lang="ts">
  let { small = false }: { small?: boolean } = $props();
</script>

<div class="title" class:small>HIVES</div>

<style>
  .title {
    position: fixed;
    top: 38%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    z-index: 15;
    font-family: monospace;
    font-size: clamp(84px, 13vw, 150px);
    font-weight: 900;
    letter-spacing: 0.3em;
    padding-left: 0.3em;
    white-space: nowrap;
    color: #72b53a;
    text-shadow:
      0 0 20px rgba(114, 181, 58, 0.6),
      0 0 60px rgba(114, 181, 58, 0.2);
    pointer-events: none;
    opacity: 0;
    animation: fade-in 0.6s ease forwards;
    transition: font-size 1s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .title.small {
    top: 28%;
    font-size: clamp(36px, 8vw, 96px);
    text-shadow: 0 0 30px rgba(114, 181, 58, 0.4);
  }

  @keyframes fade-in {
    to { opacity: 1; }
  }
</style>
