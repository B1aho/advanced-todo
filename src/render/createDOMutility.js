import { Datepicker } from "vanillajs-datepicker"
import { ItcCustomSelect } from "../../assets/select/itc-custom-select"
import { DataStorage } from "../dataSaving/dataStorage"
import { saveApp, saveData } from "../dataSaving/localStore"
import { TodoItem } from "../entities/todoItem"
import { Project } from "../entities/todoParent"
import { openProjectFormDiag, renderSectionForm, renderTodoForm, submitProjectForm } from "./todoForm"
import { renderProjectListItem, RenderTodoDiag } from "./todoRender"
import { format } from "date-fns"
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
    if (parentId.includes("todo"))
        btn.textContent = "Add new subtask"
    else
        btn.textContent = "Add new todo"
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

function getCheckWord(prior) {
    let word = "None"
    switch (prior) {
        case 1:
            word = "Low"
            break;
        case 2:
            word = "Medium"
            break;
        case 3:
            word = "High"
            break;
        default:
            break;
    }
    return word
}

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
    if (todo.indent < 5)
        otherOptions.prepend(createAddSubtaskBtn("todo-" + todoId))

    const diagTextContainer = diag.querySelector(".diag-todo-item")
    diagTextContainer.addEventListener("click", () => createTodoTextForm(todo, diagTextContainer))

    const changeDeadline = diag.querySelector("#change-deadline")
    changeDeadline.value = todo.deadline
    new Datepicker(changeDeadline, {
        minDate: format(new Date(), "P"),
        autohide: true,
        title: "Change dead line",
        clearButton: true,
        todayButton: true,
    })
    changeDeadline.addEventListener("changeDate", () => {
        todo.deadline = changeDeadline.value
        updateTodoDeadline(todo.id, changeDeadline.value)
        saveData()
    })

    const select = diag.querySelector("#priority-menu-diag")
    new ItcCustomSelect(select, {
        onSelected(select, option) {
            // выбранное значение
            todo.priorLevel = select.value
            selectBtn.textContent = getCheckWord(todo.priorLevel)
            const selector = `.todo-container[data-id="${CSS.escape(todo.id)}"]`
            const todoContainer = document.querySelector(selector)
            const todoCheckbtn = todoContainer.querySelector(".todo-check-btn")
            const newColor = getCheckColor(todo.priorLevel)
            todoCheckbtn.style.backgroundColor = newColor
            checkBtn.style.backgroundColor = newColor
            saveData()
          }
    })
    const selectBtn = select.querySelector("button")
    selectBtn.textContent = getCheckWord(todo.priorLevel)

    const closeBtn = diag.querySelector("#close-diag-btn")
    closeBtn.addEventListener("click", () => {
        diag.close()
    })
    return diag
}

// В формы перенести
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
    const selector = `.todo-item[data-id="${CSS.escape(id)}"]`
    const todoItem = document.querySelector(selector)
    const todoTitle = todoItem.querySelector(".todo-title")
    todoTitle.textContent = title

    const todoDesc = todoItem.querySelector(".todo-desc")
    todoDesc.textContent = desc
}

function updateTodoDeadline(todoId, newDeadline) {
    const selector = `.todo-item[data-id="${CSS.escape(todoId)}"]`
    const todoItem = document.querySelector(selector)
    const todoDeadline = todoItem.querySelector(".deadline-container")
    todoDeadline.textContent = newDeadline
}

/**
 * 
 * @param {TodoItem} todoNode 
 */
export function countTodoNodes(todoNode) {
    const data = new DataStorage()
    const subtasks = todoNode.subtask
    let num = subtasks.size
    subtasks.forEach(taskId => {
        num += countTodoNodes(data.getTodoById(taskId))
    })
    return num
}

export function initAddProjectBtn() {
    const btn = document.querySelector("#add-project-btn")
    btn.addEventListener("click", openProjectFormDiag)
}

export function createProjectForm() {
    const template = document.querySelector("#diag-project-form-templ")
    const clone = template.content.cloneNode(true)
    const diag = clone.querySelector("#project-dialog")
    const form = clone.querySelector("#dialog-project-form")
    const inputTitle = clone.querySelector("#project-title-input")
    const select = clone.querySelector("#project-color")
    new ItcCustomSelect(select)
    const selectBtn = clone.querySelector("#project-color-btn")

    const confirm = clone.querySelector("#confirm-project-form")
    const cancel = clone.querySelector("#close-project-form")

    confirm.addEventListener("click", (e) => {
        if (!form.reportValidity())
            return
        e.preventDefault()
        const title = inputTitle.value
        const color = selectBtn.value
        const projObj = new Project(title, color)
        new DataStorage().saveProject(projObj)
        saveData()
        renderProjectListItem(projObj)
        diag.close()
        diag.remove()
    })
    cancel.addEventListener("click", () => {
        diag.close()
        diag.remove()
    })
    return diag
}