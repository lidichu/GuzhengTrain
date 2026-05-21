# 自動更新考級比賽資料

每月排程更新 `Certificates/events.json`,用 Google Gemini API 啟用 `googleSearch` 工具實際上網搜尋台灣與華人圈古箏/琵琶最新考級與比賽。

## 一次性設定

### 1. 加入 Gemini API Key 到 GitHub Secrets

1. 申請 API Key:https://aistudio.google.com/app/apikey
2. 開瀏覽器到 repo:**Settings → Secrets and variables → Actions**
3. 點 **New repository secret**
4. Name 填 **`GEMINI_API_KEY`**(一字不差)
5. Secret 貼上你的 Gemini API key
6. 點 **Add secret**

> 注意:如果你之前有設定過 `REPLICATE_API_TOKEN`,**可以刪除**(已不再使用)。
> 但留著也不會影響,workflow 只讀 `GEMINI_API_KEY`。

### 2. 確認 Actions 寫入權限

**Settings → Actions → General → Workflow permissions** 選擇:
- ✅ Read and write permissions
- ✅ Allow GitHub Actions to create and approve pull requests

### 3. 測試運行

在 repo 的 **Actions** 分頁:
1. 左側選「每月更新考級比賽資料」workflow
2. 右上點 **Run workflow**
3. 勾選 **dry_run: true**(僅預覽不 commit)
4. 點 Run workflow

第一次跑完看 logs:
- 看到「🔍 引用了 N 個網路來源」 → Gemini 有真正搜尋 ✓
- 看到「⚠️ 沒偵測到 googleSearch 引用」 → 失敗,需要 debug
- 看到「📊 變動摘要」 → 驗證通過

確認 dry-run OK 後,**不勾 dry_run** 再跑一次正式更新。

## 排程

預設每月 1 日 09:00(台灣時間)自動執行。Cron 寫在 `.github/workflows/update-events.yml`。

## 本機測試

```bash
cd scripts
npm install

# 預設模式:呼叫 API、印 diff、寫檔
GEMINI_API_KEY=AIzaXXX node update-events.mjs

# Dry run:呼叫 API、印 diff,但不寫檔
GEMINI_API_KEY=AIzaXXX DRY_RUN=1 node update-events.mjs

# Verbose:額外印出完整 prompt 與 Gemini 原始回應 + 引用來源
GEMINI_API_KEY=AIzaXXX VERBOSE=1 node update-events.mjs

# 想換模型(預設 gemini-2.5-pro,可改成 gemini-3-pro 等)
GEMINI_API_KEY=AIzaXXX GEMINI_MODEL=gemini-3-pro node update-events.mjs
```

## 工具腳本

### `cleanup-expired.mjs` — 隨時清過期(不耗 API)

```bash
node cleanup-expired.mjs            # 真的寫檔
DRY_RUN=1 node cleanup-expired.mjs  # 只預覽
```

## 失敗保護

腳本內建多層護欄,異常會中止寫檔並退出非 0:

| 退出碼 | 原因 |
|---|---|
| 1 | Gemini API 呼叫失敗(key 無效 / 額度用完 / 網路中斷) |
| 2 | 回傳不是合法 JSON / 必填欄位缺 / **連結是搜尋引擎 URL** / **note 含「未能網搜」等字樣** / **既有事件 regStart 被刪** |
| 3 | 移除筆數超過原資料 30%,疑似 hallucination |

CI 失敗時會自動開 GitHub Issue 通知。

## 反降質檢查(重要)

腳本會主動拒絕以下「Gemini 沒真實搜尋」的徵兆:

1. `link` 或 `officialSite` 是 google/bing/duckduckgo/yahoo 的 search URL → 拒絕
2. `note` 含「未能網搜」「未能核對」「無法核實」等模型藉口 → 拒絕
3. 既有事件原本有 `regStart` 但新版被刪 → 拒絕
4. groundingChunks 數量為 0 → 印警告(不拒絕,因為簡單問題可能不需搜尋)

## 費用估算

| 項目 | 估計 |
|---|---|
| Gemini 2.5 Pro 免費額度 | 5 RPM, 25 requests/day, 25,000 tokens/day |
| 每月一次的用量 | 約 5,000–15,000 tokens(含搜尋結果) |
| **每月實際成本** | **$0**(完全在免費額度內) |

若超過免費額度(極不可能,因為一個月才跑一次):
- Input: $1.25 / 1M tokens
- Output: $5 / 1M tokens
- 單次成本約 $0.05 USD

## 想改動什麼?

| 想改 | 改哪 |
|---|---|
| 排程頻率(改成每週/每兩週) | `.github/workflows/update-events.yml` 的 `cron:` |
| 搜尋範圍(納入更多樂器/地區) | `update-events.mjs` 的 `systemPrompt` |
| 換模型(2.5-pro / 3-pro / flash) | 環境變數 `GEMINI_MODEL` |
| 欄位 schema | `update-events.mjs` 的 `REQUIRED_FIELDS`、`DATE_RE`、`VALID_TYPES` |
