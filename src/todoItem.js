export class TodoItem {
    #priorLevel = 0
    #checked = false
    // Сделать чатсично примененную 
    constructor(dateFormater, title = "", desc = "", parentId) {
        if (typeof dateFormater !== "function")
            throw new Error("dateFormater must be a function")
        this.id = crypto.randomUUID()
        this.date = dateFormater(Date.now(), "PPPp")
        this.title = title
        this.desc = desc
        this.deadLine = null
        this.tags = null
        this.parentId = parentId
    }

    set priorLevel(num) {
        num = Number(num)
        if (num < 0 || num > 3) 
            throw new Error("Not avaliable priority level")
    
        this.#priorLevel = num
    }

    get priorLevel() {
        return this.#priorLevel
    }

    set checked(value) {
        if (typeof value !== "boolean")
            throw new Error("Checked must be boolean")

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
        // если что выбросить исключение
        if (arr.every) {

        }
    }

    changeLocation(location) {

    }
}