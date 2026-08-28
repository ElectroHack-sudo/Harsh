/**
 * Agency Specialist Agents Bridge (Layer 3 Deterministic Tool)
 * 
 * Indexes, searches, and coordinates 270+ specialist agent personas across 18 divisions
 * and connects them seamlessly with Claude Code, OmniRoute, Antigravity, and Obsidian.
 */

const fs = require('fs');
const path = require('path');
const { getPrimaryVault } = require('./obsidian_bridge');

const USER_HOME = process.env.USERPROFILE || process.env.HOME || 'C:\\Users\\hmadg';
const GLOBAL_AGENTS_DIR = path.join(USER_HOME, '.claude', 'agents');
const LOCAL_AGENTS_DIR = path.join(__dirname, '..', 'agency-agents');
const VAULT_ROOT = getPrimaryVault();

function getAgentsSourceDir() {
    if (fs.existsSync(GLOBAL_AGENTS_DIR) && fs.readdirSync(GLOBAL_AGENTS_DIR).length > 0) {
        return GLOBAL_AGENTS_DIR;
    }
    if (fs.existsSync(LOCAL_AGENTS_DIR)) {
        return LOCAL_AGENTS_DIR;
    }
    return null;
}

function parseAgentFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const filename = path.basename(filePath, '.md');
        
        let title = filename;
        let description = '';
        let division = path.basename(path.dirname(filePath));
        let tags = [];

        // Derive division from filename if directory is generic
        if (!division || division.toLowerCase() === 'agents' || division.toLowerCase() === '.') {
            const firstDash = filename.indexOf('-');
            if (firstDash !== -1) {
                division = filename.substring(0, firstDash);
            } else {
                division = 'specialized';
            }
        }

        // Parse YAML frontmatter if present
        if (content.startsWith('---')) {
            const endIdx = content.indexOf('---', 3);
            if (endIdx !== -1) {
                const frontmatter = content.substring(3, endIdx);
                const lines = frontmatter.split('\n');
                for (const line of lines) {
                    const colonIdx = line.indexOf(':');
                    if (colonIdx !== -1) {
                        const key = line.substring(0, colonIdx).trim();
                        const val = line.substring(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
                        if (key === 'title' || key === 'name') title = val;
                        if (key === 'description') description = val;
                        if (key === 'division' || key === 'category') division = val;
                        if (key === 'tags') {
                            tags = val.replace(/[\[\]]/g, '').split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
                        }
                    }
                }
            }
        }

        // Fallback description from first paragraphs
        if (!description) {
            const body = content.replace(/^---[\s\S]*?---/, '').trim();
            const firstLine = body.split('\n').find(l => l.trim().length > 10 && !l.startsWith('#'));
            description = firstLine ? firstLine.trim().substring(0, 150) : 'Specialist Agent Persona';
        }

        return {
            id: filename,
            title,
            division,
            description,
            tags,
            filePath,
            content
        };
    } catch (e) {
        return null;
    }
}

function getAllAgents() {
    const agentsDir = getAgentsSourceDir();
    if (!agentsDir) return [];

    const agents = [];

    function scanDir(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (!entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'scripts' && entry.name !== 'examples') {
                    scanDir(fullPath);
                }
            } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name.toLowerCase() !== 'readme.md' && entry.name.toLowerCase() !== 'contributing.md' && entry.name.toLowerCase() !== 'security.md') {
                const agent = parseAgentFile(fullPath);
                if (agent) agents.push(agent);
            }
        }
    }

    scanDir(agentsDir);
    return agents;
}

function findMatchingAgents(query, limit = 5) {
    const agents = getAllAgents();
    if (!query || query.trim() === '') {
        return agents.slice(0, limit);
    }

    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);

    const scored = agents.map(agent => {
        let score = 0;
        const idLower = agent.id.toLowerCase();
        const titleLower = agent.title.toLowerCase();
        const descLower = agent.description.toLowerCase();
        const divLower = agent.division.toLowerCase();
        const contentLower = agent.content.toLowerCase();

        for (const term of terms) {
            if (idLower.includes(term)) score += 10;
            if (titleLower.includes(term)) score += 8;
            if (divLower.includes(term)) score += 5;
            if (descLower.includes(term)) score += 4;
            if (agent.tags.some(t => t.toLowerCase().includes(term))) score += 6;
            if (contentLower.includes(term)) score += 1;
        }

        return { agent, score };
    });

    return scored
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(s => ({
            id: s.agent.id,
            title: s.agent.title,
            division: s.agent.division,
            description: s.agent.description,
            score: s.score,
            filePath: s.agent.filePath
        }));
}

