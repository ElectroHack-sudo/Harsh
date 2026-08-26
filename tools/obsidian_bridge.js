const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');

const LNK_PATH = 'C:\\Users\\hmadg\\Desktop\\Obsidian.lnk';
const EXE_DEFAULT = 'C:\\Users\\hmadg\\AppData\\Local\\Programs\\Obsidian\\Obsidian.exe';
const OBSIDIAN_CONFIG_DIR = path.join(process.env.APPDATA || '', 'obsidian');

function getObsidianVaults() {
    try {
        const configPath = path.join(OBSIDIAN_CONFIG_DIR, 'obsidian.json');
        if (fs.existsSync(configPath)) {
            const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            return data.vaults || {};
        }
    } catch (e) {
        console.error('Error reading obsidian.json:', e.message);
    }
    return {};
}

function getPrimaryVault() {
    const vaults = getObsidianVaults();
    for (const key in vaults) {
        if (vaults[key].path && fs.existsSync(vaults[key].path)) {
            return vaults[key].path;
        }
    }
    return 'D:\\ISHIDA';
}

function launchObsidian(vaultPath) {
    const target = fs.existsSync(EXE_DEFAULT) ? EXE_DEFAULT : LNK_PATH;
    const args = [];
    if (vaultPath) {
        args.push(`obsidian://open?vault=${encodeURIComponent(path.basename(vaultPath))}`);
    }
    console.log(`[Obsidian Bridge] Launching Obsidian from: ${target}`);
    const proc = spawn(target, args, {
        detached: true,
        stdio: 'ignore'
    });
    proc.unref();
    console.log(`[Obsidian Bridge] Process spawned successfully.`);
}

function openNote(noteName, vaultPath = getPrimaryVault()) {
    const vaultName = path.basename(vaultPath);
    const uri = `obsidian://open?vault=${encodeURIComponent(vaultName)}&file=${encodeURIComponent(noteName)}`;
    console.log(`[Obsidian Bridge] Opening URI: ${uri}`);
    exec(`start "" "${uri}"`);
}

function createNote(noteName, content = '', vaultPath = getPrimaryVault()) {
    const fullPath = path.join(vaultPath, noteName.endsWith('.md') ? noteName : `${noteName}.md`);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`[Obsidian Bridge] Created note at: ${fullPath}`);
    openNote(noteName, vaultPath);
}

function listNotes(vaultPath = getPrimaryVault()) {
    if (!fs.existsSync(vaultPath)) {
        console.log(`[Obsidian Bridge] Vault path does not exist: ${vaultPath}`);
        return [];
    }
    function readDirRecursive(dir) {
        let results = [];
        const list = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of list) {
            if (item.name.startsWith('.')) continue; // ignore hidden/system
            const resolved = path.join(dir, item.name);
            if (item.isDirectory()) {
                results = results.concat(readDirRecursive(resolved));
            } else if (item.name.endsWith('.md')) {
                results.push(path.relative(vaultPath, resolved));
            }
        }
        return results;
    }
    const notes = readDirRecursive(vaultPath);
    console.log(`[Obsidian Bridge] Found ${notes.length} notes in ${vaultPath}:`);
    notes.forEach((n, idx) => console.log(`  ${idx + 1}. ${n}`));
    return notes;
}

function getStatus() {
    const vaults = getObsidianVaults();
    const status = {
        shortcutPath: LNK_PATH,
        shortcutExists: fs.existsSync(LNK_PATH),
        executablePath: EXE_DEFAULT,
        executableExists: fs.existsSync(EXE_DEFAULT),
        vaults: vaults,
        primaryVault: getPrimaryVault(),
        primaryVaultExists: fs.existsSync(getPrimaryVault())
    };
    console.log('[Obsidian Bridge Status]');
    console.log(JSON.stringify(status, null, 2));
    return status;
}

// CLI handler
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0] || 'status';

    switch (command.toLowerCase()) {
        case 'status':
            getStatus();
            break;
        case 'launch':
            launchObsidian(args[1] || getPrimaryVault());
            break;
        case 'open':
            if (!args[1]) {
                console.error('Usage: node obsidian_bridge.js open <note_name>');
                process.exit(1);
            }
            openNote(args[1], args[2] || getPrimaryVault());
            break;
        case 'new':
        case 'create':
            if (!args[1]) {
                console.error('Usage: node obsidian_bridge.js create <note_name> [content]');
                process.exit(1);
            }
            createNote(args[1], args.slice(2).join(' ') || '', getPrimaryVault());
            break;
        case 'list':
        case 'ls':
            listNotes(args[1] || getPrimaryVault());
            break;
        default:
            console.log(`Unknown command: ${command}`);
            console.log('Available commands: status, launch, open, create, list');
    }
}

module.exports = {
    getObsidianVaults,
    getPrimaryVault,
    launchObsidian,
    openNote,
    createNote,
    listNotes,
    getStatus
};
