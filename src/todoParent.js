import { TodoItem } from "./todoItem"
import { format } from "date-fns"
class Section {
    constructor(title) {
        this.id = crypto.randomUUID()
        this.title = title
        this.todos = []
        this.parentId = null
    }

    addTodo(title, desc) {
        this.todos.push(new TodoItem(format, title, desc, this.id))
    }

    removeTodo(id) {
        this.todos = this.todos.filter(el => el.id !== id)
    }
}

class Project extends Section{
    constructor(title, desc, color) {
        super(title)
        this.desc = desc
        this.color = color
        this.todos = []
        this.sections = []
    }

    addSection(title) {
        let section = new Section(title)
        section.parentId = this.id
        this.sections.push(section)
    }

    removeSection(id) {
        this.sections = this.sections.filter(el => el.id !== id)
    }
}