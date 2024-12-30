import { TodoItem } from "../entities/todoItem";

/**
 * Class that implement run-time data-storage with singletone pattern
 */
export class DataStorage {
    projects = new Map()    // Keep projects with project-id as key
    sections = new Map()    // Keep sections with section-id as key
    todos = new Map()       // Keep todos with todo-id as key

    // Singletone implementation
    constructor(lastData = null) {
        if (DataStorage.instance) {
            return DataStorage.instance;
        }

        // Save current instance as class prop
        if (lastData) {
            DataStorage.instance = lastData;
            return DataStorage.instance;
        } else
            DataStorage.instance = this;
    }

    saveProject(project) {
        this.projects.set(project.id, project)
    }

    getProjectById(id) {
        return this.projects.get(id)
    }

    saveSection(section) {
        this.sections.set(section.id, section)
    }

    getSectionById(id) {
        return this.sections.get(id)
    }

    saveTodo(todo) {
        this.todos.set(todo.id, todo)
    }

    /**
     * 
     * @param {}  
     * @returns {TodoItem}
     */
    getTodoById(id) {
        return this.todos.get(id)
    }

    /**
     * Removes an element and all its children from the runtime storage
     * Before deleting the element itself, it removes its ID from the parent's collection, if one exists
     * @param {string} elementId - The ID of the element that was generated during instantiation
     */
    removeElement(elementId) {
        const type = this.projects.has(elementId) ? "projects" : this.sections.has(elementId) ? "sections" : "todos"
        let elem = this[type].get(elementId)
        if (haveNestedSections(elem)) {
            elem.sections.forEach(secId => removeElement(secId))
        }
        if (haveNestedTodos(elem)) {
            elem.todos.forEach(todoId => removeElement(todoId))
        }
        // Removes ielement's ID from the parent's collection
        if (elem.parentId) {
            const parentType = this.projects.has(elem.parentId) ? "projects" : "sections"
            this[parentType].get(elem.parentId)[type].delete(elementId)
        }
        // Delete element from the runtime storage
        this[type].delete(elementId)
        elem = null
    }

    haveNestedSections(elem) {
        if ((elem.sections === undefined || elem.sections.size === 0))
            return false
        return true
    }

    haveNestedTodos(elem) {
        if ((elem.todos === undefined || elem.todos.size === 0))
            return false
        return true
    }
}