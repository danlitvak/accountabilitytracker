const STORAGE_KEY = "accountabilityTracker.v1";
const INFO_COLLAPSED_KEY = "accountabilityTracker.infoCollapsed";
const MONTH_COUNT = 6;
const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const EXAMPLE_GYM_DATES = [
  "2023-04-23", "2023-04-25", "2023-04-26", "2023-04-27", "2023-04-28", "2023-04-30",
  "2023-05-05", "2023-05-11", "2023-05-14", "2023-05-16", "2023-05-18", "2023-05-19",
  "2023-05-20", "2023-05-21", "2023-05-22", "2023-05-25", "2023-05-26", "2023-05-27",
  "2023-06-02", "2023-06-04", "2023-06-06", "2023-06-08", "2023-06-09", "2023-06-16",
  "2023-06-17", "2023-06-18", "2023-06-20", "2023-06-23", "2023-06-24", "2023-06-27",
  "2023-06-30", "2023-07-01", "2023-07-05", "2023-07-07", "2023-07-11", "2023-07-14",
  "2023-07-15", "2023-07-16", "2023-07-18", "2023-07-20", "2023-07-21", "2023-07-25",
  "2023-07-26", "2023-07-27", "2023-07-29", "2023-08-01", "2023-08-16", "2023-08-17",
  "2023-08-18", "2023-08-19", "2023-08-21", "2023-08-22", "2023-08-23", "2023-08-24",
  "2023-08-25", "2023-08-26", "2023-08-28", "2023-08-29", "2023-08-30", "2023-09-01",
  "2023-09-03", "2023-09-06", "2023-09-08", "2023-09-09", "2023-09-11", "2023-09-13",
  "2023-09-14", "2023-09-15", "2023-09-16", "2023-09-17", "2023-09-18", "2023-09-20",
  "2023-09-21", "2023-09-24", "2023-09-25", "2023-09-29", "2023-09-30", "2023-10-07",
  "2023-10-08", "2023-10-09", "2023-10-12", "2023-10-15", "2023-10-17", "2023-10-20",
  "2023-10-22", "2023-10-24", "2023-10-29", "2023-11-03", "2023-11-07", "2023-11-09",
  "2023-11-12", "2023-11-21", "2023-11-25", "2023-12-07", "2023-12-17", "2023-12-23",
  "2024-01-06", "2024-01-07", "2024-01-14", "2024-01-19", "2024-01-21", "2024-01-27",
  "2024-02-17", "2024-02-24", "2024-02-25", "2024-03-02", "2024-03-10", "2024-03-23",
  "2024-03-24", "2024-03-26", "2024-04-02", "2024-04-07", "2024-04-09", "2024-05-20",
  "2024-05-28", "2024-06-14", "2024-06-27", "2024-07-12", "2024-07-13", "2024-07-14",
  "2024-07-18", "2024-07-19", "2024-07-21", "2024-07-22", "2024-07-29", "2024-08-17",
  "2024-09-09", "2024-09-11", "2024-09-14", "2024-09-16", "2024-10-19", "2024-10-20",
  "2024-10-26", "2024-10-27", "2024-10-30", "2024-11-05", "2024-12-01", "2024-12-05",
  "2024-12-26", "2024-12-28", "2024-12-30", "2025-01-06", "2025-01-08", "2025-01-25",
  "2025-02-01", "2025-02-09", "2025-02-12", "2025-02-20", "2025-03-15", "2025-03-29",
  "2025-04-14", "2025-04-30", "2025-05-22", "2025-06-04", "2025-06-09", "2025-06-18",
  "2026-02-06", "2026-02-08", "2026-02-09", "2026-02-18", "2026-02-25", "2026-02-26",
  "2026-03-02", "2026-03-04", "2026-03-05", "2026-03-10", "2026-03-11", "2026-03-19",
  "2026-03-30",
];

const todayDate = new Date();
const todayKey = formatDateKey(todayDate);

const todayDateEl = document.getElementById("todayDate");
const activitiesInput = document.getElementById("activitiesInput");
const saveCompletedBtn = document.getElementById("saveCompletedBtn");
const saveMissedBtn = document.getElementById("saveMissedBtn");
const saveNeutralBtn = document.getElementById("saveNeutralBtn");
const saveMessage = document.getElementById("saveMessage");
const monthsGrid = document.getElementById("monthsGrid");
const aboutPanel = document.getElementById("aboutPanel");
const infoToggle = document.getElementById("infoToggle");
const last30CompletedEl = document.getElementById("last30Completed");
const last30MissedEl = document.getElementById("last30Missed");
const currentStreakEl = document.getElementById("currentStreak");
const dayPreviewDateEl = document.getElementById("dayPreviewDate");
const dayPreviewStatusEl = document.getElementById("dayPreviewStatus");
const dayPreviewTextEl = document.getElementById("dayPreviewText");
const exampleToggle = document.getElementById("exampleToggle");
const modeBadge = document.getElementById("modeBadge");

