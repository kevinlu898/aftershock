#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const cssPath = resolve(root, "global.css");

const {
  PALETTES,
  TOKEN_NAMES,
  RADIUS_REM,
  cssVarName,
  hexToRgbTriplet,
} = await import(resolve(root, "src/lib/palette.js"));

function block(mode) {
  const palette = PALETTES[mode];
  const lines = TOKEN_NAMES.map(
    (token) => `    ${cssVarName(token)}: ${hexToRgbTriplet(palette[token])};`
  );
  if (mode === "light") lines.push(`    --radius: ${RADIUS_REM}rem;`);
  return lines.join("\n");
}

const generated = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
${block("light")}
  }

  .dark:root {
${block("dark")}
  }
}
`;

const write = process.argv.includes("--write");
const current = readFileSync(cssPath, "utf8");

if (write) {
  if (current === generated) {
    console.log("global.css already up to date.");
  } else {
    writeFileSync(cssPath, generated);
    console.log("global.css regenerated from src/lib/palette.js");
  }
  process.exit(0);
}

if (current !== generated) {
  console.error(
    "global.css has drifted from src/lib/palette.js.\n" +
      "Run `npm run tokens:sync` to regenerate it."
  );
  process.exit(1);
}
console.log("Design tokens are in sync.");
