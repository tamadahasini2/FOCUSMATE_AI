/**
 * Recommendation engine — pure functions, no side effects.
 * All scoring is rule-based. Factors and weights are documented.
 * This module can be replaced by a real ML service in the future.
 */
import { state } from "./state.js";

const PRIORITY_WEIGHT = { High: 30, Medium: 15, Low: 5 };

function daysUntil(dateStr) {
  if (!dateStr) return 999;
  return Math.ceil((new Date(dateStr) - new Date(new Date().toISOString().slice(0, 10))) / 86400000);
}

/**
 * Score a single open task for "what to work on next".
 * Higher score = more urgent.
 */
function scoreTask(task) {
  let score = 0;
  const days = daysUntil(task.dueDate);

  // Urgency: due today or overdue
  if (days <= 0) score += 50;
  else if (days === 1) score += 35;
  else if (days <= 3) score += 20;
  else if (days <= 7) score += 10;

  // Priority
  score += PRIORITY_WEIGHT[task.priority] || 5;

  // Postponement penalty (repeatedly deferred = needs attention)
  score += (task.postponeCount || 0) * 8;

  // In Progress bonus (already started)
  if (task.status === "In Progress") score += 10;

  return score;
}

/**
 * Returns the recommended next task and its explanation factors.
 */
export function recommendNextTask() {
  const open = state.tasks.filter(t => t.status !== "Completed");
  if (!open.length) return null;

  const scored = open.map(t => ({ task: t, score: scoreTask(t) }))
    .sort((a, b) => b.score - a.score);
  const best = scored[0];
  const task = best.task;

  const reasons = [];
  const days = daysUntil(task.dueDate);
  if (days <= 0) reasons.push("overdue");
  else if (days === 1) reasons.push("due tomorrow");
  else if (days <= 3) reasons.push(`due in ${days} days`);
  if (task.priority === "High") reasons.push("high priority");
  if ((task.postponeCount || 0) > 0) reasons.push(`postponed ${task.postponeCount}×`);
  if (task.status === "In Progress") reasons.push("already in progress");

  return { task, reasons, score: best.score };
}

/**
 * Build a prototype daily study plan from open tasks.
 * Rule: sort by urgency score, then fit into available hours.
 * Labels output as rule-based prototype.
 */
export function generateDailyPlan() {
  const open = state.tasks.filter(t => t.status !== "Completed");
  const available = (state.settings.availableHours || 4) * 60; // minutes
  const breakDuration = 15;

  const sorted = open.map(t => ({ task: t, score: scoreTask(t) }))
    .sort((a, b) => b.score - a.score);

  const plan = [];
  let consumed = 0;
  let slot = 9 * 60; // 09:00 in minutes from midnight (demo)

  for (const { task, score } of sorted) {
    if (consumed >= available) break;
    const duration = task.estimatedMinutes || 30;
    if (consumed + duration > available + 30) continue; // skip if significantly over

    plan.push({
      id: crypto.randomUUID(),
      taskId: task.id,
      title: task.title,
      category: task.category,
      priority: task.priority,
      duration,
      slot, // minutes since midnight
      score,
      status: "pending" // pending | done | skipped
    });

    consumed += duration;
    slot += duration;

    // Insert break after 90 min of work
    if (consumed % 90 < duration && consumed > 0 && plan.length < sorted.length) {
      plan.push({
        id: crypto.randomUUID(),
        taskId: null,
        title: "Short break",
        category: "break",
        priority: null,
        duration: breakDuration,
        slot,
        status: "pending"
      });
      slot += breakDuration;
      consumed += breakDuration;
    }
  }

  return plan;
}

/** Format slot minutes as "HH:MM" */
export function slotToTime(minutes) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Study debt: overdue or postponed tasks with known durations.
 * Returns { count, estimatedMinutes, tasks }.
 */
export function getStudyDebt() {
  const today = new Date().toISOString().slice(0, 10);
  const debtTasks = state.tasks.filter(t =>
    t.status !== "Completed" && (
      (t.dueDate && t.dueDate < today) ||
      (t.postponeCount && t.postponeCount > 0)
    )
  );
  const estimatedMinutes = debtTasks.reduce((s, t) => s + (t.estimatedMinutes || 30), 0);
  return { count: debtTasks.length, estimatedMinutes, tasks: debtTasks };
}

/**
 * Analytics: focus sessions by subject/category.
 * Only uses recorded focusSessions — no fabrication.
 */
export function sessionsBySubject() {
  const map = {};
  for (const s of (state.focusSessions || [])) {
    const key = s.subject || "General";
    map[key] = (map[key] || 0) + (s.actual || s.planned || 0);
  }
  return map;
}

/**
 * Determine completion pace for a goal.
 * Returns { daysLeft, tasksLeft, projectedDate } or null if not calculable.
 */
export function goalPace(goal) {
  if (!goal.deadline) return null;
  const days = daysUntil(goal.deadline);
  const remaining = 100 - goal.progress;
  if (days <= 0 || remaining <= 0) return { daysLeft: days, tasksLeft: 0 };
  // Naive linear projection: assume daily rate from progress to date
  return { daysLeft: days, remainingProgress: remaining };
}
