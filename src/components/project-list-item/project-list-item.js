import styles from "./project-list-item.css?raw";  // Подключаем стили

export class ProjectListItem extends HTMLElement {
    constructor() {
        super()
        // Клонируем шаблон
        const shadow = this.attachShadow({ mode: "open" })
        const template = document.querySelector("#project-list-item")
        const templateContent = template.content

        // Вставляем клонированный шаблон в элемент
        shadow.append(templateContent.cloneNode(true))
    }

    connectedCallback() {
        // Логика при добавлении компонента в DOM
        const style = document.createElement("style")
        console.log(style.isConnected)
        console.log(styles)
        style.textContent = styles
        this.shadowRoot.append(style)
    }

    setData(project) {
        console.log("Устанавливаем данные")
        const elem = this.shadowRoot

        const listItem = elem.querySelector(".sidebar-list-item")
        elem.host.setAttribute("data-id", project.id)
        elem.host.setAttribute("draggable", true)
        elem.host.classList.add("project-list-item")
        listItem.setAttribute("data-id", project.id)

        const svgContainer = listItem.querySelector(".sidebar-svg-container")
        svgContainer.setAttribute("color", project.color)

        const select = listItem.querySelector(".select-project-btn")
        const options = listItem.querySelector(".options")

        options.setAttribute("data-id", project.id)
        select.setAttribute("data-id", project.id)

        const title = listItem.querySelector(".sidebar-project-title")
        title.textContent = project.title
    }
}

customElements.define("project-list-item", ProjectListItem)