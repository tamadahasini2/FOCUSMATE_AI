import { state } from "./state.js";
import { saveData } from "./storage.js";
import { escapeHtml, openModal, closeModal, showToast, emptyState, priorityBadge, statusBadge, formatDate } from "./ui.js";

let filters = { search: "", status: "All", priority: "All", sort: "due" };

export function taskStats() {
  const total = state.tasks.length;
  const completed = state.tasks.filter(t => t.status === "Completed").length;
  const today = new Date().toISOString().slice(0, 10);
  const dueToday = state.tasks.filter(t => t.dueDate === today && t.status !== "Completed").length;
  const overdue = state.tasks.filter(t => t.dueDate && t.dueDate < today && t.status !== "Completed").length;
  return {
    total, completed, dueToday, overdue,
    completionRate: total ? Math.round(completed / total * 100) : 0
  };
}

function filteredTasks() {
  let list = [...state.tasks];
  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(t => `${t.title} ${t.description} ${t.category}`.toLowerCase().includes(q));
  }
  if (filters.status !== "All") list = list.filter(t => t.status === filters.status);
  if (filters.priority !== "All") list = list.filter(t => t.priority === filters.priority);

  const p = { High: 0, Medium: 1, Low: 2 };
  list.sort((a, b) => {
    if (filters.sort === "priority") return p[a.priority] - p[b.priority];
    if (filters.sort === "title") return a.title.localeCompare(b.title);
    if (filters.sort === "created") return b.createdAt?.localeCompare(a.createdAt || "") || 0;
    return (a.dueDate || "9999").localeCompare(b.dueDate || "9999");
  });
  return list;
}

export function renderTasksPage() {
  const stats = taskStats();
  return `
    <section>
      <div class="page-header">
        <div class="page-header-text">
          <div class="page-eyebrow">Workspace</div>
          <h2 class="page-title">Tasks</h2>
          <p class="page-subtitle">Keep your work visible, prioritized and moving.</p>
        </div>
        <button class="btn btn-primary" data-action="create-task">${`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`} Create task</button>
      </div>

      <div class="stat-grid stat-grid-4 mb-6">
        ${[
          ["Total tasks", stats.total, ""],
          ["Completed", stats.completed, "success"],
          ["Due today", stats.dueToday, stats.dueToday > 0 ? "warning" : ""],
          ["Overdue", stats.overdue, stats.overdue > 0 ? "error" : ""]
        ].map(([label, value, tone]) => `
          <div class="stat-card ${tone ? "stat-card-" + tone : ""}">
            <div class="stat-label">${label}</div>
            <div class="stat-number">${value}</div>
          </div>`).join("")}
      </div>

      <div class="surface p-4 mb-4">
        <div class="filter-grid">
          <div class="filter-search-wrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="filter-search-icon" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input id="task-search" class="input filter-search-input" placeholder="Search tasks…" value="${escapeHtml(filters.search)}" aria-label="Search tasks">
          </div>
          <select id="task-status" class="select" aria-label="Filter by status">
            ${["All", "Todo", "In Progress", "Completed"].map(x => `<option ${filters.status === x ? "selected" : ""}>${x}</option>`).join("")}
          </select>
          <select id="task-priority" class="select" aria-label="Filter by priority">
            ${["All", "High", "Medium", "Low"].map(x => `<option ${filters.priority === x ? "selected" : ""}>${x}</option>`).join("")}
          </select>
          <select id="task-sort" class="select" aria-label="Sort tasks">
            <option value="due" ${filters.sort === "due" ? "selected" : ""}>Sort: Due date</option>
            <option value="priority" ${filters.sort === "priority" ? "selected" : ""}>Sort: Priority</option>
            <option value="title" ${filters.sort === "title" ? "selected" : ""}>Sort: Title A–Z</option>
            <option value="created" ${filters.sort === "created" ? "selected" : ""}>Sort: Newest first</option>
          </select>
        </div>
      </div>

      <div class="surface">
        <div class="surface-header">
          <h3 class="surface-title">Your tasks</h3>
          <span class="text-xs text-muted">${filteredTasks().length} task${filteredTasks().length !== 1 ? "s" : ""}</span>
        </div>
        <div id="task-list" class="px-4 pb-2">${renderTaskRows()}</div>
      </div>
    </section>`;
}

function renderTaskRows() {
  const list = filteredTasks();
  if (!list.length) {
    return emptyState(
      "No matching tasks",
      filters.search || filters.status !== "All" || filters.priority !== "All"
        ? "Try adjusting your filters, or clear the search."
        : "Create your first task to start planning your day.",
      `<button class="btn btn-primary" data-action="create-task">+ Create task</button>`
    );
  }
  return list.map(task => renderTaskRow(task)).join("");
}

