# Review Standards

Rules this repo already enforces, used to review contributions here.

- **High** — No Box-internal information in code, comments, docs, or the PR title and body: internal hostnames or URLs (any Box domain that is not publicly reachable), employee or customer names, emails, or internal Slack channels.
- **High** — No references to private Box repositories or internal services in comments, docs, or the PR title and body. Only name repositories that are public under `github.com/box`. Runtime string values, such as a client name, are not references.
- **Medium** — No issue-tracker ticket IDs (an uppercase project key, a dash, and a number, such as `ABC-123`) in code, comments, docs, or the PR title and body, including `TODO` comments.
- **Medium** — Tests live in `__tests__/` directories next to the source they cover, named `*-test.ts`, `*-test.tsx`, or `*-test.js`, with module mocks in adjacent `__mocks__/` directories.
