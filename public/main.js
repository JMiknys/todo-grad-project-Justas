var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");
var count = document.getElementById("count-label");
var formControls = document.getElementById("form-controls");
var showTodos = "all";

form.onsubmit = function(event) {
    var title = todoTitle.value;
    createTodo(title, function() {
        reloadTodoList();
    });
    todoTitle.value = "";
    event.preventDefault();
};

function showAllTodo() {
    showTodos = "all";
    reloadTodoList();
}

function showActiveTodo() {
    showTodos = "active";
    reloadTodoList();
}

function showCompletedTodo() {
    showTodos = "completed";
    reloadTodoList();
}

function createTodo(title, callback) {
    fetch("/api/todo", {
        method: "post",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            title: title
        })
    }).then(function(data) {
        if (data.ok) {
            callback();
        }
        else {
            error.textContent = "Failed to create item. Server returned " + data.status + " - " + data.statusText;
        }
    }).catch (function(error) {
        error.textContent = "Failed to create item. Server returned " + error.status + " - " + error.statusText;
    });
}

function getTodoList(callback) {
    fetch("/api/todo").then(function(response) {
        if (!response.ok) {
            error.textContent = "Failed to get list. Server returned " + response.status + " - " + response.statusText;
            return;
        }
        return response.text();
    }).then(function(body) {
        callback(JSON.parse(body));
    });
}

function reloadTodoList() {
    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }
    todoListPlaceholder.style.display = "block";
    var incompleteCount = 0;
    getTodoList(function(todos) {
        todoListPlaceholder.style.display = "none";
        todos.forEach(function(todo) {
            if ((showTodos === "active" && !todo.isComplete) ||
                (showTodos === "completed" && todo.isComplete) || (showTodos === "all")) {
                var listItem = document.createElement("li");
                listItem.textContent = todo.title;

                listItem.appendChild(getDeleteButton(todo.id));
                listItem.appendChild(getCompleteButton(todo.id, todo.title));

                listItem.setAttribute("class", todo.isComplete ? "complete" : "incomplete");
                todoList.appendChild(listItem);
                if (!todo.isComplete) {
                    incompleteCount += 1;
                }
            }
        });
        count.innerHTML = "Incomplete tasks: " + incompleteCount;
        if (incompleteCount < todos.length) {
            formControls.innerHTML = "";
            formControls.appendChild(getDeleteCompletedButton());
        }

    });
}

function getDeleteButton(todoID) {
    var btn = document.createElement("BUTTON");
    btn.onclick = function () {
        deleteTodo(todoID);
        reloadTodoList();
    };
    btn.appendChild(document.createTextNode("Delete me :)"));
    btn.setAttribute("class", "button");
    return btn;
}

function deleteTodo (todoID) {
    fetch("/api/todo/" + todoID, {
        method: "delete"
    }).then(function(response) {
        if (!response.ok) {
            error.textContent = "Failed to get list. Server returned " + response.status + " - " + response.statusText;
            return;
        }
    });
}

function getCompleteButton(todoID, title) {
    var btn = document.createElement("BUTTON");
    btn.onclick = function () {
        completeTodo(todoID, title);
    };
    btn.appendChild(document.createTextNode("Complete"));
    btn.setAttribute("class", "button");

    return btn;
}

function completeTodo(todoID, title) {
    fetch("/api/todo/" + todoID, {
        method: "put",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            title: title,
            isComplete: true
        })
    }).then(function(data) {
        if (data.ok) {
            reloadTodoList();
        }
        else {
            error.textContent = "Failed to update item. Server returned " + data.status + " - " + data.statusText;
        }
    }).catch (function(error) {
        error.textContent = "Failed to update item. Server returned " + error.status + " - " + error.statusText;
    });
}

function getDeleteCompletedButton() {
    var btn = document.createElement("BUTTON");
    btn.appendChild(document.createTextNode("Delete All Completed"));
    btn.setAttribute("class", "button");
    btn.onclick = function () {
        getTodoList(function (todos) {
            todos.forEach(function(todo) {
                if (todo.isComplete) {
                    deleteTodo(todo.id);
                }
            });
            reloadTodoList();
        });
    };
    return btn;
}

reloadTodoList();

var id = setInterval(function () {
    console.log("List reloaded");
    reloadTodoList();
}, 20000);
