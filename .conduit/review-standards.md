# Review Standards

Rules this repo already enforces, used to review contributions here.

- **High** — No `any` types; TypeScript must be explicitly typed.
- **High** — Commit messages follow Conventional Commits format (e.g. `feat(region): add resize handles`).
- **Medium** — Exported functions declare explicit return types.
- **Medium** — Unused variables are prefixed with `_` instead of removed/ignored silently.
- **Decision** — Tests live alongside source using Jest, with mocks in adjacent `__mocks__/` directories.
