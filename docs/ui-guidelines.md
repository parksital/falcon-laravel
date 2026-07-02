# UI Guidelines

## Default Approach

Use plain, stock `shadcn/ui` components by default for this project.

When building or updating UI:

- Prefer standard `shadcn` primitives such as `Card`, `Button`, `Input`, `Label`, `Dialog`, `Select`, and `Textarea`.
- Keep layouts simple and functional.
- Use minimal Tailwind utility classes beyond normal spacing, sizing, and alignment.
- Preserve the existing design tokens and component APIs unless a change is explicitly requested.

## Avoid By Default

Do not add creative or decorative styling unless explicitly requested.

Avoid:

- gradients
- oversized border radii
- unusual visual flourishes
- highly custom spacing systems
- bespoke hero sections
- strong visual redesigns
- heavily stylized onboarding or dashboard treatments

## Decision Rule

If there is any doubt, choose the more boring and more standard `shadcn` implementation.

## Exceptions

It is okay to add custom styling when:

- the user explicitly asks for a more designed or branded interface
- the project already has an established pattern in that specific area and consistency matters
- a visual treatment is necessary to communicate state, hierarchy, or usability clearly
