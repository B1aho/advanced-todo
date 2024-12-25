import { Section, Project } from "./todoParent";
import { TodoItem } from "./todoItem";
import { serialize, deserialize } from "./serialize";

let data = {
    projects: new Map(),    // Хранит проекты с id как ключом
    sections: new Map(),    // Хранит секции с id как ключом
    todos: new Map(),       // Хранит todos с id как ключом
}

function createProject() {
    const title = prompt("Enter project title:")
    const desc = prompt("Enter project description:")
    const color = prompt("Enter project color:")
    const proj = new Project(title, desc, color)
    data.projects.set(proj.id, proj)
    return proj.id
}

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

function saveApp() {
    data.projects.forEach((p, key, map) => map.set(key, serialize(p)))
    data.sections.forEach((s, key, map) => map.set(key, serialize(s)))
    data.todos.forEach((t, key, map) => map.set(key, serialize(t)))
    localStorage.setItem("todoApp", JSON.stringify(data))
}

function getApp() {
    const lastData = JSON.parse(localStorage.getItem("todoApp"))
    lastData.projects.forEach((p, key, map) => map.set(key, deserialize(p, Project.prototype)))
    lastData.sections.forEach((s, key, map) => map.set(key, deserialize(s, Section.prototype)))
    lastData.todos.forEach((t, key, map) => map.set(key, deserialize(t, TodoItem.prototype)))
    data = lastData
}

// По сути в памяти элементы находятся через data, значит надо удалить их рекурсивно там в первую очередь
// Но еще есть строки id у родительского элемента - её удалить в конце и всё
function removeElement(elementId) {
    const type = data.projects.has(elementId) ? "projects" : data.sections.has(elementId) ? "sections" : "todos"
    let elem = data[type].get(elementId)
    if (haveNestedSections(elem)) {
        // Выполнить рекурсивное удаление для каждой секции
        elem.sections.forEach(secId => removeElement(secId))
    }
    if (haveNestedTodos(elem)) {
        // Выполнить рекурсивное удаление для каждой туду
        elem.todos.forEach(todoId => removeElement(todoId))
    }
    // Delete element's id in parent element if has parent
    if (elem.parentId) {
        const parentType = data.projects.has(elem.parentId) ? "projects" : "sections"
        data[parentType].get(elem.parentId)[type].delete(elementId)
    }
    // Delete element
    data[type].delete(elementId)
    elem = null
    return
}

function haveNestedSections(elem) {
    if ((elem.sections === undefined || elem.sections.size === 0))
        return false
    return true
}

function haveNestedTodos(elem) {
    if ((elem.todos === undefined || elem.todos.size === 0))
        return false
    return true
}

function getProject(id) {
    return data.projects.get(id)   
}

function getSection(id) {
    return data.sections.get(id)   
}

function getTodo(id) {
    return data.todos.get(id)   
}

export default {
    createProject,
    createSection,
    createTodo,
    removeElement,
    saveApp,
    getApp,
    getProject,
    getSection,
    getTodo,
}