function renderTaskRow(task) {
  const today = new Date().toISOString().slice(0, 10);
  const isOverdue = task.dueDate && task.dueDate < today && task.status !== "Completed";
  const dueCls = isOverdue ? "text-error" : "";

  return `
    <div class="task-row" id="task-row-${task.id}">
      <input
        class="task-checkbox"
        type="checkbox"
        data-task-toggle="${task.id}"
        ${task.status === "Completed" ? "checked" : ""}
        aria-label="${task.status === "Completed" ? "Reopen" : "Complete"}: ${escapeHtml(task.title)}"
      >
      <button class="task-body" data-task-details="${task.id}">
        <div class="task-title-row">
          <span class="task-title ${task.status === "Completed" ? "task-complete" : ""}">${escapeHtml(task.title)}</span>
          ${priorityBadge(task.priority)}
          ${task.status !== "Todo" ? statusBadge(task.status) : ""}
        </div>
        <div class="task-meta">
          <span>${escapeHtml(task.category)}</span>
          <span class="task-meta-dot">·</span>
          <span class="${dueCls}">${formatDate(task.dueDate)}</span>
          ${task.estimatedMinutes ? `<span class="task-meta-dot">·</span><span>${task.estimatedMinutes} min</span>` : ""}
          ${(task.postponeCount || 0) > 0 ? `<span class="task-meta-dot">·</span><span class="text-warning text-xs">postponed ${task.postponeCount}×</span>` : ""}
        </div>
      </button>
      <div class="task-actions">
        <button class="btn btn-ghost btn-sm" data-task-edit="${task.id}" aria-label="Edit task">Edit</button>
        <button class="btn btn-ghost btn-sm text-muted" data-task-delete="${task.id}" aria-label="Delete task">Delete</button>
      </div>
    </div>`;
}

export function createTaskModal(existing = null) {
  const task = existing || {
    title: "", description: "", priority: "Medium",
    status: "Todo", dueDate: new Date().toISOString().slice(0, 10),
    category: "General", estimatedMinutes: 30
  };

  openModal({
    title: existing ? "Edit task" : "Create task",
    body: `
      <form id="task-form" class="form-stack" novalidate>
        <div class="form-field">
          <label class="label" for="task-title">Title <span class="text-error">*</span></label>
          <input required id="task-title" class="input" value="${escapeHtml(task.title)}" maxlength="120" placeholder="e.g. Solve 5 binary search problems">
          <div class="field-hint" id="task-title-error" aria-live="polite"></div>
        </div>
        <div class="form-field">
          <label class="label" for="task-description">Description</label>
          <textarea id="task-description" class="textarea" placeholder="Optional context or notes">${escapeHtml(task.description || "")}</textarea>
        </div>
        <div class="form-row-3">
          <div class="form-field">
            <label class="label" for="task-priority-form">Priority</label>
            <select id="task-priority-form" class="select">
              ${["Low", "Medium", "High"].map(x => `<option ${task.priority === x ? "selected" : ""}>${x}</option>`).join("")}
            </select>
          </div>
          <div class="form-field">
            <label class="label" for="task-status-form">Status</label>
            <select id="task-status-form" class="select">
              ${["Todo", "In Progress", "Completed"].map(x => `<option ${task.status === x ? "selected" : ""}>${x}</option>`).join("")}
            </select>
          </div>
          <div class="form-field">
            <label class="label" for="task-date">Due date</label>
            <input id="task-date" type="date" class="input" value="${task.dueDate || ""}">
          </div>
        </div>
        <div class="form-row-2">
          <div class="form-field">
            <label class="label" for="task-category">Category</label>
            <input id="task-category" class="input" value="${escapeHtml(task.category || "")}" placeholder="DSA, College, ML…">
          </div>
          <div class="form-field">
            <label class="label" for="task-est">Estimated time (min)</label>
            <input id="task-est" type="number" min="5" max="480" class="input" value="${task.estimatedMinutes || 30}">
          </div>
        </div>
      </form>`,
    footer: `
      <button class="btn btn-secondary" data-modal-close>Cancel</button>
      <button class="btn btn-primary" id="save-task">${existing ? "Save changes" : "Create task"}</button>`
  });

  document.getElementById("save-task").onclick = () => {
    const titleEl = document.getElementById("task-title");
    const titleErr = document.getElementById("task-title-error");
    const title = titleEl.value.trim();

    if (!title) {
      titleErr.textContent = "Title is required.";
      titleErr.className = "field-error";
      titleEl.focus();
      return;
    }
    titleErr.textContent = "";

    const data = {
      title,
      description: document.getElementById("task-description").value.trim(),
      priority: document.getElementById("task-priority-form").value,
      status: document.getElementById("task-status-form").value,
      dueDate: document.getElementById("task-date").value,
      category: document.getElementById("task-category").value.trim() || "General",
      estimatedMinutes: Math.max(5, Number(document.getElementById("task-est").value) || 30)
    };

    if (existing) {
      Object.assign(existing, data);
      if (data.status === "Completed" && !existing.completedAt) {
        existing.completedAt = new Date().toISOString();
      } else if (data.status !== "Completed") {
        existing.completedAt = null;
      }
    } else {
      state.tasks.unshift({
        id: crypto.randomUUID(),
        ...data,
        goalId: null,
        postponeCount: 0,
        createdAt: new Date().toISOString(),
        completedAt: data.status === "Completed" ? new Date().toISOString() : null
      });
    }

    saveData(state);
    closeModal();
    showToast(existing ? "Task updated" : "Task created");
    location.hash = "tasks";
  };
}

