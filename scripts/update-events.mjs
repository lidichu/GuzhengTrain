#!/usr/bin/env node
/**
 * 自動更新 Certificates/events.json
 *
 * 使用 Google Gemini API + googleSearch 工具(2025/2026 唯一可靠的「LLM + 真實
 * 網路搜尋」組合之一)。
 *
 * 流程:
 *   1. 讀取現有 events.json
 *   2. 把現有 events 的精簡摘要(id/title/dates)送給 Gemini
 *   3. Gemini 透過 googleSearch 工具實際上網查最新台灣/華人圈古箏與琵琶賽事
 *   4. 回傳完整新版 events 陣列
 *   5. 嚴格驗證 + 反降質檢查 + 過期過濾
 *   6. 與既有資料比對,列出 added / updated / removed 統計
 *
 * 環境變數:
 *   GEMINI_API_KEY  必填(從 https://aistudio.google.com/app/apikey 申請)
 *   GEMINI_MODEL    選填,預設 "gemini-2.5-pro"
 *   DRY_RUN=1       不寫檔,只印出 diff
 *   VERBOSE=1       印出完整 prompt 與 Gemini 原始回應
 *
 * 退出碼:
 *   0  成功(有變動或無變動)
 *   1  API 呼叫失敗
 *   2  回傳格式驗證失敗(JSON 不合法、必填欄位缺、含搜尋連結等)
 *   3  變動規模過大(疑似 hallucination,中止寫檔)
 */

import { GoogleGenAI } from "@google/genai";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EVENTS_FILE = path.resolve(__dirname, "..", "Certificates", "events.json");
const INDEX_FILE = path.resolve(__dirname, "..", "Certificates", "index.html");
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-pro";
const DRY_RUN = process.env.DRY_RUN === "1";
const VERBOSE = process.env.VERBOSE === "1";

const REQUIRED_FIELDS = ["id", "title", "type", "location", "link"];
const VALID_TYPES = new Set(["exam", "competition"]);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SEARCH_URL_RE = /(?:^https?:\/\/)?(?:www\.)?(?:google|bing|duckduckgo|yahoo)\.[a-z.]+\/search/i;
const BAD_NOTE_RE = /未能網搜|未能核對|未能核實|無法核對|無法核實|無法網搜/;

const today = new Date().toISOString().slice(0, 10);
const todayMs = new Date(today).getTime();

/**
 * 判斷事件是否還有任何未來日期(報名/考試/結果公布)
 * - 完全沒有日期(TBA)→ 保留
 * - 至少一個日期 >= 今天 → 保留
 * - 所有日期都在過去 → 過期,應移除
 */
function hasAnyFutureDate(event) {
  const dates = [];
  if (event.regStart) dates.push(event.regStart);
  if (event.regEnd) dates.push(event.regEnd);
  if (event.resultDate) dates.push(event.resultDate);
  if (Array.isArray(event.examDates)) dates.push(...event.examDates);

  if (dates.length === 0) return true;
  return dates.some(d => new Date(d).getTime() >= todayMs);
}

// ─── 1. 讀現有 events.json ──────────────────────────────────────────
const rawExisting = await fs.readFile(EVENTS_FILE, "utf8");
const existing = JSON.parse(rawExisting);
console.log(`📂 讀入既有 events:${existing.length} 筆`);

// 摘要包含主要欄位,讓 Gemini 容易整個 echo 回來而不誤刪欄位
const existingSummary = existing.map(e => ({
  id: e.id,
  title: e.title,
  type: e.type,
  location: e.location,
  regStart: e.regStart,
  regEnd: e.regEnd,
  examDates: e.examDates,
  link: e.link,
  officialSite: e.officialSite,
  note: e.note,
  resultDate: e.resultDate,
}));

