/**
 * Obsidian Vault Auto-Sync Engine (Layer 3 Deterministic Tool)
 * 
 * Synchronizes workspace architecture, blueprints, task plans, findings, and logs
 * directly into the primary Obsidian Vault (D:\ISHIDA\Projects).
 */

const fs = require('fs');
const path = require('path');
const { getPrimaryVault, openNote } = require('./obsidian_bridge');

const VAULT_ROOT = getPrimaryVault();
const PROJECTS_DIR = path.join(VAULT_ROOT, 'Projects');

function ensureProjectsDir() {
    if (!fs.existsSync(PROJECTS_DIR)) {
        fs.mkdirSync(PROJECTS_DIR, { recursive: true });
    }
}

function getProjectSlug(projectName) {
    return projectName.toLowerCase().replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-');
}

function getProjectNotePath(projectName) {
    const slug = getProjectSlug(projectName);
    return path.join(PROJECTS_DIR, `${slug}.md`);
}

function generateProjectNoteContent(data) {
    const {
        name,
        description = 'Autonomous Multi-Model Development Pipeline',
        workspaceDir = process.cwd(),
        githubRepo = '',
        databaseType = 'None',
        taskPlan = '',
        findings = '',
        progress = '',
        architecture = '',
        tags = ['project', 'nexus-sync', 'claude-code', 'omniroute', 'orchestration']
    } = data;

    const timestamp = new Date().toISOString();
    const formattedDate = new Date().toLocaleString();

    return `---
title: "${name}"
tags: [${tags.map(t => `"${t}"`).join(', ')}]
created: "${timestamp}"
last_synced: "${timestamp}"
workspace: "${workspaceDir.replace(/\\/g, '/')}"
github_repo: "${githubRepo}"
database: "${databaseType}"
status: "active"
---

# 🌐 ${name} (Nexus Master Workspace)

> [!NOTE] ⚡ Executive System Summary
> **Project Identity:** \`${name}\`  
> **Workspace Path:** \`${workspaceDir}\`  
> **Remote Repository:** ${githubRepo ? `[${githubRepo}](${githubRepo})` : '`https://github.com/ElectroHack-sudo/Harsh.git`'}  
> **Persistence Hub:** \`${databaseType}\`  
> **Last Synchronized:** \`${formattedDate}\`  

---

## 🏗️ Architectural Topology & Flow

\`\`\`mermaid
flowchart TD
    subgraph Layer1_Intent ["Layer 1: Orchestration & CLI"]
        User["User / Agent"] --> NexusCLI["nexus.cmd / coordinator"]
        ClaudeCode["Claude Code Engine (2.1.251)"] <--> NexusMCP["Nexus MCP Bridge"]
    end

    subgraph Layer2_Intelligence ["Layer 2: OmniRoute Model Hub"]
        NexusCLI <--> OmniRoute["OmniRoute (:20128)"]
        OmniRoute --> AIModels["Claude 3.7 / Haiku / NVIDIA GLM / Combo"]
    end

    subgraph Layer3_Persistence ["Layer 3: Knowledge & Remote Git"]
        NexusCLI --> ObsVault["Obsidian Vault (D:\\ISHIDA\\Projects)"]
        NexusCLI --> GitHubRemote["GitHub Remote (ElectroHack-sudo/Harsh)"]
        NexusCLI --> DBHub["Database Provisioner"]
    end

    style Layer1_Intent fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#fff
    style Layer2_Intelligence fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#fff
    style Layer3_Persistence fill:#1c1917,stroke:#f43f5e,stroke-width:2px,color:#fff
\`\`\`

---

## 📋 Task & Blueprint Execution Plan

${taskPlan || `> [!TIP] Active Phased Roadmap
- [x] **Phase 1: Discovery & Architecture Alignment** (OmniRoute + Claude + Obsidian + GitHub)
- [x] **Phase 2: OmniRoute Model Gateway Configuration** (Port 20128, live routing, dynamic model pool)
- [x] **Phase 3: Nexus Unified CLI & MCP Bridge Integration** (nexus.cmd, mcp_nexus_server.js)
- [x] **Phase 4: Obsidian Vault Sync** (D:\\ISHIDA\\Projects\\${getProjectSlug(name)}.md)
- [x] **Phase 5: Remote Version Control Auto-Sync** (GitHub auto-commit & push)
`}

---

## 🔍 Intelligence, Models & Findings

${findings || `> [!INFO] Live System Connectivity
- **OmniRoute Gateway**: Active at \`http://localhost:20128\` (v3.8.49).
- **Claude Code Engine**: Active with \`.mcp.json\` server \`nexus\` running stdio bridge.
- **Obsidian Vault**: Active at \`D:\\ISHIDA\`.
- **GitHub Remote**: \`https://github.com/ElectroHack-sudo/Harsh.git\` on branch \`main\`.
`}

