import "../assets/style.css";
import { Project } from "./todoParent";
import { DataStorage } from "./dataStorage";
import { saveApp, getApp } from "./localStore";
import { renderListOfProjects } from "./todoRender";
import { da } from "date-fns/locale";

/**
 * Инициализуируем ран-тайм хранилище, либо пусто, либо что-то есть. Отрисовываем то, что есть
 * Отрисовать список проектов в navbar
 */
document.addEventListener("DOMContentLoaded", () => {
    let data = initData()
    const pRefs = []
    pRefs.push(new Project("Project X", "green"))
    let t1 = pRefs[0].createTodo("Todo1", "pddd")
    t1.priorLevel = 3
    data.saveTodo(t1)
    t1 = pRefs[0].createTodo("Todo2", "pddd")
    data.saveTodo(t1)
    let s1 = pRefs[0].createSection("Section1")
    data.saveSection(s1)
    t1 = s1.createTodo("T3", "tdd")
    data.saveTodo(t1)
    t1 = s1.createTodo("T4", "tdd")
    data.saveTodo(t1)
    pRefs.push(new Project("Project Z", "green"))
    pRefs.push(new Project("Project Y", "green"))
    pRefs.push(new Project("Project A", "green"))
    pRefs.push(new Project("Project B", "green"))
    pRefs.forEach(el => data.saveProject(el))
    renderListOfProjects(data.projects)
})

/**
 * Check if localStorage have valid data then return it. Else create new instance and return
 * @returns {DataStorage} - Instance of DataStorage class
 */
function initData() {
    const lastData = getApp()
    if (lastData)
        return lastData
    else
        return new DataStorage()
}