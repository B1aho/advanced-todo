import "../assets/style.css";
import { DataStorage } from "./dataSaving/dataStorage";
import { getApp } from "./dataSaving/localStore";
import { renderListOfProjects } from "./render/todoRender";
import { initAddProjectBtn } from "./render/createDOMutility";
/**
 * Инициализуируем ран-тайм хранилище, либо пусто, либо что-то есть. Отрисовываем то, что есть
 * Отрисовать список проектов в navbar
 */
document.addEventListener("DOMContentLoaded", () => {
    let data = initData()
    initAddProjectBtn()
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