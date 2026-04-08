const STORAGE_KEY = "accountabilityTracker.v1";
const INFO_COLLAPSED_KEY = "accountabilityTracker.infoCollapsed";
const MONTH_COUNT = 6;

const todayDate = new Date();
const todayKey = formatDateKey(todayDate);

const todayDateEl = document.getElementById("todayDate");
const activitiesInput = document.getElementById("activitiesInput");
const statusInputs = document.querySelectorAll('input[name="status"]');
const saveBtn = document.getElementById("saveBtn");
const saveMessage = document.getElementById("saveMessage");
const monthsGrid = document.getElementById("monthsGrid");
const aboutPanel = document.getElementById("aboutPanel");
const infoToggle = document.getElementById("infoToggle");

let data = loadData();

init();

function init() {
  todayDateEl.textContent = todayDate.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isCollapsed = localStorage.getItem(INFO_COLLAPSED_KEY) === "1";
  setAboutPanelCollapsed(isCollapsed);

  populateTodayForm();
  renderMonths();

  saveBtn.addEventListener("click", onSave);
  infoToggle.addEventListener("click", onToggleInfo);
}

function onToggleInfo() {
  const collapsed = !aboutPanel.classList.contains("is-collapsed");
  setAboutPanelCollapsed(collapsed);
  localStorage.setItem(INFO_COLLAPSED_KEY, collapsed ? "1" : "0");
}

function setAboutPanelCollapsed(collapsed) {
  aboutPanel.classList.toggle("is-collapsed", collapsed);
  infoToggle.setAttribute("aria-expanded", String(!collapsed));
}

function populateTodayForm() {
  const entry = data[todayKey] || { activities: "", status: "neutral" };
  activitiesInput.value = entry.activities || "";
  setSelectedStatus(entry.status || "neutral");
}

function onSave() {
  const status = getSelectedStatus();
  const activities = activitiesInput.value.trim();

  data[todayKey] = { status, activities, updatedAt: new Date().toISOString() };
  persistData();
  renderMonths();

  saveMessage.textContent = `Saved at ${new Date().toLocaleTimeString()}`;
}

function renderMonths() {
  monthsGrid.innerHTML = "";

  for (let offset = MONTH_COUNT - 1; offset >= 0; offset -= 1) {
    const monthDate = new Date(todayDate.getFullYear(), todayDate.getMonth() - offset, 1);
    monthsGrid.appendChild(buildMonthCard(monthDate));
  }
}

function buildMonthCard(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const card = document.createElement("article");
  card.className = "month-card";

  const title = document.createElement("h3");
  title.className = "month-title";
  title.textContent = monthDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  card.appendChild(title);

  const dayGrid = document.createElement("div");
  dayGrid.className = "day-grid";

  for (let i = 0; i < firstDayOfWeek; i += 1) {
    const placeholder = document.createElement("div");
    placeholder.className = "day-cell placeholder";
    dayGrid.appendChild(placeholder);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = formatDateKey(new Date(year, month, day));
    const entry = data[key];
    const status = entry?.status || "empty";

    const cell = document.createElement("div");
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = `day-cell ${status}`;
    cell.textContent = String(day);
    cell.title = buildDayTooltip(key, entry);

    cell.addEventListener("click", () => {
      if (key === todayKey) {
        activitiesInput.focus();
      }
    });

    dayGrid.appendChild(cell);
  }

  card.appendChild(dayGrid);
  return card;
}

function buildDayTooltip(key, entry) {
  if (!entry) return `${key}: no entry`;

  const excerpt = entry.activities ? entry.activities.slice(0, 72) : "No activities written";
  return `${key}: ${entry.status} — ${excerpt}`;
}

function setSelectedStatus(status) {
  statusInputs.forEach((input) => {
    input.checked = input.value === status;
  });
}

function getSelectedStatus() {
  const checked = Array.from(statusInputs).find((input) => input.checked);
  return checked ? checked.value : "neutral";
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persistData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
