<script lang="ts">
  import { _, locale } from "svelte-i18n";
  import { onMount } from "svelte";
  import Layout from "../components/Layout.svelte";
  import { getAccessToken } from "../../auth";

  const langs = ["en", "ru"] as const;

  let { oncontinue, username = "" }: { oncontinue: () => void; username?: string } = $props();

  const actions = $derived([
    { label: $_("menu.continue"), onclick: oncontinue },
    { label: $_("menu.profile"),  onclick: () => {}, disabled: true },
  ]);

  interface PlayerProfile {
    strength: number | null;
    defense: number | null;
    agility: number | null;
    speed: number | null;
    intelligence: number | null;
    hp: number | null;
    maxHp: number | null;
    leadership: number | null;
    vision: number | null;
    vaccineLevel: number | null;
    bagSize: number | null;
    heavyWeapon: number | null;
    twoHanded: number | null;
    camouflage: number | null;
    regeneration: number | null;
    stench: number | null;
    mutation: number | null;
    role: string | null;
    faction: string | null;
    unitType: string | null;
    isAlive: boolean | null;
  }

  let profile = $state<PlayerProfile | null>(null);

  function fmt(val: number | null | undefined): string {
    return val !== null && val !== undefined ? String(val) : "—";
  }

  onMount(async () => {
    const token = getAccessToken();
    if (!token) return;
    try {
      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) profile = await res.json();
    } catch {
      // ignore
    }
  });
</script>

<Layout {actions}>
  <div class="profile">
    <div class="top-row">
      <div>
        <h2 class="heading">{$_("profile.title")}</h2>
        {#if username}
          <p class="username">{username}</p>
        {/if}
      </div>
      <div class="lang-switcher">
        {#each langs as lang (lang)}
          <button
            class="lang-btn"
            class:active={$locale === lang}
            onclick={() => locale.set(lang)}
          >{lang.toUpperCase()}</button>
        {/each}
      </div>
    </div>

    <section class="section">
      <h3 class="section-title">{$_("profile.attributes.title")}</h3>
      <div class="stat-grid">
        <div class="stat"><span class="key">{$_("profile.attributes.strength")}</span><span class="val">{fmt(profile?.strength)}</span></div>
        <div class="stat"><span class="key">{$_("profile.attributes.defense")}</span><span class="val">{fmt(profile?.defense)}</span></div>
        <div class="stat"><span class="key">{$_("profile.attributes.agility")}</span><span class="val">{fmt(profile?.agility)}</span></div>
        <div class="stat"><span class="key">{$_("profile.attributes.speed")}</span><span class="val">{fmt(profile?.speed)}</span></div>
        <div class="stat"><span class="key">{$_("profile.attributes.intelligence")}</span><span class="val">{fmt(profile?.intelligence)}</span></div>
        <div class="stat"><span class="key">{$_("profile.attributes.health")}</span><span class="val">{profile ? `${fmt(profile.hp)}/${fmt(profile.maxHp)}` : "—"}</span></div>
        <div class="stat"><span class="key">{$_("profile.attributes.leadership")}</span><span class="val">{fmt(profile?.leadership)}</span></div>
        <div class="stat"><span class="key">{$_("profile.attributes.vision")}</span><span class="val">{fmt(profile?.vision)}</span></div>
        <div class="stat"><span class="key">{$_("profile.attributes.mutation")}</span><span class="val">{fmt(profile?.mutation)}</span></div>
        <div class="stat"><span class="key">{$_("profile.attributes.backpack")}</span><span class="val">{fmt(profile?.bagSize)}</span></div>
      </div>
    </section>

    <section class="section">
      <h3 class="section-title">{$_("profile.skills.title")}</h3>
      <div class="stat-grid">
        <div class="stat"><span class="key">{$_("profile.skills.heavy_weapon")}</span><span class="val">{fmt(profile?.heavyWeapon)}</span></div>
        <div class="stat"><span class="key">{$_("profile.skills.dual_wield")}</span><span class="val">{fmt(profile?.twoHanded)}</span></div>
        <div class="stat"><span class="key">{$_("profile.skills.stealth")}</span><span class="val">{fmt(profile?.camouflage)}</span></div>
        <div class="stat"><span class="key">{$_("profile.skills.regeneration")}</span><span class="val">{fmt(profile?.regeneration)}</span></div>
        <div class="stat"><span class="key">{$_("profile.skills.stench")}</span><span class="val">{fmt(profile?.stench)}</span></div>
      </div>
    </section>

    <section class="section">
      <h3 class="section-title">{$_("profile.role.title")}</h3>
      <div class="stat-grid">
        <div class="stat"><span class="key">{$_("profile.role.transformation")}</span><span class="val">{profile ? (profile.role === "transformation" ? "+" : "—") : "—"}</span></div>
        <div class="stat"><span class="key">{$_("profile.role.boss")}</span><span class="val">{profile ? (profile.role === "boss" ? "+" : "—") : "—"}</span></div>
        <div class="stat"><span class="key">{$_("profile.role.general")}</span><span class="val">{profile ? (profile.role === "general" ? "+" : "—") : "—"}</span></div>
        <div class="stat"><span class="key">{$_("profile.role.scientist")}</span><span class="val">{profile ? (profile.role === "scientist" ? "+" : "—") : "—"}</span></div>
        <div class="stat"><span class="key">{$_("profile.role.soldier")}</span><span class="val">{profile ? (profile.role === "soldier" ? "+" : "—") : "—"}</span></div>
        <div class="stat"><span class="key">{$_("profile.role.quest_master")}</span><span class="val">{profile ? (profile.role === "quest_master" ? "+" : "—") : "—"}</span></div>
      </div>
    </section>
  </div>
</Layout>

<style>
  .profile {
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 24px 32px;
    overflow-y: auto;
    color: #72b53a;
    font-family: 'JetBrains Mono', monospace;
  }

  .top-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 24px;
    border-bottom: 1px solid rgba(114, 181, 58, 0.3);
    padding-bottom: 8px;
  }

  .heading {
    margin: 0;
    border: none;
    padding: 0;
    font-size: 13px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #fff;
  }

  .username {
    margin: 4px 0 0;
    font-size: 20px;
    letter-spacing: 0.2em;
    color: #72b53a;
  }

  .lang-switcher {
    display: flex;
    gap: 4px;
  }

  .lang-btn {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    padding: 3px 8px;
    background: transparent;
    border: 1px solid rgba(114, 181, 58, 0.3);
    color: rgba(114, 181, 58, 0.5);
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
  }

  .lang-btn:hover,
  .lang-btn.active {
    color: #72b53a;
    border-color: #72b53a;
  }

  .section {
    margin-bottom: 24px;
  }

  .section-title {
    font-size: 11px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: rgba(114, 181, 58, 0.5);
    margin: 0 0 10px;
  }

  .stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 6px 16px;
  }

  .stat {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid rgba(114, 181, 58, 0.1);
    padding: 4px 0;
    font-size: 13px;
  }

  .key {
    color: rgba(255, 255, 255, 0.7);
  }

  .val {
    color: rgba(114, 181, 58, 0.5);
  }
</style>
