import { Section, Project } from "./todoParent";
import { TodoItem } from "./todoItem";
import { serialize, deserialize } from "./serialize";

let data = {
    projects: [],
    sections: [],
    todos: [],
}
/**
 * Модуль в котором происходит оснвоное управление логикой приложения (DOM separately)
 * 
 * Метод который создает новый проект, и сохраняет в data
 * Метод который создает новую секцию, и сохраняет в data
 * Тоже самое c todo, сохранять в data, так как todo возвращается из createTodo
 * 
 * Пусть с prompt запрашивает все данные
 * 
 * Метод который сохраняет и достает из LocalStorage
 * 
 * Протестировать базовую реализацию
 */

function createProject() {
    const title = prompt("Enter project title:")
    const desc = prompt("Enter project description:")
    const color = prompt("Enter project color:")
    const proj = new Project(title, desc, color)
    data.projects.push(proj)
    return proj
}

function createTodo(parent) {
    const title = prompt("Enter todo title:")
    const desc = prompt("Enter todo description:")
    const todo = parent.createTodo(title, desc)
    data.todos.push(todo)
    return todo
}

function createSection(project) {
    const title = prompt("Enter ssection title:")
    const section = project.createSection(title)
    data.sections.push(section)
    return section
}

function saveApp() {
    data.projects.forEach((p, idx, arr) => arr[idx] = serialize(p))
    data.sections.forEach((s, idx, arr) => arr[idx] = serialize(s))
    data.todos.forEach((t, idx, arr) => arr[idx] = serialize(t))
    localStorage.setItem("todoApp", JSON.stringify(data))
}

function getApp() {
    const lastData = JSON.parse(localStorage.getItem("todoApp"))
    lastData.projects.forEach((p, idx, arr) => arr[idx] = deserialize(p, Project.prototype))
    lastData.sections.forEach((s, idx, arr) => arr[idx] = deserialize(s, Section.prototype))
    lastData.todos.forEach((t, idx, arr) => arr[idx] = deserialize(t, TodoItem.prototype))
    data = lastData
}

const p = createProject()
createTodo(p)
createTodo(p)
const s = createSection(p)
createTodo(s)
createTodo(s)
saveApp()
getApp()