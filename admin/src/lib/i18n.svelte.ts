import type { Lang } from './types.ts';

type PageInfoFn = (from: number, to: number, total: number) => string;
type ConfirmDeleteBodyFn = (name: string) => string;

interface Translations {
  adminLabel: string;
  loginTitle: string;
  loginUser: string;
  loginPass: string;
  loginBtn: string;
  loginErr: string;
  navUsers: string;
  navBuildings: string;
  logout: string;
  usersTitle: string;
  createUser: string;
  searchName: string;
  searchLat: string;
  searchLng: string;
  searchRad: string;
  search: string;
  reset: string;
  colUsername: string;
  colFaction: string;
  colStatus: string;
  colLocation: string;
  colLastSeen: string;
  colCreated: string;
  noData: string;
  loading: string;
  pageInfo: PageInfoFn;
  edit: string;
  delete: string;
  alive: string;
  dead: string;
  confirmDeleteTitle: string;
  confirmDeleteBody: ConfirmDeleteBodyFn;
  cancel: string;
  confirm: string;
  modalCreateTitle: string;
  modalEditTitle: string;
  save: string;
  fieldUsername: string;
  fieldPassword: string;
  fieldNewPassword: string;
  fieldUnitType: string;
  fieldFaction: string;
  fieldRole: string;
  fieldHp: string;
  fieldMaxHp: string;
  fieldIsAlive: string;
  sectionBase: string;
  sectionAttributes: string;
  sectionSkills: string;
  fieldStrength: string;
  fieldDefense: string;
  fieldAgility: string;
  fieldSpeed: string;
  fieldIntelligence: string;
  fieldLeadership: string;
  fieldVision: string;
  fieldVaccineLevel: string;
  fieldBagSize: string;
  fieldMutation: string;
  fieldHeavyWeapon: string;
  fieldTwoHanded: string;
  fieldCamouflage: string;
  fieldRegeneration: string;
  fieldStench: string;
  savedOk: string;
  deletedOk: string;
  createdOk: string;
  errRequired: string;
  errExists: string;
  errGeneric: string;
  statusAlive: string;
  statusDead: string;
  optionAlive: string;
  optionDead: string;
}

