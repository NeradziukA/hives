<script lang="ts">
  import { i18n } from '../lib/i18n.svelte.ts';
  import type { Lang } from '../lib/types.ts';

  interface Props {
    activeSection: string;
    onsectionChange: (section: string) => void;
    onlogout: () => void;
    onlangChange: (lang: Lang) => void;
  }

  const { activeSection, onsectionChange, onlogout, onlangChange }: Props = $props();
</script>

<nav class="sidebar">
  <div class="sidebar-logo">
    HIVES
    <span>{i18n.t.adminLabel}</span>
  </div>
  <div class="sidebar-nav">
    <div
      class="nav-item"
      class:active={activeSection === 'users'}
      onclick={() => onsectionChange('users')}
      role="button"
      tabindex="0"
      onkeydown={(e) => e.key === 'Enter' && onsectionChange('users')}
    >
      <span class="nav-icon">◈</span>
      <span>{i18n.t.navUsers}</span>
    </div>
    <div class="nav-item disabled">
      <span class="nav-icon">⬡</span>
      <span>{i18n.t.navBuildings}</span>
    </div>
  </div>
  <div class="sidebar-footer">
    <button
      class="btn lang-btn"
      class:active={i18n.lang === 'en'}
      onclick={() => onlangChange('en')}
    >EN</button>
    <button
      class="btn lang-btn"
      class:active={i18n.lang === 'ru'}
      onclick={() => onlangChange('ru')}
    >RU</button>
    <button class="btn secondary small logout-btn" onclick={onlogout}>
      {i18n.t.logout}
    </button>
  </div>
</nav>

<style>
  .sidebar {
    width: var(--sidebar-w);
    background: var(--bg3);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    flex-shrink: 0;
  }
  .sidebar-logo {
    padding: 24px 20px 16px;
    font-size: 16px; font-weight: 700;
    letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--green);
    border-bottom: 1px solid var(--border);
  }
  .sidebar-logo span {
    color: var(--text-dim); font-size: 11px; display: block;
    margin-top: 2px; letter-spacing: 0.1em;
  }
  .sidebar-nav { flex: 1; padding: 12px 0; }
  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 20px;
    cursor: pointer; text-transform: uppercase;
    letter-spacing: 0.1em; font-size: 12px;
    color: var(--text-dim);
    border-left: 2px solid transparent;
    transition: color 0.15s, background 0.15s;
    user-select: none;
  }
  .nav-item:hover { color: var(--text); background: rgba(255,255,255,0.03); }
  .nav-item.active { color: var(--green); border-left-color: var(--green); background: var(--green-bg); }
  .nav-item.disabled { opacity: 0.35; cursor: default; pointer-events: none; }
  .nav-icon { font-size: 15px; width: 20px; text-align: center; }
  .sidebar-footer {
    padding: 16px 20px;
    border-top: 1px solid var(--border);
    display: flex; gap: 8px; align-items: center;
  }
  .lang-btn { padding: 5px 10px; font-size: 11px; }
  .lang-btn.active { color: var(--green); border-color: var(--green-dim); background: var(--green-bg); }
  .logout-btn { margin-left: auto; }
</style>
