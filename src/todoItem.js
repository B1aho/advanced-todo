/**
 * A class that represents a todo, the most basic entity in the system's classification
 */
export class TodoItem {
    _priorLevel = 0
    _checked = false
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
    
        this._priorLevel = num
    }

    get priorLevel() {
        return this._priorLevel
    }

    set checked(value) {
        if (typeof value !== "boolean")
            throw new Error("Checked must be boolean")

        this._checked = value
    }

    get checked() {
        return this._checked
    }

    setDeadLine(date) {
        // Validate with regex
        this.deadLine = date
    }

    setTags(arr) {
        if (!Array.isArray(arr))
            throw new Error("Tags should be passed as array elements")
        arr = arr.map(el => toString(el))
        this.tags = arr
    }

    changeLocation(newParentId) {
        this.parentId = newParentId
    }
}