#!/usr/bin/env node
/**
 * 古箏知識專欄:以 Replicate 產生文章主視覺
 *
 * 用法:
 *   node image.mjs <slug>                 依 content/<slug>.json 的 image.prompt 產圖
 *   node image.mjs <slug> --model openai/gpt-image-2.5-flare --quality high
 *   node image.mjs <slug> --out /tmp/test.jpg   只輸出到指定位置(測試用,不改 JSON)
 *
 * 金鑰:只從環境變數 REPLICATE_API_TOKEN 讀取;本機若未設定,
 *       改讀 repo 以外的 ~/.guzhengtrain/.env。本 repo 為公開,金鑰絕不可寫入 repo。
 *
 * 產出:articles/images/<slug>.jpg(分享圖/後備)與 <slug>.webp(網頁用)
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const DEFAULT_MODEL = 'openai/gpt-image-2';

function arg(name, def) {
  const i = process.argv.indexOf('--' + name);
  return i > -1 ? process.argv[i + 1] : def;
}

function loadToken() {
  if (process.env.REPLICATE_API_TOKEN) return process.env.REPLICATE_API_TOKEN.trim();
  const f = path.join(os.homedir(), '.guzhengtrain', '.env');
  if (fs.existsSync(f)) {
    const m = fs.readFileSync(f, 'utf8').match(/^REPLICATE_API_TOKEN=(.+)$/m);
    if (m) return m[1].trim();
  }
  throw new Error('找不到 REPLICATE_API_TOKEN(請設定環境變數;切勿寫入 repo)');
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function predict(token, model, input) {
  const res = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'wait=60' },
    body: JSON.stringify({ input })
  });
  let p = await res.json();
  if (!res.ok) throw new Error(`Replicate 回應 ${res.status}:${p.detail || JSON.stringify(p).slice(0, 200)}`);
  const t0 = Date.now();
  while (!['succeeded', 'failed', 'canceled'].includes(p.status)) {
    if (Date.now() - t0 > 300000) throw new Error('產圖逾時(5 分鐘)');
    await sleep(3000);
    p = await (await fetch(p.urls.get, { headers: { Authorization: `Bearer ${token}` } })).json();
  }
  if (p.status !== 'succeeded') throw new Error(`產圖失敗:${p.error || p.status}`);
  const out = Array.isArray(p.output) ? p.output[0] : p.output;
  return { url: out, id: p.id, seconds: p.metrics && p.metrics.predict_time };
}

async function main() {
  const slug = process.argv[2];
  if (!slug || slug.startsWith('--')) throw new Error('請指定 slug,例如 node image.mjs is-guzheng-easy-to-learn');
  const src = path.join(__dirname, 'content', slug + '.json');
  const doc = JSON.parse(fs.readFileSync(src, 'utf8'));
  if (!doc.image || !doc.image.prompt) throw new Error('content JSON 缺少 image.prompt');

  const model = arg('model', doc.image.model || DEFAULT_MODEL);
  const quality = arg('quality', doc.image.quality || 'medium');
  const outArg = arg('out');
  const input = {
    prompt: doc.image.prompt,
    aspect_ratio: '16:9',
    quality,
    output_format: 'jpeg',
    output_compression: 88,
    moderation: 'auto',
    number_of_images: 1
  };

  const token = loadToken();
  console.log(`產圖中:${model}(quality=${quality})…`);
  const r = await predict(token, model, input);
  const buf = Buffer.from(await (await fetch(r.url)).arrayBuffer());

  const jpgPath = outArg ? path.resolve(outArg) : path.join(ROOT, 'articles', 'images', slug + '.jpg');
  fs.mkdirSync(path.dirname(jpgPath), { recursive: true });

  let sharp = null;
  try { sharp = (await import('sharp')).default; } catch { /* 沒有 sharp 就只輸出原始 jpeg */ }
  if (sharp) {
    // 分享圖:1200 寬 JPEG;網頁:1600 寬 WebP
    await sharp(buf).resize({ width: 1200, withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toFile(jpgPath);
    await sharp(buf).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 78 }).toFile(jpgPath.replace(/\.jpe?g$/i, '.webp'));
  } else {
    fs.writeFileSync(jpgPath, buf);
  }
  const meta = sharp ? await sharp(jpgPath).metadata() : {};
  console.log(`完成:${path.relative(ROOT, jpgPath)}  ${meta.width || '?'}x${meta.height || '?'}  ${Math.round(fs.statSync(jpgPath).size / 1024)}KB  (${(r.seconds || 0).toFixed(1)}s, prediction ${r.id})`);

  if (!outArg) {
    doc.image.file = slug + '.jpg';
    doc.image.webp = sharp ? slug + '.webp' : null;
    doc.image.model = model;
    doc.image.quality = quality;
    doc.image.generatedAt = new Date().toISOString().slice(0, 10);
    doc.image.textVerified = false; // 產圖後須人工/AI 目視核對圖上繁體中文,再改為 true
    fs.writeFileSync(src, JSON.stringify(doc, null, 2) + '\n', 'utf8');
  }
}

main().catch(e => { console.error('❌ ' + e.message); process.exit(1); });
