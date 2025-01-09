// Fabric на factory поменяй

import { Datepicker } from "vanillajs-datepicker"
import { ItcCustomSelect } from "../../assets/select/itc-custom-select"
import { DataStorage } from "../dataSaving/dataStorage"
import { saveData } from "../dataSaving/localStore"
import { TodoItem } from "../entities/todoItem"
import { Project, Section } from "../entities/todoParent"
import { openProjectFormDiag, renderSectionForm, renderTodoForm } from "./todoForm"
import { hideOptions, renderProjectContent, renderProjectListItem, renderSectionExtraOptions, RenderTodoDiag, updateProjectContentAfterChanging, updateProjectContentAfterDeletion, updateProjectListAfterChanging, updateProjectListAfterDeletion, updateProjectListRendering, updateProjectMainRendering, updateSectionContentAfterDeletion, updateTodoRemoveRender } from "./todoRender"
import { format } from "date-fns"


/**
 * Fabric that create button that can render new Section
 * @param {String} parentId - string that represent project's id. This project is parent for future sections
 * @returns {HTMLButtonElement}
 */
export function createAddSectionBtn(parentId) {
    const btn = document.createElement("button")
    btn.classList.add("add-section-btn")
    btn.type = "button"
    btn.setAttribute("data-parent-id", parentId)
    btn.addEventListener("click", renderSectionForm)
    btn.textContent = "Add new section"
    return btn
}

/**
 * Fabric that create button that can render form for creating todo
 * @param {String} parentId - string that represent parent's id (project or section id)
 * @returns {HTMLButtonElement}
 */
export function createAddTodoBtn(parentId) {
    const btn = document.createElement("button")
    btn.classList.add("add-todo-btn")
    btn.type = "button"
    btn.setAttribute("data-parent-id", parentId)
    btn.addEventListener("click", renderTodoForm)
    btn.textContent = "Add new Todo"
    return btn
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

/**
 * An HTML node is created, which is filled with nodes representing todos, along with all the subtask 
 * nodes of each todo, and this list element is returned
 * @param {Set} todoSet - set of todo IDs that represent all todos belonging to the parent
 * @param {String} parentId - id of parent that of current todoSet 
 * @returns {HTMLDivElement} - Container that represent list of todos
 */
export function createTodoList(todoSet, parentId) {
    if (!(todoSet instanceof Set)) {
        throw new Error("Argument must be instance of Set")
    }
    const data = new DataStorage()
    const todoList = document.createElement("div")
    todoList.classList.add("todo-list")
    // Здесь надо проверить есть ли вложенные туду и функцию для их генерации, на забывая отступ
    todoSet.forEach(id => {
        const subtaskArr = []
        const todo = data.getTodoById(id)

        todoList.append(createTodoFromTempl(todo))
        if (todo.subtask.size > 0) {
            fillArrayWithSubtaskNodes(subtaskArr, todo)
        }
        subtaskArr.forEach(subtask => {
            todoList.append(subtask)
        })

    })
    todoList.append(createAddTodoBtn(parentId))
    return todoList;
}

/**
 * It creates HTML elements from each todo's subtask ans subtask's subtask and places these nodes 
 * into the passed array without returning anything
 * @param {Array} arr 
 * @param {TodoItem} todo 
 */
function fillArrayWithSubtaskNodes(arr, todo) {
    const data = new DataStorage()
    const subtask = todo.subtask
    subtask.forEach(subtaskId => {
        const subtask = data.getTodoById(subtaskId)
        // add todoNode to the array
        arr.push(createTodoFromTempl(subtask))
        if (subtask.subtask.size > 0)
            fillArrayWithSubtaskNodes(arr, subtask)
    })
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
        arr.push(createTodoFromTempl(subtask))
    })
}

/**
 * This function initializes the HTML elements of the todo template based on the provided 
 * instance of TodoItem
 * @param {TodoItem} todo 
 * @returns {HTMLElement}
 */
