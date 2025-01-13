// Блин, можно же просто id, узлу задать и все, у self брать id, когда надо
import { DataStorage } from "../../dataSaving/dataStorage";
import { addCollapseBtnOnTodo, getCheckColor } from "../../render/createDOMutility";
import { RenderTodoDiag } from "../../render/todoRender";
import styles from "./todo-item.css?raw";

export class TodoItemElement extends HTMLElement {
    constructor() {
        super()

        // Клонируем шаблон
        const shadow = this.attachShadow({ mode: "open" })
        const template = document.querySelector("#todo-item-template")
        const templateContent = template.content

        shadow.append(templateContent.cloneNode(true))

        this.self = this.shadowRoot.host
        this.todo = this.shadowRoot.querySelector(".todo-container")
        this.checkBtn = this.shadowRoot.querySelector(".todo-check-btn")
        this.removeBtn = this.shadowRoot.querySelector(".todo-remove-btn")
        this.todoTitle = this.shadowRoot.querySelector(".todo-title")
        this.todoDesc = this.shadowRoot.querySelector(".todo-desc")
        this.todoDeadline = this.shadowRoot.querySelector(".deadline-container")
        this.todoTags = this.shadowRoot.querySelector(".tags-container")
        this.todoBody = this.shadowRoot.querySelector(".todo-body")

        this.checkTodo = this.checkTodo.bind(this)
        this.setData = this.setData.bind(this)
        this.hide = this.hide.bind(this)
        this.unhide = this.unhide.bind(this)
        this.toggleCheckedTodoContent = this.toggleCheckedTodoContent.bind(this)
        this.confirmRemove = this.confirmRemove.bind(this)

    }

    connectedCallback() {
        const style = document.createElement("style")
        style.textContent = styles

        this.shadowRoot.append(style)
        this.checkBtn.addEventListener("click", this.checkTodo)
        this.removeBtn.addEventListener("click", this.confirmRemove)
        this.todoBody.addEventListener("click", RenderTodoDiag)
    }

    disconnectedCallback() {
        this.checkBtn.removeEventListener("click", this.checkTodo)
        this.removeBtn.removeEventListener("click", this.confirmRemove)
        this.todoBody.removeEventListener("click", RenderTodoDiag)
    }

    setData(todoObj) {
        if (todoObj.checked)
            this.hide()
        this.todoId = todoObj.id
        this.self.dataset.id =  todoObj.id
        this.self.dataset.indent = todoObj.indent

        this.todo.dataset.id = todoObj.id
        this.todoBody.dataset.id = todoObj.id
        // this.checkBtn.setAttribute("data-id", todoObj.id)
        this.checkBtn.style.backgroundColor = getCheckColor(todoObj.priorLevel)

        if (haveUncheckedSubtask(todoObj)) {
            addCollapseBtnOnTodo(this.todo)
        }

        this.todoTitle.textContent = todoObj.title
        this.todoDesc.textContent = todoObj.desc
        this.todoDeadline.textContent = todoObj.deadline

        if (todoObj.tags) {
            todoObj.tags.forEach((tag) => {
                const tagSpan = document.createElement("span")
                tagSpan.classList.add("tag")
                tagSpan.textContent = tag
                this.todoTags.append(tagSpan)
            })
        }

        // this.todoBody.setAttribute("data-id", todoObj.id)

        if (todoObj.checked) {
            this.checkBtn.classList.add("checked")
            this.todoBody.classList.add("checked")
        }
    }

    // Может вообще сделаем, что dispatchEvent, со ссылкой на узел, и его удаляет уже родиткльский компонент, после подтверждения
    confirmRemove() {
        const customEvent = new CustomEvent("showConfirmDiag", {
            bubbles: true,
            composed: true,
            detail: { id: this.todoId } 
        })

        this.self.dispatchEvent(customEvent)
    }

    checkTodo() {
        const data = new DataStorage()
        const todoObj = data.getTodoById(this.todoId)
        // Dispatch наверх списку что тогнули с id
        const customEvent = new CustomEvent("todoChecked", {
            bubbles: true,
            composed: true,
            detail: { todoObj: todoObj } 
        })

        this.self.dispatchEvent(customEvent)
     }

    toggleCheckedTodoContent() {
        this.checkBtn.classList.toggle("checked")
        this.todoBody.classList.toggle("checked")
    }

    hide() {
        this.self.classList.add("checked")
    }

    unhide() {
        this.self.classList.remove("checked")
    }
}

customElements.define("todo-item", TodoItemElement)

function haveUncheckedSubtask(todo) {
    const subtaskIdSet = todo.subtask
    if (subtaskIdSet.size <= 0)
        return false
    for (const id of subtaskIdSet) {
        if (!new DataStorage().getTodoById(id).checked)
            return true
    }
    return false
}