// ─── 2. 組 prompt ─────────────────────────────────────────────────
const systemPrompt = `你是台灣音樂教室「新莊箏心古箏音樂教室」的資料蒐集助理。
任務:使用 Google 搜尋找出並整理「古箏」與「琵琶」相關的考級與比賽資訊。

涵蓋範圍:
- 台灣本地賽事與考級(優先)
- 中國大陸、香港、澳門、新加坡、馬來西亞、美國等華人圈古箏/琵琶賽事

排除:
- 純鋼琴、小提琴、其他樂器的比賽(除非與古箏/琵琶同場舉辦)

行為準則(非常重要):
- 你有 googleSearch 工具,請務必實際搜尋,不要憑記憶回答
- 連結(link / officialSite)必須是真正的官方/報名網址,絕對不可以填 google.com/search 之類的搜尋結果頁
- **不要刪除既有事件的欄位**(尤其 regStart、regEnd、examDates、link)。
  即使你搜不到新資訊,也要把既有 JSON 的欄位完整保留,不要省略
- 不要在 note 寫「未能網搜」「無法核對」之類元訊息 — note 是給使用者看的`;

const userPrompt = `今天日期:${today}

請執行三件事:

1. 用 googleSearch 工具搜尋,確認既有 ${existing.length} 筆事件目前資訊
   (報名日期、考試日期、官方連結)是否仍正確
2. 搜尋新公告的古箏/琵琶考級與比賽(2026 與 2027)
3. 回傳完整最新 events 陣列(包含既有與新增的所有事件)

請務必檢查以下台灣常用報名/賽事平台,通常會公告下半年新場次:
- beclass.com 報名平台(黃鐘獎、各種音樂考級多在此公告)
- scm-event.tw(中華民國國樂學會官方報名)
- taiwanmusic.org(文化盃音樂大賽)
- kfem.info(法雅盃音樂大賽)
- pragues.com.tw(布拉格音樂大賽)
- pccu.edu.tw/sce(文化大學社會音樂考級)
- chnmusic.org.cn(中國音樂家協會考級)

針對「黃鐘獎」(全國音樂考級),請搜尋
"黃鐘獎 考級 2026" 或 "黃鐘獎 報名 2026 下半年" 看看有沒有公告秋冬場次。
針對「國樂學會」,請確認 scm-event.tw 上 7-12 月與 2027 上半年場次。
針對比賽,搜尋「2026 古箏比賽 簡章」「2026 古箏大賽」找新賽事。

每筆 schema:
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
- id (必填,kebab-case;沿用既有 id,新事件用 "comp-" 或 "exam-" 前綴)
- title (必填)
- type (必填,"exam" 或 "competition")
- location (必填)
- regStart / regEnd (選填,YYYY-MM-DD)
- examDates (選填,日期陣列)
- link (必填,真實官方/報名網址)
- officialSite (選填,真實官方網站)
- note (選填,30 字內,給使用者看的訊息)
- resultDate (選填)

回應規則:
- 只回傳 JSON 陣列,不要任何前後文字、不要 markdown code block
- 所有日期用 YYYY-MM-DD 格式
- link 與 officialSite 一定要是真實網址,不能是搜尋結果頁

既有事件摘要(供你比對,避免重複):
${JSON.stringify(existingSummary, null, 2)}

請現在開始 googleSearch 並回傳完整 JSON 陣列。`;

if (VERBOSE) {
  console.log("─── system prompt ───");
  console.log(systemPrompt);
  console.log("─── user prompt ───");
  console.log(userPrompt);
}

// ─── 3. 呼叫 Gemini ──────────────────────────────────────────────
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ 缺少環境變數 GEMINI_API_KEY");
  console.error("   申請網址:https://aistudio.google.com/app/apikey");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

