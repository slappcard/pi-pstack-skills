### Authoring or modifying a skill

**You own the skill's voice.**

1. Use this playbook for the authoring loop. Write or edit the `SKILL.md`, then draft, test, and iterate.
2. Validate the skill: frontmatter has `name` and `description`, the name matches the directory, referenced files exist, and cross-skill links resolve. In pi, a directory containing `SKILL.md` is discovered recursively from `~/.pi/agent/skills/`, `.pi/skills/`, `.agents/skills/`, or a path in the `skills` setting. Run `/reload` after editing during a session, or start a new session.
3. Test cases if structural. Skip if subjective. For pi, run the skill through `/skill:<name>` once and check that `subagents`, `ask_user_question`, and the edit tools are referenced by their pi names, not Cursor's.
4. Run **Opening a PR**.

When in doubt, delete. Keep only prose that changes a decision. Tell it to do the thing and skip the reason. Explain only when the rule is confusing without one. Match tone to scope. Point at structural sources (types, READMEs, config) per the **encode-lessons-in-structure** principle skill. Delegate to other skills by path. Don't restate. A workflow you keep hitting but isn't captured → propose a new skill.

**Reply:** summary of the skill, key design decisions, validation notes.