export function createTodoFromTempl(todo) {
    const template = document.querySelector("#todo-item-template")
    const clone = template.content.cloneNode(true)
    const todoContainer = clone.querySelector(".todo-container")
    if (todo.checked)
        todoContainer.classList.add("checked")
    todoContainer.setAttribute("data-id", todo.id)
    todoContainer.setAttribute("data-indent", todo.indent)

    const checkBtn = clone.querySelector(".todo-check-btn")
    checkBtn.setAttribute("data-id", todo.id)
    checkBtn.style.backgroundColor = getCheckColor(todo.priorLevel)
    checkBtn.addEventListener("click", (e) => {
        checkTodo(e, todo)
    })

    const removeBtn = clone.querySelector(".todo-remove-btn")
    removeBtn.addEventListener("click", () => {
        createConfirmDiagAndShow(todo.id, "todo")
    })

    if (haveUncheckedSubtask(todo)) {
        addCollapseBtnOnTodo(todoContainer)
    }

    const todoTitle = clone.querySelector(".todo-title")
    todoTitle.textContent = todo.title

    const todoDesc = clone.querySelector(".todo-desc")
    todoDesc.textContent = todo.desc

    const todoDeadline = clone.querySelector(".deadline-container")
    todoDeadline.textContent = todo.deadline

    if (todo.tags) {
        const todoTags = clone.querySelector(".tags-container")
        todo.tags.forEach((tag) => {
            const tagSpan = document.createElement("span")
            tagSpan.classList.add("tag")
            tagSpan.textContent = tag
            todoTags.append(tagSpan)
        })
    }

    const todoBody = clone.querySelector(".todo-item")
    todoBody.setAttribute("data-id", todo.id)
    todoBody.addEventListener("click", RenderTodoDiag)

    if (todo.checked) {
        checkBtn.classList.add("checked")
        todoBody.classList.add("checked")
    }

    return todoContainer
}

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

// Проверь, что то todo передается всегда
// Добавить эту же функциональность в кнопку в детально форме туду 
// Возможно лучше использовать подход, который скрывает выполненные todo также через таймаут, а на completed показывает все скрытые с зачеркиваниями
/**
 * 
 * @param {Event} event 
 * @param {TodoItem} todo 
 * @returns 
 */
export function checkTodo(event, todo) {
    const data = new DataStorage()
    // Затоглить все субтаски этой задачи рекурсивно мб в отдельный функционал всё что тоглит выше
    toggleCheckedTodoContent(todo)

    // Затогглить данные в хранилище и сохранить
    toggleCheckedTodoData(todo)
    saveData()
    // если диалог есть, то он автоматически должен закрываться, если за отведенное время никто не удалил todo
    if (todo.checked) {
        const todoDiag = document.querySelector("#todo-dialog")
        //blockDialogAction(todoDiag)
        data.lastTimeRef = setTimeout(() => {
            hideCheckedTodo(todo)
        }, 3000)
        if (!todoDiag || !todoDiag.open)
            showUndoPopup(todo)
    } else {
        if (data.lastTimeRef)
            clearTimeout(data.lastTimeRef)
        unhideCheckedTodo(todo)
        const undoPopup = document.querySelector(".undo-popup")
        if (undoPopup)
            undoPopup.remove()
    }
}

function showUndoPopup(todo) {
    const popup = document.createElement('div')
    popup.classList.add("undo-popup")

    const text = document.createElement('p')
    text.textContent = 'Задача выполнена'

    const loaderContainer = document.createElement('div')
    loaderContainer.classList.add("loader-container")
    const loader = document.createElement('div')
    loader.classList.add("loader")
    loaderContainer.append(loader)

    const buttonContainer = document.createElement('div')
    buttonContainer.style.display = 'flex'
    buttonContainer.style.justifyContent = 'space-between'

    const undoButton = document.createElement('button')
    undoButton.textContent = 'Отменить'
    undoButton.classList.add("undo")

    const closeButton = document.createElement('button')
    closeButton.textContent = '✖';
    closeButton.classList.add("close-undo-popup")

    buttonContainer.append(undoButton, closeButton)

    // Добавляем элементы в попап
    popup.append(text, loaderContainer, buttonContainer)

    // Добавляем попап в DOM
    document.body.append(popup);

    // Начинаем анимацию лоадера
    setTimeout(() => {
        loader.style.transform = 'scaleX(0)';
    }, 0);

    // Таймаут для автоматического закрытия попапа через 2 секунды
    const autoCloseTimeout = setTimeout(() => {
        popup.remove();
    }, 3000);

    // Обработчик кнопки "Отменить"
    undoButton.addEventListener('click', () => {
        clearTimeout(new DataStorage().lastTimeRef); // Отменяем переданный таймаут
        clearTimeout(autoCloseTimeout); // Убираем автозакрытие попапа
        popup.remove();
        toggleCheckedTodoContent(todo)
        toggleCheckedTodoData(todo)
    });

    // Обработчик кнопки "Закрыть"
    closeButton.addEventListener('click', () => {
        clearTimeout(autoCloseTimeout); // Убираем автозакрытие попапа
        document.body.removeChild(popup); // Удаляем попап
    });
}

