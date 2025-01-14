/**
 * Компонент отвечающий за детальное прдеставление задачи
 * Имеет дочерний компонент: textAreaForm, - форма для имзенения описания или названия задачи на лету
 * diag options - тоже сделать отдельным компонентом - как имзенения какие-то он пускает наверх событие и это событие 
 * слушает как detail-этот диалого, так и todo-list и вносят изменения в рендеринг
 * Также и textAreaForm генерирует событие которое они оба слушают, 
 * Также и checkBtn
 * Также и addSubtask добавляет сюда todo-item и в todo-list, добавляет todo-item по событию испускаемому
 * 
 * Субтаска, которая здесь в subtakList, которая по существу todo-item при нажатии, генерит open detail view
 * Что означает, что todo-list открывает компонент todo-detail, значит todo-detail сначала закрывает себя на всякий случай
 */
import { DataStorage } from "../../dataSaving/dataStorage";
import { getCheckColor } from "../../render/createDOMutility";
import { ConfirmDiag } from "../confirm-diag";
import styles from "./todo-detail.css?raw"; 

export class TodoDetail extends HTMLElement {
    constructor() {
        super()
        // Клонируем шаблон
        const shadow = this.attachShadow({ mode: "open" })
        const template = document.querySelector("#todo-detail-templ")
        const templateContent = template.content
        shadow.append(templateContent.cloneNode(true))
        this.confirmDiag = new ConfirmDiag("Эта задача будет удалена со всеми подзадачами - безвозвратно!")
        this.shadowRoot.append(this.confirmDiag)
        this.closeBtn = this.shadowRoot.querySelector("#close-diag-btn")
        this.checkBtn = this.shadowRoot.querySelector("#todo-check-btn")
        this.todoTitle = this.shadowRoot.querySelector("#diag-todo-title")
        this.desc = this.shadowRoot.querySelector("#diag-todo-desc")
        this.mainPart = this.shadowRoot.querySelector("#main-part")
        this.subtaskList = document.createElement("subtask-list")
        this.mainPart.append(this.subtaskList)
        this.optionWrapper = this.shadowRoot.querySelector("#option-part")
        this.options = document.createElement("todo-detail-options")
        this.optionWrapper.append(this.options)
        this.diag = this.shadowRoot.querySelector("#todo-detail-dialog")

        this.showDiag = this.showDiag.bind(this)
        this.closeDiag = this.closeDiag.bind(this)
    }

    connectedCallback() {
        // Логика при добавлении компонента в DOM
        const style = document.createElement("style")
        style.textContent = styles

        this.shadowRoot.append(style)
        this.closeBtn.addEventListener("click", this.closeDiag)
        this.shadowRoot.addEventListener("showConfirmDiag", (e) => {
            e.stopPropagation()
            this.confirmDiag.showDiag(e)
        })
    }

    disconnectedCallback() {
        this.closeBtn.removeEventListener("click", this.closeDiag)
        this.shadowRoot.removeEventListener("showConfirmDiag", (e) => {
            this.confirmDiag.showDiag(e)
        })
        this.shadowRoot.removeEventListener("removeElement", this.subtaskList.removeTodo)
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
    }

    // Данные должные при открытии заполнятся
    showDiag(e) {
        this.todoId = e.detail.id
        const data = new DataStorage()
        const todoObj = data.getTodoById(this.todoId)
        this.todoTitle.textContent = todoObj.title
        this.desc.textContent = todoObj.desc
        this.options.updateData(todoObj)
        this.subtaskList.remove()
        this.subtaskList = document.createElement("subtask-list")
        this.mainPart.append(this.subtaskList)
        this.subtaskList.id = e.detail.id
        this.subtaskList.renderSubtasks(todoObj.subtask, (todoObj.indent < 5))
        this.shadowRoot.addEventListener("removeElement", this.subtaskList.removeTodo)
        if (!this.diag.open)
            this.diag.showModal()
    }
}

customElements.define("todo-detail", TodoDetail)


/**
 * 
 * @param {*} e 
 */
export function RenderTodoDiag(e) {
    let lastDiag = document.querySelector("#todo-dialog")
    if (lastDiag)
        lastDiag.remove()
    const diag = createDiagFromTempl(e)
    document.body.append(diag)
    diag.showModal()
}

/**
 * This function creates a dialog window based on an HTML template (initializing the template) and returns
 * the HTML element of this dialog. The dialog window visualizes an extended representation of the todo,
 * allowing you to edit all todo parameters and add subtasks to the todo
 * @param {Event} e 
 * @returns {HTMLElement}
 */
