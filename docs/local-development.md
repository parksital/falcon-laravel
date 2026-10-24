# Local Development

How we run and work on the app locally.

## Stack

The app runs in Laravel Sail (Docker), defined in `compose.yaml`:

- **`laravel.app`:** PHP 8.5, Node 24 and Bun. Serves the app with
  `php artisan serve` and runs Vite.
- **`pgsql`:** Postgres 18. The database lives in the `sail-pgsql` Docker volume,
  so it survives `sail down`.

Production runs PHP 8.5.12 (`Dockerfile`).

## Where things run

- **Composer runs on your Mac.** `vendor/` is plain PHP, and the repo is mounted
  into the container, so the container uses the same `vendor/`. It also has to
  come first: `vendor/bin/sail` is installed by `composer install`.
- **Everything else runs through Sail:** `artisan`, Bun, Vite, tests.
  `node_modules` contains native binaries (esbuild, Rollup, Tailwind) built for
  the machine that installed them, so always install with `sail bun install`,
  never `bun install` on your Mac.

The `composer dev` and `composer setup` scripts are leftovers from the Laravel
starter kit. They run the app and `npm` on your Mac. Don't use them.

## Prerequisites

- Docker Desktop, running
- PHP 8.5.12 and Composer, from Homebrew:

  ```sh
  brew install php composer
  php -v        # must print PHP 8.5.12
  brew pin php  # keep brew upgrade from moving PHP
  ```

Before starting Sail, make sure nothing else on your Mac uses ports 80, 5173 or
5433.

## First-time setup

```sh
git clone git@github.com:parksital/falcon-laravel.git
cd falcon-laravel
composer install
cp .env.example .env
```

Set `DB_PASSWORD` in `.env` to any value **before** the first `sail up`. Postgres
creates its user with that password the first time it starts and stores it in
the volume. Changing it later means wiping the database with `sail down -v`.

Service and vendor images are stored on Cloudflare R2 and need the
`CLOUDFLARE_R2_*` values in `.env`.

Then start the containers and prepare the app:

```sh
./vendor/bin/sail up -d
./vendor/bin/sail artisan key:generate
./vendor/bin/sail artisan migrate
./vendor/bin/sail bun install
```

The first `sail up` builds the `laravel.app` image, which takes a few minutes.

## Daily workflow

```sh
./vendor/bin/sail up -d          # app + Postgres
./vendor/bin/sail bun run dev    # Vite with hot reload
```

The app runs at http://127.0.0.1. Stop everything with `./vendor/bin/sail down`.

There is no seed data. Register an account at http://127.0.0.1/register. Mail
goes to the log (`MAIL_MAILER=log`), so the email verification link is in
`storage/logs/laravel.log`.

Sail doesn't start a queue worker. Nothing is queued today, but if a job is
added, run `./vendor/bin/sail artisan queue:listen` in another terminal.

## Common commands

```sh
composer require <package>                 # on your Mac
./vendor/bin/sail artisan migrate
./vendor/bin/sail artisan tinker
./vendor/bin/sail bun add <package>
./vendor/bin/sail bun run types            # TypeScript
./vendor/bin/sail bun run lint             # ESLint (fixes files in place)
./vendor/bin/sail artisan test             # uses in-memory SQLite, see phpunit.xml
```

## Ports

| Port | Service                                     |
| ---- | ------------------------------------------- |
| 80   | App (`APP_PORT`)                            |
| 5173 | Vite dev server (`VITE_PORT`)               |
| 5433 | Postgres, from your Mac (`FORWARD_DB_PORT`) |
