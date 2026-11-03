/* ────────── browser UI verification; all stock commands are intercepted fixtures ────────── */
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const origin = process.env.ALPINE_TEST_ORIGIN || "http://localhost:3100";
const output = process.env.ALPINE_SCREENSHOT_DIR || path.resolve(import.meta.dirname, "../../screenshots");
await fs.mkdir(output, { recursive: true });
const credentials = JSON.parse(await fs.readFile(path.resolve(import.meta.dirname, "../../alpine-api/.initial-admin.json"), "utf8"));
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1050 }, acceptDownloads: true });
let signedIn = false;
try {
  const login = await context.request.post(origin + "/api/auth/login", {
    headers: { Origin: origin }, data: { email: credentials.email, password: credentials.password },
  });
  assert.equal(login.status(), 200, "Local owner login must succeed; credentials are never printed");
  signedIn = true;
  const response = await context.request.get(origin + "/api/inventory");
  assert.equal(response.status(), 200, "Live stock read must be authorized");
  const live = await response.json();
  const page = await context.newPage();
  await page.goto(origin + "/inventory", { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Live food stock" }).waitFor();
  await page.screenshot({ path: path.join(output, "alpine-inventory-live.png"), fullPage: true });
  const byName = (name) => { const item = live.menu.find((item) => item.name === name); assert(item, name + " is in the menu"); return item; };
  const dal = byName("Mug Dal"), half = byName("Chicken Grill Half"), full = byName("Chicken Grill Full"), drink = byName("Mint Lemonade"), bhaji = byName("Bhaji");
  const pool = (name, item, onHand, station = item.station, mode = "counted") => ({
    id: randomUUID(), name, station, unit: "portion", mode, onHand, lowAt: 3, soldOut: false, version: 1, links: [{ menuId: item.id, units: 1 }],
  });
  const dalPool = pool("Mug Dal", dal, 30), grillPool = pool("Chicken Grill", half, 4), drinkPool = pool("Mint Lemonade", drink, 0, "Drinks", "availability");
  grillPool.unit = "half grill"; grillPool.links.push({ menuId: full.id, units: 2 }); drinkPool.soldOut = true;
  const row = (pool) => ({ poolId: pool.id, name: pool.name, unit: pool.unit, opening: pool.onHand, received: 0, issued: 0, sold: 0, manualWaste: 0, cancelledWaste: 0, staffMeal: 0, adjustment: 0 });
  const fixture = { ...live, inventory: { pools: [dalPool, grillPool, drinkPool], allocations: [
    { id: "fixture-dal", orderId: "fixture-order", menuId: dal.id, poolId: dalPool.id, quantity: 5, status: "reserved" },
    { id: "fixture-grill", orderId: "fixture-order", menuId: half.id, poolId: grillPool.id, quantity: 2, status: "reserved" },
  ], day: { id: randomUUID(), date: live.businessDate, openedAt: new Date().toISOString(), openedBy: "UI test fixture", rows: [row(dalPool), row(grillPool)] }, lastClosedDate: null }, pendingOrders: 1, history: [], closings: [] };
  const commands = [];
  // This route interception is the boundary: no stock POST is sent to the real API.
  await page.route("**/api/inventory", async (route) => {
    if (route.request().method() === "POST") {
      const input = route.request().postDataJSON(); commands.push(input);
      if (input.action === "configure") {
        const added = { ...input.pool, id: randomUUID(), version: 1, onHand: 0, soldOut: false };
        fixture.inventory.pools.push(added); fixture.inventory.day.rows.push(row(added));
      } else if (input.action === "availability") {
        fixture.inventory.pools.find((pool) => pool.id === input.poolId).soldOut = input.soldOut;
      } else if (input.action === "close") {
        const day = fixture.inventory.day;
        fixture.closings.unshift({ ...day, closedAt: new Date().toISOString(), closedBy: "UI test fixture", note: input.note,
          rows: day.rows.map((row) => { const current = fixture.inventory.pools.find((pool) => pool.id === row.poolId), count = input.entries.find((entry) => entry.poolId === row.poolId);
            return { ...row, expected: current.onHand, actual: count.quantity, variance: count.quantity - current.onHand, reason: count.reason }; }) });
        fixture.inventory.day = null; fixture.inventory.lastClosedDate = day.date;
      } else if (input.action === "open") {
        for (const entry of input.entries) fixture.inventory.pools.find((pool) => pool.id === entry.poolId).onHand = entry.quantity;
        fixture.inventory.day = { id: randomUUID(), date: fixture.businessDate, openedAt: new Date().toISOString(), openedBy: "UI test fixture", rows: fixture.inventory.pools.filter((pool) => pool.mode === "counted").map(row) };
      }
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(fixture) });
  });
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Live food stock" }).waitFor();
  const dalRow = page.getByRole("row").filter({ has: page.getByText("Mug Dal", { exact: true }).first() });
  assert(await dalRow.innerText().then((text) => text.includes("25 portion")), "Available excludes five reserved portions");
  await page.screenshot({ path: path.join(output, "alpine-inventory-desktop-fixture.png"), fullPage: true });
  await page.getByRole("button", { name: "Configure stock", exact: true }).click();
  await page.getByLabel("Stock group name").fill("Breakfast Bhaji");
  await page.getByLabel("Choose linked menu item").selectOption(bhaji.id);
  await page.getByRole("button", { name: "Link item", exact: true }).click();
  await page.screenshot({ path: path.join(output, "alpine-inventory-setup-form.png"), fullPage: true });
  await page.getByRole("button", { name: "Save stock setup", exact: true }).click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  assert.equal(commands.at(-1).action, "configure");
  assert.equal(commands.at(-1).pool.links[0].menuId, bhaji.id);
  await page.getByRole("row").filter({ hasText: "Mug Dal" }).getByRole("button", { name: "Mark sold out", exact: true }).click();
  await page.getByRole("row").filter({ hasText: "Mug Dal" }).getByRole("button", { name: "Mark available", exact: true }).waitFor();
  await page.getByRole("button", { name: "Daily closing", exact: true }).click();
  assert(await page.getByRole("button", { name: "Approve & close day", exact: true }).isDisabled(), "Open orders block closing in UI");
  await page.getByRole("button", { name: "Close stock dialog", exact: true }).click();
  fixture.pendingOrders = 0; fixture.inventory.allocations = [];
  await page.getByRole("button", { name: "Refresh", exact: true }).click();
  await page.waitForResponse((response) => response.url().endsWith("/api/inventory") && response.request().method() === "GET");
  await page.getByRole("button", { name: "Daily closing", exact: true }).click();
  for (const pool of fixture.inventory.pools.filter((pool) => pool.mode === "counted")) {
    await page.getByLabel(`${pool.name} actual count`, { exact: true }).fill(String(pool.onHand));
  }
  await page.getByRole("checkbox", { name: /I checked the physical counts/ }).check();
  await page.screenshot({ path: path.join(output, "alpine-inventory-closing-form.png"), fullPage: true });
  await page.getByRole("button", { name: "Approve & close day", exact: true }).click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  assert.equal(commands.at(-1).action, "close");
  await page.locator(".inventory-closing summary").first().click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV", exact: true }).click();
  const download = await downloadPromise;
  const csv = await fs.readFile(await download.path(), "utf8");
  assert(csv.includes('"Expected","Actual","Variance"'));
  assert(csv.includes("Breakfast Bhaji"));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForFunction(() => document.querySelector(".sidebar").getBoundingClientRect().right <= 1);
  await page.screenshot({ path: path.join(output, "alpine-inventory-mobile-fixture.png"), fullPage: true, animations: "disabled" });
  const size = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: window.innerWidth }));
  assert(size.content <= size.viewport + 1, "Mobile page must not overflow horizontally");
  await page.setViewportSize({ width: 1440, height: 1050 });
  fixture.inventory.lastClosedDate = null;
  const refreshed = page.waitForResponse((response) => response.url().endsWith("/api/inventory") && response.request().method() === "GET");
  await page.getByRole("button", { name: "Refresh", exact: true }).click(); await refreshed;
  await page.getByRole("button", { name: "Open stock day", exact: true }).click();
  assert.equal(await page.getByLabel("Mug Dal opening count", { exact: true }).inputValue(), "30", "Opening uses carryover, not an added quantity");
  await page.getByLabel("Mug Dal opening count", { exact: true }).fill("31");
  assert.notEqual(await page.getByLabel("Mug Dal difference reason", { exact: true }).getAttribute("required"), null);
  await page.getByLabel("Mug Dal difference reason", { exact: true }).fill("Physical count verified");
  await page.getByRole("checkbox", { name: /I checked the opening quantities/ }).check();
  await page.screenshot({ path: path.join(output, "alpine-inventory-opening-form.png"), fullPage: true });
  await page.getByRole("button", { name: "Confirm & open day", exact: true }).click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  assert.equal(commands.at(-1).action, "open");
  assert.equal(commands.at(-1).entries.find((entry) => entry.poolId === dalPool.id).quantity, 31);

  const workspaceResponse = await context.request.get(origin + "/api/state");
  assert.equal(workspaceResponse.status(), 200);
  const fakeWorkspace = await workspaceResponse.json();
  const orderId = "UI-STOCK-CANCEL-FIXTURE";
  fakeWorkspace.data.orders = [{ id: orderId, table: "T-01", waiter: "UI test fixture", createdAt: new Date().toISOString(), status: "New", items: [{ menuId: dal.id, name: dal.name, price: dal.price, quantity: 1, station: dal.station }] }];
  const orderPage = await context.newPage();
  let cancellation;
  let stateReads = 0;
  const pageErrors = [];
  orderPage.on("pageerror", (error) => pageErrors.push(error.message));
  await orderPage.route("**/api/state", async (route) => {
    if (route.request().method() === "PATCH") {
      cancellation = route.request().postDataJSON().changes.orders.find((order) => order.id === orderId);
      fakeWorkspace.data.orders = [cancellation]; fakeWorkspace.revision++;
    } else stateReads++;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(fakeWorkspace) });
  });
  await orderPage.goto(origin + "/orders", { waitUntil: "networkidle" });
  await orderPage.screenshot({ path: path.join(output, "alpine-stock-cancel-before-fixture.png"), fullPage: true });
  console.log("Cancellation fixture diagnostics:", JSON.stringify({ stateReads, pageErrors, url: orderPage.url() }));
  await orderPage.getByLabel(`Update ${orderId}`, { exact: true }).selectOption("Cancelled");
  await orderPage.getByLabel("Cancellation reason").fill("UI test customer cancellation");
  await orderPage.getByRole("checkbox", { name: /Preparation has started/ }).check();
  await orderPage.getByRole("button", { name: "Confirm cancellation", exact: true }).click();
  await orderPage.getByRole("dialog").waitFor({ state: "hidden" });
  assert.equal(cancellation.cancelPrepared, true);
  assert.equal(cancellation.cancelReason, "UI test customer cancellation");
  await orderPage.close();
  console.log("Inventory UI passed: live read, shared-stock display, setup, Sold out, closing guard, closing, CSV, mobile, opening carryover and prepared-order cancellation. All stock/order writes were intercepted fixtures.");
  console.log("Screenshots: " + output);
} finally {
  if (signedIn) await context.request.post(origin + "/api/auth/logout", { headers: { Origin: origin } }).catch(() => {});
  await context.close(); await browser.close();
}
