import { DataStorage } from "./dataStorage";

/**
 * 
 * @param {*} projectMap 
 */
export function renderListOfProjects(projectMap) {
    if (!(projectMap instanceof Map))
        throw new Error("projectMap must be an istance of Map()!")
    const list = document.querySelector("#project-list")
    // Преобразуем Map объектов-проектов в массив пар имя-проекта:id-проекта
    // Далее проходим сортируем этот массив по имени в алфавитном порядке и 
    // Рендерим имена проектов (div с именем), добваляя id как data-attr, чтобы потом по нажатию
    // Запускался обработчик, который получал id и отображал нужный проект. Слушатель вешаем в конце на list

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

    // Render project list
    projectList.forEach(val => {
        const container = document.createElement("div")
        container.classList.add("sidebar-list-item")
        container.setAttribute("data-id", val.id)

        const svgContainer = document.createElement("span")
        svgContainer.classList.add("sidebar-svg-container")
        svgContainer.setAttribute("color", val.color)

        const title = document.createElement("div")
        title.classList.add("sidebar-project-title")
        title.textContent = val.title

        const extraOptions = document.createElement("button")
        extraOptions.classList.add("sidebar-project-btn")

        container.append(svgContainer, title, extraOptions)
        list.append(container)
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
    btn.addEventListener("click", createTodoForm)
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
        todoList.append(getTodoElement(data.getTodoById(id)))
    })
    todoList.append(createAddTodoBtn())
    todoList.append(createAddSectionBtn())
    return todoList;
}

function getTodoElement(todo) {
    const todoContainer = document.createElement("div")
    todoContainer.classList.add("todo-container")

    const checkBtn = document.createElement("button")
    checkBtn.classList.add("todo-check-btn")
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

    const todoContent = document.createElement("div")
    todoContent.classList.add("todo-item")

    const todoHeader = document.createElement("div")
    todoHeader.classList.add("todo-content")
    todoHeader.textContent = todo.title
    const todoDesc = document.createElement("div")
    todoDesc.classList.add("todo-content")
    todoDesc.textContent = todo.desc
    const todoOther = document.createElement("div")
    todoOther.classList.add("todo-content")
    todoContent.append(todoHeader, todoDesc, todoOther)

    todoContainer.append(checkBtn, todoContent)
    return todoContainer
}

function createTodoForm(e) {
    const btn = e.target
    btn.style.display = "none"
    const afterBtn = btn.nextElementSibling
    // Создаём форму, у которой будет ещё две кнопки отправить и закрыть, на кнопку закрыть вешаем слушатель
    // Который прямо здесь замыкаем на btn, он её возвращает display block
    const form = document.createElement("form")
    form.classList.add("todo-form")

    // create title input
    const titleInput = document.createElement("input")
    titleInput.classList.add("form-input")
    titleInput.type = "text"
    titleInput.maxLength = 100
    form.append(titleInput)

    // create description input
    const descInput = document.createElement("input")
    descInput.classList.add("form-input")
    descInput.type = "text"
    descInput.maxLength = 100
    form.append(descInput)

    // div с кнопками: deadline, приоритет, тэги

    // div с отображением местоположения todo и кнопками отправить или закрыть

    // 
    
    afterBtn.before(form)
}