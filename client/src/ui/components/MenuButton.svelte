<script lang="ts">
  let { onclick }: { onclick: () => void } = $props();
</script>

<button class="menu-btn" {onclick}>☰</button>

<style>
  .menu-btn {
    position: fixed;
    top: 12px;
    left: 12px;
    z-index: 100;
    width: 44px;
    height: 44px;
    background: rgba(0, 0, 0, 0.7);
    border: 1px solid rgba(114, 181, 58, 0.5);
    color: #72b53a;
    font-size: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s, border-color 0.15s;
  }
  .menu-btn:hover {
    background: rgba(114, 181, 58, 0.15);
    border-color: #72b53a;
  }
</style>
