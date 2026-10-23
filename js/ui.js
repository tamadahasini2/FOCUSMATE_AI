import { state } from "./state.js";

// ─── SVG Icons (inline, accessible, sized consistently) ─────────────────────
export const icons = {
  dashboard: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>`,
  tasks: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>`,
  planner: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  focus: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><polyline points="12 6 12 12 16 14"/></svg>`,
  goals: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>`,
  analytics: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  assistant: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`,
  settings: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
  menu: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  search: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  plus: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  close: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  chevronRight: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>`,
  play: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
  info: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  page: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>`
};

const nav = [
  ["dashboard", "Dashboard", icons.dashboard],
  ["tasks",     "Tasks",         icons.tasks],
  ["planner",   "Study Planner", icons.planner],
  ["focus",     "Focus Mode",    icons.focus],
  ["goals",     "Goals",         icons.goals],
  ["analytics", "Analytics",     icons.analytics],
  ["assistant", "AI Assistant",  icons.assistant],
  ["abstract", "Abstract", icons.page]
];

export function layout(content, title = "Dashboard") {
  return `
    <div class="app-shell">
      <aside id="sidebar" class="sidebar" role="navigation" aria-label="Main navigation">
        <div class="sidebar-logo">
          <div class="logo-mark" aria-hidden="true">F</div>
          <div>
            <div class="logo-name">FocusMate</div>
            <div class="logo-sub">Study Workspace</div>
          </div>
        </div>

        <div class="sidebar-nav-group">
          <div class="sidebar-nav-label">Workspace</div>
          <nav class="sidebar-nav">
            ${nav.map(([id, label, icon]) => `
              
        <a href="${id === "abstract" ? "pages/abstract.html" : `#${id}`}"
          class="nav-item ${state.currentPage === id ? "active" : ""}"
          aria-current="${state.currentPage === id ? "page" : "false"}">

                <span class="nav-icon">${icon}</span>
                <span class="nav-label">${label}</span>
              </a>`).join("")}
          </nav>
        </div>

        <div class="sidebar-bottom">
          <a href="#settings" class="nav-item ${state.currentPage === "settings" ? "active" : ""}">
            <span class="nav-icon">${icons.settings}</span>
            <span class="nav-label">Settings</span>
          </a>
          <div class="sidebar-user">
            <div class="avatar" aria-hidden="true">${(state.settings.displayName || "S").slice(0, 1).toUpperCase()}</div>
            <div class="sidebar-user-info">
              <div class="sidebar-user-name">${escapeHtml(state.settings.displayName)}</div>
              <div class="sidebar-user-role">Student workspace</div>
            </div>
          </div>
        </div>
      </aside>

      <main class="main-content" id="main-content">
        <header class="topbar" role="banner">
          <div class="topbar-left">
            <button id="mobile-menu" class="mobile-only btn btn-ghost icon-btn" aria-label="Open navigation" aria-expanded="false">
              ${icons.menu}
            </button>
            <div class="topbar-title">
              <div class="topbar-breadcrumb">FocusMate AI</div>
              <h1 class="topbar-page-title">${escapeHtml(title)}</h1>
            </div>
          </div>
          <div class="topbar-actions">
            <button class="btn btn-ghost" data-action="global-search" aria-label="Search workspace">
              ${icons.search}<span class="hidden-mobile">Search</span>
            </button>
            <button class="btn btn-primary" data-action="create-task">
              ${icons.plus}<span class="hidden-mobile">New task</span>
            </button>
          </div>
        </header>
        <div class="page-wrap">${content}</div>
      </main>
    </div>
    <div id="modal-root" role="presentation"></div>
  `;
}

export function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c])
  );
}

export function showToast(message, type = "default") {
  const root = document.getElementById("toast-root");
  if (!root) return;
  const node = document.createElement("div");
  node.className = `toast toast-${type}`;
  node.setAttribute("role", "status");
  node.textContent = message;
  root.appendChild(node);
  // Animate out then remove
  setTimeout(() => node.classList.add("toast-exit"), 2400);
  setTimeout(() => node.remove(), 2700);
}

export function openModal({ title, body, footer = "" }) {
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="modal-backdrop" data-modal-close>
      <section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h2 id="modal-title" class="modal-title">${title}</h2>
          <button class="btn btn-ghost icon-btn" data-modal-close aria-label="Close dialog">
            ${icons.close}
          </button>
        </div>
        <div class="modal-body">${body}</div>
        ${footer ? `<div class="modal-footer">${footer}</div>` : ""}
      </section>
    </div>`;
  root.querySelectorAll("[data-modal-close]").forEach(el => el.addEventListener("click", closeModal));
  // Keyboard: close on Escape
  root._keyHandler = (e) => { if (e.key === "Escape") closeModal(); };
  document.addEventListener("keydown", root._keyHandler);
  // Focus first focusable
  requestAnimationFrame(() => {
    const first = root.querySelector("input, textarea, select, [tabindex]:not([tabindex='-1']), button");
    first?.focus();
  });
}

export function closeModal() {
  const root = document.getElementById("modal-root");
  if (root._keyHandler) document.removeEventListener("keydown", root._keyHandler);
  root.innerHTML = "";
}

export function emptyState(title, description, action = "") {
  return `<div class="empty-state">
    <div class="empty-icon" aria-hidden="true">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
    </div>
    <h3 class="empty-title">${escapeHtml(title)}</h3>
    <p class="empty-description">${escapeHtml(description)}</p>
    ${action ? `<div class="empty-action">${action}</div>` : ""}
  </div>`;
}

export function priorityBadge(priority) {
  const map = { High: "badge-error", Medium: "badge-warning", Low: "badge-neutral" };
  return `<span class="badge ${map[priority] || "badge-neutral"}">${priority}</span>`;
}

export function statusBadge(status) {
  const map = { "Completed": "badge-success", "In Progress": "badge-accent", "Todo": "badge-neutral" };
  return `<span class="badge ${map[status] || "badge-neutral"}">${status}</span>`;
}

export function formatDate(dateStr) {
  if (!dateStr) return "No date";
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  if (dateStr === today) return "Today";
  if (dateStr === tomorrow) return "Tomorrow";
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}