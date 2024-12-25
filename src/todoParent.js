/**
 * Написать, что храним все объекты в одном месте data, а сами объекты типа project, или sections, хранят
 * Только идентификаторы
 */
import { TodoItem } from "./todoItem"
import { format } from "date-fns"

export class Section {
    constructor(title) {
        this.id = crypto.randomUUID()
        this.title = title
        this.todos = new Set()
        this.parentId = null
    }

    createTodo(title, desc) {
        const todo = new TodoItem(format, title, desc, this.id)
        this.todos.add(todo.id)
        return todo
    }

    removeTodo(id) {
        this.todos.delete(id)
    }
}

export class Project extends Section{
    constructor(title, desc, color) {
        super(title)
        this.desc = desc
        this.color = color
        this.sections = new Set()
    }

    createSection(title) {
        let section = new Section(title)
        section.parentId = this.id
        this.sections.add(section.id)
        return section
    }

    removeSection(id) {
        this.sections.delete(id)
    }
}