/**
 * 
 * @param {TodoItem} todo 
 */
function hideCheckedTodo(todo) {
    if (todo.subtask.size > 0)
        todo.subtask.forEach(subId => hideCheckedTodo(new DataStorage().getTodoById(subId)))
    const selector = `.todo-container[data-id="${CSS.escape(todo.id)}"]`
    const todoContainer = document.querySelector(selector)
    todoContainer.classList.add("checked")
}

function unhideCheckedTodo(todo) {
    const selector = `.todo-container[data-id="${CSS.escape(todo.id)}"]`
    const todoContainer = document.querySelector(selector)
    todoContainer.classList.remove("checked")
}

function handleFilterClick(e) {
    const filterBtn = e.currentTarget
    // Если нажал на уже активный фильтр
    if (filterBtn.classList.contains("active"))
        return true
    const filters = document.querySelectorAll(".project-filter")
    filters.forEach(filter => filter.classList.remove("active"))
    filterBtn.classList.add("active")
    return false
}

function checkTodoContainers(todo) {
    if (todo.subtask.size > 0)
        todo.subtask.forEach(subId => checkTodoContainers(new DataStorage().getTodoById(subId)))
    const selector = `.todo-container[data-id="${CSS.escape(todo.id)}"]`
    const todoContainer = document.querySelector(selector)
    if (todo.checked)
        todoContainer.classList.add("checked")
}

function uncheckTodoContainers(todo) {
    if (todo.subtask.size > 0)
        todo.subtask.forEach(subId => uncheckTodoContainers(new DataStorage().getTodoById(subId)))
    const selector = `.todo-container[data-id="${CSS.escape(todo.id)}"]`
    const todoContainer = document.querySelector(selector)
    if (todo.checked)
        todoContainer.classList.remove("checked")
}


// поменяй название, а то оно не отображает смысл
/**
 * 
 * @param {Event} e 
 */
export function showActualTodos(e) {
    if (handleFilterClick(e))
        return
    renderProjectContent(document.querySelector(".project-container").getAttribute("data-id"))
    // const projId = document.querySelector(".project-container").getAttribute("data-id")
    // const proj = new DataStorage().getProjectById(projId)
    // proj.todos.forEach(todoId => {
    //     const todo = new DataStorage().getTodoById(todoId)
    //     checkTodoContainers(todo)
    // })
    // // Для секций тоже самое 
    // proj.sections.forEach(secId => {
    //     const section = new DataStorage().getSectionById(secId)
    //     section.todos.forEach(todoId => {
    //         const todo = new DataStorage().getTodoById(todoId)
    //         checkTodoContainers(todo)
    //     })
    // })
}

export function showCompletedTodos(e) {
    if (handleFilterClick(e))
        return
    // Показать спрятанные
    const projId = document.querySelector(".project-container").getAttribute("data-id")
    const proj = new DataStorage().getProjectById(projId)
    proj.todos.forEach(todoId => {
        const todo = new DataStorage().getTodoById(todoId)
        uncheckTodoContainers(todo)
    })

    // Для секций тоже самое 
    proj.sections.forEach(secId => {
        const section = new DataStorage().getSectionById(secId)
        section.todos.forEach(todoId => {
            const todo = new DataStorage().getTodoById(todoId)
            uncheckTodoContainers(todo)
        })
    })
}
/**
 * 
 * @param {TodoItem} todo 
 */
