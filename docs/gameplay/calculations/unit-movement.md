# Расчёты — Движение юнитов (client-side)

Описание полного цикла: от обновления GPS до отображения позиции на экране.

---

## Общая схема

```
[GPS / NPC-тик] → UNIT_MOVED → сервер → broadcast → клиент
                                                        ↓
                                               moveTo(coords)  ← устанавливает desiredPos
                                                        ↓
                                          каждый кадр: tick(speed)
                                                        ↓
                                           lerp(desiredPos, speed)
```

---

## 1. Источники позиций

### Игроки
- `client/src/location.ts` — `LocationTracker` опрашивает `navigator.geolocation` каждые `locationUpdateInterval` мс (по умолчанию 10 000 мс, задаётся сервером).
- При изменении координат клиент отправляет `UNIT_MOVED { coords: { lat, lon } }` на сервер.
- Сервер обновляет `users`-карту и ретранслирует сообщение всем остальным клиентам (`server/src/websocket/handlers/unit-move.ts`).

### NPC (патрули)
- `server/src/npc/patrol-loop.ts` — сервер сам вычисляет позиции NPC каждые `NPC_TICK_INTERVAL_MS` (10 с).
- Расчёт: `stepM = speed × elapsed_s`, затем `advancePatrol()` с формулами Хаверсинуса.
- Результат транслируется как `UNIT_MOVED` всем клиентам.

Подробнее — [patrol-movement.md](patrol-movement.md).

---

## 2. Приём UNIT_MOVED на клиенте

`client/src/handlers/unitMovedHandler.ts`:

```ts
movingUnit.moveTo(new Coords(lat, lon))
```

`moveTo()` (`client/src/models.ts`, строка ~137) только записывает `desiredPos` — целевую позицию в сцене. Визуального сдвига ещё нет.

Конвертация географических координат в координаты сцены происходит внутри `moveTo` через `metersToLatitudeDegrees` / `metersToLongitudeDegrees` из `lib/geo/constants.ts`. Все позиции относительны точке аутентификации игрока (origin = 0, 0, 0).

---

## 3. Интерполяция: функция tick()

`client/src/models.ts`, строка ~148:

```ts
tick(speed: number, camera?, screenHeight?) {
    this.renderObj.position.lerp(this.desiredPos, speed)
    // … LOD-переключение
}
```

`lerp(target, α)` вычисляется по формуле:

```
position = position + (desiredPos − position) × α
```

| Параметр | Описание |
| -------- | -------- |
| `α = speed` | Доля пути за один кадр (0–1) |
| `α = 0.05` | `driftSpeed` по умолчанию |
| Кадров до ~99 % пути | ≈ ln(0.01) / ln(0.95) ≈ **90 кадров** |

`tick()` вызывается каждый кадр из `game.ts`:

```ts
_mainUnit.tick(driftSpeed, camera, renderHeight)
tickAllUnits(driftSpeed, camera, renderHeight)   // все остальные юниты
```

`tickAllUnits` определён в `webSocketHandler.ts` и итерирует по всем юнитам в карте, вызывая `tick()` с тем же `driftSpeed`.

---

## 4. Параметр driftSpeed

| Параметр сервера | Код | Значение |
| ---------------- | --- | -------- |
| `CAMERA_DRIFT_SPEED` | `server/src/config.ts` | `0.05` |
| `cameraDriftSpeed` в GameConfig | `server/src/types.ts` | передаётся клиенту при аутентификации |
| `_driftSpeed` | `client/src/sceneSetup.ts` | глобальное значение на клиенте |

Клиент получает значение в `unitAuthenticatedHandler.ts`:

```ts
setDriftSpeed(message.payload.config.cameraDriftSpeed)
```

Тот же `driftSpeed` применяется и к камере (`sceneSetup.ts`):

```ts
currentTarget.lerp(desiredTarget, _driftSpeed)
```

---

## 5. Проблема: прыжки NPC при α = 0.05

### Почему возникают прыжки

Игрок и NPC обновляют позицию с одинаковым интервалом ≈ 10 с, но воспринимаются по-разному:

- **Игрок** двигает *своего* юнита — субъективно плавно, т. к. сам инициирует движение.
- **NPC** наблюдается со стороны. Скачок виден как резкий телепорт, который lerp «сглаживает» за ~90 кадров (≈ 1.5 с при 60 fps).

