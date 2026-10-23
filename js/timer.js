import { state } from "./state.js";
import { saveData } from "./storage.js";
import { showToast, escapeHtml, openModal, closeModal } from "./ui.js";

export function setupTimer() {
  if (!state.timer) {
    state.timer = {
      mode: "focus", remaining: state.settings.focusDuration * 60,
      running: false, sessions: 0, totalFocusSeconds: 0,
      interval: null, linkedTaskId: null, sessionStart: null
    };
  }
  if (!state.timer.remaining) {
    state.timer.remaining = state.settings.focusDuration * 60;
  }
}

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function modeLabel(mode) {
  return mode === "focus" ? "Focus session" : mode === "short" ? "Short break" : "Long break";
}

function totalForMode(mode) {
  if (mode === "focus") return state.settings.focusDuration * 60;
  if (mode === "short") return state.settings.shortBreak * 60;
  return state.settings.longBreak * 60;
}

export function timerView() {
  const total = totalForMode(state.timer.mode);
  const progress = Math.max(0, Math.min(100, ((total - state.timer.remaining) / total) * 100));
  const linkedTask = state.timer.linkedTaskId
    ? state.tasks?.find(t => t.id === state.timer.linkedTaskId)
    : null;

  const openTasks = state.tasks?.filter(t => t.status !== "Completed") || [];

  return `
    <section>
      <div class="timer-layout">
        <div class="timer-center">
          <div class="timer-mode-tabs" role="tablist" aria-label="Timer mode">
            ${[["focus", "Focus"], ["short", "Short break"], ["long", "Long break"]].map(([mode, label]) => `
              <button
                class="timer-mode-tab ${state.timer.mode === mode ? "active" : ""}"
                data-timer-mode="${mode}"
                role="tab"
                aria-selected="${state.timer.mode === mode}"
              >${label}</button>`).join("")}
          </div>

          <div class="timer-ring-wrap">
            <div class="timer-ring" style="--timer-progress:${progress}%" aria-label="${formatTime(state.timer.remaining)} remaining">
              <div class="timer-ring-inner">
                <div>
                  <div id="timer-display" class="timer-digits" aria-live="polite" aria-atomic="true">${formatTime(state.timer.remaining)}</div>
                  <div class="timer-status-label">${state.timer.running ? "Session in progress" : state.timer.remaining === total ? "Ready when you are" : "Paused"}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="timer-controls">
            ${state.timer.running
              ? `<button class="btn btn-secondary btn-lg" data-timer="pause">Pause</button>`
              : `<button class="btn btn-primary btn-lg" data-timer="start">${state.timer.remaining === total ? "Start session" : "Resume"}</button>`}
            <button class="btn btn-ghost" data-timer="reset">Reset</button>
          </div>

          ${linkedTask ? `
            <div class="timer-linked-task">
              <div class="text-xs text-muted mb-1">Working on</div>
              <div class="font-medium text-sm">${escapeHtml(linkedTask.title)}</div>
              <div class="text-xs text-muted mt-1">${escapeHtml(linkedTask.category)} · ${linkedTask.priority} priority</div>
              <button class="btn btn-ghost btn-sm mt-2" data-timer-unlink>Unlink task</button>
            </div>` : `
            <div class="timer-linked-task timer-linked-empty">
              <div class="text-xs text-muted mb-2">Link to a task (optional)</div>
              <select id="timer-task-select" class="select" style="font-size:13px">
                <option value="">No task linked</option>
                ${openTasks.map(t => `<option value="${t.id}" ${state.timer.linkedTaskId === t.id ? "selected" : ""}>${escapeHtml(t.title)}</option>`).join("")}
              </select>
              <button class="btn btn-ghost btn-sm mt-2" id="timer-link-task-btn">Link task</button>
            </div>`}
        </div>

        <aside class="timer-sidebar">
          <div class="surface p-4">
            <h3 class="font-semibold mb-4">Session stats</h3>
            <div class="space-y-4">
              <div class="timer-stat">
                <div class="timer-stat-label">Sessions today</div>
                <div class="timer-stat-value">${state.timer.sessions}</div>
              </div>
              <div class="timer-stat">
                <div class="timer-stat-label">Total focus time</div>
                <div class="timer-stat-value">${Math.floor(state.timer.totalFocusSeconds / 60)} min</div>
              </div>
              <div class="timer-stat">
                <div class="timer-stat-label">Current mode</div>
                <div class="timer-stat-value">${modeLabel(state.timer.mode)}</div>
              </div>
            </div>
          </div>

          <div class="surface p-4 mt-4">
            <h3 class="font-semibold mb-3">How FocusMate Adapts</h3>
            <div class="adapt-flow">
              ${[
                "Tasks + deadlines + goals",
                "Recommendation logic",
                "Recommended task + plan",
                "Focus session recorded",
                "Analytics updated",
                "Plan revised"
              ].map((step, i) => `
                <div class="adapt-step">
                  <div class="adapt-step-dot">${i + 1}</div>
                  <div class="adapt-step-text text-sm secondary">${step}</div>
                </div>`).join("")}
            </div>
            <p class="text-xs text-muted mt-3">Frontend prototype: sessions are recorded locally. A real ML recommendation service would be a future backend integration.</p>
          </div>
        </aside>
      </div>
    </section>`;
}

