import { DataStorage } from "./dataStorage"
import { serialize, deserialize } from "./serialize"
import { TodoItem } from "../entities/todoItem"
import { Project, Section } from "../entities/todoParent"

/**
 * This function save all projects, sections and todos in localStorage
 * @param {DataStorage} data - Runtime data-storage (instance of DataStorage class)
 */
export function saveApp(data) {
    const dataCopy = structuredClone(data)
    Object.setPrototypeOf(dataCopy, DataStorage.prototype)
    dataCopy.projects.forEach((p, key, map) => map.set(key, serialize(p)))
    dataCopy.sections.forEach((s, key, map) => map.set(key, serialize(s)))
    dataCopy.todos.forEach((t, key, map) => map.set(key, serialize(t)))
    dataCopy.projects = Array.from(dataCopy.projects.entries())
    dataCopy.sections = Array.from(dataCopy.sections.entries())
    dataCopy.todos = Array.from(dataCopy.todos.entries())
    localStorage.setItem("todoApp", JSON.stringify(dataCopy))
    console.log(localStorage)
}

/**
 * If localStorage was empty, or an error occurred while retrieving the data - return null. 
 * Else if success - return data from localStorage (instance of DataStorage)
 * @returns {DataStorage | null}
 */
export function getApp() {
    const lastData = JSON.parse(localStorage.getItem("todoApp"))
    if (lastData === null) {
        console.warn("Local storage was empty")
        return null
    }
    try {
        lastData.projects = new Map(lastData.projects)
        lastData.sections = new Map(lastData.sections)
        lastData.todos = new Map(lastData.todos)
        Object.setPrototypeOf(lastData, DataStorage.prototype)

        lastData.projects.forEach((p, key, map) => map.set(key, deserialize(p, Project.prototype)))
        lastData.sections.forEach((s, key, map) => map.set(key, deserialize(s, Section.prototype)))
        lastData.todos.forEach((t, key, map) => map.set(key, deserialize(t, TodoItem.prototype)))
    } catch {
        console.warn("Local storage was cleared because it had wrong data type")
        return null
    }
    return lastData
}

export function saveData() {
    saveApp(new DataStorage())
}