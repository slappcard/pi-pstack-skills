# pi-pstack-skills

[pstack](https://github.com/cursor/plugins/tree/main/pstack) by Lauren Tan, ported to [pi](https://pi.dev). Fifty-five rigorous engineering skills, three subagents, and the original bare command names.

```text
/bro  /poteto-mode  /how  /why  /architect  /arena  /swarm  /interrogate
/no-comments  /unslop  /tdd  /principle-laziness-protocol  ...
```

`/p` is a shortcut for `/poteto-mode`, and `/ph` for `/poteto-help`. Every skill also works as `/skill:<name>`.

## Install

From git:

```bash
pi install git:github.com/slappcard/pi-pstack-skills@v0.1.0
```

Or without pinning:

```bash
pi install git:github.com/slappcard/pi-pstack-skills
```

Start a new pi session, or run `/reload`.

To install for one invocation without changing settings:

```bash
pi -e git:github.com/slappcard/pi-pstack-skills
```

## Use

Start with the mode skill:

```text
/poteto-mode this test is flaky. reproduce it first, then fix and verify.
```

The mode reads the task, picks one of its playbooks, writes a checklist in the reply, and runs the other skills as the steps need them. Not sure which skill fits? `/ph which skill should I use?`

Other entry points:

```text
/bro                         restate the last message in plain words
/how do we cancel runs?      explain a subsystem
/why is this flag off?       find the design rationale
/architect design this API   settle types and module shape first
/interrogate                 multi-model review of the current diff
/no-comments                 strip comments the code does not need
/setup-pstack                pick a model per role and a reasoning budget
```

## Models

The skills ship with two defaults:

- code work: `openrouter/x-ai/grok-4.7:xhigh`
- judgment and prose: `anthropic/claude-opus-5-5:xhigh`

Run `/setup-pstack` to detect the models your pi can reach and write the role mapping to the `pstack model configuration` block in `~/.pi/agent/AGENTS.md`. Until you do, the defaults above are used. A role set to `inherit-parent` or `auto` runs on the parent session model.

Only providers you have authenticated work. Check one with `pi auth check --provider <provider>`.

## Subagents

The package ships three agents for the `subagents` tool:

| Agent | Use it for |
| --- | --- |
| `poteto-agent` | Code-writing delegates inside a poteto-mode run. Reads the poteto-mode skill before working. |
| `pstack-readonly` | Explorers, reviewers, and judges that must not edit. Has `read`, `grep`, `bash`, `ask`, and `report`. |
| `comment-sicko` | The read-only comment reviewer used by `/no-comments`. |

Example:

```text
subagents({ agent: "poteto-agent", task: "Implement the parser change in src/parse.ts. Verify with the unit test.", model: "openrouter/x-ai/grok-4.7:xhigh" })
```

## What changed from Cursor

- `Task` becomes the `subagents` tool.
- `subagent_type` becomes `agent`; `readonly: true` becomes `pstack-readonly`.
- `AskQuestion` becomes `ask_user_question`.
- Todo lists become checklists in the reply.
- Cursor model slugs become pi `provider/model:thinking` strings.
- Rules in `~/.cursor/rules` become the model block in `~/.pi/agent/AGENTS.md`.
- Cursor transcripts become pi sessions under `~/.pi/agent/sessions/`.
- Cursor-only features are skipped with one line: Custom Modes, `/loop`, Automations, Bugbot, and `cursor-team-kit`. The replacement for `/loop` is a watcher subagent or heartbeat. The replacement for `control-ui` and `control-cli` is the repo's own verification harness, or `/create-verification-skill`.

The full mapping is in [`docs/harness/pi.md`](./docs/harness/pi.md).

## Bundled scripts

The poteto-mode skill ships small Node tools:

```bash
node <package>/skills/poteto-mode/scripts/orch/orch.ts --help
node <package>/skills/poteto-mode/scripts/watch-pr/watch-pr --help
node <package>/skills/poteto-mode/scripts/check-plan.mjs <plan.md>
bash <package>/skills/poteto-mode/scripts/worktree-audit.sh --help
```

The first run installs the one runtime dependency (`commander`) with npm. Bun is needed only for the bundled `bun:test` suites.

## Requirements

- pi 1.x with the `subagents` tool (`pi-durable-subagents` or compatible `pi-subagents`)
- Node.js 22.19 or later
- `git`, and `gh` for the PR playbooks

## Attribution

pstack is MIT licensed, Copyright Lauren Tan. This package adapts the skill text, agents, and harness notes for pi. See [LICENSE](./LICENSE).

The upstream Cursor install is documented in the upstream [pstack README](https://github.com/cursor/plugins/tree/main/pstack).
