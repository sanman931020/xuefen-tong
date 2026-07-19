# 學分通（Credit Pass）

畢業學分計算、學期規劃、成績平均 Web App。支援大學部、碩班、教育學程（小教／特教／幼教），帳號註冊登入並持久保存資料，可選 Google 登入。

## 快速開始

```bash
cd web
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

開啟 http://localhost:3000

## 環境變數

複製 `.env.example` 為 `.env`：

| 變數 | 說明 |
|------|------|
| `DATABASE_URL` | SQLite 路徑，預設 `file:./dev.db` |
| `AUTH_SECRET` | NextAuth 密鑰 |
| `AUTH_URL` | 網站網址，本機為 `http://localhost:3000` |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | 選填，啟用 Google 登入 |

### Google 登入設定

1. 前往 [Google Cloud Console](https://console.cloud.google.com/) 建立 OAuth 用戶端
2. 授權重新導向 URI：`http://localhost:3000/api/auth/callback/google`
3. 將 Client ID／Secret 填入 `.env` 後重啟

## 功能

- 註冊／登入（資料綁定帳號）
- 學制設定：大學部、碩班、小教／特教／幼教
- 總覽進度、學分明細（必修／甲乙類等）
- 畢業條件與擋修檢查
- 學期規劃（計畫課 → 已修）
- 成績單 PDF／示範資料匯入、總平均與分類平均
- 手動修課紀錄

## 注意

內建規則為 **113 學年度示範資料**，請以學校正式手冊／教務系統為準。可在 `prisma/seed.ts` 依貴校手冊調整科目與門檻後重新 `npm run db:seed`。
