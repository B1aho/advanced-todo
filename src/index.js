import "../assets/style.css";
import todoService from "./todoService";
import { DataStorage } from "./dataStorage";

window.addEventListener("load", () => {
    let data = initData()

    
})

function initData() {
    const lastData = todoService.getApp()
    if (lastData)
        return lastData
    else
        return new DataStorage()
}