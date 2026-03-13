<script lang="ts">
  import { _ } from "svelte-i18n";

  let {
    oncontinue,
    onprofile,
  }: { oncontinue: () => void; onprofile: () => void } = $props();
</script>

<nav class="nav">
  <button class="btn" onclick={oncontinue}>{$_("menu.continue")}</button>
  <button class="btn" onclick={onprofile}>{$_("menu.profile")}</button>
</nav>

<style>
  .nav {
    position: fixed;
    top: 48%;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 260px;
  }

  .btn {
    width: 100%;
    padding: 14px 24px;
    font-family: monospace;
    font-size: 14px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    background: rgba(0, 0, 0, 0.7);
    border: 1px solid rgba(114, 181, 58, 0.4);
    color: #72b53a;
    cursor: pointer;
    opacity: 0;
    animation: btn-in 0.4s ease forwards;
    transition:
      background 0.15s,
      border-color 0.15s,
      color 0.15s;
  }

  .btn:nth-child(1) { animation-delay: 0.8s; }
  .btn:nth-child(2) { animation-delay: 1.1s; }

  @keyframes btn-in {
    from { transform: scale(0); opacity: 0; }
    to   { transform: scale(1); opacity: 1; }
  }

  .btn:hover {
    background: rgba(114, 181, 58, 0.12);
    border-color: #72b53a;
    color: #fff;
  }
</style>
