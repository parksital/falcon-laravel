FROM dunglas/frankenphp:1-php8.3-bookworm AS php-base

WORKDIR /app

RUN install-php-extensions \
    pdo_pgsql \
    intl \
    zip \
    opcache

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

FROM php-base AS vendor

COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --no-progress \
    --no-scripts \
    --optimize-autoloader

FROM oven/bun:1 AS node-modules

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

FROM php-base AS build

COPY --from=oven/bun:1 /usr/local/bin/bun /usr/local/bin/bun
COPY --from=oven/bun:1 /usr/local/bin/bunx /usr/local/bin/bunx

WORKDIR /app

COPY . /app
COPY --from=vendor /app/vendor /app/vendor
COPY --from=node-modules /app/node_modules /app/node_modules

RUN export APP_ENV=production APP_DEBUG=false APP_KEY=base64:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA= CACHE_STORE=file SESSION_DRIVER=file QUEUE_CONNECTION=sync \
    && rm -f bootstrap/cache/*.php \
    && mkdir -p bootstrap/cache storage/framework/cache storage/framework/sessions storage/framework/views \
    && php artisan package:discover --ansi \
    && php artisan wayfinder:generate --with-form \
    && bun run build

FROM php-base AS app

ENV APP_ENV=production
ENV APP_DEBUG=false
ENV LOG_CHANNEL=stderr
ENV PHP_OPCACHE_ENABLE=1

COPY . /app
COPY --from=vendor /app/vendor /app/vendor
COPY --from=build /app/bootstrap/cache /app/bootstrap/cache
COPY --from=build /app/public/build /app/public/build
COPY Caddyfile /etc/caddy/Caddyfile

RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 80 443

CMD ["frankenphp", "run", "--config", "/etc/caddy/Caddyfile"]
