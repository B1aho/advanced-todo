import "../assets/style.css";
import { serialize, deserialize } from "./serialize";
import { Project } from "./todoParent";
import { TodoItem } from "./todoItem";
// Основная логика
/**
 * 1. Положить моковые тудушки в localStorage 2-3
 * 2. Каждый раз при запуске проверить наличие todo в localstorage и если есть, то отобразить их (рендеринг в отдельном модуле)
 * 3. Функция создания туду - создает экземпляр и сохраняет его в локал сторадж
 * 4. Функция удаления, удаляет туду из локал сторадж
 * 5. 
 */
const p = new Project("Title", "Desc", "green")
const todo = p.createTodo("Title todo", "Desc todo")

console.log(todo)

console.log(deserialize(serialize(todo), TodoItem.prototype))