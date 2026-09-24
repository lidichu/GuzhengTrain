#!/usr/bin/env node
/**
 * 古箏知識專欄 發布前檢查
 *
 *   node validate.mjs            檢查全部文章
 *   node validate.mjs <slug>     只檢查一篇
 *   node validate.mjs --offline  不檢查外部來源網址(網路受限時)
 *
 * 有任何「錯誤」即以非 0 結束 → 排程不得 commit / push。
 * 「警告」會列出但不擋發布。
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const OFFLINE = process.argv.includes('--offline');
const only = process.argv.slice(2).find(a => !a.startsWith('--'));

const errors = [], warns = [];
const E = (slug, m) => errors.push(`[${slug}] ${m}`);
const W = (slug, m) => warns.push(`[${slug}] ${m}`);
const strip = s => String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, '');

/* 簡體字(繁簡不同形、且在繁體文章中不應出現者) */
const SIMPLIFIED = '这们来时会说为对进国学发过还个么样经让点实现应该种开关问题数线质视频讯网页买卖钱级练习弹调乐筝传统艺术师课节书写读听声响体验与从东两严丧丰临举义乌乐乔书买乱争亚产亲亿仅从众优会伞伟传伤伦伪体侠侣侦侧侨价俭债倾偿储儿兑党兰关兴兹养兽内冈册写军农冯冲决况冻净凉减凑凤凭凯击凿刘则刚创删别刹剂剑剧劝办务动励劲劳势勋匀区医华协单卖卢卫却厂厅历压厌厕厢厦县参双变叙叠号叹吓吕吗吨听启吴呐员呛响哑哗唤啰喷团园围图圆圣场坏块坚坛坝坞坟坠垄垒垦垫墙壮声壳处备够头夹夺奋奖妆妇妈娱婴孙宁宝实宠审宪宫宽宾对寻导寿将尔尘尝层属岁岂岗岛岭峡币师帐带帮广庆庐库应庙庞废开异弃张弥弯弹强归当录彦彻径忆忧怀态怂怜总恋恒恳恶恼悦悬惊惧惨惩惫惯愤愿战戏户执扩扫扬扰抚抛抢护报担拟拢拣拥拦拧拨择挂挡挤挥损换据掳掷揽搀携摄摆摇摊撑撵擞攒敌数斋断无旧时旷昼显晋晒晓晕暂术机杀杂权条来杨极构枪柜标栋栏树样档桥梦检椭楼榄横欢欧歼毁毕毙气汇汉汤沟没沪泪泼泽洁浅测济浏浑浓涛润涨涩渊渐渔渗温湾湿溃满滚滞滨滩潇灭灯灵灾灿炉点炼烁烂烛烟烦烧热焕爱爷牍牵牺犹狈独狭狮猎献环现珐琐电画畅畴疗疯痒瘫癞盏盐监盖盘着矫矿码砖础硕确碍礼祸离秃种积称稳穷窃窍竖竞笔笼签简粮紧纠红约级纪纯纱纲纳纵纷纸纹纺纽线练组细织终经绑绕绘给络绝统绢绣继续绰维绵综绿缓编缘缚缝缠缩网罗罚罢羡翘耸耻聂职联聪肃肠肤肿胀胁胆胜胶脉脏脑脚脱腊舆舰舱艰艺节芦苏苹茧荆荐荡荣药莱获营萧萨蓝蔼虏虑虽虾蚀蚁蚂蛮补衬袄袜装裤见观规视览觉誉计订认讨让训议讯记讲讳讶许论设访证评识诉诊词译试诗诚话诞询该详语误说请诸诺读课谁调谈谊谋谓谢谣谦谨谱贝贞负贡财责贤败货质贩贪贫购贯贱贴贵贷贸费贺贼资赋赌赏赔赖赚赛赞赠赶趋跃践躯车轨轩转轮软轰轻载较辅辆辈辉辑输辞边辽达迁过迈运还这进远违连迟适选逊递逻遗邓邮邻郑郸酝酱酿释钉钓钟钢钥钱钻铁铃铅铜铭银铺链销锁锅锈锋错锦键镇镜长门闪闭问闯闲间闷闹闻阀阁阅队阳阴阵阶际陆陈陕险随隐隶难雏雾静韦韩页顶项顺须顽顾顿预领频题额颜风飘飞饥饭饮饰饱饲饶饼馆马驱驳驶驻驾骂骄验骑骗骚骤鱼鲁鲜鸟鸡鸣鸭鸿鹅鹤麦黄齐齿龙';
const SIMP_SET = new Set([...SIMPLIFIED]);
/* 大陸用語 → 台灣用語 */
const MAINLAND = { '視頻': '影片', '質量': '品質', '信息': '資訊', '網絡': '網路', '軟件': '軟體', '屏幕': '螢幕', '古筝': '古箏', '古爭': '古箏', '博客': '部落格', '短信': '簡訊', '打印': '列印', '鼠標': '滑鼠', '渠道': '管道' };
/* 隱私:教室地址不可外洩 */
const PRIVATE = ['中平路', '46巷', '46 巷', '15號1樓'];
/* 捏造發言/數據的常見句型 */
const FABRICATION = [/(廖美華|廖老師|許老師|蔡老師|藍老師|鄧老師|軒軒老師|簡老師)[^。]{0,12}(說|表示|指出|分享|提到|強調)/, /(學員|學生)[^。]{0,6}(見證|心得分享)[：:]/, /(研究|調查|統計)(顯示|指出|發現)(?![^。]*(根據|依據|來源|〈|《))/];
/* 醫療/保證用語 */
const CLAIMS = [/治療|療效|治癒|改善.{0,4}(疾病|失智|憂鬱)/, /保證(考過|學會|通過|錄取)/, /(包過|百分之百|100%)(考過|學會|通過)/];
/* 內文允許的 HTML 標籤 */
const ALLOWED = new Set(['p', 'h3', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'blockquote', 'br']);

