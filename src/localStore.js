import { DataStorage } from "./dataStorage"

/**
 * This function save all projects, sections and todos in localStorage
 * @param {DataStorage} data - Runtime data-storage (instance of DataStorage class)
 */
export function saveApp(data) {
    data.projects.forEach((p, key, map) => map.set(key, serialize(p)))
    data.sections.forEach((s, key, map) => map.set(key, serialize(s)))
    data.todos.forEach((t, key, map) => map.set(key, serialize(t)))
    localStorage.setItem("todoApp", JSON.stringify(data))
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
        if (!(lastData instanceof DataStorage)) {
            localStorage.clear()
            throw new Error("Data with wrong type was in localStorage")
        }
        lastData.projects.forEach((p, key, map) => map.set(key, deserialize(p, Project.prototype)))
        lastData.sections.forEach((s, key, map) => map.set(key, deserialize(s, Section.prototype)))
        lastData.todos.forEach((t, key, map) => map.set(key, deserialize(t, TodoItem.prototype)))
    } catch {
        console.warn("Local storage was cleared because it had wrong data type")
        return null
    }
    return lastData
}