function toggleCheckedTodoContent(todo) {
    if (todo.subtask.size > 0)
        todo.subtask.forEach(subId => toggleCheckedTodoContent(new DataStorage().getTodoById(subId)))
    const checkBtnSelector = `.todo-check-btn[data-id="${CSS.escape(todo.id)}"]`
    const checkBtns = document.querySelectorAll(checkBtnSelector)
    checkBtns.forEach(btn => {
        btn.classList.toggle("checked")
    })

    const selector = `.todo-item[data-id="${CSS.escape(todo.id)}"]`
    const todoItem = document.querySelector(selector)
    todoItem.classList.toggle("checked")

    const dialiogSelector = `.diag-todo-item[data-id="${CSS.escape(todo.id)}"]`
    const diagTextContainer = document.querySelector(dialiogSelector)
    if (diagTextContainer) {
        diagTextContainer.classList.toggle("checked")
    }
}

/**
 * 
 * @param {TodoItem} todo 
 */
function toggleCheckedTodoData(todo) {
    if (todo.subtask.size > 0)
        todo.subtask.forEach(subId => toggleCheckedTodoData(new DataStorage().getTodoById(subId)))
    if (todo.checked)
        todo.checked = false
    else
        todo.checked = true
}

export function createConfirmDiagAndShow(id, type) {
    const templ = document.querySelector("#confirm-diag-templ")
    const clone = templ.content.cloneNode(true)
    const diag = clone.querySelector(".confirm-remove")

    const closeDiag = clone.querySelector("#close-confirm-diag")
    closeDiag.addEventListener("click", () => {
        diag.close()
        diag.remove()
    })

    const confirmBtn = clone.querySelector("#remove-elem-btn")
    confirmBtn.addEventListener("click", () => {
        const data = new DataStorage()
        if (type === "todo")
            updateTodoRemoveRender(id, data.removeElement(id))
        else if (type === "section")
            removeSection(id)
        else
            removeProject(id)
        saveData()
        diag.close()
        diag.remove()
    })

    document.body.append(diag)
    diag.showModal()
}

/**
 * This function initializes the HTML elements of the section template based on the provided
 * instance of Section
 * @param {Section} sect 
 * @returns {HTMLElement}
 */
export function createSectionFromTempl(sect) {
    const template = document.querySelector("#section-container-template")
    const clone = template.content.cloneNode(true)
    const section = clone.querySelector(".section-container")
    section.addEventListener("click", (e) => {
        const target = e.target
        e.stopPropagation()
        hideOptions(e)
        if (target.classList.contains("option"))
            handleSectionExtraOption(target)
    })
    section.setAttribute("data-id", sect.id)
    clone.querySelector(".section-title").textContent = sect.title
    const select = clone.querySelector(".select-section-btn")
    const options = clone.querySelector(".options")
    options.setAttribute("data-id", sect.id)
    select.setAttribute("data-id", sect.id)

    select.addEventListener("click", renderSectionExtraOptions)

    const todoList = document.createElement("div")
    todoList.classList.add("todo-list")
    todoList.append(createAddTodoBtn("section-" + sect.id))
    section.append(todoList)

    return section
}

/**
 * This function returns a string representing the CSS background color of the button 
 * (marking the todo as completed) depending on the provided priority level
 * @param {Number} prior - TodoItem.priorityLevel
 * @returns {String}
 */
export function getCheckColor(prior) {
    let color = "gray"
    switch (prior) {
        case 1:
            color = "blue"
            break;
        case 2:
            color = "yellow"
            break;
        case 3:
            color = "red"
            break;
        default:
            break;
    }
    return color
}

/**
 * This function returns a string representing the word representation of todo priority level
 * @param {Number} prior - TodoItem.priorityLevel
 * @returns {String}
 */
function getCheckWord(prior) {
    let word = "None"
    switch (prior) {
        case 1:
            word = "Low"
            break;
        case 2:
            word = "Medium"
            break;
        case 3:
            word = "High"
            break;
        default:
            break;
    }
    return word
}

/**
 * This function returns a string representing the word representation of todo priority level
 * @param {}
 * @return {}
 */
