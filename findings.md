# Findings: Nexus Unified Pipeline Integration

## Integrated Systems
1. **OmniRoute (`omniroute.cmd` / `localhost:8080`)**:
   - Routes queries, model strategies, and task decomposition across Claude 3.7 Sonnet, DeepSeek, and local LLMs.
   - Evaluated by `tools/omniroute_client.js`.
2. **Claude Code (`claude.exe` 2.1.246)**:
   - Primary coding and tool execution engine at `C:\Users\hmadg\.local\bin\claude.exe`.
   - Connected with `.mcp.json` running `tools/mcp_nexus_server.js`.
3. **Obsidian Vault (`D:\ISHIDA`)**:
   - Single Source of Truth for blueprints, schemas, and logs located at `D:\ISHIDA\Projects\<project-name>.md`.
   - Bi-directionally managed by `tools/obsidian_sync.js`.
4. **GitHub Auto-Sync**:
   - Git Binary: `C:\Program Files\Git\cmd\git.exe`
   - Remote: `https://github.com/ElectroHack-sudo/Harsh.git`
   - Deterministic staging, committing, and push handled by `tools/github_sync.js`.
5. **Database Hub (`tools/database_provisioner.js`)**:
   - Automatically provisions SQLite, PostgreSQL, Supabase, and Prisma client wrappers and schema files.

## CLI Usage
- `nexus sync`: Syncs current workspace changes to Obsidian Vault and pushes to GitHub.
- `nexus build "<prompt>"`: Decomposes task, plans architecture, readies database, and prepares Claude context.
- `nexus status`: Displays Git, Obsidian, and OmniRoute health.
