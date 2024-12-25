import { Section, Project } from "./todoParent";
import { TodoItem } from "./todoItem";
import { serialize, deserialize } from "./serialize";

let data = {
    projects: new Map(),    // Хранит проекты с id как ключом
    sections: new Map(),    // Хранит секции с id как ключом
    todos: new Map(),       // Хранит todos с id как ключом
}

// Переделать под map логику

function createProject() {
    const title = prompt("Enter project title:")
    const desc = prompt("Enter project description:")
    const color = prompt("Enter project color:")
    const proj = new Project(title, desc, color)
    data.projects.set(proj.id, proj)
    return proj
}

function createTodo(parent) {
    const title = prompt("Enter todo title:")
    const desc = prompt("Enter todo description:")
    const todo = parent.createTodo(title, desc)
    data.todos.set(todo.id, todo)
    return todo
}

function createSection(project) {
    const title = prompt("Enter ssection title:")
    const section = project.createSection(title)
    data.sections.set(section.id, section)
    return section
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

// Продумать remove, рекурсивный или что-то типо. Логику удаления
// Он должен получать id, найти этот элемент. Допусти это проект, тогда он должен проверить есть ли todo и
// удалить их сначала, потом проверить есть ли секции и удалить их (т.е. удалить все объекты с такими id из data
// и установить свойство в null), 
// если секции и todo установлены в null или не существуют, тогда удаляем сам объект из data, но по идее если
// объект не проджект, а секция то мы должны проверить еще свойство parentId, если там что-то есть, то перейти в родителя и удалить id удаляемого элемента

// добавить тип в генерацию id