const exampleData = buildExampleData(EXAMPLE_GYM_DATES);
const userData = loadData();
let isExampleMode = false;
let data = userData;

init();

function init() {
  todayDateEl.textContent = todayDate.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const isCollapsed = localStorage.getItem(INFO_COLLAPSED_KEY) !== "0";
  setAboutPanelCollapsed(isCollapsed, { immediate: true });

  populateTodayForm();
  renderDashboard();
  resetDayPreview();

  saveCompletedBtn.addEventListener("click", () => onSave("completed"));
  saveMissedBtn.addEventListener("click", () => onSave("missed"));
  saveNeutralBtn.addEventListener("click", () => onSave("neutral"));
  infoToggle.addEventListener("click", onToggleInfo);
  exampleToggle.addEventListener("click", onToggleExampleMode);
  aboutPanel.addEventListener("transitionend", onAboutPanelTransitionEnd);
  syncModeUI();
}

function onToggleInfo() {
  const nextCollapsed = !aboutPanel.classList.contains("is-collapsed");
  setAboutPanelCollapsed(nextCollapsed);
  localStorage.setItem(INFO_COLLAPSED_KEY, nextCollapsed ? "1" : "0");
}

function setAboutPanelCollapsed(collapsed, options = {}) {
  const { immediate = false } = options;

  if (immediate) {
    aboutPanel.classList.toggle("is-collapsed", collapsed);
    aboutPanel.style.height = collapsed ? "0px" : `${aboutPanel.scrollHeight}px`;
    updateInfoToggleState(collapsed);
    return;
  }

  if (collapsed) {
    aboutPanel.style.height = `${aboutPanel.scrollHeight}px`;
    requestAnimationFrame(() => {
      aboutPanel.classList.add("is-collapsed");
      aboutPanel.style.height = "0px";
    });
  } else {
    aboutPanel.classList.remove("is-collapsed");
    aboutPanel.style.height = "0px";
    requestAnimationFrame(() => {
      aboutPanel.style.height = `${aboutPanel.scrollHeight}px`;
    });
  }

  updateInfoToggleState(collapsed);
}

function updateInfoToggleState(collapsed) {
  infoToggle.classList.toggle("is-active", !collapsed);
  infoToggle.setAttribute("aria-expanded", String(!collapsed));
}

function onAboutPanelTransitionEnd(event) {
  if (event.propertyName !== "height") {
    return;
  }

  if (!aboutPanel.classList.contains("is-collapsed")) {
    aboutPanel.style.height = "auto";
  }
}

function populateTodayForm() {
  const entry = data[todayKey] || { activities: "" };
  activitiesInput.value = entry.activities || "";
}

