import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import ts from "typescript";
const source = await readFile(
  new URL("../data/menu.ts", import.meta.url),
  "utf8"
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022 },
});
const { menu } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);
assert.equal(
  new Set(menu.map((i) => i.id)).size,
  menu.length,
  "SKU identifiers must be unique"
);
assert(
  menu.every(
    (i) => i.price === null || (Number.isFinite(i.price) && i.price >= 0)
  ),
  "Every confirmed price must be finite"
);
assert(
  menu.every((i) => !i.active || i.price !== null),
  "Unconfirmed prices must not be orderable"
);
assert.equal(
  menu.find((i) => i.name === "French Fry (1:1)")?.price,
  150,
  "Portion notation must not corrupt the item price"
);
assert.equal(
  menu.find((i) => i.name === "Special Family Faluda")?.active,
  false
);
console.log(
  `Verified ${menu.length} menu SKUs, including portion notation and unconfirmed prices.`
);
