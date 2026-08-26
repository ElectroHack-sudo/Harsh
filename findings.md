# Findings: VoiceOS, Claude Code, and Omniroute Integration

## Token Discovery
- **VoiceOS MCP URL**: `https://www.voiceos.com/?mcp_token=eyJwaWQiOjUwMzU1MTUsInNpZCI6OTQxOTkwOTcwLCJheCI6Ijk5ODg5NWY0ZWM4NzM5MWMxYWQ4YmYxYTM2MjVkM2Q3IiwidHMiOjE3ODc2MjYyOTEsImV4cCI6MTc5MDA0NTQ5MX0.606qw6wvlbBbeyyRPMDkbGhG3dmV_RtP2uPz_ifrqeo`
- **Decoded Claims**:
  - `pid`: 5035515 (Project / Participant ID)
  - `sid`: 941990970 (Session ID)
  - `ax`: `998895f4ec87391c1ad8bf1a3625d3d7` (Auth Access Key)
  - `ts`: 1787626291
  - `exp`: 1790045491

## Integration Requirements
1. **VoiceOS App Discovery**: VoiceOS desktop integration reads `voiceos.integration.json` from a workspace folder. It uses `stdio` transport to communicate with the local MCP server.
2. **Claude Code Discovery**: Claude Code recognizes MCP servers configured in `.mcp.json` (or `.claude.json`).
3. **Omniroute Bridging**: Omniroute is available locally via `omniroute.cmd` (or `http://localhost:8080`), acting as the multi-provider proxy.
## Execution Protocol
4. **Execution Protocol**: Standard MCP (Model Context Protocol) JSON-RPC 2.0 protocol over stdio handles `tools/list` and `tools/call`.

## Obsidian Integration Discovery
- **Desktop Shortcut**: `C:\Users\hmadg\Desktop\Obsidian.lnk`
- **Target Executable**: `C:\Users\hmadg\AppData\Local\Programs\Obsidian\Obsidian.exe`
- **Active Vault Registered**: `D:\ISHIDA` (from `%APPDATA%\obsidian\obsidian.json`)
- **Installed Obsidian Plugins**:
  - `antigravity-cli-sidebar` (Runs Antigravity CLI pane within Obsidian)
  - `copilot`
  - `surfing`
- **Workspace Bridge**: [obsidian_bridge.js](file:///d:/ZORO/tools/obsidian_bridge.js) and [obsidian.cmd](file:///d:/ZORO/obsidian.cmd) providing CLI commands (`status`, `launch`, `open`, `create`, `list`) and URI protocol triggers.
