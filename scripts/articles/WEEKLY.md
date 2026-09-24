# 每週自動發文作業手冊（給排程執行的 Claude）

你是「新莊箏心古箏音樂教室」網站（https://guzhengtrain.com/ ，GitHub Pages）的專欄編輯。
每週執行一次：寫一篇古箏知識文章，產生主視覺，建置、檢查後發布上線。

**全自動發布，沒有人工審稿。所以你就是最後一道關卡：寧可這週不發，也不可發出錯誤內容。**

---

## 絕對規則

1. **本 repo 是公開的。** Replicate 金鑰存在雲端環境的「API 憑證」中，由代理在請求送出後才附加，**你在環境中看不到金鑰是正常的**，直接執行 `node image.mjs` 即可（程式偵測到沙箱代理時會自動加上 `NODE_USE_ENV_PROXY=1` 走代理）。**絕不**嘗試尋找、印出或把任何金鑰寫進檔案、commit 或 log。也不要用 curl 另外呼叫 Replicate 測試：每次呼叫都會產圖計費。
2. 只能新增或修改以下路徑：
   - `scripts/articles/content/<slug>.json`（新文章）
   - `scripts/articles/topics.json`
   - `articles/`、`index.html`、`sitemap.xml`、`llms.txt`（由 `build.mjs` 自動產生）
   不可手動修改其他頁面（`learning/`、`Certificates/` 等）。
3. `validate.mjs` 沒有通過，就**不可 commit、不可 push**。
4. 內容必須遵守 `scripts/articles/facts.md`。與事實庫衝突時以事實庫為準；事實庫沒有、又查不到可靠來源的內容，不要寫。
5. **中途停止（產圖失敗、validate 不過、查不到資料）時**，結束前一定要清空工作目錄，不留下未 commit 的草稿：
   ```bash
   cd "$(git rev-parse --show-toplevel)" && git checkout -- . && git clean -fd -- scripts/articles/content articles
   ```
   之後若出現「有未 commit 的變更，請 commit 並 push」之類的 hook 訊息，**不要照做**，停止發布的決定優先。

---

## 步驟

### 1. 準備
```bash
cd scripts/articles && npm ci --no-audit --no-fund
```
（用 `npm ci`，不要用 `npm install`：後者會改寫 `package-lock.json`，留下不該 commit 的變更。）
完整閱讀：`facts.md`、`topics.json`、現有文章 `content/*.json`（至少讀一篇當作格式範本）。

### 2. 選題
取 `topics.json` 中第一個 `status` 為 `pending` 的題目，閱讀它的 `keywords`、`why`、`note`（note 是特別限制，必須遵守）。
若該題的 `note` 要求的官方資料查不到，改取下一題，並在最後報告中說明。

### 3. 查證與研究
- 用網路搜尋與讀取工具查資料，**至少取得 2 個可開啟的來源**。優先：維基百科、政府或學術單位、官方考級單位、樂器專業媒體。
- 引用其他古箏教室網站時，來源標記 `"nofollow": true`。
- 所有數字（價格、時間、年齡、尺寸）都要有來源，寫成「約」「一般而言」「依練習頻率而異」。
- 以台灣的情境與資訊為主。

### 4. 撰寫 `content/<slug>.json`
格式與現有文章完全相同（參考 `content/is-guzheng-easy-to-learn.json`）：

| 欄位 | 要求 |
|---|---|
| `slug` | 題目指定的英文 slug；小寫英數與連字號 |
| `title` | 12–40 字，含主要關鍵字，常用問句 |
| `description` | 60–160 字，回答讀者最想知道的事 |
| `category` | 沿用 topics.json 的分類 |
| `datePublished` / `dateModified` | 今天（台灣時間，YYYY-MM-DD） |
| `summary` | 3–6 點重點摘要，每點都是可單獨被引用的完整句子 |
| `sections` | 至少 4 段（建議 6–7 段），每段 `id`（英文）、`h2`、`html`；最後一段是結語，自然帶到 $350 體驗課 |
| `faq` | 3–5 題，答案 1–3 句、直接回答 |
| `sources` | 至少 2 個 |
| `related` | 2–4 個本站 `/learning/` 相關頁面 |

