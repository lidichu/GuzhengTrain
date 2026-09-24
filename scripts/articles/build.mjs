#!/usr/bin/env node
/**
 * 古箏知識專欄 建置程式
 *
 *   node build.mjs
 *
 * 讀取 content/*.json,產出:
 *   articles/<slug>.html     文章頁
 *   articles/index.html      專欄首頁
 *   articles/feed.xml        RSS
 *   index.html               首頁「最新專欄」區塊(<!-- ARTICLES:START/END --> 之間)
 *   sitemap.xml、llms.txt    全站
 * 並確保全站導覽下拉選單與頁尾都有「古箏知識專欄」連結。
 *
 * 導覽列與頁尾直接取自 learning/index.html,確保與全站一致。
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const SITE = 'https://guzhengtrain.com';
const AUTHOR = '箏心古箏教室編輯部';
const SCHOOL = '新莊箏心古箏音樂教室';
const FORM = 'https://docs.google.com/forms/d/e/1FAIpQLScCXuof2G7AZ5258bL7v1T0-A2l0_ziNdBSSIgzxMO6FNgppg/viewform';
const LINE = 'https://line.me/ti/p/~@swn8120u';
const GA = 'G-VYZSYN15C2';

const rd = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const wr = (rel, s) => { fs.mkdirSync(path.dirname(path.join(ROOT, rel)), { recursive: true }); fs.writeFileSync(path.join(ROOT, rel), s, 'utf8'); };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = s => String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const zhDate = d => { const [y, m, dd] = d.split('-'); return `${y} 年 ${+m} 月 ${+dd} 日`; };
const rfc822 = d => new Date(d + 'T09:00:00+08:00').toUTCString();
const gitDate = rel => {
  try { return execSync(`git log -1 --format=%cs -- "${rel}"`, { cwd: ROOT }).toString().trim() || null; }
  catch { return null; }
};
// 以原檔換行格式寫回,避免整檔換行被改動
function writeKeepEol(rel, text) {
  const raw = rd(rel);
  wr(rel, raw.includes('\r\n') ? text.replace(/\r?\n/g, '\r\n') : text);
}

/* ── 讀取文章 ─────────────────────────────────────────── */
const CONTENT = path.join(__dirname, 'content');
const articles = fs.readdirSync(CONTENT).filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(fs.readFileSync(path.join(CONTENT, f), 'utf8')))
  .filter(a => a.status !== 'draft')
  .sort((a, b) => b.datePublished.localeCompare(a.datePublished) || a.slug.localeCompare(b.slug));