console.log(`🤖 呼叫 ${MODEL} (啟用 googleSearch,通常需要 30-90 秒)...`);
const t0 = Date.now();
let rawOutput;
let groundingChunks = [];
try {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      tools: [{ googleSearch: {} }],
      temperature: 0.2,
    },
  });

  rawOutput = response.text || "";
  // groundingMetadata 可能在不同層級(不同 SDK 版本)
  const candidate = response.candidates?.[0] || {};
  const meta = candidate.groundingMetadata || response.groundingMetadata;
  if (meta?.groundingChunks) groundingChunks = meta.groundingChunks;
  if (meta?.groundingAttributions && groundingChunks.length === 0) groundingChunks = meta.groundingAttributions;
  if (meta?.webSearchQueries && VERBOSE) {
    console.log(`🔎 Gemini 實際搜尋的關鍵字:${JSON.stringify(meta.webSearchQueries)}`);
  }
  // 若仍找不到引用,印出 response 結構供 debug
  if (groundingChunks.length === 0) {
    console.warn("⚠️ 找不到 groundingChunks,印出 response 結構供 debug:");
    console.warn(JSON.stringify({
      responseKeys: Object.keys(response),
      candidateKeys: Object.keys(candidate),
      groundingMetadataKeys: meta ? Object.keys(meta) : null,
      finishReason: candidate.finishReason,
      tokenCount: response.usageMetadata?.totalTokenCount,
    }, null, 2));
  }
} catch (err) {
  console.error("❌ Gemini API 呼叫失敗:", err.message);
  if (err.message?.includes("API key")) {
    console.error("   檢查 GEMINI_API_KEY 是否正確,以及該 key 是否啟用了 Gemini API");
  }
  process.exit(1);
}
const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`✅ Gemini 回應完成(${elapsed}s,輸出 ${rawOutput.length} 字元)`);

if (groundingChunks.length > 0) {
  console.log(`🔍 引用了 ${groundingChunks.length} 個網路來源`);
  if (VERBOSE) {
    groundingChunks.slice(0, 10).forEach((c, i) => {
      console.log(`   [${i + 1}] ${c.web?.title || "(no title)"}: ${c.web?.uri || "(no uri)"}`);
    });
  }
} else {
  console.warn("⚠️  沒偵測到 googleSearch 引用 — Gemini 可能沒實際搜尋");
}

if (VERBOSE) {
  console.log("─── raw output ───");
  console.log(rawOutput);
}

