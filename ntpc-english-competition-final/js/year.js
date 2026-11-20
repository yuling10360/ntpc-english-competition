const $ = id => document.getElementById(id);
let winners = [], photos = [], videos = [];

// Resolve all JSON files from the actual URL of this script.
// This avoids broken relative paths on nested academic-year pages.
const yearScriptUrl = document.currentScript?.src || new URL("../../js/year.js", document.baseURI).href;
const siteRootUrl = new URL("../", yearScriptUrl);

async function readData(relativePath) {
  const url = new URL(relativePath, siteRootUrl);
  const response = await fetch(url.href, { cache: "no-store" });
  if (!response.ok) throw new Error(`${url.pathname}（HTTP ${response.status}）`);
  return response.json();
}

async function init() {
  try {
    const [winnerData, photoData, videoData] = await Promise.all([
      readData("data/winners.json"),
      readData("data/photos.json"),
      readData("data/videos.json")
    ]);

    if (!Array.isArray(winnerData)) throw new Error("winners.json 格式錯誤，資料必須是陣列。");
    winners = winnerData.filter(x => String(x.year) === "114");
    photos = Array.isArray(photoData) ? photoData.filter(x => String(x.year) === "114") : [];
    videos = Array.isArray(videoData) ? videoData.filter(x => String(x.year) === "114") : [];

    fill();
    renderWinners();
    renderPhotos();
    renderVideos();
  } catch (error) {
    console.error("114學年度成果資料載入失敗：", error);
    const body = $("yearWinnerBody");
    if (body) {
      body.replaceChildren();
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 9;
      td.className = "empty";
      td.textContent = `得獎名單載入失敗：${error.message}`;
      tr.append(td);
      body.append(tr);
    }
    if ($("yearMeta")) $("yearMeta").textContent = "得獎資料讀取失敗";
    if ($("yearPhotoGrid")) $("yearPhotoGrid").innerHTML = '<div class="media-placeholder"><span>01</span><b>114學年度活動照片</b><small>照片整理後上架</small></div>';
    if ($("yearVideoFeature")) $("yearVideoFeature").innerHTML = '<div class="video-placeholder"><span>▶</span><b>114學年度影片整理中</b></div>';
  }
}

function opt(el, value) {
  if (!el) return;
  const option = document.createElement("option");
  option.value = value;
  option.textContent = value;
  el.append(option);
}

function fill() {
  [...new Set(winners.map(x => x.category).filter(Boolean))].sort().forEach(x => opt($("yearCategory"), x));
  [...new Set(winners.map(x => x.district).filter(Boolean))].sort().forEach(x => opt($("yearDistrict"), x));
  [...new Set(winners.map(x => x.level).filter(Boolean))].sort().forEach(x => opt($("yearLevel"), x));
  [...new Set(videos.map(x => x.category).filter(Boolean))].sort().forEach(x => opt($("yearVideoCategory"), x));
}

function rows() {
  const keyword = $("yearKeyword")?.value.trim().toLocaleLowerCase() || "";
  const category = $("yearCategory")?.value || "";
  const district = $("yearDistrict")?.value || "";
  const level = $("yearLevel")?.value || "";
  return winners.filter(x => {
    const searchable = [x.school, x.student, x.category, x.groupType, x.group, x.district, x.level, x.workTitle, x.teachers]
      .filter(Boolean).join(" ").toLocaleLowerCase();
    return (!keyword || searchable.includes(keyword)) &&
      (!category || x.category === category) &&
      (!district || x.district === district) &&
      (!level || x.level === level);
  });
}

function renderWinners() {
  const body = $("yearWinnerBody");
  if (!body) return;
  const result = rows();
  if ($("yearMeta")) $("yearMeta").textContent = `114學年度：${result.length} 筆得獎紀錄`;
  body.replaceChildren();

  if (!result.length) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 9;
    td.className = "empty";
    td.textContent = winners.length ? "查無符合條件資料，請調整搜尋條件。" : "目前沒有114學年度得獎資料。";
    tr.append(td);
    body.append(tr);
    return;
  }

  result.forEach(item => {
    const tr = document.createElement("tr");
    [
      item.category, item.groupType, item.group, item.district || "未標示",
      item.level, item.school, item.workTitle, item.student, item.teachers
    ].forEach(value => {
      const td = document.createElement("td");
      td.textContent = value || "—";
      tr.append(td);
    });
    body.append(tr);
  });
}

function renderPhotos() {
  const grid = $("yearPhotoGrid");
  if (!grid) return;
  grid.replaceChildren();
  if (!photos.length) {
    grid.innerHTML = '<div class="media-placeholder"><span>01</span><b>114學年度活動照片</b><small>照片整理後上架</small></div>';
    return;
  }
  photos.forEach(item => {
    const figure = document.createElement("figure");
    figure.className = "photo-card";
    const image = document.createElement("img");
    image.src = new URL(item.src, siteRootUrl).href;
    image.alt = item.alt || item.caption || "活動照片";
    const caption = document.createElement("figcaption");
    caption.textContent = item.caption || "";
    figure.append(image, caption);
    grid.append(figure);
  });
}

function embed(url) {
  try {
    const parsed = new URL(url);
    const id = parsed.hostname.includes("youtu.be")
      ? parsed.pathname.slice(1)
      : parsed.searchParams.get("v") || parsed.pathname.split("/").filter(Boolean).pop();
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : "";
  } catch {
    return "";
  }
}

function showVideo(item) {
  const source = embed(item.url);
  const box = $("yearVideoFeature");
  if (!box) return;
  box.replaceChildren();
  if (!source) {
    box.innerHTML = '<div class="video-placeholder">影片網址待確認</div>';
    return;
  }
  const frame = document.createElement("iframe");
  frame.className = "video-frame";
  frame.src = source;
  frame.title = item.title || "競賽活動影片";
  frame.allowFullscreen = true;
  box.append(frame);
}

function renderVideos() {
  const category = $("yearVideoCategory")?.value || "";
  const data = videos.filter(item => !category || item.category === category);
  const list = $("yearVideoList");
  if (!list) return;
  list.replaceChildren();

  if (!data.length) {
    if ($("yearVideoFeature")) $("yearVideoFeature").innerHTML = '<div class="video-placeholder"><span>▶</span><b>114學年度影片整理中</b></div>';
    list.innerHTML = '<div class="video-list-empty">目前沒有符合條件的影片</div>';
    return;
  }

  showVideo(data[0]);
  data.forEach(item => {
    const button = document.createElement("button");
    button.className = "video-item";
    button.innerHTML = '<span class="video-thumb">▶</span><span><b></b><small></small></span>';
    button.querySelector("b").textContent = item.title || "未命名影片";
    button.querySelector("small").textContent = item.category || "";
    button.onclick = () => showVideo(item);
    list.append(button);
  });
}

if ($("yearKeyword")) $("yearKeyword").addEventListener("input", renderWinners);
["yearCategory", "yearDistrict", "yearLevel"].forEach(id => {
  if ($(id)) $(id).addEventListener("change", renderWinners);
});
if ($("yearSearch")) $("yearSearch").addEventListener("click", renderWinners);
if ($("yearVideoCategory")) $("yearVideoCategory").addEventListener("change", renderVideos);

init();
