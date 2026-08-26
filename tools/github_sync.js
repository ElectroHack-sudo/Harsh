/**
 * GitHub & Git Auto-Sync Engine (Layer 3 Deterministic Tool)
 * 
 * Automatically initializes, stages, commits, and pushes project code to GitHub.
 * Handles Git binary resolution on Windows and protects sensitive files.
 */

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Locate Git executable on Windows
function getGitExecutable() {
    const candidatePaths = [
        'C:\\Program Files\\Git\\cmd\\git.exe',
        'C:\\Program Files\\Git\\bin\\git.exe',
        'C:\\Users\\' + (process.env.USERNAME || 'hmadg') + '\\AppData\\Local\\Programs\\Git\\bin\\git.exe',
        'git'
    ];

    for (const p of candidatePaths) {
        if (p === 'git') {
            try {
                const res = spawnSync('git', ['--version'], { encoding: 'utf8' });
                if (res.status === 0) return 'git';
            } catch (e) {}
        } else if (fs.existsSync(p)) {
            return p;
        }
    }
    return 'git';
}

const GIT_EXE = getGitExecutable();

function runGit(args, cwd = process.cwd()) {
    try {
        const result = spawnSync(GIT_EXE, args, {
            cwd,
            encoding: 'utf8',
            maxBuffer: 10 * 1024 * 1024
        });
        return {
            success: result.status === 0,
            stdout: (result.stdout || '').trim(),
            stderr: (result.stderr || '').trim(),
            status: result.status
        };
    } catch (err) {
        return {
            success: false,
            stdout: '',
            stderr: err.message,
            status: 1
        };
    }
}

function ensureGitignore(dir) {
    const gitignorePath = path.join(dir, '.gitignore');
    const defaultEntries = [
        'node_modules/',
        '.env',
        '.env.*',
        '!.env.example',
        '.tmp/',
        'dist/',
        'build/',
        '*.log',
        '.DS_Store',
        'Thumbs.db'
    ];

    let currentEntries = [];
    if (fs.existsSync(gitignorePath)) {
        currentEntries = fs.readFileSync(gitignorePath, 'utf8')
            .split('\n')
            .map(l => l.trim())
            .filter(Boolean);
    }

    let modified = false;
    for (const entry of defaultEntries) {
        if (!currentEntries.includes(entry)) {
            currentEntries.push(entry);
            modified = true;
        }
    }

    if (modified || !fs.existsSync(gitignorePath)) {
        fs.writeFileSync(gitignorePath, currentEntries.join('\n') + '\n', 'utf8');
    }
}

function getRepoStatus(dir = process.cwd()) {
    const isRepo = runGit(['rev-parse', '--is-inside-work-tree'], dir).success;
    if (!isRepo) {
        return { isRepo: false, clean: true, branch: null, remote: null };
    }

    const branch = runGit(['branch', '--show-current'], dir).stdout || 'main';
    const statusOutput = runGit(['status', '--porcelain'], dir).stdout;
    const remoteOutput = runGit(['remote', '-v'], dir).stdout;

    let remoteUrl = null;
    if (remoteOutput) {
        const match = remoteOutput.match(/origin\s+([^\s]+)\s+\(push\)/) || remoteOutput.match(/origin\s+([^\s]+)/);
        if (match) remoteUrl = match[1];
    }

    return {
        isRepo: true,
        clean: statusOutput.length === 0,
        uncommittedChanges: statusOutput ? statusOutput.split('\n').map(s => s.trim()) : [],
        branch,
        remote: remoteUrl
    };
}

function autoSync(options = {}) {
    const targetDir = options.cwd || process.cwd();
    const projectName = options.projectName || path.basename(targetDir);
    const customMessage = options.message || null;
    const remoteUrl = options.remoteUrl || null;

    console.log(`[GitHub Sync] Initiating synchronization for: ${projectName} (${targetDir})`);

    // 1. Ensure .gitignore is sound
    ensureGitignore(targetDir);

    // 2. Check if git repo exists
    let status = getRepoStatus(targetDir);
    if (!status.isRepo) {
        console.log(`[GitHub Sync] Initializing new Git repository...`);
        runGit(['init', '-b', 'main'], targetDir);
    }

    // 3. Set remote if provided and not yet configured
    if (remoteUrl) {
        const existingRemote = runGit(['remote', 'get-url', 'origin'], targetDir);
        if (!existingRemote.success) {
            console.log(`[GitHub Sync] Adding remote origin: ${remoteUrl}`);
            runGit(['remote', 'add', 'origin', remoteUrl], targetDir);
        } else if (existingRemote.stdout !== remoteUrl) {
            console.log(`[GitHub Sync] Updating remote origin: ${remoteUrl}`);
            runGit(['remote', 'set-url', 'origin', remoteUrl], targetDir);
        }
    }

    // 4. Stage all files
    console.log(`[GitHub Sync] Staging changes...`);
    runGit(['add', '-A'], targetDir);

    // 5. Commit if there are changes
    status = getRepoStatus(targetDir);
    if (!status.clean) {
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const commitMsg = customMessage || `feat(${projectName}): automated build & sync [${timestamp}]`;
        console.log(`[GitHub Sync] Committing: "${commitMsg}"`);
        const commitRes = runGit(['commit', '-m', commitMsg], targetDir);
        if (!commitRes.success) {
            console.warn(`[GitHub Sync] Commit note: ${commitRes.stderr || commitRes.stdout}`);
        }
    } else {
        console.log(`[GitHub Sync] Working tree clean. No new changes to commit.`);
    }

    // 6. Push to GitHub remote if origin exists
    status = getRepoStatus(targetDir);
    if (status.remote) {
        console.log(`[GitHub Sync] Pushing to remote (${status.remote}) on branch ${status.branch}...`);
        const pushRes = runGit(['push', '-u', 'origin', status.branch], targetDir);
        if (pushRes.success) {
            console.log(`[GitHub Sync] Push succeeded! Remote repository up to date.`);
            return { success: true, pushed: true, remote: status.remote, branch: status.branch };
        } else {
            console.warn(`[GitHub Sync] Push notice: ${pushRes.stderr || pushRes.stdout}`);
            return { success: true, pushed: false, error: pushRes.stderr, remote: status.remote };
        }
    } else {
        console.log(`[GitHub Sync] Local git synced. (No remote origin configured yet).`);
        return { success: true, pushed: false, message: 'Local commit complete; no remote configured.' };
    }
}

// CLI entrypoint
if (require.main === module) {
    const args = process.argv.slice(2);
    const cmd = args[0] || 'sync';

    if (cmd === 'test' || cmd === 'status') {
        const st = getRepoStatus();
        console.log('[GitHub Status]:', JSON.stringify(st, null, 2));
    } else if (cmd === 'sync') {
        const msg = args[1] || null;
        const result = autoSync({ message: msg });
        console.log('[Result]:', result);
    } else {
        console.log('Usage: node github_sync.js [status|sync [message]|test]');
    }
}

module.exports = {
    getGitExecutable,
    runGit,
    ensureGitignore,
    getRepoStatus,
    autoSync
};
