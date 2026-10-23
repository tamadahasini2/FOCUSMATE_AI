# FocusMate AI

**An adaptive study and productivity management system for students.**

FocusMate AI is a fully client-side web application that helps students decide what to study next, allocate time intelligently, understand productivity patterns, and adapt plans as real progress changes.

---

## Quick Start

No build step required. Open `index.html` in a modern browser (Chrome, Firefox, Edge, Safari).

```bash
# With a local dev server (recommended for ES module support)
npx serve .
# or
python -m http.server 8080
```

Then visit `http://localhost:8080`.

> **Note:** The app uses ES modules (`type="module"`). Opening `index.html` directly via `file://` will fail in most browsers due to CORS restrictions on modules. Use any local server.

---

## Features

### ✅ Fully implemented (frontend, rule-based)

| Feature | Description |
|---|---|
| **Task management** | Create, edit, delete, filter, sort, search tasks with priority, status, due date, category, and estimated time |
| **Postpone tracking** | Track how many times a task is deferred — surfaces in recommendations |
| **Dashboard** | Greeting, daily stats, recommended next task with explanation, overdue/debt chip |
| **Recommended next task** | Rule-based urgency scoring (deadline, priority, postpone count, in-progress status) |
| **Today's adaptive plan** | Rule-based daily schedule generator from open tasks and available hours |
| **Plan rebalancing** | Regenerate plan preserving completed items; flags time conflicts |
| **Study Planner** | Subject plans with topic tracking, completion progress |
| **Focus Mode** | Pomodoro-style timer with pause/resume/reset, task linking, session recording |
| **Session rating** | Rate focus quality after each session (stored locally) |
| **Goals** | Create goals, track progress, link tasks, prototype goal planning |
| **Analytics** | Completion rate, focus time, tasks by category, weekly chart, goal progress, study debt stat |
| **Productivity insights** | Evidence-based insights from recorded sessions and tasks (labeled as AI preview) |
| **AI Assistant** | 6 concrete action workflows: plan my day, explain next task, study debt recovery, goal breakdown, analyze productivity, rebalance schedule |
| **Settings** | Profile, timer, study preferences (hours/period), notifications, data reset |
| **Global search** | Searches tasks, goals, and study topics |
| **localStorage persistence** | All data persists across browser sessions |
| **Responsive design** | Mobile-optimized layout with slide-in sidebar |
| **Accessible** | Semantic HTML, ARIA labels, keyboard navigation, visible focus states |
| **Study Debt** | Defined as overdue + postponed tasks; shown in dashboard, analytics, and assistant |

### 🔬 Prototype / labeled demo

| Feature | Status |
|---|---|
| **AI insights** | Rule-based, labeled "AI Insights Preview" |
| **Daily plan generation** | Deterministic scoring, labeled "Rule-based prototype" |
| **Goal plan breakdown** | Generates suggested task list for review before creating |
| **Session insights** | Only generated from real recorded data; empty state shown if insufficient |
| **"How FocusMate Adapts"** | Visible in Focus Mode sidebar explaining the intended feedback loop |

### 🔮 Planned (future backend/AI integration)

- Real ML recommendation model trained on student behavior
- Cloud sync and multi-device support
- Backend API for real AI assistant responses
- Exam Mode with syllabus coverage tracking
- Energy-aware scheduling (cognitive demand × preferred period)
- Collaborative study plans

---

## Architecture

```
focusmate/
├── index.html           — Entry point, loads Tailwind + Inter + app.js
├── css/
│   └── styles.css       — Design tokens, component library, responsive styles
└── js/
    ├── app.js           — Router, dashboard, event orchestration
    ├── state.js         — Shared mutable application state
    ├── storage.js       — localStorage read/write with defaults and migration
    ├── recommend.js     — Rule-based recommendation engine (pure functions)
    ├── ui.js            — Layout, icons, modal, toast, badge helpers
    ├── tasks.js         — Task CRUD, filters, sorting, task detail modal
    ├── planner.js       — Study plans, daily adaptive plan, rebalancing
    ├── timer.js         — Pomodoro timer, session recording, rating prompt
    ├── goals.js         — Goal CRUD, progress, plan generation
    ├── analytics.js     — Metrics, charts, insights
    ├── assistant.js     — Rule-based assistant with 6 action workflows
    └── settings.js      — Profile, timer, study prefs, data management
```

### Key design decisions

**No framework:** Pure vanilla JS ES modules. No build step, no bundler, no React. Tailwind via CDN for utility classes; custom CSS for tokens and components.

**Central state:** `state.js` exports a single mutable object. All modules import it and call `saveData(state)` after mutations.

**Storage abstraction:** All reads/writes go through `storage.js`. No raw `localStorage` calls in feature modules.

**Recommendation engine:** `recommend.js` contains only pure functions. It reads state but never mutates it. This makes the logic testable and replaceable by a real ML service.

**Honest AI:** Every prototype capability is labeled. No feature falsely claims real AI/ML, model training, or cloud persistence.

---

## Data model

```js
// Task
{
  id, title, description, priority,  // High | Medium | Low
  status,                             // Todo | In Progress | Completed
  dueDate, category, estimatedMinutes,
  goalId,                             // links to a goal
  postponeCount, createdAt, completedAt
}

// Goal
{ id, title, description, category, deadline, progress }

// StudyPlan
{ id, subject, target, topics: [{ id, name, completed }] }

// FocusSession
{ id, taskId, subject, planned, actual, type, date, rating }

// Settings
{ displayName, focusDuration, shortBreak, longBreak,
  notifications, availableHours, preferredPeriod }
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Markup | HTML5 semantic elements |
| Styling | Tailwind CSS CDN + custom CSS (design tokens) |
| Logic | Vanilla JavaScript ES modules |
| Persistence | Browser localStorage |
| Fonts | Google Fonts — Inter |

---

## Known limitations

- Data is local to the browser — no cloud sync, no account system
- No real AI/ML model — all "intelligence" is deterministic rule-based logic
- No offline service worker
- Timer state is not preserved across hard refreshes (session restores from last save)
- No import/export of data yet (planned)

---

## Future AI/ML implementation plan

1. **Recommendation engine:** Train a model on student task completion patterns. Features: days-until-due, priority, postpone count, session history, goal proximity.
2. **Scheduling service:** Constraint-based optimizer to fit tasks into available time windows.
3. **Analytics service:** Cluster sessions by time-of-day to discover peak focus patterns.
4. **Assistant backend:** Connect to Gemini/GPT API for natural language planning and breakdown.
5. **Architecture:** `Web Frontend → REST API → PostgreSQL → Recommendation Service → Optional ML model`

No ML should be added until a clear prediction target, evaluation metric, and sufficient data are defined.

---

## License

FSD Project — academic portfolio. Not licensed for commercial use.
