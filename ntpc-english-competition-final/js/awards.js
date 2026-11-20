const $ = id => document.getElementById(id);
let winners = [];
let loaded = false;

async function loadWinners() {
  const body = $("winnerBody");
  const scriptElement = document.currentScript;
  const scriptUrl = scriptElement && scriptElement.src
    ? scriptElement.src
    : new URL("../js/awards.js", document.baseURI).href;

  // Build the data URL from the actual location of js/awards.js.
  // This keeps the connection correct even if the award page is opened
  // from a nested route or the site is hosted below a project subdirectory.
  const dataUrl = new URL("../data/winners.json", scriptUrl).href;

  try {
    const response = await fetch(dataUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`讀取 ${dataUrl} 失敗（HTTP ${response.status}）`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("winners.json 格式錯誤：最外層必須是陣列。");
    }

    winners = data;
    loaded = true;
    populateFilters();
    renderRows(winners);
    $("resultMeta").textContent = `已載入 ${winners.length} 筆得獎資料`;
  } catch (error) {
    body.replaceChildren();
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 7;
    td.className = "empty";
    td.textContent = `資料載入失敗：${error.message}。請確認 data/winners.json 與 js/awards.js 位於同一網站根目錄下的正確資料夾，並透過 Vercel 網址開啟。`;
    tr.append(td);
    body.append(tr);
    $("resultMeta").textContent = "無法讀取得獎資料";
    console.error("讀取得獎資料失敗：", error);
  }
}
function addOptions(id, values, suffix = "") {
  const select = $(id);
  const unique = [...new Set(values.filter(v => v !== null && v !== undefined && String(v).trim() !== ""))];
  unique.sort((a, b) => String(a).localeCompare(String(b), "zh-Hant", { numeric: true }));
  unique.forEach(value => {
    const option = document.createElement("option");
    option.value = String(value);
    option.textContent = String(value) + suffix;
    select.append(option);
  });
}

function populateFilters() {
  addOptions("filterYear", winners.map(x => x.year), "學年度");
  addOptions("filterCategory", ["演說", "作文", "歌唱", "戲劇", "繪本"]);
  addOptions("filterDistrict", ["中1區", "中2區", "西區", "東區"]);
  addOptions("filterLevel", [...new Set(winners.map(x => x.level).filter(Boolean))]);
}

function getFilteredRows() {
  const keyword = $("keyword").value.trim().toLocaleLowerCase();
  const year = $("filterYear").value;
  const category = $("filterCategory").value;
  const district = $("filterDistrict").value;
  const level = $("filterLevel").value;

  return winners.filter(x => {
    const text = [x.year, x.category, x.district, x.level, x.school, x.student, x.teachers]
      .filter(Boolean).join(" ").toLocaleLowerCase();
    return (!keyword || text.includes(keyword)) &&
      (!year || String(x.year) === year) &&
      (!category || x.category === category) &&
      (!district || x.district === district) &&
      (!level || x.level === level);
  });
}

function renderRows(rows) {
  const body = $("winnerBody");
  body.replaceChildren();

  if (!rows.length) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 7;
    td.className = "empty";
    td.textContent = "查無符合條件的得獎資料，請調整查詢條件。";
    tr.append(td);
    body.append(tr);
    $("resultMeta").textContent = "查詢結果：0 筆";
    return;
  }

  rows.forEach(x => {
    const tr = document.createElement("tr");
    [
      `${x.year}學年度`,
      x.category || "—",
      x.district || "未標示",
      x.level || "—",
      x.school || "—",
      x.student || "—",
      x.teachers || "—"
    ].forEach(value => {
      const td = document.createElement("td");
      td.textContent = value;
      tr.append(td);
    });
    body.append(tr);
  });
  $("resultMeta").textContent = `查詢結果：${rows.length} 筆（資料庫共 ${winners.length} 筆）`;
}

function runSearch() {
  if (!loaded) {
    $("resultMeta").textContent = "得獎資料尚未載入，請稍後再試。";
    return;
  }
  renderRows(getFilteredRows());
}

$("searchButton").addEventListener("click", runSearch);
$("keyword").addEventListener("keydown", event => {
  if (event.key === "Enter") runSearch();
});
["filterYear", "filterCategory", "filterDistrict", "filterLevel"].forEach(id => {
  $(id).addEventListener("change", runSearch);
});

loadWinners();
