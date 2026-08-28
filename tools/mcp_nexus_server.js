#!/usr/bin/env node
/**
 * Nexus Unified MCP Server (Model Context Protocol)
 * 
 * Exposes OmniRoute, Claude Code, Obsidian, GitHub, and Database tools
 * to Claude Code, Antigravity, VoiceOS, and external AI agents over stdio.
 */

const readline = require('readline');
const { executePipeline, getFullSystemStatus } = require('./nexus_coordinator');
const { autoSync, getRepoStatus } = require('./github_sync');
const { syncWorkspaceToObsidian, appendToSection } = require('./obsidian_sync');
const { provisionDatabase } = require('./database_provisioner');
const { routeTask, checkOmniRouteHealth, generateCompletion } = require('./omniroute_client');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

function log(msg) {
    process.stderr.write(`[Nexus MCP] ${msg}\n`);
}

const TOOLS = [
    {
        name: "nexus_status",
        description: "Returns the real-time health and connection status of OmniRoute, Claude Code, Obsidian, GitHub, and Database Hub.",
        inputSchema: {
            type: "object",
            properties: {}
        }
    },
    {
        name: "nexus_full_pipeline",
        description: "Executes the unified 5-step pipeline: OmniRoute routing, Database scaffolding, Claude execution prep, Obsidian vault sync, and GitHub auto-push.",
        inputSchema: {
            type: "object",
            properties: {
                intent: { type: "string", description: "Project creation or modification goal" },
                projectName: { type: "string", description: "Name of the project or workspace" },
                database: { type: "string", enum: ["sqlite", "postgres", "supabase", "prisma"], description: "Optional database type to scaffold" },
                openObsidian: { type: "boolean", description: "Whether to trigger Obsidian desktop app to open the note" }
            },
            required: ["intent"]
        }
    },
    {
        name: "nexus_sync_github",
        description: "Stages all workspace changes, creates a semantic commit, and pushes to remote GitHub repository.",
        inputSchema: {
            type: "object",
            properties: {
                message: { type: "string", description: "Custom commit message" },
                projectName: { type: "string", description: "Project name" }
            }
        }
    },
    {
        name: "nexus_sync_obsidian",
        description: "Syncs project blueprints, schemas, tasks, and execution logs to the Obsidian vault (D:\\ISHIDA\\Projects).",
        inputSchema: {
            type: "object",
            properties: {
                projectName: { type: "string", description: "Project note name" },
                openInObsidian: { type: "boolean", description: "Open in Obsidian GUI" }
            }
        }
    },
    {
        name: "nexus_provision_db",
        description: "Scaffolds database connectors, schemas, migrations, and environment configs for SQLite, Postgres, Supabase, or Prisma.",
        inputSchema: {
            type: "object",
            properties: {
                type: { type: "string", enum: ["sqlite", "postgres", "supabase", "prisma"], description: "Database engine to scaffold" }
            },
            required: ["type"]
        }
    },
    {
        name: "nexus_omniroute_route",
        description: "Determines the optimal model tier and routing strategy via OmniRoute for a given development task.",
        inputSchema: {
            type: "object",
            properties: {
                taskType: { type: "string", enum: ["architecture", "code", "database", "documentation", "general"], description: "Category of task" },
                prompt: { type: "string", description: "Task description or prompt to route" }
            },
            required: ["taskType", "prompt"]
        }
    },
    {
        name: "nexus_query_llm",
        description: "Queries an LLM through OmniRoute model router (e.g. auto/best-coding, claude-haiku-4.5, etc.).",
        inputSchema: {
            type: "object",
            properties: {
                prompt: { type: "string", description: "Prompt to send to OmniRoute" },
                model: { type: "string", description: "Model name or combo alias (default: auto/best-coding)" }
            },
            required: ["prompt"]
        }
    }
];

function handleInitialize(id) {
    return {
        jsonrpc: "2.0",
        id,
        result: {
            protocolVersion: "2024-11-05",
            capabilities: {
                tools: {}
            },
            serverInfo: {
                name: "nexus-mcp-server",
                version: "1.1.0"
            }
        }
    };
}

function handleToolsList(id) {
    return {
        jsonrpc: "2.0",
        id,
        result: {
            tools: TOOLS
        }
    };
}

async function handleToolCall(id, name, args) {
    log(`Executing tool: ${name} with args: ${JSON.stringify(args)}`);
    try {
        let resultData = null;

        if (name === "nexus_status") {
            resultData = await getFullSystemStatus();
        } else if (name === "nexus_full_pipeline") {
            resultData = await executePipeline(args || {});
        } else if (name === "nexus_sync_github") {
            resultData = autoSync(args || {});
        } else if (name === "nexus_sync_obsidian") {
            resultData = syncWorkspaceToObsidian(args || {});
        } else if (name === "nexus_provision_db") {
            resultData = provisionDatabase(args || {});
        } else if (name === "nexus_omniroute_route") {
            resultData = routeTask(args.taskType, args.prompt);
        } else if (name === "nexus_query_llm") {
            resultData = await generateCompletion(args.prompt, { model: args.model || 'auto/best-coding' });
        } else {
            return {
                jsonrpc: "2.0",
                id,
                error: {
                    code: -32601,
                    message: `Method not found: ${name}`
                }
            };
        }

        return {
            jsonrpc: "2.0",
            id,
            result: {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(resultData, null, 2)
                    }
                ]
            }
        };
    } catch (err) {
        log(`Error executing ${name}: ${err.message}`);
        return {
            jsonrpc: "2.0",
            id,
            result: {
                isError: true,
                content: [
                    {
                        type: "text",
                        text: `Execution failed: ${err.message}`
                    }
                ]
            }
        };
    }
}

rl.on('line', async (line) => {
    if (!line.trim()) return;
    try {
        const req = JSON.parse(line);
        let resp = null;

        if (req.method === 'initialize') {
            resp = handleInitialize(req.id);
        } else if (req.method === 'tools/list') {
            resp = handleToolsList(req.id);
        } else if (req.method === 'tools/call') {
            resp = await handleToolCall(req.id, req.params.name, req.params.arguments || {});
        } else if (req.method === 'notifications/initialized') {
            return;
        } else {
            resp = {
                jsonrpc: "2.0",
                id: req.id,
                error: {
                    code: -32601,
                    message: `Unsupported method: ${req.method}`
                }
            };
        }

        if (resp) {
            process.stdout.write(JSON.stringify(resp) + '\n');
        }
    } catch (e) {
        log(`Parse error: ${e.message}`);
    }
});

log("Nexus MCP Server started over stdio.");
