import 'vanillajs-datepicker/css/datepicker.css';
import "../../assets/select/itc-custom-select.css";
import { ItcCustomSelect } from "../../assets/select/itc-custom-select";
import { Datepicker } from "vanillajs-datepicker";
import { format } from "date-fns";
import { createAddSectionBtn, createSectionFromTempl, createTodoFromTempl } from './createDOMutility';
import { DataStorage } from '../dataSaving/dataStorage';
import { saveData } from '../dataSaving/localStore';

export function renderTodoForm(e) {
    const template = document.querySelector("#todo-form-template")
    const clone = template.content.cloneNode(true)
    const btn = e.target
    const form = clone.querySelector("form")

    const dateInput = clone.querySelector(".deadline")
    new Datepicker(dateInput, {
        minDate: format(new Date(), "P"),
        autohide: true,
        title: "Set dead line",
        clearButton: true,
        todayButton: true,
    })

    const select = clone.querySelector("#priority-menu")

    new ItcCustomSelect(select)

    const cancelBtn = clone.querySelector(".cancel-btn")
    const submitBtn = clone.querySelector(".submit-btn")

    cancelBtn.addEventListener("click", () => {
        form.remove()
        btn.style.display = "block"
    })

    submitBtn.addEventListener("click", (e) => {
        if (!form.reportValidity())
            return
        e.preventDefault()
        const formValues = pickTodoFormData(form.elements)
        const parentId = btn.getAttribute("data-parent-id")
        // Если 
        form.remove()
        btn.style.display = "block"
        const todoNode = createTodoFromTempl(createTodoObj(formValues, parentId))
        if (btn.classList.contains("add-todo-btn")) {
            btn.before(todoNode)
        } else {
            todoNode.classList.add("diag-indent")
            document.querySelector(".subtask-diag-list").append(todoNode)
        }
    })

    btn.before(form)
    btn.style.display = "none"
}

function pickTodoFormData(formElems) {
    const formValues = Array.from(formElems)
        .filter(element => {
            return element.name
        })
        .reduce((acc, curr) => {
            const { name, value } = curr
            acc[name] = value
            return acc
        }, {})
    return formValues
}

export function renderSectionForm(e) {
    const addSectionBtn = e.target
    const template = document.querySelector("#section-form-template")
    const clone = template.content.cloneNode(true)
    const form = clone.querySelector(".section-form")
    const submitBtn = clone.querySelector(".submit-btn-section")
    const cancelBtn = clone.querySelector(".cancel-btn-section")

    cancelBtn.addEventListener("click", () => {
        form.remove()
        addSectionBtn.style.display = "block"
    })

    submitBtn.addEventListener("click", (e) => {
        if (!form.reportValidity())
            return
        e.preventDefault()
        const formValues = pickSectionFormData(form.elements)
        const parentId = addSectionBtn.getAttribute("data-parent-id")
        form.remove()
        addSectionBtn.style.display = "block"
        const sectionNode = createSectionFromTempl(createSectionObj(formValues, parentId))
        addSectionBtn.after(sectionNode)
        sectionNode.after(createAddSectionBtn(parentId))
    })
    addSectionBtn.before(form)
    addSectionBtn.style.display = "none"
}

function pickSectionFormData(formElems) {
    const input = Array.from(formElems).filter(element => {
        return (element.name === "title")
    })[0]

    const obj = {}
    obj[input.name] = input.value
    return obj
}

function createTodoObj(formValues, parentId) {
    const data = new DataStorage()
    const parts = parentId.split("-")
    const parentType = parts[0]
    const id = parts.slice(1).join("-")
    let parent
    if (parentType === "project") {
        parent = data.getProjectById(id)
    }
    if (parentType === "section") {
        parent = data.getSectionById(id)
    }
    if (parentType === "todo") {
        parent = data.getTodoById(id)
    }

    formValues.tags = formValues.tags.split(" ")

    formValues.deadline = formValues.deadline ? formValues.deadline : null
    const todo = parent.createTodo(formValues)
    data.saveTodo(todo)
    saveData()
    return todo
}

function createSectionObj(formValues, parentId) {
    const data = new DataStorage()
    const parts = parentId.split("-")
    const id = parts.slice(1).join("-")
    const project = data.getProjectById(id)

    const secObj = project.createSection(formValues.title)
    data.saveSection(secObj)
    saveData()
    return secObj
}