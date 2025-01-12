import 'vanillajs-datepicker/css/datepicker.css';
import "../../assets/select/itc-custom-select.css";
import { ItcCustomSelect } from "../../assets/select/itc-custom-select";
import { Datepicker } from "vanillajs-datepicker";
import { format } from "date-fns";
import { addCollapseBtnOnSection, createAddSectionBtn, createProjectForm, createProjectFormFromTempl, createProjectFromTempl, createSectionFromTempl, createTodoFromTempl, saveNewSectionOrder } from './createDOMutility';
import { DataStorage } from '../dataSaving/dataStorage';
import { saveData } from '../dataSaving/localStore';
import { updateProjectRendering } from './todoRender';

/**
 * 
 * @param {Event} e 
 */
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
        const todoObj = createTodoObj(formValues, parentId)
        const todoNode = document.createElement("todo-item")
        todoNode.setData(todoObj)
        // В форме нет смысла что-то свертывать
        const collapseBtn = todoNode.querySelector(".collapse-btn")
        if (collapseBtn)
            collapseBtn.remove()
        if (btn.classList.contains("add-todo-btn")) {
            btn.before(todoNode)
        } else {
            todoNode.classList.add("diag-indent")
            document.querySelector(".subtask-diag-list").append(todoNode)
            updateProjectRendering(todoObj)
        }
    })

    btn.before(form)
    btn.style.display = "none"
}
// Оставить ИХ КАК УТИЛИТИ ФУНКЦИИ В ОТДЕЛЬНОЙ ПАПКЕ
/**
 * 
 * @param {*} formElems 
 * @returns 
 */
export function pickTodoFormData(formElems) {
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

/**
 * 
 * @param {*} e 
 */
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
        saveNewSectionOrder()
    })
    addSectionBtn.before(form)
    addSectionBtn.style.display = "none"
}

/**
 * 
 * @param {*} formElems 
 * @returns 
 */
function pickSectionFormData(formElems) {
    const input = Array.from(formElems).filter(element => {
        return (element.name === "title")
    })[0]

    const obj = {}
    obj[input.name] = input.value
    return obj
}

/**
 * 
 * @param {*} formValues 
 * @param {*} parentId 
 * @returns 
 */
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

/**
 * 
 */
export function openProjectFormDiag() {
    const diag = createProjectForm()
    document.body.append(diag)
    diag.showModal()
}