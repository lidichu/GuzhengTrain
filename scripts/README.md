# 自動更新考級比賽資料

每月排程更新 `Certificates/events.json`,用 Replicate 的 GPT-5.2 搜尋台灣與華人圈古箏/琵琶最新考級與比賽。

## 一次性設定

### 1. 加入 Replicate API Token 到 GitHub Secrets

1. 開瀏覽器到 repo:**Settings → Secrets and variables → Actions**
2. 點 **New repository secret**
3. Name 填 `REPLICATE_API_TOKEN`
4. Secret 貼上你的 token(從 https://replicate.com/account/api-tokens 拿)
5. 點 **Add secret**

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

第一次跑完看 logs 確認 GPT 回應格式正確,再正式跑(不勾 dry_run)。

## 排程

預設每月 1 日 09:00(台灣時間)自動執行。Cron 寫在 `.github/workflows/update-events.yml`。

## 本機測試

```bash
cd scripts
npm install

# 預設模式:呼叫 API、印 diff、寫檔
REPLICATE_API_TOKEN=r8_xxx node update-events.mjs

# Dry run:呼叫 API、印 diff,但不寫檔
REPLICATE_API_TOKEN=r8_xxx DRY_RUN=1 node update-events.mjs

# Verbose:額外印出完整 prompt 與 GPT 原始回應
REPLICATE_API_TOKEN=r8_xxx VERBOSE=1 node update-events.mjs
```

## 失敗保護

腳本內建以下護欄,異常會中止寫檔並退出非 0:

| 退出碼 | 原因 |
|---|---|
| 1 | Replicate API 呼叫失敗(token 失效、額度用完、網路中斷) |
| 2 | GPT 回傳不是合法 JSON 或欄位驗證失敗 |
| 3 | 變動規模異常(移除超過原資料 30%,疑似 hallucination) |

CI 失敗時會自動開 GitHub Issue 通知。

## 費用估算

| 項目 | 估計 |
|---|---|
| 單次執行 | ~$0.05–0.15 USD |
| 每月一次 | ~$0.10 USD/月 |
| 每年 | ~$1.20 USD |

第一次跑完的 commit message 會有實際 token 用量。

## 想改動什麼?

| 想改 | 改哪 |
|---|---|
| 排程頻率(改成每週/每兩週) | `.github/workflows/update-events.yml` 的 `cron:` |
| 搜尋範圍(納入更多樂器/地區) | `update-events.mjs` 的 `systemPrompt` |
| 欄位 schema | `update-events.mjs` 的 `REQUIRED_FIELDS`、`DATE_RE`、`VALID_TYPES` |
| 換用其他模型(如 Claude / Gemini) | `update-events.mjs` 的 `MODEL` 與 Replicate 替換為對應 SDK |
