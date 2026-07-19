# Agent Guidelines

Before changing code in this repository, read and follow these project rules.

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
