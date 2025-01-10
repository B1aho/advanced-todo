import styles from "./my-select.css?raw";

// Глобальный реестр всех селектов
const allSelects = new Set()

export class MySelect extends HTMLElement {
    constructor() {
        super()
        console.log("activate-my select")
        // Клонируем шаблон
        const shadow = this.attachShadow({ mode: "open" })
        const template = document.querySelector("#my-select-templ")
        const templateContent = template.content

        // Вставляем клонированный шаблон в элемент
        shadow.append(templateContent.cloneNode(true))
    }

    connectedCallback() {
        allSelects.add(this);
        // Добавляем инкапсулируемые стили
        const style = document.createElement("style")
        style.textContent = styles
        this.shadowRoot.append(style)

        const mySelectBody = this.shadowRoot
        const options = mySelectBody.querySelector(".select-options")
        options.addEventListener("click", (e) => {
            const customEvent = new CustomEvent('handleExtraOption', {
                bubbles: true,
                composed: true, // Событие сможет выйти из Shadow DOM
                detail: {
                    action: e.target.dataset.action,
                    projId: mySelectBody.host.dataset.id
                }
            });
            options.dispatchEvent(customEvent);
        })

        const selectBtn = mySelectBody.querySelector(".select-btn")
        selectBtn.addEventListener("click", (e) => {
            this.closeOtherSelects()
            if (e.target === selectBtn)
                e.stopPropagation()      // Предотвращаем событие от всплытия
            options.classList.toggle("hidden")
            document.addEventListener("click", () => {
                this.closeSelect(options)
            })
        })
    }

    closeSelect() {
        const options = this.shadowRoot.querySelector(".select-options")
        options.classList.add("hidden")
        document.removeEventListener("click", () => {
            this.closeSelect(options)
        })
    }

    setData(optionsArr) {
        const elem = this.shadowRoot
        const options = elem.querySelector(".select-options")
        optionsArr.forEach(optionObj => {
            const option = document.createElement("button")
            option.classList.add("option")
            option.dataset.action = optionObj.action
            option.textContent = optionObj.content
            options.append(option)
        });
    }

    closeOtherSelects() {
        allSelects.forEach((select) => {
            if (select !== this) {
                select.closeSelect();
            }
        });
    }

}


customElements.define("my-select", MySelect)

/**
 * 

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
 */