// हर import की फ़ाइल सच में मौजूद है या नहीं, यह जाँचता है। कुछ गायब हो तो साफ़ लिखकर रुकता है।
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, dirname, resolve, relative } from 'node:path';

const roots = ['src', 'tests', 'scripts'];
const exts = ['.js', '.mjs'];
const missing = [];
let checked = 0;

async function walk(dir) {
  let out = [];
  let entries = [];
  try { entries = await readdir(dir); } catch { return out; }
  for (const e of entries) {
    const p = join(dir, e);
    const s = await stat(p);
    if (s.isDirectory()) out = out.concat(await walk(p));
    else if (exts.some((x) => p.endsWith(x))) out.push(p);
  }
  return out;
}

const exists = async (p) => { try { await stat(p); return true; } catch { return false; } };
const re = /(?:import|export)\s+(?:[^'"]*?\sfrom\s+)?['"](\.{1,2}\/[^'"]+)['"]|import\(\s*['"](\.{1,2}\/[^'"]+)['"]\s*\)/g;

for (const r of roots) {
  for (const f of await walk(r)) {
    const src = await readFile(f, 'utf8');
    for (const m of src.matchAll(re)) {
      const spec = m[1] || m[2];
      const target = resolve(dirname(f), spec);
      checked++;
      if (!(await exists(target))) missing.push(`${relative('.', f)} → ${spec}`);
    }
  }
}

if (missing.length) {
  console.error(`गायब फ़ाइलें (${missing.length}):`);
  missing.forEach((m) => console.error('  ✗ ' + m));
  process.exit(1);
}
console.log(`ठीक: ${checked} import जाँचे, कोई फ़ाइल गायब नहीं।`);
