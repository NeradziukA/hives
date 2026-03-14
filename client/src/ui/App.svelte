<script lang="ts">
  import { onMount } from "svelte";
  import { initGame } from "../game";
  import HivesTitle from "./components/HivesTitle.svelte";
  import Splash from "./screens/Splash.svelte";
  import MainMenu from "./screens/MainMenu.svelte";
  import Game from "./screens/Game.svelte";
  import Profile from "./screens/Profile.svelte";

  type Screen = "splash" | "mainmenu" | "game" | "profile";

  let screen = $state<Screen>("splash");
  let gameContainer: HTMLDivElement;

  onMount(async () => {
    await initGame(gameContainer);
    screen = "mainmenu";
  });

  const showTitle = $derived(screen === "splash" || screen === "mainmenu");
</script>

<div class="bg" class:hidden={screen === "game"}></div>
<div bind:this={gameContainer} class="game-layer" class:visible={screen === "game"}></div>

{#if showTitle}
  <HivesTitle small={screen !== "splash"} />
{/if}

{#if screen === "splash"}
  <Splash />
{:else if screen === "mainmenu"}
  <MainMenu
    oncontinue={() => (screen = "game")}
    onprofile={() => (screen = "profile")}
  />
{:else if screen === "game"}
  <Game onprofile={() => (screen = "profile")} />
{:else if screen === "profile"}
  <Profile oncontinue={() => (screen = "game")} onprofile={() => (screen = "profile")} />
{/if}

<style>
  .bg {
    position: fixed;
    inset: 0;
    z-index: 1;
    background:
      linear-gradient(to bottom, rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.82)),
      url("/assets/images/main-background.jpg") center / cover no-repeat;
  }

  .bg.hidden {
    display: none;
  }

  .game-layer {
    position: fixed;
    inset: 0;
    z-index: 0;
    visibility: hidden;
  }

  .game-layer.visible {
    visibility: visible;
  }
</style>
