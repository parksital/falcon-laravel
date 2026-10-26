---
paths:
  - "app/**"
  - "routes/**"
  - "database/**"
  - "config/**"
  - "bootstrap/**"
---

# PHP and Laravel

- Always use curly braces for control structures, even for single-line bodies.
- Use PHP 8 constructor property promotion: `public function __construct(public GitHub $github) { }`. Do not leave empty zero-parameter `__construct()` methods unless the constructor is private.
- Use explicit return type declarations and type hints for all method parameters: `function isAccessible(User $user, ?string $path = null): bool`
- Use TitleCase for Enum keys: `FavoritePerson`, `BestLake`, `Monthly`.
- Prefer PHPDoc blocks over inline comments. Only add inline comments for exceptionally complex logic.
- Use array shape type definitions in PHPDoc blocks.
- Use `vendor/bin/sail artisan make:` commands to create new files (migrations, controllers, models, etc.), and `make:class` for a generic PHP class. Pass `--no-interaction` and the correct options.
- For APIs, default to Eloquent API Resources and API versioning unless existing API routes do not; then follow the existing convention.
- When generating links to other pages, prefer named routes and the `route()` function.
- If you have modified any PHP files, run `vendor/bin/sail bin pint --dirty` before finalizing changes. Do not run `pint --test`; run `vendor/bin/sail bin pint` to fix formatting issues.
