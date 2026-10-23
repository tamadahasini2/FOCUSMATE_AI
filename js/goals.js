import { state } from "./state.js";
import { saveData } from "./storage.js";
import { escapeHtml, openModal, closeModal, showToast, emptyState, formatDate } from "./ui.js";
import { goalPace } from "./recommend.js";

export function renderGoalsPage() {
  const activeGoals = state.goals.filter(g => g.progress < 100);
  const completedGoals = state.goals.filter(g => g.progress >= 100);

  return `
    <section>
      <div class="page-header">
        <div class="page-header-text">
          <div class="page-eyebrow">Long-term direction</div>
          <h2 class="page-title">Goals</h2>
          <p class="page-subtitle">Connect your daily work to what actually matters.</p>
        </div>
        <button class="btn btn-primary" data-action="create-goal">+ New goal</button>
      </div>

      ${state.goals.length === 0
        ? emptyState(
            "No goals yet",
            "Create a goal and link your daily tasks to meaningful outcomes.",
            `<button class="btn btn-primary" data-action="create-goal">Create your first goal</button>`
          )
        : `
          ${activeGoals.length > 0 ? `
            <div class="mb-6">
              <div class="section-label mb-3">Active goals</div>
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                ${activeGoals.map(goal => renderGoalCard(goal)).join("")}
              </div>
            </div>` : ""}

          ${completedGoals.length > 0 ? `
            <div>
              <div class="section-label mb-3">Completed</div>
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                ${completedGoals.map(goal => renderGoalCard(goal, true)).join("")}
              </div>
            </div>` : ""}
        `}
    </section>`;
}

function renderGoalCard(goal, isComplete = false) {
  const pace = goalPace(goal);
  const linkedTaskCount = state.tasks.filter(t => t.goalId === goal.id).length;
  const relatedTasksDone = state.tasks.filter(t => t.goalId === goal.id && t.status === "Completed").length;

  return `
    <article class="surface p-5 ${isComplete ? "opacity-70" : ""}">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0 flex-1">
          ${goal.category ? `<div class="text-xs text-muted mb-1">${escapeHtml(goal.category)}</div>` : ""}
          <h3 class="font-semibold leading-tight">${escapeHtml(goal.title)}</h3>
          ${goal.description ? `<p class="secondary text-sm mt-1">${escapeHtml(goal.description)}</p>` : ""}
        </div>
        <button class="btn btn-ghost btn-sm text-muted flex-shrink-0" data-goal-delete="${goal.id}" aria-label="Delete goal">Delete</button>
      </div>

      <div class="mt-5">
        <div class="flex justify-between text-xs mb-2">
          <span class="text-muted">Progress</span>
          <span class="font-semibold">${goal.progress}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill ${isComplete ? "progress-fill-success" : ""}" style="width:${goal.progress}%"></div>
        </div>
      </div>

      <div class="detail-grid mt-5">
        <div class="detail-item">
          <div class="detail-label">Deadline</div>
          <div class="detail-value">${goal.deadline ? formatDate(goal.deadline) : "No deadline"}</div>
        </div>
        ${pace ? `
          <div class="detail-item">
            <div class="detail-label">Days left</div>
            <div class="detail-value ${pace.daysLeft <= 7 ? "text-warning" : ""}">${pace.daysLeft > 0 ? pace.daysLeft : "Overdue"}</div>
          </div>` : ""}
        ${linkedTaskCount > 0 ? `
          <div class="detail-item">
            <div class="detail-label">Linked tasks</div>
            <div class="detail-value">${relatedTasksDone}/${linkedTaskCount} done</div>
          </div>` : ""}
      </div>

      <div class="flex gap-2 mt-5">
        <button class="btn btn-secondary flex-1" data-goal-progress="${goal.id}">Update progress</button>
        <button class="btn btn-ghost" data-goal-plan="${goal.id}">Plan</button>
      </div>
    </article>`;
}

export function createGoalModal() {
  openModal({
    title: "Create goal",
    body: `
      <form id="goal-form" class="form-stack" novalidate>
        <div class="form-field">
          <label class="label" for="goal-title">Goal title <span class="text-error">*</span></label>
          <input id="goal-title" required class="input" placeholder="e.g. Complete DSA roadmap">
        </div>
        <div class="form-field">
          <label class="label" for="goal-description">Description</label>
          <textarea id="goal-description" class="textarea" placeholder="What does success look like?"></textarea>
        </div>
        <div class="form-row-2">
          <div class="form-field">
            <label class="label" for="goal-category">Category</label>
            <input id="goal-category" class="input" placeholder="DSA, Development…">
          </div>
          <div class="form-field">
            <label class="label" for="goal-deadline">Target date</label>
            <input id="goal-deadline" type="date" class="input">
          </div>
        </div>
        <div class="form-field">
          <label class="label" for="goal-progress-init">Starting progress</label>
          <input id="goal-progress-init" type="number" min="0" max="100" value="0" class="input">
        </div>
      </form>`,
    footer: `
      <button class="btn btn-secondary" data-modal-close>Cancel</button>
      <button class="btn btn-primary" id="save-goal">Create goal</button>`
  });

  document.getElementById("save-goal").onclick = () => {
    const titleEl = document.getElementById("goal-title");
    if (!titleEl.value.trim()) { titleEl.focus(); return; }

    state.goals.push({
      id: crypto.randomUUID(),
      title: titleEl.value.trim(),
      description: document.getElementById("goal-description").value.trim(),
      category: document.getElementById("goal-category").value.trim(),
      deadline: document.getElementById("goal-deadline").value,
      progress: Math.min(100, Math.max(0, Number(document.getElementById("goal-progress-init").value) || 0))
    });

    saveData(state);
    closeModal();
    showToast("Goal created");
    location.hash = "goals";
  };
}

