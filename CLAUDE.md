# 🌐 CLAUDE.md — Nexus Unified Ecosystem Guide

This workspace integrates **OmniRoute · Agency Agents · Obsidian · GitHub · Claude Code** into a single automated pipeline orchestrated by `nexus.cmd`.

---

## ⚡ CLI Quick Reference

| Command | Purpose |
| :--- | :--- |
| `nexus status` | Live health dashboard: OmniRoute, Claude, Agency, Obsidian, GitHub, DB |
| `nexus claude [args]` | Launch Claude Code via OmniRoute proxy (auth conflict-free) |
| `nexus agent "<query>"` | Search 270+ specialist agents — returns ranked matches |
| `nexus sync ["message"]` | Sync Obsidian vault note + commit + push to GitHub |
| `nexus build "<prompt>" [--db <type>]` | Run full 5-step pipeline (route → DB → Claude → Obsidian → Git) |
| `nexus route "<prompt>"` | Query OmniRoute for optimal model tier & strategy |
| `nexus obsidian` | Open current project note in Obsidian desktop app |

---

## 🔌 MCP Tools (auto-available in every Claude Code session)

The **Nexus MCP Server** is registered in `.mcp.json` and provides 11 tools:

### System & Pipeline
| Tool | Description |
| :--- | :--- |
| `nexus_status` | Real-time diagnostic: OmniRoute, Claude, Agency, Obsidian, GitHub, DB |
| `nexus_full_pipeline` | 5-step automated build: route → scaffold DB → prep Claude → sync Obsidian → push GitHub |

### GitHub
| Tool | Description |
| :--- | :--- |
| `nexus_sync_github` | Stage all, semantic commit, push to `ElectroHack-sudo/Harsh` on `main` |

### Obsidian
| Tool | Description |
| :--- | :--- |
| `nexus_sync_obsidian` | Generate/update project note in `D:\ISHIDA\Projects\` |
| `nexus_append_log` | Append timestamped audit entry to a named section of the project note |

### Database
| Tool | Description |
| :--- | :--- |
| `nexus_provision_db` | Scaffold SQLite, Postgres, Supabase, or Prisma env + schema |

### OmniRoute Intelligence
| Tool | Description |
| :--- | :--- |
| `nexus_omniroute_route` | Get tier-based routing strategy for any task type |
| `nexus_query_llm` | Direct LLM query through OmniRoute (model: `auto/best-coding` by default) |

### Agency Specialist Agents
| Tool | Description |
| :--- | :--- |
| `nexus_find_agent` | Search 270+ agents by keyword — returns top ranked matches with division/title/focus |
| `nexus_get_agent` | Fetch complete instructions, personality, deliverables & workflow for a specific agent |
| `nexus_sync_agency` | Sync full agent catalog → `D:\ISHIDA\Projects\agency_agents.md` |

---

## 🏛️ System Invariants

| Constant | Value |
| :--- | :--- |
| **Code Root** | `D:\ZORO` |
| **Obsidian Vault** | `D:\ISHIDA` (primary vault auto-detected) |
| **Project Notes** | `D:\ISHIDA\Projects\<project-slug>.md` |
| **Agency Catalog** | `D:\ISHIDA\Projects\agency_agents.md` |
| **Git Remote** | `https://github.com/ElectroHack-sudo/Harsh.git` (`main`) |
| **OmniRoute Daemon** | `http://127.0.0.1:20128` |
| **OmniRoute Key** | `OMNIROUTE_API_KEY` from `.env` |
| **Agent Hub** | `~/.claude/agents/` (270+ personas) |

---

## 🔑 Auth Model (Critical)

`nexus claude` sets **only `ANTHROPIC_API_KEY`** (pointing to OmniRoute proxy).  
`ANTHROPIC_AUTH_TOKEN` is **explicitly deleted** from the environment before launch.  
Setting both simultaneously triggers Claude Code's auth conflict warning and breaks OmniRoute proxying — **never set both**.

```
ANTHROPIC_BASE_URL  = http://127.0.0.1:20128
ANTHROPIC_API_KEY   = <omniroute key>
ANTHROPIC_AUTH_TOKEN = <NOT SET — deleted>
```

---

## 🎭 Agency Specialist Agents — Activation Protocol

All 270+ agents are in `~/.claude/agents/`. Every session:

1. **Auto-match**: Use `nexus_find_agent` MCP tool with task keywords to identify the best specialist.
2. **Activate**: Say *"Assume the persona of `<agent-id>`"* or *"You are the `<agent-id>`"*.
3. **Execute with mastery**: Apply the agent's deliverables, code standards, and workflows strictly.
4. **Log progress**: Call `nexus_append_log` after each major milestone to create an audit trail in Obsidian.

**Common agents**: `engineering-frontend-developer`, `engineering-software-architect`, `engineering-sre`, `design-ui-designer`, `engineering-code-reviewer`, `security-appsec-engineer`

---

## 🏗️ Pipeline Architecture

```
User / nexus.cmd
        │
        ├─► nexus status          → All 6 pillars health check
        │
        ├─► nexus claude          → OmniRoute Proxy → Claude Code
        │       └─ MCP Server ────→ nexus_* tools (11 total)
        │
        ├─► nexus agent <query>   → Agency Bridge → ranked agent list
        │
        ├─► nexus build/sync      → executePipeline()
        │       ├─ Step 1: OmniRoute task routing
        │       ├─ Step 2: Database provisioning (optional)
        │       ├─ Step 3: Claude Code context prep
        │       ├─ Step 4: Obsidian vault sync
        │       └─ Step 5: GitHub auto-commit + push
        │
        └─► nexus obsidian        → Opens D:\ISHIDA\Projects\<slug>.md
```

---

## 🚀 Working Workflow

1. Start any session with `nexus status` to verify all pillars are green.
2. Use `nexus_find_agent` to pick the right specialist persona for the task.
3. Build, code, and refactor — use `nexus_append_log` to journal key decisions.
4. When a feature is complete: `nexus sync "feat: description"` → commits to GitHub + updates Obsidian.
5. Always protect `.env`, `node_modules/`, `.tmp/`, and build artifacts (covered by `.gitignore`).
