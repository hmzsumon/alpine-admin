/* ────────── exercise upload lifecycle without sending any photo ────────── */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const code = ts.transpileModule(fs.readFileSync(new URL("../lib/menuImages.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const file = { name: "photo.jpg", type: "image/jpeg", size: 3000000 };
function harness() {
  const requests = [], stages = [], exports = {};
  class Reader {
    readAsDataURL() { this.result = "data:image/jpeg;base64,/9j/"; queueMicrotask(() => this.onload()); }
    abort() { this.onabort?.(); }
  }
  class Request {
    constructor() { this.upload = {}; requests.push(this); }
    open(method, url) { assert.equal(method, "POST"); assert.equal(url, "/api/menu-images"); }
    setRequestHeader() {}
    send(body) { assert.equal(typeof JSON.parse(body).image, "string"); }
    abort() { this.onabort?.(); this.onloadend?.(); }
    finish(status, response) { this.status = status; this.response = response; this.onload(); this.onloadend(); }
  }
  vm.runInNewContext(code, { exports, FileReader: Reader, XMLHttpRequest: Request, DOMException });
  return { upload: exports.uploadMenuPhoto, requests, stages, progress: (stage) => stages.push({ ...stage }) };
}
const tick = () => new Promise((resolve) => setImmediate(resolve));

test("100% browser transfer stays processing until the server confirms the image", async () => {
  const h = harness();
  let settled = false;
  const pending = h.upload(file, h.progress).then((url) => { settled = true; return url; });
  await tick();
  const request = h.requests[0];
  request.upload.onprogress({ lengthComputable: true, loaded: 38, total: 100 });
  assert.equal(h.stages.at(-1).percent, 38);
  request.upload.onprogress({ lengthComputable: true, loaded: 100, total: 100 });
  request.upload.onload();
  await tick();
  assert.equal(settled, false);
  assert.equal(h.stages.at(-1).stage, "processing");
  assert.equal(h.stages.at(-1).percent, null);
  request.finish(201, { imageUrl: "https://res.cloudinary.com/test/image/upload/photo.jpg" });
  assert.equal(await pending, "https://res.cloudinary.com/test/image/upload/photo.jpg");
  assert.equal(h.stages.at(-1).stage, "complete");
});
test("server errors and invalid successful responses never report success", async () => {
  for (const [status, body] of [[413, { error: "Image too large" }], [200, {}], [502, null]]) {
    const h = harness();
    const pending = h.upload(file, h.progress);
    const rejected = assert.rejects(pending);
    await tick();
    h.requests[0].finish(status, body);
    await rejected;
    assert(!h.stages.some((p) => p.stage === "complete"));
  }
});
test("closing the picker aborts an in-flight request", async () => {
  const h = harness(), controller = new AbortController();
  const pending = h.upload(file, h.progress, controller.signal);
  const rejected = assert.rejects(pending, (error) => error.name === "AbortError");
  await tick();
  controller.abort();
  await rejected;
  assert(!h.stages.some((p) => p.stage === "complete"));
});
test("unknown transfer length uses indeterminate progress; timeouts allow retry", async () => {
  const h = harness();
  const pending = h.upload(file, h.progress);
  const rejected = assert.rejects(pending, /timed out/);
  await tick();
  h.requests[0].upload.onprogress({ lengthComputable: false, loaded: 100, total: 0 });
  assert.equal(h.stages.at(-1).percent, null);
  h.requests[0].ontimeout();
  h.requests[0].onloadend();
  await rejected;
});
test("oversized files are rejected before creating a request", async () => {
  const h = harness();
  await assert.rejects(h.upload({ ...file, size: 5 * 1024 * 1024 + 1 }, h.progress), /5 MB/);
  assert.equal(h.requests.length, 0);
});