export function createDiagFromTempl(e) {
    const template = document.querySelector("#diag-templ")
    const clone = template.content.cloneNode(true)
    const diag = clone.querySelector("#todo-dialog")
    const todoId = e.currentTarget.getAttribute("data-id")

    const data = new DataStorage()
    const todo = data.getTodoById(todoId)

    const checkBtn = diag.querySelector(".todo-check-btn")

    checkBtn.setAttribute("data-id", todoId)
    checkBtn.addEventListener("click", (e) => {
        checkTodo(e, todo)
    })
    checkBtn.style.backgroundColor = getCheckColor(todo.priorLevel)
    const diagTitle = diag.querySelector(".diag-todo-title")
    diagTitle.textContent = todo.title
    const diagDesc = diag.querySelector(".diag-todo-desc")
    diagDesc.textContent = todo.desc === "" ? "Описание" : todo.desc

    const subtaskList = diag.querySelector(".subtask-diag-list")
    const subtaskArr = []
    if (todo.subtask.size > 0) {
        fillArrayWithDirectSubtaskNodes(subtaskArr, todo)
        subtaskArr.forEach(subtask => {
            subtask.classList.add("diag-indent")
            subtaskList.append(subtask)
        })
    }

    const otherOptions = diag.querySelector(".diag-options")

    if (todo.checked) {
        const todoWrapper = clone.querySelector(".cursor-wrapper-todo")
        const optionWrapper = clone.querySelector(".cursor-wrapper-options")
        otherOptions.classList.add("checked")
        optionWrapper.classList.add("checked")
        todoWrapper.classList.add("checked")
    }

    if (todo.indent < 5)
        otherOptions.prepend(createAddSubtaskBtn("todo-" + todoId))

    const diagTextContainer = diag.querySelector(".diag-todo-item")
    diagTextContainer.setAttribute("data-id", todoId)
    diagTextContainer.addEventListener("click", () => createTodoTextForm(todo, diagTextContainer))

    const changeDeadline = diag.querySelector("#change-deadline")
    changeDeadline.value = todo.deadline
    new Datepicker(changeDeadline, {
        minDate: format(new Date(), "P"),
        autohide: true,
        title: "Change dead line",
        clearButton: true,
        todayButton: true,
    })
    changeDeadline.addEventListener("changeDate", () => {
        todo.deadline = changeDeadline.value
        updateTodoDeadline(todo.id, changeDeadline.value)
        saveData()
    })

    const select = diag.querySelector("#priority-menu-diag")
    new ItcCustomSelect(select, {
        onSelected(select) {
            todo.priorLevel = select.value
            selectBtn.textContent = getCheckWord(todo.priorLevel)
            const selector = `.todo-container[data-id="${CSS.escape(todo.id)}"]`
            const todoContainer = document.querySelector(selector)
            const todoCheckbtn = todoContainer.querySelector(".todo-check-btn")
            const newColor = getCheckColor(todo.priorLevel)
            todoCheckbtn.style.backgroundColor = newColor
            checkBtn.style.backgroundColor = newColor
            saveData()
        }
    })
    const selectBtn = select.querySelector("button")
    selectBtn.textContent = getCheckWord(todo.priorLevel)

    const tagList = diag.querySelector(".tag-list")
    createTagsNodes(tagList, todo)
    const tagAddInput = diag.querySelector("#add-tag-input")
    const tagAddBtn = diag.querySelector("#add-tag-btn")
    tagAddBtn.addEventListener("click", () => {
        if (tagAddInput.value === "")
            return
        todo.setTags(tagAddInput.value.split(" "))
        updateTodoTags(todo)
        tagList.innerHTML = ""
        createTagsNodes(tagList, todo)
        saveData()
        tagAddInput.value = ""
    })
    const closeBtn = diag.querySelector("#close-diag-btn")
    closeBtn.addEventListener("click", () => {
        diag.close()
    })

    if (todo.checked) {
        checkBtn.classList.add("checked")
        diagTextContainer.classList.add("checked")
    }

    return diag
}

/**
 * It creates HTML elements from each todo's subtask (but not subtask's subtasks) and places these nodes 
 * into the passed array without returning anything
 * @param {Array} arr 
 * @param {TodoItem} todo 
 */
function fillArrayWithDirectSubtaskNodes(arr, todo) {
    const data = new DataStorage()
    const subtaskSet = todo.subtask
    subtaskSet.forEach(subtaskId => {
        const subtask = data.getTodoById(subtaskId)
        // add todoNode to the array
        // add todoNode to the array
        const todoNode = document.createElement("todo-item")
        todoNode.setData(subtask)
        arr.push(todoNode)
    })
}

