import { formatter } from './todoParent';
/**
 * A class that represents a todo, the most basic entity in the system's classification
 */
export class TodoItem {
  _priorLevel = 0;
  _checked = false;
  indent = 1;
  subtask = new Set();

  /**
   *
   * @param {Function} dateFormater - partial applied function that format date in certain way
   * @param {String} title
   * @param {String} desc
   * @param {String} parentId
   * @param {String} deadline
   */
  constructor(dateFormater, title = '', desc = '', parentId, deadline = null) {
    if (typeof dateFormater !== 'function')
      throw new Error('dateFormater must be a function');
    this.id = crypto.randomUUID();
    this.date = dateFormater(Date.now());
    this.title = title;
    this.desc = desc;
    this.deadline = deadline;
    this.tags = null;
    this.parentId = parentId;
  }

  set priorLevel(num) {
    num = Number(num);
    if (num < 0 || num > 3) throw new Error('Not avaliable priority level');

    this._priorLevel = num;
  }

  get priorLevel() {
    return this._priorLevel;
  }

  set checked(value) {
    if (typeof value !== 'boolean') throw new Error('Checked must be boolean');

    this._checked = value;
  }

  get checked() {
    return this._checked;
  }

  /**
   * Set new todo's deadline
   * @param {string} date
   */
  setDeadline(date) {
    this.deadline = date;
  }

  /**
   * Add new tags to the existing array of tags or set new array of tags
   * @param {Array} arr
   */
  setTags(arr) {
    if (!Array.isArray(arr))
      throw new Error('Tags should be passed as array elements');
    arr = arr
      .map((el) => el.toString())
      .filter((str) => str !== '')
      .map((el) => '#' + el);
    if (this.tags) this.tags = this.tags.concat(arr);
    else this.tags = arr;
  }

  /**
   * Take values from todo-form and use this values to create istance of TodoItem
   * @param {object} values
   * @returns {TodoItem}
   */
  createTodo(values) {
    const { title, desc, deadline, prior, tags } = values;
    const todo = new TodoItem(formatter(), title, desc, this.id, deadline);
    if (prior) todo.priorLevel = prior;
    todo.setTags(tags);
    todo.indent = this.indent + 1;
    this.subtask.add(todo.id);
    return todo;
  }

  changeLocation(newParentId) {
    this.parentId = newParentId;
  }
}