---

## 📈 Execution Logs & Audit Trail

${progress || `- **${formattedDate}**: Synchronized workspace state across OmniRoute, Claude, Obsidian, and GitHub via Nexus Orchestrator.`}

---
*Auto-generated and synchronized by **Nexus Orchestrator**.*
`;
}

function syncWorkspaceToObsidian(options = {}) {
    ensureProjectsDir();

    const workspaceDir = options.workspaceDir || process.cwd();
    const projectName = options.projectName || path.basename(workspaceDir);
    const githubRepo = options.githubRepo || 'https://github.com/ElectroHack-sudo/Harsh.git';
    const databaseType = options.databaseType || 'Auto / Dynamic';

    console.log(`[Obsidian Sync] Synchronizing workspace "${projectName}" -> Obsidian Vault (${PROJECTS_DIR})`);

    const readSafe = (filename) => {
        const filePath = path.join(workspaceDir, filename);
        return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
    };

    const taskPlan = readSafe('task_plan.md');
    const findings = readSafe('findings.md');
    const progress = readSafe('progress.md');
    const architecture = readSafe(path.join('architecture', 'nexus_pipeline.md')) || readSafe('README.md');

    const notePath = getProjectNotePath(projectName);
    const noteContent = generateProjectNoteContent({
        name: projectName,
        workspaceDir,
        githubRepo,
        databaseType,
        taskPlan,
        findings,
        progress,
        architecture
    });

    fs.writeFileSync(notePath, noteContent, 'utf8');
    console.log(`[Obsidian Sync] Note saved: ${notePath}`);

    if (options.openInObsidian) {
        openNote(`Projects/${getProjectSlug(projectName)}`);
    }

    return {
        success: true,
        notePath,
        vault: VAULT_ROOT,
        project: projectName
    };
}

function appendToSection(projectName, sectionHeader, contentToAppend) {
    ensureProjectsDir();
    const notePath = getProjectNotePath(projectName);
    if (!fs.existsSync(notePath)) {
        syncWorkspaceToObsidian({ projectName });
    }

    let note = fs.readFileSync(notePath, 'utf8');
    const timestamp = new Date().toISOString();
    const entry = `\n- **${new Date().toLocaleTimeString()}**: ${contentToAppend}`;

    if (note.includes(sectionHeader)) {
        note = note.replace(sectionHeader, `${sectionHeader}${entry}`);
    } else {
        note += `\n\n## ${sectionHeader}${entry}`;
    }

    note = note.replace(/last_synced:\s*".*?"/, `last_synced: "${timestamp}"`);

    fs.writeFileSync(notePath, note, 'utf8');
    console.log(`[Obsidian Sync] Appended log to "${sectionHeader}" in ${notePath}`);
    return { success: true, notePath };
}

// CLI entrypoint
if (require.main === module) {
    const args = process.argv.slice(2);
    const cmd = args[0] || 'sync';

    if (cmd === 'sync') {
        const pName = args[1] || path.basename(process.cwd());
        const result = syncWorkspaceToObsidian({ projectName: pName, openInObsidian: args.includes('--open') });
        console.log('[Result]:', result);
    } else if (cmd === 'append') {
        const pName = args[1] || path.basename(process.cwd());
        const sec = args[2] || '📈 Execution Logs & Audit Trail';
        const msg = args.slice(3).join(' ') || 'Manual update';
        appendToSection(pName, sec, msg);
    } else if (cmd === 'test') {
        const result = syncWorkspaceToObsidian({ projectName: 'zoro' });
        console.log('[Test Sync Result]:', result);
    } else {
        console.log('Usage: node obsidian_sync.js [sync [name] [--open] | append [name] [section] [text] | test]');
    }
}

module.exports = {
    VAULT_ROOT,
    PROJECTS_DIR,
    getProjectSlug,
    getProjectNotePath,
    syncWorkspaceToObsidian,
    appendToSection
};
