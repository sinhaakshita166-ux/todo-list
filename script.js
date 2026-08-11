const taskInput = document.getElementById("taskInput");
const addButton = document.getElementById("addButton");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");


// ==========================================
// ADD TASK
// ==========================================

async function addTask() {

    const taskText = taskInput.value.trim();

    if (taskText === "") {
        return;
    }

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


        if (!response.ok) {
            throw new Error("Failed to add task");
        }


        const newTask = await response.json();


        // Create the task on the webpage

        const li = document.createElement("li");

        li.innerHTML = `
            <label>

                <input
                    type="checkbox"
                    onchange="completeTask(this, ${newTask.id})"
                >

                <span>${newTask.task}</span>

            </label>

            <button onclick="deleteTask(this, ${newTask.id})">
                🗑️
            </button>
        `;


        taskList.appendChild(li);

        taskInput.value = "";

        updateCount();


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
// DELETE TASK
// ==========================================

async function deleteTask(button, id) {

    console.log("Trying to delete task:", id);


    try {

        const response = await fetch(
            `/tasks/${id}`,
            {
                method: "DELETE"
            }
        );


        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
            );

        }


        const result = await response.json();

        console.log(result);


        // Remove task from webpage

        button.parentElement.remove();

        updateCount();


    } catch (error) {

        console.error("Error deleting task:", error);

        alert("Could not delete task.");

    }

}


// ==========================================
// UPDATE TASK COUNT
// ==========================================

function updateCount() {

    const totalTasks = taskList.children.length;

    taskCount.textContent = `${totalTasks} tasks`;

}


// ==========================================
// COMPLETE TASK
// ==========================================

async function completeTask(checkbox, id) {

    const text = checkbox.nextElementSibling;

    const completed = checkbox.checked ? 1 : 0;


    // Change appearance

    if (checkbox.checked) {

        text.style.textDecoration = "line-through";
        text.style.color = "#999";

    } else {

        text.style.textDecoration = "none";
        text.style.color = "black";

    }


    // Save change to MySQL

    try {

        const response = await fetch(
            `/tasks/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    completed: completed
                })
            }
        );


        if (!response.ok) {
            throw new Error("Failed to update task");
        }


        console.log("Task completion updated!");

    } catch (error) {

        console.error("Error updating task:", error);

        alert("Could not update task.");

    }

}


// ==========================================
// PRESS ENTER TO ADD TASK
// ==========================================

taskInput.addEventListener("keypress", function(event) {

    if (event.key === "Enter") {

        addTask();

    }

});


// ==========================================
// LOAD TASKS FROM MYSQL
// ==========================================

async function loadTasks() {

    taskList.innerHTML = "";


    try {

        const response = await fetch(
            "/tasks"
        );


        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
            );

        }


        const tasks = await response.json();


        tasks.forEach(task => {

            const li = document.createElement("li");


            li.innerHTML = `
                <label>

                    <input
                        type="checkbox"
                        ${task.completed ? "checked" : ""}
                        onchange="completeTask(this,  ${task.id})"
                    >

                    <span>${task.task}</span>

                </label>

                <button onclick="deleteTask(this, ${task.id})">
                    🗑️
                </button>
            `;


            taskList.appendChild(li);

        });


        updateCount();


    } catch (error) {

        console.error("Error loading tasks:", error);

    }

}


// ==========================================
// LOAD TASKS WHEN PAGE OPENS
// ==========================================

loadTasks();