/* ── 共用版型:從學習指南總覽頁取出導覽列與頁尾 ─────────────── */
const learningIndex = rd('learning/index.html').replace(/\r\n/g, '\n');
const NAV = learningIndex.match(/<nav class="navbar[\s\S]*?\n\s*<\/nav>/)[0];
const FOOTER = learningIndex.match(/<footer class="site-footer">[\s\S]*?<\/footer>/)[0];

const readMinutes = a => {
  const chars = strip(a.sections.map(s => s.html).join('') + a.summary.join('') + a.faq.map(f => f.q + f.a).join('')).length;
  return Math.max(3, Math.round(chars / 400));
};
const coverUrl = a => `${SITE}/articles/images/${a.image.file}`;

function head({ title, description, url, image, type, extraCss, jsonld }) {
  return `<!DOCTYPE html>
<html lang="zh-Hant-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${url}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="${image}">
  <meta property="og:url" content="${url}">
  <meta property="og:type" content="${type}">
  <meta property="og:locale" content="zh_TW">
  <meta property="og:site_name" content="${SCHOOL}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="alternate" type="application/rss+xml" title="古箏知識專欄" href="${SITE}/articles/feed.xml">

  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  <link rel="stylesheet" href="../styles.css">
  <link rel="stylesheet" href="articles.css">${extraCss || ''}
  <link rel="icon" type="image/png" href="../favicon.png">
  <link rel="apple-touch-icon" href="../apple-touch-icon.png">

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" defer></script>
  <script src="../main.js" defer></script>

  <script async src="https://www.googletagmanager.com/gtag/js?id=${GA}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA}');
  </script>
  <script type="application/ld+json">
${JSON.stringify(jsonld, null, 2).replace(/^/gm, '  ')}
  </script>
</head>
<body>
  ${NAV}
`;
}

const tail = () => `
  ${FOOTER}
</body>
</html>
`;

const PUBLISHER = { '@type': 'MusicSchool', '@id': SITE + '/#school', name: SCHOOL, url: SITE + '/', logo: { '@type': 'ImageObject', url: SITE + '/favicon.png' } };

function picture(a, cls, loading) {
  const alt = esc(a.image.alt || a.title);
  const webp = a.image.webp ? `<source srcset="images/${a.image.webp}" type="image/webp">` : '';
  return `<picture>${webp}<img src="images/${a.image.file}" alt="${alt}" width="1200" height="675" class="${cls}"${loading ? ` loading="${loading}"` : ' fetchpriority="high"'} decoding="async"></picture>`;
}

// 內文:表格包一層可橫向捲動的容器,並替每格加上欄名(手機版改為卡片式堆疊時顯示);外部連結補 target 與 rel
function bodyHtml(html) {
  html = html.replace(/<table>([\s\S]*?)<\/table>/g, (m, inner) => {
    const thead = (inner.match(/<thead>[\s\S]*?<\/thead>/) || [''])[0];
    const heads = [...thead.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map(x => strip(x[1]));
    const body = inner.replace(/<tbody>([\s\S]*?)<\/tbody>/, (tb, rows) => '<tbody>' + rows.replace(/<tr>([\s\S]*?)<\/tr>/g, (row, cells) => {
      let i = 0;
      return '<tr>' + cells.replace(/<td>/g, () => { const h = heads[i++]; return h ? `<td data-label="${esc(h)}">` : '<td>'; }) + '</tr>';
    }) + '</tbody>');
    return '<div class="table-wrap"><table>' + body + '</table></div>';
  });
  return html.replace(/<a href="(https?:\/\/[^"]+)"(?![^>]*target=)/g, '<a href="$1" target="_blank" rel="noopener"');
}

function card(a, prefix) {
  const webp = a.image.webp ? `<source srcset="${prefix}images/${a.image.webp}" type="image/webp">` : '';
  return `<article class="art-card" data-cat="${esc(a.category)}">
          <a href="${prefix}${a.slug}.html" class="art-card-link">
            <div class="art-card-img"><picture>${webp}<img src="${prefix}images/${a.image.file}" alt="" width="1200" height="675" loading="lazy" decoding="async"></picture></div>
            <div class="art-card-body">
              <span class="art-card-cat">${esc(a.category)}</span>
              <h3>${esc(a.title)}</h3>
              <p>${esc(a.description.length > 62 ? a.description.slice(0, 60) + '⋯' : a.description)}</p>
              <time datetime="${a.datePublished}">${zhDate(a.datePublished)}</time>
            </div>
          </a>
        </article>`;
}

/* ── 文章頁 ──────────────────────────────────────────── */
function learningTitle(href) {
  const f = href.replace(/^\//, '');
  if (!fs.existsSync(path.join(ROOT, f))) return null;
  const h = rd(f);
  return strip((h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [, ''])[1]);
}

function renderArticle(a) {
  const url = `${SITE}/articles/${a.slug}.html`;
  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting', '@id': url + '#article', headline: a.title, description: a.description,
        image: coverUrl(a), inLanguage: 'zh-Hant-TW', datePublished: a.datePublished, dateModified: a.dateModified || a.datePublished,
        author: { '@type': 'Organization', name: AUTHOR, url: SITE + '/' }, publisher: PUBLISHER, mainEntityOfPage: url,
        articleSection: a.category, keywords: (a.tags || []).join(','),
        citation: (a.sources || []).map(s => ({ '@type': 'CreativeWork', name: s.title, url: s.url })),
        isPartOf: { '@type': 'Blog', name: '古箏知識專欄', url: SITE + '/articles/' }
      },
      {
        '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首頁', item: SITE + '/' },
          { '@type': 'ListItem', position: 2, name: '古箏知識專欄', item: SITE + '/articles/' },
          { '@type': 'ListItem', position: 3, name: a.title, item: url }
        ]
      },
      ...(a.faq && a.faq.length ? [{
        '@type': 'FAQPage', mainEntity: a.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
      }] : [])
    ]
  };

  const toc = a.sections.map(s => `<li><a href="#${s.id}">${esc(s.h2)}</a></li>`).join('')
    + (a.faq && a.faq.length ? '<li><a href="#faq">常見問題</a></li>' : '');

  const related = [];
  for (const href of a.related || []) {
    const t = learningTitle(href);
    if (t) related.push(`<li><a href="${href}"><i class="fas fa-book-open" aria-hidden="true"></i>${esc(t)}</a></li>`);
  }
  const more = articles.filter(x => x.slug !== a.slug)
    .sort((x, y) => (y.category === a.category) - (x.category === a.category) || y.datePublished.localeCompare(x.datePublished))
    .slice(0, 3);

  return head({
    title: `${a.title}｜古箏知識專欄`, description: a.description, url, image: coverUrl(a), type: 'article', jsonld
  }).replace('<meta name="twitter:card"', `<meta property="article:published_time" content="${a.datePublished}">\n  <meta property="article:modified_time" content="${a.dateModified || a.datePublished}">\n  <meta name="twitter:card"`) + `
  <section class="art-hero">
    <div class="container art-narrow">
      <nav aria-label="麵包屑" class="art-breadcrumb">
        <a href="/">首頁</a><span class="sep">›</span><a href="/articles/">古箏知識專欄</a><span class="sep">›</span><span class="current">${esc(a.category)}</span>
      </nav>
      <span class="art-cat">${esc(a.category)}</span>
      <h1>${esc(a.title)}</h1>
      <p class="art-byline"><i class="fas fa-feather-alt" aria-hidden="true"></i> ${AUTHOR}<span class="sep">・</span><time datetime="${a.datePublished}">${zhDate(a.datePublished)}</time>${a.dateModified && a.dateModified !== a.datePublished ? `<span class="sep">・</span>更新於 <time datetime="${a.dateModified}">${zhDate(a.dateModified)}</time>` : ''}<span class="sep">・</span>約 ${readMinutes(a)} 分鐘讀完</p>
    </div>
  </section>

  <main class="art-main">
    <div class="container art-narrow">
      <figure class="art-cover">
        ${picture(a, 'art-cover-img')}
        <figcaption>示意圖（AI 生成）</figcaption>
      </figure>

      <aside class="art-summary" aria-label="重點摘要">
        <h2><i class="fas fa-lightbulb" aria-hidden="true"></i> 重點摘要</h2>
        <ul>${a.summary.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
      </aside>

      <nav class="art-toc" aria-label="文章目錄">
        <details open>
          <summary>文章目錄</summary>
          <ol>${toc}</ol>
        </details>
      </nav>

      <div class="art-body">
${a.sections.map(s => `        <section id="${s.id}">
          <h2>${esc(s.h2)}</h2>
          ${bodyHtml(s.html)}
        </section>`).join('\n')}
      </div>

${a.faq && a.faq.length ? `      <section class="art-faq" id="faq">
        <h2>常見問題</h2>
