#!/usr/bin/env node
/**
 * 一次性清理工具:過濾掉 Certificates/events.json 中已過期事件
 *
 * 「已過期」定義:所有日期欄位(regStart / regEnd / examDates / resultDate)
 *               皆早於今天。完全沒有日期的事件(TBA)會保留。
 *
 * 用法:
 *   node cleanup-expired.mjs            真的寫檔
 *   DRY_RUN=1 node cleanup-expired.mjs  只預覽不寫
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EVENTS_FILE = path.resolve(__dirname, "..", "Certificates", "events.json");
const INDEX_FILE = path.resolve(__dirname, "..", "Certificates", "index.html");
const DRY_RUN = process.env.DRY_RUN === "1";

const today = new Date().toISOString().slice(0, 10);
const todayMs = new Date(today).getTime();

function hasAnyFutureDate(event) {
  const dates = [];
  if (event.regStart) dates.push(event.regStart);
  if (event.regEnd) dates.push(event.regEnd);
  if (event.resultDate) dates.push(event.resultDate);
  if (Array.isArray(event.examDates)) dates.push(...event.examDates);

  if (dates.length === 0) return true;
  return dates.some(d => new Date(d).getTime() >= todayMs);
}

const raw = await fs.readFile(EVENTS_FILE, "utf8");
const events = JSON.parse(raw);

const keep = events.filter(hasAnyFutureDate);
const drop = events.filter(e => !hasAnyFutureDate(e));

console.log(`📦 原始事件 ${events.length} 筆`);
console.log(`✅ 保留 ${keep.length} 筆`);
console.log(`🗑  移除 ${drop.length} 筆(所有日期都在 ${today} 之前):`);
drop.forEach(e => {
  const allDates = [
    ...(e.examDates || []),
    e.regEnd,
    e.regStart,
    e.resultDate,
  ].filter(Boolean);
  const latest = allDates.sort().slice(-1)[0] || "無日期";
  console.log(`   - [${e.type}] ${e.title}`);
  console.log(`     id: ${e.id}, 最晚日期: ${latest}`);
});

if (drop.length === 0) {
  console.log("\n✨ 沒有過期事件,不需處理");
  process.exit(0);
}

if (DRY_RUN) {
  console.log("\n🔬 DRY_RUN=1,不寫檔");
  process.exit(0);
}

await fs.writeFile(EVENTS_FILE, JSON.stringify(keep, null, 2) + "\n", "utf8");
console.log(`\n💾 已更新 ${path.relative(process.cwd(), EVENTS_FILE)}`);

// 同步更新 index.html 日期戳
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
