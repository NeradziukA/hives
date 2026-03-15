<script lang="ts">
  import { i18n } from '../lib/i18n.svelte.ts';
  import type { Lang } from '../lib/types.ts';

  interface Props {
    activeSection: string;
    onsectionChange: (section: string) => void;
    onlogout: () => void;
    onlangChange: (lang: Lang) => void;
    oncloseSidebar: () => void;
  }

  const { activeSection, onsectionChange, onlogout, onlangChange, oncloseSidebar }: Props = $props();
</script>

<nav class="sidebar">
  <header class="sidebar-logo">
    HIVES
    <span>{i18n.t.adminLabel}</span>
    <button class="sidebar-close" onclick={oncloseSidebar} title="Скрыть меню" aria-label="Скрыть меню">✕</button>
  </header>
  <ul class="sidebar-nav" role="list">
    <li>
      <button
        class="nav-item"
        class:active={activeSection === 'users'}
        aria-current={activeSection === 'users' ? 'page' : undefined}
        onclick={() => onsectionChange('users')}
      >
        <span class="nav-icon" aria-hidden="true">◈</span>
        <span>{i18n.t.navUsers}</span>
      </button>
    </li>
    <li>
      <button
        class="nav-item"
        class:active={activeSection === 'buildings'}
        aria-current={activeSection === 'buildings' ? 'page' : undefined}
        onclick={() => onsectionChange('buildings')}
      >
        <span class="nav-icon" aria-hidden="true">⬡</span>
        <span>{i18n.t.navBuildings}</span>
      </button>
    </li>
  </ul>
  <footer class="sidebar-footer">
    <button
      class="btn lang-btn"
      class:active={i18n.lang === 'en'}
      aria-pressed={i18n.lang === 'en'}
      onclick={() => onlangChange('en')}
    >EN</button>
    <button
      class="btn lang-btn"
      class:active={i18n.lang === 'ru'}
      aria-pressed={i18n.lang === 'ru'}
      onclick={() => onlangChange('ru')}
    >RU</button>
    <button class="btn secondary small logout-btn" onclick={onlogout}>
      {i18n.t.logout}
    </button>
  </footer>
</nav>

<style>
  .sidebar {
    width: var(--sidebar-w);
    background: var(--bg3);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    flex-shrink: 0;
  }
  @media (max-width: 768px) {
    .sidebar {
      position: fixed;
      top: 0; left: 0;
      height: 100dvh;
      z-index: 100;
    }
  }
  .sidebar-logo {
    padding: 24px 20px 16px;
    font-size: 16px; font-weight: 700;
    letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--green);
    border-bottom: 1px solid var(--border);
    position: relative;
  }
  .sidebar-logo span {
    color: var(--text-dim); font-size: 11px; display: block;
    margin-top: 2px; letter-spacing: 0.1em;
  }
  .sidebar-close {
    position: absolute;
    top: 50%; right: 12px;
    transform: translateY(-50%);
    width: 28px; height: 28px;
    padding: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 4px;
    color: var(--text-dim);
    cursor: pointer;
    transition: color 0.15s, background 0.15s;
  }
  .sidebar-close:hover { color: var(--text); background: var(--bg2); }
  .sidebar-nav { flex: 1; padding: 12px 0; margin: 0; list-style: none; }
  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 20px;
    width: 100%; text-align: left;
    background: none; border: none; border-left: 2px solid transparent;
    cursor: pointer; text-transform: uppercase;
    letter-spacing: 0.1em; font-size: 12px;
    color: var(--text-dim);
    transition: color 0.15s, background 0.15s;
  }
  .nav-item:hover { color: var(--text); background: rgba(255,255,255,0.03); }
  .nav-item.active { color: var(--green); border-left-color: var(--green); background: var(--green-bg); }
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
