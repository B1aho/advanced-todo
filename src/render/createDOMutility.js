import { DataStorage } from "../dataSaving/dataStorage"
import { saveApp, saveData } from "../dataSaving/localStore"
import { renderSectionForm, renderTodoForm } from "./todoForm"
import { RenderTodoDiag } from "./todoRender"
/**
 * 
 * @returns {HTMLButtonElement}
 */
export function createAddSectionBtn(parentId) {
    const btn = document.createElement("button")
    btn.classList.add("add-section-btn")
    btn.type = "button"
    btn.setAttribute("data-parent-id", parentId)
    btn.addEventListener("click", renderSectionForm)
    btn.textContent = "Add new section"
    return btn
}

/**
 * 
 * @returns {HTMLButtonElement}
 */
export function createAddTodoBtn(parentId) {
    const btn = document.createElement("button")
    btn.classList.add("add-todo-btn")
    btn.type = "button"
    btn.setAttribute("data-parent-id", parentId)
    btn.addEventListener("click", renderTodoForm)
    btn.textContent = "Add new Todo"
    return btn
}

function createAddSubtaskBtn(parentId) {
    const btn = document.createElement("button")
    btn.classList.add("add-subtask-btn")
    btn.type = "button"
    btn.setAttribute("data-parent-id", parentId)
    btn.addEventListener("click", renderTodoForm)
    btn.textContent = "Add new Todo"
    return btn
}

export function createTodoList(todoSet, parentId) {
    if (!(todoSet instanceof Set)) {
        throw new Error("Argument must be instance of Set")
    }
    const data = new DataStorage()
    const todoList = document.createElement("div")
    todoList.classList.add("todo-list")
    const subtaskArr = []
    // Здесь надо проверить есть ли вложенные туду и функцию для их генерации, на забывая отступ
    todoSet.forEach(id => {
        const todo = data.getTodoById(id)
        todoList.append(createTodoFromTempl(todo))
        if (todo.subtask.size > 0) {
            createSubtaskAddToList(subtaskArr, todo)
        }
        subtaskArr.forEach(subtask => {
            todoList.append(subtask)
        })
    })
    todoList.append(createAddTodoBtn(parentId))
    return todoList;
}

// Поменяй название
function createSubtaskAddToList(arr, todo) {
    const data = new DataStorage()
    const subtask = todo.subtask
    subtask.forEach(subtaskId => {
        const subtask = data.getTodoById(subtaskId)
        // add todoNode to the array
        arr.push(createTodoFromTempl(subtask))
        if (subtask.subtask.size > 0)
            createSubtaskAddToList(arr, subtask)
    })
}

function createSubtaskNodeListForDiag(arr, todo) {
    const data = new DataStorage()
    const subtaskSet = todo.subtask
    subtaskSet.forEach(subtaskId => {
        const subtask = data.getTodoById(subtaskId)
        // add todoNode to the array
        arr.push(createTodoFromTempl(subtask))
    })
}

export function createTodoFromTempl(todo) {
    const template = document.querySelector("#todo-item-template")
    const clone = template.content.cloneNode(true)
    const todoContainer = clone.querySelector(".todo-container")
    todoContainer.setAttribute("data-id", todo.id)
    todoContainer.setAttribute("data-indent", todo.indent)
    const checkBtn = clone.querySelector(".todo-check-btn")
    checkBtn.style.backgroundColor = getCheckColor(todo.priorLevel)

    const todoTitle = clone.querySelector(".todo-title")
    todoTitle.textContent = todo.title

    const todoDesc = clone.querySelector(".todo-desc")
    todoDesc.textContent = todo.desc

    const todoDeadline = clone.querySelector(".deadline-container")
    todoDeadline.textContent = todo.deadline

    if (todo.tags) {
        const todoTags = clone.querySelector(".tags-container")
        todo.tags.forEach((tag) => {
            const tagSpan = document.createElement("span")
            tagSpan.classList.add("tag")
            tagSpan.textContent = tag
            todoTags.append(tagSpan)
        })
    }

    const todoBody = clone.querySelector(".todo-item")
    todoBody.setAttribute("data-id", todo.id)
    todoBody.addEventListener("click", RenderTodoDiag)

    return todoContainer
}

export function createSectionFromTempl(sect) {
    const template = document.querySelector("#section-container-template")
    const clone = template.content.cloneNode(true)
    const section = clone.querySelector(".section-container")
    section.setAttribute("data-id", sect.id)
    clone.querySelector(".section-title").textContent = sect.title

    const todoList = document.createElement("div")
    todoList.classList.add("todo-list")
    todoList.append(createAddTodoBtn("section-" + sect.id))
    section.append(todoList)
    return section
}

