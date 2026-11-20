
const $ = id => document.getElementById(id);

let winners = [];
let photos = [];
let videos = [];

const yearScriptUrl = document.currentScript?.src ||
  new URL("../../js/year.js", document.baseURI).href;

const siteRootUrl = new URL("../", yearScriptUrl);

async function readData(relativePath) {
  const url = new URL(relativePath, siteRootUrl);
  const response = await fetch(url.href, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`${url.pathname}（HTTP ${response.status}）`);
  }

  return response.json();
}

async function init() {
  const results = await Promise.allSettled([
    readData("data/winners.json"),
    readData("data/photos.json"),
    readData("data/videos.json")
  ]);

  if (results[0].status === "fulfilled" &&
      Array.isArray(results[0].value)) {
    winners = results[0].value.filter(
      item => String(item.year) === "114"
    );
  } else {
    console.error("得獎資料載入失敗", results[0].reason);
  }

  if (results[1].status === "fulfilled" &&
      Array.isArray(results[1].value)) {
    photos = results[1].value.filter(
      item => String(item.year) === "114"
    );
  } else {
    console.error("照片資料載入失敗", results[1].reason);
  }

  if (results[2].status === "fulfilled" &&
      Array.isArray(results[2].value)) {
    videos = results[2].value.filter(
      item => String(item.year) === "114"
    );
  } else {
    console.error("影片資料載入失敗", results[2].reason);
  }

  fill();
  renderWinners();
  renderPhotos();
  renderVideos();
}

function opt(el, value) {
  if (!el || !value) return;

  const option = document.createElement("option");
  option.value = value;
  option.textContent = value;
  el.append(option);
}

function fill() {
  const categories = [
    "演說",
    "作文",
    "戲劇",
    "歌唱",
    "繪本"
  ];

  categories
    .filter(category => winners.some(item => item.category === category))
    .forEach(category => opt($("yearCategory"), category));

  [...new Set(winners.map(item => item.district).filter(Boolean))]
    .sort()
    .forEach(value => opt($("yearDistrict"), value));

  [...new Set(winners.map(item => item.level).filter(Boolean))]
    .sort()
    .forEach(value => opt($("yearLevel"), value));

  [...new Set(videos.map(item => item.category).filter(Boolean))]
    .sort()
    .forEach(value => opt($("yearVideoCategory"), value));
}

function filteredWinners() {
  const keyword =
    $("yearKeyword")?.value.trim().toLocaleLowerCase() || "";

  const category = $("yearCategory")?.value || "";
  const district = $("yearDistrict")?.value || "";
  const level = $("yearLevel")?.value || "";

  return winners.filter(item => {
    const searchable = [
      item.school,
      item.student,
      item.category,
      item.district,
      item.level,
      item.award,
      item.teachers
    ].filter(Boolean).join(" ").toLocaleLowerCase();

    return (
      (!keyword || searchable.includes(keyword)) &&
      (!category || item.category === category) &&
      (!district || item.district === district) &&
      (!level || item.level === level)
    );
  });
}

