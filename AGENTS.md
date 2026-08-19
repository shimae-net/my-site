# Agent Guidance

## Project direction

Before proposing or making a material change, read [docs/engineering-inception-deck.md](docs/engineering-inception-deck.md). It is the source of truth for scope, trade-offs, quality expectations, and review triggers.

This is a long-lived, low-cost personal static blog. Preserve a Lean implementation: favor Markdown, static generation, and the existing Cloudflare static-asset deployment over new services or abstractions.

## Scope and change boundaries

- Do not add a CMS, database, search, analytics, comments, authentication, user data handling, or other external service unless the user explicitly authorizes it and gives a concrete purpose with a cost-effective return.
- Do not add elaborate visual design or color systems without an explicit request.
- Treat published content as public and potentially irrecoverable. Do not add personal data, credentials, internal company information, or third-party non-public information.
- The site owner writes article content. Agents may help with research, proposals, implementation when explicitly authorized, and verification.

## Approval boundaries

- Do not deploy, publish content, add external services, or make the final judgment that content is safe to publish without the site owner's explicit approval.
- For implementation requests, limit changes to the stated task. Explain material trade-offs and request direction before expanding scope.
- Keep the existing user changes in the worktree intact unless the user asks to change them.

## Validation

Run the checks relevant to a change before handoff:

```sh
pnpm check
pnpm build
```

For changes that affect generated pages or templates, also inspect the built site as appropriate: the home page, one article page, a mobile-width layout, and primary links (article, GitHub, and sitemap).

If a check fails because of unrelated pre-existing worktree changes, do not modify those changes just to make the check pass. Report the exact cause.

## Working conventions

- Article sources are in `content/blog/`; use `pnpm new:post <slug> "<title>"` to create a post.
- Static build logic is in `tools/`; templates are in `templates/`; public files are in `public/`.
- Generated `dist/` output is not committed.
- When a decision changes the project's direction or complexity budget, update the inception deck with its rationale and review trigger.
