#!/usr/bin/env node
/**
 * 自動更新 Certificates/events.json
 *
 * 流程:
 *   1. 讀取現有 events.json
 *   2. 把現有 events 的精簡摘要(id/title/dates)送給 GPT-5.2
 *   3. GPT-5.2 用 web search 找最新台灣與華人圈古箏/琵琶考級與比賽
 *   4. 回傳完整新版 events 陣列
 *   5. 嚴格驗證 + 與現有資料比對 + 寫回檔案
 *   6. 列出 added / updated / removed 統計給 workflow 看
 *
 * 環境變數:
 *   REPLICATE_API_TOKEN  必填
 *   DRY_RUN=1            不寫檔,只印出 diff
 *   VERBOSE=1            印出完整 prompt 與 response
 *
 * 退出碼:
 *   0  成功(有變動或無變動)
 *   1  API 呼叫失敗
 *   2  回傳格式驗證失敗
 *   3  變動規模過大(疑似 hallucination,中止寫檔)
 */

import Replicate from "replicate";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EVENTS_FILE = path.resolve(__dirname, "..", "Certificates", "events.json");
const MODEL = "openai/gpt-5.2";
const DRY_RUN = process.env.DRY_RUN === "1";
const VERBOSE = process.env.VERBOSE === "1";

const REQUIRED_FIELDS = ["id", "title", "type", "location", "link"];
const VALID_TYPES = new Set(["exam", "competition"]);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const today = new Date().toISOString().slice(0, 10);

// ─── 1. 讀現有 events.json ──────────────────────────────────────────
const rawExisting = await fs.readFile(EVENTS_FILE, "utf8");
const existing = JSON.parse(rawExisting);
console.log(`📂 讀入既有 events:${existing.length} 筆`);

const existingSummary = existing.map(e => ({
  id: e.id,
  title: e.title,
  type: e.type,
  examDates: e.examDates,
  regEnd: e.regEnd,
}));

// ─── 2. 組 prompt ─────────────────────────────────────────────────
const systemPrompt = `你是台灣音樂教室「新莊箏心古箏音樂教室」的資料蒐集助理。
任務:搜尋並整理「古箏」與「琵琶」相關的考級與比賽資訊。

涵蓋範圍:
- 台灣本地賽事與考級(優先)
- 中國大陸、香港、澳門、新加坡、馬來西亞、美國等華人圈古箏/琵琶賽事

排除:
- 純鋼琴、小提琴、其他樂器的比賽(除非與古箏/琵琶同場舉辦)
- 已過期超過 60 天的事件可以保留但不必更新內容

輸出要求:
- **只回傳 JSON 陣列**,不要任何前後文字、不要 markdown code block
- 所有日期用 "YYYY-MM-DD" 格式
- 既有事件若資料正確,沿用原 id 與內容(不要因為 paraphrase 而變動)
- 新事件 id 用 kebab-case,前綴 exam- 或 comp-,接識別名 + 年份`;

const userPrompt = `今天日期:${today}

請執行以下三件事:

1. 透過網路搜尋,確認既有 ${existing.length} 筆事件的資訊是否仍正確
   (報名日期、考試日期、連結等)
2. 找出**新公告**的古箏/琵琶考級與比賽
3. 回傳完整最新版本的 events 陣列(包含既有與新增的所有事件)

schema 範例:
{
  "id": "comp-culture-cup-2026",
  "title": "2026 文化盃音樂大賽",
  "type": "competition",
  "location": "台灣各區",
  "regStart": "2026-05-01",
  "regEnd": "2026-05-14",
  "examDates": ["2026-07-06", "2026-07-25"],
  "link": "https://www.taiwanmusic.org/",
  "officialSite": "https://...",
  "note": "簡短備註,不要超過 30 字",
  "resultDate": "2026-08-01"
}

欄位:
- id (必填,kebab-case)
- title (必填)
- type (必填,"exam" 或 "competition")
- location (必填)
- regStart / regEnd (選填,YYYY-MM-DD)
- examDates (選填,日期陣列)
- link (必填,網址)
- officialSite (選填,網址)
- note (選填,30 字內)
- resultDate (選填,公布日期)

既有事件摘要(供你比對,避免重複):
${JSON.stringify(existingSummary, null, 2)}

請現在回傳完整 JSON 陣列(不要包 markdown)。`;