export function handleTaskAction(action, id) {
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;

  if (action === "toggle") {
    const wasCompleted = task.status === "Completed";
    task.status = wasCompleted ? "Todo" : "Completed";
    task.completedAt = wasCompleted ? null : new Date().toISOString();
    saveData(state);
    showToast(task.status === "Completed" ? "Task completed ✓" : "Task reopened");
    location.hash = "tasks";
    return;
  }

  if (action === "edit") { createTaskModal(task); return; }

  if (action === "delete") {
    openModal({
      title: "Delete task?",
      body: `<p class="secondary">This will permanently remove <strong>${escapeHtml(task.title)}</strong>. This cannot be undone.</p>`,
      footer: `
        <button class="btn btn-secondary" data-modal-close>Cancel</button>
        <button class="btn btn-danger" id="confirm-delete">Delete task</button>`
    });
    document.getElementById("confirm-delete").onclick = () => {
      state.tasks = state.tasks.filter(t => t.id !== id);
      saveData(state);
      closeModal();
      showToast("Task deleted");
      location.hash = "tasks";
    };
    return;
  }

  if (action === "details") {
    const today = new Date().toISOString().slice(0, 10);
    const isOverdue = task.dueDate && task.dueDate < today && task.status !== "Completed";
    openModal({
      title: escapeHtml(task.title),
      body: `
        <div class="space-y-5">
          <div class="flex gap-2 flex-wrap">${priorityBadge(task.priority)} ${statusBadge(task.status)}</div>
          ${task.description ? `<p class="secondary leading-7">${escapeHtml(task.description)}</p>` : `<p class="text-muted text-sm">No description provided.</p>`}
          <div class="detail-grid">
            <div class="detail-item">
              <div class="detail-label">Category</div>
              <div class="detail-value">${escapeHtml(task.category)}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Due date</div>
              <div class="detail-value ${isOverdue ? "text-error" : ""}">${formatDate(task.dueDate)}${isOverdue ? " — overdue" : ""}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Estimated time</div>
              <div class="detail-value">${task.estimatedMinutes || "—"} min</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Created</div>
              <div class="detail-value">${task.createdAt ? new Date(task.createdAt).toLocaleDateString("en-IN") : "—"}</div>
            </div>
            ${(task.postponeCount || 0) > 0 ? `
              <div class="detail-item">
                <div class="detail-label">Postponed</div>
                <div class="detail-value text-warning">${task.postponeCount}× — consider splitting this task</div>
              </div>` : ""}
          </div>
        </div>`,
      footer: `
        <button class="btn btn-secondary" data-modal-close>Close</button>
        <button class="btn btn-ghost" id="details-postpone">Postpone</button>
        <button class="btn btn-primary" id="details-edit">Edit task</button>`
    });
    document.getElementById("details-edit").onclick = () => { closeModal(); createTaskModal(task); };
    document.getElementById("details-postpone").onclick = () => {
      if (task.dueDate) {
        const next = new Date(task.dueDate);
        next.setDate(next.getDate() + 1);
        task.dueDate = next.toISOString().slice(0, 10);
        task.postponeCount = (task.postponeCount || 0) + 1;
        saveData(state);
        closeModal();
        showToast("Task postponed to " + formatDate(task.dueDate));
        location.hash = "tasks";
      }
    };
    return;
  }
}

export function applyTaskFilters() {
  filters.search = document.getElementById("task-search")?.value || "";
  filters.status = document.getElementById("task-status")?.value || "All";
  filters.priority = document.getElementById("task-priority")?.value || "All";
  filters.sort = document.getElementById("task-sort")?.value || "due";
}