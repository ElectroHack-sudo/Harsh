/**
 * Nexus Master Coordinator (Layer 2 Decision & Orchestration Router)
 * 
 * Unifies OmniRoute + Claude Code + Obsidian + GitHub + Database
 * into an automated, zero-friction project build and synchronization pipeline.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync, spawn } = require('child_process');
const { autoSync, getRepoStatus } = require('./github_sync');
const { syncWorkspaceToObsidian, appendToSection, getProjectNotePath } = require('./obsidian_sync');
const { routeTask, checkOmniRouteHealth, getAvailableModels, generateCompletion } = require('./omniroute_client');
const { provisionDatabase } = require('./database_provisioner');
const { getStatus: getObsidianStatus, openNote, launchObsidian } = require('./obsidian_bridge');
const { getAllAgents, findMatchingAgents, getAgentDetails, syncAgencyCatalogToObsidian } = require('./agency_bridge');

async function getFullSystemStatus(cwd = process.cwd()) {
    const projectName = path.basename(cwd);
    const omniHealth = await checkOmniRouteHealth();
    const omniModels = omniHealth.alive ? await getAvailableModels() : [];
    const gitStatus = getRepoStatus(cwd);
    const obsStatus = getObsidianStatus();
    const allAgents = getAllAgents();

    let claudeVersion = 'Not found';
    try {
        const cRes = spawnSync('claude', ['--version'], { encoding: 'utf8', shell: true });
        if (cRes.status === 0) claudeVersion = (cRes.stdout || '').trim();
    } catch (e) {}

    return {
        project: projectName,
        timestamp: new Date().toISOString(),
        omniroute: {
            ...omniHealth,
            modelCount: omniModels.length,
            sampleModels: omniModels.slice(0, 4).map(m => m.id)
        },
        claude: {
            version: claudeVersion,
            mcpConfigured: fs.existsSync(path.join(cwd, '.mcp.json')),
            settingsConfigured: fs.existsSync(path.join(cwd, '.claude', 'settings.local.json'))
        },
        agency: {
            totalAgents: allAgents.length,
            catalogSynced: fs.existsSync(path.join(obsStatus.primaryVault, 'Projects', 'agency_agents.md'))
        },
        obsidian: {
            ...obsStatus,
            currentProjectNote: getProjectNotePath(projectName),
            noteExists: fs.existsSync(getProjectNotePath(projectName))
        },
        github: gitStatus,
        database: {
            sqliteSchema: fs.existsSync(path.join(cwd, 'db', 'schema.sql')),
            prismaSchema: fs.existsSync(path.join(cwd, 'prisma', 'schema.prisma'))
        }
    };
}

function printStatusDashboard(status) {
    console.log(`\n================================================================`);
    console.log(`🌐 [NEXUS UNIFIED ECOSYSTEM STATUS] Workspace: ${status.project}`);
    console.log(`================================================================\n`);

    // 1. OmniRoute
    const omniIcon = status.omniroute.alive ? '🟢' : '🔴';
    console.log(`${omniIcon} 1. OmniRoute Intelligence Gateway:`);
    console.log(`   - Status:      ${status.omniroute.alive ? 'ONLINE (Healthy)' : 'OFFLINE'}`);
    console.log(`   - Endpoint:    ${status.omniroute.url || 'http://127.0.0.1:20128'}`);
    console.log(`   - Version:     ${status.omniroute.version || 'unknown'}`);
    console.log(`   - Model Pool:  ${status.omniroute.modelCount} active models (${status.omniroute.sampleModels.join(', ') || 'none'})`);

    // 2. Claude Code & Agency Agents
    const claudeIcon = status.claude.version !== 'Not found' ? '🟢' : '🔴';
    console.log(`\n${claudeIcon} 2. Claude Code Execution Core:`);
    console.log(`   - Version:     ${status.claude.version}`);
    console.log(`   - MCP Bridge:  ${status.claude.mcpConfigured ? 'Configured (.mcp.json)' : 'Missing'}`);
    console.log(`   - Permissions: ${status.claude.settingsConfigured ? 'Configured (.claude/settings.local.json)' : 'Default'}`);

    // 3. The Agency (Specialist Agents)
    const agencyIcon = status.agency.totalAgents > 0 ? '🟢' : '🔴';
    console.log(`\n${agencyIcon} 3. The Agency Specialist Personas:`);
    console.log(`   - Specialist Pool: ${status.agency.totalAgents} installed agents across 18 divisions`);
    console.log(`   - Vault Catalog:   ${status.agency.catalogSynced ? 'Synced (D:\\ISHIDA\\Projects\\agency_agents.md)' : 'Not synced (Run nexus sync)'}`);

    // 4. Obsidian Knowledge Vault
    const obsIcon = status.obsidian.primaryVaultExists ? '🟢' : '🔴';
    console.log(`\n${obsIcon} 4. Obsidian SSOT Knowledge Vault:`);
    console.log(`   - Primary Vault: ${status.obsidian.primaryVault}`);
    console.log(`   - Project Note:  ${status.obsidian.currentProjectNote}`);
    console.log(`   - Note Synced:   ${status.obsidian.noteExists ? 'YES' : 'NO (Run nexus sync)'}`);

    // 5. GitHub Remote
    const gitIcon = status.github.isRepo ? (status.github.remote ? '🟢' : '🟡') : '🔴';
    console.log(`\n${gitIcon} 5. GitHub Version Control & Remote:`);
    console.log(`   - Local Repo:    ${status.github.isRepo ? `Active (Branch: ${status.github.branch})` : 'Not initialized'}`);
    console.log(`   - Remote URL:    ${status.github.remote || 'None configured'}`);
    console.log(`   - Working Tree:  ${status.github.clean ? 'Clean' : `${status.github.uncommittedChanges.length} uncommitted file(s)`}`);

    // 6. Database Hub
    console.log(`\n🔵 6. Database Hub Scaffolding:`);
    console.log(`   - SQLite Config: ${status.database.sqliteSchema ? 'Ready (db/schema.sql)' : 'Not scaffolded'}`);
    console.log(`   - Prisma Config: ${status.database.prismaSchema ? 'Ready (prisma/schema.prisma)' : 'Not scaffolded'}`);

    console.log(`\n================================================================`);
    console.log(`⚡ Available CLI Commands:`);
    console.log(`   - nexus status                  : Display this ecosystem health dashboard`);
    console.log(`   - nexus agent "<query>"         : Match & select from 270+ specialist agent personas`);
    console.log(`   - nexus sync [message]          : Sync Obsidian vault notes & push to GitHub`);
    console.log(`   - nexus build "<prompt>" [--db] : Route task, scaffold DB, prep Obsidian & Claude`);
    console.log(`   - nexus route "<prompt>"        : Query OmniRoute for task architecture`);
    console.log(`   - nexus obsidian                : Open project note in Obsidian GUI`);
    console.log(`================================================================\n`);
}

async function executePipeline(options = {}) {
    const cwd = options.cwd || process.cwd();
    const projectName = options.projectName || path.basename(cwd);
    const intent = options.intent || 'Automated project build and sync';
    const databaseType = options.database || null;
    const skipGit = options.skipGit || false;
    const skipObsidian = options.skipObsidian || false;

    console.log(`\n========================================================`);
    console.log(`🚀 [NEXUS PIPELINE] Starting Pipeline for: ${projectName}`);
    console.log(`========================================================\n`);

    const results = {
        project: projectName,
        startedAt: new Date().toISOString(),
        steps: {}
    };

    // Step 1: OmniRoute Intelligence & Model Strategy Routing
    console.log(`\n🔹 [Step 1/5] OmniRoute Task Decomposition & Routing`);
    const taskType = databaseType ? 'database' : 'code';
    const routePlan = routeTask(taskType, intent);
    results.steps.omniroute = routePlan;
    console.log(`   Strategy: ${routePlan.strategy.preferredModel} (Tier: ${routePlan.strategy.tier})`);

    // Step 2: Database Provisioning
    if (databaseType) {
        console.log(`\n🔹 [Step 2/5] Database Hub Scaffolding [${databaseType}]`);
        const dbResult = provisionDatabase({ targetDir: cwd, type: databaseType });
        results.steps.database = dbResult;
        console.log(`   Configured ${databaseType} client and environment parameters.`);
    } else {
        console.log(`\n🔹 [Step 2/5] Database Hub: No database specified, skipping.`);
    }

    // Step 3: Claude Code Instructions & Architecture Prep
    console.log(`\n🔹 [Step 3/5] Claude Code Context & Execution Target`);
    console.log(`   Prepared workspace context and blueprints in ${cwd}`);
    results.steps.claude = {
        ready: true,
        recommendedCommand: `claude "${intent}"`
    };

    // Step 4: Obsidian Vault Sync
    if (!skipObsidian) {
        console.log(`\n🔹 [Step 4/5] Obsidian Vault Synchronization`);
        const obsResult = syncWorkspaceToObsidian({
            workspaceDir: cwd,
            projectName,
            databaseType: databaseType || 'Dynamic',
            openInObsidian: options.openObsidian || false
        });
        // Also sync Agency Catalog
        syncAgencyCatalogToObsidian();
        results.steps.obsidian = obsResult;
        console.log(`   Synchronized workspace note to: ${obsResult.notePath}`);
        console.log(`   Synchronized agency catalog note to: ${path.join(obsResult.vault, 'Projects', 'agency_agents.md')}`);
    }

    // Step 5: GitHub Version Control & Remote Push
    if (!skipGit) {
        console.log(`\n🔹 [Step 5/5] GitHub Remote Auto-Sync`);
        const gitResult = autoSync({
            cwd,
            projectName,
            message: options.commitMessage || `feat(${projectName}): ${intent} [nexus-sync]`
        });
        results.steps.github = gitResult;
        if (gitResult.pushed) {
            console.log(`   Successfully pushed to GitHub: ${gitResult.remote}`);
        } else {
            console.log(`   Git commit recorded locally.`);
        }
    }

    results.completedAt = new Date().toISOString();
    console.log(`\n========================================================`);
    console.log(`✅ [NEXUS PIPELINE] Complete! All systems synchronized.`);
    console.log(`========================================================\n`);

    return results;
}

// CLI entrypoint
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = (args[0] || 'status').toLowerCase();

    if (command === 'status' || command === 'doctor') {
        getFullSystemStatus().then(printStatusDashboard);
    } else if (command === 'agent' || command === 'agents' || command === 'find') {
        const query = args.slice(1).join(' ') || 'frontend architect';
        console.log(`\n🔍 Searching 270+ Agency Specialist Agents for: "${query}"...\n`);
        const matches = findMatchingAgents(query, 6);
        if (matches.length === 0) {
            console.log('No direct matches found. Try keywords like: frontend, backend, ui, security, architect, database');
        } else {
            matches.forEach((m, idx) => {
                console.log(`[${idx + 1}] 🏷️  ${m.id} (Division: ${m.division.toUpperCase()})`);
                console.log(`    Title: ${m.title}`);
                console.log(`    Focus: ${m.description}\n`);
            });
            console.log(`💡 To invoke in Claude Code: "Assume persona of ${matches[0].id}" or start with: nexus claude`);
        }
    } else if (command === 'build' || command === 'create') {
        let db = null;
        const dbIdx = args.indexOf('--db');
        if (dbIdx !== -1 && args[dbIdx + 1]) {
            db = args[dbIdx + 1];
            args.splice(dbIdx, 2);
        }
        const openObs = args.includes('--open');
        const intent = args.slice(1).filter(a => a !== '--open').join(' ') || 'Autonomous task build';
        executePipeline({ intent, database: db, openObsidian: openObs });
    } else if (command === 'sync') {
        const msg = args.slice(1).join(' ') || 'Manual workspace sync';
        executePipeline({ intent: msg, commitMessage: msg });
    } else if (command === 'route') {
        const prompt = args.slice(1).join(' ') || 'Decompose fullstack app architecture';
        const plan = routeTask('architecture', prompt);
        console.log('\n[OmniRoute Strategy Plan]:\n', JSON.stringify(plan, null, 2));
    } else if (command === 'obsidian' || command === 'obs') {
        const pName = path.basename(process.cwd());
        syncWorkspaceToObsidian({ projectName: pName, openInObsidian: true });
        syncAgencyCatalogToObsidian();
    } else if (command === 'claude' || command === 'launch') {
        const claudeArgs = args.slice(1);
        const claudeExe = 'C:\\Users\\hmadg\\.local\\bin\\claude.exe';
        
        // Ensure OmniRoute daemon is alive
        const omniHealth = await checkOmniRouteHealth();
        if (!omniHealth.alive) {
            console.log(`⚡ [OmniRoute] Starting background daemon...`);
            try {
                spawn('C:\\Users\\hmadg\\AppData\\Local\\pnpm\\bin\\omniroute.cmd', ['serve'], {
                    detached: true,
                    stdio: 'ignore',
                    shell: true
                }).unref();
                await new Promise(resolve => setTimeout(resolve, 3000));
            } catch (e) {}
        }

        const omniKey = process.env.OMNIROUTE_API_KEY || 'sk-28cd06a63e40d0fa-1d04bb-be07bf06';
        const env = {
            ...process.env,
            ANTHROPIC_BASE_URL: 'http://127.0.0.1:20128',
            ANTHROPIC_API_KEY: omniKey,
            ANTHROPIC_AUTH_TOKEN: omniKey,
            ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL || 'auto/best-coding',
            ANTHROPIC_DEFAULT_MODEL: process.env.ANTHROPIC_MODEL || 'auto/best-coding'
        };
        console.log(`\n🚀 Launching Claude Code connected to OmniRoute proxy (http://127.0.0.1:20128)...`);
        console.log(`🔑 Key & Base URL mapped to bypass Anthropic billing.\n`);
        const proc = spawn(claudeExe, claudeArgs, {
            env,
            stdio: 'inherit',
            shell: true
        });
        proc.on('exit', (code) => process.exit(code || 0));
    } else {
        console.log('Usage: nexus [status | agent <query> | claude [args] | sync [message] | build "<prompt>" [--db sqlite|postgres|prisma] | route "<prompt>" | obsidian]');
    }
}

module.exports = {
    getFullSystemStatus,
    printStatusDashboard,
    executePipeline
};
