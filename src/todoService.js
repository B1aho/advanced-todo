import { Section, Project } from "./todoParent";

const data = {
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
    const title = prompt("Enter project title:")
    const desc = prompt("Enter project description:")
    const todo = parent.createTodo(title, desc)
    data.todos.push(todo)
}

function createSection(project) {
    const title = prompt("Enter project title:")
    const section = project.createSection(title)
    data.sections.push(section)
}