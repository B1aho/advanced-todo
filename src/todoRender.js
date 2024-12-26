function renderProject(project) {

}

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
        onSidebarProjectClick(target)
}

function onSidebarProjectBtnClick(target) {
    console.log("Democtrate extra options...")
}

// Render project content at main
function onSidebarProjectClick(target) {
    console.log("Render project..")
}