import "../assets/style.css";
import { Project } from "./todoParent";
import { DataStorage } from "./dataStorage";
import { saveApp, getApp } from "./localStore";

/**
 * Инициализуируем ран-тайм хранилище, либо пусто, либо что-то есть. Отрисовываем то, что есть
 * Отрисовать список проектов в navbar
 */
document.addEventListener("DOMContentLoaded", () => {
    let data = initData()
    
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