import { state } from "./state.js";
import { saveData } from "./storage.js";
import { escapeHtml, showToast, formatDate } from "./ui.js";
import { recommendNextTask, generateDailyPlan, getStudyDebt } from "./recommend.js";

// Conversation history persists for the session
let messages = [
  {
    role: "assistant",
    text: "Hi. I'm a rule-based productivity assistant — not a real AI model. I can help you plan your day, review your tasks, analyze your study progress, and create structured recovery plans from your local data.",
    timestamp: new Date().toISOString()
  }
];

const ACTIONS = [
  { id: "plan-day",        label: "Plan my day",             icon: "📋" },
  { id: "next-task",       label: "Explain my next task",    icon: "→" },
  { id: "study-debt",      label: "Reduce my study debt",    icon: "⚠" },
  { id: "goal-breakdown",  label: "Help me reach a goal",    icon: "◎" },
  { id: "analyze",         label: "Analyze my productivity", icon: "▥" },
  { id: "rebalance",       label: "Rebalance my schedule",   icon: "⟳" }
];

function handleAction(actionId) {
  switch (actionId) {
    case "plan-day":       return planDayAction();
    case "next-task":      return nextTaskAction();
    case "study-debt":     return studyDebtAction();
    case "goal-breakdown": return goalBreakdownAction();
    case "analyze":        return analyzeAction();
    case "rebalance":      return rebalanceAction();
    default:               return handleFreeText(actionId);
  }
}

function planDayAction() {
  const plan = generateDailyPlan();
  if (!plan.length) return "You have no open tasks to plan. Create some tasks first and come back.";

  const taskItems = plan.filter(i => i.category !== "break");
  const totalMin = taskItems.reduce((s, i) => s + i.duration, 0);

  const planText = plan.map(item => {
    if (item.category === "break") return `  ${formatSlot(item.slot)} — Break (${item.duration} min)`;
    return `  ${formatSlot(item.slot)} — ${item.title} (${item.duration} min, ${item.priority || "normal"} priority)`;
  }).join("\n");

  // Apply to state
  state.dailyPlan = plan;
  saveData(state);

  return `Here's a prototype daily plan based on your ${taskItems.length} open tasks and ${state.settings.availableHours}h available time:\n\n${planText}\n\nTotal work time: ~${totalMin} min. I've saved this as today's plan — you can view and edit it in the Study Planner.\n\n[Prototype rule-based schedule — not a trained AI]`;
}

function nextTaskAction() {
  const rec = recommendNextTask();
  if (!rec) return "You have no open tasks. Great job, or go create some!";

  const { task, reasons } = rec;
  const reasonStr = reasons.length ? reasons.join(", ") : "highest overall urgency score";
  return `Your recommended next task is:\n\n**${task.title}**\n\nCategory: ${task.category} · Priority: ${task.priority} · Due: ${formatDate(task.dueDate)}\n\nWhy this task? ${reasonStr}.\n\nStart a focus session in Focus Mode and link it to this task for tracking.`;
}

function studyDebtAction() {
  const debt = getStudyDebt();
  if (debt.count === 0) return "No study debt detected. Your overdue and postponed tasks are clear — good discipline!";

  const taskList = debt.tasks.slice(0, 5).map(t =>
    `  • ${t.title} (${t.estimatedMinutes || 30} min, due ${formatDate(t.dueDate)})`
  ).join("\n");

  return `Study debt: ${debt.count} overdue or postponed task${debt.count > 1 ? "s" : ""} (~${debt.estimatedMinutes} min total).\n\nMost urgent:\n${taskList}\n\nTo recover:\n  1. Pick the shortest overdue task first (quick win).\n  2. Schedule one recovery session per day.\n  3. Consider splitting tasks over 60 min into smaller pieces.\n\nUse "Rebalance my schedule" to generate a recovery plan.`;
}

function goalBreakdownAction() {
  const activeGoals = state.goals.filter(g => g.progress < 100);
  if (!activeGoals.length) return "You have no active goals. Create a goal in the Goals section and I can help you plan toward it.";

  const goal = activeGoals[0]; // Pick the most urgent (simplistic for prototype)
  const remaining = 100 - goal.progress;
  const daysLeft = goal.deadline
    ? Math.ceil((new Date(goal.deadline) - new Date()) / 86400000)
    : null;

  const milestones = Math.max(3, Math.ceil(remaining / 15));
  const steps = Array.from({ length: Math.min(milestones, 5) }, (_, i) =>
    `  ${i + 1}. Focus session ${i + 1} — review and practice (est. 30–45 min)`
  ).join("\n");

  return `Let's break down: **${goal.title}**\n\nCurrent progress: ${goal.progress}% · ${remaining}% remaining${daysLeft ? ` · ${daysLeft} days left` : ""}.\n\nSuggested milestones (~${milestones} sessions):\n${steps}\n\nGo to Goals → Plan to create real tasks from this breakdown and track them.`;
}

function analyzeAction() {
  const sessions = state.focusSessions || [];
  const completed = state.tasks.filter(t => t.status === "Completed").length;
  const open = state.tasks.filter(t => t.status !== "Completed").length;
  const focusMin = Math.floor(state.timer.totalFocusSeconds / 60);

  if (sessions.length < 2 && completed < 2) {
    return "Not enough data to analyze yet. Complete at least 2 tasks or focus sessions and try again.";
  }

  const avgRating = sessions.filter(s => s.rating).length
    ? (sessions.filter(s => s.rating).reduce((s, r) => s + r.rating, 0) / sessions.filter(s => s.rating).length).toFixed(1)
    : "no ratings yet";

  const debt = getStudyDebt();

  return `Productivity summary based on your local data:\n\n• Tasks completed: ${completed} of ${completed + open}\n• Focus time recorded: ${focusMin} min across ${sessions.length} session${sessions.length !== 1 ? "s" : ""}\n• Average focus rating: ${avgRating}/5\n• Study debt: ${debt.count} overdue/postponed task${debt.count !== 1 ? "s" : ""}\n\nFor deeper insights, check the Analytics page where patterns are visualized by category, subject and day.\n\n[Based on your browser's local data — not cloud-synced]`;
}

