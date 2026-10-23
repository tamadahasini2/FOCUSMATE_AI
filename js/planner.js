import { state } from "./state.js";
import { saveData } from "./storage.js";
import { escapeHtml, openModal, closeModal, showToast, emptyState, formatDate } from "./ui.js";
import { generateDailyPlan, slotToTime, recommendNextTask } from "./recommend.js";

export function renderPlannerPage() {
  const recommendation = recommendNextTask();

  return `
    <section>
      <div class="page-header">
        <div class="page-header-text">
          <div class="page-eyebrow">Study system</div>
          <h2 class="page-title">Study Planner</h2>
          <p class="page-subtitle">Turn subjects into small, trackable study targets.</p>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-secondary" id="generate-plan-btn">Generate today's plan</button>
          <button class="btn btn-primary" data-action="create-plan">+ New study plan</button>
        </div>
      </div>

      <div id="daily-plan-section">${renderDailyPlanSection()}</div>

      <div class="section-divider">
        <span>Subject plans</span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        ${state.studyPlans.length
          ? state.studyPlans.map(renderPlanCard).join("")
          : emptyState(
              "No study plans yet",
              "Create a subject plan and break it down into completable topics.",
              `<button class="btn btn-primary" data-action="create-plan">Create study plan</button>`
            )}
      </div>
    </section>`;
}

function renderDailyPlanSection() {
  if (!state.dailyPlan || !state.dailyPlan.length) {
    return `
      <div class="surface p-5 mb-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-semibold">Today's Adaptive Plan</h3>
              <span class="prototype-badge">Rule-based prototype</span>
            </div>
            <p class="text-muted text-sm">Generate a structured study schedule from your open tasks and available time.</p>
          </div>
        </div>
        <div class="prototype-note mt-4">
          <strong>How this works:</strong> Tasks are scored by deadline urgency, priority, and postponement history, then scheduled into your available hours (${state.settings.availableHours}h/day). This uses deterministic rules — not a trained AI model.
        </div>
        <div class="py-8 text-center">
          <p class="text-muted text-sm mb-4">No plan generated yet for today.</p>
          <button class="btn btn-primary" id="generate-plan-btn-inner">Generate plan</button>
        </div>
      </div>`;
  }

  const done = state.dailyPlan.filter(i => i.status === "done").length;
  const total = state.dailyPlan.filter(i => i.category !== "break").length;

  return `
    <div class="surface p-5 mb-6">
      <div class="flex items-start justify-between gap-4 mb-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <h3 class="font-semibold">Today's Adaptive Plan</h3>
            <span class="prototype-badge">Rule-based prototype</span>
          </div>
          <p class="text-muted text-sm">${done}/${total} tasks completed · ${state.settings.availableHours}h available · Demo data labeled</p>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-ghost btn-sm" id="rebalance-plan-btn">Rebalance</button>
          <button class="btn btn-ghost btn-sm text-muted" id="clear-plan-btn">Clear</button>
        </div>
      </div>

      <div class="daily-plan-list">
        ${state.dailyPlan.map((item, idx) => renderPlanItem(item, idx)).join("")}
      </div>
    </div>`;
}

function renderPlanItem(item, idx) {
  if (item.category === "break") {
    return `
      <div class="plan-item plan-item-break">
        <div class="plan-time">${slotToTime(item.slot)}</div>
        <div class="plan-content">
          <span class="text-muted text-sm">${escapeHtml(item.title)} — ${item.duration} min</span>
        </div>
      </div>`;
  }

  const isDone = item.status === "done";
  const priorityColor = item.priority === "High" ? "plan-priority-high" :
                        item.priority === "Medium" ? "plan-priority-medium" : "plan-priority-low";

  return `
    <div class="plan-item ${isDone ? "plan-item-done" : ""} ${priorityColor}">
      <div class="plan-time">${slotToTime(item.slot)}</div>
      <div class="plan-content">
        <div class="plan-item-title ${isDone ? "line-through text-muted" : ""}">${escapeHtml(item.title)}</div>
        <div class="plan-item-meta">
          <span>${escapeHtml(item.category)}</span>
          <span class="task-meta-dot">·</span>
          <span>${item.duration} min</span>
          ${item.priority ? `<span class="task-meta-dot">·</span><span>${item.priority} priority</span>` : ""}
        </div>
      </div>
      <div class="plan-item-actions">
        ${!isDone ? `<button class="btn btn-ghost btn-sm" data-plan-item-done="${idx}">Done</button>` : `<span class="text-success text-xs font-medium">✓ Done</span>`}
        ${item.taskId ? `<button class="btn btn-ghost btn-sm" data-plan-start-focus="${item.taskId}">Focus</button>` : ""}
      </div>
    </div>`;
}

function renderPlanCard(plan) {
  const done = plan.topics.filter(t => t.completed).length;
  const total = plan.topics.length;
  const pct = total ? Math.round(done / total * 100) : 0;

  return `
    <article class="surface p-5">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="text-xs text-muted mb-1">${escapeHtml(plan.subject)}</div>
          <h3 class="font-semibold">${escapeHtml(plan.target)}</h3>
        </div>
        <button class="btn btn-ghost btn-sm text-muted" data-plan-delete="${plan.id}" aria-label="Delete study plan">Delete</button>
      </div>

      <div class="mt-5">
        <div class="flex justify-between text-xs mb-2">
          <span class="text-muted">Progress</span>
          <span class="font-medium">${done}/${total} topics · ${pct}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${pct}%"></div>
        </div>
      </div>

      <div class="mt-5 space-y-1">
        ${plan.topics.map(topic => `
          <label class="topic-row">
            <input class="task-checkbox" type="checkbox"
              data-topic-toggle="${plan.id}:${topic.id}"
              ${topic.completed ? "checked" : ""}
              aria-label="${topic.completed ? "Mark incomplete" : "Mark complete"}: ${escapeHtml(topic.name)}">
            <span class="${topic.completed ? "task-complete" : ""}">${escapeHtml(topic.name)}</span>
          </label>`).join("")}
      </div>
      <button class="btn btn-secondary btn-full mt-4" data-add-topic="${plan.id}">+ Add topic</button>
    </article>`;
}

