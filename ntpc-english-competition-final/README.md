# 新北市英語文競賽成果專區

簡約雙語風格歷年成果網站。首波建置114學年度，支援未來新增年度、獨立年度頁面、跨年度搜尋、Excel下載、照片與依年度／競賽項目分類的影片。

## 專案結構
- `index.html`：首頁、跨年度得獎搜尋、照片及影片區
- `years/114/index.html`：114學年度獨立成果頁
- `archives/index.html`：歷年成果總覽
- `css/style.css`：共用版型及響應式樣式
- `js/main.js`：首頁搜尋、Excel匯出、照片／影片／年度資料
- `js/year.js`：114年度頁面功能
- `data/years.json`：已建置年度清單
- `data/winners.json`：跨年度得獎名單
- `data/photos.json`：照片資料
- `data/videos.json`：影片資料

## 得獎名單格式 `data/winners.json`
```json
[
  {
    "year": "114",
    "category": "英語演說",
    "level": "國中組",
    "school": "學校名稱",
    "student": "學生姓名",
    "award": "特優"
  }
]
```
首頁可跨年度篩選並下載 `.xlsx` Excel 檔；114年度獨立頁面可下載該年度篩選結果。Excel 匯出使用 SheetJS CDN，使用下載功能時需要網路連線。

## 照片格式 `data/photos.json`
```json
[
  {
    "year": "114",
    "src": "images/gallery/114/photo-01.jpg",
    "alt": "英語文競賽活動照片",
    "caption": "競賽活動紀錄"
  }
]
```

## 影片格式 `data/videos.json`
```json
[
  {
    "year": "114",
    "category": "英語演說",
    "title": "114學年度英語演說競賽",
    "url": "https://www.youtube.com/watch?v=VIDEO_ID"
  }
]
```
影片依學年度及競賽項目篩選，以 YouTube 嵌入播放。

## 新增年度
1. 在 `data/years.json` 加入年度，例如 `["114","115"]`。
2. 複製 `years/114/` 為 `years/115/`，更新頁面文字及 `js/year.js` 中的年度篩選條件（目前獨立頁為114版）。
3. 將新年度得獎、照片及影片資料加入對應 JSON。
4. 在 `archives/index.html` 加入新年度連結。首頁歷年卡片會依 `years.json` 自動產生。

## 本機測試
在專案根目錄執行 `python -m http.server 8000`，再開啟 `http://localhost:8000`。請勿直接以 file:// 開啟，因瀏覽器會限制 fetch JSON。

## 上線前
目前得獎名單、照片及影片資料皆為空白範本，尚未填入114學年度正式內容。請確認正式項目、名次、姓名、照片公開依據及影片授權後再發布。