if (VERBOSE) {
  console.log("─── system prompt ───");
  console.log(systemPrompt);
  console.log("─── user prompt ───");
  console.log(userPrompt);
}

// ─── 3. 呼叫 Replicate ────────────────────────────────────────────
if (!process.env.REPLICATE_API_TOKEN) {
  console.error("❌ 缺少環境變數 REPLICATE_API_TOKEN");
  process.exit(1);
}

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

console.log(`🤖 呼叫 ${MODEL} (web 搜尋中,通常需要 30-60 秒)...`);
const t0 = Date.now();
let rawOutput;
try {
  const output = await replicate.run(MODEL, {
    input: {
      prompt: userPrompt,
      system_prompt: systemPrompt,
      reasoning_effort: "medium",
      verbosity: "low",
    },
  });
  rawOutput = Array.isArray(output) ? output.join("") : String(output);
} catch (err) {
  console.error("❌ Replicate API 呼叫失敗:", err.message);
  process.exit(1);
}
const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`✅ GPT 回應完成(${elapsed}s,輸出 ${rawOutput.length} 字元)`);

if (VERBOSE) {
  console.log("─── raw output ───");
  console.log(rawOutput);
}

// ─── 4. 解析 + 驗證 ───────────────────────────────────────────────
let parsed;
try {
  // 防呆:有些模型還是會包 markdown
  const cleaned = rawOutput
    .replace(/^```(?:json)?\s*/m, "")
    .replace(/\s*```\s*$/m, "")
    .trim();
  parsed = JSON.parse(cleaned);
} catch (err) {
  console.error("❌ 回傳不是合法 JSON:", err.message);
  console.error("前 500 字元:", rawOutput.slice(0, 500));
  process.exit(2);
}

if (!Array.isArray(parsed)) {
  console.error("❌ 回傳的不是陣列");
  process.exit(2);
}

const errors = [];
parsed.forEach((ev, i) => {
  REQUIRED_FIELDS.forEach(f => {
    if (!ev[f] || typeof ev[f] !== "string") {
      errors.push(`#${i} (${ev.id || "?"}) 缺少或非字串欄位:${f}`);
    }
  });
  if (ev.type && !VALID_TYPES.has(ev.type)) {
    errors.push(`#${i} (${ev.id}) type 值無效:${ev.type}`);
  }
  ["regStart", "regEnd", "resultDate"].forEach(f => {
    if (ev[f] && !DATE_RE.test(ev[f])) {
      errors.push(`#${i} (${ev.id}) ${f} 不是 YYYY-MM-DD:${ev[f]}`);
    }
  });
  if (ev.examDates) {
    if (!Array.isArray(ev.examDates)) {
      errors.push(`#${i} (${ev.id}) examDates 不是陣列`);
    } else {
      ev.examDates.forEach((d, j) => {
        if (!DATE_RE.test(d)) errors.push(`#${i} (${ev.id}) examDates[${j}] 不是 YYYY-MM-DD:${d}`);
      });
    }
  }
});

if (errors.length > 0) {
  console.error(`❌ 驗證失敗,共 ${errors.length} 個錯誤:`);
  errors.slice(0, 10).forEach(e => console.error(" ", e));
  if (errors.length > 10) console.error(`  ...還有 ${errors.length - 10} 個`);
  process.exit(2);
}

// ─── 5. Sanity check:變動規模 ───────────────────────────────────────
const oldIds = new Set(existing.map(e => e.id));
const newIds = new Set(parsed.map(e => e.id));
const added = parsed.filter(e => !oldIds.has(e.id));
const removed = existing.filter(e => !newIds.has(e.id));
const kept = parsed.filter(e => oldIds.has(e.id));

const changed = [];
kept.forEach(newE => {
  const oldE = existing.find(o => o.id === newE.id);
  if (JSON.stringify(oldE) !== JSON.stringify(newE)) changed.push(newE.id);
});

