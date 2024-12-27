import { DataStorage } from "./dataStorage";
import { saveApp } from "./localStore";

/**
 * @param {Map} projectMap 
 */
export function renderListOfProjects(projectMap) {
    if (!(projectMap instanceof Map))
        throw new Error("projectMap must be an istance of Map()!")
    const list = document.querySelector("#project-list")

    // Extract needed projects info 
    const projectList = []
    projectMap.forEach((val, key) => {
        projectList.push({
            title: val.title,
            color: val.color,
            id: key,
        })
    });

    // Sort projects alphabetical by title
    projectList.sort((a, b) => {
        const aVal = a.title.toLowerCase()
        const bVal = b.title.toLowerCase()
        return aVal.localeCompare(bVal)
    })

    // Add number of projects to the header
    const header = document.querySelector("#project-list-header")
    header.textContent += projectList.length

    // Render project list with html template
    const template = document.querySelector("#project-list-item")
    projectList.forEach(val => {
        const clone = template.content.cloneNode(true)
        const listItem = clone.querySelector(".sidebar-list-item")
        listItem.setAttribute("data-id", val.id)

        const svgContainer = clone.querySelector("span")
        svgContainer.setAttribute("color", val.color)

        const title = clone.querySelector(".sidebar-project-title")
        title.textContent = val.title

        list.append(listItem)
    })
    // Вешаем слушатель, который по нажатию определяет, если на сам проект нажали - открывает его
    // если на кнопку в контейнере, то открывает меню с опциям: удалить, добавить в избранное, изменить
    list.addEventListener("click", handleProjectListClick)
}

function handleProjectListClick(e) {
    const target = e.target
    if (target.classList.contains("sidebar-project-btn"))
        onSidebarProjectBtnClick(target)
    else
        onSidebarProjectClick(target.parentElement)
}

function onSidebarProjectBtnClick(target) {
    console.log("Democtrate extra options...")
}

function onSidebarProjectClick(target) {
    console.log("Render project..")
    // Cause singletone pattern, i can be sure that it will be same storage evvery time
    const data = new DataStorage()
    const id = target.getAttribute("data-id")
    const project = data.getProjectById(id)

    // Render project header
    const contentDiv = document.querySelector("main")
    contentDiv.innerHTML = ""
    const projectHeader = document.createElement("div")
    projectHeader.classList.add("project-title-container")
    const title = document.createElement("h1")
    title.textContent = project.title
    projectHeader.append(title)
    contentDiv.append(projectHeader)

    // Creater main content container
    const taskContainer = document.createElement("div")
    taskContainer.classList.add("project-container")
    taskContainer.setAttribute("data-id", project.id)
    contentDiv.append(taskContainer)
    // Render porject's todos
    taskContainer.append(handleTodos(project.todos, "project-" + id))
    // Render project's sections
    project.sections.forEach(id => {
        const section = document.createElement("div")
        section.classList.add("section-container")
        section.setAttribute("data-id", id)
        const sectionObj = data.getSectionById(id)
        section.textContent = sectionObj.title
        section.append(handleTodos(sectionObj.todos, "section-" + id))
        taskContainer.append(section)
    })
}

/**
 * 
 * @returns {HTMLButtonElement}
 */
function createAddTodoBtn(parentId) {
    const btn = document.createElement("button")
    btn.classList.add("add-todo-btn")
    btn.type = "button"
    btn.setAttribute("data-parent-id", parentId)
    btn.addEventListener("click", renderTodoForm)
    btn.textContent = "Add new Todo"
    return btn
}

/**
 * 
 * @returns {HTMLButtonElement}
 */
function createAddSectionBtn(parentId) {
    const btn = document.createElement("button")
    btn.classList.add("add-section-btn")
    btn.type = "button"
    btn.setAttribute("data-parent-id", parentId)
    btn.addEventListener("click", renderSectionForm)
    btn.textContent = "Add new section"
    return btn
}

