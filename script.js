function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

function getLoggedInUsername() {
    return localStorage.getItem("loggedInUser");
}

function getCurrentUser(users) {
    const username = getLoggedInUsername();
    return users.find((user) => user.username === username);
}

function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
}

function todayString() {
    return new Date().toISOString().split("T")[0];
}

function ensureUserShape(user) {
    if (!Array.isArray(user.tasks)) user.tasks = [];
    if (!Array.isArray(user.habits)) user.habits = [];
    if (!user.settings) {
        user.settings = {
            theme: "dark",
            dailyGoal: 5
        };
    }
    if (!user.settings.theme) user.settings.theme = "dark";
    if (!user.settings.dailyGoal) user.settings.dailyGoal = 5;

    user.tasks = user.tasks.map((task) => ({
        id: task.id || Date.now() + Math.floor(Math.random() * 10000),
        name: task.name || "Untitled Task",
        deadline: task.deadline || todayString(),
        priority: task.priority || "Medium",
        category: task.category || "Study",
        completed: !!task.completed,
        completedDate: task.completedDate || null,
        createdAt: task.createdAt || new Date().toISOString()
    }));

    user.habits = user.habits.map((habit) => ({
        id: habit.id || Date.now() + Math.floor(Math.random() * 10000),
        name: habit.name || "Untitled Habit",
        history: habit.history || (habit.lastCompletedDate ? { [habit.lastCompletedDate]: 1 } : {}),
        streak: habit.streak || 0,
        longestStreak: habit.longestStreak || habit.streak || 0,
        createdAt: habit.createdAt || new Date().toISOString()
    }));
}

function requireAuth() {
    const username = getLoggedInUsername();
    if (!username) {
        window.location.href = "index.html";
        return null;
    }

    const users = getUsers();
    const user = getCurrentUser(users);
    if (!user) {
        localStorage.removeItem("loggedInUser");
        window.location.href = "index.html";
        return null;
    }

    ensureUserShape(user);
    saveUsers(users);

    return { users, user };
}

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme || "dark");
}