console.log("");
console.log("📊 變動摘要:");
console.log(`  ➕ 新增  ${added.length} 筆`);
console.log(`  🔄 更新  ${changed.length} 筆`);
console.log(`  ➖ 移除  ${removed.length} 筆`);
console.log(`  ✅ 無動  ${kept.length - changed.length} 筆`);
console.log(`  📦 總計  ${parsed.length} 筆(原 ${existing.length})`);

if (added.length > 0) {
  console.log("\n新增的事件:");
  added.forEach(e => console.log(`  + [${e.type}] ${e.title} (${e.id})`));
}
if (changed.length > 0) {
  console.log("\n更新的事件:");
  changed.forEach(id => console.log(`  ~ ${id}`));
}
if (removed.length > 0) {
  console.log("\n移除的事件:");
  removed.forEach(e => console.log(`  - [${e.type}] ${e.title} (${e.id})`));
}

// 防 hallucination:如果新版少了超過 30% 既有事件,中止
if (removed.length > existing.length * 0.3) {
  console.error(`\n❌ 移除筆數 ${removed.length} 超過原資料 30%,疑似異常,中止寫檔`);
  process.exit(3);
}

// ─── 6. 寫檔 ─────────────────────────────────────────────────────────
if (added.length === 0 && changed.length === 0 && removed.length === 0) {
  console.log("\n✨ 沒有任何變動,不需要更新 events.json");
  process.exit(0);
}

if (DRY_RUN) {
  console.log("\n🔬 DRY_RUN=1,僅預覽不寫檔");
  process.exit(0);
}

const output = JSON.stringify(parsed, null, 2) + "\n";
await fs.writeFile(EVENTS_FILE, output, "utf8");
console.log(`\n💾 已寫入 ${path.relative(process.cwd(), EVENTS_FILE)}`);

// 順手把 Certificates/index.html 內「(YYYY/MM/DD 更新)」改成今天
const INDEX_FILE = path.resolve(__dirname, "..", "Certificates", "index.html");
try {
  const html = await fs.readFile(INDEX_FILE, "utf8");
  const todaySlash = today.replace(/-/g, "/");
  const newHtml = html.replace(
    /年度規劃指南\s*\(\d{4}\/\d{2}\/\d{2}\s*更新\)/,
    `年度規劃指南 (${todaySlash} 更新)`
  );
  if (newHtml !== html) {
    await fs.writeFile(INDEX_FILE, newHtml, "utf8");
    console.log(`📅 已同步更新 Certificates/index.html 日期戳 → ${todaySlash}`);
  } else {
    console.log(`📅 index.html 日期戳未變動(可能格式不符或已是今日)`);
  }
} catch (err) {
  console.warn(`⚠️ 無法更新 index.html 日期戳:${err.message}`);
}

// 寫進 GitHub Actions step output,供後續 step 判斷是否要 commit
if (process.env.GITHUB_OUTPUT) {
  const summary = `added=${added.length}\nupdated=${changed.length}\nremoved=${removed.length}\ntotal=${parsed.length}\n`;
  await fs.appendFile(process.env.GITHUB_OUTPUT, summary);
  await fs.appendFile(process.env.GITHUB_OUTPUT, `has_changes=true\n`);
}

if (process.env.GITHUB_STEP_SUMMARY) {
  const md = [
    "## Events 更新摘要",
    "",
    `| 動作 | 數量 |`,
    `|---|---:|`,
    `| 新增 | ${added.length} |`,
    `| 更新 | ${changed.length} |`,
    `| 移除 | ${removed.length} |`,
    `| 總計 | ${parsed.length} (原 ${existing.length}) |`,
    "",
    added.length > 0 ? "### 新增" : "",
    ...added.map(e => `- [${e.type}] **${e.title}** ([連結](${e.link}))`),
    "",
    changed.length > 0 ? "### 更新" : "",
    ...changed.map(id => `- \`${id}\``),
    "",
    removed.length > 0 ? "### 移除" : "",
    ...removed.map(e => `- [${e.type}] ${e.title}`),
  ].filter(Boolean).join("\n");
  await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, md);
}
