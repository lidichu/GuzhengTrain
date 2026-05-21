#!/usr/bin/env node
/**
 * 學習指南頁面批次轉換工具(一次性,用完即丟)
 *
 * 從每個 learning/*.html 萃取「內文」並套入統一模板
 *
 * 用法:
 *   node _convert.mjs                改寫所有目標檔
 *   node _convert.mjs --dry-run      只印出每個檔的萃取結果,不寫檔
 *   node _convert.mjs 02-posture.html  只處理單一檔
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 系列順序 + 每頁副標 + lead 引言
const PAGES = [
  { file: "01-introduction.html",            subtitle: "了解古箏的歷史、構造與文化背景，為學習打下堅實基礎", lead: "古箏作為中國最古老的彈撥樂器之一,擁有 2500 多年的悠久歷史。" },
  { file: "02-posture.html",                 subtitle: "正確的坐姿與手型是古箏演奏的基礎,直接影響演奏品質與長期練習舒適度", lead: "好的姿勢能讓你練得久、彈得自然。本篇帶你建立正確的坐姿、手型與基本指法位置。" },
  { file: "03-basic-techniques.html",        subtitle: "從托、勾、抹、挑開始,系統性掌握古箏的核心指法", lead: "古箏的五大基本指法是所有曲目的根基。本篇詳解每個指法的動作、發力與練習要點。" },
  { file: "04-beginner-techniques.html",     subtitle: "在基本指法之上,學習滾音、輪指等初級進階技巧", lead: "掌握基本指法後,下一步是讓樂句更流暢、表情更豐富。本篇介紹初級階段必學的演奏技巧。" },
  { file: "05-intermediate-techniques.html", subtitle: "進階演奏技術：顫音、搖指、按音、滑音等中級技巧", lead: "中級技巧是古箏「韻」的關鍵 —— 顫音、搖指、按音讓你的演奏有了靈魂。" },
  { file: "06-advanced-techniques.html",     subtitle: "花指、大撮、組合技法,進入古箏演奏的高階境界", lead: "高級技巧把古箏的表現力推到極限。本篇解析職業演奏家常用的進階技法。" },
  { file: "08-buying-guzheng.html",          subtitle: "從預算、品牌、材質到挑選技巧,完整的古箏選購指南", lead: "古箏是長期陪伴的樂器,初次選購要避開哪些坑、預算怎麼分配?本篇給你完整指引。" },
  { file: "09-finding-teacher.html",         subtitle: "好的老師決定你能走多遠,本篇教你怎麼找到適合自己的古箏老師", lead: "古箏自學容易養成壞習慣,找到適合的老師是學習路上最關鍵的一步。" },
  { file: "10-certification.html",           subtitle: "黃鐘獎、國樂學會、文化大學三大考級系統完整解析", lead: "考級是檢驗學習成果的重要里程碑,本篇解析三大主流考級系統的差異與應考策略。" },
  { file: "11-maintenance.html",             subtitle: "古箏的日常保養、調音與環境管理完整指南", lead: "古箏是會「呼吸」的木質樂器,溫濕度、保養方式都會直接影響音色與壽命。" },
  { file: "12-recital-importance.html",      subtitle: "成果發表會不只是表演,更是學習進程中的重要里程碑", lead: "為什麼一定要參加成果發表會?舞台不只是表演,更是讓孩子建立自信與成就感的關鍵。" },
];

const DRY = process.argv.includes("--dry-run");
const SINGLE_FILE = process.argv.find(a => a.endsWith(".html"));

function extractTitle(html) {
  const m = html.match(/<title>([^<]+)<\/title>/);
  return m ? m[1].trim() : "";
}

function extractMeta(html, name) {
  const re = new RegExp(`<meta\\s+(?:name|property)="${name}"\\s+content="([^"]*)"`, "i");
  const m = html.match(re);
  return m ? m[1] : null;
}

function extractH1AndSubtitle(html) {
  // 從 page-title section 抓 h1 與 p
  const sec = html.match(/<section\s+class="page-title"[\s\S]*?<\/section>/);
  if (!sec) return { h1: "", subtitle: "" };
  const h1 = sec[0].match(/<h1[^>]*>([^<]+)<\/h1>/);
  const p = sec[0].match(/<h1[^>]*>[^<]+<\/h1>\s*<p[^>]*>([\s\S]*?)<\/p>/);
  return {
    h1: h1 ? h1[1].trim() : "",
    subtitle: p ? p[1].trim().replace(/\s+/g, " ") : "",
  };
}

function extractContent(html) {
  // 找 page-title section end → footer start 之間的所有內容
  const ptEnd = html.search(/<\/section>\s*\n?\s*<!--\s*內容/);
  let startIdx;
  if (ptEnd >= 0) {
    startIdx = html.indexOf("</section>", ptEnd) + "</section>".length;
  } else {
    // fallback:找第一個 </section> 在 page-title 後面
    startIdx = html.indexOf("</section>") + "</section>".length;
  }

  const footerIdx = html.indexOf("<footer");
  if (footerIdx < 0) throw new Error("找不到 footer");

  let between = html.substring(startIdx, footerIdx);

  // 嘗試各種已知 wrapper,改用 greedy 抓最外層
  const wrappers = [
    /<div\s+class="content-main"[^>]*>([\s\S]*)<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/section>/,
    /<div\s+class="main-content[^"]*"[^>]*>([\s\S]*)<\/div>\s*<\/div>\s*<\/div>\s*<\/section>/,
    /<div\s+class="col-lg-9"[^>]*>([\s\S]*)<\/div>\s*<\/div>\s*<\/div>\s*<\/section>/,
    /<div\s+class="col-lg-8"[^>]*>([\s\S]*?)<\/div>\s*<!--\s*側邊欄/,
  ];

  for (const re of wrappers) {
    const m = between.match(re);
    if (m && m[1].length > 500) {
      between = m[1];
      break;
    }
  }

  // 清理:
  // 1. 拿掉 next-lesson-nav 與 article-navigation(我們用新的 pager)
  between = between.replace(/<div\s+class="next-lesson-nav[^"]*"[\s\S]*?<\/div>\s*$/gi, "");
  between = between.replace(/<div\s+class="article-navigation[^"]*"[\s\S]*?<\/div>/gi, "");
  // 2. 拿掉 conclusion wrapper(但保留內容)
  between = between.replace(/<div\s+class="conclusion"[^>]*>([\s\S]*?)<\/div>/gi, "$1");
  // 3. 拿掉舊的 article-toc/article-cta wrapper(若有 — 11/12 內文裡有)
  between = between.replace(/<div\s+class="article-toc"[\s\S]*?<\/div>\s*<\/div>/gi, "");
  // 4. 把 .content-image 改成 <figure class="image-container">
  between = between.replace(/<div\s+class="content-image"[^>]*>\s*<picture>([\s\S]*?)<\/picture>\s*<figcaption>([^<]*)<\/figcaption>\s*<\/div>/gi,
    '<figure class="image-container">$1<figcaption>$2</figcaption></figure>');
  between = between.replace(/<div\s+class="content-image"[^>]*>([\s\S]*?)<\/div>/gi,
    '<figure class="image-container">$1</figure>');
  // 5. picture 簡化(不需要 source srcset 後備,picture 內只剩 img)
  between = between.replace(/<picture>\s*<source[^>]*>\s*<source[^>]*>\s*(<img[^>]*>)\s*<\/picture>/gi, "$1");
  between = between.replace(/<picture>\s*(<img[^>]*>)\s*<\/picture>/gi, "$1");
  // 6. img 加 loading="lazy" (除非已有)
  between = between.replace(/<img(?![^>]*\bloading=)([^>]*)>/gi, '<img$1 loading="lazy">');

  return between.trim();
}

function getPrevNext(currentFile) {
  // SERIES 包含 index.html,但我們 PAGES 不含,要組合
  const ALL = [{ file: "index.html", title: "學習指南總覽" }, ...PAGES.map(p => ({ file: p.file, title: null }))];
  const idx = ALL.findIndex(p => p.file === currentFile);
  if (idx < 0) return { prev: null, next: null };
  const prev = idx > 0 ? ALL[idx - 1] : null;
  const next = idx < ALL.length - 1 ? ALL[idx + 1] : null;
  return { prev, next };
}

function buildNewHtml(page, src) {
  const fullTitle = extractTitle(src) || `${page.subtitle} | 新莊箏心古箏音樂教室`;
  const ogDesc = extractMeta(src, "og:description") || extractMeta(src, "description") || page.subtitle;
  const ogImage = extractMeta(src, "og:image") || "https://guzhengtrain.com/img/og-cover.jpg";
  const keywords = extractMeta(src, "keywords") || "古箏教學,古箏學習,新莊古箏";
  const { h1 } = extractH1AndSubtitle(src);
  const content = extractContent(src);

  const { prev, next } = getPrevNext(page.file);

  // 上一篇的標題:若 prev 是 index.html 就用「學習指南總覽」,否則查 PAGES
  let prevTitle = "學習指南總覽";
  if (prev && prev.file !== "index.html") {
    const p = PAGES.find(x => x.file === prev.file);
    prevTitle = p ? page.file : prev.file;
  }
  // 從 prev/next 取得標題(用 SERIES 邏輯)
  const SERIES_TITLES = {
    "index.html": "學習指南總覽",
    "01-introduction.html": "認識古箏",
    "02-posture.html": "基本坐姿與手型",
    "03-basic-techniques.html": "基礎指法練習",
    "04-beginner-techniques.html": "初級彈奏技巧",
    "05-intermediate-techniques.html": "中級彈奏技巧",
    "06-advanced-techniques.html": "高級演奏技巧",
    "08-buying-guzheng.html": "如何選購古箏",
    "09-finding-teacher.html": "尋找適合的老師",
    "10-certification.html": "考取古箏證照",
    "11-maintenance.html": "古箏保養與調音",
    "12-recital-importance.html": "為什麼要辦成果發表會",
  };
  prevTitle = prev ? SERIES_TITLES[prev.file] : "";
  const nextTitle = next ? SERIES_TITLES[next.file] : "";

  const pagerHtml = `          <nav class="article-pager" aria-label="文章翻頁">
            ${prev ? `<a href="${prev.file}" class="pager-prev">
              <span class="pager-label"><i class="fas fa-arrow-left"></i> 上一篇</span>
              <span class="pager-title">${prevTitle}</span>
            </a>` : `<span class="pager-empty"></span>`}
            ${next ? `<a href="${next.file}" class="pager-next">
              <span class="pager-label">下一篇 <i class="fas fa-arrow-right"></i></span>
              <span class="pager-title">${nextTitle}</span>
            </a>` : `<span class="pager-empty"></span>`}
          </nav>`;

  return `<!DOCTYPE html>
<html lang="zh-Hant-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>${fullTitle}</title>
  <meta name="description" content="${ogDesc}">
  <meta name="keywords" content="${keywords}">

  <meta property="og:title" content="${fullTitle}">
  <meta property="og:description" content="${ogDesc}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:url" content="https://guzhengtrain.com/learning/${page.file}">
  <meta property="og:type" content="article">

  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  <link rel="stylesheet" href="../styles.css">
  <link rel="stylesheet" href="style.css">

  <link rel="icon" type="image/png" href="../favicon.png">
  <link rel="apple-touch-icon" href="../apple-touch-icon.png">

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" defer></script>
  <script src="../main.js" defer></script>
  <script src="script.js" defer></script>

  <script async src="https://www.googletagmanager.com/gtag/js?id=G-VYZSYN15C2"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-VYZSYN15C2');
  </script>
</head>
<body>
  <!-- 導航欄 -->
  <nav class="navbar navbar-expand-lg">
    <div class="container nav-container">
      <div class="logo-container">
        <a href="/" class="navbar-brand"><span class="brand-text">新莊箏心古箏音樂教室</span></a>
      </div>

      <button class="navbar-toggler menu-icon" type="button" aria-controls="primaryNav" aria-expanded="false" aria-label="開啟選單">
        <i class="fas fa-bars"></i>
      </button>

      <div class="collapse navbar-collapse desktop-menu-container" id="primaryNav">
        <ul class="navbar-nav nav-menu ms-auto desktop-menu">
          <li class="nav-item"><a class="nav-link" href="/#about">關於我們</a></li>
          <li class="nav-item"><a class="nav-link" href="/#courses">課程資訊</a></li>
          <li class="nav-item"><a class="nav-link" href="/Certificates/">考級比賽</a></li>
          <li class="nav-item"><a class="nav-link" href="/#gallery">學生成果</a></li>
          <li class="nav-item"><a class="nav-link" href="/#contact">聯絡我們</a></li>

          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="/learning/" role="button" aria-haspopup="true" aria-expanded="false">
              學習指南
            </a>
            <div class="dropdown-menu dropdown-menu-grid">
              <div class="dropdown-grid">
                <div class="dropdown-column">
                  <h6 class="dropdown-header">學習指南</h6>
                  <a class="dropdown-item" href="/learning/">學習總覽</a>
                  <h6 class="dropdown-header">基礎學習</h6>
                  <a class="dropdown-item" href="/learning/01-introduction.html">認識古箏</a>
                  <a class="dropdown-item" href="/learning/02-posture.html">基本坐姿與手型</a>
                  <a class="dropdown-item" href="/learning/03-basic-techniques.html">基礎指法練習</a>
                  <h6 class="dropdown-header">技巧提升</h6>
                  <a class="dropdown-item" href="/learning/04-beginner-techniques.html">初級彈奏技巧</a>
                  <a class="dropdown-item" href="/learning/05-intermediate-techniques.html">中級彈奏技巧</a>
                  <a class="dropdown-item" href="/learning/06-advanced-techniques.html">高級演奏技巧</a>
                </div>
                <div class="dropdown-column">
                  <h6 class="dropdown-header">實用指南</h6>
                  <a class="dropdown-item" href="/learning/08-buying-guzheng.html">如何選購古箏</a>
                  <a class="dropdown-item" href="/learning/09-finding-teacher.html">尋找適合的老師</a>
                  <a class="dropdown-item" href="/learning/10-certification.html">考取古箏證照</a>
                  <a class="dropdown-item" href="/learning/11-maintenance.html">古箏保養與調音</a>
                  <a class="dropdown-item" href="/learning/12-recital-importance.html">為什麼我們要辦成果發表會</a>
                </div>
              </div>
            </div>
          </li>

          <li class="nav-item"><a class="nav-link" href="/quiz/">古箏測驗</a></li>
          <li class="nav-item nav-cta-item"><a class="nav-link nav-cta" href="/#register">立即報名體驗</a></li>
        </ul>
      </div>
    </div>
  </nav>

  <!-- 頁面標題 + 麵包屑 -->
  <section class="page-title">
    <div class="container">
      <nav aria-label="麵包屑" class="learning-breadcrumb">
        <a href="/">首頁</a><span class="sep">›</span>
        <a href="/learning/">學習指南</a><span class="sep">›</span>
        <span class="current">${SERIES_TITLES[page.file] || h1}</span>
      </nav>
      <h1>${h1 || SERIES_TITLES[page.file]}</h1>
      <p>${page.subtitle}</p>
    </div>
  </section>

  <!-- 主要內容 -->
  <main class="learning-article">
    <div class="container">
      <div class="row gx-4">
        <aside class="col-lg-3 learning-sidebar">
          <div class="sidebar-sticky">
            <div class="progress-card"></div>
            <nav class="article-toc">
              <h3><i class="fas fa-list"></i> 本文目錄</h3>
              <ol></ol>
            </nav>
            <nav class="series-nav">
              <h3><i class="fas fa-book-open"></i> 學習指南系列</h3>
              <ol></ol>
            </nav>
          </div>
        </aside>

        <article class="col-lg-9 learning-content">

          <p class="article-lead">${page.lead}</p>

${content}

${pagerHtml}

          <aside class="article-cta">
            <h3>讀完想實際試試嗎?</h3>
            <p>古箏的優雅,真的要親手撥動才感受得到。預約一堂 $350 體驗課,由專業老師帶你走進古箏的世界。</p>
            <div class="cta-row">
              <a href="/#register" class="cta-btn cta-btn-primary">
                <i class="fas fa-edit"></i> 預約 $350 體驗課
              </a>
              <a href="https://line.me/ti/p/~@swn8120u" target="_blank" rel="noopener" class="cta-btn cta-btn-secondary">
                <i class="fab fa-line"></i> LINE 即時諮詢
              </a>
            </div>
          </aside>

        </article>
      </div>
    </div>
  </main>

  <!-- 頁尾 -->
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col footer-brand">
          <h3 class="footer-title">新莊箏心古箏音樂教室</h3>
          <p class="footer-slogan">傳承古箏藝術，培養音樂素養</p>
          <p class="footer-intro">15 年教學經驗・專業師資團隊・因材施教,讓學古箏變成一種快樂。</p>
        </div>

        <div class="footer-col footer-contact">
          <h4 class="footer-heading">聯絡資訊</h4>
          <address>
            <p><i class="fas fa-map-marker-alt" aria-hidden="true"></i><span>新北市新莊區<br>鄰近新莊體育場與新泰國中</span></p>
            <p><i class="fas fa-edit" aria-hidden="true"></i><span>採預約制,請<a href="https://docs.google.com/forms/d/e/1FAIpQLScCXuof2G7AZ5258bL7v1T0-A2l0_ziNdBSSIgzxMO6FNgppg/viewform" target="_blank" rel="noopener">線上填寫預約表單</a>,將有專人接洽</span></p>
            <p><i class="far fa-clock" aria-hidden="true"></i><span>週一至週日 09:00&ndash;22:00</span></p>
            <p><i class="fab fa-line" aria-hidden="true"></i><span>官方 LINE：<a href="https://line.me/ti/p/~@swn8120u" target="_blank" rel="noopener">@swn8120u</a></span></p>
          </address>
        </div>

        <div class="footer-col footer-nav">
          <h4 class="footer-heading">快速連結</h4>
          <ul class="footer-links">
            <li><a href="/#about">關於我們</a></li>
            <li><a href="/#courses">課程資訊</a></li>
            <li><a href="/Certificates/">考級比賽</a></li>
            <li><a href="/learning/">學習指南</a></li>
            <li><a href="/quiz/">古箏測驗</a></li>
            <li><a href="/#register">立即報名</a></li>
          </ul>
          <div class="footer-social">
            <a href="https://www.facebook.com/GuzhengTrain" target="_blank" rel="noopener" aria-label="Facebook" class="social-fb"><i class="fab fa-facebook-f" aria-hidden="true"></i></a>
            <a href="https://www.youtube.com/channel/UCm9pTiUNA2V9ffwA2l5IUBg" target="_blank" rel="noopener" aria-label="YouTube" class="social-yt"><i class="fab fa-youtube" aria-hidden="true"></i></a>
            <a href="https://line.me/ti/p/~@swn8120u" target="_blank" rel="noopener" aria-label="LINE" class="social-line"><i class="fab fa-line" aria-hidden="true"></i></a>
          </div>
        </div>
      </div>

      <div class="footer-highlight">
        <i class="fas fa-star" aria-hidden="true"></i>
        為保持上課品質,上課一律採取預約制
        <i class="fas fa-star" aria-hidden="true"></i>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2026 新莊箏心古箏音樂教室 版權所有</p>
        <ul class="footer-meta">
          <li><a href="/privacy.html">隱私權政策</a></li>
          <li><a href="#top" aria-label="回到頁面頂端">&uarr; 回到頂端</a></li>
        </ul>
      </div>
    </div>
  </footer>
</body>
</html>
`;
}

// 主程式
const targets = SINGLE_FILE ? PAGES.filter(p => p.file === SINGLE_FILE) : PAGES.filter(p => p.file !== "01-introduction.html");

if (targets.length === 0) {
  console.log("沒有目標檔");
  process.exit(0);
}

console.log(`目標 ${targets.length} 個檔${DRY ? "(DRY RUN)" : ""}:`);
for (const page of targets) {
  const srcPath = path.resolve(__dirname, page.file);
  let src;
  try {
    src = await fs.readFile(srcPath, "utf8");
  } catch (e) {
    console.log(`  ✗ ${page.file}:讀取失敗 — ${e.message}`);
    continue;
  }

  let newHtml;
  try {
    newHtml = buildNewHtml(page, src);
  } catch (e) {
    console.log(`  ✗ ${page.file}:轉換失敗 — ${e.message}`);
    continue;
  }

  // sanity:新內容不能太短(防止萃取失敗)
  const contentLen = newHtml.length;
  if (contentLen < src.length * 0.4) {
    console.log(`  ⚠️ ${page.file}:新內容過短(${contentLen} vs 原 ${src.length}),跳過`);
    continue;
  }

  if (DRY) {
    console.log(`  ${page.file}:${src.length} → ${contentLen} chars (預覽)`);
  } else {
    await fs.writeFile(srcPath, newHtml, "utf8");
    console.log(`  ✓ ${page.file}:${src.length} → ${contentLen} chars`);
  }
}
console.log("\n完成。");
