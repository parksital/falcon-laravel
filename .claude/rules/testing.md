---
paths:
  - "tests/**"
---

# Tests (Pest)

- This project uses Pest. Create tests with `vendor/bin/sail artisan make:test --pest {name}`. Most tests should be feature tests; pass `--unit` for a unit test.
- Do not include the test suite directory in `{name}`. Use `SomeFeatureTest`, not `Feature/SomeFeatureTest`.
- Read the `testing-best-practices` skill for guidance on coverage, naming, structure, dependency isolation, and review.
- Do not delete tests or test files without approval.
- When creating models for tests, use their factories. Check for custom factory states before setting up the model manually.
- Faker: use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions for `$this->faker` vs `fake()`.
- Run the narrowest set of tests that covers the change. Pass a file path or `--filter=testName` to `vendor/bin/sail artisan test --compact`, or call the runner directly with `vendor/bin/sail bin pest`.
- Rerun a test after each change to it. After the feature tests pass, ask the user to run the complete suite with `vendor/bin/sail artisan test --compact`.
