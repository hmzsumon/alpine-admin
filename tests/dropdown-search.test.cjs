const test=require("node:test"),assert=require("node:assert/strict"),ts=require("typescript");
require.extensions[".ts"]=(module,file)=>module._compile(ts.transpileModule(require("node:fs").readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,file);
const {matchesDropdownOption:match}=require("../utils/dropdownSearch.ts");
test("Bengali prefixes, common paratha spelling and English fragments match the visible labels",()=>{
 assert(match("#20 · সাধারণ পরোটা · Normal Paratha","menu-20","প"));
 assert(match("#20 · সাধারণ পরোটা · Normal Paratha","menu-20","পোরটা"));
 assert(match("#20 · সাধারণ পরোটা · Normal Paratha","menu-20","parat"));
 assert(!match("মুগ ডাল · Mug Dal","menu-1","পরোটা"));
});
test("Bengali codes, disjoint words and aliases remain searchable without changing stored values",()=>{
 assert(match("#172 · ফিরনি · Firni","food-172","১৭২"));
 assert(match("#20 · Chicken Masala Paratha","food-20","chicken paratha"));
 assert(match("RM-001 · রুই মাছ","raw-1","রুইমাছ"));
 assert(match("সাধারণ পরোটা","food-20","রুটি","রুটি, পরোটা"));
 assert(match("সব ক্যাটাগরি","",""));
 assert(!match("মাছ","fish","zzzz"));
 assert(!match("#20 · পরোটা","internal-19-fake-uuid","19"));
});
