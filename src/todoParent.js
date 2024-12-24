import { TodoItem } from "./todoItem"
import { format } from "date-fns"

export class Section {
    constructor(title) {
        this.id = crypto.randomUUID()
        this.title = title
        this.todos = []
        this.parentId = null
    }

    createTodo(title, desc) {
        const todo = new TodoItem(format, title, desc, this.id)
        this.todos.push(todo)
        return todo
    }

    removeTodo(id) {
        this.todos = this.todos.filter(el => el.id !== id)
    }
}

export class Project extends Section{
    constructor(title, desc, color) {
        super(title)
        this.desc = desc
        this.color = color
        this.sections = []
    }

    createSection(title) {
        let section = new Section(title)
        section.parentId = this.id
        this.sections.push(section)
        return section
    }

    removeSection(id) {
        this.sections = this.sections.filter(el => el.id !== id)
    }
}