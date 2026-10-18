/**
 * Bare-name aliases for the pstack skills shipped with this package.
 *
 * Pi registers skills as /skill:<name>. pstack's own docs use /<name>, so this
 * rewrites an exact leading command to the /skill: form before Pi expands it.
 * Examples: /bro, /poteto-mode, /how, /principle-laziness-protocol.
 *
 * Shortcuts: /p -> /skill:poteto-mode, /ph -> /skill:poteto-help.
 *
 * Everything after the command is preserved. Anything that is not an exact
 * installed pstack skill name is left untouched. Unknown names fall through to
 * Pi's normal command handling.
 */
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

/** This file lives in <package>/extensions, so skills are <package>/skills. */
const SKILLS_ROOT = join(import.meta.dirname, "..", "skills");
const SHORTCUTS: Record<string, string> = {
  p: "poteto-mode",
  ph: "poteto-help",
};

function skillNames(): Set<string> {
  const names = new Set<string>();
  try {
    for (const entry of readdirSync(SKILLS_ROOT, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      if (existsSync(join(SKILLS_ROOT, entry.name, "SKILL.md"))) names.add(entry.name);
    }
  } catch {
    // No skills directory: register no aliases.
  }
  return names;
}

export default function (pi: ExtensionAPI) {
  const names = skillNames();
  if (names.size === 0) return;

  pi.on("input", async (event) => {
    if (event.source === "extension") return { action: "continue" };

    const match = /^\/([a-z0-9][a-z0-9-]*)(?=\s|$)/.exec(event.text);
    if (!match) return { action: "continue" };

    const typed = match[1];
    const target = SHORTCUTS[typed] ?? (names.has(typed) ? typed : undefined);
    if (!target) return { action: "continue" };

    const rest = event.text.slice(match[0].length);
    return { action: "transform", text: `/skill:${target}${rest}` };
  });
}
