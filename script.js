// Конфигурация таймера
const modes = {
    pomodoro: 25 * 60,      // 25 минут
    "short-break": 5 * 60,   // 5 минут
    "long-break": 15 * 60    // 15 минут
};

let currentMode = "pomodoro";
let timeLeft = modes[currentMode];
let timer;
let isRunning = false;
const timerSound = new Audio("sounds/sound.mp3");  // Путь к звуку

// ===== Элементы DOM для задач =====
const taskInput = document.getElementById("task-input");
const tasksList = document.getElementById("tasks");

// ===== Загрузка задач из localStorage при запуске =====
let tasks = JSON.parse(localStorage.getItem("pomodoroTasks")) || [];

// Элементы DOM
const timeDisplay = document.getElementById("time");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resetBtn = document.getElementById("reset-btn");
const modeButtons = document.querySelectorAll(".mode-btn");

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => console.log('SW registered:', registration))
      .catch(error => console.log('SW failed:', error));
  });
}

// ===== Отображение задач =====
function renderTasks() {
    tasksList.innerHTML = "";
    tasks.forEach((task, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <input type="checkbox" ${task.completed ? "checked" : ""} data-index="${index}">
    <span class="${task.completed ? "completed" : ""}">${task.text}</span>
    <button class="delete-btn" data-index="${index}">×</button>
        `;
        tasksList.appendChild(li);
    });

    // Добавляем обработчик для кнопок удаления
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const index = e.target.dataset.index;
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
        });
    });
}

// ===== Сохранение задач в localStorage =====
function saveTasks() {
    localStorage.setItem("pomodoroTasks", JSON.stringify(tasks));
}

// ===== Добавление новой задачи =====
taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && taskInput.value.trim() !== "") {
        tasks.push({ text: taskInput.value.trim(), completed: false });
        taskInput.value = "";
        saveTasks();
        renderTasks();
    }
});



// Обновление таймера
function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, "0");
    const seconds = (timeLeft % 60).toString().padStart(2, "0");
    timeDisplay.textContent = `${minutes}:${seconds}`;
}

function showNotification() {
    if (!("Notification" in window)) return;
    
    if (Notification.permission === "granted") {
        new Notification("Pomodoro Timer", { 
            body: "Время вышло! Пора отдохнуть 🌿",
            icon: "icons/tomato.png" 
        });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification("Pomodoro Timer", { 
                    body: "Время вышло!",
                    icon: "icons/tomato.png" 
                });
            }
        });
    }
}

// Запуск таймера
function startTimer() {
    if (isRunning) return;
    isRunning = true;
    timer = setInterval(() => {
        timeLeft--;
        updateDisplay();
        if (timeLeft <= 0) {
    clearInterval(timer);
    isRunning = false;
    timerSound.play();
    showNotification();  // Показываем уведомление
};
}, 1000);
}

// Пауза
function pauseTimer() { 
    clearInterval(timer);
    isRunning = false;
}

// Сброс
function resetTimer() {
    pauseTimer();
    timeLeft = modes[currentMode];
    updateDisplay();
}

// Переключение режимов
modeButtons.forEach(button => {
    button.addEventListener("click", () => {
        currentMode = button.dataset.mode;
        timeLeft = modes[currentMode];
        
        // Обновляем активную кнопку
        modeButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        
        resetTimer();
    });
});

// Управление кнопками
startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

// Инициализация
renderTasks();
updateDisplay();