import { formatter } from "./todoParent"
/**
 * A class that represents a todo, the most basic entity in the system's classification
 */
export class TodoItem {
    _priorLevel = 0
    _checked = false
    indent = 1
    /**
     * Придется добавить отдельно (де)сериализацию для субтасков
     * По мимо этого поменять функции рендеринга
     * 
     * Теперь у нас есть проект, секции таски и субтаски
     * Сущностно таски от субтасков не отличаются, кроме как тем, что у субтасков всегда родитель типа TodoItem
     * Но если перетащить субтаск в другое место то он будет выглядеть как обычный таск
     * Логика та же. Каждый таск хранит массив set из id вложенных тасков. Соответсвенно у вложенных тасков id родителя - id другого таска
     * 
     * Datastorage же не будет хранить отдельную коллекцию, так как вложенные таски это таски
     * 
     * Нужно будет обдумать рендеринг вложенных тасков, задавать иметь дата-аттрибут отступов, ограничить вложенность.
     * Добавить методы для класса TodoItem, которые будут создавать подтаски. 
     * 
     * Как это сделаешь и протестируешь - займись реализацией диалогового окна, которое открывается при нажатии
     * на таск, там можно добавить комментарий вместе со вложением файла, изменить таск и удалить
     * 
     */
    subtask = new Set()

    constructor(dateFormater, title = "", desc = "", parentId, deadline = null) {
        if (typeof dateFormater !== "function")
            throw new Error("dateFormater must be a function")
        this.id = crypto.randomUUID()
        this.date = dateFormater(Date.now())
        this.title = title
        this.desc = desc
        this.deadline = deadline
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

    setDeadline(date) {
        // Validate with regex
        this.deadline = date
    }

    setTags(arr) {
        if (!Array.isArray(arr))
            throw new Error("Tags should be passed as array elements")
        arr = arr.map(el => el.toString()).filter(str => str !== "").map(el => '#' + el)
        if (this.tags)
            this.tags = this.tags.concat(arr)
        else
            this.tags = arr
    }

    createTodo(values) {
        const { title, desc, deadline, prior, tags } = values
        const todo = new TodoItem(formatter(), title, desc, this.id, deadline)
        if (prior)
            todo.priorLevel = prior
        todo.setTags(tags)
        todo.indent = this.indent + 1
        this.subtask.add(todo.id)
        return todo
    }

    changeLocation(newParentId) {
        this.parentId = newParentId
    }
}