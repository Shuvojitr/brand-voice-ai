# AI Agent Platform (AI customer-support chatbots) — added alongside the AI writing product

Goal: your customers create their own support chatbots, feed them their own website/files/text/Q&A, test them, and paste one snippet into their own site. Everything that exists today keeps working untouched — this is a new, self-contained module reusing your current login, organizations, credits, plans, AI settings, and design.

## What you'll see when it's done

New "AI Agents" area in the user dashboard:
- My Agents (list, status, quick stats)
- Create Agent (5 steps: basics, personality, knowledge, appearance, review)
- Agent detail with tabs: Playground, Knowledge, Conversations, Analytics, Appearance, Settings, Deploy
- Deploy gives a one-line snippet to paste into their website

New admin area: Admin → AI Agents (all agents across accounts, usage, cost, enable/disable/delete, global limits).

## Build order

Because of the size, I'll ship in sequence and check in after each stage, so you can use and review each part as it lands.

1. **Data + security foundation** — new tables for agents, knowledge sources, documents, chunks (with vector search), conversations, messages, feedback, usage, allowed domains. Strict per-organization isolation on every table.
2. **Knowledge pipeline** — website crawler, file processing (PDF/DOCX/TXT/MD/CSV), pasted text, Q&A pairs; background processing with visible status (queued → processing → ready → failed), page/chunk counts, re-crawl, delete.
3. **Chat engine** — retrieves the agent's own knowledge first, then answers with it; refuses to invent prices/policies; configurable fallback message and fallback action (message, collect email, create support ticket, contact link, human handoff).
4. **Dashboard UI** — My Agents, creation wizard, knowledge manager, playground (shows which sources were used), conversations, per-agent analytics incl. unanswered questions, all settings tabs.
5. **Embeddable widget** — lightweight async script, mobile-friendly, streaming replies, welcome message + suggested questions, thumbs up/down feedback, respects appearance settings, allowed domains, rate limits, and agent status.
6. **Admin panel** — cross-account overview, moderation, global model/limit configuration.
7. **Verification pass** — re-test writing platform, templates, documents, billing, blog, support, live chat, analytics, admin/manager panels; plus isolation tests across two accounts.

## Credits and plan limits

Reuses your existing organization credit balance — no second billing system. Agent usage is recorded separately by category so reports can split it out: agent message, embedding, crawl, file processing. Limits come from configurable plan values (max agents, monthly messages, max knowledge sources, pages per crawl, file size, total chunks) rather than hardcoded numbers, so real billing can attach later. Expensive actions check the balance first and stop with a clear upgrade message instead of going negative.

## Security

- Per-organization isolation enforced in the database, not just in the UI; one account's knowledge can never be retrieved by another's agent.
- Public widget only ever carries a public agent id — no keys, no database credentials, no provider keys.
- Allowed-domain checks, per-visitor and per-agent rate limits, request size caps, file type/size validation, crawl page caps, and prompt-injection hardening in the system prompt.
- Agent dashboards and conversations stay out of search engines.

## Technical notes

- Postgres `vector` extension for embeddings + a security-definer match function scoped to one agent id; HNSW index for fast retrieval.
- Embeddings and chat both go through Lovable AI so no customer-supplied keys are needed; admin AI settings choose chat model and embedding model.
- New edge functions: `agent-chat` (public, streaming, JWT off, validated by agent id + domain + rate limit), `agent-crawl`, `agent-process-file`, `agent-embed-text`, `agent-widget` (serves `widget.js`), plus a background worker invoked asynchronously so the browser never blocks.
- Crawler: sitemap discovery with same-origin BFS fallback, boilerplate stripping, ~800-token chunks with overlap, capped pages per crawl, per-source status/error tracking.
- Frontend: new `src/pages/agents/*`, `src/components/agents/*`, `src/hooks/useAgents*.ts`; existing files touched only to add routes (`App.tsx`) and sidebar entries. No new UI framework — existing Tailwind tokens and shadcn components only.
- Widget is a standalone self-contained script (no React on the host page), shadow-DOM isolated so it can't clash with the customer's site styles.
- Reuses `credit_usage` with a category column addition for agent usage, and your existing `support_tickets` for human handoff.

## Not included unless you ask

Real payment capture for agent usage (existing payment setup stays as-is), multilingual translation of the dashboard itself, and voice/phone agents.
