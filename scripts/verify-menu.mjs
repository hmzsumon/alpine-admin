import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
const menu=JSON.parse(await readFile(new URL("../data/defaultMenu.json",import.meta.url),"utf8"));
const source=await readFile(new URL("../data/menu.ts",import.meta.url),"utf8");
assert(source.includes('./defaultMenu.json'),"Admin must use the reviewed default JSON");
assert.equal(new Set(menu.map(m=>m.code)).size,menu.length,"Every item code must be unique");
assert(menu.every(m=>m.code&&m.nameBn),"All default items require codes and Bengali names");
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
  menu.find((i) => i.code === "38")?.active,
  false
);
console.log(
  `Verified ${menu.length} menu SKUs, including portion notation and unconfirmed prices.`
);
