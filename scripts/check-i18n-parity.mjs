// Verifies that messages/{en,es,tl}.json contain exactly the same flattened
// key set. Run: node scripts/check-i18n-parity.mjs
import { readFileSync } from "node:fs";

function flatten(obj, prefix = "", out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) flatten(v, key, out);
    else out[key] = v;
  }
  return out;
}

const locales = ["en", "es", "tl"];
const catalogs = {};
for (const l of locales) {
  catalogs[l] = flatten(JSON.parse(readFileSync(`messages/${l}.json`, "utf8")));
}

const base = new Set(Object.keys(catalogs.en));
let failed = false;
for (const l of locales) {
  const keys = new Set(Object.keys(catalogs[l]));
  const missing = [...base].filter((k) => !keys.has(k));
  const extra = [...keys].filter((k) => !base.has(k));
  if (missing.length || extra.length) {
    failed = true;
    console.error(`[${l}] missing: ${missing.length}, extra: ${extra.length}`);
    for (const k of missing) console.error(`  - ${k}`);
    for (const k of extra) console.error(`  + ${k}`);
  } else {
    console.log(`[${l}] ${keys.size} keys — parity OK`);
  }
}
process.exit(failed ? 1 : 0);