function rebalanceAction() {
  const open = state.tasks.filter(t => t.status !== "Completed");
  if (!open.length) return "No open tasks to rebalance. You're all caught up!";

  const plan = generateDailyPlan();
  const conflicts = plan.reduce((s, i) => s + i.duration, 0) > state.settings.availableHours * 60;

  state.dailyPlan = plan;
  saveData(state);

  const taskItems = plan.filter(i => i.category !== "break");

  if (conflicts) {
    return `I've generated a rebalanced plan with your ${taskItems.length} highest-priority open tasks, but the total work time (~${taskItems.reduce((s, i) => s + i.duration, 0)} min) exceeds your ${state.settings.availableHours * 60} min daily budget.\n\nConsider: reducing task scope, extending available hours in Settings, or postponing lower-priority items.\n\nPlan saved to Study Planner.`;
  }

  return `Plan rebalanced. ${taskItems.length} task${taskItems.length !== 1 ? "s" : ""} scheduled across your ${state.settings.availableHours}h of available time. Completed work is preserved.\n\nView the updated plan in the Study Planner.`;
}

function handleFreeText(input) {
  const text = input.toLowerCase();
  if (text.includes("priorit") || text.includes("next")) return nextTaskAction();
  if (text.includes("plan") || text.includes("today") || text.includes("schedule")) return planDayAction();
  if (text.includes("debt") || text.includes("overdue") || text.includes("late")) return studyDebtAction();
  if (text.includes("goal") || text.includes("break down") || text.includes("milestone")) return goalBreakdownAction();
  if (text.includes("analyz") || text.includes("how am i") || text.includes("progress")) return analyzeAction();
  if (text.includes("rebalance") || text.includes("reschedule") || text.includes("adjust")) return rebalanceAction();

  return "I understand requests about: planning your day, your next task, study debt, goal breakdown, productivity analysis, and schedule rebalancing. Try one of the quick actions on the right, or type something like \"plan my day\" or \"what should I do next?\"";
}

function formatSlot(minutes) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function renderAssistantPage() {
  return `
    <section>
      <div class="page-header">
        <div class="page-header-text">
          <div class="page-eyebrow">Productivity assistant</div>
          <h2 class="page-title">AI Assistant</h2>
          <p class="page-subtitle">Connected to your tasks, goals, and focus records. Frontend prototype — no external API.</p>
        </div>
      </div>

      <div class="assistant-layout">
        <div class="surface assistant-chat">
          <div id="assistant-messages" class="assistant-messages" aria-live="polite" aria-label="Conversation">${renderMessages()}</div>
          <form id="assistant-form" class="assistant-input-wrap" novalidate>
            <input id="assistant-input" class="input assistant-input" placeholder="Ask about your tasks, goals, or study plan…" autocomplete="off" aria-label="Message assistant">
            <button class="btn btn-primary" type="submit">Send</button>
          </form>
        </div>

        <aside class="assistant-sidebar">
          <div class="surface p-4">
            <h3 class="font-semibold mb-3">Quick actions</h3>
            <div class="space-y-2">
              ${ACTIONS.map(a => `
                <button
                  class="btn btn-secondary btn-full text-left justify-start"
                  data-assistant-prompt="${a.id}"
                  aria-label="${a.label}"
                >
                  <span class="text-muted" aria-hidden="true">${a.icon}</span>
                  <span>${a.label}</span>
                </button>`).join("")}
            </div>
          </div>

          <div class="surface p-4 mt-3">
            <h3 class="font-semibold mb-2">How this works</h3>
            <p class="text-xs secondary leading-5">
              This assistant uses deterministic rules — not a trained AI model. It reads your local tasks, goals, and focus sessions to generate responses.
            </p>
            <div class="prototype-note mt-3 text-xs">
              <strong>Prototype mode.</strong> A real AI assistant would require a backend API and model integration, documented in the README.
            </div>
          </div>
        </aside>
      </div>
    </section>`;
}

function renderMessages() {
  return messages.map((m, i) => `
    <div class="chat-message chat-message-${m.role}" aria-label="${m.role === "user" ? "You" : "Assistant"}">
      <div class="chat-bubble chat-bubble-${m.role}">
        <div class="chat-sender">${m.role === "user" ? "You" : "FocusMate"}</div>
        <div class="chat-text">${formatMessageText(escapeHtml(m.text))}</div>
      </div>
    </div>`).join("");
}

function formatMessageText(text) {
  // Bold **text**, line breaks, bullet points
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n  • /g, "\n<li>")
    .replace(/\n\n/g, "</p><p class='mt-2'>")
    .replace(/\n/g, "<br>");
}

export function submitAssistant(input) {
  const text = typeof input === "string" ? input.trim() : "";
  if (!text) return;

  messages.push({ role: "user", text, timestamp: new Date().toISOString() });
  const responseText = handleAction(text);
  messages.push({ role: "assistant", text: responseText, timestamp: new Date().toISOString() });

  // Clear input
  const inputEl = document.getElementById("assistant-input");
  if (inputEl) inputEl.value = "";

  // Re-render messages area without full page reload
  const messagesEl = document.getElementById("assistant-messages");
  if (messagesEl) {
    messagesEl.innerHTML = renderMessages();
    messagesEl.scrollTop = messagesEl.scrollHeight;
  } else {
    location.hash = "assistant";
  }
}