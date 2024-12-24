import { TodoItem } from "./todoItem"
import { format } from "date-fns"
class Section {
    constructor(title) {
        this.title = title
        this.todos = []
    }

    addTodo(title, desc) {
        this.todos.push(new TodoItem(format, title, desc, this))
    }

    removeTodo(todo) {
        this.todos
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

    addSection() {
        this.sections.push(new Section("Section"))
    }

    removeSection() {

    }
}