---
name: write-issue
description: Turn a concept or feature idea into small, shippable Linear issues. Use when planning work, splitting a project into issues, or writing or editing a Linear issue.
---

# Write issue

Each issue is the smallest change that can ship on its own and be useful.

## Rules

- One outcome per issue. If it needs "and", consider splitting it.
- Only include what the outcome needs now. Move nice-to-haves to "Out of scope"
  or a later issue instead of adding them to scope.
- No speculative fields, helpers, relations, or config "for later".
- Prefer the existing code and defaults over new abstractions.
- Name the concrete artifacts (tables, columns, models, routes, pages), so the
  implementer doesn't have to guess.
- Set blocking relations when one issue needs another merged first.

## Format

```md
<One or two sentences: what changes and why.>

## Scope

* <concrete change>

## Out of scope

* <tempting extra, deferred>

## Done when

* <observable result>
```

Skip "Done when" if it only repeats the scope.
