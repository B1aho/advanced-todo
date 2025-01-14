/**
 * Данный компонент похож на todo-list, но с упрощенным функционалом
 * Он также ловит события разных форма связанных с добавлением задач, обрабатывает их
 * И также эти события доходят потом до todo-list и он уже обрабатывает с более сложной логикой
 */
import { DataStorage } from '../../dataSaving/dataStorage';
import { saveData } from '../../dataSaving/localStore';
import styles from './subtask-list.css?raw'; // Подключаем стили

export class SubtaskList extends HTMLElement {
  constructor() {
    super();
    // Клонируем шаблон
    this.attachShadow({ mode: 'open' });

    this.list = this.shadowRoot.host;
    this.renderSubtasks = this.renderSubtasks.bind(this);
    this.renderTodoForm = this.renderTodoForm.bind(this);
    this.addTodoItemFromForm = this.addTodoItemFromForm.bind(this);
    this.removeTodo = this.removeTodo.bind(this);
  }

  connectedCallback() {
    // Логика при добавлении компонента в DOM
    const style = document.createElement('style');
    style.textContent = styles;
    this.shadowRoot.append(style);

    this.list.addEventListener('formValue', this.addTodoItemFromForm);
    this.list.addEventListener('cancelForm', this.showButton);
    this.list.addEventListener('todoChecked', this.handleSubtaskCheck);
  }

  disconnectedCallback() {
    if (this.addTodoBtn)
      this.addTodoBtn.removeEventListener('click', this.renderTodoForm);
    this.list.removeEventListener('formValue', this.addTodoItemFromForm);
    this.list.removeEventListener('cancelForm', this.showButton);
    this.list.removeEventListener('todoChecked', this.handleSubtaskCheck);
  }

  renderSubtasks(subtaskSet, canBeNested) {
    if (!(subtaskSet instanceof Set)) {
      throw new Error('Argument must be instance of Set');
    }
    const data = new DataStorage();
    // Здесь надо проверить есть ли вложенные туду и функцию для их генерации, на забывая отступ
    subtaskSet.forEach((id) => {
      const todo = data.getTodoById(id);
      const todoNode = document.createElement('todo-item');
      todoNode.setData(todo);
      this.shadowRoot.append(todoNode);
    });
    if (canBeNested) {
      this.addTodoBtn = this.createAddTodoBtn();
      this.shadowRoot.append(this.addTodoBtn);
      this.addTodoBtn.addEventListener('click', this.renderTodoForm);
    }
  }

  /**
   * Factory that create button that can render form for creating todo
   * @param {String} parentId - string that represent parent's id (project or section id)
   * @returns {HTMLButtonElement}
   */
  createAddTodoBtn() {
    const btn = document.createElement('button');
    btn.classList.add('add-todo-btn');
    btn.type = 'button';
    //btn.setAttribute("data-parent-id", this.parentId)
    btn.textContent = 'Add new subtask';
    return btn;
  }

  removeTodo(evt) {
    const todoId = evt.detail.id;
    const selector = `todo-item[data-id="${CSS.escape(todoId)}"]`;
    const todoItem = this.shadowRoot.querySelector(selector);
    todoItem.remove();
  }

  /**
   *
   * @param {*} formValues
   * @param {*} parentId
   * @returns
   */
  addTodoItemFromForm(e) {
    const formValues = e.detail.formValues;
    e.detail.subtask = true;
    const data = new DataStorage();
    const id = this.list.id;
    const parent = data.getTodoById(id);

    formValues.tags = formValues.tags.split(' ');
    formValues.deadline = formValues.deadline ? formValues.deadline : null;

    const todo = parent.createTodo(formValues);
    e.detail.subtaskObj = todo;
    data.saveTodo(todo);
    // Перемести это во внутрь data
    saveData();

    const todoNode = document.createElement('todo-item');
    todoNode.setData(todo);
    this.showButton();
    this.addTodoBtn.before(todoNode);
  }

  showButton() {
    this.addTodoBtn.style.display = 'block';
  }

  renderTodoForm() {
    const form = document.createElement('add-todo-form');
    this.addTodoBtn.before(form);
    this.addTodoBtn.style.display = 'none';
  }

  handleSubtaskCheck(e) {
    const id = e.detail.todoObj.id;
    const selector = `todo-item[data-id="${CSS.escape(id)}"]`;
    const todoItem = this.shadowRoot.querySelector(selector);
    todoItem.toggleCheckedTodoContent();
  }

  showDiag(e) {
    this.confirmDiag.showModal();
    this.elemId = e.detail.id;
  }
}

customElements.define('subtask-list', SubtaskList);