function onSave(status) {
  if (isExampleMode) {
    saveMessage.textContent = "Example data is read-only";
    return;
  }

  userData[todayKey] = {
    status,
    activities: activitiesInput.value.trim(),
    updatedAt: new Date().toISOString(),
  };

  persistData();
  data = userData;
  renderDashboard();
  saveMessage.textContent = `${formatSavedLabel(status)} ${new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

function onToggleExampleMode() {
  isExampleMode = !isExampleMode;
  data = isExampleMode ? exampleData : userData;
  populateTodayForm();
  renderDashboard();
  resetDayPreview();
  saveMessage.textContent = isExampleMode ? "Example gym log loaded" : "";
  syncModeUI();
}

function syncModeUI() {
  exampleToggle.classList.toggle("is-active", isExampleMode);
  exampleToggle.setAttribute("aria-pressed", String(isExampleMode));
  exampleToggle.textContent = isExampleMode ? "My Data" : "Example";

  activitiesInput.disabled = isExampleMode;
  saveCompletedBtn.disabled = isExampleMode;
  saveMissedBtn.disabled = isExampleMode;
  saveNeutralBtn.disabled = isExampleMode;

  modeBadge.hidden = !isExampleMode;
}

function renderDashboard() {
  renderStats();
  renderMonths();
}

function renderStats() {
  const stats = getLast30DayStats();
  last30CompletedEl.textContent = String(stats.completed);
  last30MissedEl.textContent = String(stats.missed);
  currentStreakEl.textContent = String(getCurrentStreak());
}

function renderMonths() {
  monthsGrid.innerHTML = "";

  for (let offset = 0; offset < MONTH_COUNT; offset += 1) {
    const monthDate = new Date(todayDate.getFullYear(), todayDate.getMonth() - offset, 1);
    monthsGrid.appendChild(buildMonthCard(monthDate));
  }
}

function buildMonthCard(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const summary = getMonthSummary(year, month);

  const card = document.createElement("article");
  card.className = "month-card";

  const header = document.createElement("div");
  header.className = "month-header";

  const title = document.createElement("h3");
  title.className = "month-title";
  title.textContent = monthDate.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const totals = document.createElement("p");
  totals.className = "month-totals";
  totals.textContent = `C ${summary.completed}  M ${summary.missed}  N ${summary.neutral}`;

  header.append(title, totals);
  card.appendChild(header);

  const weekdayRow = document.createElement("div");
  weekdayRow.className = "weekday-row";

  WEEKDAY_LABELS.forEach((label) => {
    const weekday = document.createElement("span");
    weekday.className = "weekday-cell";
    weekday.textContent = label;
    weekdayRow.appendChild(weekday);
  });

  card.appendChild(weekdayRow);

  const dayGrid = document.createElement("div");
  dayGrid.className = "day-grid";

  for (let i = 0; i < firstDayOfWeek; i += 1) {
    const placeholder = document.createElement("div");
    placeholder.className = "day-cell placeholder";
    placeholder.setAttribute("aria-hidden", "true");
    dayGrid.appendChild(placeholder);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const key = formatDateKey(date);
    const entry = data[key];
    const status = entry?.status || "empty";
    const isToday = key === todayKey;

    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = `day-cell ${status}${isToday ? " today" : ""}`;
    cell.textContent = String(day);
    cell.title = buildDayTooltip(key, entry);
    cell.setAttribute("aria-label", buildDayTooltip(key, entry));
    cell.addEventListener("mouseenter", () => updateDayPreview(date, entry, status));
    cell.addEventListener("focus", () => updateDayPreview(date, entry, status));

    cell.addEventListener("click", () => {
      updateDayPreview(date, entry, status);
    });

    dayGrid.appendChild(cell);
  }

  card.appendChild(dayGrid);
  return card;
}

function buildDayTooltip(key, entry) {
  if (!entry) {
    return `${key}: no entry`;
  }

  const excerpt = entry.activities ? entry.activities.replace(/\s+/g, " ").slice(0, 80) : "No notes";
  return `${key}: ${entry.status}. ${excerpt}`;
}

function updateDayPreview(date, entry, status) {
  dayPreviewDateEl.textContent = date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  dayPreviewStatusEl.textContent = formatStatusLabel(status);
  dayPreviewTextEl.textContent = entry?.activities || "No saved commitments for this date.";
}

function resetDayPreview() {
  dayPreviewDateEl.textContent = "Inspect a date";
  dayPreviewStatusEl.textContent = "Hover or tap a day";
  dayPreviewTextEl.textContent = "Saved commitments and notes will show here.";
}

function getMonthSummary(year, month) {
  const summary = { completed: 0, missed: 0, neutral: 0 };
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = formatDateKey(new Date(year, month, day));
    const status = data[key]?.status;
    if (status && summary[status] !== undefined) {
      summary[status] += 1;
    }
  }

  return summary;
}

function getLast30DayStats() {
  const stats = { completed: 0, missed: 0 };

  for (let offset = 0; offset < 30; offset += 1) {
    const date = new Date(todayDate);
    date.setDate(todayDate.getDate() - offset);
    const status = data[formatDateKey(date)]?.status;

    if (status === "completed") {
      stats.completed += 1;
    } else if (status === "missed") {
      stats.missed += 1;
    }
  }

  return stats;
}

function getCurrentStreak() {
  let streak = 0;

  for (let offset = 0; offset < 365; offset += 1) {
    const date = new Date(todayDate);
    date.setDate(todayDate.getDate() - offset);
    const status = data[formatDateKey(date)]?.status;

    if (status === "completed") {
      streak += 1;
      continue;
    }

    break;
  }

  return streak;
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatSavedLabel(status) {
  if (status === "completed") {
    return "Saved as done";
  }

  if (status === "missed") {
    return "Saved as missed";
  }

  return "Saved notes";
}

function formatStatusLabel(status) {
  if (status === "completed") {
    return "Completed";
  }

  if (status === "missed") {
    return "Missed";
  }

  if (status === "neutral") {
    return "Notes only";
  }

  return "No entry";
}

function buildExampleData(dateKeys) {
  const entries = {};

  dateKeys.forEach((key) => {
    entries[key] = {
      status: "completed",
      activities: "gym",
      updatedAt: `${key}T12:00:00.000Z`,
    };
  });

  return entries;
}
