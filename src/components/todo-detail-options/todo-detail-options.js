import styles from "./todo-detail-option.css?raw"; 

export class TodoDetailOptions extends HTMLElement {
    constructor() {
        super()
        // Клонируем шаблон
        const shadow = this.attachShadow({ mode: "open" })
        const template = document.querySelector("#detail-options-templ")
        const templateContent = template.content
        shadow.append(templateContent.cloneNode(true))

        this.closeBtn = this.shadowRoot.querySelector("#close-diag-btn")
        this.checkBtn = this.shadowRoot.querySelector("#todo-check-btn")
        this.title = this.shadowRoot.querySelector("#diag-todo-title")
        this.desc = this.shadowRoot.querySelector("#diag-todo-desc")
        this.subtaskList = this.shadowRoot.querySelector("#subtask-list")
        this.shadowRoot.querySelector("")
 
    }

    connectedCallback() {
        // Логика при добавлении компонента в DOM
        const style = document.createElement("style")
        style.textContent = styles

        this.shadowRoot.append(style)
    }

    disconnectedCallback() {
    }
}

customElements.define("todo-detail-option", TodoDetailOptions)