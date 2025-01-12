import { format } from "date-fns";
import { ItcCustomSelect } from "../../../assets/select/itc-custom-select";
import styles from "./add-todo-form.css?raw";
import { pickTodoFormData } from "../../render/todoForm";

export class AddTodoForm extends HTMLElement {
    constructor() {
        super()

        // Клонируем шаблон
        const shadow = this.attachShadow({ mode: "open" })
        const template = document.querySelector("#todo-form-template")
        const templateContent = template.content

        shadow.append(templateContent.cloneNode(true))

        this.form = this.shadowRoot.querySelector(".todo-form")

        this.dateInput = this.form.querySelector(".deadline")
        new Datepicker(this.dateInput, {
            minDate: format(new Date(), "P"),
            autohide: true,
            title: "Set dead line",
            clearButton: true,
            todayButton: true,
        })

        this.select = this.form.querySelector("#priority-menu")
        new ItcCustomSelect(this.select)

        this.cancelBtn = this.form.querySelector(".cancel-btn")
        this.submitBtn = this.form.querySelector(".submit-btn")
    }

    connectedCallback() {
        const style = document.createElement("style")
        style.textContent = styles

        this.shadowRoot.append(style)
    }

    disconnectedCallback() {
        this.cancelBtn.rempveEventListener("click", this.cancelForm)
        this.submitBtn.removeEventListener("click", this.submitForm)
    }


    setEventListeners(addTodoBtn) {
        this.addTodoBtn = addTodoBtn

        this.cancelBtn.addEventListener("click", this.cancelForm)
        this.submitBtn.addEventListener("click", this.submitForm)
    }

    cancelForm() {
        this.form.remove()
        this.addTodoBtn.style.display = "block"
    }

    // Метод доделать
    submitForm(evt) {
        if (!this.form.reportValidity())
            return
        evt.preventDefault()

        const formValues = pickTodoFormData(form.elements)
        this.form.remove()
        this.addTodoBtn.style.display = "block"

        // В случае подтверждения формы будет dispatch event наружу с todoObj
        // Там проект контейнер ловит это событие и управляет дальнейше логикой создания todo 
        const parentId = this.addTodoBtn.getAttribute("data-parent-id")
        const todoObj = createTodoObj(formValues, parentId)
        const todoNode = document.createElement("todo-item")
        todoNode.setData(todoNode)
        // В форме нет смысла что-то свертывать
        const collapseBtn = todoNode.querySelector(".collapse-btn")
        if (collapseBtn)
            collapseBtn.remove()
        if (btn.classList.contains("add-todo-btn")) {
            btn.before(todoNode)
        } else {
            todoNode.classList.add("diag-indent")
            document.querySelector(".subtask-diag-list").append(todoNode)
            updateProjectRendering(todoObj.parentId, todoNode)
        }
    }
}

customElements.define("add-todo-form", AddTodoForm)
