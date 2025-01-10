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
        this.shadowRoot.append(style)
    }

    setData(project) {
        const elem = this.shadowRoot

        const listItem = elem.querySelector(".sidebar-list-item")
        elem.host.setAttribute("data-id", project.id)
        elem.host.setAttribute("draggable", true)
        elem.host.classList.add("project-list-item")
        listItem.setAttribute("data-id", project.id)

        const svgContainer = listItem.querySelector(".sidebar-svg-container")
        svgContainer.setAttribute("color", project.color)

        const select = document.createElement("my-select")
        listItem.append(select)
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

        select.setAttribute("data-id", project.id)

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