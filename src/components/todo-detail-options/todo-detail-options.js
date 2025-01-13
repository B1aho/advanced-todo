import { Datepicker } from "vanillajs-datepicker";
import styles from "./todo-detail-options.css?raw";
import  ItcStyles  from "../../../assets/select/itc-custom-select.css?raw";
import  DatepickerStyles  from "../../../assets/datepicker.css?raw";
import { ItcCustomSelect } from "../../../assets/select/itc-custom-select";
import { format } from "date-fns";
import { TodoItem } from "../../entities/todoItem";

export class TodoDetailOptions extends HTMLElement {
    constructor() {
        super()
        // Клонируем шаблон
        const shadow = this.attachShadow({ mode: "open" })
        const template = document.querySelector("#detail-options-templ")
        const templateContent = template.content
        shadow.append(templateContent.cloneNode(true))

        this.changeDeadlineInput = this.shadowRoot.querySelector("#change-deadline")
        new Datepicker(this.changeDeadlineInput, {
            minDate: format(new Date(), "P"),
            autohide: true,
            title: "Set dead line",
            clearButton: true,
            todayButton: true,
        })

        this.prioritySelect = this.shadowRoot.querySelector("#priority-menu-diag")
        this.selectBtn = this.shadowRoot.querySelector("#select-btn")
        new ItcCustomSelect(this.prioritySelect)

        this.tagList = this.shadowRoot.querySelector("#tag-list")
        this.tagInput = this.shadowRoot.querySelector("#add-tag-input")
        this.addTagBtn = this.shadowRoot.querySelector("#add-tag-btn")
    }

    connectedCallback() {
        const style = document.createElement("style")
        style.textContent = styles + ItcStyles + DatepickerStyles
        this.shadowRoot.append(style)

        this.addTagBtn.addEventListener("click", () => {
            if (this.tagInput.value === "")
                return
            todo.setTags(tagAddInput.value.split(" "))
            updateTodoTags(todo)
            this.tagList.innerHTML = ""
            createTagsNodes(tagList, todo)
            saveData()
            tagAddInput.value = ""
        })
    }

    disconnectedCallback() {
    }

    /**
     * 
     * @param {TodoItem} todoObj 
     */
    updateData(todoObj) {
        this.todoId = todoObj.id
        this.changeDeadlineInput.value = todoObj.deadline
        this.selectBtn.textContent = getCheckWord(todoObj.priorLevel)
    }
}

customElements.define("todo-detail-options", TodoDetailOptions)

/**
 * В общую папкус utility функциями, если нужна не только здесь!!!!!!!!!
 * 
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