# Local Development

How we run and work on the app locally.

## Stack

- **App and database:** Laravel Sail (Docker). Sail runs PHP 8.4 and Postgres 18
  from `compose.yaml`.
- **Frontend:** Vite, run with Bun on the host machine.
- **Tests:** an in-memory SQLite database (see `phpunit.xml`), so they don't need
  Postgres.

The `composer dev` script is a leftover from the Laravel starter kit. It runs
`php artisan serve` and `npm` on the host, and the host can't reach the Sail
database. Don't use it.

## Prerequisites

- Docker Desktop, running
- Bun
- PHP 8.3+ and Composer on the host. They are needed to install `vendor/` (which
  provides `vendor/bin/sail`) and for Vite's Wayfinder plugin, which runs
  `php artisan` while generating route helpers.

## First-time setup

```sh
composer install
cp .env.example .env
```

`.env.example` defaults to SQLite. Point it at Sail's Postgres instead:

```dotenv
APP_URL=http://127.0.0.1
APP_PORT=80
VITE_PORT=5173

DB_CONNECTION=pgsql
DB_HOST=pgsql
DB_PORT=5432
DB_DATABASE=laravel
DB_USERNAME=sail
DB_PASSWORD=password
FORWARD_DB_PORT=5433
```

`FORWARD_DB_PORT=5433` exposes Sail's Postgres on the host without clashing with
a local Postgres on 5432.

Service and vendor images are stored on Cloudflare R2. Fill in the
`CLOUDFLARE_R2_*` variables to upload or display media.

Then start the containers and prepare the app:

```sh
./vendor/bin/sail up -d
./vendor/bin/sail artisan key:generate
./vendor/bin/sail artisan migrate
bun install
```

## Daily workflow

```sh
./vendor/bin/sail up -d   # app + Postgres
bun run dev               # Vite with hot reload
```

The app runs at http://127.0.0.1.

Stop everything with `./vendor/bin/sail down`.

Run `artisan` commands through Sail so they reach the database:

```sh
./vendor/bin/sail artisan migrate
./vendor/bin/sail artisan tinker
```

Sail doesn't start a queue worker. Nothing is queued today, but if a job is added,
run `./vendor/bin/sail artisan queue:listen` in another terminal.

## Checks

```sh
bun run types                 # TypeScript
bun run lint                  # ESLint
./vendor/bin/sail artisan test
```

## Ports

| Port | Service                                |
| ---- | -------------------------------------- |
| 80   | App (`APP_PORT`)                       |
| 5173 | Vite dev server (`VITE_PORT`)          |
| 5433 | Postgres, from the host (`FORWARD_DB_PORT`) |
