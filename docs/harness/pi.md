# pstack on pi (global install)

pstack's skills were written for Cursor. This copy is adapted for pi. Read this file once per session before following a pstack skill. `<pstack>` means the installed package root, the folder that holds `skills/`, `agents/`, and `docs/`. When you read this from a skill, resolve relative paths from that skill's directory; `../../docs/harness/pi.md` is this file.

If a Cursor field has no row here, drop it and say so in one line. Never pass a field or value the pi tool schema rejects.

## Install layout

| What | Where |
| --- | --- |
| Skills | `<pstack>/skills/<name>/SKILL.md`, discovered from the package |
| Agents | this package's `agents/` directory (`poteto-agent`, `comment-sicko`, `pstack-readonly`), discovered by pi-subagents. A same-named file in `~/.pi/agent/agents/` overrides one. |
| This file | `<pstack>/docs/harness/pi.md` |
| Guide | `<pstack>/docs/guide/` |
| Model roles | `~/.pi/agent/AGENTS.md`, section `pstack model configuration` |

Skills are invoked as `/skill:<name>`, for example `/skill:poteto-mode`. The package's extension also accepts the bare names, so `/poteto-mode`, `/bro`, and `/how` work. The skill catalog routes automatically to descriptions without `disable-model-invocation: true`.

If `PI_CODING_AGENT_DIR` is set, substitute it for `~/.pi/agent` throughout this file and the skills.

## Tools

| Cursor | pi |
| --- | --- |
| `Task` | The `subagents` tool. One call runs one subagent; `tasks: [...]` runs several in parallel; `chain: [...]` runs them in sequence. Always asynchronous. |
| `subagent_type: "poteto-agent"` | `agent: "poteto-agent"` |
| `subagent_type: "comment-sicko"` | `agent: "comment-sicko"` |
| `subagent_type: generalPurpose`, agent mode | `agent: "delegate"` |
| `subagent_type: generalPurpose`, `readonly: true` | `agent: "pstack-readonly"`. It has read, grep, bash, ask, report; its prompt forbids edits. |
| `readonly: false` | Omit. Use a writer agent. |
| `run_in_background: true` | Omit. Every `subagents` run is asynchronous. |
| `resume` | Send a `follow-up` to the same subagent (`subagents` action `send`, kind `follow-up`) only when the new work truly needs that agent's state. Otherwise spawn fresh with consolidated scope, per poteto-mode. |
| `environment: "cloud"` | `isolation: "worktree"` when the worker needs its own checkout. |
| `environment: "local"` | Omit. |
| `cloud_base_branch: <b>` | Omit the field. Name the branch in the task brief and tell the worker to check it out. |
| `file_attachments` | List absolute paths in the task brief. |
| `AskQuestion` / `AskUserQuestion` | `ask_user_question`. Each question needs 2-4 options; use `multiSelect: true` where Cursor said `allow_multiple`. |
| Open a todolist | pi has no todo tool. Keep the checklist in your reply, copied from the playbook, and update it at each phase. A skipped step stays in the list as `skip: <reason>`. |
| `Read` | `read` |
| `Grep`, `Glob` | `grep`, `find`, `ls`, or `bash`. |
| `Shell` | `bash` |
| `edit` / `write` | `write`, `replace`, `replace_match`, `insert`, `copy`, `move` (hashline edit tools). |
| `WebSearch` / URL fetch | `web_search`, `fetch_content`. |
| MCP tools | Whatever is configured in `~/.pi/agent/mcp.json` and the project `.pi/mcp.json`. If a step needs an MCP that is not configured, say it is unavailable and continue. |

## Models

pstack's Cursor slugs map to pi's `provider/model:thinking` strings. Thinking levels are `off`, `minimal`, `low`, `medium`, `high`, `xhigh`, `max`.

| pstack role default | pi model |
| --- | --- |
| `grok-4.7-xhigh-fast` (code) | `openrouter/x-ai/grok-4.7:xhigh` |
| `claude-opus-5-5-xhigh` (judgment and prose) | `anthropic/claude-opus-5-5:xhigh` |
| `inherit-parent` or `auto` | Omit `model` so the subagent runs on the parent session model. |

