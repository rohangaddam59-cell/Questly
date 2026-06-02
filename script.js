const starterTasks = [
    {
        title: "Write an adventure story",
        category: "Writing",
        difficulty: "Easy",
        xp: 20,
        text: "Write a 150-word adventure story about Marie and Henry's tomato farm. Use the words mysterious, explorer, and cave at least 3 times each.",
        help: "Adventure stories usually start with normal life, add a surprising problem, send the characters into danger or discovery, and end with a clear result. Make the problem specific and give the ending a strong moment."
    },
    {
        title: "Organize one computer folder",
        category: "Computer skill",
        difficulty: "Easy",
        xp: 15,
        text: "Open one messy folder on your computer and organize at least 10 files into better folders.",
        help: "Start with broad groups like School, Images, Downloads, Projects, and Old. Do not delete anything unless you are sure you do not need it."
    },
    {
        title: "Learn three words",
        category: "Language",
        difficulty: "Easy",
        xp: 15,
        text: "Learn 3 new English words and write one sentence for each word.",
        help: "A good sentence should prove you understand the word. Try to make each sentence about a different situation."
    },
    {
        title: "Research a science idea",
        category: "Research",
        difficulty: "Medium",
        xp: 25,
        text: "Research how volcanoes form and explain it in 4 simple sentences.",
        help: "Use your own words. A useful structure is: what happens underground, what pressure does, how lava reaches the surface, and what a volcano becomes."
    },
    {
        title: "Take a focus walk",
        category: "Real world",
        difficulty: "Easy",
        xp: 15,
        text: "Go for a 10 minute walk. When you come back, write 2 sentences about what you noticed.",
        help: "The goal is not exercise perfection. The goal is to reset your attention and notice details around you."
    },
    {
        title: "Practice Task Manager",
        category: "Computer skill",
        difficulty: "Medium",
        xp: 20,
        text: "Open Task Manager and find one app using memory or CPU. Do not close anything important. Write what you noticed.",
        help: "Task Manager shows what is running on your computer. Only end apps you recognize and intentionally opened."
    }
];

const state = {
    tasks: load("learningQuestTasks", starterTasks),
    currentTask: load("learningQuestCurrentTask", null),
    xp: load("learningQuestXp", 0),
    history: load("learningQuestHistory", []),
    postponed: load("learningQuestPostponed", [])
};

const elements = {
    xpValue: document.getElementById("xpValue"),
    levelValue: document.getElementById("levelValue"),
    taskCategory: document.getElementById("taskCategory"),
    taskTitle: document.getElementById("taskTitle"),
    taskDifficulty: document.getElementById("taskDifficulty"),
    taskText: document.getElementById("taskText"),
    taskHelp: document.getElementById("taskHelp"),
    submission: document.getElementById("submission"),
    feedback: document.getElementById("feedback"),
    historyList: document.getElementById("historyList"),
    postponedList: document.getElementById("postponedList"),
    customTask: document.getElementById("customTask"),
    customHelp: document.getElementById("customHelp"),
    postponeDialog: document.getElementById("postponeDialog"),
    postponeTime: document.getElementById("postponeTime")
};

document.getElementById("generateBtn").addEventListener("click", generateTask);
document.getElementById("reviewBtn").addEventListener("click", reviewWork);
document.getElementById("completeBtn").addEventListener("click", completeTask);
document.getElementById("cantNowBtn").addEventListener("click", openPostponeDialog);
document.getElementById("addTaskBtn").addEventListener("click", addCustomTask);
document.getElementById("savePostponeBtn").addEventListener("click", savePostponedTask);

render();

function generateTask() {
    const availableTasks = state.tasks.filter((task) => {
        return !state.postponed.some((item) => item.title === task.title);
    });
    const pool = availableTasks.length > 0 ? availableTasks : state.tasks;
    state.currentTask = pool[Math.floor(Math.random() * pool.length)];
    elements.submission.value = "";
    elements.feedback.textContent = "Task loaded. Read the help, do the challenge, then paste your work for review.";
    save("learningQuestCurrentTask", state.currentTask);
    render();
}

function reviewWork() {
    if (!state.currentTask) {
        elements.feedback.textContent = "Generate a task first, then I can review what you write.";
        return;
    }

    const answer = elements.submission.value.trim();
    if (answer.length < 20) {
        elements.feedback.innerHTML = "<strong>Needs more work:</strong> Write a bit more so there is enough to review.";
        return;
    }

    const checks = [];
    const wordCount = answer.split(/\s+/).length;
    checks.push(wordCount >= 50 ? "Good length for a first answer." : "Try adding more detail.");

    if (state.currentTask.category === "Writing") {
        checks.push(checkRepeatedWords(answer, ["mysterious", "explorer", "cave"]));
        checks.push(answer.includes(".") ? "You used sentence endings." : "Add clear sentence endings.");
    } else if (state.currentTask.category === "Research") {
        checks.push(wordCount >= 35 ? "Your explanation has enough room for detail." : "Add one more sentence explaining the idea.");
    } else {
        checks.push("You described what you did, which is useful for tracking progress.");
    }

    elements.feedback.innerHTML = `<strong>Review:</strong><br>${checks.join("<br>")}`;
}

