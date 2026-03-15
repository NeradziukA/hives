# Запуск на VDS

## Требования

- Node.js ≥ 24
- PostgreSQL 15 (уже запущен на `localhost:5432`)

---

## 1. Переменные окружения

Файл `server/.env` должен содержать:

```
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/hives
```

Если пароль содержит спецсимволы (`%`, `&`, `^` и др.) — закодировать их:

| символ | код   |
|--------|-------|
| `%`    | `%25` |
| `&`    | `%26` |
| `^`    | `%5E` |
| `@`    | `%40` |

---

## 2. Установка зависимостей

```bash
cd /home/hives/projects/hives
npm run install:all
```

---

## 3. Применить миграции БД

```bash
cd /home/hives/projects/hives/server
export $(cat .env | xargs)
npm run db:migrate
```

---

## 4. Создать игрока

```bash
cd /home/hives/projects/hives/server
npm run user:create <username> <password>
```

Пример:
```bash
npm run user:create admin secret123
```

---

## 5. Собрать и запустить

```bash
cd /home/hives/projects/hives
npm run build        # сборка клиента → server/static/
cd server
npm run build        # компиляция TypeScript → dist/
npm start            # запуск сервера
```

Или одной командой из корня:

```bash
cd /home/hives/projects/hives && npm run build && cd server && npm start
```

Сервер слушает на **порту 3000**.

---

## 6. Внешний доступ

Внешний IP VDS: **`145.223.80.56`**

| URL | Что |
|-----|-----|
| `http://145.223.80.56:3000` | Игровой клиент |
| `http://145.223.80.56:3000/status/ui` | Дашборд игроков |
| `http://145.223.80.56:3000/status` | JSON со статусом |
| `http://145.223.80.56:3000/docs` | Документация |

### Открыть порт 3000 в файрволе

Если порт недоступен снаружи — нужно открыть его через `ufw` (требует sudo):

```bash
sudo ufw allow 3000/tcp
sudo ufw status
```

Или через `iptables`:

```bash
sudo iptables -I INPUT -p tcp --dport 3000 -j ACCEPT
```

### Проверка доступности порта

```bash
# С самого VDS:
curl -s http://145.223.80.56:3000

# Локально — убедиться что сервер запущен:
curl -s http://localhost:3000
```

### Тест авторизации

```bash
curl -s -X POST http://145.223.80.56:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"secret123"}' | cat
```

Ожидаемый ответ: `{"id":"<uuid>"}`

---

## 7. Тесты

```bash
cd /home/hives/projects/hives/server
npm test
```

---

## 8. Пересборка после изменений

После изменений в клиенте:
```bash
cd /home/hives/projects/hives
npm run build        # клиент + копирует в server/static/
cd server && npm run build
```

После изменений только в сервере:
```bash
cd /home/hives/projects/hives/server
npm run build
```

Перезапуск сервера: `Ctrl+C`, затем `npm start`.

---

## Типичные проблемы

**`URIError: URI malformed`** — спецсимволы в пароле в `DATABASE_URL`, см. п. 1.

**`connection refused` к PostgreSQL** — проверить статус:
```bash
pg_isready -h localhost -p 5432
sudo systemctl status postgresql
```

**Порт 3000 занят** — задать другой через переменную:
```bash
PORT=4000 npm start
```

**Порт 3000 не открыт снаружи** — открыть через sudo (см. п. 6) или запустить сервер фоново с nohup и использовать другой открытый порт:
```bash
PORT=8080 nohup npm start > /tmp/hives.log 2>&1 &
tail -f /tmp/hives.log
```
