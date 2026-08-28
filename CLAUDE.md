# 🌐 CLAUDE.md — Nexus Unified Multi-Model Orchestration Guide

Welcome to the **Nexus Unified Pipeline** workspace. This repository integrates **OmniRoute**, **Claude Code**, **Obsidian Knowledge Vault**, and **GitHub** into a seamless development lifecycle.

---

## ⚡ Quick CLI Commands

| Command | Purpose |
| :--- | :--- |
| `nexus status` | Displays real-time status of OmniRoute, Claude, Obsidian, GitHub, and Database. |
| `nexus claude [args]` | Launches Claude Code connected directly to OmniRoute proxy. |
| `nexus sync "<message>"` | Synchronizes Obsidian project note (`D:\ISHIDA\Projects\zoro.md`) and pushes to GitHub. |
| `nexus build "<prompt>"` | Executes the 5-phase pipeline: Route -> DB -> Claude -> Obsidian -> GitHub. |
| `nexus route "<prompt>"` | Queries OmniRoute intelligence router for recommended architecture & model tier. |
| `nexus obsidian` | Opens/focuses the current project note in Obsidian desktop app. |

---

## 🔌 Connected MCP Tools (`nexus`)

Claude Code has direct access to the **Nexus MCP Server** via `.mcp.json`:
- `nexus_status`: Live diagnostic status across all 5 pillars.
- `nexus_full_pipeline`: 5-step automated workflow (routing, database, execution prep, vault note sync, git push).
- `nexus_sync_github`: Atomic staging, semantic commit, and remote push to `ElectroHack-sudo/Harsh`.
- `nexus_sync_obsidian`: Generates/updates project notes in `D:\ISHIDA\Projects\`.
- `nexus_provision_db`: Scaffolds SQLite, Postgres, Supabase, or Prisma schemas.
- `nexus_omniroute_route`: Dispatches task prompts through OmniRoute model tiers.
- `nexus_query_llm`: Sub-queries OmniRoute model catalog directly.

---

## 🏛️ Invariants & Directory Layout

- **Code Root**: `d:\ZORO`
- **Obsidian Vault**: `D:\ISHIDA\Projects\<project-slug>.md`
- **Git Remote**: `https://github.com/ElectroHack-sudo/Harsh.git` (`main`)
- **OmniRoute Daemon**: `http://localhost:20128` (`sk-28cd06a63e40d0fa-1d04bb-be07bf06`)
- **Agency Agents Hub**: `~/.claude/agents/` (270+ specialist agent personas)
- **Git Ignore**: Strictly protect `.env`, `node_modules/`, `.tmp/`, build artifacts.

---

## 🎭 The Agency — Specialist Agent Activation

All 270+ Agency Agents are installed in `~/.claude/agents/`. In every session:
1. **Auto-Select Specialist**: Match the prompt's domain against relevant Agency Agents (e.g. `engineering-frontend-developer`, `engineering-software-architect`, `design-ui-designer`, `engineering-sre`, `engineering-code-reviewer`).
2. **Execute with Domain Mastery**: Strictly apply the deliverables, architecture standards, and workflows from the matching agent file.
3. **Explicit Call**: When prompted (e.g., *"Activate Frontend Developer mode"* or *"As Senior Developer..."*), assume that exact persona immediately.

---

## 🚀 Working Workflow

1. Always write changes cleanly with appropriate documentation and tests.
2. After finishing major features or refactoring, trigger `nexus sync` to record the change in Obsidian and GitHub.
