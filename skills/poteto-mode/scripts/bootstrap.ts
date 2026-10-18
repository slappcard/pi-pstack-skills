import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const scriptsDirectory = import.meta.dirname;
const nodeModulesDirectory = join(scriptsDirectory, "node_modules");
const commanderPackagePath = join(
  nodeModulesDirectory,
  "commander",
  "package.json"
);
const installKeyPath = join(
  nodeModulesDirectory,
  ".poteto-mode-tools-install-key"
);

function currentInstallKey(): string {
  return createHash("sha256")
    .update(readFileSync(join(scriptsDirectory, "package.json")))
    .digest("hex");
}

/**
 * Install the one runtime dependency with npm when needed.
 *
 * The original script used bun. pi installs on machines that may not have bun,
 * so this uses Node (which runs the TypeScript directly in Node 22.19+) and npm.
 * Bun is still required only for the bundled `bun:test` suites.
 */
export function ensureDependenciesInstalled(): void {
  const installKey = currentInstallKey();
  if (
    existsSync(commanderPackagePath) &&
    existsSync(installKeyPath) &&
    readFileSync(installKeyPath, "utf8").trim() === installKey
  ) {
    return;
  }

  const result = spawnSync(
    "npm",
    ["install", "--no-package-lock", "--no-save", "--omit=dev"],
    { cwd: scriptsDirectory, encoding: "utf8", stdio: "inherit" }
  );
  if (result.status !== 0) {
    throw new Error(`npm install exited with status ${result.status}`);
  }
  if (!existsSync(commanderPackagePath)) {
    throw new Error("npm install completed without installing commander");
  }

  writeFileSync(installKeyPath, `${installKey}\n`);
}
