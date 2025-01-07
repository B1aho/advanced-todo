import { DataStorage } from "../dataSaving/dataStorage";
import { countTodoNodes, createAddSectionBtn, createDiagFromTempl, createTodoList } from "./createDOMutility";

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

/**
 * 
 * @param {*} projObj 
 */
export function renderProjectListItem(projObj) {
    const list = document.querySelector("#project-list")
    // Render project list with html template
    const template = document.querySelector("#project-list-item")
    const clone = template.content.cloneNode(true)
    const listItem = clone.querySelector(".sidebar-list-item")
    listItem.setAttribute("data-id", projObj.id)

    const svgContainer = clone.querySelector("span")
    svgContainer.setAttribute("color", projObj.color)

    const title = clone.querySelector(".sidebar-project-title")
    title.textContent = projObj.title

    const header = document.querySelector("#project-list-header")
    const headerText = header.textContent.split(" ")
    headerText[2] = Number(headerText[2]) + 1
    header.textContent = headerText.join(" ")

    list.append(listItem)
}

/**
 * 
 * @param {*} e 
 * @returns 
 */
function handleProjectListClick(e) {
    const target = e.target
    if (target.id === "project-list")
        return
    if (target.classList.contains("sidebar-project-btn"))
        renderExtraOptions(target)
    else
        renderProjectContent(target.parentElement.getAttribute("data-id"))
}

/**
 * 
 * @param {*} target 
 */
function renderExtraOptions(target) {
    console.log("Demonstrate extra options...")
}

/**
 * 
 * @param {*} projectId 
 */
function renderProjectContent(projectId) {
    console.log("Render project..")
    // Cause singletone pattern, i can be sure that it will be same storage evvery time
    const data = new DataStorage()
    const project = data.getProjectById(projectId)

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
    taskContainer.setAttribute("data-id", projectId)
    contentDiv.append(taskContainer)
    // Render porject's todos
    taskContainer.append(createTodoList(project.todos, "project-" + projectId))
    taskContainer.append(createAddSectionBtn("project-" + projectId))
    // Render project's sections
    const sectionTempl = document.querySelector("#section-container-template")
    project.sections.forEach(secId => {
        const clone = sectionTempl.content.cloneNode(true)
        const section = clone.querySelector(".section-container")
        section.setAttribute("data-id", secId)
        const sectionObj = data.getSectionById(secId)
        clone.querySelector(".section-title").textContent = sectionObj.title

        section.append(createTodoList(sectionObj.todos, "section-" + secId))
        taskContainer.append(section)
        taskContainer.append(createAddSectionBtn("project-" + projectId))
    })
}

/**
 * 
 * @param {*} e 
 */
export function RenderTodoDiag(e) {
    let lastDiag = document.querySelector("#todo-dialog")
    if (lastDiag)
        lastDiag.remove()
    const diag = createDiagFromTempl(e)
    document.body.append(diag)
    diag.showModal()
    // diag.addEventListener("click", closeDiag)
}

/**
 * 
 * @param {*} parentId 
 * @param {*} todoNode 
 */
export function updateProjectRendering(parentId, todoNode) {
    const selector = `.todo-container[data-id="${CSS.escape(parentId)}"]`
    const data = new DataStorage()
    // Везде в таких местах предусмотреть ошибки, чтобы программа не крашилась
    let previousSibling = document.querySelector(selector)
    const clone = todoNode.cloneNode(true)
    clone.querySelector(".todo-item").addEventListener("click", RenderTodoDiag)
    clone.classList.remove("diag-indent")
    const taskNumber = countTodoNodes(data.getTodoById(parentId))
    for (let i = 1; i < taskNumber; i++) {
        previousSibling = previousSibling.nextElementSibling
    }
    previousSibling.after(clone)
}

export function updateTodoRemoveRender(todoId, number) {
    const selector = `.todo-container[data-id="${CSS.escape(todoId)}"]`
    let todoItem = document.querySelector(selector)
    
    while (number) {
        const nextTodo = todoItem.nextSibling
        todoItem.remove()
        number--
        todoItem = nextTodo
    }
}