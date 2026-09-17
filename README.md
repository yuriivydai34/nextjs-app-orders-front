# nextjs-app-orders-front

Адмін-панель Gaderia: керування каталогом, замовленнями, користувачами та звітами.

Це **статичний фронтенд** (Next.js `output: 'export'`) — сервера Node.js у продакшені немає. Уся робота з даними йде запитами з браузера до окремого бекенду.

## Стек

- Next.js 16 (App Router, статичний експорт)
- React 19
- HeroUI 3 + Tailwind CSS 4
- TypeScript

## Запуск

```bash
npm install
npm run dev
```

Бекенд локально теж займає порт 3000, тож фронт зручніше піднімати на іншому: `npm run dev -- -p 3001`.

### Змінні оточення

Створити `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

`NEXT_PUBLIC_API_URL` — базовий URL бекенду (проєкт `gaderia_mobile_admin_back`, локально слухає `3000`). Змінна обов'язкова: без неї всі запити підуть на `undefined/...`. Оскільки префікс `NEXT_PUBLIC_`, значення вшивається у бандл **під час білду**, а не читається в рантаймі — при зміні адреси потрібен перезбір.

## Скрипти

| Команда | Дія |
| --- | --- |
| `npm run dev` | dev-сервер |
| `npm run build` | продакшн-білд; статика складається в `out/` |
| `npm run start` | попередній перегляд білду |
| `npm run lint` | ESLint |

## Структура

```
app/
├── (auth)/              логін і реєстрація
├── dashboard/
│   ├── products/        каталог + сортування
│   ├── orders/          замовлення, фільтри, редагування, експорт
│   ├── customers/       користувачі
│   ├── report/          звіти за період
│   ├── overview/        огляд
│   └── settings/        налаштування
├── actions/             обгортки над HTTP-викликами бекенду
├── lib/api.ts           fetch з Bearer-токеном і обробкою 401
└── _components/         тема (світла/темна)
```

`/` редіректить на `/dashboard`, `/dashboard` — на `/dashboard/products`.

### Ендпоінти бекенду

`/auth/login`, `/auth/register`, `/accounts`, `/catalog`, `/payments`, `/payments/report`.

## Автентифікація

JWT зберігається у `localStorage` під ключем `token`. [`apiFetch`](app/lib/api.ts) додає його заголовком `Authorization: Bearer …` і при `401` чистить токен та редіректить на `/login`. Захист маршрутів — клієнтський, у [`app/dashboard/layout.tsx`](app/dashboard/layout.tsx).

> Серверного гарда немає і бути не може: статичний експорт вимикає middleware/proxy. Єдине справжнє джерело правди щодо доступу — бекенд.

## Деплой

Автоматично при push у `main` — [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): `npm ci` → `npm run build` → rsync теки `out/` на сервер у `/home/gaderia/gaderia.com.ua/next-admin/`.

Секрети репозиторію: `NEXT_PUBLIC_API_URL`, `SSH_PRIVATE_KEY`, `SSH_HOST`, `SSH_USER`.

## Примітки для розробки

Версія Next.js новіша за те, що зазвичай знають LLM-асистенти, — конвенції змінилися (наприклад, `middleware` перейменовано на `proxy`). Перед правками звіряйся з `node_modules/next/dist/docs/`, як просить [`AGENTS.md`](AGENTS.md).
