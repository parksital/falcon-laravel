---
paths:
  - "resources/js/**"
---

# Frontend Code Style

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
- For forms that submit to Laravel/Inertia endpoints, prefer Inertia form
  helpers first. Use `<Form {...store.form()}>`, `disableWhileProcessing`, and
  form slot props for processing/errors when they fit. Use `useForm` when the
  form needs controlled state or custom client-side behavior.
- When using the Inertia `useForm` helper, update individual fields with
  `setData('field', value)` instead of spreading and replacing the whole form
  object, unless a full reset of related form state is intentional.
