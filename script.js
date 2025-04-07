document.addEventListener("DOMContentLoaded", () => {
    const API_URL = 'http://localhost:3000/api';
    const taskList = document.getElementById("task-list");
    const addTaskBtn = document.getElementById("add-task-btn");
    const taskTitleInput = document.getElementById("task-title-input");
    const taskDescInput = document.getElementById("task-desc-input");
    const taskDueDateInput = document.getElementById("task-due-date-input");
    const taskPriorityInput = document.getElementById("task-priority-input");
    const searchInput = document.getElementById("search-input");
    const filterStatusSelect = document.getElementById("filter-status-select");
    const sortBySelect = document.getElementById("sort-by-select");
    const logoutBtn = document.getElementById("logout-btn");

    // Fetch all tasks
    async function fetchTasks() {
        try {
            const response = await fetch(`${API_URL}/tasks`);
            const data = await response.json();
            renderTasks(data);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Add new task
    addTaskBtn.addEventListener("click", async () => {
        const title = taskTitleInput.value.trim();
        const description = taskDescInput.value.trim();
        const dueDate = taskDueDateInput.value;
        const priority = taskPriorityInput.value;

        if (!title || !dueDate) {
            alert("Vui lòng nhập tiêu đề và hạn chót!");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    description,
                    dueDate,
                    priority
                })
            });
            fetchTasks();
            clearInputs();
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Render tasks
    function renderTasks(tasks) {
        const filteredTasks = filterAndSortTasks(tasks);
        taskList.innerHTML = "";

        filteredTasks.forEach(task => {
            const taskItem = createTaskElement(task);
            taskList.appendChild(taskItem);
        });
    }

    // Filter and sort tasks
    function filterAndSortTasks(tasks) {
        return tasks
            .filter(task => {
                const searchText = searchInput.value.toLowerCase();
                const matchesSearch = task.title.toLowerCase().includes(searchText);
                const matchesStatus = filterStatusSelect.value === "all" ||
                    (filterStatusSelect.value === "pending" && !task.completed) ||
                    (filterStatusSelect.value === "completed" && task.completed);
                return matchesSearch && matchesStatus;
            })
            .sort((a, b) => {
                switch (sortBySelect.value) {
                    case "due-date":
                        return new Date(a.dueDate) - new Date(b.dueDate);
                    case "priority":
                        const priorityOrder = { high: 1, medium: 2, low: 3 };
                        return priorityOrder[a.priority] - priorityOrder[b.priority];
                    case "creation-date":
                        return a.id - b.id;
                    default:
                        return 0;
                }
            });
    }

    // Create task element
    function createTaskElement(task) {
        const taskItem = document.createElement("li");
        taskItem.className = `task-item ${task.priority}-priority ${task.completed ? "completed" : ""}`;
        taskItem.dataset.id = task.id;

        taskItem.innerHTML = `
            <div class="task-details">
                <input type="checkbox" class="task-complete-checkbox" ${task.completed ? "checked" : ""}>
                <div>
                    <span class="task-title">${task.title}</span>
                    <p class="task-description">${task.description}</p>
                    <span class="task-due-date">Hạn chót: ${task.dueDate}</span>
                    <span class="task-priority">Ưu tiên: ${task.priority}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="edit-btn">Sửa</button>
                <button class="delete-btn">Xóa</button>
            </div>
        `;

        return taskItem;
    }

    // Handle task actions
    taskList.addEventListener("click", async (e) => {
        const taskItem = e.target.closest(".task-item");
        if (!taskItem) return;

        const taskId = taskItem.dataset.id;

        if (e.target.classList.contains("delete-btn")) {
            try {
                await fetch(`${API_URL}/tasks/${taskId}`, {
                    method: 'DELETE'
                });
                fetchTasks();
            } catch (error) {
                console.error('Error:', error);
            }
        } else if (e.target.classList.contains("task-complete-checkbox")) {
            const completed = e.target.checked;
            try {
                await fetch(`${API_URL}/tasks/${taskId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ completed })
                });
                fetchTasks();
            } catch (error) {
                console.error('Error:', error);
            }
        }
    });

    // Clear inputs
    function clearInputs() {
        taskTitleInput.value = "";
        taskDescInput.value = "";
        taskDueDateInput.value = "";
        taskPriorityInput.value = "medium";
    }

    // Event listeners for search and filter
    searchInput.addEventListener("input", () => fetchTasks());
    filterStatusSelect.addEventListener("change", () => fetchTasks());
    sortBySelect.addEventListener("change", () => fetchTasks());

    // Xử lý đăng xuất
    logoutBtn.addEventListener("click", () => {
        if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
            // Thực hiện logic đăng xuất ở đây
            alert("Đã đăng xuất thành công!");
        }
    });

    // Initial load
    fetchTasks();
});