/**
 * Fabric that create button that can render form for creating subtask
 * @param {String} parentId - string that represent parent's id.
 * Only instances of TodoItem can be parents of subtasks
 * @returns {HTMLButtonElement}
 */
function createAddSubtaskBtn(parentId) {
    const btn = document.createElement("button")
    btn.classList.add("add-subtask-btn")
    btn.type = "button"
    btn.setAttribute("data-parent-id", parentId)
    btn.addEventListener("click", renderTodoForm)
    if (parentId.includes("todo"))
        btn.textContent = "Add new subtask"
    else
        btn.textContent = "Add new todo"
    return btn
}

// В формы перенести
/**
 * This function creates a form by initializing a template. The form provides editable fields for modifying 
 * the title and description of a todo while being displayed in the extended representation of the todo (dialog window)
 * @param {TodoItem} todo 
 * @param {HTMLElement} targetNode - an HTML element before which the form will be inserted in the dialog window
 */
export function createTodoTextForm(todo, targetNode) {
    const template = document.querySelector("#dialog-form-templ")
    const clone = template.content.cloneNode(true)
    const form = clone.querySelector("#dialog-form")

    const title = clone.querySelector("#dialog-form-title")
    title.textContent = todo.title
    const desc = clone.querySelector("#dialog-form-desc")
    desc.textContent = todo.desc === "" ? "Описание" : todo.desc

    const confirm = clone.querySelector("#confirm-dialog-edit")
    confirm.addEventListener("click", (e) => {
        e.preventDefault()
        const newTitle = title.textContent
        const newDesc = desc.textContent
        todo.title = newTitle
        todo.desc = newDesc

        updateDiagText(newTitle, newDesc)
        updateTodoText(newTitle, newDesc, todo.id)
        form.remove()
        saveData()
        targetNode.style.display = "flex"
    })

    const cancel = clone.querySelector("#cancel-dialog-edit")
    cancel.addEventListener("click", (e) => {
        e.preventDefault()
        form.remove()
        targetNode.style.display = "flex"
    })

    targetNode.before(form)
    const titleTextBox = document.querySelector("#todo-title-textbox")
    titleTextBox.focus()
    targetNode.style.display = "none"
}


/**
 * This function updates the rendering of the todo's deadline string in the main project content view
 * @param {String} todoId - id of todo
 * @param {String} newDeadline - string represent deadline - "mm/dd/yyyy"
 */
function updateTodoDeadline(todoId, newDeadline) {
    const selector = `.todo-item[data-id="${CSS.escape(todoId)}"]`
    const todoItem = document.querySelector(selector)
    const todoDeadline = todoItem.querySelector(".deadline-container")
    todoDeadline.textContent = newDeadline
}


/**
 * This function creates HTML elements representing all the todo tags by initializing an HTML template. 
 * As the tag elements are created, they are appended to the provided tagList container element
 * @param {HTMLElement} tagList - represent container for todo-items
 * @param {TodoItem} todo 
 */
function createTagsNodes(tagList, todo) {
    const tags = todo.tags
    const temple = document.querySelector("#diag-tag-templ")
    tags.forEach(tag => {
        const clone = temple.content.cloneNode(true)
        const tagItem = clone.querySelector(".diag-tag")
        const tagContent = clone.querySelector(".tag-content")
        tagContent.textContent = tag
        const deleteBtn = clone.querySelector(".tag-delete")
        deleteBtn.addEventListener("click", () => {
            // Удаление узла в диалоговом окне
            tagItem.remove()
            // Удаление тэг в туду
            todo.tags = todo.tags.filter(todoTag => todoTag !== tag)
            // Удаление тэга проекте
            updateTodoTags(todo)
            saveData()
        })
        tagList.append(tagItem)
    })
}


/**
 * This function updates the rendering of the todo's tags in the main project content view
 * @param {TodoItem} todo 
 */
function updateTodoTags(todo) {
    const selector = `.todo-item[data-id="${CSS.escape(todo.id)}"]`
    const todoItem = document.querySelector(selector)
    const tagsContainer = todoItem.querySelector(".tags-container")
    tagsContainer.innerHTML = ""
    todo.tags.forEach((tag) => {
        const tagSpan = document.createElement("span")
        tagSpan.classList.add("tag")
        tagSpan.textContent = tag
        tagsContainer.append(tagSpan)
    })
}