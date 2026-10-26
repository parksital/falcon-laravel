---
paths:
  - "app/Actions/Fortify/**"
  - "app/Providers/FortifyServiceProvider.php"
  - "config/fortify.php"
---

# Authentication (Laravel Fortify)

Fortify is a headless authentication backend that provides authentication routes and controllers. Before implementing any authentication feature, use `search-docs` for that feature.

- Check `config/fortify.php` to see what's enabled. Enable features in the `'features' => []` array: `Features::registration()`, `Features::resetPasswords()`, etc.
- To see all Fortify routes, use the `list-routes` tool with `only_vendor: true` and `action: "Fortify"`.
- Fortify includes view routes by default (login, register). Set `'views' => false` to disable them if you're handling views yourself.
- Customize views in `FortifyServiceProvider`'s `boot()` method with `Fortify::loginView()`, `Fortify::registerView()`, etc.
- Customize authentication logic with `Fortify::authenticateUsing()` for custom user retrieval or validation.
- Actions in `app/Actions/Fortify/` handle business logic (user creation, password reset, etc.) and can be modified to change feature behavior.
- Available features: `registration()`, `emailVerification()`, `twoFactorAuthentication()` (add `['confirmPassword' => true, 'confirm' => true]` to require password and OTP confirmation before enabling 2FA), `updateProfileInformation()`, `updatePasswords()`, `resetPasswords()`.