При `α = 0.05` за один кадр проходится 5 % оставшегося пути. Когда NPC телепортируется на 14 м (1.4 м/с × 10 с), первые несколько кадров дают заметный скачок, а не плавное движение.

### Математика

```
Расстояние за первый кадр = 14 м × 0.05 = 0.7 м
Расстояние за второй кадр = 13.3 м × 0.05 = 0.665 м
…
```

Движение экспоненциально затухает, что выглядит как «прыжок + торможение», а не равномерное скольжение.

### Правильное значение для NPC

Для плавного скольжения из точки A в точку B за интервал между тиками (10 с) нужно, чтобы lerp «добегал» к `desiredPos` примерно к концу интервала. При 60 fps и 600 кадрах за 10 с:

```
(1 − α)^600 ≈ 0.01   →   α ≈ 1 − 0.01^(1/600) ≈ 0.0077
```

Значение `α ≈ 0.005–0.008` обеспечивает равномерное движение NPC за 10-секундный интервал вместо рывка в начале тика.

---

## 6. Рекомендуемое решение

Добавить в `GameConfig` отдельный параметр `npcLerpSpeed` и передавать его клиенту наряду с `cameraDriftSpeed`.

**`server/src/config.ts`:**
```ts
export const CAMERA_DRIFT_SPEED = 0.05
export const NPC_LERP_SPEED = 0.005       // новый параметр
```

**`server/src/types.ts` (GameConfig):**
```ts
type GameConfig = {
    cameraDriftSpeed: number
    npcLerpSpeed: number                  // добавить
    locationUpdateInterval: number
}
```

**`server/src/websocket/handlers/connect.ts`** (при отправке конфига):
```ts
config: {
    cameraDriftSpeed: CAMERA_DRIFT_SPEED,
    npcLerpSpeed: NPC_LERP_SPEED,         // добавить
    locationUpdateInterval: LOCATION_UPDATE_INTERVAL,
}
```

**`client/src/handlers/unitAuthenticatedHandler.ts`:**
```ts
setDriftSpeed(message.payload.config.cameraDriftSpeed)
setNpcLerpSpeed(message.payload.config.npcLerpSpeed)  // новый setter
```

**`client/src/webSocketHandler.ts`** (в `tickAllUnits`):
```ts
// Вместо одного driftSpeed для всех:
unit.tick(
    unit.isNpc ? getNpcLerpSpeed() : getDriftSpeed(),
    camera,
    screenHeight
)
```

---

## 7. LOD (Level of Detail)

`tick()` также переключает представление юнита в зависимости от его размера на экране:

```
screenDiameterPx = (modelRadius / distanceToCamera) * screenHeight / tan(fov/2) * 2
```

| Условие | Отображение |
| ------- | ----------- |
| `screenDiameterPx > 20` | 3D-модель |
| `screenDiameterPx ≤ 20` | точка-спрайт (`DOT_SIZE_PX`) |

Используется `renderer.domElement.clientHeight` (не `window.innerHeight`) — исправление бага iOS Safari с масштабированием.

---

## 8. Резюме потока данных

| Этап | Файл | Описание |
| ---- | ---- | -------- |
| GPS-обновление | `client/src/location.ts` | каждые 10 с |
| Отправка на сервер | `unitAuthenticatedHandler.ts` | `UNIT_MOVED` |
| Серверная трансляция | `server/src/websocket/handlers/unit-move.ts` | обновление `users` + broadcast |
| NPC-тик | `server/src/npc/patrol-loop.ts` | расчёт позиции + broadcast |
| Приём на клиенте | `unitMovedHandler.ts` | `moveTo(coords)` → `desiredPos` |
| Интерполяция | `models.ts` `tick()` | `lerp(desiredPos, speed)` каждый кадр |
| Камера | `sceneSetup.ts` `tickCamera()` | `lerp(desiredTarget, driftSpeed)` |

---

## См. также

- [patrol-movement.md](patrol-movement.md) — серверные расчёты движения NPC
- `client/src/models.ts` — `moveTo()`, `tick()`
- `client/src/sceneSetup.ts` — `setDriftSpeed()`, `tickCamera()`
- `server/src/config.ts` — `CAMERA_DRIFT_SPEED`, `NPC_TICK_INTERVAL_MS`
- `lib/geo/constants.ts` — конвертация координат