// ─── 4. 解析 + 驗證 ───────────────────────────────────────────────
let parsed;
try {
  const cleaned = rawOutput
    .replace(/^[^\[\{]*/, "")     // 砍 JSON 之前所有文字
    .replace(/[^\]\}]*$/, "")     // 砍 JSON 之後所有文字
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

// ─── 4-pre. Defensive merge:既有 id 的事件,新版缺的欄位從舊版補回 ──
// 防止 Gemini 「忘記」既有欄位(常見 LLM 行為,不是搜尋失敗的證據)
const existingById = new Map(existing.map(e => [e.id, e]));
const PRESERVABLE_FIELDS = ["regStart", "regEnd", "resultDate", "examDates", "note", "officialSite", "link", "location"];
let restoredCount = 0;
const restoredDetails = [];

parsed = parsed.map(newE => {
  const oldE = existingById.get(newE.id);
  if (!oldE) return newE;
  const merged = { ...newE };
  const restoredFields = [];
  PRESERVABLE_FIELDS.forEach(f => {
    const newHasValue = merged[f] && (Array.isArray(merged[f]) ? merged[f].length > 0 : true);
    if (!newHasValue && oldE[f]) {
      merged[f] = oldE[f];
      restoredFields.push(f);
    }
  });
  if (restoredFields.length > 0) {
    restoredCount++;
    restoredDetails.push(`   ${newE.id}: 補回 ${restoredFields.join(", ")}`);
  }
  return merged;
});

if (restoredCount > 0) {
  console.log(`\n🔧 Defensive merge:${restoredCount} 筆事件從舊版補回缺漏欄位`);
  restoredDetails.slice(0, 10).forEach(d => console.log(d));
}

const errors = [];

parsed.forEach((ev, i) => {
  // 4a. 必填欄位 + 型別
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

  // 4b. 反降質防護
  if (ev.link && SEARCH_URL_RE.test(ev.link)) {
    errors.push(`#${i} (${ev.id}) link 是搜尋引擎 URL:${ev.link}`);
  }
  if (ev.officialSite && SEARCH_URL_RE.test(ev.officialSite)) {
    errors.push(`#${i} (${ev.id}) officialSite 是搜尋引擎 URL:${ev.officialSite}`);
  }
  if (ev.note && BAD_NOTE_RE.test(ev.note)) {
    errors.push(`#${i} (${ev.id}) note 含元訊息:"${ev.note}"`);
  }
  // regStart 缺漏改由 defensive merge 自動補,此處不再 hard fail
});

if (errors.length > 0) {
  console.error(`❌ 驗證失敗,共 ${errors.length} 個錯誤:`);
  errors.slice(0, 20).forEach(e => console.error(" ", e));
  if (errors.length > 20) console.error(`  ...還有 ${errors.length - 20} 個`);
  process.exit(2);
}

// ─── 4c. 過濾掉已過期的事件 ───────────────────────────────────────
const expired = parsed.filter(e => !hasAnyFutureDate(e));
parsed = parsed.filter(e => hasAnyFutureDate(e));
if (expired.length > 0) {
  console.log(`\n🗑  過濾掉 ${expired.length} 筆已過期事件:`);
  expired.forEach(e => console.log(`   - [${e.type}] ${e.title} (${e.id})`));
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

// 防 hallucination
if (removed.length > existing.length * 0.3) {
  console.error(`\n❌ 移除筆數 ${removed.length} 超過原資料 30%,疑似異常,中止寫檔`);
  process.exit(3);
}

// ─── 6. 寫檔 ─────────────────────────────────────────────────────────
if (added.length === 0 && changed.length === 0 && removed.length === 0 && expired.length === 0) {
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

// 同步把 Certificates/index.html 內「(YYYY/MM/DD 更新)」改成今天
try {
  const html = await fs.readFile(INDEX_FILE, "utf8");
  const todaySlash = today.replace(/-/g, "/");
  const newHtml = html.replace(
    /年度規劃指南\s*\(\d{4}\/\d{2}\/\d{2}\s*更新\)/,
    `年度規劃指南 (${todaySlash} 更新)`
  );
  if (newHtml !== html) {
    await fs.writeFile(INDEX_FILE, newHtml, "utf8");
    console.log(`📅 已同步更新 index.html 日期戳 → ${todaySlash}`);
  }
} catch (err) {
  console.warn(`⚠️ 無法更新 index.html 日期戳:${err.message}`);
}

// 寫進 GitHub Actions step output
if (process.env.GITHUB_OUTPUT) {
  await fs.appendFile(process.env.GITHUB_OUTPUT,
    `added=${added.length}\nupdated=${changed.length}\nremoved=${removed.length}\ntotal=${parsed.length}\nhas_changes=true\n`);
}

if (process.env.GITHUB_STEP_SUMMARY) {
  const md = [
    "## Events 更新摘要",
    "",
    `| 動作 | 數量 |`,
    `|---|---:|`,
    `| 新增 | ${added.length} |`,
    `| 更新 | ${changed.length} |`,
    `| 移除 (含過期) | ${removed.length + expired.length} |`,
    `| 總計 | ${parsed.length}(原 ${existing.length})|`,
    "",
    `🔍 googleSearch 引用網路來源:**${groundingChunks.length}** 個`,
    "",
    added.length > 0 ? "### 新增" : "",
    ...added.map(e => `- [${e.type}] **${e.title}** ([連結](${e.link}))`),
    "",
    changed.length > 0 ? "### 更新" : "",
    ...changed.map(id => `- \`${id}\``),
    "",
    (removed.length > 0 || expired.length > 0) ? "### 移除/過期" : "",
    ...removed.map(e => `- ⏹ [${e.type}] ${e.title}`),
    ...expired.map(e => `- 🗑 [${e.type}] ${e.title}(過期)`),
  ].filter(Boolean).join("\n");
  await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, md);
}
