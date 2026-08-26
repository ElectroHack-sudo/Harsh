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
        description = 'Autonomous Multi-Model Project',
        workspaceDir = process.cwd(),
        githubRepo = '',
        databaseType = 'None',
        taskPlan = '',
        findings = '',
        progress = '',
        architecture = '',
        tags = ['project', 'nexus-sync', 'claude-code', 'omniroute']
    } = data;

    const timestamp = new Date().toISOString();
    const tagList = tags.map(t => `#${t}`).join(' ');

    return `---
title: "${name}"
tags: [${tags.map(t => `"${t}"`).join(', ')}]
created: "${timestamp}"
last_synced: "${timestamp}"
workspace: "${workspaceDir.replace(/\\/g, '/')}"
github_repo: "${githubRepo}"
database: "${databaseType}"
status: "in-progress"
---

# 🚀 ${name}

> **Quick Summary:** ${description}  
> **Tags:** ${tagList}  
> **Workspace:** \`${workspaceDir}\`  
> **GitHub Remote:** ${githubRepo ? `[${githubRepo}](${githubRepo})` : '_Not linked yet_'}  
> **Database Layer:** \`${databaseType}\`  
> **Last Synchronized:** ${timestamp}

---

## 🎯 Architecture & Data Schema
${architecture || '```mermaid\nflowchart LR\n    OmniRoute --> ClaudeCode\n    ClaudeCode --> Database\n    ClaudeCode --> GitHub\n    ClaudeCode --> Obsidian\n```'}

---

## 📋 Phased Task Plan
${taskPlan || '- [ ] Phase 1: Blueprint & Discovery\n- [ ] Phase 2: Implementation & Database Setup\n- [ ] Phase 3: Verification & GitHub Sync'}

---

## 🔍 Key Findings & Intelligence
${findings || '_No findings recorded yet._'}

---

## 📈 Execution & Progress Log
${progress || `- **${new Date().toLocaleDateString()}**: Project synchronized into Obsidian vault via Nexus Pipeline.`}

---
*Auto-generated & managed by Nexus Orchestrator (OmniRoute + Claude + Obsidian + GitHub).*
`;
}

function syncWorkspaceToObsidian(options = {}) {
    ensureProjectsDir();

    const workspaceDir = options.workspaceDir || process.cwd();
    const projectName = options.projectName || path.basename(workspaceDir);
    const githubRepo = options.githubRepo || '';
    const databaseType = options.databaseType || 'Auto';

    console.log(`[Obsidian Sync] Synchronizing workspace "${projectName}" -> Obsidian Vault (${PROJECTS_DIR})`);

    // Read workspace markdown files if present
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

    // Update last_synced
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
        const sec = args[2] || '📈 Execution & Progress Log';
        const msg = args.slice(3).join(' ') || 'Manual update';
        appendToSection(pName, sec, msg);
    } else if (cmd === 'test') {
        const result = syncWorkspaceToObsidian({ projectName: 'ZORO-Nexus-Test' });
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
