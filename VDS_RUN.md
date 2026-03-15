# Запуск на VDS

VDS: `145.223.80.56` · Node.js 24 · PostgreSQL 15

---

## 1. Переменные окружения

Файл `server/.env`:

```
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/hives
PORT=3000
JWT_SECRET=<random-string>
JWT_REFRESH_SECRET=<another-random-string>
```

Сгенерировать случайные секреты:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
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

## 7. HTTPS через Nginx (требует root)

Node.js остаётся на порту 3000. Nginx принимает 80/443 и проксирует на 3000.

Запустить один раз от root:

```bash
bash /home/hives/projects/hives/setup-https.sh
```

Или вручную:

```bash
apt install -y nginx certbot python3-certbot-nginx
cp /home/hives/projects/hives/nginx.conf /etc/nginx/sites-available/hives
ln -s /etc/nginx/sites-available/hives /etc/nginx/sites-enabled/hives
nginx -t && systemctl reload nginx
ufw allow 80/tcp && ufw allow 443/tcp
ufw delete allow 3000/tcp     # порт 3000 закрыть снаружи
certbot --nginx -d incuby.duckdns.org
```

Сертификат обновляется автоматически через systemd. Проверить:

```bash
certbot renew --dry-run
```

Адрес сервера: `https://incuby.duckdns.org`

| URL | Что |
|-----|-----|
| `https://incuby.duckdns.org` | Игровой клиент |
| `https://incuby.duckdns.org/status/ui` | Дашборд |
| `https://incuby.duckdns.org/docs` | Документация |
| `https://incuby.duckdns.org/admin` | Админ-панель |

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
