---
paths:
  - "bootstrap/**"
  - "database/**"
  - "app/Models/**"
  - "app/Console/**"
  - "app/Http/Middleware/**"
---

# Laravel structure and migrations

- This project uses the streamlined Laravel 11+ structure: register middleware, exceptions, and routing in `bootstrap/app.php` and service providers in `bootstrap/providers.php`. There is no `app/Http/Kernel.php` or `app/Console/Kernel.php`, and commands in `app/Console/Commands/` auto-register.
- When modifying a column, the migration must include all of the attributes that were previously defined on the column. Otherwise, they will be dropped and lost.
- Laravel 12 allows limiting eagerly loaded records natively, without external packages: `$query->latest()->limit(10);`.
- Set casts in a `casts()` method on a model rather than the `$casts` property. Follow existing conventions from other models.