${a.faq.map(f => `        <details>
          <summary>${esc(f.q)}</summary>
          <p>${esc(f.a)}</p>
        </details>`).join('\n')}
      </section>
` : ''}
      <section class="art-cta" aria-label="預約體驗課">
        <h2>想實際彈彈看嗎？</h2>
        <p>新莊箏心古箏音樂教室提供 $350 體驗課，由老師一對一帶你認識古箏、彈出第一段旋律。</p>
        <p class="art-cta-note">本教室位於新北市新莊區（鄰近新莊體育場、新泰國中），採預約制，為確保上課品質平日不開放參觀；預約成功後將提供詳細交通資訊。</p>
        <div class="art-cta-btns">
          <a href="${FORM}" class="art-btn art-btn-primary" target="_blank" rel="noopener"><i class="fas fa-edit" aria-hidden="true"></i> 填寫體驗課報名表</a>
          <a href="${LINE}" class="art-btn art-btn-line" target="_blank" rel="noopener"><i class="fab fa-line" aria-hidden="true"></i> 加入官方 LINE</a>
        </div>
      </section>

${a.sources && a.sources.length ? `      <section class="art-sources">
        <h2>參考資料</h2>
        <ol>
${a.sources.map(s => `          <li><a href="${esc(s.url)}" target="_blank" rel="noopener${s.nofollow ? ' nofollow' : ''}">${esc(s.title)}</a></li>`).join('\n')}
        </ol>
      </section>
