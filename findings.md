# Findings: Nexus Unified Pipeline Integration

## Integrated Systems
1. **OmniRoute (`http://localhost:20128`)**:
   - Status: ONLINE (v3.8.49) with 500+ active models.
   - Routes queries, model strategies, and task decomposition across Claude 3.7 Sonnet, DeepSeek, GLM 5.2, and local LLMs.
   - Managed via `tools/omniroute_client.js`.
2. **Claude Code (`claude.exe` 2.1.251)**:
   - Primary coding and tool execution engine at `C:\Users\hmadg\.local\bin\claude.exe`.
   - Connected with `.mcp.json` running `tools/mcp_nexus_server.js`.
   - Grounded with root `CLAUDE.md` and pre-approved execution permissions.
3. **Obsidian Vault (`D:\ISHIDA`)**:
   - Single Source of Truth for blueprints, schemas, and logs located at `D:\ISHIDA\Projects\<project-name>.md`.
   - Formatted with callout blocks, Mermaid topologies, frontmatter, and deep links via `tools/obsidian_sync.js`.
4. **GitHub Auto-Sync**:
   - Git Binary: `C:\Program Files\Git\cmd\git.exe`
   - Remote: `https://github.com/ElectroHack-sudo/Harsh.git` (branch: `main`).
   - Deterministic staging, committing, and push handled by `tools/github_sync.js`.
5. **Database Hub (`tools/database_provisioner.js`)**:
   - Automatically provisions SQLite, PostgreSQL, Supabase, and Prisma client wrappers and schema files.

## CLI Usage
- `nexus status`: Displays live diagnostic health across all 5 systems.
- `nexus sync [message]`: Syncs current workspace changes to Obsidian Vault and pushes to GitHub.
- `nexus build "<prompt>" [--db <type>]`: Decomposes task, plans architecture, readies database, and prepares Claude context.
- `nexus route "<prompt>"`: Inspects OmniRoute strategy and model tier selection.
- `nexus obsidian`: Launches/focuses the current project note in Obsidian GUI.
