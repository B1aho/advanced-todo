import "../assets/style.css";
import { Project } from "./todoParent";
import { DataStorage } from "./dataStorage";
import { saveApp, getApp } from "./localStore";

window.addEventListener("load", () => {
    let data = initData()
    let p = new Project("Project X", "desc", "blue")
    let s = p.createSection("Section X")
    let t = s.createTodo("TODO x")
    console.log(p)
    console.log(s)
    console.log(t)
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