function getColorWord(colorVal) {
    let word = "Project color"
    switch (colorVal) {
        case "red":
            word = "Red"
            break;
        case "blue":
            word = "Blue"
            break;
        case "green":
            word = "Green"
            break;
        case "gray":
            word = "Gray"
            break;
        default:
            break;
    }
    return word
}
// Подумай над тем, чтобы разбить её на более мелки раннее использованные utility функции
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
        onSelected(select, option) {
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
 * This function updates the rendering of the title and description of the todo in the dialog window
 * @param {String} title - new title
 * @param {String} desc - new description
 */
function updateDiagText(title, desc) {
    const diagTodoTitle = document.querySelector(".diag-todo-title")
    diagTodoTitle.textContent = title

    const diagTodoDesc = document.querySelector(".diag-todo-desc")
    diagTodoDesc.textContent = desc
}

/**
 * This function updates the rendering of the title and description of the todo in the main project content view
 * @param {String} title - new title
 * @param {String} desc - new description
 * @param {String} id - todo's id 
 */
function updateTodoText(title, desc, id) {
    const selector = `.todo-item[data-id="${CSS.escape(id)}"]`
    const todoItem = document.querySelector(selector)
    const todoTitle = todoItem.querySelector(".todo-title")
    todoTitle.textContent = title

    const todoDesc = todoItem.querySelector(".todo-desc")
    todoDesc.textContent = desc
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

/**
 * This function counts the total number of all subtasks (including their subtasks) of the provided todo 
 * and returns the number
 * @param {TodoItem} todoNode 
 * @returns {Number}
 */
export function countTodoNodes(todoNode) {
    const data = new DataStorage()
    const subtasks = todoNode.subtask
    let num = subtasks.size
    subtasks.forEach(taskId => {
        num += countTodoNodes(data.getTodoById(taskId))
    })
    return num
}

/**
 * This function initializes a button element, attaching an event handler to open the form for adding a project
 */
export function initAddProjectBtn() {
    const btn = document.querySelector("#add-project-btn")
    btn.addEventListener("click", openProjectFormDiag)
}

/**
 * This function creates a form by initializing a template. 
 * The form provides the option to choose the title and color for the new project
 * @returns {HTMLElement}
 */
export function createProjectForm() {
    const template = document.querySelector("#diag-project-form-templ")
    const clone = template.content.cloneNode(true)
    const diag = clone.querySelector("#project-dialog")
    const form = clone.querySelector("#dialog-project-form")
    const inputTitle = clone.querySelector("#project-title-input")
    const select = clone.querySelector("#project-color")
    new ItcCustomSelect(select)
    const selectBtn = clone.querySelector("#project-color-btn")

    const confirm = clone.querySelector("#confirm-project-form")
    const cancel = clone.querySelector("#close-project-form")

    confirm.addEventListener("click", (e) => {
        if (!form.reportValidity())
            return
        e.preventDefault()
        const title = inputTitle.value
        const color = selectBtn.value
        const projObj = new Project(title, color)
        new DataStorage().saveProject(projObj)
        saveData()
        renderProjectListItem(projObj)
        diag.close()
        diag.remove()
    })
    cancel.addEventListener("click", () => {
        diag.close()
        diag.remove()
    })
    return diag
}

export function handleProjectExtraOption(target) {
    const projId = target.parentElement.getAttribute("data-id")
    const actionType = target.getAttribute("data-action")
    switch (actionType) {
        case "remove":
            createConfirmDiagAndShow(projId, "project")
            break
        case "change":
            changeProject(projId)
            break
        default:
            break
    }

}

function removeProject(projId) {
    const data = new DataStorage()
    data.removeElement(projId)
    updateProjectListAfterDeletion(projId)
    updateProjectContentAfterDeletion(projId)
    saveData()
}

function changeProject(projId) {
    // Появляется диалог, с формой, в которой можно изменить название проекта и цвет. и подвтердить, отменить
    // Далее эти изменения сохраняются в рантайме, проихводится запись памяти и ререндеринг в списке проектов и main
    // если проект открыт
    const proj = new DataStorage().getProjectById(projId)
    const template = document.querySelector("#diag-project-form-templ")
    const clone = template.content.cloneNode(true)
    const diag = clone.querySelector("#project-dialog")
    const form = clone.querySelector("#dialog-project-form")
    const inputTitle = clone.querySelector("#project-title-input")
    inputTitle.value = proj.title
    const select = clone.querySelector("#project-color")
    new ItcCustomSelect(select)
    const selectBtn = clone.querySelector("#project-color-btn")
    selectBtn.value = proj.color
    selectBtn.textContent = getColorWord(proj.color)
    const confirm = clone.querySelector("#confirm-project-form")
    confirm.textContent = "Изменить"
    const cancel = clone.querySelector("#close-project-form")

    confirm.addEventListener("click", (e) => {
        if (!form.reportValidity())
            return
        e.preventDefault()
        proj.title = inputTitle.value
        proj.color = selectBtn.value
        saveData()
        // Update list rendering and main
        updateProjectListAfterChanging(proj)
        updateProjectContentAfterChanging(proj)
        diag.close()
        diag.remove()
    })
    cancel.addEventListener("click", () => {
        diag.close()
        diag.remove()
    })
    document.body.append(diag)
    diag.showModal()
}

export function handleSectionExtraOption(target) {
    const sectId = target.parentElement.getAttribute("data-id")
    const actionType = target.getAttribute("data-action")
    //const data = new DataStorage()
    //const section = data.getProjectById(sectId)
    switch (actionType) {
        case "remove":
            createConfirmDiagAndShow(sectId, "section")
            break
        case "rename":
            createSectionTextArea(sectId)
            break
        default:
            break
    }

}

function removeSection(sectId) {
    const data = new DataStorage()
    data.removeElement(sectId)
    updateSectionContentAfterDeletion(sectId)
    saveData()
}

function createSectionTextArea(sectId) {
    const selector = `.section-container[data-id="${CSS.escape(sectId)}"]`
    const sectContainer = document.querySelector(selector)
    const targetNode = sectContainer.querySelector(".section-header-container")
    const section = new DataStorage().getSectionById(sectId)

    const template = document.querySelector("#section-rename-templ")
    const clone = template.content.cloneNode(true)
    const form = clone.querySelector("#section-rename-form")
    const title = clone.querySelector("#section-form-title")
    title.textContent = section.title

    const confirm = clone.querySelector("#confirm-section-edit")
    confirm.addEventListener("click", (e) => {
        e.preventDefault()
        const newTitle = title.textContent
        section.title = newTitle
        const sectionHeader = targetNode.querySelector(".section-title")
        sectionHeader.textContent = newTitle
        form.remove()
        saveData()
        targetNode.style.display = "flex"
    })

    const cancel = clone.querySelector("#cancel-section-edit")
    cancel.addEventListener("click", (e) => {
        e.preventDefault()
        form.remove()
        targetNode.style.display = "flex"
    })

    targetNode.before(form)
    const textBox = document.querySelector("#section-textbox")
    textBox.focus()
    targetNode.style.display = "none"
}


// Надо как-то сохранять этот порядок при следующем открытии
// Пройтись по элементам списка, и разместить id памяти соответсующим образом
export function handleDragoverProjectList(evt) {
    const list = document.querySelector("#project-list")
    const activeElement = list.querySelector(".dragging")

    if (activeElement) {
        evt.preventDefault()
        evt.dataTransfer.dropEffect = 'move'
    } else
        return

    const currentElement = evt.target.parentNode
    const isMoveable = activeElement !== currentElement &&
        currentElement.classList.contains("sidebar-list-item")

    if (!isMoveable) {
        return
    }


    // Находим элемент, перед которым будем вставлять
    //const nextElement = currentElement
    const nextElement = getNextElement(evt.clientY, currentElement)

    // Вставляем activeElement перед nextElement
    if (currentElement.nextElementSibling === null)
        nextElement.after(activeElement)
    else
        list.insertBefore(activeElement, nextElement)

    saveNewListOrder()
}

function getNextElement(cursorPosition, currentElement) {
    // Получаем объект с размерами и координатами
    const currentElementCoord = currentElement.getBoundingClientRect()
    // Находим вертикальную координату центра текущего элемента
    const currentElementCenter = currentElementCoord.y + currentElementCoord.height / 2

    // Если курсор выше центра элемента, возвращаем текущий элемент
    // В ином случае — следующий DOM-элемент
    const nextElement = (cursorPosition < currentElementCenter) ?
        currentElement :
        currentElement.nextElementSibling

    return nextElement
}

function saveNewListOrder() {
    const list = document.querySelector("#project-list")
    const listItems = list.querySelectorAll(".sidebar-list-item")
    const idOrder = []
    listItems.forEach(item => idOrder.push(item.getAttribute("data-id")))

    let projectMap = new DataStorage().projects
    const newProjectMap = new Map()

    idOrder.forEach(id => newProjectMap.set(id, projectMap.get(id)))
    new DataStorage().projects = newProjectMap
    saveData()
}

export function handleDragoverSection(evt) {
    const projectContainer = document.querySelector(".project-container")
    const activeElement = projectContainer.querySelector(".sect-dragging")
    const activeElementAddSectionBtn = activeElement.nextElementSibling

    if (activeElement) {
        evt.preventDefault()
        evt.dataTransfer.dropEffect = 'move'
    } else
        return

    const currentElement = evt.target.parentNode
    const isMoveable = activeElement !== currentElement &&
        currentElement.classList.contains("section-container")

    if (!isMoveable) {
        return
    }


    const nextElement = getNextSectionElement(activeElement, currentElement)

    nextElement.after(activeElement)
    activeElement.after(activeElementAddSectionBtn)

    saveNewSectionOrder()
}

function getNextSectionElement(activeElement, currentElement) {
    // Получаем объект с размерами и координатами
    const currentElementCoord = currentElement.getBoundingClientRect()
    const activeElementCoord = activeElement.getBoundingClientRect()

    // Находим вертикальную координату центра текущего элемента
    const coordDelta = currentElementCoord.y - activeElementCoord.y

    // Если курсор выше центра элемента, возвращаем текущий элемент
    // В ином случае — следующий DOM-элемент
    if (coordDelta < 0)
        return currentElement.previousElementSibling
    else
        return currentElement.nextElementSibling
}

export function saveNewSectionOrder() {
    const projContainer = document.querySelector(".project-container")
    const sections = projContainer.querySelectorAll(".section-container")
    const idOrder = []
    sections.forEach(sec => idOrder.push(sec.getAttribute("data-id")))

    const project = new DataStorage().getProjectById(projContainer.getAttribute("data-id"))
    const newOrder = new Set()
    idOrder.forEach(id => newOrder.add(id))
    project.sections = newOrder

    saveData()
}

export function addCollapseBtnOnTodo(todoItem) {
    const collapseBtn = document.createElement("button")
    collapseBtn.classList.add("collapse-btn")
    collapseBtn.textContent = "▶"
    collapseBtn.addEventListener("click", () => {
        collapseBtn.classList.toggle("active-collapse")
        const data = new DataStorage()
        const isNeedToCollapse = collapseBtn.classList.contains("active-collapse")
        const todo = data.getTodoById(todoItem.getAttribute("data-id"))

        if (isNeedToCollapse) {
            collapseAllSubtasks(todo)
        } else {
            unCollapseAllSubtasks(todo)
        }
    })
    todoItem.prepend(collapseBtn)
}

function collapseAllSubtasks(todo) {
    const subtasks = todo.subtask
    for (const id of subtasks) {
        const subtask = new DataStorage().getTodoById(id)
        if (subtask.subtask.size > 0)
            collapseAllSubtasks(subtask)
        // Вынести в отдельную функцию getTodoContainerById
        const selector = `.todo-container[data-id="${CSS.escape(id)}"]`
        const todoContainer = document.querySelector(selector)
        todoContainer.classList.add("collapsed")
    }
}

function unCollapseAllSubtasks(todo) {
    const subtasks = todo.subtask
    for (const id of subtasks) {
        const subtask = new DataStorage().getTodoById(id)
        if (subtask.subtask.size > 0)
            unCollapseAllSubtasks(subtask)
        // Вынести в отдельную функцию getTodoContainerById
        const selector = `.todo-container[data-id="${CSS.escape(id)}"]`
        const todoContainer = document.querySelector(selector)
        todoContainer.classList.remove("collapsed")
    }
}