` : ''}
      <section class="art-related">
        <h2>延伸閱讀</h2>
${related.length ? `        <ul class="art-related-links">${related.join('')}</ul>\n` : ''}${more.length ? `        <div class="art-grid art-grid-small">
        ${more.map(x => card(x, '')).join('\n        ')}
        </div>\n` : ''}        <p class="art-back"><a href="/articles/"><i class="fas fa-arrow-left" aria-hidden="true"></i> 回到古箏知識專欄</a></p>
      </section>
    </div>
  </main>
` + tail();
}

/* ── 專欄首頁 ─────────────────────────────────────────── */
function renderIndex() {
  const url = SITE + '/articles/';
  const cats = [...new Set(articles.map(a => a.category))];
  const desc = '古箏知識專欄：由新莊箏心古箏音樂教室編輯部整理，每週更新古箏學習入門、樂器知識、保養調音、考級比賽與曲目賞析等實用文章。';
  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Blog', '@id': url + '#blog', name: '古箏知識專欄', description: desc, url, inLanguage: 'zh-Hant-TW', publisher: PUBLISHER,
        blogPost: articles.map(a => ({ '@type': 'BlogPosting', headline: a.title, url: `${SITE}/articles/${a.slug}.html`, datePublished: a.datePublished })) },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: '首頁', item: SITE + '/' },
        { '@type': 'ListItem', position: 2, name: '古箏知識專欄', item: url }] }
    ]
  };
  return head({ title: `古箏知識專欄｜${SCHOOL}`, description: desc, url, image: articles[0] ? coverUrl(articles[0]) : SITE + '/img/og-cover.jpg', type: 'website', jsonld }) + `
  <section class="art-hero art-hero-index">
    <div class="container">
      <nav aria-label="麵包屑" class="art-breadcrumb">
        <a href="/">首頁</a><span class="sep">›</span><span class="current">古箏知識專欄</span>
      </nav>
      <h1>古箏知識專欄</h1>
      <p class="art-hero-sub">學古箏的大小事，每週一篇。從入門、樂器、保養到考級，由教室編輯部為你整理。</p>
    </div>
  </section>

  <main class="art-main">
    <div class="container">
${cats.length > 1 ? `      <div class="art-filter" role="group" aria-label="依分類篩選">
        <button type="button" class="art-chip is-active" data-filter="all" aria-pressed="true">全部</button>
${cats.map(c => `        <button type="button" class="art-chip" data-filter="${esc(c)}" aria-pressed="false">${esc(c)}</button>`).join('\n')}
      </div>
` : ''}      <div class="art-grid" id="artGrid">
        ${articles.map(a => card(a, '')).join('\n        ')}
      </div>
      <p class="art-empty" id="artEmpty" hidden>這個分類目前還沒有文章，歡迎先看看其他主題。</p>

      <aside class="art-learning-link">
        <p><i class="fas fa-book-open" aria-hidden="true"></i> 想按部就班從基礎學起？請看有系統的 <a href="/learning/">古箏學習指南</a>（坐姿、指法、技巧、選購與保養）。</p>
      </aside>
    </div>
  </main>
  <script>
    (function () {
      var chips = document.querySelectorAll('.art-chip');
      var cards = document.querySelectorAll('#artGrid .art-card');
      var empty = document.getElementById('artEmpty');
      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          var f = chip.getAttribute('data-filter'), shown = 0;
          chips.forEach(function (c) { var on = c === chip; c.classList.toggle('is-active', on); c.setAttribute('aria-pressed', on); });
          cards.forEach(function (card) { var ok = f === 'all' || card.getAttribute('data-cat') === f; card.hidden = !ok; if (ok) shown++; });
          empty.hidden = shown > 0;
        });
      });
    })();
  </script>
` + tail();
}