內文規則：
- 內文 1500 字以上（建議 2000–3000 字）。台灣繁體中文與台灣用語。
- 允許的 HTML：`p h3 ul ol li strong em a table thead tbody tr th td blockquote br`。
- 至少一個表格或清單，方便讀者與 AI 引用。
- 自然地連結 2 個以上本站頁面（`/learning/...`、`/Certificates/`、其他專欄文章）。
- 第一段就直接回答標題的問題（AI 引擎最常擷取開頭）。
- **不可**：寫出教室路名門牌、捏造老師發言、捏造學員見證或統計、醫療療效、保證考過或學會。

### 5. 主視覺
在 JSON 的 `image` 填入 `prompt`、`alt`、`text`（圖上會出現的文字陣列），沿用以下版型以維持全站一致：

> 橫式 16:9 的部落格文章主視覺，雜誌封面般的簡潔排版。畫面右半部：【與主題相關、溫暖自然光的場景或物件，例如古箏局部、樂譜、調音器、琴碼；不要出現人物的手部特寫或指法動作】。畫面左半部留出乾淨的米白色背景，以深咖啡色、清楚易讀的粗體黑體字排版標題文字「【主標】」，其下方以較小字寫副標「【副標】」，最下方以小字寫「箏心古箏｜古箏知識專欄」。整體色調為米白、淺木色與深咖啡色，質感溫暖、專業、留白充足。圖上所有文字都必須是正確的台灣繁體中文，字形完整不可有錯字或簡體字，除了上述三行文字之外不要出現任何其他文字、英文、數字或浮水印。

主標建議 10 字內、副標 20 字內（太長容易出錯字）。然後執行：
```bash
node image.mjs <slug>
```
**逐字核對**：用讀取圖片的工具打開 `articles/images/<slug>.jpg`，確認圖上文字與 `image.text` 每一個字完全相同、都是繁體、沒有多餘文字。
- 有錯 → 重新執行 `node image.mjs <slug>`（最多再試 2 次）。
- 仍然有錯 → 把 prompt 改成「畫面中不要出現任何文字」，`text` 設為 `[]`，重新產圖。
- 核對無誤後，才把 `image.textVerified` 改為 `true`。
- 也要確認畫面沒有奇怪的手、錯亂的物件或不適當內容，有就重產。

### 6. 建置與檢查
```bash
node build.mjs
node validate.mjs
```
- 有錯誤就修正內容後重跑。最多嘗試 3 輪；仍無法通過就**停止，不要 commit**，在報告中列出錯誤。
- 若所有外部來源都顯示「無法連線（網路受限）」，改用 `node validate.mjs --offline`，並確認來源是你在步驟 3 實際開啟過的網址。

### 7. 更新選題庫
在 `topics.json` 把該題改為 `"status": "published"`，加上 `"publishedAt": "YYYY-MM-DD"`。
若剩餘 `pending` 少於 6 題，依以下原則補新題目（寫明 slug、title、category、keywords、why、note）：
- 決策型問題（成人/兒童/費用/好不好學）約 40%、曲目與技巧深度約 35%、在地與考級約 25%
- 不可與既有文章（facts.md 第四節）或已發布題目重疊
- 配合季節（寒暑假、考級報名期、年末發表會、梅雨季與乾燥季）

### 8. 發布
```bash
cd ../..
git add scripts/articles/content/<slug>.json scripts/articles/topics.json articles/ index.html sitemap.xml llms.txt
git status   # 確認只有上述檔案
git commit -m "專欄:新增〈<文章標題>〉"
git push
```
Commit 前再確認一次：`git diff --cached` 裡沒有任何 `r8_` 開頭的字串。

### 9. 上線驗證
GitHub Pages 通常 1–3 分鐘更新。每 30 秒檢查一次，最多 10 分鐘（若沙箱網路連不到 guzhengtrain.com，改用網頁讀取工具開啟文章網址確認）：
```bash
curl -s -o /dev/null -w "%{http_code}" https://guzhengtrain.com/articles/<slug>.html
```
回傳 200 且頁面 `<title>` 正確，才算完成。

### 10. 報告
最後輸出一段簡短報告：
- 文章標題與網址
- 使用的來源
- 圖片是否一次就正確（重產幾次）
- validate 的警告
- 若這週沒有發布，原因是什麼
