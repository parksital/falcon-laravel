# Agent Guidelines

Before changing code in this repository, read and follow these project rules.

## Testing

- Do not add or update tests unless the user explicitly asks for tests.
  This project is pre-customer and accepts temporary breakage while product
  flows are still changing quickly.
- Do not automatically start the app or open it in a browser after every
  change. Prefer static checks or a build when appropriate. Only perform
  runtime browser verification when the user explicitly asks for it or when
  the behavior cannot be verified confidently without running the app.
- Use Bun for JavaScript tooling in this repository. Prefer `bun` instead of
  `npm`, and `bunx` instead of `npx`.

## Code Style

- Do not extract simple one-off route or active-state checks into variables.
  Prefer using the expression inline, such as `currentPath.startsWith('/vendor')`,
  unless the condition is reused, complex, or needs a meaningful domain name.
- Do not create static arrays only to map over a few fixed navigation or menu
  items in JSX. Write those elements out explicitly unless the list is dynamic
  or meaningfully reused elsewhere.
- Do not run Prettier automatically. Leave formatting alone unless the user
  explicitly asks for formatting.
- Keep simple JSX props, callbacks, and expressions on one line when they fit
  comfortably. Avoid formatter-style wrapping that makes small expressions
  harder to read.
- Name UI state after the product concept or user intent, not the current
  component mechanism. Prefer names like `isAddServiceOpen`,
  `isCancelAddServiceOpen`, and `addServiceStep` over names that mention
  `Dialog`, `Sheet`, or another
  swappable primitive.
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
- For forms that submit to Laravel/Inertia endpoints, prefer Inertia form
  helpers first. Use `<Form {...store.form()}>`, `disableWhileProcessing`, and
  form slot props for processing/errors when they fit. Use `useForm` when the
  form needs controlled state or custom client-side behavior.
- When using the Inertia `useForm` helper, update individual fields with
  `setData('field', value)` instead of spreading and replacing the whole form
  object, unless a full reset of related form state is intentional.

## UI Style

### Default Approach

Use plain, stock `shadcn/ui` components by default for this project.

When building or updating UI:

- Prefer standard `shadcn` primitives such as `Card`, `Button`, `Input`, `Label`,
  `Dialog`, `Select`, and `Textarea`.
- Keep layouts simple and functional.
- Use minimal Tailwind utility classes beyond normal spacing, sizing, and alignment.
- Preserve the existing design tokens and component APIs unless a change is
  explicitly requested.

### Avoid By Default

Do not add creative or decorative styling unless explicitly requested.

Avoid:

- gradients
- oversized border radii
- unusual visual flourishes
- highly custom spacing systems
- bespoke hero sections
- strong visual redesigns
- heavily stylized onboarding or dashboard treatments

### Decision Rule

If there is any doubt, choose the more boring and more standard `shadcn`
implementation.

### Exceptions

It is okay to add custom styling when:

- the user explicitly asks for a more designed or branded interface
- the project already has an established pattern in that specific area and
  consistency matters
- a visual treatment is necessary to communicate state, hierarchy, or usability
  clearly
