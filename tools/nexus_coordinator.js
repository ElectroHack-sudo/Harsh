/**
 * Nexus Master Coordinator (Layer 2 Decision & Orchestration Router)
 * 
 * Unifies OmniRoute + Claude Code + Obsidian + GitHub + Database
 * into an automated, zero-friction project build and synchronization pipeline.
 */

const fs = require('fs');
const path = require('path');
const { autoSync, getRepoStatus } = require('./github_sync');
const { syncWorkspaceToObsidian, appendToSection } = require('./obsidian_sync');
const { routeTask, checkOmniRouteHealth } = require('./omniroute_client');
const { provisionDatabase } = require('./database_provisioner');

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

    // Step 2: Database Provisioning (if requested or detected)
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
            databaseType: databaseType || 'None',
            openInObsidian: options.openObsidian || false
        });
        results.steps.obsidian = obsResult;
        console.log(`   Synchronized note to: ${obsResult.notePath}`);
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
    console.log(`✅ [NEXUS PIPELINE] Complete!`);
    console.log(`========================================================\n`);

    return results;
}

// CLI entrypoint
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0] || 'sync';

    if (command === 'build' || command === 'create') {
        const intent = args.slice(1).join(' ') || 'Project creation';
        executePipeline({ intent, projectName: path.basename(process.cwd()) });
    } else if (command === 'sync') {
        executePipeline({ intent: 'Manual workspace sync', projectName: path.basename(process.cwd()) });
    } else if (command === 'status') {
        console.log('[Nexus Status]');
        console.log('- Git Status:', getRepoStatus());
        checkOmniRouteHealth().then(h => console.log('- OmniRoute Health:', h));
    } else {
        console.log('Usage: node nexus_coordinator.js [build <prompt> | sync | status]');
    }
}

module.exports = {
    executePipeline
};