export function createPlanModal() {
  openModal({
    title: "Create study plan",
    body: `
      <form id="plan-form" class="form-stack" novalidate>
        <div class="form-field">
          <label class="label" for="plan-subject">Subject <span class="text-error">*</span></label>
          <input id="plan-subject" required class="input" placeholder="e.g. JavaScript, DBMS, Machine Learning">
        </div>
        <div class="form-field">
          <label class="label" for="plan-target">Goal / Target</label>
          <input id="plan-target" class="input" placeholder="e.g. Master modern JavaScript by exam">
        </div>
        <div class="form-field">
          <label class="label" for="plan-topics">Topics <span class="text-muted text-xs font-normal">(one per line)</span></label>
          <textarea id="plan-topics" class="textarea" placeholder="Variables & scope&#10;Functions&#10;Arrays & objects&#10;DOM manipulation"></textarea>
        </div>
      </form>`,
    footer: `
      <button class="btn btn-secondary" data-modal-close>Cancel</button>
      <button class="btn btn-primary" id="save-plan">Create plan</button>`
  });

  document.getElementById("save-plan").onclick = () => {
    const subjectEl = document.getElementById("plan-subject");
    const subject = subjectEl.value.trim();
    if (!subject) { subjectEl.focus(); return; }

    const names = document.getElementById("plan-topics").value
      .split("\n").map(x => x.trim()).filter(Boolean);

    state.studyPlans.push({
      id: crypto.randomUUID(),
      subject,
      target: document.getElementById("plan-target").value.trim() || subject,
      topics: names.map(name => ({ id: crypto.randomUUID(), name, completed: false }))
    });

    saveData(state);
    closeModal();
    showToast("Study plan created");
    location.hash = "planner";
  };
}

export function plannerAction(type, value) {
  if (type === "delete") {
    state.studyPlans = state.studyPlans.filter(p => p.id !== value);
    saveData(state);
    showToast("Study plan deleted");
    location.hash = "planner";
    return;
  }

  if (type === "toggle") {
    const [planId, topicId] = value.split(":");
    const plan = state.studyPlans.find(p => p.id === planId);
    const topic = plan?.topics.find(t => t.id === topicId);
    if (topic) topic.completed = !topic.completed;
    saveData(state);
    location.hash = "planner";
    return;
  }

  if (type === "add") {
    const plan = state.studyPlans.find(p => p.id === value);
    if (!plan) return;
    openModal({
      title: `Add topic to ${escapeHtml(plan.subject)}`,
      body: `
        <div class="form-field">
          <label class="label" for="new-topic">Topic name</label>
          <input id="new-topic" class="input" placeholder="e.g. Async/Await">
        </div>`,
      footer: `
        <button class="btn btn-secondary" data-modal-close>Cancel</button>
        <button class="btn btn-primary" id="save-topic">Add topic</button>`
    });
    document.getElementById("save-topic").onclick = () => {
      const name = document.getElementById("new-topic").value.trim();
      if (!name) return;
      plan.topics.push({ id: crypto.randomUUID(), name, completed: false });
      saveData(state);
      closeModal();
      showToast("Topic added");
      location.hash = "planner";
    };
    return;
  }
}

export function handlePlannerPageEvents() {
  document.getElementById("generate-plan-btn")?.addEventListener("click", () => {
    state.dailyPlan = generateDailyPlan();
    saveData(state);
    location.hash = "planner";
  });

  document.getElementById("generate-plan-btn-inner")?.addEventListener("click", () => {
    state.dailyPlan = generateDailyPlan();
    saveData(state);
    location.hash = "planner";
  });

  document.getElementById("rebalance-plan-btn")?.addEventListener("click", () => {
    // Preserve done items, regenerate remaining
    const doneTasks = (state.dailyPlan || []).filter(i => i.status === "done").map(i => i.taskId);
    state.dailyPlan = generateDailyPlan().map(item => ({
      ...item,
      status: doneTasks.includes(item.taskId) ? "done" : "pending"
    }));
    saveData(state);
    showToast("Plan rebalanced");
    location.hash = "planner";
  });

  document.getElementById("clear-plan-btn")?.addEventListener("click", () => {
    state.dailyPlan = [];
    saveData(state);
    location.hash = "planner";
  });

  document.querySelectorAll("[data-plan-item-done]").forEach(el => {
    el.addEventListener("click", () => {
      const idx = Number(el.dataset.planItemDone);
      if (state.dailyPlan?.[idx]) {
        state.dailyPlan[idx].status = "done";
        saveData(state);
        showToast("Marked complete");
        location.hash = "planner";
      }
    });
  });

  document.querySelectorAll("[data-plan-start-focus]").forEach(el => {
    el.addEventListener("click", () => {
      state.timer.linkedTaskId = el.dataset.planStartFocus;
      location.hash = "focus";
    });
  });
}