const LANGS: Record<Lang, Translations> = {
  en: {
    adminLabel: 'ADMIN PANEL',
    loginTitle: 'HIVES ADMIN',
    loginUser: 'Username',
    loginPass: 'Password',
    loginBtn: 'Sign In',
    loginErr: 'Invalid credentials',
    navUsers: 'Players',
    navBuildings: 'Buildings',
    logout: 'Logout',
    usersTitle: 'Players',
    createUser: '+ New Player',
    searchName: 'Search (name / ID)',
    searchLat: 'Latitude',
    searchLng: 'Longitude',
    searchRad: 'Radius km',
    search: 'Search',
    reset: 'Reset',
    colUsername: 'Username',
    colFaction: 'Faction',
    colStatus: 'Status',
    colLocation: 'Location',
    colLastSeen: 'Last Seen',
    colCreated: 'Created',
    noData: 'No players found',
    loading: 'Loading...',
    pageInfo: (from, to, total) => `${from}–${to} of ${total}`,
    edit: 'Edit',
    delete: 'Delete',
    alive: 'Alive',
    dead: 'Dead',
    confirmDeleteTitle: 'Delete Player',
    confirmDeleteBody: (name) => `Delete player "${name}"? This action cannot be undone.`,
    cancel: 'Cancel',
    confirm: 'Delete',
    modalCreateTitle: 'New Player',
    modalEditTitle: 'Edit Player',
    save: 'Save',
    fieldUsername: 'Username *',
    fieldPassword: 'Password *',
    fieldNewPassword: 'New Password (leave blank to keep)',
    fieldUnitType: 'Unit Type',
    fieldFaction: 'Faction',
    fieldRole: 'Role',
    fieldHp: 'HP',
    fieldMaxHp: 'Max HP',
    fieldIsAlive: 'Status',
    sectionBase: 'Base',
    sectionAttributes: 'Attributes',
    sectionSkills: 'Skills',
    fieldStrength: 'Strength',
    fieldDefense: 'Defense',
    fieldAgility: 'Agility',
    fieldSpeed: 'Speed',
    fieldIntelligence: 'Intelligence',
    fieldLeadership: 'Leadership',
    fieldVision: 'Vision',
    fieldVaccineLevel: 'Vaccine Level',
    fieldBagSize: 'Bag Size',
    fieldMutation: 'Mutation',
    fieldHeavyWeapon: 'Heavy Weapon',
    fieldTwoHanded: 'Two-Handed',
    fieldCamouflage: 'Camouflage',
    fieldRegeneration: 'Regeneration',
    fieldStench: 'Stench',
    savedOk: 'Saved',
    deletedOk: 'Deleted',
    createdOk: 'Player created',
    errRequired: 'Username and password are required',
    errExists: 'Username already exists',
    errGeneric: 'Server error',
    statusAlive: 'Alive',
    statusDead: 'Dead',
    optionAlive: 'Alive',
    optionDead: 'Dead',
  },
  ru: {
    adminLabel: 'ПАНЕЛЬ УПРАВЛЕНИЯ',
    loginTitle: 'HIVES ADMIN',
    loginUser: 'Имя пользователя',
    loginPass: 'Пароль',
    loginBtn: 'Войти',
    loginErr: 'Неверные данные',
    navUsers: 'Игроки',
    navBuildings: 'Постройки',
    logout: 'Выйти',
    usersTitle: 'Игроки',
    createUser: '+ Новый игрок',
    searchName: 'Поиск (имя / ID)',
    searchLat: 'Широта',
    searchLng: 'Долгота',
    searchRad: 'Радиус км',
    search: 'Найти',
    reset: 'Сброс',
    colUsername: 'Имя',
    colFaction: 'Фракция',
    colStatus: 'Статус',
    colLocation: 'Локация',
    colLastSeen: 'Последний вход',
    colCreated: 'Создан',
    noData: 'Игроки не найдены',
    loading: 'Загрузка...',
    pageInfo: (from, to, total) => `${from}–${to} из ${total}`,
    edit: 'Изменить',
    delete: 'Удалить',
    alive: 'Жив',
    dead: 'Мёртв',
    confirmDeleteTitle: 'Удалить игрока',
    confirmDeleteBody: (name) => `Удалить игрока "${name}"? Это действие нельзя отменить.`,
    cancel: 'Отмена',
    confirm: 'Удалить',
    modalCreateTitle: 'Новый игрок',
    modalEditTitle: 'Редактировать игрока',
    save: 'Сохранить',
    fieldUsername: 'Имя пользователя *',
    fieldPassword: 'Пароль *',
    fieldNewPassword: 'Новый пароль (оставьте пустым для сохранения)',
    fieldUnitType: 'Тип юнита',
    fieldFaction: 'Фракция',
    fieldRole: 'Роль',
    fieldHp: 'HP',
    fieldMaxHp: 'Макс HP',
    fieldIsAlive: 'Статус',
    sectionBase: 'Основное',
    sectionAttributes: 'Атрибуты',
    sectionSkills: 'Навыки',
    fieldStrength: 'Сила',
    fieldDefense: 'Защита',
    fieldAgility: 'Ловкость',
    fieldSpeed: 'Скорость',
    fieldIntelligence: 'Интеллект',
    fieldLeadership: 'Лидерство',
    fieldVision: 'Зрение',
    fieldVaccineLevel: 'Уровень вакцины',
    fieldBagSize: 'Размер рюкзака',
    fieldMutation: 'Мутация',
    fieldHeavyWeapon: 'Тяжёлое оружие',
    fieldTwoHanded: 'Двуручный бой',
    fieldCamouflage: 'Маскировка',
    fieldRegeneration: 'Регенерация',
    fieldStench: 'Зловоние',
    savedOk: 'Сохранено',
    deletedOk: 'Удалено',
    createdOk: 'Игрок создан',
    errRequired: 'Требуются имя и пароль',
    errExists: 'Имя пользователя занято',
    errGeneric: 'Ошибка сервера',
    statusAlive: 'Жив',
    statusDead: 'Мёртв',
    optionAlive: 'Жив',
    optionDead: 'Мёртв',
  },
};

let _lang = $state<Lang>((localStorage.getItem('adminLang') as Lang) || 'en');

export const i18n = {
  get lang() { return _lang; },
  get t() { return LANGS[_lang]; },
  set(l: Lang) {
    _lang = l;
    localStorage.setItem('adminLang', l);
  },
};