export function timerAction(action) {
  if (action === "start" && !state.timer.running) {
    state.timer.running = true;
    state.timer.sessionStart = Date.now();
    state.timer.interval = setInterval(tick, 1000);
    showToast("Focus session started");
  }
  if (action === "pause") {
    state.timer.running = false;
    clearInterval(state.timer.interval);
    state.timer.interval = null;
    showToast("Timer paused");
  }
  if (action === "reset") {
    state.timer.running = false;
    clearInterval(state.timer.interval);
    state.timer.interval = null;
    state.timer.sessionStart = null;
    resetRemaining();
  }
}

export function setTimerMode(mode) {
  state.timer.running = false;
  clearInterval(state.timer.interval);
  state.timer.interval = null;
  state.timer.mode = mode;
  state.timer.sessionStart = null;
  resetRemaining();
}

function resetRemaining() {
  state.timer.remaining = totalForMode(state.timer.mode);
}

function tick() {
  if (!state.timer.running) return;
  state.timer.remaining--;
  if (state.timer.mode === "focus") state.timer.totalFocusSeconds++;

  if (state.timer.remaining <= 0) {
    state.timer.running = false;
    clearInterval(state.timer.interval);
    state.timer.interval = null;

    if (state.timer.mode === "focus") {
      state.timer.sessions++;

      // Record session
      const linkedTask = state.timer.linkedTaskId
        ? state.tasks?.find(t => t.id === state.timer.linkedTaskId)
        : null;
      const session = {
        id: crypto.randomUUID(),
        taskId: state.timer.linkedTaskId || null,
        subject: linkedTask?.category || "General",
        planned: state.settings.focusDuration,
        actual: state.settings.focusDuration,
        type: "focus",
        date: new Date().toISOString().slice(0, 10),
        rating: null
      };
      if (!state.focusSessions) state.focusSessions = [];
      state.focusSessions.push(session);

      showToast("Focus session complete. Great work!");
      // Prompt for rating
      setTimeout(() => promptSessionRating(session), 500);
    } else {
      showToast("Break complete. Ready to focus again?");
    }

    state.timer.sessionStart = null;
    resetRemaining();
  }

  saveData(state);
  // Update timer display in-place without full re-render (smoother)
  const display = document.getElementById("timer-display");
  if (display) {
    display.textContent = formatTime(state.timer.remaining);
    // Update ring progress via CSS variable
    const ring = document.querySelector(".timer-ring");
    if (ring) {
      const total = totalForMode(state.timer.mode);
      const pct = Math.max(0, Math.min(100, ((total - state.timer.remaining) / total) * 100));
      ring.style.setProperty("--timer-progress", pct + "%");
    }
  } else {
    location.hash = "focus";
  }
}

function promptSessionRating(session) {
  openModal({
    title: "How was your focus?",
    body: `
      <p class="secondary text-sm mb-5">Rate the quality of your ${session.planned}-minute session. This helps track your productivity patterns.</p>
      <div class="rating-row" role="group" aria-label="Session rating">
        ${[1, 2, 3, 4, 5].map(n => `
          <button class="rating-btn" data-rating="${n}" aria-label="${n} star${n > 1 ? "s" : ""}">
            ${"★".repeat(n)}${"☆".repeat(5 - n)}
          </button>`).join("")}
      </div>
      <div id="selected-rating" class="text-center text-sm text-muted mt-3">Select a rating</div>`,
    footer: `
      <button class="btn btn-secondary" data-modal-close>Skip</button>
      <button class="btn btn-primary" id="save-rating" disabled>Save rating</button>`
  });

  let chosenRating = null;
  document.querySelectorAll(".rating-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      chosenRating = Number(btn.dataset.rating);
      document.querySelectorAll(".rating-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("selected-rating").textContent = `${chosenRating} star${chosenRating > 1 ? "s" : ""}`;
      document.getElementById("save-rating").disabled = false;
    });
  });

  document.getElementById("save-rating").onclick = () => {
    session.rating = chosenRating;
    saveData(state);
    closeModal();
    showToast("Session recorded");
  };
}

export function bindTimerLinkEvents() {
  document.getElementById("timer-link-task-btn")?.addEventListener("click", () => {
    const sel = document.getElementById("timer-task-select");
    state.timer.linkedTaskId = sel?.value || null;
    saveData(state);
    location.hash = "focus";
  });

  document.querySelector("[data-timer-unlink]")?.addEventListener("click", () => {
    state.timer.linkedTaskId = null;
    saveData(state);
    location.hash = "focus";
  });
}