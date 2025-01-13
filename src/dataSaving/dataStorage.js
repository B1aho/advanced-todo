import { TodoItem } from "../entities/todoItem";
import { saveData } from "./localStore";

/**
 * Class that implement run-time data-storage with singletone pattern
 */
export class DataStorage {
    projects = new Map()    // Keep projects with project-id as key
    sections = new Map()    // Keep sections with section-id as key
    todos = new Map()       // Keep todos with todo-id as key
    lastTimeRef = null
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
     * @param {String} elementId - The ID of the element that was generated during instantiation
     * @returns {Number} - 
     */
    removeElement(elementId) {
        let count = 0
        const type = this.projects.has(elementId) ? "projects" : this.sections.has(elementId) ? "sections" : "todos"
        let elem = this[type].get(elementId)
        if (this.haveNestedSections(elem)) {
            elem.sections.forEach(secId => count += this.removeElement(secId))
        }
        if (this.haveNestedTodos(elem)) {
            elem.todos.forEach(todoId => count += this.removeElement(todoId))
        }
        if (this.haveNestedSubtasks(elem)) {
            elem.subtask.forEach(todoId => count += this.removeElement(todoId))
        }
        // Removes ielement's ID from the parent's collection
        if (elem.parentId) {
            const parentType = this.projects.has(elem.parentId) ? "projects" : this.sections.has(elem.parentId) ? "sections" : "todos"
            const subtype = parentType === "todos" ? "subtask" : type
            this[parentType].get(elem.parentId)[subtype].delete(elementId)
        }
        // Delete element from the runtime storage
        this[type].delete(elementId)
        count++
        elem = null
        saveData()
        return count
    }

    haveNestedSections(elem) {
        if ((elem.sections === undefined || elem.sections.size === 0))
            return false
        return true
    }

    haveNestedSubtasks(elem) {
        if ((elem.subtask === undefined || elem.subtask.size === 0))
            return false
        return true
    }

    haveNestedTodos(elem) {
        if ((elem.todos === undefined || elem.todos.size === 0))
            return false
        return true
    }
}