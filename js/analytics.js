import { state } from "./state.js";
import { taskStats } from "./tasks.js";
import { sessionsBySubject, getStudyDebt } from "./recommend.js";

export function renderAnalyticsPage() {
  const stats = taskStats();
  const focusMinutes = Math.floor(state.timer.totalFocusSeconds / 60);
  const sessions = state.focusSessions || [];
  const sessionCount = sessions.length;
  const debt = getStudyDebt();
  const hasSessionData = sessions.length >= 2;

  // Tasks by category
  const categories = [...new Set(state.tasks.map(t => t.category))];
  const maxCatCount = Math.max(1, ...categories.map(c =>
    state.tasks.filter(t => t.category === c && t.status === "Completed").length
  ));

  // Focus by subject
  const subjectMinutes = sessionsBySubject();
  const subjectEntries = Object.entries(subjectMinutes).sort((a, b) => b[1] - a[1]);
  const maxSubjectMin = Math.max(1, ...Object.values(subjectMinutes));

  // Weekly task completion (last 7 days)
  const weekData = buildWeekData();

  // Goal progress
  const goals = state.goals;

  return `
    <section>
      <div class="page-header">
        <div class="page-header-text">
          <div class="page-eyebrow">Performance</div>
          <h2 class="page-title">Analytics</h2>
          <p class="page-subtitle">Use the data to understand your habits, not to create pressure.</p>
        </div>
      </div>

      <div class="stat-grid stat-grid-4 mb-6">
        <div class="stat-card">
          <div class="stat-label">Tasks completed</div>
          <div class="stat-number">${stats.completed}</div>
          <div class="stat-sub">of ${stats.total} total</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Completion rate</div>
          <div class="stat-number">${stats.completionRate}%</div>
          <div class="stat-sub">${stats.completionRate >= 70 ? "Strong progress" : "Keep going"}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Focus time</div>
          <div class="stat-number">${focusMinutes}<span class="stat-unit">m</span></div>
          <div class="stat-sub">${sessionCount} session${sessionCount !== 1 ? "s" : ""} recorded</div>
        </div>
        <div class="stat-card ${debt.count > 0 ? "stat-card-warning" : ""}">
          <div class="stat-label">Study debt</div>
          <div class="stat-number">${debt.count}</div>
          <div class="stat-sub">${debt.count > 0 ? `~${debt.estimatedMinutes} min overdue/postponed` : "Nothing overdue"}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div class="surface p-5">
          <h3 class="surface-title mb-1">Tasks by category</h3>
          <p class="text-xs text-muted mb-5">Completed tasks grouped by subject — based on your local data.</p>
          ${categories.length ? `
            <div class="bar-chart-list">
              ${categories.map(c => {
                const n = state.tasks.filter(t => t.category === c && t.status === "Completed").length;
                const total_c = state.tasks.filter(t => t.category === c).length;
                return `
                  <div class="bar-chart-row">
                    <div class="bar-chart-label">${c}</div>
                    <div class="bar-chart-track">
                      <div class="bar-chart-fill" style="width:${Math.round(n / maxCatCount * 100)}%"></div>
                    </div>
                    <div class="bar-chart-value">${n}/${total_c}</div>
                  </div>`;
              }).join("")}
            </div>` : `<p class="text-muted text-sm py-6 text-center">Complete tasks to see category trends.</p>`}
        </div>

        <div class="surface p-5">
          <h3 class="surface-title mb-1">Goals progress</h3>
          <p class="text-xs text-muted mb-5">Progress based on your manual updates and linked tasks.</p>
          ${goals.length ? `
            <div class="space-y-4">
              ${goals.map(g => `
                <div>
                  <div class="flex justify-between text-sm mb-2">
                    <span class="font-medium">${g.title}</span>
                    <span class="text-muted">${g.progress}%</span>
                  </div>
                  <div class="progress-track">
                    <div class="progress-fill" style="width:${g.progress}%"></div>
                  </div>
                </div>`).join("")}
            </div>` : `<p class="text-muted text-sm py-6 text-center">Create a goal to track progress here.</p>`}
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div class="surface p-5">
          <h3 class="surface-title mb-1">Weekly completions</h3>
          <p class="text-xs text-muted mb-5">Tasks completed in the last 7 days.</p>
          <div class="weekly-chart">
            ${weekData.map(day => `
              <div class="weekly-col">
                <div class="weekly-bar-wrap">
                  <div class="weekly-bar" style="height:${day.pct}%" title="${day.count} completed"></div>
                </div>
                <div class="weekly-label">${day.label}</div>
                <div class="weekly-count">${day.count}</div>
              </div>`).join("")}
          </div>
        </div>

        <div class="surface p-5">
          <h3 class="surface-title mb-1">Focus time by subject</h3>
          <p class="text-xs text-muted mb-5">Minutes recorded per subject from your ${sessionCount} saved session${sessionCount !== 1 ? "s" : ""}.</p>
          ${subjectEntries.length ? `
            <div class="bar-chart-list">
              ${subjectEntries.map(([subject, mins]) => `
                <div class="bar-chart-row">
                  <div class="bar-chart-label">${subject}</div>
                  <div class="bar-chart-track">
                    <div class="bar-chart-fill bar-chart-fill-alt" style="width:${Math.round(mins / maxSubjectMin * 100)}%"></div>
                  </div>
                  <div class="bar-chart-value">${mins} min</div>
                </div>`).join("")}
            </div>` : `<p class="text-muted text-sm py-6 text-center">Complete focus sessions to see subject trends.</p>`}
        </div>
      </div>

      <!-- Productivity Insights -->
      <div class="surface p-5">
        <div class="flex items-center gap-2 mb-1">
          <h3 class="surface-title">Productivity insights</h3>
          <span class="prototype-badge">AI Insights Preview</span>
        </div>
        <p class="text-xs text-muted mb-5">
          ${hasSessionData
            ? `Based on your ${sessionCount} recorded sessions and ${stats.completed} completed tasks.`
            : "Complete at least 2 focus sessions to see pattern insights."
          }
        </p>
        ${hasSessionData ? renderInsights(sessions, stats, debt) : renderInsightsEmpty()}
      </div>
    </section>`;
}

