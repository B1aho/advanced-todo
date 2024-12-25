import "../assets/style.css";
import todoService from "./todoService";
import { Project } from "./todoParent";
import { DataStorage } from "./dataStorage";

window.addEventListener("load", () => {
    let data = initData()
    let p = new Project("Project X", "desc", "blue")
    let s = p.createSection("Section X")
    let t = s.createTodo("TODO x")
    // Как будто функции create в todoService - всё только захламляют - убрать их и сделать что-то другое
    // Например у нас будет в prompt как bash работать или че то типа этого или вообще хватит уже функционал 
    // протестировали и достаточно

})

function initData() {
    const lastData = todoService.getApp()
    if (lastData)
        return lastData
    else
        return new DataStorage()
}