import { cpSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const source = join(root, "apps", "frontend", "dist");
const destination = join(root, "dist");

if (!existsSync(source)) {
  console.error(`[copy-frontend-dist] expected frontend build at ${source} but it was not found.`);
  process.exit(1);
}

rmSync(destination, { recursive: true, force: true });
cpSync(source, destination, { recursive: true });

console.log(`[copy-frontend-dist] copied ${source} -> ${destination}`);
