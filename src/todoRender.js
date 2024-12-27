import { DataStorage } from "./dataStorage";

/**
 * @param {*} projectMap 
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
    contentDiv.append(taskContainer)
    // Render porject's todos
    taskContainer.append(handleTodos(project.todos))
    // Render project's sections
    project.sections.forEach(id => {
        const section = document.createElement("div")
        section.classList.add("section-header")
        const sectionObj = data.getSectionById(id)
        section.textContent = sectionObj.title
        section.append(handleTodos(sectionObj.todos))
        taskContainer.append(section)
    })
}

function createAddTodoBtn() {
    const btn = document.createElement("button")
    btn.classList.add("add-todo-btn")
    btn.type = "button"
    btn.addEventListener("click", renderTodoForm)
    btn.textContent = "Add new Todo"
    return btn
}

function createAddSectionBtn() {
    const btn = document.createElement("button")
    btn.classList.add("add-section-btn")
    btn.type = "button"
    btn.addEventListener("click", openAddSectionForm)
    btn.textContent = "Add new section"
    return btn
}

function openAddSectionForm() {
    console.log("Add Section Form was opened")
}

function handleTodos(todoSet) {
    if (!(todoSet instanceof Set)) {
        throw new Error("Argument must be instance of Set")
    }
    const data = new DataStorage()
    const todoList = document.createElement("div")
    todoList.classList.add("todo-list")
    todoSet.forEach(id => {
        todoList.append(initTodoTemplate(data.getTodoById(id)))
    })
    todoList.append(createAddTodoBtn())
    todoList.append(createAddSectionBtn())
    return todoList;
}

function initTodoTemplate(todo) {
    const template = document.querySelector("#todo-item-template")
    const clone = template.content.cloneNode(true)
    const todoContainer = clone.querySelector(".todo-container")
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
    })
    
    afterBtn.before(form)
}

function openPriorSelect() {

}