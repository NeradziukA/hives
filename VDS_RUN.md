# Запуск на VDS

VDS: `145.223.80.56` · Node.js 24 · PostgreSQL 15

---

## 1. Переменные окружения

Файл `server/.env`:

```
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/hives
PORT=3000
```

Если пароль содержит спецсимволы (`%`, `&`, `^`) — закодировать:

| символ | код   |
|--------|-------|
| `%`    | `%25` |
| `&`    | `%26` |
| `^`    | `%5E` |

---

## 2. Установка зависимостей

```bash
cd /home/hives/projects/hives
npm run install:all
```

---

## 3. Миграции БД

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

---

## 5. Сборка

```bash
# Установить зависимости клиента (если первый раз)
cd /home/hives/projects/hives/client && npm install

# Собрать клиент и скопировать в server/static/
cd /home/hives/projects/hives/client && npm run build
cp -r /home/hives/projects/hives/client/dist/* /home/hives/projects/hives/server/static/

# Скомпилировать сервер
cd /home/hives/projects/hives/server && npm run build
```

---

## 6. Запуск через pm2

```bash
cd /home/hives/projects/hives/server
npx pm2 start dist/index.js --name hives
npx pm2 save           # сохранить список процессов
```

Управление:

```bash
npx pm2 status         # статус
npx pm2 logs hives     # логи в реальном времени
npx pm2 restart hives  # перезапуск
npx pm2 stop hives     # остановить
npx pm2 delete hives   # удалить из pm2
```

Автостарт после перезагрузки сервера (требует sudo):

```bash
npx pm2 startup        # выполнить команду которую выдаст pm2
npx pm2 save
```

---

## 7. Внешний доступ

Порт 3000 должен быть открыт в файрволе (требует sudo):

```bash
sudo ufw allow 3000/tcp
```

Адрес сервера: `http://145.223.80.56:3000`

| URL | Что |
|-----|-----|
| `http://145.223.80.56:3000` | Игровой клиент |
| `http://145.223.80.56:3000/status/ui` | Дашборд |
| `http://145.223.80.56:3000/docs` | Документация |

---

## 8. Тесты

```bash
cd /home/hives/projects/hives/server
npm test
```

---

## 9. Пересборка после изменений

```bash
cd /home/hives/projects/hives
npm run build && cd server && npm run build
npx pm2 restart hives
```

---

## Типичные проблемы

**`URIError: URI malformed`** — спецсимволы в пароле, см. п. 1.

**PostgreSQL недоступен:**
```bash
pg_isready -h localhost -p 5432
```

**Порт занят:**
```bash
PORT=4000 npx pm2 start dist/index.js --name hives
```
