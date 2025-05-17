// selecao de elememtos

const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const editForm = document.querySelector("#edit-form");
const editInput = document.querySelector("#edit-input");
const cancelEditBtn = document.querySelector("#cancel-edit-btn");
const searchInput = document.querySelector("#search-input");
const eraseBtn = document.querySelector("#erase-button");
const filterBtn = document.querySelector("#filter-select");

let oldInputValue;

// funcoes

const criaItem = (text, id, done = false) => {
    // cria as tags html
    const todo = document.createElement("div");
    todo.classList.add("todo");
    if(done) {
        todo.classList.add("done");
    }
    todo.dataset.id = id;

    const todoTitle = document.createElement("h3");
    todoTitle.innerText = text;
    todo.appendChild(todoTitle);

    // cria os botoes
    const finishTodo = document.createElement("button");
    finishTodo.classList.add("finish-todo");
    finishTodo.innerHTML = `<i class="fa-solid fa-check"></i>`
    todo.appendChild(finishTodo);

    const editTodo = document.createElement("button");
    editTodo.classList.add("edit-todo");
    editTodo.innerHTML = `<i class="fa-solid fa-pen"></i>`
    todo.appendChild(editTodo);


    const removeTodo = document.createElement("button");
    removeTodo.classList.add("remove-todo");
    removeTodo.innerHTML = `<i class="fa-solid fa-xmark"></i>`
    todo.appendChild(removeTodo);

    todoList.appendChild(todo);

}

const loadTodos = () => {
    
   fetch("http://localhost:8080/itens/read")
    .then(res => res.json())
    .then(itens => {
        todoList.innerHTML = "";
        itens.forEach(item => {
            criaItem(item.descricao, item.id, item.status);
        });
    });
};

const saveTodo = (text) => {

        fetch("http://localhost:8080/itens/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                descricao: text, 
                status: false 
            })
        })
        .then(res => res.json())
        .then(data => {
            todoInput.value = "";
            todoInput.focus();
            loadTodos();
        })

}

const toggleForms = () => {
    editForm.classList.toggle("hide");
    todoForm.classList.toggle("hide");
    todoList.classList.toggle("hide");
}

const updateTodo = (text) => {
     const todos = document.querySelectorAll(".todo");

    todos.forEach((todo) => {
        let todoTitle = todo.querySelector("h3");

        if(todoTitle.innerText === oldInputValue) {
           const id = todo.dataset.id;
            fetch(`http://localhost:8080/itens/updateDescricao/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ descricao: text })
            }).then(() => {
                todoTitle.innerText = text;
            });
        }
    });
}

const getSearchTodos = (search) => {

    const todos = document.querySelectorAll(".todo");

    todos.forEach((todo) => {
        
        let todoTitle = todo.querySelector("h3").innerText.toLowerCase();

        const normalizedSearch = search.toLowerCase()

        todo.style.display = "flex";

        if(!todoTitle.includes(normalizedSearch)) {
            todo.style.display = "none";
        }

        
    });
}

const filterTodos = (filterValue) => {

    const todos = document.querySelectorAll(".todo");

    switch(filterValue) {
        case "all":
            todos.forEach((todo) => todo.style.display = "flex")
            break;
        case "done":
            todos.forEach((todo) => {
                if(todo.classList.contains("done")) {
                    todo.style.display = "flex"
                }else{
                    todo.style.display = "none"
                }
            });
            break;
        case "todo":
            todos.forEach((todo) => {
                if(!todo.classList.contains("done")) {
                    todo.style.display = "flex"
                }else{
                    todo.style.display = "none"
                }
            });
            break;
        default:
            break;   
    }
    
} 




// eventos

todoForm.addEventListener("submit", (e) => {

    e.preventDefault();

    const inputValue = todoInput.value;

    if(inputValue) {
       saveTodo(inputValue)
    }
});


document.addEventListener("click", (e) => {

    const targetEl = e.target;
    const parentElement = targetEl.closest("div"); 
    let todoTitle;

    if(parentElement && parentElement.querySelector("h3")){
        todoTitle = parentElement.querySelector("h3").innerText;
    }
    
    if(targetEl.classList.contains("finish-todo")) {
        parentElement.classList.toggle("done")

        const id = parentElement.dataset.id;
        const status = parentElement.classList.contains("done");

        fetch(`http://localhost:8080/itens/updateStatus/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: status })
        });
    }

    if(targetEl.classList.contains("remove-todo")) {
        const id = parentElement.dataset.id;

        fetch(`http://localhost:8080/itens/delete/${id}`, {
            method: "DELETE"
        }).then(() => parentElement.remove());
    }

    if(targetEl.classList.contains("edit-todo")) {
        toggleForms();

        editInput.value = todoTitle;
        oldInputValue = todoTitle;
    }
});

cancelEditBtn.addEventListener("click", (e) => {
    e.preventDefault();

    toggleForms();
})

editForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const editInputValue = editInput.value;

    if(editInputValue) {
        updateTodo(editInputValue);
    }

    toggleForms();
})

searchInput.addEventListener("keyup", (e) => {

    const search = e.target.value;

    getSearchTodos(search);
});

eraseBtn.addEventListener("click", (e) => {
    e.preventDefault();

    searchInput.value = "";

    searchInput.dispatchEvent(new Event("keyup"));

});

filterBtn.addEventListener("change", (e) => {
    
    const filterValue = e.target.value
    filterTodos(filterValue);
});

// carregar todos iniciais


loadTodos();