/* ── 首頁「最新專欄」區塊 ──────────────────────────────── */
function updateHomepage() {
  const latest = articles.slice(0, 3);
  const block = `<!-- ARTICLES:START(此區由 scripts/articles/build.mjs 自動產生,請勿手動修改) -->
<section id="latest-articles">
  <div class="container">
    <h2 class="section-title">古箏知識專欄</h2>
    <p class="latest-articles-intro">每週一篇，整理學古箏的實用知識</p>
    <div class="latest-articles-grid">
      ${latest.map(a => card(a, 'articles/').replace('href="articles/', 'href="/articles/')).join('\n      ')}
    </div>
    <div class="latest-articles-more"><a href="/articles/" class="latest-articles-btn">看更多專欄文章 <i class="fas fa-arrow-right" aria-hidden="true"></i></a></div>
  </div>
</section>
<!-- ARTICLES:END -->`;
  let h = rd('index.html').replace(/\r\n/g, '\n');
  if (/<!-- ARTICLES:START[\s\S]*?<!-- ARTICLES:END -->/.test(h)) {
    h = h.replace(/<!-- ARTICLES:START[\s\S]*?<!-- ARTICLES:END -->/, block);
  } else {
    // 第一次:放在「學習指南精選」區塊之後
    const i = h.indexOf('<section id="learning-guides">');
    const j = h.indexOf('</section>', i) + '</section>'.length;
    if (i < 0) throw new Error('首頁找不到 #learning-guides 區塊');
    h = h.slice(0, j) + '\n\n' + block + h.slice(j);
  }
  writeKeepEol('index.html', h);
}

/* ── 全站導覽與頁尾加入專欄連結(可重複執行) ───────────────── */
function ensureSiteLinks() {
  const pages = execSync('git ls-files "*.html"', { cwd: ROOT }).toString().trim().split('\n')
    .concat(fs.existsSync(path.join(ROOT, 'articles')) ? fs.readdirSync(path.join(ROOT, 'articles')).filter(f => f.endsWith('.html')).map(f => 'articles/' + f) : [])
    .filter((v, i, arr) => arr.indexOf(v) === i && !v.startsWith('visit-') && fs.existsSync(path.join(ROOT, v)));
  let changed = 0;
  for (const rel of pages) {
    let h = rd(rel).replace(/\r\n/g, '\n'); const before = h;
    h = h.replace(/(\n(\s*)<a class="dropdown-item" href="\/learning\/">學習總覽<\/a>)(?!\n\s*<a class="dropdown-item" href="\/articles\/">)/,
      '$1\n$2<a class="dropdown-item" href="/articles/">古箏知識專欄</a>');
    h = h.replace(/(\n(\s*)<li><a href="\/learning\/">學習指南<\/a><\/li>)(?!\n\s*<li><a href="\/articles\/">)/,
      '$1\n$2<li><a href="/articles/">古箏知識專欄</a></li>');
    if (h !== before) { writeKeepEol(rel, h); changed++; }
  }
  return changed;
}

/* ── sitemap.xml ─────────────────────────────────────── */
function buildSitemap() {
  const learning = fs.readdirSync(path.join(ROOT, 'learning')).filter(f => /^\d{2}-.*\.html$/.test(f)).sort();
  const urls = [
    { loc: '/', file: 'index.html', pri: '1.0', freq: 'weekly' },
    { loc: '/articles/', file: 'articles/index.html', pri: '0.9', freq: 'weekly', last: articles[0] && (articles[0].dateModified || articles[0].datePublished) },
    ...articles.map(a => ({ loc: `/articles/${a.slug}.html`, pri: '0.8', freq: 'monthly', last: a.dateModified || a.datePublished })),
    { loc: '/learning/', file: 'learning/index.html', pri: '0.9', freq: 'monthly' },
    ...learning.map(f => ({ loc: `/learning/${f}`, file: `learning/${f}`, pri: '0.8', freq: 'monthly' })),
    { loc: '/Certificates/', file: 'Certificates/index.html', pri: '0.8', freq: 'monthly' },
    { loc: '/quiz/', file: 'quiz/index.html', pri: '0.6', freq: 'yearly' }
  ];
  const today = new Date().toISOString().slice(0, 10);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${SITE}${u.loc}</loc>
    <lastmod>${u.last || (u.file && gitDate(u.file)) || today}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.pri}</priority>
  </url>`).join('\n')}
</urlset>
`;
  wr('sitemap.xml', xml);
  return urls.length;
}