- There is no separate `-fast` slug. Use the same model and lower `:thinking` only when the job is urgent.
- Raise the thinking level one step, up to `:max`, for the hardest work; lower it for routine work. Keep the model family, so a diverse panel stays diverse.
- If pi rejects a model, fall back to the skill's default and say so. Do not guess another slug.
- The role lines live in `~/.pi/agent/AGENTS.md`. A missing line means the skill default. A role set to `inherit-parent` or `auto` means omit `model`.
- Panels run one subagent per list entry, so list length sets fan-out. `arena cross-judge pool` is a list, but Arena picks one entry whose family differs from the parent's when possible.
- Use only providers that `pi auth check --provider <provider>` reports ready. Models from other providers in the catalog are not authenticated unless the user adds credentials.

## Paths and transcripts

| Cursor | pi |
| --- | --- |
| `.cursor/skills/`, `~/.cursor/skills/` | `.pi/skills/`, `~/.pi/agent/skills/` |
| `~/.cursor/plugins/` | `<pstack>/` (this package) |
| `~/.cursor/rules/pstack-models.mdc` | `~/.pi/agent/AGENTS.md`, section `pstack model configuration` |
| `~/.cursor/projects/<slug>/agent-transcripts/` | `~/.pi/agent/sessions/--<path>--/<timestamp>_<id>.jsonl` |
| A Cursor transcript's message shape | pi JSONL session format: one JSON object per line, `type: "message"` entries with `message.role` and `message.content`. See `~/.local/npm/lib/node_modules/@earendil-works/pi-coding-agent/docs/session-format.md`. |
| Cursor cloud dashboard | `subagents` action `status`, or the `/subagents` list. |
| Cursor Automations and Bugbot | Not available in pi. State `Skipped in pi: <step>. <reason>.` in one line and continue. Triage a GitHub PR's Bugbot comments as ordinary review threads when they exist. |

To find the active transcript, use the session file pi reports in `/session` (path, ID, message count) or the newest `.jsonl` in the workspace's session folder. Never glob across other workspaces' session folders.

## Skills that reference Cursor-only features

| Feature | pi adaptation |
| --- | --- |
| `/loop` | pi has no loop command. Use the Autonomous run playbook's wake mechanism: a watcher subagent that returns when its predicate fires, plus a heartbeat subagent when there is no event. The main agent wakes on a finished workflow. |
| Custom Mode (skill stays on every turn) | pi keeps a skill loaded only for the turn that invoked it. Start each new task with `/skill:poteto-mode`, or put a one-line standing instruction in the project's `AGENTS.md`. |
| `create-skill` | Use `skills/poteto-mode/playbooks/authoring-a-skill.md`. |
| `/deslop` (`cursor-team-kit`) | Not installed. Skip with one line; `/skill:unslop` handles prose, `/skill:no-comments` handles comments. |
| `control-ui`, `control-cli` (`cursor-team-kit`) | Not installed. Use the repo's own verification harness, or generate one with `/skill:create-verification-skill`. State the skip when no harness exists. |
| Bugbot | Treat existing GitHub review comments as ordinary threads. Skip steps that start or configure Bugbot. |
| Cursor cloud agents | `isolation: "worktree"` on a local subagent. Skip steps that need the cloud dashboard or a separate machine. |
| Cursor built-in PR tool | `gh pr ...`, exactly as the playbook says. That is not a skip. |

## Running pstack scripts

`poteto-mode` bundles scripts under `<pstack>/skills/poteto-mode/scripts/`. They no longer require bun. Run them with `node`:

```sh
node <pstack>/skills/poteto-mode/scripts/orch/orch.ts --help
node <pstack>/skills/poteto-mode/scripts/watch-pr/watch-pr --help
node <pstack>/skills/poteto-mode/scripts/check-plan.mjs <plan.md>
bash <pstack>/skills/poteto-mode/scripts/worktree-audit.sh [-b <base>] [repo]
```

The first run installs the one dependency (`commander`) with `npm` into the scripts folder. Bun is still needed only for the bundled `*.test.ts` files under `bun:test`; the CLIs themselves run on Node 22.19 or later.

## Subagent defaults

- Subagents do not inherit the parent's conversation by default; each brief must stand alone.
- `poteto-agent` reads `<pstack>/skills/poteto-mode/SKILL.md` in full before working, including the inline principles index. Give it that absolute path.
- Use `pstack-readonly` for explorers, reviewers, and judges that must not edit. Use `delegate` for general agent-mode work that does not need poteto's style. Use `poteto-agent` for code-writing delegates inside a poteto run.
- A subagent that writes edits the same working tree unless `isolation: "worktree"` is set. One writer per worktree or branch.
- Do not commit, amend, push, or switch branches from a subagent unless the task explicitly asks.
