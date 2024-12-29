import "../assets/style.css";
import { Project } from "./entities/todoParent";
import { DataStorage } from "./dataSaving/dataStorage";
import { getApp } from "./dataSaving/localStore";
import { renderListOfProjects } from "./render/todoRender";
/**
 * Инициализуируем ран-тайм хранилище, либо пусто, либо что-то есть. Отрисовываем то, что есть
 * Отрисовать список проектов в navbar
 */
document.addEventListener("DOMContentLoaded", () => {
    let data = initData()
    const pRefs = []
    pRefs.push(new Project("Project X", "green"))
    pRefs.push(new Project("Project Z", "green"))
    pRefs.push(new Project("Project Y", "green"))
    pRefs.push(new Project("Project A", "green"))
    pRefs.push(new Project("Project B", "green"))
    pRefs.forEach(el => data.saveProject(el))
    data.saveSection(pRefs[0].createSection("Section-1"))
    renderListOfProjects(data.projects)
})

/**
 * Check if localStorage have valid data then return it. Else create new instance and return
 * @returns {DataStorage} - Instance of DataStorage class
 */
function initData() {
    const lastData = getApp()
    if (lastData) {
        return new DataStorage(lastData)
    }
    else
        return new DataStorage()
}