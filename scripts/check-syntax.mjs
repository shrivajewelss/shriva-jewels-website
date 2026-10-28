// Offline sanity check: parses every JSX/JS file with esbuild (no bundling). `npm run build` is the real check.
import { execFileSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
const esbuild = process.env.ESBUILD || "esbuild";
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
let bad = 0;
for (const f of walk("src").filter((f) => /\.jsx?$/.test(f))) {
  try { execFileSync(esbuild, [f, "--loader:.js=jsx", "--log-level=error"], { stdio: ["ignore", "ignore", "pipe"], shell: true }); }
  catch (e) { bad++; console.error(f, "\n", e.stderr?.toString()); }
}
console.log(bad ? `${bad} file(s) failed` : "All source files parse OK");
process.exit(bad ? 1 : 0);
