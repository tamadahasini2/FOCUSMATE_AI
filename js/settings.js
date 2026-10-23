import { state } from "./state.js";
import { saveData, resetData } from "./storage.js";
import { openModal, closeModal, showToast, escapeHtml } from "./ui.js";

export function renderSettingsPage() {
  return `
    <section>
      <div class="page-header">
        <div class="page-header-text">
          <div class="page-eyebrow">Preferences</div>
          <h2 class="page-title">Settings</h2>
          <p class="page-subtitle">Tune FocusMate around the way you study and work.</p>
        </div>
      </div>

      <div class="settings-layout">

        <div class="surface p-5">
          <h3 class="settings-section-title">Profile</h3>
          <div class="form-field">
            <label class="label" for="setting-name">Display name</label>
            <div class="flex gap-2">
              <input id="setting-name" class="input" value="${escapeHtml(state.settings.displayName)}" maxlength="60" placeholder="Your name">
              <button class="btn btn-primary flex-shrink-0" data-setting-save="name">Save</button>
            </div>
          </div>
        </div>

        <div class="surface p-5">
          <h3 class="settings-section-title">Timer settings</h3>
          <p class="text-muted text-sm mb-4">These durations are used by Focus Mode.</p>
          <div class="form-row-3">
            ${[
              ["focusDuration", "Focus session (min)", 1, 120],
              ["shortBreak",    "Short break (min)",   1, 30],
              ["longBreak",     "Long break (min)",    5, 60]
            ].map(([id, label, min, max]) => `
              <div class="form-field">
                <label class="label" for="setting-${id}">${label}</label>
                <input id="setting-${id}" class="input" type="number" min="${min}" max="${max}" value="${state.settings[id]}">
              </div>`).join("")}
          </div>
          <button class="btn btn-secondary mt-4" data-setting-save="timer">Save timer settings</button>
        </div>

        <div class="surface p-5">
          <h3 class="settings-section-title">Study preferences</h3>
          <p class="text-muted text-sm mb-4">Used by the adaptive planner to schedule your tasks.</p>
          <div class="form-row-2">
            <div class="form-field">
              <label class="label" for="setting-hours">Daily available study hours</label>
              <input id="setting-hours" class="input" type="number" min="1" max="16" value="${state.settings.availableHours || 4}">
            </div>
            <div class="form-field">
              <label class="label" for="setting-period">Preferred focus period</label>
              <select id="setting-period" class="select">
                <option value="morning" ${state.settings.preferredPeriod === "morning" ? "selected" : ""}>Morning (9:00–13:00)</option>
                <option value="afternoon" ${state.settings.preferredPeriod === "afternoon" ? "selected" : ""}>Afternoon (13:00–18:00)</option>
                <option value="evening" ${state.settings.preferredPeriod === "evening" ? "selected" : ""}>Evening (18:00–22:00)</option>
              </select>
            </div>
          </div>
          <button class="btn btn-secondary mt-4" data-setting-save="study">Save study preferences</button>
        </div>

        <div class="surface p-5">
          <h3 class="settings-section-title">Notifications</h3>
          <label class="settings-toggle-row">
            <span>
              <div class="font-medium">Productivity notifications</div>
              <div class="text-muted text-xs mt-0.5">Show session feedback and task completion toasts.</div>
            </span>
            <label class="toggle-switch">
              <input id="setting-notifications" type="checkbox" ${state.settings.notifications ? "checked" : ""}>
              <span class="toggle-track" aria-hidden="true"></span>
            </label>
          </label>
        </div>

        <div class="surface p-5">
          <h3 class="settings-section-title">About this application</h3>
          <div class="about-grid">
            <div class="about-row">
              <div class="about-label">Storage</div>
              <div class="about-value">Browser localStorage only · not cloud-synced</div>
            </div>
            <div class="about-row">
              <div class="about-label">AI features</div>
              <div class="about-value">Rule-based frontend prototype · no external AI API</div>
            </div>
            <div class="about-row">
              <div class="about-label">Data privacy</div>
              <div class="about-value">All data stays in your browser · cleared on reset</div>
            </div>
            <div class="about-row">
              <div class="about-label">Version</div>
              <div class="about-value">FocusMate AI v2.0 · FSD Project</div>
            </div>
          </div>
        </div>

        <div class="surface p-5 border-danger">
          <h3 class="settings-section-title text-error">Data management</h3>
          <p class="text-muted text-sm mb-4">All data is stored in your browser's localStorage. This action removes all tasks, goals, plans, sessions, and settings and restores the original sample workspace.</p>
          <button class="btn btn-danger" data-setting-reset>Reset all local data</button>
        </div>

      </div>
    </section>`;
}

export function settingsAction(action) {
  if (action === "name") {
    const val = document.getElementById("setting-name")?.value.trim();
    if (!val) { showToast("Name cannot be empty"); return; }
    state.settings.displayName = val;
    saveData(state);
    showToast("Profile saved");
    location.hash = "settings";
  }

  if (action === "timer") {
    const focus = Math.max(1, Math.min(120, Number(document.getElementById("setting-focusDuration")?.value) || 25));
    const sBreak = Math.max(1, Math.min(30, Number(document.getElementById("setting-shortBreak")?.value) || 5));
    const lBreak = Math.max(5, Math.min(60, Number(document.getElementById("setting-longBreak")?.value) || 15));
    state.settings.focusDuration = focus;
    state.settings.shortBreak = sBreak;
    state.settings.longBreak = lBreak;
    state.timer.remaining = focus * 60;
    saveData(state);
    showToast("Timer settings saved");
    location.hash = "settings";
  }

  if (action === "study") {
    const hours = Math.max(1, Math.min(16, Number(document.getElementById("setting-hours")?.value) || 4));
    const period = document.getElementById("setting-period")?.value || "morning";
    state.settings.availableHours = hours;
    state.settings.preferredPeriod = period;
    saveData(state);
    showToast("Study preferences saved");
    location.hash = "settings";
  }

  if (action === "notifications") {
    state.settings.notifications = document.getElementById("setting-notifications")?.checked ?? true;
    saveData(state);
  }

  if (action === "reset") {
    openModal({
      title: "Reset all data?",
      body: `
        <p class="secondary">This removes all your local tasks, goals, study plans, focus sessions, and settings, and restores the original sample workspace.</p>
        <div class="prototype-note mt-4">This action cannot be undone. Your data is only in your browser — there is no backup.</div>`,
      footer: `
        <button class="btn btn-secondary" data-modal-close>Cancel</button>
        <button class="btn btn-danger" id="confirm-reset">Reset data</button>`
    });
    document.getElementById("confirm-reset").onclick = () => {
      resetData();
      closeModal();
      location.reload();
    };
  }
}