/* ── llms.txt(給 AI 引擎讀的網站摘要) ──────────────────── */
function buildLlms() {
  const learning = fs.readdirSync(path.join(ROOT, 'learning')).filter(f => /^\d{2}-.*\.html$/.test(f)).sort();
  const meta = rel => {
    const h = rd(rel);
    return { h1: strip((h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [, ''])[1]), d: (h.match(/<meta name="description" content="([^"]*)"/) || [, ''])[1] };
  };
  const txt = `# ${SCHOOL}

> 位於新北市新莊區（鄰近新莊體育場、新泰國中）的古箏與琵琶音樂教室，提供一對一教學、考級輔導與 $350 體驗課。採預約制，為確保上課品質平日不開放參觀，體驗課預約成功後提供詳細交通資訊。

## 教室資訊

- 地點：新北市新莊區，鄰近新莊體育場、新泰國中（不公開門牌，預約後提供交通資訊）
- 營業時間：週一至週日 09:00–22:00
- 課程：古箏一對一教學、琵琶課程、考級輔導、$350 體驗課
- 師資：創辦人廖美華老師（15 年教學經驗、經營 YouTube 古箏教學頻道），以及科班出身的古箏與琵琶教師群；其中軒軒老師曾獲黃鐘獎世界古箏大賽特鐘特獎
- 預約方式：官方 LINE @swn8120u，或填寫體驗課報名表
- 網站：${SITE}/

## 古箏知識專欄（每週更新）

${articles.map(a => `- [${a.title}](${SITE}/articles/${a.slug}.html)：${a.description}`).join('\n')}

## 古箏學習指南（系統化課程）

${learning.map(f => { const m = meta('learning/' + f); return `- [${m.h1}](${SITE}/learning/${f})：${m.d}`; }).join('\n')}

## 其他

- [2026 古箏考級與比賽情報](${SITE}/Certificates/)：國樂學會檢定、黃鐘獎全國音樂考級與各大古箏比賽時程，每月更新
- [古箏能力測驗](${SITE}/quiz/)：線上測驗了解自己的古箏程度
- [RSS 訂閱](${SITE}/articles/feed.xml)
`;
  wr('llms.txt', txt);
}

/* ── RSS ─────────────────────────────────────────────── */
function buildFeed() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>古箏知識專欄｜${SCHOOL}</title>
    <link>${SITE}/articles/</link>
    <atom:link href="${SITE}/articles/feed.xml" rel="self" type="application/rss+xml"/>
    <description>每週一篇古箏學習實用知識</description>
    <language>zh-TW</language>
    ${articles[0] ? `<lastBuildDate>${rfc822(articles[0].dateModified || articles[0].datePublished)}</lastBuildDate>` : ''}
${articles.map(a => `    <item>
      <title>${esc(a.title)}</title>
      <link>${SITE}/articles/${a.slug}.html</link>
      <guid isPermaLink="true">${SITE}/articles/${a.slug}.html</guid>
      <pubDate>${rfc822(a.datePublished)}</pubDate>
      <category>${esc(a.category)}</category>
      <description>${esc(a.description)}</description>
    </item>`).join('\n')}
  </channel>
</rss>
`;
  wr('articles/feed.xml', xml);
}

/* ── 執行 ────────────────────────────────────────────── */
for (const a of articles) wr(`articles/${a.slug}.html`, renderArticle(a));
wr('articles/index.html', renderIndex());
updateHomepage();
buildFeed();
const n = buildSitemap();
buildLlms();
const linked = ensureSiteLinks();
console.log(`✔ 文章 ${articles.length} 篇、專欄首頁、首頁區塊、RSS、sitemap(${n} 個網址)、llms.txt 已產生;導覽/頁尾補連結 ${linked} 頁`);
