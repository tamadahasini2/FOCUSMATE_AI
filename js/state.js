export const state = {
  currentPage: location.hash.replace("#", "") || "dashboard",
  tasks: [],
  goals: [],
  studyPlans: [],
  focusSessions: [],    // recorded sessions: { id, taskId, subject, planned, actual, type, date, rating }
  exams: [],            // { id, subject, date, topics: [{id, name, completed, difficulty}], studyHours }
  settings: {
    displayName: "Goutham",
    focusDuration: 25,
    shortBreak: 5,
    longBreak: 15,
    notifications: true,
    availableHours: 4,
    preferredPeriod: "morning"  // morning | afternoon | evening
  },
  timer: {
    mode: "focus",      // focus | short | long
    remaining: 25 * 60,
    running: false,
    sessions: 0,
    totalFocusSeconds: 0,
    interval: null,
    linkedTaskId: null,
    sessionStart: null
  }
};