---
name: setup-pstack
description: Configure which models pstack uses per role and at what reasoning budget. Detects the models available in pi and writes the always-applied model rule in ~/.pi/agent/AGENTS.md. Use for /skill:setup-pstack, "configure pstack models", "pstack budget", or changing pstack's model choices.
---
# Setup pstack

Write the `pstack model configuration` section of the pi agent directory's `AGENTS.md`. `<agent-dir>` is `$PI_CODING_AGENT_DIR` when set, otherwise `~/.pi/agent`. That file is loaded into every pi session, so one line per role overrides the defaults inside the skills.

## Steps

### 1. Detect available models

Run `pi --list-models`. Each row is `provider  model  context  max-out  thinking  images`. The model slug you can pass to `subagents` is `<provider>/<model>`, optionally followed by `:<thinking>`, where thinking is one of `off`, `minimal`, `low`, `medium`, `high`, `xhigh`, `max` and the row says `thinking yes`.

Only providers with credentials work. Check a provider with `pi auth check --provider <provider>` (for example `pi auth check --provider anthropic`) and keep the providers it reports ready. Do not write a model from a provider that is not authenticated. Never write a real slug you have not confirmed in `pi --list-models`. The aliases `inherit-parent` and `auto` are always valid even though they are not detected slugs.

`enabledModels` in `settings.json` only controls startup selection and Ctrl+P cycling. It does not restrict subagent models. Do not change it.

### 2. Load current state

The default role-to-model mapping is the shape in step 5. If `<agent-dir>/AGENTS.md` already has a `<!-- pstack-model-config:start -->` block, read its `# budget` line and its role values as the current choices. Otherwise start from those defaults. A role line not in step 5, such as `how critics`, is retired. Drop it.

### 3. Budget, map, and confirm

**(a) Ask for a budget.** Use `ask_user_question` with these four labels. Name the current budget when the rule records one. With no rule, say that `large` matches the skill defaults.

- `unlimited — max reasoning`
- `large — xhigh reasoning`
- `medium — high reasoning`
- `small — medium reasoning`

**(b) Apply it.** Build the working table from the defaults. On a re-run, keep any role you changed by family, list, or alias (`inherit-parent`, `auto`).

`unlimited`, `large`, `medium`, and `small` set the thinking token of every real slug, panel entries included, to `max`, `xhigh`, `high`, or `medium`. The thinking token is the suffix after the last `:`. If the result is not a detected slug, use the same family's detected model with the highest thinking at or below the target, else mark the role as needing a choice.

Grok tops out at `xhigh`, so under `unlimited` it stays `xhigh`. Anthropic's `claude-opus-5-5` accepts `max`. Examples with the shipped defaults:

- `large` keeps `openrouter/x-ai/grok-4.7:xhigh` and `anthropic/claude-opus-5-5:xhigh`.
- `medium` makes them `openrouter/x-ai/grok-4.7:high` and `anthropic/claude-opus-5-5:high`.
- `small` makes them `openrouter/x-ai/grok-4.7:medium` and `anthropic/claude-opus-5-5:medium`.
- `unlimited` makes them `openrouter/x-ai/grok-4.7:xhigh` and `anthropic/claude-opus-5-5:max`.

`inherit-parent` and `auto` do not change.

**(c) Show the roles and confirm.** Show every role with its model, marking any real slug not in the detected set as needing a choice. Also list each line step 2 dropped. Use `ask_user_question`, offering the detected models plus `inherit-parent` and `auto`. Both aliases mean the role runs on the parent chat model, so the `subagents` call omits `model`.

For panel roles (arena runners, architect runners, interrogate reviewers) the value is a comma-separated list, and one subagent runs per entry, aliases included, so list length sets the count. `arena cross-judge pool` is also a list, but Arena selects one value from it whose model family differs from the parent's when possible. `swarm workers` is the default model for every worker unless a race or comparison assigns another model per arm.

### 4. Validate

Every real slug written must be `<provider>/<model>` from `pi --list-models` whose row says `thinking yes`, optionally with one of the thinking suffixes. `inherit-parent` and `auto` always pass. If a chosen real slug is not available, stop and ask again.

Optionally smoke-test one model per family with a single cheap prompt:

```sh
pi -p --no-session --model '<provider>/<model>:<thinking>' 'Reply with exactly: OK'
```

Do not loop over every role. One check per distinct family is enough.

### 5. Write the rule

Edit `<agent-dir>/AGENTS.md` in place. Overwrite only the block between `<!-- pstack-model-config:start -->` and `<!-- pstack-model-config:end -->`, and preserve everything outside it. Write the `# budget` comment, then one line per role from the shape below. Re-runs stay idempotent. Shape:

```text
<!-- pstack-model-config:start -->
# pstack model configuration. One line per role. Delete a line to fall back to the skill default.
# A value of `inherit-parent` or `auto` means the role runs on the parent session model: omit `model`.
# Values are pi `provider/model:thinking` strings. List values fan out one subagent per entry.
# budget: large (xhigh)
feature, refactoring: openrouter/x-ai/grok-4.7:xhigh
bug-fix: openrouter/x-ai/grok-4.7:xhigh
perf-issue: openrouter/x-ai/grok-4.7:xhigh
hillclimb: openrouter/x-ai/grok-4.7:xhigh
judgment and prose: anthropic/claude-opus-5-5:xhigh
hardest tasks: anthropic/claude-opus-5-5:xhigh
how explorer: openrouter/x-ai/grok-4.7:xhigh
how explainer: anthropic/claude-opus-5-5:xhigh
why investigators: openrouter/x-ai/grok-4.7:xhigh
why synthesizer: anthropic/claude-opus-5-5:xhigh
reflect tooling: openrouter/x-ai/grok-4.7:xhigh
reflect judgment, divergent, synthesizer: anthropic/claude-opus-5-5:xhigh
arena runners: anthropic/claude-opus-5-5:xhigh, openrouter/x-ai/grok-4.7:xhigh
arena cross-judge pool: anthropic/claude-opus-5-5:xhigh, openrouter/x-ai/grok-4.7:xhigh
swarm workers: openrouter/x-ai/grok-4.7:xhigh
architect runners: anthropic/claude-opus-5-5:xhigh, openrouter/x-ai/grok-4.7:xhigh
interrogate reviewers: anthropic/claude-opus-5-5:xhigh, openrouter/x-ai/grok-4.7:xhigh
<!-- pstack-model-config:end -->
```

If either marker is missing, append the full block under a `## pstack model configuration` heading. Never put role lines in a project `AGENTS.md`.

### 6. Confirm

Tell the user the rule was written and that it applies to new sessions. Run `/reload` or start a new session. Re-running this skill updates it.

### 7. Offer a verification skill (optional)

Check whether the project has a way to drive the real app for proof (a `verify-*` skill, or an existing harness). If not, offer once: "want a project-local verification skill, so agents can drive the app the way a user does and prove changes work? I can generate one with `/skill:create-verification-skill`." On yes, invoke `/skill:create-verification-skill`. On no, move on without pushing.
