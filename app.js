const STORAGE_KEY = "accountabilityTracker.v1";
const INFO_COLLAPSED_KEY = "accountabilityTracker.infoCollapsed";
const MONTH_COUNT = 6;
const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

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

let data = loadData();

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
  aboutPanel.addEventListener("transitionend", onAboutPanelTransitionEnd);
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
  data[todayKey] = {
    status,
    activities: activitiesInput.value.trim(),
    updatedAt: new Date().toISOString(),
  };

  persistData();
  renderDashboard();
  saveMessage.textContent = `${formatSavedLabel(status)} ${new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })}`;
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
