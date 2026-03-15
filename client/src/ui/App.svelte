<script lang="ts">
  import { onMount } from "svelte";
  import { initGame, connectToServer } from "../game";
  import { setTokens, hasSession, refreshAccessToken, getAccessToken, getPlayerId, getUsername } from "../auth";
  import { gameState } from "./gameState.svelte";
  import HivesTitle from "./components/HivesTitle.svelte";
  import Splash from "./screens/Splash.svelte";
  import MainMenu from "./screens/MainMenu.svelte";
  import Game from "./screens/Game.svelte";
  import Profile from "./screens/Profile.svelte";

  type Screen = "splash" | "mainmenu" | "game" | "profile";

  let screen = $state<Screen>("splash");
  let gameContainer: HTMLDivElement;
  let hasSavedSession = $state(false);
  let username = $state("");

  $effect(() => {
    document.body.classList.toggle("theme-humans", gameState.faction === "humans");
  });

  async function fetchFaction(token: string) {
    try {
      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        gameState.faction = data.faction ?? null;
      }
    } catch {
      // ignore
    }
  }

  onMount(async () => {
    await initGame(gameContainer);
    hasSavedSession = hasSession();
    username = getUsername() ?? "";
    screen = "mainmenu";
  });

  async function handleConnect(loginUser: string, password: string): Promise<void> {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: loginUser, password }),
    });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error ?? "Login failed");
    }
    const { accessToken, refreshToken, id } = await res.json();
    setTokens(accessToken, refreshToken, id);
    username = getUsername() ?? "";
    await fetchFaction(accessToken);
    connectToServer(id, accessToken);
    screen = "game";
  }

  async function handleContinue(): Promise<void> {
    const ok = await refreshAccessToken();
    if (!ok) {
      hasSavedSession = false;
      throw new Error("Session expired, please log in again");
    }
    const id = getPlayerId()!;
    const accessToken = getAccessToken()!;
    username = getUsername() ?? "";
    await fetchFaction(accessToken);
    connectToServer(id, accessToken);
    screen = "game";
  }

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
    hasSavedSession={hasSavedSession}
    username={username}
    onconnect={handleConnect}
    oncontinue={handleContinue}
    onprofile={() => (screen = "profile")}
  />
{:else if screen === "game"}
  <Game onprofile={() => (screen = "profile")} />
{:else if screen === "profile"}
  <Profile username={username} oncontinue={() => (screen = "game")} onprofile={() => (screen = "profile")} />
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
