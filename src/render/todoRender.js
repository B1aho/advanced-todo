import { DataStorage } from "../dataSaving/dataStorage";
import { checkTodo, countTodoNodes, createAddSectionBtn, createConfirmDiagAndShow, createDiagFromTempl, createTodoList, handleDragoverProjectList, handleProjectExtraOption, handleSectionExtraOption, showActualTodos, showCompletedTodos } from "./createDOMutility";

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

        const select = clone.querySelector(".select-project-btn")
        const options = clone.querySelector(".options")
        options.setAttribute("data-id", val.id)
        select.setAttribute("data-id", val.id)

        const title = clone.querySelector(".sidebar-project-title")
        title.textContent = val.title

        list.append(listItem)
    })
    // Вешаем слушатель, который по нажатию определяет, если на сам проект нажали - открывает его
    // если на кнопку в контейнере, то открывает меню с опциям: удалить, добавить в избранное, изменить
    list.addEventListener("click", handleProjectListClick)

    list.addEventListener('dragstart', (e) => {
        //e.dataTransfer.setData('text/plain', e.target.dataset.id); // Запоминаем ID
        e.target.classList.add('dragging')
    });

    list.addEventListener('dragend', (e) => {
        e.target.classList.remove('dragging')
    });

    list.addEventListener(`dragover`, handleDragoverProjectList)
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

    const select = clone.querySelector(".select-project-btn")
    const options = clone.querySelector(".options")
    options.setAttribute("data-id", projObj.id)
    select.setAttribute("data-id", projObj.id)

    changeProjectListHeaderNumber(1)

    list.append(listItem)
}

/**
 * 
 * @param {Event} e 
 * @returns 
 */
function handleProjectListClick(e) {
    e.stopPropagation()
    hideOptions(e)
    const target = e.target
    if (target.id === "project-list" || target.id === "project-list-header")
        return
    else if (target.classList.contains("option"))
        handleProjectExtraOption(target)
    else if (target.classList.contains("select-project-btn"))
        renderExtraOptions(target.getAttribute("data-id"))
    else
        renderProjectContent(target.parentElement.getAttribute("data-id"))
}

function changeProjectListHeaderNumber(number) {
    const header = document.querySelector("#project-list-header")
    const headerText = header.textContent.split(" ")
    headerText[2] = Number(headerText[2]) + number
    header.textContent = headerText.join(" ")
}

/**
 * 
 * @param {*} id 
 */
function renderExtraOptions(id) {
    console.log(id)
    hideOptions()
    const selector = `.select-project-btn[data-id="${CSS.escape(id)}"]`
    const options = document.querySelector(selector).nextElementSibling
    options.classList.toggle("hidden")
    document.addEventListener("click", hideOptions)
}

export function renderSectionExtraOptions(e) {
    const id = e.target.getAttribute("data-id")
    hideOptions(e)
    const selector = `.select-section-btn[data-id="${CSS.escape(id)}"]`
    const options = document.querySelector(selector).nextElementSibling
    options.classList.toggle("hidden")
    document.addEventListener("click", hideOptions)
}

export function hideOptions(e) {
    if (e && (e.target.closest('.options') || e.target.classList.contains("select-section-btn"))) {
        return
    }
    const options = document.querySelectorAll(".options")
    options.forEach(opt => opt.classList.add("hidden"))
    document.removeEventListener("click", hideOptions)
}

/**
 * 
 * @param {*} projectId 
 */
function renderProjectContent(projectId) {
    // Cause singletone pattern, i can be sure that it will be same storage evvery time
    const data = new DataStorage()
    const project = data.getProjectById(projectId)
    if (project === undefined) {
        console.warn("Project is undefined in renderProjectContent. Can't load project's content")
        return
    }
    // Render project header
    const contentDiv = document.querySelector("main")
    contentDiv.innerHTML = ""
    const templ = document.querySelector("#project-templ")
    const clone = templ.content.cloneNode(true)
    const title = clone.querySelector(".project-title")
    title.textContent = project.title

    // Init filters behaviour
    const allTodosBtn = clone.querySelector("#all-todos-btn")
    allTodosBtn.addEventListener("click", showActualTodos)
    const completedBtn = clone.querySelector("#comleted-todos-btn")
    completedBtn.addEventListener("click", showCompletedTodos)

    // Creater main content container
    const taskContainer = clone.querySelector(".project-container")
    taskContainer.setAttribute("data-id", projectId)
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

        const select = clone.querySelector(".select-section-btn")
        const options = clone.querySelector(".options")
        options.setAttribute("data-id", secId)
        select.setAttribute("data-id", secId)
        select.addEventListener("click", renderSectionExtraOptions)
        options.addEventListener("click", (e) => {
            const target = e.target
            if (target.classList.contains("option"))
                handleSectionExtraOption(target)
        })
        section.append(createTodoList(sectionObj.todos, "section-" + secId))
        taskContainer.append(section)
        taskContainer.append(createAddSectionBtn("project-" + projectId))
    })
    contentDiv.append(clone)
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
    const removeBtn = clone.querySelector(".todo-remove-btn")
    removeBtn.addEventListener("click", () => {
        createConfirmDiagAndShow(todoNode.getAttribute("data-id"), "todo")
    })

    // Возвращаем слушаетли для клона - продумать более оптимальную стратегию
    const checkBtn = clone.querySelector(".todo-check-btn")
    checkBtn.addEventListener("click", (e) => {
        checkTodo(e, new DataStorage().getTodoById(todoNode.getAttribute("data-id")))
    })

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

export function updateProjectListAfterDeletion(projId) {
    // Просто найти проджект лист итем с этим айди и удалить узел
    const selector = `.sidebar-list-item[data-id="${CSS.escape(projId)}"]`
    const projListItem = document.querySelector(selector)
    projListItem.remove()
    changeProjectListHeaderNumber(-1)
}

export function updateProjectContentAfterDeletion(projId) {
    // Проверить есть ли в main такой узлел и если есть, очистить main innerhtml
    const selector = `.project-container[data-id="${CSS.escape(projId)}"]`
    const projContainer = document.querySelector(selector)
    if (projContainer)
        document.querySelector("main").innerHTML = ""
}

export function updateSectionContentAfterDeletion(sectId) {
    // Проверить есть ли в main такой узлел и если есть, очистить main innerhtml
    const selector = `.section-container[data-id="${CSS.escape(sectId)}"]`
    const sectContainer = document.querySelector(selector)
    if (sectContainer) {
        sectContainer.nextElementSibling.remove()
        sectContainer.remove()
    }
}

export function updateProjectListAfterChanging(proj) {
    const projId = proj.id
    // Просто найти проджект лист итем с этим айди и изменить узел
    const selector = `.sidebar-list-item[data-id="${CSS.escape(projId)}"]`
    const projListItem = document.querySelector(selector)
    const title = projListItem.querySelector(".sidebar-project-title")
    title.textContent = proj.title
}

export function updateProjectContentAfterChanging(proj) {
    const projId = proj.id
    // Проверить есть ли в main такой узлел и если есть - зименить хедер
    const selector = `.project-container[data-id="${CSS.escape(projId)}"]`
    const projContainer = document.querySelector(selector)
    if (projContainer) {
        const header = document.querySelector(".project-title-container").querySelector("h1")
        header.textContent = proj.title
    }
}