function buildWeekData() {
  const days = [];
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let maxCount = 0;

  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const dateStr = d.toISOString().slice(0, 10);
    const count = state.tasks.filter(t =>
      t.completedAt && t.completedAt.slice(0, 10) === dateStr
    ).length;
    maxCount = Math.max(maxCount, count);
    days.push({ label: dayLabels[d.getDay()], dateStr, count });
  }

  return days.map(d => ({ ...d, pct: maxCount ? Math.round(d.count / maxCount * 100) : 0 }));
}

function renderInsights(sessions, stats, debt) {
  const insights = [];

  // Average session rating
  const rated = sessions.filter(s => s.rating != null);
  if (rated.length > 0) {
    const avg = (rated.reduce((s, r) => s + r.rating, 0) / rated.length).toFixed(1);
    insights.push({
      title: "Average session quality",
      text: `Your average self-rated focus quality is ${avg}/5 across ${rated.length} rated session${rated.length > 1 ? "s" : ""}.`,
      type: avg >= 4 ? "success" : avg >= 3 ? "neutral" : "warning"
    });
  }

  // Planned vs actual (if captured)
  const plannedVsActual = sessions.filter(s => s.planned && s.actual && s.planned !== s.actual);
  if (plannedVsActual.length > 0) {
    const shortCount = plannedVsActual.filter(s => s.actual < s.planned).length;
    insights.push({
      title: "Session duration",
      text: `${shortCount} of your ${sessions.length} sessions ended early. Shorter sessions may indicate distractions or low energy.`,
      type: "neutral"
    });
  }

  // Study debt
  if (debt.count > 0) {
    insights.push({
      title: "Study debt detected",
      text: `${debt.count} task${debt.count > 1 ? "s are" : " is"} overdue or repeatedly postponed (~${debt.estimatedMinutes} min total). Consider rebalancing your plan.`,
      type: "warning"
    });
  }

  // Completion rate
  if (stats.completionRate < 50 && stats.total > 3) {
    insights.push({
      title: "Low completion rate",
      text: `Your completion rate is ${stats.completionRate}%. Try reducing your task list to the 3 most important items each day.`,
      type: "warning"
    });
  } else if (stats.completionRate >= 80) {
    insights.push({
      title: "Strong completion rate",
      text: `${stats.completionRate}% of your tasks are completed. You're managing your workload well.`,
      type: "success"
    });
  }

  if (!insights.length) {
    insights.push({
      title: "Not enough data yet",
      text: "Complete more tasks and focus sessions to generate meaningful insights.",
      type: "neutral"
    });
  }

  return `<div class="insights-list">
    ${insights.map(ins => `
      <div class="insight-card insight-${ins.type}">
        <div class="insight-title">${ins.title}</div>
        <div class="insight-text">${ins.text}</div>
      </div>`).join("")}
  </div>`;
}

function renderInsightsEmpty() {
  return `
    <div class="insights-empty">
      <p class="text-muted text-sm">Complete at least 2 focus sessions and a few tasks to see personalized insights here.</p>
      <a href="#focus" class="btn btn-secondary mt-3">Start a focus session</a>
    </div>`;
}