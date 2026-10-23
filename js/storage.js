const KEY = "focusmate-ai-v2";

function todayStr() { return new Date().toISOString().slice(0, 10); }
function daysFrom(n) { return new Date(Date.now() + n * 86400000).toISOString().slice(0, 10); }

const defaults = {
  tasks: [
    {
      id: crypto.randomUUID(),
      title: "Complete JavaScript revision",
      description: "Review modern JS fundamentals: closures, promises, async/await, and array methods.",
      priority: "High", status: "In Progress",
      dueDate: todayStr(), category: "Development",
      estimatedMinutes: 60, goalId: null,
      postponeCount: 0, createdAt: new Date().toISOString(), completedAt: null
    },
    {
      id: crypto.randomUUID(),
      title: "Solve 5 Binary Search Problems",
      description: "Practice recognition of classic binary-search patterns on LeetCode.",
      priority: "High", status: "Todo",
      dueDate: todayStr(), category: "DSA",
      estimatedMinutes: 45, goalId: null,
      postponeCount: 0, createdAt: new Date().toISOString(), completedAt: null
    },
    {
      id: crypto.randomUUID(),
      title: "Finish DBMS assignment",
      description: "Complete relational algebra queries and normalization up to 3NF.",
      priority: "Medium", status: "Todo",
      dueDate: daysFrom(1), category: "College",
      estimatedMinutes: 90, goalId: null,
      postponeCount: 1, createdAt: new Date().toISOString(), completedAt: null
    },
    {
      id: crypto.randomUUID(),
      title: "Prepare ML presentation",
      description: "Finalize K-means clustering slides with visual examples and talking points.",
      priority: "Medium", status: "Todo",
      dueDate: daysFrom(2), category: "ML",
      estimatedMinutes: 75, goalId: null,
      postponeCount: 0, createdAt: new Date().toISOString(), completedAt: null
    },
    {
      id: crypto.randomUUID(),
      title: "Read system design notes",
      description: "Review load balancing, caching, and database sharding fundamentals.",
      priority: "Low", status: "Completed",
      dueDate: daysFrom(-1), category: "Interview",
      estimatedMinutes: 30, goalId: null,
      postponeCount: 0, createdAt: new Date().toISOString(),
      completedAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: crypto.randomUUID(),
      title: "Two Pointers practice",
      description: "Solve 5 two-pointer problems focusing on the shrink/expand pattern.",
      priority: "Medium", status: "Todo",
      dueDate: daysFrom(3), category: "DSA",
      estimatedMinutes: 45, goalId: null,
      postponeCount: 0, createdAt: new Date().toISOString(), completedAt: null
    }
  ],
  goals: [
    {
      id: crypto.randomUUID(),
      title: "Complete DSA roadmap",
      description: "Build strong pattern recognition across core DSA topics for interviews.",
      progress: 42, deadline: daysFrom(45), category: "DSA"
    },
    {
      id: crypto.randomUUID(),
      title: "Build portfolio project",
      description: "Finish FocusMate AI and document the architecture for showcasing.",
      progress: 68, deadline: daysFrom(25), category: "Development"
    },
    {
      id: crypto.randomUUID(),
      title: "Prepare for interviews",
      description: "Practice DSA, CS fundamentals, system design and project discussions.",
      progress: 31, deadline: daysFrom(75), category: "Interview"
    }
  ],
  studyPlans: [
    {
      id: crypto.randomUUID(), subject: "JavaScript", target: "Master modern JavaScript",
      topics: [
        { id: crypto.randomUUID(), name: "Variables & scope", completed: true },
        { id: crypto.randomUUID(), name: "Functions", completed: true },
        { id: crypto.randomUUID(), name: "Arrays & objects", completed: true },
        { id: crypto.randomUUID(), name: "DOM manipulation", completed: false },
        { id: crypto.randomUUID(), name: "Async JavaScript", completed: false }
      ]
    },
    {
      id: crypto.randomUUID(), subject: "DSA", target: "Pattern-based interview preparation",
      topics: [
        { id: crypto.randomUUID(), name: "Binary Search", completed: true },
        { id: crypto.randomUUID(), name: "Two Pointers", completed: false },
        { id: crypto.randomUUID(), name: "Sliding Window", completed: false },
        { id: crypto.randomUUID(), name: "Trees & Graphs", completed: false }
      ]
    }
  ],
  focusSessions: [
    {
      id: crypto.randomUUID(), taskId: null, subject: "DSA",
      planned: 25, actual: 25, type: "focus",
      date: daysFrom(-1), rating: 4
    },
    {
      id: crypto.randomUUID(), taskId: null, subject: "JavaScript",
      planned: 25, actual: 20, type: "focus",
      date: daysFrom(-2), rating: 3
    },
    {
      id: crypto.randomUUID(), taskId: null, subject: "DSA",
      planned: 25, actual: 25, type: "focus",
      date: daysFrom(-3), rating: 5
    }
  ],
  exams: [],
  dailyPlan: [],
  settings: {
    displayName: "Goutham",
    focusDuration: 25, shortBreak: 5, longBreak: 15,
    notifications: true, availableHours: 4, preferredPeriod: "morning"
  }
};

export function loadData() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const initial = structuredClone(defaults);
      saveData(initial);
      return initial;
    }
    // Merge stored data with defaults to handle newly added fields
    const stored = JSON.parse(raw);
    const defaultTimer = {
      mode: "focus", remaining: (stored.settings?.focusDuration || 25) * 60,
      running: false, sessions: 0, totalFocusSeconds: 0,
      interval: null, linkedTaskId: null, sessionStart: null
    };
    return {
      ...structuredClone(defaults),
      ...stored,
      settings: { ...defaults.settings, ...stored.settings },
      timer: stored.timer
        ? { ...defaultTimer, ...stored.timer, running: false, interval: null }
        : defaultTimer
    };
  } catch {
    return structuredClone(defaults);
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("localStorage write failed:", e);
  }
}

export function resetData() {
  localStorage.removeItem(KEY);
  return loadData();
}