function renderSectionForm(e) {
    const addSectionBtn = e.target
    const divAfterSectionBtn = document.createElement("div")
    addSectionBtn.after(divAfterSectionBtn)
    addSectionBtn.style.display = "none"

    const template = document.querySelector("#section-form-template")
    const clone = template.content.cloneNode(true)
    const form = clone.querySelector(".section-form")
    const submitBtn = clone.querySelector(".submit-btn-section")
    const cancelBtn = clone.querySelector(".cancel-btn-section")

    cancelBtn.addEventListener("click", () => {
        divAfterSectionBtn.remove()
        addSectionBtn.style.display = "block"
    })

    submitBtn.addEventListener("click", (e) => {
        e.preventDefault()
    })

    divAfterSectionBtn.append(form)
}

function handleTodos(todoSet, id) {
    if (!(todoSet instanceof Set)) {
        throw new Error("Argument must be instance of Set")
    }
    const data = new DataStorage()
    const todoList = document.createElement("div")
    todoList.classList.add("todo-list")
    todoSet.forEach(id => {
        todoList.append(initTodoTemplate(data.getTodoById(id)))
    })
    todoList.append(createAddTodoBtn(id))
    todoList.append(createAddSectionBtn(id))
    return todoList;
}

function initTodoTemplate(todo) {
    const template = document.querySelector("#todo-item-template")
    const clone = template.content.cloneNode(true)
    const todoContainer = clone.querySelector(".todo-container")
    todoContainer.setAttribute("data-id", todo.id)
    const checkBtn = clone.querySelector(".todo-check-btn")

    // В отдельную функцию
    let color = "gray"
    switch (todo.priorLevel) {
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
    checkBtn.style.backgroundColor = color

    const todoTitle = clone.querySelector(".todo-title")
    todoTitle.textContent = todo.title

    const todoDesc = clone.querySelector(".todo-desc")
    todoDesc.textContent = todo.desc

    const todoOther = clone.querySelector(".todo-other")

    return todoContainer
}

function renderTodoForm(e) {
    const template = document.querySelector("#form-template")
    const clone = template.content.cloneNode(true)
    const btn = e.target
    btn.style.display = "none"
    const afterBtn = btn.nextElementSibling

    const form = clone.querySelector("form")
    const cancelBtn = clone.querySelector(".cancel-btn")
    const submitBtn = clone.querySelector(".submit-btn")

    cancelBtn.addEventListener("click", () => {
        form.remove()
        btn.style.display = "block"
    })

    submitBtn.addEventListener("click", (e) => {
        e.preventDefault()
        const formValues = handleTodoForm(form.elements)
        const parentId = btn.getAttribute("data-parent-id")
        form.remove()
        btn.style.display = "block"
        btn.before(addTodoNode(formValues, parentId))
    })
    
    afterBtn.before(form)
}

function handleTodoForm(formElems) {
    const formValues = Array.from(formElems)
    .filter(element => {
        return element.name
    })
    .reduce((acc, curr) => {
        const {name, value} = curr
        acc[name] = value
        return acc
    }, {})
    return formValues
}

function addTodoNode(formValues, parentId) {
    const data = new DataStorage()
    const parts = parentId.split("-")
    const parentType = parts[0]
    const id = parts.slice(1).join("-")
    let parent
    if (parentType === "project") {
        parent = data.getProjectById(id)
    }
    if (parentType === "section") {
        parent = data.getSectionById(id)
    }
    const todo = parent.createTodo(formValues.title, formValues.desc)
    data.saveTodo(todo)
    saveData()
    return initTodoTemplate(todo)
}

function openPriorSelect() {

}

function saveData() {
    saveApp(new DataStorage())
}

function removeTodo() {

}

// Разделить все что не рендер но с дом, в отдельный модуль дом манипулетион
// И вообще переименовать функции чтобы понимал, что каждая из них делает и на жтом основании разделить модуль