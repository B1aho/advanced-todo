import { Section, Project } from "./todoParent";
import { TodoItem } from "./todoItem";
import { serialize, deserialize } from "./serialize";
import { DataStorage } from "./dataStorage";

function createProject() {
    const title = prompt("Enter project title:")
    const desc = prompt("Enter project description:")
    const color = prompt("Enter project color:")
    const proj = new Project(title, desc, color)
    return proj
}

// Реализовать какую-то функцию выбора, типа которая получает дату и в промпте предлагает выбрать проект по названию


function createTodo(parent) {
    if (!parent)
        throw new Error("Todo must be created inside section or project")
    const title = prompt("Enter todo title:")
    const desc = prompt("Enter todo description:")
    const todo = parent.createTodo(title, desc)
    data.todos.set(todo.id, todo)
    return todo.id
}

function createSection(project) {
    if (!project)
        throw new Error("Section must be created inside project")
    const title = prompt("Enter ssection title:")
    const section = project.createSection(title)
    data.sections.set(section.id, section)
    return section.id
}

function saveApp(data) {
    data.projects.forEach((p, key, map) => map.set(key, serialize(p)))
    data.sections.forEach((s, key, map) => map.set(key, serialize(s)))
    data.todos.forEach((t, key, map) => map.set(key, serialize(t)))
    localStorage.setItem("todoApp", JSON.stringify(data))
}

function getApp() {
    const lastData = JSON.parse(localStorage.getItem("todoApp"))
    if (lastData === null) {
        console.warn("Local storage was empty")
        return null
    }
    try {
        if (!(lastData instanceof DataStorage)) {
            localStorage.clear()
            throw new Error("Wrong data type in localStorage")
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

export default {
    createProject,
    createSection,
    createTodo,
    saveApp,
    getApp,
}