# Agent Guidelines

Before changing code in this repository, read and follow these project rules.

To run the app locally, follow `docs/local-development.md`.

## Scope

- Implement exactly what the issue or request lists. Do not add extra fields,
  relations, helpers, or values that defaults already cover; suggest them instead.

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
