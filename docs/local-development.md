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

## Worktrees

Worktrees live in `.claude/worktrees/<name>`. A new worktree has only tracked
files, so set it up before running anything in it.

1. Start from the latest `develop`. From the main checkout:

   ```sh
   git fetch origin
   git worktree add -b <branch> .claude/worktrees/<name> origin/develop
   ```

   Claude Code's own worktrees branch from `master`. In one of those, run
   `git fetch origin` and `git reset --hard origin/develop` before making any
   changes.

2. From the worktree root, copy `.env` and `vendor/` from the main checkout:

   ```sh
   cp ../../../.env .env
   echo "COMPOSE_PROJECT_NAME=falcon-laravel" >> .env
   cp -Rc ../../../vendor vendor
   ```

   `-c` clones the files on APFS, so the copy is instant and takes no extra
   space. Never symlink `vendor`: Composer resolves the symlink and loads `App\`
   from the main checkout instead of the worktree. If the worktree's
   `composer.lock` differs from the main checkout's, run `composer install` in
   the worktree.

3. Run the app:

   ```sh
   ./vendor/bin/sail up -d          # replaces the running app with this worktree
   ./vendor/bin/sail artisan migrate
   ./vendor/bin/sail bun install
   ./vendor/bin/sail bun run dev
   ```

`COMPOSE_PROJECT_NAME` puts the worktree on the main checkout's Sail stack, so a
worktree runs instead of the main checkout, not alongside it, and uses the same
database. To switch back, run `./vendor/bin/sail up -d` in the main checkout.
Migrations the branch ran stay in the database; roll them back first if
`develop` doesn't expect them.

## Ports

| Port | Service                                     |
| ---- | ------------------------------------------- |
| 80   | App (`APP_PORT`)                            |
| 5173 | Vite dev server (`VITE_PORT`)               |
| 5433 | Postgres, from your Mac (`FORWARD_DB_PORT`) |
