const taskInput = document.getElementById("taskInput");
const addButton = document.getElementById("addButton");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");

// ==========================================
// UPDATE TASK COUNT
// ==========================================

function updateCount() {
    const totalTasks = taskList.children.length;

    taskCount.textContent =
        `${totalTasks} task${totalTasks === 1 ? "" : "s"}`;
}

// ==========================================
// DISPLAY A TASK
// ==========================================

function displayTask(task) {

    const li = document.createElement("li");

    li.innerHTML = `
        <label>
            <input
                type="checkbox"
                ${task.completed ? "checked" : ""}
            >

            <span>${task.task}</span>
        </label>

        <button type="button">
            🗑️
        </button>
    `;

    const checkbox = li.querySelector("input");
    const deleteButton = li.querySelector("button");
    const text = li.querySelector("span");

    // Restore completed appearance

    if (task.completed) {
        text.style.textDecoration = "line-through";
        text.style.color = "#999";
    }

    // ======================================
    // CHECKBOX
    // ======================================

    checkbox.addEventListener("change", async function () {

        const completed = checkbox.checked ? 1 : 0;

        if (checkbox.checked) {
            text.style.textDecoration = "line-through";
            text.style.color = "#999";
        } else {
            text.style.textDecoration = "none";
            text.style.color = "#333";
        }

        try {

            const response = await fetch(`/tasks/${task.id}`, {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    completed: completed
                })
            });

            if (!response.ok) {
                throw new Error(
                    `Server returned ${response.status}`
                );
            }

            console.log("Task updated!");

        } catch (error) {

            console.error("Update error:", error);

            alert("Could not update task.");
        }
    });

    // ======================================
    // DELETE BUTTON
    // ======================================

    deleteButton.addEventListener("click", async function () {

        console.log("Deleting task:", task.id);

        try {

            const response = await fetch(
                `/tasks/${task.id}`,
                {
                    method: "DELETE"
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Server returned ${response.status}`
                );
            }

            li.remove();

            updateCount();

            console.log("Task deleted!");

        } catch (error) {

            console.error("Delete error:", error);

            alert("Could not delete task.");
        }
    });

    taskList.appendChild(li);

    updateCount();
}

// ==========================================
// LOAD TASKS FROM MYSQL
// ==========================================

async function loadTasks() {

    console.log("Loading tasks...");

    try {

        const response = await fetch("/tasks");

        console.log("GET /tasks status:", response.status);

        if (!response.ok) {
            throw new Error(
                `Server returned ${response.status}`
            );
        }

        const tasks = await response.json();

        console.log("Tasks received:", tasks);

        taskList.innerHTML = "";

        tasks.forEach(task => {
            displayTask(task);
        });

        updateCount();

    } catch (error) {

        console.error("Error loading tasks:", error);

        alert("Could not load tasks from the database.");
    }
}

// ==========================================
// ADD TASK
// ==========================================

async function addTask() {

    const taskText = taskInput.value.trim();

    if (taskText === "") {
        return;
    }

    console.log("Adding task:", taskText);

    try {

        const response = await fetch("/tasks", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                task: taskText
            })
        });

        console.log("POST /tasks status:", response.status);

        if (!response.ok) {

            const errorText = await response.text();

            console.error("Server error:", errorText);

            throw new Error(
                `Server returned ${response.status}`
            );
        }

        const newTask = await response.json();

        console.log("New task:", newTask);

        displayTask(newTask);

        taskInput.value = "";

        taskInput.focus();

    } catch (error) {

        console.error("Error adding task:", error);

        alert("Could not add task.");
    }
}

// ==========================================
// ADD BUTTON
// ==========================================

addButton.addEventListener("click", addTask);

// ==========================================
// ENTER KEY
// ==========================================

taskInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {
        addTask();
    }

});

// ==========================================
// START APP
// ==========================================

loadTasks();