function renderWinners() {
  const container = $("yearWinnerAccordion");
  if (!container) return;

  const result = filteredWinners();

  const meta = $("yearMeta");
  if (meta) {
    meta.textContent =
      `114學年度：${result.length} 筆得獎紀錄`;
  }

  container.replaceChildren();

  if (!result.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = winners.length
      ? "查無符合條件資料，請調整搜尋條件。"
      : "得獎資料載入失敗，請稍後再試。";
    container.append(empty);
    return;
  }

  const categories = [
    "演說",
    "作文",
    "戲劇",
    "歌唱",
    "繪本"
  ];

  categories.forEach(category => {
    const items = result.filter(
      item => item.category === category
    );

    if (!items.length) return;

    const details = document.createElement("details");
    details.className = "winner-accordion-item";

    const summary = document.createElement("summary");
    summary.className = "winner-accordion-title";

    const title = document.createElement("span");
    title.textContent = category;

    const count = document.createElement("span");
    count.className = "winner-count";
    count.textContent = `${items.length} 筆`;

    summary.append(title, count);
    details.append(summary);

    const tableWrap = document.createElement("div");
    tableWrap.className = "table-wrap winner-table-wrap";

    const table = document.createElement("table");

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    [
      "分區",
      "獎項",
      "學校",
      "得獎學生",
      "指導老師"
    ].forEach(label => {
      const th = document.createElement("th");
      th.textContent = label;
      headerRow.append(th);
    });

    thead.append(headerRow);

    const tbody = document.createElement("tbody");

    items.forEach(item => {
      const tr = document.createElement("tr");

      [
        item.district || "未標示",
        item.award || item.level || "—",
        item.school,
        item.student,
        item.teachers
      ].forEach(value => {
        const td = document.createElement("td");
        td.textContent = value || "—";
        tr.append(td);
      });

      tbody.append(tr);
    });

    table.append(thead, tbody);
    tableWrap.append(table);
    details.append(tableWrap);
    container.append(details);
  });
}

function renderPhotos() {
  const grid = $("yearPhotoGrid");
  if (!grid) return;

  grid.replaceChildren();

  if (!photos.length) {
    const empty = document.createElement("div");
    empty.className = "media-placeholder";
    empty.textContent = "目前沒有活動照片";
    grid.append(empty);
    return;
  }

  photos.forEach(item => {
    const figure = document.createElement("figure");
    figure.className = "photo-card";

    const image = document.createElement("img");
    image.src = new URL(item.src, siteRootUrl).href;
    image.alt = item.alt || item.caption || "活動照片";
    image.loading = "lazy";

    image.addEventListener("error", () => {
      image.alt = "照片載入失敗";
      figure.classList.add("photo-error");
    });

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
      : parsed.searchParams.get("v") ||
        parsed.pathname.split("/").filter(Boolean).pop();

    return id
      ? `https://www.youtube-nocookie.com/embed/${id}`
      : "";
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
    const placeholder = document.createElement("div");
    placeholder.className = "video-placeholder";
    placeholder.textContent = "影片網址待確認";
    box.append(placeholder);
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

  const data = videos.filter(
    item => !category || item.category === category
  );

  const list = $("yearVideoList");
  if (!list) return;

  list.replaceChildren();

  if (!data.length) {
    if ($("yearVideoFeature")) {
      const placeholder = document.createElement("div");
      placeholder.className = "video-placeholder";
      placeholder.textContent = "114學年度影片整理中";
      $("yearVideoFeature").replaceChildren(placeholder);
    }

    const empty = document.createElement("div");
    empty.className = "video-list-empty";
    empty.textContent = "目前沒有符合條件的影片";
    list.append(empty);
    return;
  }

  showVideo(data[0]);

  data.forEach(item => {
    const button = document.createElement("button");
    button.className = "video-item";
    button.type = "button";

    const thumb = document.createElement("span");
    thumb.className = "video-thumb";
    thumb.textContent = "▶";

    const textBox = document.createElement("span");

    const title = document.createElement("b");
    title.textContent = item.title || "未命名影片";

    const subtitle = document.createElement("small");
    subtitle.textContent = item.category || "";

    textBox.append(title, subtitle);
    button.append(thumb, textBox);

    button.addEventListener("click", () => showVideo(item));

    list.append(button);
  });
}

if ($("yearKeyword")) {
  $("yearKeyword").addEventListener("input", renderWinners);
}

["yearCategory", "yearDistrict", "yearLevel"].forEach(id => {
  if ($(id)) {
    $(id).addEventListener("change", renderWinners);
  }
});

if ($("yearSearch")) {
  $("yearSearch").addEventListener("click", renderWinners);
}

if ($("yearVideoCategory")) {
  $("yearVideoCategory").addEventListener("change", renderVideos);
}

init();
