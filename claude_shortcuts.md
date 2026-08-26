# 🩵 1) Claude Shortcuts

Every shortcut, slash command, and mode in Claude Code on one page. You'll reference this daily.


---


## First-Time Setup (Do This Once)


| Step | Command |
| --- | --- |
| 1. Install Claude Code | `npm install -g @anthropic-ai/claude-code` |
| 2. Verify it worked | `claude --version` |
| 3. Authenticate | `claude` (follow browser prompts) |
| 4. Set permission mode | `claude config set --global permission-mode acceptEdits` |
| 5. Create project memory | `claude` then type `/init` |
| 6. Set your preferred model | `claude config set --global model claude-sonnet-4-6` |

**Prerequisites:** Node.js 18+ (`node --version`) and Git (`git --version`). You need a Claude Pro ($20/mo), Max, Team, or Enterprise subscription — or API credits.


---


## Permission Modes

Cycle through modes with **Shift + Tab**


| Mode | What It Does | When To Use |
| --- | --- | --- |
| Ask Before Edits | Claude asks permission for every change | Learning / unfamiliar codebase |
| Auto-Accept | File edits auto-approved, bash still asks | Daily workflow (most of the time) |
| Plan Mode | Claude thinks and plans BEFORE writing code | New features, complex tasks, new projects |
| YOLO Mode | Full autonomy — Claude runs everything | After you've reviewed and trust the plan |

**The 90/10 Rule:** Spend 90% of your time in Plan Mode. Switch to YOLO only after you trust the plan. A minute of planning saves 10 minutes of building and significantly reduces token costs.


---


## Slash Commands


| Command | What It Does |
| --- | --- |
| `/init` | Auto-generates a `claude.md` by scanning your entire codebase |
| `/clear` | Reset conversation memory — clean slate, zero context bloat |
| `/compact` | Compress conversation to save context window tokens |
| `/commit` | Stage and commit changes with AI-generated message |
| `/pr` | Create a pull request with AI-generated description |
| `/review` | Review code changes for bugs and quality |
| `/help` | Show all available commands |
| `/model` | Switch Claude models mid-session |
| `/fast` | Toggle fast mode (same model, faster output) |
| `/cost` | Show token usage and cost for current session |
| `/memory` | View and edit project memory |
| `/quit` | End the session |


---


## Keyboard Shortcuts


| Shortcut | What It Does |
| --- | --- |
| `Shift + Tab` | Cycle through permission modes |
| `Enter` | Send message |
| `Shift + Enter` | New line (multi-line input) |
| `Escape` (once) | Cancel current generation |
| `Escape` (twice) | Clear conversation (same as `/clear`) |
| `Ctrl + C` | Cancel or exit session |
| `Tab` | Accept autocomplete suggestion |
| `Up Arrow` | Scroll through message history |


---


## Terminal Commands


| Command | What It Does |
| --- | --- |
| `claude` | Start a new interactive session |
| `claude "prompt here"` | Start with an initial prompt |
| `claude -r` | Resume your most recent conversation |
| `claude -c` | Continue last conversation |
| `claude -p "prompt"` | Pipe mode (non-interactive) |
| `claude config` | Open settings |
| `claude update` | Update to latest version |
| `claude mcp add` | Add an MCP server |
| `claude mcp list` | List connected MCP servers |
| `claude mcp remove` | Remove an MCP server |


---


## Pipe Mode Examples

```plain text
cat error.log | claude -p "What's causing these errors?"
claude -p "Review this file for security issues" < src/auth.tsclaude -p "Convert this SQL query to a Prisma call: SELECT * FROM users WHERE active = true"
```


---


## CLI Flags


| Flag | What It Does |
| --- | --- |
| `--model` / `-m` | Choose which model to use |
| `--permission-mode` | Set permission level for this session |
| `--allowedTools` | Pre-approve specific tools |
| `--disallowedTools` | Block specific tools |
| `--max-turns` | Limit number of agentic turns |
| `--output-format json` | Get structured JSON output |
| `--system-prompt` | Add a custom system prompt |
| `--verbose` | Show detailed logging |


---


## Context Window Quick Reference


| Metric | Value |
| --- | --- |
| Total budget | ~200k tokens |
| Danger zone | 100k-120k tokens (effectiveness drops) |
| When to `/clear` | Before hitting 60-70% |
| Check usage | `/cost` or status line |

**Critical:** When context fills up, Claude gets "dumber" and more expensive. Clear early and often. Don't wait until it's too late.


---


## The Two Prompts That Change Everything

**For starting any new task:**

`Ask me clarifying questions one at a time until you're 95% confident you can complete the task successfully.`

**For fixing bugs:**

`When I do [X Action], I get [Y Error]. Can you investigate and fix what might be causing this?`


---


## Troubleshooting


| Problem | Fix |
| --- | --- |
| "Command not found: claude" | `npm install -g @anthropic-ai/claude-code` |
| Authentication failing | Run `claude` and re-authenticate in browser |
| Claude not reading CLAUDE.md | Make sure it's in the project root |
| Slow responses | Try `/fast` or switch to Sonnet model |
| Context window filling up | Use `/compact` or `/clear` |
| Claude making unwanted changes | Switch to Plan Mode with `Shift + Tab` |