function setActiveNav(page) {
    document.querySelectorAll(".nav-link").forEach((link) => {
        if (link.dataset.nav === page) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}

function getAppState() {
    const users = getUsers();
    const user = getCurrentUser(users);
    if (!user) return null;
    ensureUserShape(user);
    return { users, user };
}

function saveAppState(users) {
    saveUsers(users);
}

function addTaskForCurrentUser(payload) {
    const state = getAppState();
    if (!state) return;

    const { users, user } = state;
    user.tasks.push({
        id: Date.now() + Math.floor(Math.random() * 10000),
        name: payload.name,
        deadline: payload.deadline,
        priority: payload.priority,
        category: payload.category,
        completed: false,
        completedDate: null,
        createdAt: new Date().toISOString()
    });

    saveAppState(users);
}

function toggleTaskById(taskId) {
    const state = getAppState();
    if (!state) return;

    const { users, user } = state;
    const task = user.tasks.find((item) => item.id === Number(taskId));
    if (!task) return;

    task.completed = !task.completed;
    task.completedDate = task.completed ? todayString() : null;
    saveAppState(users);

    refreshCurrentPage();
}

function deleteTaskById(taskId) {
    const state = getAppState();
    if (!state) return;

    const { users, user } = state;
    user.tasks = user.tasks.filter((item) => item.id !== Number(taskId));
    saveAppState(users);

    refreshCurrentPage();
}

function editTaskById(taskId) {
    const state = getAppState();
    if (!state) return;

    const { users, user } = state;
    const task = user.tasks.find((item) => item.id === Number(taskId));
    if (!task) return;

    const newName = prompt("Edit Task Name:", task.name);
    if (newName === null) return;

    const cleanedName = newName.trim();
    if (!cleanedName) {
        alert("Task name cannot be empty.");
        return;
    }

    const newDeadline = prompt("Edit Task Deadline (YYYY-MM-DD):", task.deadline);
    if (newDeadline === null) return;

    const dateValue = newDeadline.trim();
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(dateValue) || Number.isNaN(new Date(dateValue).getTime())) {
        alert("Please enter a valid date in YYYY-MM-DD format.");
        return;
    }

    task.name = cleanedName;
    task.deadline = dateValue;

    saveAppState(users);
    refreshCurrentPage();
}

function getTaskPriorityClass(priority) {
    if (priority === "High") return "high";
    if (priority === "Low") return "low";
    return "medium";
}

function renderTaskList(elementId, tasks, includeMeta) {
    const list = document.getElementById(elementId);
    if (!list) return;

    list.innerHTML = "";

    if (!tasks.length) {
        list.innerHTML = '<li class="empty">No tasks found.</li>';
        return;
    }

    const today = todayString();

    tasks.forEach((task) => {
        const item = document.createElement("li");
        const priorityClass = getTaskPriorityClass(task.priority);
        const overdueClass = !task.completed && task.deadline < today ? "overdue" : "";
        const completedClass = task.completed ? "completed" : "";

        item.className = "task-item " + priorityClass + " " + overdueClass + " " + completedClass;
        item.innerHTML = `
            <div class="item-main">
                <p class="item-title">${task.name}</p>
                ${includeMeta ? `<p class="item-meta">${task.category} | ${task.priority} | Due ${task.deadline}</p>` : `<p class="item-meta">Due ${task.deadline}</p>`}
            </div>
            <div class="item-actions">
                <button class="mini-btn" onclick="toggleTaskById(${task.id})">${task.completed ? "Undo" : "Done"}</button>
                <button class="mini-btn" onclick="editTaskById(${task.id})">Edit</button>
                <button class="mini-btn danger" onclick="deleteTaskById(${task.id})">Delete</button>
            </div>
        `;

        list.appendChild(item);
    });
}

function addHabitForCurrentUser(habitName) {
    const state = getAppState();
    if (!state) return;

    const { users, user } = state;
    user.habits.push({
        id: Date.now() + Math.floor(Math.random() * 10000),
        name: habitName,
        history: {},
        streak: 0,
        longestStreak: 0,
        createdAt: new Date().toISOString()
    });

    saveAppState(users);
}

function getHabitStreakFromHistory(history) {
    const dates = Object.keys(history || {}).sort();
    if (!dates.length) {
        return { current: 0, longest: 0 };
    }

    const dateSet = new Set(dates);

    let current = 0;
    let cursor = new Date();
    while (true) {
        const key = cursor.toISOString().split("T")[0];
        if (dateSet.has(key)) {
            current += 1;
            cursor.setDate(cursor.getDate() - 1);
        } else {
            break;
        }
    }

    let longest = 0;
    let run = 0;
    let previousDate = null;

    dates.forEach((value) => {
        const currentDate = new Date(value + "T00:00:00");
        if (!previousDate) {
            run = 1;
        } else {
            const diffDays = Math.round((currentDate - previousDate) / (1000 * 60 * 60 * 24));
            run = diffDays === 1 ? run + 1 : 1;
        }
        previousDate = currentDate;
        if (run > longest) longest = run;
    });

    return { current, longest };
}

function toggleHabitTodayById(habitId) {
    const state = getAppState();
    if (!state) return;

    const { users, user } = state;
    const habit = user.habits.find((item) => item.id === Number(habitId));
    if (!habit) return;

    const today = todayString();
    if (habit.history[today]) {
        delete habit.history[today];
    } else {
        habit.history[today] = 1;
    }

    const streakInfo = getHabitStreakFromHistory(habit.history);
    habit.streak = streakInfo.current;
    habit.longestStreak = streakInfo.longest;

    saveAppState(users);
    refreshCurrentPage();
}

function editHabitById(habitId) {
    const state = getAppState();
    if (!state) return;

    const { users, user } = state;
    const habit = user.habits.find((item) => item.id === Number(habitId));
    if (!habit) return;

    const newName = prompt("Edit Habit Name:", habit.name);
    if (newName === null) return;

    const cleanedName = newName.trim();
    if (!cleanedName) return;

    habit.name = cleanedName;
    saveAppState(users);

    refreshCurrentPage();
}

function deleteHabitById(habitId) {
    const state = getAppState();
    if (!state) return;

    const { users, user } = state;
    user.habits = user.habits.filter((item) => item.id !== Number(habitId));
    saveAppState(users);

    refreshCurrentPage();
}

function renderHabitsList(elementId) {
    const list = document.getElementById(elementId);
    if (!list) return;

    const state = getAppState();
    if (!state) return;

    const { user } = state;
    list.innerHTML = "";

    if (!user.habits.length) {
        list.innerHTML = '<li class="empty">No habits yet.</li>';
        return;
    }

    const today = todayString();

    user.habits.forEach((habit) => {
        const doneToday = !!habit.history[today];
        const item = document.createElement("li");
        item.className = "habit-item " + (doneToday ? "habit-done" : "");
        item.innerHTML = `
            <div class="item-main">
                <p class="item-title">${habit.name}</p>
                <p class="item-meta">Current streak: ${habit.streak} days | Longest: ${habit.longestStreak} days</p>
            </div>
            <div class="item-actions">
                <button class="mini-btn" onclick="toggleHabitTodayById(${habit.id})">${doneToday ? "Undo Today" : "Mark Today"}</button>
                <button class="mini-btn" onclick="editHabitById(${habit.id})">Edit</button>
                <button class="mini-btn danger" onclick="deleteHabitById(${habit.id})">Delete</button>
            </div>
        `;

        list.appendChild(item);
    });
}

function buildHeatmapData(user) {
    const map = {};
    user.habits.forEach((habit) => {
        Object.keys(habit.history || {}).forEach((dateKey) => {
            map[dateKey] = (map[dateKey] || 0) + 1;
        });
    });
    return map;
}

function renderHeatmap() {
    const target = document.getElementById("heatmapGrid");
    if (!target) return;

    const state = getAppState();
    if (!state) return;

    const { user } = state;
    const heat = buildHeatmapData(user);
    const maxValue = Math.max(1, ...Object.values(heat));

    target.innerHTML = "";

    // Generate calendar for last 12 months
    const today = new Date();
    const startDate = new Date(today);
    startDate.setFullYear(startDate.getFullYear() - 1);

    const monthsContainer = document.createElement("div");
    monthsContainer.className = "calendar-container";

    const months = [];
    for (let i = 0; i < 12; i++) {
        const monthDate = new Date(startDate);
        monthDate.setMonth(monthDate.getMonth() + i);
        months.push(monthDate);
    }

    months.forEach((monthDate) => {
        const monthContainer = document.createElement("div");
        monthContainer.className = "calendar-month";

        const monthLabel = document.createElement("h4");
        monthLabel.className = "month-label";
        const monthName = monthDate.toLocaleString('default', { month: 'short', year: 'numeric' });
        monthLabel.textContent = monthName;
        monthContainer.appendChild(monthLabel);

        const grid = document.createElement("div");
        grid.className = "calendar-grid";

        // Week day headers
        const weekLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        weekLabels.forEach((day) => {
            const label = document.createElement("div");
            label.className = "week-label";
            label.textContent = day;
            grid.appendChild(label);
        });

        const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        // Empty cells before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            const empty = document.createElement("div");
            empty.className = "calendar-cell empty";
            grid.appendChild(empty);
        }

        // Days in month
        for (let day = 1; day <= daysInMonth; day++) {
            const cellDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
            const key = cellDate.toISOString().split("T")[0];
            const value = heat[key] || 0;

            let level = 0;
            if (value > 0 && value <= Math.ceil(maxValue * 0.25)) level = 1;
            else if (value <= Math.ceil(maxValue * 0.5)) level = 2;
            else if (value <= Math.ceil(maxValue * 0.75)) level = 3;
            else if (value > 0) level = 4;

            const box = document.createElement("div");
            box.className = "calendar-cell level-" + level;
            box.title = key + " | Completed: " + value + " habit(s)";
            box.textContent = day;
            grid.appendChild(box);
        }

        monthContainer.appendChild(grid);
        monthsContainer.appendChild(monthContainer);
    });

    target.appendChild(monthsContainer);
}

