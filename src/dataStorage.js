// Сделать синглтон
export class DataStorage {
    projects = new Map()   // Хранит проекты с id как ключом
    sections = new Map()    // Хранит секции с id как ключом
    todos = new Map()       // Хранит todos с id как ключом

    saveProject(project) {
        this.projects.set(project.id, project)
    }

    getProjectById(id) {
        return data.projects.get(id)
    }

    saveSection(section) {
        this.sections.set(section.id, section)
    }

    getSectionById(id) {
        return data.sections.get(id)
    }

    saveTodo(todo) {
        this.todos.set(todo.id, todo)
    }

    getTodoById(id) {
        return data.todos.get(id)
    }

    // По сути в памяти элементы находятся через data, значит надо удалить их рекурсивно там в первую очередь
    // Но еще есть строки id у родительского элемента - её удалить в конце и всё
    removeElement(elementId) {
        const type = this.projects.has(elementId) ? "projects" : this.sections.has(elementId) ? "sections" : "todos"
        let elem = this[type].get(elementId)
        if (haveNestedSections(elem)) {
            // Выполнить рекурсивное удаление для каждой секции
            elem.sections.forEach(secId => removeElement(secId))
        }
        if (haveNestedTodos(elem)) {
            // Выполнить рекурсивное удаление для каждой туду
            elem.todos.forEach(todoId => removeElement(todoId))
        }
        // Delete element's id in parent element if has parent
        if (elem.parentId) {
            const parentType = this.projects.has(elem.parentId) ? "projects" : "sections"
            this[parentType].get(elem.parentId)[type].delete(elementId)
        }
        // Delete element
        this[type].delete(elementId)
        elem = null
    }

    haveNestedSections(elem) {
        if ((elem.sections === undefined || elem.sections.size === 0))
            return false
        return true
    }

    haveNestedTodos(elem) {
        if ((elem.todos === undefined || elem.todos.size === 0))
            return false
        return true
    }
}