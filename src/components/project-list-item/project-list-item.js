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
        style.textContent = styles

        this.self = this.shadowRoot
        this.listItem = this.self.querySelector(".sidebar-list-item")

        this.self.append(style)
    }

    disconnectedCallback() {
    }

    setData(project) {
        const shadow = this.shadowRoot
        const listItem = shadow.querySelector(".sidebar-list-item")
        this.setAttribute("data-id", project.id)
        this.setAttribute("draggable", true)
        this.classList.add("project-list-item")
        listItem.setAttribute("data-id", project.id)

        const svgContainer = listItem.querySelector(".sidebar-svg-container")
        svgContainer.setAttribute("color", project.color)

        const select = document.createElement("my-select")
        const options = [
            {
                action: "remove",
                content: "Удалить",
            },
            {
                action: "change",
                content: "Изменить",
            },
        ];
        select.setData(options)
        select.setAttribute("data-id", project.id)
        listItem.append(select)

        const title = listItem.querySelector(".sidebar-project-title")
        title.textContent = project.title

        // 
        listItem.addEventListener("click", (e) => {
            if (e.target !== select) {
                const customEvent = new CustomEvent('openProject', {
                    bubbles: true,
                    composed: true, // Событие сможет выйти из Shadow DOM
                    detail: { id: project.id } // Передаем строку через detail
                });
                listItem.dispatchEvent(customEvent);
            }
        })
    }

}

customElements.define("project-list-item", ProjectListItem)