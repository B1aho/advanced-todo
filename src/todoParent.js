/**
 * Since I wanted to achieve less coupling between objects, projects and sections only store collections 
 * of IDs of their child elements. To store the actual objects at runtime, I created a dedicated class 
 * called DataStorage. 
 * 
 * This approach has the advantage of improving modularity and scalability by separating concerns: 
 * the parent elements are not directly responsible for managing the state or lifecycle of their child objects.
 * Instead, a centralized storage handles object management, making it easier to update, query, or 
 * manipulate data without tightly coupling different parts of the system
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
        const todo = new TodoItem(formatter(), title, desc, this.id)
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

/**
 * Return partially applied function that return formatted date
 * @returns {Function}
 */
function formatter() {
    return function(date) {
        return format(date, "PPPp")
    }
}