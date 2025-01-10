import styles from "./my-select.css?raw";  

export class MySelect extends HTMLElement {
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
        
    }

}

customElements.define("my-select", MySelect)