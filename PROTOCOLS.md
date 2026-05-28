# PROTOCOLS.md - Job Separation & Context Management

## Job Isolation Protocol

**Rule: One task, one context. No bleeding.**

### When Starting New Work

1. **Check current state first**
   - `openclaw status` — what's running?
   - `openclaw tasks` — any active issues?
   - Read `memory/YYYY-MM-DD.md` — what happened today?

2. **Decide: New session or continue?**
   - **New unrelated task** → Spawn subagent or use isolated context
   - **Related continuation** → Stay in current session
   - **Background work** → Spawn with `runtime="subagent"`, `context="isolated"`

3. **Document the handoff**
   - Write to daily memory: what was started, why, where it lives
   - If spawning: include sessionKey/label in memory for traceability

### Spawn Patterns

```bash
# Background task (isolated, no context bleed)
sessions_spawn: runtime="subagent", context="isolated"

# Child needs parent context (rare)
sessions_spawn: runtime="subagent", context="fork"

# ACP harness (Claude, Gemini, etc.)
sessions_spawn: runtime="acp", agentId="..."
```

### Naming Conventions

- **Subagent labels**: `task-{brief-desc}-{timestamp}`
- **Memory entries**: Include sessionKey for cross-reference
- **File outputs**: Timestamped or task-prefixed

### Cleanup Rules

- Subagents: `cleanup="delete"` for one-offs, `cleanup="keep"` for persistent
- Cron jobs: Disable if >5 consecutive errors
- Tasks: Review weekly, clear stale issues

### Current Active Work Log

| Started | Task | Session | Status |
|---------|------|---------|--------|
| 2026-05-28 04:52 UTC | Troubleshoot 7 failed cron jobs | agent:main:main | In progress |

---

*Last updated: 2026-05-28*