function completeTask() {
    if (!state.currentTask) {
        elements.feedback.textContent = "Generate a task before completing one.";
        return;
    }

    state.xp += state.currentTask.xp;
    state.history.unshift({
        title: state.currentTask.title,
        category: state.currentTask.category,
        xp: state.currentTask.xp,
        completedAt: new Date().toLocaleString()
    });
    state.history = state.history.slice(0, 8);
    state.currentTask = null;
    elements.submission.value = "";
    elements.feedback.textContent = "Nice. XP added. Generate another task when you want the next challenge.";
    persistAll();
    render();
}

function openPostponeDialog() {
    if (!state.currentTask) {
        elements.feedback.textContent = "Generate a task first, then you can postpone it.";
        return;
    }
    elements.postponeTime.value = "";
    elements.postponeDialog.showModal();
}

function savePostponedTask() {
    if (!state.currentTask) {
        return;
    }

    const time = elements.postponeTime.value.trim() || "later";
    state.postponed.unshift({
        title: state.currentTask.title,
        category: state.currentTask.category,
        time
    });
    state.postponed = state.postponed.slice(0, 8);
    state.currentTask = null;
    elements.feedback.textContent = `Task postponed until ${time}. Generate another task when you are ready.`;
    persistAll();
    render();
}

function addCustomTask() {
    const title = elements.customTask.value.trim();
    if (!title) {
        elements.feedback.textContent = "Write a task name first.";
        return;
    }

    state.tasks.push({
        title,
        category: "Custom",
        difficulty: "Custom",
        xp: 15,
        text: title,
        help: elements.customHelp.value.trim() || "Break the task into one small first step, then finish it before starting something else."
    });

    elements.customTask.value = "";
    elements.customHelp.value = "";
    save("learningQuestTasks", state.tasks);
    elements.feedback.textContent = "Custom task added. It can now appear when you generate a task.";
}

function render() {
    elements.xpValue.textContent = state.xp;
    elements.levelValue.textContent = Math.floor(state.xp / 100) + 1;

    if (state.currentTask) {
        elements.taskCategory.textContent = state.currentTask.category;
        elements.taskTitle.textContent = state.currentTask.title;
        elements.taskDifficulty.textContent = state.currentTask.difficulty;
        elements.taskText.textContent = state.currentTask.text;
        elements.taskHelp.textContent = state.currentTask.help;
    } else {
        elements.taskCategory.textContent = "Ready";
        elements.taskTitle.textContent = "Generate your next task";
        elements.taskDifficulty.textContent = "New";
        elements.taskText.textContent = "Click Generate Task to get a small challenge that teaches you something while you do it.";
        elements.taskHelp.textContent = "The lesson or tips for your task will appear here.";
    }

    renderList(elements.historyList, state.history, (item) => {
        return `${item.title} - ${item.xp} XP - ${item.completedAt}`;
    }, "No completed tasks yet.");

    renderList(elements.postponedList, state.postponed, (item) => {
        return `${item.title} - come back ${item.time}`;
    }, "No postponed tasks yet.");
}

function renderList(element, items, format, emptyText) {
    element.innerHTML = "";
    element.classList.toggle("empty", items.length === 0);

    if (items.length === 0) {
        const item = document.createElement("li");
        item.textContent = emptyText;
        element.appendChild(item);
        return;
    }

    items.forEach((value) => {
        const item = document.createElement("li");
        item.textContent = format(value);
        element.appendChild(item);
    });
}

function checkRepeatedWords(answer, words) {
    const lower = answer.toLowerCase();
    const results = words.map((word) => {
        const count = (lower.match(new RegExp(`\\b${word}\\b`, "g")) || []).length;
        return `${word}: ${count}/3`;
    });
    return `Required words: ${results.join(", ")}.`;
}

function persistAll() {
    save("learningQuestTasks", state.tasks);
    save("learningQuestCurrentTask", state.currentTask);
    save("learningQuestXp", state.xp);
    save("learningQuestHistory", state.history);
    save("learningQuestPostponed", state.postponed);
}

function load(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch (error) {
        localStorage.removeItem(key);
        return fallback;
    }
}

function save(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        elements.feedback.textContent = "Your browser blocked saving, but the app can still run for this session.";
    }
}
