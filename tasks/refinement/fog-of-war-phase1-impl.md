# Туман войны — план реализации Phase 1

Спецификация: [fog-of-war.md](fog-of-war.md)

---

## Ключевые архитектурные решения

### 1. Где считается видимость?
**На сервере.** Клиент получает только видимые ему сущности.
Клиент никогда не получает координаты невидимых игроков.

### 2. Зона видимости
`vision_radius = 200 + vision * 10` метров вокруг игрока.

### 3. Статичные объекты — «Знакомая территория»
Здания видны по радиусу игрока (без разделения на союзные/вражеские в Phase 1).
Клиент запоминает однажды увиденные здания в `localStorage` — они остаются на карте навсегда (LKP для построек постоянный).
Сервер при `INIT_UNITS` отдаёт только здания в текущем радиусе; клиент дополняет из локального кэша.

### 4. LKP для юнитов
LKP хранится на клиенте — таймер 10 мин в памяти, snapshot координат из последнего сообщения.
Сервер не знает о LKP — он просто перестаёт слать данные о вышедшем из видимости юните.

### 5. Пространственные индексы
Используется **гексовая сетка** из `docs/geo/geogrid.md`:
- Ячейка = гекс, радиус описанной окружности **150 м**, расстояние между центрами ~260 м
- Аксиальные координаты `q:r`
- `SpatialGrid` — `Map<string, Set<playerId>>`, ключ `"q:r"`
- При UNIT_MOVED: проверяем игроков из **2 колец соседей** (~19 гексов) — покрывает max vision_radius
- Перевод geo → axial: `latLonToAxial(lat, lon)` через flat-top hex формулу

### 6. Рендер тумана на клиенте
**2D canvas-оверлей** поверх THREE.js canvas:
- Заливка тёмным `rgba(0,0,0,0.75)`
- Зоны видимости вырезаются через `globalCompositeOperation = 'destination-out'` с радиальным градиентом
- Пересчёт только при изменении зон, не каждый кадр

---

## Изменения на сервере

### `server/src/types.ts`
Добавить типы сообщений:
```ts
ENTITY_EXIT_VISION  = "ENTITY_EXIT_VISION",
BUILDING_CREATED    = "BUILDING_CREATED",
BUILDING_DELETED    = "BUILDING_DELETED",
```
Добавить в `SocketMessage.payload`:
```ts
entity?: { id: string; type: string; coords: Coordinates };
```

### `server/src/db/queries.ts`
```ts
getPlayerVision(id: string): Promise<{ vision: number }>
// SELECT vision FROM players WHERE id = ?
```

### `server/src/utils/geo.ts` (новый)
```ts
export const HEX_RADIUS_METERS = 150;
export function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number  // Хаверсин
export function latLonToAxial(lat: number, lon: number): { q: number; r: number }              // flat-top hex
```

### `server/src/utils/spatialGrid.ts` (новый)
```ts
export class SpatialGrid {
  private grid: Map<string, Set<string>>;   // "q:r" → Set<playerId>
  private playerCell: Map<string, string>;   // playerId → "q:r"
  update(id: string, lat: number, lon: number): void;
  remove(id: string): void;
  getNearby(lat: number, lon: number): Set<string>;  // 2 кольца соседей (~19 гексов)
}
```
Инстанс создаётся и экспортируется из `server/src/websocket/handlers/connect.ts`.

### `server/src/websocket/handlers/unit-move.ts`
Заменить broadcast на фильтрованную рассылку:
1. Обновить позицию в `spatialGrid`
2. Для каждого игрока из `spatialGrid.getNearby()`: вычислить расстояние (Хаверсин)
3. Расстояние ≤ `vision_radius` получателя → отправить `UNIT_MOVED`
4. Иначе → если был в `visibleBy[receiverId]` → отправить `ENTITY_EXIT_VISION`, убрать из множества
5. `Map<playerId, Set<visiblePlayerId>> visibleBy` хранится в памяти рядом с `users`

### `server/src/websocket/handlers/unit-get-all.ts`
Фильтровать `users` и `staticObjects` по `vision_radius` запрашивающего игрока перед отправкой `INIT_UNITS`.

### `server/src/routers/admin.ts`
- `POST /admin/api/buildings` → broadcast `BUILDING_CREATED`
- `DELETE /admin/api/buildings/:id` → broadcast `BUILDING_DELETED`

---

## Изменения на клиенте

### `client/src/ui/gameState.svelte.ts`
```ts
visibilityZones: Array<{ lat: number; lon: number; radius: number }>,
knownBuildings: Map<string, StaticObject>,  // постоянный LKP, сохраняется в localStorage
```

### `client/src/ui/components/FogOverlay.svelte` (новый)
```
position: fixed; inset: 0; pointer-events: none; z-index: 2
```
- Реактивно перерисовывается при изменении `gameState.visibilityZones`
- Конвертирует geo-координаты в экранные через `camera.project()`
- Конвертирует метры радиуса в пиксели через текущий zoom

### `client/src/handlers/buildingCreatedHandler.ts` (новый)
Обрабатывает `BUILDING_CREATED`: создаёт 3D-модель, добавляет в сцену и в `knownBuildings`.

### `client/src/webSocketHandler.ts`
- `ENTITY_EXIT_VISION` → удалить модель, создать LKP-маркер (10 мин таймер)
- `BUILDING_CREATED` → `handleBuildingCreated(...)`
- `BUILDING_DELETED` → удалить модель из сцены

### `client/src/ui/screens/Game.svelte`
Добавить `<FogOverlay />`.

---

## Верификация

```bash
cd server && npm run build
cd server && npm run test          # покрыть unit-move фильтрацию
cd client && npm run build
# Вручную: два игрока далеко друг от друга — не должны видеть друг друга
# Создать постройку через admin → появляется только у ближайших клиентов
npx pm2 restart hives
```
