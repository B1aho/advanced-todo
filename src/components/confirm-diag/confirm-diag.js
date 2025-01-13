import styles from "./confirm-diag.css?raw";  // Подключаем стили

export class ConfirmDiag extends HTMLElement {
    constructor(warningText) {
        super()
        if (!warningText)
            warningText = "Элемент со всеми под-элементами будет удален безвозвратно!"
        // Клонируем шаблон
        const shadow = this.attachShadow({ mode: "open" })
        const template = document.querySelector("#confirm-diag-templ")
        const templateContent = template.content

        // Вставляем клонированный шаблон в элемент
        shadow.append(templateContent.cloneNode(true))
        this.removeBtn = this.shadowRoot.querySelector("#remove-elem-btn")
        this.cancelBtn = this.shadowRoot.querySelector("#close-confirm-diag")
        this.textWarning = this.shadowRoot.querySelector("#text-warning")
        this.diag = this.shadowRoot.querySelector("#confirm-remove-diag")
        this.textWarning.textContent = warningText

        this.dispatchRemoveEvent = this.dispatchRemoveEvent.bind(this)
        this.closeDiag = this.closeDiag.bind(this)
    }

    connectedCallback() {
        // Логика при добавлении компонента в DOM
        const style = document.createElement("style")
        style.textContent = styles

        this.shadowRoot.append(style)
        this.removeBtn.addEventListener("click", this.dispatchRemoveEvent)
        this.cancelBtn.addEventListener("click", this.closeDiag)
    }

    disconnectedCallback() {
        this.removeBtn.removeEventListener("click", this.dispatchRemoveEvent)
        this.cancelBtn.removeEventListener("click", this.closeDiag)
    }

    dispatchRemoveEvent() {
        const customEvent = new CustomEvent("removeElement", {
            bubbles: true,
            composed: true,
            detail: { id: this.elemId}
        });
        this.shadowRoot.dispatchEvent(customEvent)
        this.diag.close()
    }

    closeDiag() {
        this.diag.close()
        // попробовать не удалять, нам же не надо каждый раз удалять его с веб-компонентами
        //this.shadowRoot.host.remove()
    }

    showDiag(e) {
        this.diag.showModal()
        this.elemId = e.detail.id
    }
}

customElements.define("confirm-diag", ConfirmDiag)



// export function createConfirmDiagAndShow(id, type) {
//     const templ = document.querySelector("#confirm-diag-templ")
//     const clone = templ.content.cloneNode(true)
//     const diag = clone.querySelector(".confirm-remove")

//     const closeDiag = clone.querySelector("#close-confirm-diag")
//     closeDiag.addEventListener("click", () => {
//         diag.close()
//         diag.remove()
//     })

//     const confirmBtn = clone.querySelector("#remove-elem-btn")
//     confirmBtn.addEventListener("click", () => {
//         const data = new DataStorage()
//         if (type === "todo")
//             updateTodoRemoveRender(id, data.removeElement(id))
//         else if (type === "section")
//             removeSection(id)
//         else
//             removeProject(id)
//         saveData()
//         diag.close()
//         diag.remove()
//     })