export function goalAction(type, id) {
  const goal = state.goals.find(g => g.id === id);
  if (!goal) return;

  if (type === "delete") {
    openModal({
      title: "Delete goal?",
      body: `<p class="secondary">This removes <strong>${escapeHtml(goal.title)}</strong>. Linked tasks will remain but lose their goal association.</p>`,
      footer: `
        <button class="btn btn-secondary" data-modal-close>Cancel</button>
        <button class="btn btn-danger" id="confirm-goal-delete">Delete goal</button>`
    });
    document.getElementById("confirm-goal-delete").onclick = () => {
      // Unlink tasks
      state.tasks.forEach(t => { if (t.goalId === id) t.goalId = null; });
      state.goals = state.goals.filter(g => g.id !== id);
      saveData(state);
      closeModal();
      showToast("Goal deleted");
      location.hash = "goals";
    };
    return;
  }

  if (type === "progress") {
    openModal({
      title: `Update: ${escapeHtml(goal.title)}`,
      body: `
        <div class="form-field">
          <label class="label" for="goal-progress-edit">Completion percentage</label>
          <input id="goal-progress-edit" type="range" min="0" max="100" value="${goal.progress}" class="range-input">
          <div id="goal-range-display" class="text-center text-2xl font-semibold mt-4">${goal.progress}%</div>
        </div>`,
      footer: `
        <button class="btn btn-secondary" data-modal-close>Cancel</button>
        <button class="btn btn-primary" id="save-goal-progress">Save progress</button>`
    });
    const range = document.getElementById("goal-progress-edit");
    const display = document.getElementById("goal-range-display");
    range.oninput = () => { display.textContent = `${range.value}%`; };
    document.getElementById("save-goal-progress").onclick = () => {
      goal.progress = Number(range.value);
      saveData(state);
      closeModal();
      showToast("Goal updated");
      location.hash = "goals";
    };
    return;
  }

  if (type === "plan") {
    // Break goal into suggested milestones (prototype)
    const taskCount = state.tasks.filter(t => t.goalId === id).length;
    const remaining = 100 - goal.progress;
    const suggestedTasks = Math.max(3, Math.ceil(remaining / 20));

    openModal({
      title: `Plan: ${escapeHtml(goal.title)}`,
      body: `
        <div class="prototype-note mb-4">
          <strong>Prototype planning:</strong> This suggests a task breakdown based on remaining progress. Review and adjust before creating tasks.
        </div>
        <div class="mb-4">
          <div class="text-sm secondary mb-1">Progress remaining</div>
          <div class="font-semibold">${remaining}% · ~${suggestedTasks} milestones suggested</div>
        </div>
        <div class="mb-4">
          <label class="label" for="goal-plan-tasks">Add suggested tasks (one per line)</label>
          <textarea id="goal-plan-tasks" class="textarea" rows="6" placeholder="Study topic 1&#10;Study topic 2&#10;Practice problems&#10;Review and test"></textarea>
        </div>
        <div class="text-xs text-muted">These will be created as tasks linked to this goal.</div>`,
      footer: `
        <button class="btn btn-secondary" data-modal-close>Cancel</button>
        <button class="btn btn-primary" id="create-goal-tasks">Create tasks</button>`
    });

    document.getElementById("create-goal-tasks").onclick = () => {
      const lines = document.getElementById("goal-plan-tasks").value
        .split("\n").map(x => x.trim()).filter(Boolean);

      if (!lines.length) { closeModal(); return; }

      const today = new Date().toISOString().slice(0, 10);
      lines.forEach(title => {
        state.tasks.unshift({
          id: crypto.randomUUID(),
          title, description: `Part of goal: ${goal.title}`,
          priority: "Medium", status: "Todo",
          dueDate: goal.deadline || today,
          category: goal.category || "General",
          estimatedMinutes: 30,
          goalId: id,
          postponeCount: 0,
          createdAt: new Date().toISOString(),
          completedAt: null
        });
      });

      saveData(state);
      closeModal();
      showToast(`${lines.length} task${lines.length > 1 ? "s" : ""} created`);
      location.hash = "goals";
    };
    return;
  }
}