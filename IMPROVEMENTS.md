# Improvements & Technical Roadmap

## Developer experience / platform
- [ ] Move toward a **monorepo-style workspace** (e.g. pnpm workspaces or Turborepo) to manage `frontend`, `backend`, and shared packages from one root
- [ ] Add a single dev entrypoint (e.g. `pnpm dev`) that boots API, frontend, and Temporal worker/dev server together instead of starting each process manually
- [ ] Extract a shared package (e.g. `packages/shared`) for **DTOs and types** used by both frontend and backend (Lead, CSV import payloads, verification/enrichment results)
- [ ] Generate or centralize OpenAPI/Zod schemas where useful so FE/BE contracts stay aligned

## Reliability & product (AI-assisted)
- [ ] Harden CSV country-code validation warnings in the UI
- [ ] Make email verification timeouts/errors fully explicit in the frontend
- [ ] Enrich-phone: clearer phone source tracking and provider-level timeout/retry policies
- [ ] Consider async status flow for long verification/enrichment operations (queue + poll/push) instead of fully request-blocking UX

## Quality
- [ ] Expand unit tests for country-code validation and email verification rules
- [ ] Add contract tests around shared FE/BE types for bulk import and enrichment

## Suggested order
1. Shared types package + workspace setup
2. Unified `pnpm dev` (FE + BE + Temporal)
3. Test coverage on critical paths
4. Async-friendly UX for verification/enrichment

## Notes from this assessment
- Under a 60-minute timebox, strict execution with human ownership of trade-offs outperformed heavy multi-agent orchestration
- Environment pre-warming and fewer moving processes would reduce setup friction significantly