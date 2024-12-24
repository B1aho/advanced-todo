class TodoItem {
    title = ""
    desc = ""
    priorLevel = 0
    checked = false
    #deadLine

    set priorLevel(priorLevel) {
        if (priorLevel < 0 || priorLevel > 3) {
            console.warn("Wrong value for priority level")
            return
        }
        this.priorLevel = priorLevel
    }

    get priorLevel() {
        return this.priorLevel
    }

    set checked(value) {
        if (value !== true && value !== false)
            return
        this.checked = value
    }

    setDeadLine(date) {
        this.#deadLine = date
    }

    getDeadLine() {
        return this.#deadLine
    }
}