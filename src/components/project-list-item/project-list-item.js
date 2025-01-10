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

        this.attachEventToSelect(select, options)

        options.setAttribute("data-id", project.id)
        options.addEventListener("click", (e) => {
            const customEvent = new CustomEvent('handleExtraOption', {
                bubbles: true,
                composed: true, // Событие сможет выйти из Shadow DOM
                detail: {
                    action: e.target.dataset.action,
                    projId: project.id
                } // Передаем строку через detail
            });
            listItem.dispatchEvent(customEvent);
        })
        select.setAttribute("data-id", project.id)

        const title = listItem.querySelector(".sidebar-project-title")
        title.textContent = project.title

        // 
        listItem.addEventListener("click", (e) => {
            if (e.target === svgContainer || e.target === title) {
                const customEvent = new CustomEvent('openProject', {
                    bubbles: true,
                    composed: true, // Событие сможет выйти из Shadow DOM
                    detail: { id: project.id } // Передаем строку через detail
                });
                listItem.dispatchEvent(customEvent);
            }
        })
    }

    closeOption() {
        const elem = this.shadowRoot
        const options = elem.querySelector(".options")
        options.classList.add("hidden")
    }

    attachEventToSelect(selectBtn, options) {
        selectBtn.addEventListener("click", () => {
            options.classList.toggle("hidden")

            const eventName = options.classList.contains("hidden")
            // Понятное имя условию дай
            if (!eventName) {
                const customEvent = new CustomEvent('openOptions', {
                    bubbles: true,
                    composed: true, // Событие сможет выйти из Shadow DOM
                    detail: { 
                        options: options,
                        id: selectBtn.dataset.id
                     } // Передаем строку через detail
                });
                selectBtn.dispatchEvent(customEvent);
            }
        })
    }

}

customElements.define("project-list-item", ProjectListItem)