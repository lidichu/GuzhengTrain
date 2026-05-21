/**
 * 學習指南統一行為腳本(全 12 頁共用)
 *
 * 功能:
 *  1. 自動產生「本文目錄」(TOC) - 從文章內 <h2> 自動建立
 *  2. TOC scroll spy - 滾動時 highlight 對應目錄項目
 *  3. 系列導航 active 自動標 - 根據當前 URL 標記在哪一篇
 *  4. 閱讀進度追蹤 - localStorage 記錄「已讀」,sidebar 顯示總進度
 *  5. 標記/取消標記已讀(進度卡的按鈕)
 *  6. 平滑捲動到 anchor
 */

(function () {
  "use strict";

  // 學習指南系列順序(與 series-nav 對應,單一來源)
  const SERIES = [
    { file: "index.html",                       title: "學習指南總覽",       category: "總覽" },
    { file: "01-introduction.html",             title: "認識古箏",            category: "基礎" },
    { file: "02-posture.html",                  title: "基本坐姿與手型",     category: "基礎" },
    { file: "03-basic-techniques.html",         title: "基礎指法練習",        category: "基礎" },
    { file: "04-beginner-techniques.html",      title: "初級彈奏技巧",        category: "技巧" },
    { file: "05-intermediate-techniques.html",  title: "中級彈奏技巧",        category: "技巧" },
    { file: "06-advanced-techniques.html",      title: "高級演奏技巧",        category: "技巧" },
    { file: "08-buying-guzheng.html",           title: "如何選購古箏",        category: "實用" },
    { file: "09-finding-teacher.html",          title: "尋找適合的老師",     category: "實用" },
    { file: "10-certification.html",            title: "考取古箏證照",        category: "實用" },
    { file: "11-maintenance.html",              title: "古箏保養與調音",     category: "實用" },
    { file: "12-recital-importance.html",       title: "為什麼要辦成果發表會", category: "實用" },
  ];

  const STORAGE_KEY = "guzhengtrain_learning_progress_v1";

  // 取得當前頁面檔名(處理 serve 把 .html 重導向去掉的情況)
  function currentFile() {
    const p = location.pathname;
    const m = p.match(/\/learning\/([^?#]*)$/);
    if (!m) return null;
    const raw = m[1];
    if (!raw || raw === "" || raw === "index" || raw === "index.html") return "index.html";
    // 若無副檔名,補上 .html
    if (!raw.endsWith(".html")) return raw + ".html";
    return raw;
  }

  // localStorage 助手
  function readDone() {
    try {
      return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
    } catch {
      return new Set();
    }
  }
  function writeDone(set) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
    } catch {}
  }

  // 渲染 series-nav(同時標 current 與 done)
  function renderSeriesNav() {
    const root = document.querySelector(".series-nav ol, .series-nav ul");
    if (!root) return;
    const cur = currentFile();
    const done = readDone();

    root.innerHTML = SERIES.map((item, i) => {
      const cls = [];
      if (item.file === cur) cls.push("active");
      if (done.has(item.file)) cls.push("done");
      const num = i === 0 ? "" : `<span class="num">${String(i).padStart(2, "0")}</span>`;
      return `<li class="${cls.join(" ")}">${num}<a href="${item.file}">${item.title}</a></li>`;
    }).join("");
  }

  // 自動產生本文目錄(從 .learning-content 內 h2)
  function renderTOC() {
    const tocList = document.querySelector(".article-toc ol, .article-toc ul");
    const content = document.querySelector(".learning-content");
    if (!tocList || !content) return;

    const headings = content.querySelectorAll("h2, h3");
    const items = [];
    let h2Counter = 0;
    headings.forEach((h) => {
      // 沒 id 的給一個
      if (!h.id) {
        h.id = "sec-" + (h.textContent || "").trim().replace(/\s+/g, "-").slice(0, 30);
      }
      const isH3 = h.tagName === "H3";
      const indent = isH3 ? ' style="padding-left:14px;font-size:0.88rem;"' : "";
      items.push(`<li${indent}><a href="#${h.id}">${h.textContent.trim()}</a></li>`);
      if (h.tagName === "H2") h2Counter++;
    });

    if (items.length === 0) {
      const wrapper = document.querySelector(".article-toc");
      if (wrapper) wrapper.style.display = "none";
      return;
    }
    tocList.innerHTML = items.join("");
  }

  // Scroll spy:滾動時 highlight 對應 TOC 項目
  function setupScrollSpy() {
    const links = document.querySelectorAll(".article-toc a[href^='#']");
    if (!links.length || !("IntersectionObserver" in window)) return;

    const linkMap = new Map();
    links.forEach((a) => {
      const id = a.getAttribute("href").slice(1);
      linkMap.set(id, a);
    });

    const headings = document.querySelectorAll(".learning-content h2, .learning-content h3");
    let activeId = null;

    const setActive = (id) => {
      if (activeId === id) return;
      activeId = id;
      links.forEach((a) => a.classList.remove("active"));
      const target = linkMap.get(id);
      if (target) target.classList.add("active");
    };

    const observer = new IntersectionObserver(
      (entries) => {
        // 找最靠近頂部、且仍在 viewport 上半部的 heading
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );
    headings.forEach((h) => h.id && observer.observe(h));
  }

  // 進度卡渲染 + 按鈕邏輯
  function renderProgressCard() {
    const card = document.querySelector(".progress-card");
    if (!card) return;
    const cur = currentFile();
    const done = readDone();

    const total = SERIES.length - 1; // 不算 index.html
    const completed = [...done].filter((f) => f !== "index.html").length;
    const percent = Math.round((completed / total) * 100);

    const isThisDone = done.has(cur);
    const isIndex = cur === "index.html";

    card.innerHTML = `
      <h3>📈 學習進度</h3>
      <div class="progress-stat">${completed} / ${total}<small>篇已讀</small></div>
      <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${percent}%"></div></div>
      <div class="progress-actions">
        ${
          isIndex
            ? `<button type="button" data-action="reset">重置進度</button>`
            : `<button type="button" data-action="toggle" class="done-btn ${isThisDone ? "active" : ""}">
                ${isThisDone ? "✓ 已標記已讀" : "標記為已讀"}
              </button>
              <button type="button" data-action="reset">重置全部</button>`
        }
      </div>
    `;

    card.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === "toggle") {
        const set = readDone();
        if (set.has(cur)) set.delete(cur);
        else set.add(cur);
        writeDone(set);
        renderProgressCard();
        renderSeriesNav();
      } else if (action === "reset") {
        if (!confirm("確定要清除所有閱讀進度?")) return;
        localStorage.removeItem(STORAGE_KEY);
        renderProgressCard();
        renderSeriesNav();
      }
    });
  }

  // 啟動
  document.addEventListener("DOMContentLoaded", () => {
    renderSeriesNav();
    renderTOC();
    setupScrollSpy();
    renderProgressCard();
  });
})();
