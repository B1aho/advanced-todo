/**
 * Данный компонент похож на todo-list, но с упрощенным функционалом
 * Он также ловит события разных форма связанных с добавлением задач, обрабатывает их
 * И также эти события доходят потом до todo-list и он уже обрабатывает с более сложной логикой
 */
import { DataStorage } from "../../dataSaving/dataStorage";
import styles from "./subtask-list.css?raw";  // Подключаем стили

export class SubtaskList extends HTMLElement {
    constructor() {
        super()
        // Клонируем шаблон
        this.attachShadow({ mode: "open" })

        this.list = this.shadowRoot.host

        this.handleSubtaskSet = this.handleSubtaskSet.bind(this)
    }

    connectedCallback() {
        // Логика при добавлении компонента в DOM
        const style = document.createElement("style")
        style.textContent = styles
        this.shadowRoot.append(style)

        this.addTodoBtn.addEventListener("click", this.renderTodoForm)
        this.list.addEventListener("formValue", this.createTodoItem)
        this.list.addEventListener("cancelForm", this.showButton)
        this.list.addEventListener("todoChecked", this.handleTodoCheck)
        this.list.addEventListener("showConfirmDiag", (e) => {
            this.diag.showDiag(e)
        })
        this.list.addEventListener("removeElement", this.removeTodo)
    }

    disconnectedCallback() {
        this.addTodoBtn.removeEventListener("click", this.renderTodoForm)
        this.list.removeEventListener("formValue", this.createTodoItem)
        this.list.removeEventListener("cancelForm", this.showButton)
        this.list.removeEventListener("todoChecked", this.handleTodoCheck)
        this.list.removeEventListener("showConfirmDiag", (e) => {
            this.diag.showDiag(e)
        })
        this.list.removeEventListener("removeElement", this.removeTodo)
    }

    handleSubtaskSet(subtaskSet) {
        if (!(subtaskSet instanceof Set)) {
            throw new Error("Argument must be instance of Set")
        }
        const data = new DataStorage()
        // Здесь надо проверить есть ли вложенные туду и функцию для их генерации, на забывая отступ
        subtaskSet.forEach(id => {
            const todo = data.getTodoById(id)
            const todoNode = document.createElement("todo-item")
            todoNode.setData(todo)
            this.shadowRoot.append(todoNode)
        })
        this.addTodoBtn = this.createAddTodoBtn()
        this.shadowRoot.append(this.addTodoBtn)
    }

    /**
     * Factory that create button that can render form for creating todo
     * @param {String} parentId - string that represent parent's id (project or section id)
     * @returns {HTMLButtonElement}
     */
    createAddTodoBtn() {
        const btn = document.createElement("button")
        btn.classList.add("add-todo-btn")
        btn.type = "button"
        btn.setAttribute("data-parent-id", this.parentId)
        btn.textContent = "Add new subtask"
        return btn
    }

    /**
    * 
    * @param {*} formValues 
    * @param {*} parentId 
    * @returns 
    */
    addTodoItemFromForm(e) {
        const formValues = e.detail.formValues
        const data = new DataStorage()
        const id = this.parentId
        let parent = data.getTodoById(id)
        
        formValues.tags = formValues.tags.split(" ")
        formValues.deadline = formValues.deadline ? formValues.deadline : null

        const todo = parent.createTodo(formValues)
        data.saveTodo(todo)
        saveData()

        const todoNode = document.createElement("todo-item")
        todoNode.setData(todo)
        this.showButton()
        this.addTodoBtn.before(todoNode)
    }

    showButton() {
        this.addTodoBtn.style.display = "block"
    }

    renderTodoForm() {
        const form = document.createElement("add-todo-form")
        this.addTodoBtn.before(form)
        this.addTodoBtn.style.display = "none"
    }
}

customElements.define("subtask-list", SubtaskList)
