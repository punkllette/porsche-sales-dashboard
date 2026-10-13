import { cpSync, existsSync, readdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const outputDirectory = resolve("dist/public");
if (!existsSync(outputDirectory)) {
  throw new Error("Build output not found at dist/public. Run the Vite build first.");
}

const projectRoot = process.cwd();
const entries = readdirSync(outputDirectory);
for (const entry of entries) {
  const source = resolve(outputDirectory, entry);
  const destination = resolve(projectRoot, entry);
  rmSync(destination, { recursive: true, force: true });
  cpSync(source, destination, { recursive: true });
}

console.log(`Synchronized ${entries.length} generated entries to the repository root.`);