function getWeekDates() {
    const result = [];
    for (let i = 6; i >= 0; i -= 1) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        result.push(d.toISOString().split("T")[0]);
    }
    return result;
}

function getAnalyticsSummary(user) {
    const totalTasks = user.tasks.length;
    const completedTasks = user.tasks.filter((task) => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;

    const today = todayString();
    const habitsDoneToday = user.habits.filter((habit) => habit.history[today]).length;

    const bestStreak = user.habits.reduce((max, habit) => Math.max(max, habit.longestStreak || 0), 0);

    return {
        totalTasks,
        completedTasks,
        pendingTasks,
        habitsDoneToday,
        bestStreak
    };
}

function renderDashboardPage() {
    const state = getAppState();
    if (!state) return;

    const { user } = state;
    const summary = getAnalyticsSummary(user);

    const nameTarget = document.getElementById("userDisplay");
    if (nameTarget) nameTarget.textContent = user.username;

    const metricTotalTasks = document.getElementById("metricTotalTasks");
    const metricCompletedTasks = document.getElementById("metricCompletedTasks");
    const metricHabits = document.getElementById("metricHabits");
    const metricBestStreak = document.getElementById("metricBestStreak");

    if (metricTotalTasks) metricTotalTasks.textContent = summary.totalTasks;
    if (metricCompletedTasks) metricCompletedTasks.textContent = summary.completedTasks;
    if (metricHabits) metricHabits.textContent = user.habits.length;
    if (metricBestStreak) metricBestStreak.textContent = summary.bestStreak;

    const today = todayString();
    const tasksToday = user.tasks.filter((task) => task.deadline === today && !task.completed);
    renderTaskList("todayTaskList", tasksToday, false);

    const habitSummaryList = document.getElementById("habitSummaryList");
    if (habitSummaryList) {
        habitSummaryList.innerHTML = "";
        if (!user.habits.length) {
            habitSummaryList.innerHTML = '<li class="empty">No habits yet.</li>';
        } else {
            user.habits.slice(0, 5).forEach((habit) => {
                const item = document.createElement("li");
                const done = habit.history[today] ? "Done" : "Pending";
                item.className = "habit-item";
                item.innerHTML = `<div class="item-main"><p class="item-title">${habit.name}</p><p class="item-meta">Today: ${done} | Streak: ${habit.streak}</p></div>`;
                habitSummaryList.appendChild(item);
            });
        }
    }

    const weekDates = getWeekDates();
    const weekTasks = user.tasks.filter((task) => weekDates.includes(task.deadline));
    const weekDone = weekTasks.filter((task) => task.completed).length;
    const weekPercent = weekTasks.length ? Math.round((weekDone / weekTasks.length) * 100) : 0;

    const weeklyProgressFill = document.getElementById("weeklyProgressFill");
    const weeklyProgressText = document.getElementById("weeklyProgressText");

    if (weeklyProgressFill) weeklyProgressFill.style.width = weekPercent + "%";
    if (weeklyProgressText) weeklyProgressText.textContent = weekPercent + "% completion this week";
}

function addQuickTask() {
    const name = document.getElementById("quickTaskName").value.trim();
    const deadline = document.getElementById("quickTaskDeadline").value;
    const priority = document.getElementById("quickTaskPriority").value;
    const category = document.getElementById("quickTaskCategory").value;

    if (!name || !deadline) {
        alert("Please enter task name and deadline.");
        return;
    }

    addTaskForCurrentUser({ name, deadline, priority, category });

    document.getElementById("quickTaskName").value = "";
    document.getElementById("quickTaskDeadline").value = "";

    renderDashboardPage();
}

function renderTasksPage() {
    const state = getAppState();
    if (!state) return;

    const { user } = state;
    const filter = document.getElementById("taskFilter") ? document.getElementById("taskFilter").value : "all";

    let tasks = [...user.tasks].sort((a, b) => (a.completed === b.completed ? a.deadline.localeCompare(b.deadline) : a.completed - b.completed));

    if (filter === "pending") tasks = tasks.filter((task) => !task.completed);
    if (filter === "completed") tasks = tasks.filter((task) => task.completed);
    if (filter === "high") tasks = tasks.filter((task) => task.priority === "High");

    renderTaskList("tasksPageList", tasks, true);
}

function addTaskFromTasksPage() {
    const name = document.getElementById("taskNameInput").value.trim();
    const deadline = document.getElementById("taskDeadlineInput").value;
    const priority = document.getElementById("taskPriorityInput").value;
    const category = document.getElementById("taskCategoryInput").value;

    if (!name || !deadline) {
        alert("Please enter task name and deadline.");
        return;
    }

    addTaskForCurrentUser({ name, deadline, priority, category });

    document.getElementById("taskNameInput").value = "";
    document.getElementById("taskDeadlineInput").value = "";

    renderTasksPage();
}

function renderHabitsPage() {
    renderHabitsList("habitsPageList");
    renderHeatmap();
}

function addHabitFromHabitsPage() {
    const input = document.getElementById("habitNameInput");
    if (!input) return;

    const name = input.value.trim();
    if (!name) {
        alert("Please enter a habit name.");
        return;
    }

    addHabitForCurrentUser(name);
    input.value = "";
    renderHabitsPage();
}

function renderAnalyticsPage() {
    const state = getAppState();
    if (!state) return;

    const { user } = state;
    const summary = getAnalyticsSummary(user);

    const percent = summary.totalTasks ? Math.round((summary.completedTasks / summary.totalTasks) * 100) : 0;
    const ring = document.getElementById("completionRing");
    const ringText = document.getElementById("completionRingText");
    if (ring) ring.style.setProperty("--percent", percent);
    if (ringText) ringText.textContent = percent + "%";

    const streakList = document.getElementById("streakList");
    if (streakList) {
        streakList.innerHTML = "";
        if (!user.habits.length) {
            streakList.innerHTML = '<li class="empty">No habit streaks yet.</li>';
        } else {
            user.habits.forEach((habit) => {
                const item = document.createElement("li");
                item.className = "habit-item";
                item.innerHTML = `<div class="item-main"><p class="item-title">${habit.name}</p><p class="item-meta">Current: ${habit.streak} | Best: ${habit.longestStreak}</p></div>`;
                streakList.appendChild(item);
            });
        }
    }

    const weekDates = getWeekDates();
    const bars = document.getElementById("weeklyBars");
    if (bars) {
        bars.innerHTML = "";
        weekDates.forEach((dateKey) => {
            const taskScore = user.tasks.filter((task) => task.completedDate === dateKey).length;
            const habitScore = user.habits.filter((habit) => habit.history[dateKey]).length;
            const score = taskScore + habitScore;

            const bar = document.createElement("div");
            bar.className = "bar-col";
            bar.innerHTML = `
                <div class="bar" style="height:${Math.min(100, score * 15)}%"></div>
                <span>${dateKey.slice(5)}</span>
            `;
            bars.appendChild(bar);
        });
    }
}

function renderSettingsPage() {
    const state = getAppState();
    if (!state) return;

    const { user } = state;

    const usernameTarget = document.getElementById("settingsUsername");
    if (usernameTarget) usernameTarget.textContent = user.username;

    const themeSelect = document.getElementById("themeSelect");
    const dailyGoalInput = document.getElementById("dailyGoalInput");

    if (themeSelect) themeSelect.value = user.settings.theme || "dark";
    if (dailyGoalInput) dailyGoalInput.value = user.settings.dailyGoal || 5;
}

function saveSettingsPage() {
    const state = getAppState();
    if (!state) return;

    const { users, user } = state;
    const theme = document.getElementById("themeSelect").value;
    const dailyGoal = Number(document.getElementById("dailyGoalInput").value || 5);

    user.settings.theme = theme;
    user.settings.dailyGoal = Math.min(20, Math.max(1, dailyGoal));

    saveAppState(users);
    applyTheme(theme);
    alert("Settings saved.");
}

function resetMyData() {
    const ok = confirm("This will delete all your tasks and habits. Continue?");
    if (!ok) return;

    const state = getAppState();
    if (!state) return;

    const { users, user } = state;
    user.tasks = [];
    user.habits = [];

    saveAppState(users);
    alert("Your data has been reset.");
    refreshCurrentPage();
}

function refreshCurrentPage() {
    const page = document.body.dataset.page;
    if (page === "dashboard") renderDashboardPage();
    if (page === "tasks") renderTasksPage();
    if (page === "habits") renderHabitsPage();
    if (page === "analytics") renderAnalyticsPage();
    if (page === "settings") renderSettingsPage();
}

function initProtectedPage() {
    const authState = requireAuth();
    if (!authState) return;

    const page = document.body.dataset.page;
    setActiveNav(page);
    applyTheme(authState.user.settings.theme);

    refreshCurrentPage();
}

document.addEventListener("DOMContentLoaded", () => {
    if (!document.body || !document.body.dataset.page) return;

    const page = document.body.dataset.page;
    const protectedPages = ["dashboard", "tasks", "habits", "analytics", "settings"];

    if (protectedPages.includes(page)) {
        initProtectedPage();
    }
});

function loadDashboard() {
    refreshCurrentPage();
}

function addTask() {
    addQuickTask();
}

function displayTasks() {
    refreshCurrentPage();
}

function addHabit() {
    addHabitFromHabitsPage();
}

function displayHabits() {
    refreshCurrentPage();
}

function editTask(index) {
    const state = getAppState();
    if (!state) return;
    const task = state.user.tasks[index];
    if (task) editTaskById(task.id);
}

function deleteTask(index) {
    const state = getAppState();
    if (!state) return;
    const task = state.user.tasks[index];
    if (task) deleteTaskById(task.id);
}

function toggleTask(index) {
    const state = getAppState();
    if (!state) return;
    const task = state.user.tasks[index];
    if (task) toggleTaskById(task.id);
}

function completeHabit(index) {
    const state = getAppState();
    if (!state) return;
    const habit = state.user.habits[index];
    if (habit) toggleHabitTodayById(habit.id);
}

function editHabit(index) {
    const state = getAppState();
    if (!state) return;
    const habit = state.user.habits[index];
    if (habit) editHabitById(habit.id);
}

function deleteHabit(index) {
    const state = getAppState();
    if (!state) return;
    const habit = state.user.habits[index];
    if (habit) deleteHabitById(habit.id);
}
