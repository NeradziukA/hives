import type { Lang } from './types.ts';
import { BuildingType, UnitType, Faction, PlayerRank, PlayerRole } from './types.ts';

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
  colOnline: string;
  colLocation: string;
  colLastSeen: string;
  colCreated: string;
  filterOnlineOnly: string;
  statusOnline: string;
  statusOffline: string;
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
  fieldRank: string;
  fieldRole: string;
  fieldHp: string;
  fieldMaxHp: string;
  fieldIsAlive: string;
  fieldAlwaysOnline: string;
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
  statusActive: string;
  statusInactive: string;
  optionAlive: string;
  optionDead: string;
  buildingsTitle: string;
  createBuilding: string;
  colType: string;
  colName: string;
  colCapturedBy: string;
  colActive: string;
  colRevealRadius: string;
  noBuildings: string;
  deletedBuildingOk: string;
  createdBuildingOk: string;
  modalCreateBuildingTitle: string;
  modalEditBuildingTitle: string;
  fieldType: string;
  fieldLat: string;
  fieldLng: string;
  fieldRevealRadius: string;
  fieldActive: string;
  filterActiveOnly: string;
  confirmDeleteBuildingTitle: string;
  confirmDeleteBuildingBody: (name: string) => string;
  optionYes: string;
  optionNo: string;
  buildingTypes: Record<BuildingType, string>;
  unitTypes: Record<UnitType, string>;
  factions: Record<Faction, string>;
  ranks: Record<PlayerRank, string>;
  roles: Record<PlayerRole, string>;
  navPatrols: string;
  patrolsTitle: string;
  createPatrol: string;
  noPatrols: string;
  colNpc: string;
  colSpeed: string;
  colWaypoints: string;
  colPatrolActive: string;
  modalCreatePatrolTitle: string;
  modalEditPatrolTitle: string;
  fieldNpcId: string;
  fieldPatrolSpeed: string;
  fieldWaypoints: string;
  fieldPatrolActive: string;
  addWaypoint: string;
  removeWaypoint: string;
  colOrder: string;
  createdPatrolOk: string;
  deletedPatrolOk: string;
  confirmDeletePatrolTitle: string;
  confirmDeletePatrolBody: (name: string) => string;
  errPatrolRequired: string;
  errNoWaypoints: string;
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
    colOnline: 'Online',
    colLocation: 'Location',
    colLastSeen: 'Last Seen',
    colCreated: 'Created',
    filterOnlineOnly: 'Online',
    statusOnline: 'Online',
    statusOffline: 'Offline',
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
    fieldRank: 'Rank',
    fieldRole: 'Role',
    fieldHp: 'HP',
    fieldMaxHp: 'Max HP',
    fieldIsAlive: 'Status',
    fieldAlwaysOnline: 'Always Online',
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
    statusActive: 'Active',
    statusInactive: 'Inactive',
    optionAlive: 'Alive',
    optionDead: 'Dead',
    buildingsTitle: 'Buildings',
    createBuilding: '+ New Building',
    colType: 'Type',
    colName: 'Name',
    colCapturedBy: 'Captured By',
    colActive: 'Active',
    colRevealRadius: 'Reveal R.',
    noBuildings: 'No buildings found',
    deletedBuildingOk: 'Building deleted',
    createdBuildingOk: 'Building created',
    modalCreateBuildingTitle: 'New Building',
    modalEditBuildingTitle: 'Edit Building',
    fieldType: 'Type *',
    fieldLat: 'Latitude *',
    fieldLng: 'Longitude *',
    fieldRevealRadius: 'Reveal Radius *',
    fieldActive: 'Active',
    filterActiveOnly: 'Active only',
    confirmDeleteBuildingTitle: 'Delete Building',
    confirmDeleteBuildingBody: (name) => `Delete building "${name}"? This action cannot be undone.`,
    optionYes: 'Yes',
    optionNo: 'No',
    buildingTypes: {
      [BuildingType.INCUBATOR]:       'Incubator',
      [BuildingType.HIVE]:            'Hive',
      [BuildingType.SHELTER_ZOMBIE]:  'Zombie Shelter',
      [BuildingType.MUTATOR]:         'Mutator',
      [BuildingType.EXTRACTOR]:       'Extractor',
      [BuildingType.MILITARY_BASE]:   'Military Base',
      [BuildingType.RESISTANCE_BASE]: 'Resistance Base',
      [BuildingType.SHELTER_HUMAN]:   'Human Shelter',
      [BuildingType.LABORATORY]:      'Laboratory',
      [BuildingType.TRAINING_BASE]:   'Training Base',
    },
    unitTypes: {
      [UnitType.HUMAN_A]:  'Human A',
      [UnitType.HUMAN_B]:  'Human B',
      [UnitType.ZOMBIE_A]: 'Zombie A',
      [UnitType.ZOMBIE_B]: 'Zombie B',
    },
    factions: {
      [Faction.HUMANS]:  'Humans',
      [Faction.ZOMBIES]: 'Zombies',
      [Faction.NEUTRAL]: 'Neutral',
    },
    ranks: {
      [PlayerRank.NOVICE]:   'Novice',
      [PlayerRank.SURVIVOR]: 'Survivor',
      [PlayerRank.VETERAN]:  'Veteran',
      [PlayerRank.ELITE]:    'Elite',
      [PlayerRank.GENERAL]:  'General',
    },
    roles: {
      [PlayerRole.QUEST_MASTER]: 'Quest Master',
      [PlayerRole.NPC]:          'NPC',
      [PlayerRole.BOSS]:         'Boss',
    },
    navPatrols: 'Patrols',
    patrolsTitle: 'Patrols',
    createPatrol: '+ New Patrol',
    noPatrols: 'No patrols found',
    colNpc: 'NPC',
    colSpeed: 'Speed (m/s)',
    colWaypoints: 'Waypoints',
    colPatrolActive: 'Active',
    modalCreatePatrolTitle: 'New Patrol',
    modalEditPatrolTitle: 'Edit Patrol',
    fieldNpcId: 'NPC *',
    fieldPatrolSpeed: 'Speed (m/s) *',
    fieldWaypoints: 'Waypoints',
    fieldPatrolActive: 'Active',
    addWaypoint: '+ Add Waypoint',
    removeWaypoint: '✕',
    colOrder: 'Order',
    createdPatrolOk: 'Patrol created',
    deletedPatrolOk: 'Patrol deleted',
    confirmDeletePatrolTitle: 'Delete Patrol',
    confirmDeletePatrolBody: (name) => `Delete patrol for "${name}"? This action cannot be undone.`,
    errPatrolRequired: 'NPC and speed are required',
    errNoWaypoints: 'At least one waypoint is required',
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
    colOnline: 'Онлайн',
    colLocation: 'Локация',
    colLastSeen: 'Последний вход',
    colCreated: 'Создан',
    filterOnlineOnly: 'Онлайн',
    statusOnline: 'Онлайн',
    statusOffline: 'Офлайн',
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
    fieldRank: 'Ранг',
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
    statusActive: 'Активна',
    statusInactive: 'Неактивна',
    optionAlive: 'Жив',
    optionDead: 'Мёртв',
    buildingsTitle: 'Постройки',
    createBuilding: '+ Новая постройка',
    colType: 'Тип',
    colName: 'Название',
    colCapturedBy: 'Захвачена',
    colActive: 'Активна',
    colRevealRadius: 'Радиус',
    noBuildings: 'Постройки не найдены',
    deletedBuildingOk: 'Постройка удалена',
    createdBuildingOk: 'Постройка создана',
    modalCreateBuildingTitle: 'Новая постройка',
    modalEditBuildingTitle: 'Редактировать постройку',
    fieldType: 'Тип *',
    fieldLat: 'Широта *',
    fieldLng: 'Долгота *',
    fieldRevealRadius: 'Радиус обзора *',
    fieldActive: 'Активна',
    filterActiveOnly: 'Только активные',
    confirmDeleteBuildingTitle: 'Удалить постройку',
    confirmDeleteBuildingBody: (name) => `Удалить постройку "${name}"? Это действие нельзя отменить.`,
    optionYes: 'Да',
    optionNo: 'Нет',
    buildingTypes: {
      [BuildingType.INCUBATOR]:       'Инкубатор',
      [BuildingType.HIVE]:            'Улей',
      [BuildingType.SHELTER_ZOMBIE]:  'Убежище зомби',
      [BuildingType.MUTATOR]:         'Мутатор',
      [BuildingType.EXTRACTOR]:       'Экстрактор',
      [BuildingType.MILITARY_BASE]:   'Военная база',
      [BuildingType.RESISTANCE_BASE]: 'База сопротивления',
      [BuildingType.SHELTER_HUMAN]:   'Убежище людей',
      [BuildingType.LABORATORY]:      'Лаборатория',
      [BuildingType.TRAINING_BASE]:   'Учебная база',
    },
    unitTypes: {
      [UnitType.HUMAN_A]:  'Человек A',
      [UnitType.HUMAN_B]:  'Человек B',
      [UnitType.ZOMBIE_A]: 'Зомби A',
      [UnitType.ZOMBIE_B]: 'Зомби B',
    },
    factions: {
      [Faction.HUMANS]:  'Люди',
      [Faction.ZOMBIES]: 'Зомби',
      [Faction.NEUTRAL]: 'Нейтральные',
    },
    ranks: {
      [PlayerRank.NOVICE]:   'Новичок',
      [PlayerRank.SURVIVOR]: 'Выживший',
      [PlayerRank.VETERAN]:  'Ветеран',
      [PlayerRank.ELITE]:    'Элита',
      [PlayerRank.GENERAL]:  'Генерал',
    },
    roles: {
      [PlayerRole.QUEST_MASTER]: 'Квест мастер',
      [PlayerRole.NPC]:          'NPC',
      [PlayerRole.BOSS]:         'Босс',
    },
    navPatrols: 'Патрули',
    patrolsTitle: 'Патрули',
    createPatrol: '+ Новый патруль',
    noPatrols: 'Патрули не найдены',
    colNpc: 'NPC',
    colSpeed: 'Скорость (м/с)',
    colWaypoints: 'Точки',
    colPatrolActive: 'Активен',
    modalCreatePatrolTitle: 'Новый патруль',
    modalEditPatrolTitle: 'Редактировать патруль',
    fieldNpcId: 'NPC *',
    fieldPatrolSpeed: 'Скорость (м/с) *',
    fieldWaypoints: 'Точки маршрута',
    fieldPatrolActive: 'Активен',
    addWaypoint: '+ Добавить точку',
    removeWaypoint: '✕',
    colOrder: 'Порядок',
    createdPatrolOk: 'Патруль создан',
    deletedPatrolOk: 'Патруль удалён',
    confirmDeletePatrolTitle: 'Удалить патруль',
    confirmDeletePatrolBody: (name) => `Удалить патруль для "${name}"? Это действие нельзя отменить.`,
    errPatrolRequired: 'Требуется NPC и скорость',
    errNoWaypoints: 'Требуется хотя бы одна точка маршрута',
  },
};

const STORAGE_KEY = 'locale';

let _lang = $state<Lang>((localStorage.getItem(STORAGE_KEY) as Lang) || 'en');

export const i18n = {
  get lang() { return _lang; },
  get t() { return LANGS[_lang]; },
  set(l: Lang) {
    _lang = l;
    localStorage.setItem(STORAGE_KEY, l);
  },
};
