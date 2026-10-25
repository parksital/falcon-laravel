#!/usr/bin/env bash
# Claude Code WorktreeCreate hook: branches new worktrees from the latest
# origin/develop and copies vendor/, node_modules/ and .env from the main
# checkout, so `./vendor/bin/sail up -d` works in the worktree right away.
set -euo pipefail

name=$(jq -r .name)
root=$(dirname "$(git -C "$CLAUDE_PROJECT_DIR" rev-parse --path-format=absolute --git-common-dir)")
dir="$root/.claude/worktrees/$name"

if [ ! -d "$dir" ]; then
    {
        git -C "$root" fetch --quiet origin develop
        git -C "$root" worktree add --quiet -b "worktree-$name" "$dir" origin/develop
        cp "$root/.env" "$dir/.env"
        # Share the main checkout's Sail stack, so `sail up -d` in the worktree
        # swaps the running app over to it and keeps the database.
        echo "COMPOSE_PROJECT_NAME=$(basename "$root")" >> "$dir/.env"
        # -c clones on APFS, so the copy is instant and takes no extra space.
        cp -Rc "$root/vendor" "$dir/vendor"
        cp -Rc "$root/node_modules" "$dir/node_modules"
        if ! cmp -s "$root/composer.lock" "$dir/composer.lock"; then
            composer install --working-dir="$dir" --no-interaction --quiet
        fi
    } >&2
fi

echo "$dir"