export function getCheckColor(prior) {
    let color = "gray"
    switch (prior) {
        case 1:
            color = "blue"
            break;
        case 2:
            color = "yellow"
            break;
        case 3:
            color = "red"
            break;
        default:
            break;
    }
    return color
}

// export function closeDiag(e) {
//     const diag = document.querySelector("#todo-dialog")
//     const rect = diag.getBoundingClientRect();
//     const isInDialog = e.clientX >= rect.left && e.clientX <= rect.right &&
//         e.clientY >= rect.top && e.clientY <= rect.bottom;

//     if (!isInDialog) {
//         diag.close();
//         diag.removeEventListener("click", closeDiag)
//         diag.remove()
//     }
// }

export function createDiagFromTempl(e) {
    const template = document.querySelector("#diag-templ")
    const clone = template.content.cloneNode(true)
    const diag = clone.querySelector("#todo-dialog")
    const todoId = e.currentTarget.getAttribute("data-id")

    const data = new DataStorage()
    const todo = data.getTodoById(todoId)
    
    const checkBtn = diag.querySelector(".todo-check-btn")
    checkBtn.style.backgroundColor = getCheckColor(todo.priorLevel)
    const diagTitle = diag.querySelector(".diag-todo-title")
    diagTitle.textContent = todo.title
    const diagDesc = diag.querySelector(".diag-todo-desc")
    diagDesc.textContent = todo.desc === "" ? "Описание" : todo.desc

    const subtaskList = diag.querySelector(".subtask-diag-list")
    const subtaskArr = []
    if (todo.subtask.size > 0) {
        createSubtaskNodeListForDiag(subtaskArr, todo)
        subtaskArr.forEach(subtask => {
            subtask.classList.add("diag-indent")
            subtaskList.append(subtask)
        })
    }

    const otherOptions = diag.querySelector(".diag-options")
    otherOptions.prepend(createAddSubtaskBtn("todo-" + todoId))

    const diagTextContainer = diag.querySelector(".diag-todo-item")
    diagTextContainer.addEventListener("click", () => createTodoTextForm(todo, diagTextContainer))

    const closeBtn = diag.querySelector("#close-diag-btn")
    closeBtn.addEventListener("click", () => {
        diag.close()
    })
    return diag
}

export function createTodoTextForm(todo, targetNode) {
    const template = document.querySelector("#dialog-form-templ")
    const clone = template.content.cloneNode(true)
    const form = clone.querySelector("#dialog-form")

    const title = clone.querySelector("#dialog-form-title")
    title.textContent = todo.title
    const desc = clone.querySelector("#dialog-form-desc")
    desc.textContent = todo.desc === "" ? "Описание" : todo.desc

    const confirm = clone.querySelector("#confirm-dialog-edit")
    confirm.addEventListener("click", (e) => {
        e.preventDefault()
        const newTitle = title.textContent
        const newDesc = desc.textContent
        todo.title = newTitle
        todo.desc = newDesc

        updateDiagText(newTitle, newDesc)
        updateTodoText(newTitle, newDesc, todo.id)
        form.remove()
        saveData()
        targetNode.style.display = "flex"
    })

    const cancel = clone.querySelector("#cancel-dialog-edit")
    cancel.addEventListener("click", (e) => {
        e.preventDefault()
        form.remove()
        targetNode.style.display = "flex"
    })

    targetNode.before(form)
    targetNode.style.display = "none"
}

function updateDiagText(title, desc) {
    const diagTodoTitle = document.querySelector(".diag-todo-title")
    diagTodoTitle.textContent = title

    const diagTodoDesc = document.querySelector(".diag-todo-desc")
    diagTodoDesc.textContent = desc
}

function updateTodoText(title, desc, id) {
    const selector = `.todo-item[data-id="${CSS.escape(id)}"]`;
    console.log(selector)
    const todoItem = document.querySelector(selector)
    console.log(todoItem)
    const todoTitle = todoItem.querySelector(".todo-title")
    console.log(todoTitle)
    console.log(title)
    todoTitle.textContent = title

    const todoDesc = todoItem.querySelector(".todo-desc")
    todoDesc.textContent = desc
}


/**
 * Во-первых я при нажатии на подзадачу в диалоге могу также открыть диалог уже для этой задачи и установить там подзадачи
 * Оказывается так уже можно сделать, единственное, это что отступ в диалоге надо установить как что-то постоянное, так как там всегда один уровень остпупа
 * 
 *  
 * Во-вторых должен обновлятся рендеринг в текущем проекте
 * 
 * В-третьих при повторном открытии диалога должны грамотно рендерится все подзадачи
 * 
 */