function getAgentDetails(agentId) {
    const agents = getAllAgents();
    const cleanId = agentId.toLowerCase().replace(/\.md$/, '');
    const found = agents.find(a => a.id.toLowerCase() === cleanId || a.id.toLowerCase().includes(cleanId));
    return found || null;
}

function syncAgencyCatalogToObsidian() {
    const agents = getAllAgents();
    const targetDir = path.join(VAULT_ROOT, 'Projects');
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    const notePath = path.join(targetDir, 'agency_agents.md');

    // Group by division
    const byDivision = {};
    for (const a of agents) {
        if (!byDivision[a.division]) byDivision[a.division] = [];
        byDivision[a.division].push(a);
    }

    const divisionNames = Object.keys(byDivision).sort();

    let md = `---
title: "The Agency: 270+ Specialist Agent Personas"
tags: ["agency", "agents", "nexus", "claude-code", "omniroute", "orchestration"]
created: "${new Date().toISOString()}"
last_synced: "${new Date().toISOString()}"
agent_count: ${agents.length}
divisions: ${divisionNames.length}
---

# 🎭 The Agency — Specialist Agent Catalog & Architecture

> [!NOTE] 🏛️ Executive Agent Collective Summary
> **Total Active Specialists:** \`${agents.length}\`  
> **Operational Divisions:** \`${divisionNames.length}\`  
> **Integration Core:** Linked directly with Claude Code, OmniRoute, Antigravity IDE, and Obsidian.  
> **Last Synchronized:** \`${new Date().toLocaleString()}\`

---

## 🧭 Operational Topology

\`\`\`mermaid
flowchart TD
    Nexus["🌐 Nexus Coordinator"] --> Omni["⚡ OmniRoute (:20128)"]
    Nexus --> Claude["🤖 Claude Code Core"]
    Nexus --> Obs["📓 Obsidian Vault (D:\\ISHIDA)"]
    Nexus --> Git["🐙 GitHub (ElectroHack-sudo/Harsh)"]

    Claude <--> Agency["🎭 The Agency (270+ Specialists)"]
    Agency --> Eng["💻 Engineering (Architects, Frontend, Backend, SRE)"]
    Agency --> Des["🎨 Design (UI, UX, Spatial)"]
    Agency --> Sec["🛡️ Security (AppSec, Pentest, Compliance)"]
    Agency --> Res["🔬 Research & Intelligence"]
    Agency --> Biz["📊 Product & Strategy"]

    style Nexus fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#fff
    style Omni fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#fff
    style Claude fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#fff
    style Agency fill:#4c0519,stroke:#fb7185,stroke-width:2px,color:#fff
\`\`\`

---

## 🗂️ Specialist Divisions Directory

`;

    for (const div of divisionNames) {
        const list = byDivision[div];
        md += `### 📂 Division: \`${div.toUpperCase()}\` (${list.length} Agents)\n\n`;
        md += `| Agent ID | Title | Core Focus |\n`;
        md += `| :--- | :--- | :--- |\n`;
        for (const a of list) {
            md += `| \`${a.id}\` | **${a.title}** | ${a.description.replace(/\|/g, '-')} |\n`;
        }
        md += `\n---\n\n`;
    }

    md += `\n*Synchronized automatically via Nexus Orchestrator & Agency Bridge.*\n`;

    fs.writeFileSync(notePath, md, 'utf8');
    console.log(`[Agency Bridge] Synced catalog note with ${agents.length} agents -> ${notePath}`);
    return {
        success: true,
        notePath,
        agentCount: agents.length,
        divisionCount: divisionNames.length
    };
}

if (require.main === module) {
    const args = process.argv.slice(2);
    const cmd = args[0] || 'list';

    if (cmd === 'list') {
        const agents = getAllAgents();
        console.log(`[Agency Bridge] Total agents found: ${agents.length}`);
        agents.slice(0, 10).forEach(a => console.log(` - [${a.division}] ${a.id}: ${a.title}`));
    } else if (cmd === 'search' || cmd === 'find') {
        const q = args.slice(1).join(' ') || 'frontend architect';
        const matches = findMatchingAgents(q);
        console.log(`[Agency Bridge] Top matches for "${q}":`);
        console.log(JSON.stringify(matches, null, 2));
    } else if (cmd === 'sync') {
        const res = syncAgencyCatalogToObsidian();
        console.log('[Sync Result]:', res);
    } else if (cmd === 'get') {
        const id = args[1];
        const res = getAgentDetails(id);
        console.log(res ? `Found ${res.title} (${res.filePath})\n\n${res.description}` : 'Not found');
    }
}

module.exports = {
    getAllAgents,
    findMatchingAgents,
    getAgentDetails,
    syncAgencyCatalogToObsidian
};
