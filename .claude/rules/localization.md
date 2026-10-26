---
paths:
  - "lang/**"
  - "config/**"
  - "resources/js/**"
  - "app/Http/**/*.php"
---

# Localization

- For page-level localization copy, use one translation file per page per
  locale. Match the React page name in kebab-case without the `Page` suffix:
  `LoginPage.tsx` -> `lang/<locale>/login.php`,
  `ForgotPasswordPage.tsx` -> `lang/<locale>/forgot-password.php`.
- Keep page translation files as a flat list of keys. Use clear prefixes when
  grouping related copy, such as `service_field_name` or
  `delete_service_title`, instead of nested arrays.
- When labels from config files need translations, put them in
  `lang/<locale>/config-<name>.php`, such as
  `lang/<locale>/config-service-categories.php`.
- Keep config files locale-neutral. If a config represents selectable values,
  prefer a plain list of stable keys and translate the display labels from the
  matching `config-<name>` language file.
- Use `HandleInertiaRequests` for shared Inertia data and copy that appears
  across layouts or shared components, such as header navigation or account menu
  labels. Prefer broad shared prop names like `layoutCopy` over names tied to a
  specific component when the copy may be reused.