const CONTENT = path.join(__dirname, 'content');
const files = fs.readdirSync(CONTENT).filter(f => f.endsWith('.json') && (!only || f === only + '.json'));
if (!files.length) { console.error('找不到文章'); process.exit(1); }

const existingSlugs = new Set();
async function checkUrl(url) {
  try {
    let r = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'User-Agent': 'Mozilla/5.0 GuzhengTrainValidator' } });
    if (r.status === 405 || r.status === 403 || r.status === 404) r = await fetch(url, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'User-Agent': 'Mozilla/5.0 GuzhengTrainValidator' } });
    return r.status;
  } catch (e) { return 'ERR:' + (e.cause && e.cause.code || e.name); }
}

for (const f of files) {
  let a;
  try { a = JSON.parse(fs.readFileSync(path.join(CONTENT, f), 'utf8')); }
  catch (e) { E(f, 'JSON 格式錯誤:' + e.message); continue; }
  const s = a.slug || f;

  // ── 必要欄位與格式
  for (const k of ['slug', 'title', 'description', 'category', 'datePublished', 'summary', 'sections', 'faq', 'sources', 'image']) if (!a[k]) E(s, `缺少欄位 ${k}`);
  if (!a.title || !a.sections) continue;
  if (a.slug + '.json' !== f) E(s, 'slug 與檔名不一致');
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(a.slug)) E(s, 'slug 只能用小寫英數與連字號');
  if (existingSlugs.has(a.slug)) E(s, 'slug 重複'); existingSlugs.add(a.slug);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(a.datePublished)) E(s, 'datePublished 格式需為 YYYY-MM-DD');
  if (a.title.length < 12 || a.title.length > 40) E(s, `標題長度 ${a.title.length} 字,需 12–40 字`);
  if (a.description.length < 60 || a.description.length > 160) E(s, `描述長度 ${a.description.length} 字,需 60–160 字`);
  if (a.summary.length < 3 || a.summary.length > 6) E(s, '重點摘要需 3–6 點');
  if (a.sections.length < 4) E(s, '內文至少 4 個段落(H2)');
  if (a.faq.length < 3) E(s, '常見問題至少 3 題');
  if (a.sources.length < 2) E(s, '參考資料至少 2 個');

  // ── 內文 HTML 與長度
  const ids = new Set();
  for (const sec of a.sections) {
    if (!sec.id || !/^[a-z0-9-]+$/.test(sec.id)) E(s, `段落 id 不合法:${sec.id}`);
    if (ids.has(sec.id)) E(s, `段落 id 重複:${sec.id}`); ids.add(sec.id);
    for (const m of sec.html.matchAll(/<\/?([a-zA-Z0-9]+)[^>]*>/g)) if (!ALLOWED.has(m[1].toLowerCase())) E(s, `內文含不允許的標籤 <${m[1]}>`);
    if (/<script|on\w+=|javascript:/i.test(sec.html)) E(s, '內文含腳本或事件屬性');
    const opens = (sec.html.match(/<(p|ul|ol|li|table|tr|td|th)\b/g) || []).length, closes = (sec.html.match(/<\/(p|ul|ol|li|table|tr|td|th)>/g) || []).length;
    if (opens !== closes) E(s, `段落「${sec.h2}」HTML 標籤未正確閉合(開 ${opens}/關 ${closes})`);
  }
  const allText = [a.title, a.description, ...a.summary, ...a.sections.map(x => x.h2 + x.html), ...a.faq.map(x => x.q + x.a), a.image && a.image.alt].join('');
  const plain = strip(a.sections.map(x => x.html).join(''));
  if (plain.length < 1500) E(s, `內文僅 ${plain.length} 字,至少 1500 字`);
  if (plain.length > 6000) W(s, `內文 ${plain.length} 字,偏長`);

  // ── 語言:簡體字與大陸用語
  const simp = [...new Set([...strip(allText)].filter(c => SIMP_SET.has(c)))];
  if (simp.length) E(s, `出現簡體字:${simp.join(' ')}`);
  for (const [bad, good] of Object.entries(MAINLAND)) if (allText.includes(bad)) E(s, `大陸用語「${bad}」請改為「${good}」`);

  // ── 隱私、捏造、宣稱
  for (const p of PRIVATE) if (allText.includes(p)) E(s, `洩漏教室地址:「${p}」`);
  for (const re of FABRICATION) { const m = strip(allText).match(re); if (m) E(s, `疑似捏造發言或數據:「${m[0]}」`); }
  for (const re of CLAIMS) { const m = strip(allText).match(re); if (m) E(s, `不當宣稱:「${m[0]}」`); }
  const pct = strip(allText).match(/\d+(\.\d+)?\s*[%％]/g);
  if (pct) W(s, `含百分比數字 ${pct.join('、')},請確認有來源`);

  // ── 內部連結
  const links = [...allText.matchAll(/href="([^"]+)"/g)].map(m => m[1]).concat(a.related || []);
  for (const l of links) {
    if (/^https?:\/\//.test(l)) continue;
    const p = l.split('#')[0].replace(/^\//, '');
    const target = p === '' ? 'index.html' : (p.endsWith('/') ? p + 'index.html' : p);
    if (!fs.existsSync(path.join(ROOT, target))) E(s, `內部連結不存在:${l}`);
  }

  // ── 來源
  for (const src of a.sources) {
    if (!src.title || !/^https:\/\//.test(src.url || '')) { E(s, `來源格式錯誤:${JSON.stringify(src)}`); continue; }
    if (!OFFLINE) {
      const st = await checkUrl(src.url);
      if (typeof st === 'string') W(s, `來源無法連線(網路受限?):${src.url} ${st}`);
      else if (st >= 400) E(s, `來源網址失效 HTTP ${st}:${src.url}`);
    }
  }

  // ── 圖片
  const img = a.image || {};
  if (!img.alt || img.alt.length < 8) E(s, '圖片需要有意義的 alt 文字');
  for (const key of ['file', 'webp']) {
    if (!img[key]) { if (key === 'file') E(s, '缺少圖片檔名'); continue; }
    const p = path.join(ROOT, 'articles', 'images', img[key]);
    if (!fs.existsSync(p)) E(s, `圖片不存在:articles/images/${img[key]}`);
    else if (fs.statSync(p).size > 500 * 1024) E(s, `圖片過大(${Math.round(fs.statSync(p).size / 1024)}KB):${img[key]}`);
  }
  if (img.textVerified !== true) E(s, '圖上文字尚未核對(image.textVerified 必須為 true)');

  // ── 產出的 HTML
  const html = path.join(ROOT, 'articles', a.slug + '.html');
  if (!fs.existsSync(html)) E(s, '尚未執行 build.mjs(找不到文章 HTML)');
  else {
    const h = fs.readFileSync(html, 'utf8');
    for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      try { JSON.parse(m[1]); } catch (e) { E(s, '結構化資料 JSON 解析失敗'); }
    }
    if ((h.match(/<h1\b/g) || []).length !== 1) E(s, '文章頁 H1 必須剛好 1 個');
    if (!h.includes(`rel="canonical" href="https://guzhengtrain.com/articles/${a.slug}.html"`)) E(s, 'canonical 錯誤');
  }
}

// ── 全站:金鑰外洩掃描(本 repo 公開)
try {
  const tracked = execSync('git ls-files', { cwd: ROOT }).toString().trim().split('\n');
  const extra = fs.readdirSync(path.join(ROOT, 'articles')).map(f => 'articles/' + f);
  for (const rel of [...new Set([...tracked, ...extra, 'llms.txt', 'sitemap.xml'])]) {
    const p = path.join(ROOT, rel);
    if (!fs.existsSync(p) || fs.statSync(p).isDirectory() || fs.statSync(p).size > 2e6 || /\.(jpg|jpeg|png|webp|gif|ico|pdf|woff2?)$/i.test(rel)) continue;
    if (/r8_[A-Za-z0-9]{20,}|REPLICATE_API_TOKEN=[A-Za-z0-9]/.test(fs.readFileSync(p, 'utf8'))) E('全站', `🚨 疑似 API 金鑰出現在 ${rel}`);
  }
} catch (e) { W('全站', '金鑰掃描未完成:' + e.message); }

// ── sitemap 與 llms.txt 需包含每篇文章
const sm = fs.existsSync(path.join(ROOT, 'sitemap.xml')) ? fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8') : '';
const llms = fs.existsSync(path.join(ROOT, 'llms.txt')) ? fs.readFileSync(path.join(ROOT, 'llms.txt'), 'utf8') : '';
for (const slug of existingSlugs) {
  if (!sm.includes(`/articles/${slug}.html`)) E(slug, 'sitemap.xml 未收錄');
  if (!llms.includes(`/articles/${slug}.html`)) E(slug, 'llms.txt 未收錄');
}

console.log(warns.map(w => '⚠ ' + w).join('\n'));
if (errors.length) {
  console.error(errors.map(e => '❌ ' + e).join('\n'));
  console.error(`\n檢查未通過:${errors.length} 個錯誤、${warns.length} 個警告。不得發布。`);
  process.exit(1);
}
console.log(`✔ 檢查通過(${files.length} 篇,${warns.length} 個警告)`);
