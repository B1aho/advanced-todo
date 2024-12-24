export class TodoItem {
    #priorLevel = 0
    #checked = false
    // Сделать чатсично примененную 
    constructor(dateFormater, title = "", desc = "") {
        if (typeof dateFormater !== "function")
            throw new Error("dateFormater must be a function")
        this.date = dateFormater(Date.now(), "PPPp")
        this.title = title
        this.desc = desc
        this.deadLine = null
        this.tags = null
        this.location = null
    }

    set priorLevel(num) {
        num = Number(num)
        if (num < 0 || num > 3) {
            console.warn("Wrong value for priority level")
            return
        }
        this.#priorLevel = num
    }

    get priorLevel() {
        return this.#priorLevel
    }

    set checked(value) {
        if (typeof value !== "boolean")
            return
        this.#checked = value
    }

    get checked() {
        return this.#checked
    }

    setDeadLine(date) {
        // Validate with regex
        this.deadLine = date
    }

    setTags(arr) {
        // Проверить что это массив, Привести к строкам все элементы мб и потом присвоить ссылку на массив
        if (arr.every) {
            
        }
    }

    setLocation(location) {

    }
}