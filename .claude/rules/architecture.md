---
paths:
  - "app/**/*.php"
  - "routes/**/*.php"
---

# Architecture

- Treat the MCP server (`app/Mcp`) and the web app (controllers, form requests,
  Inertia pages) as separate domains. Keep their logic split, even when it
  looks the same.
- Do not extract shared logic into a new file, action class, or service so
  several places can call it. Keep the logic where it's used, such as in the
  MCP tool or the controller and form request.
