/**
 * Компонент отвечает за изменения состояний задач (выполнение, удаление, изменение данных)
 * Для этого вложенные задачи генерируют наверх списку разные события:
 * "ОткрытьФормуДляПодтверженияУдаления"
 * "ОткрытьРасширенноеПредставлениеЗадачи"
 * "ВыполнитьЗадачу"
 * Открывает эти формы, далее формы также генерируют ему события, которые с результатом
 * Компонент списка выполняет необходимые действия передавая дочерним компонентам события либо напрямую через методы дочерних компонентов
 */
import { DataStorage } from '../../dataSaving/dataStorage';
import { saveData } from '../../dataSaving/localStore';
import {
  fillArrayWithSubtaskNodes,
  showUndoPopup,
} from '../../render/createDOMutility';
import { ConfirmDiag } from '../confirm-diag';
import styles from './todo-list.css?raw'; // Подключаем стили

export class TodoList extends HTMLElement {
  constructor() {
    super();
    // Клонируем шаблон
    this.attachShadow({ mode: 'open' });

    this.list = this.shadowRoot.host;
    this.diag = new ConfirmDiag(
      'Эта задача будет удалена со всеми подзадачами - безвозвратно!'
    );
    this.detailTodo = document.createElement('todo-detail');
    this.shadowRoot.append(this.diag, this.detailTodo);
    this.detailTodo.closeDiag();

    this.renderTodoForm = this.renderTodoForm.bind(this);
    this.handleTodoSet = this.handleTodoSet.bind(this);
    this.createAddTodoBtn = this.createAddTodoBtn.bind(this);
    this.createTodoItem = this.createTodoItem.bind(this);
    this.showButton = this.showButton.bind(this);
    this.toggleCheckedAllTodoNodes = this.toggleCheckedAllTodoNodes.bind(this);
    this.hideTodoWithSubtasks = this.hideTodoWithSubtasks.bind(this);
    this.removeTodo = this.removeTodo.bind(this);
    this.openDetailView = this.openDetailView.bind(this);
    this.updateTodoItem = this.updateTodoItem.bind(this);
    this.changeColor = this.changeColor.bind(this)
  }

  connectedCallback() {
    // Логика при добавлении компонента в DOM
    const style = document.createElement('style');
    style.textContent = styles;

    this.shadowRoot.append(style);
    this.parentId = this.shadowRoot.host.dataset.id;
    this.parentType = this.shadowRoot.host.dataset.parentType;
    this.addTodoBtn.addEventListener('click', this.renderTodoForm);
    this.list.addEventListener('formValue', this.createTodoItem);
    this.list.addEventListener('cancelForm', this.showButton);
    this.list.addEventListener('todoChecked', this.handleTodoCheck);
    this.list.addEventListener('showConfirmDiag', (e) => {
      this.diag.showDiag(e);
    });
    this.list.addEventListener('removeElement', this.removeTodo);
    this.list.addEventListener('showDetailView', this.openDetailView);
    this.list.addEventListener('updateTodo', this.updateTodoItem);
    this.list.addEventListener('changeCheckBtnColor', this.changeColor);
  }

  disconnectedCallback() {
    this.addTodoBtn.removeEventListener('click', this.renderTodoForm);
    this.list.removeEventListener('formValue', this.createTodoItem);
    this.list.removeEventListener('cancelForm', this.showButton);
    this.list.removeEventListener('todoChecked', this.handleTodoCheck);
    this.list.removeEventListener('showConfirmDiag', (e) => {
      this.diag.showDiag(e);
    });
    this.list.removeEventListener('removeElement', this.removeTodo);
    this.list.removeEventListener('showDetailView', this.openDetailView);
    this.list.removeEventListener('updateTodo', this.updateTodoItem);
    this.list.removeEventListener('changeCheckBtnColor', this.changeColor);
  }

  openDetailView(evt) {
    this.detailTodo.showDiag(evt);
  }

  updateTodoItem(evt) {
    const todoId = evt.detail.id;
    const selector = `todo-item[data-id="${CSS.escape(todoId)}"]`;
    const todoItem = this.shadowRoot.querySelector(selector);
    todoItem.updateRendering();
  }

  removeTodo(evt) {
    const todoId = evt.detail.id;
    const data = new DataStorage();
    let todosNumber = data.removeElement(todoId);

    const selector = `todo-item[data-id="${CSS.escape(todoId)}"]`;
    let todoItem = this.shadowRoot.querySelector(selector);
    while (todosNumber) {
      const nextTodo = todoItem.nextSibling;
      todoItem.remove();
      todosNumber--;
      todoItem = nextTodo;
    }
  }

  changeColor(evt) {
    const todoId = evt.detail.id;
    const selector = `todo-item[data-id="${CSS.escape(todoId)}"]`;
    const todoItem = this.shadowRoot.querySelector(selector);
    todoItem.changeColor(evt.detail.newColor);
  }

  handleTodoSet(todoSet) {
    if (!(todoSet instanceof Set)) {
      throw new Error('Argument must be instance of Set');
    }
    const data = new DataStorage();
    // Здесь надо проверить есть ли вложенные туду и функцию для их генерации, на забывая отступ
    todoSet.forEach((id) => {
      const subtaskArr = [];
      const todo = data.getTodoById(id);
      const todoNode = document.createElement('todo-item');
      todoNode.setData(todo);
      this.shadowRoot.append(todoNode);
      if (todo.subtask.size > 0) {
        // Сюда перенести utility
        fillArrayWithSubtaskNodes(subtaskArr, todo);
      }
      subtaskArr.forEach((subtask) => {
        this.shadowRoot.append(subtask);
      });
    });
    this.addTodoBtn = this.createAddTodoBtn();
    this.shadowRoot.append(this.addTodoBtn);
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
    btn.setAttribute('data-parent-id', this.parentId);
    btn.textContent = 'Add new Todo';
    return btn;
  }

  showButton() {
    this.addTodoBtn.style.display = 'block';
  }

  renderTodoForm() {
    const form = document.createElement('add-todo-form');
    this.addTodoBtn.before(form);
    this.addTodoBtn.style.display = 'none';
  }

  /**
   *
   * @param {*} formValues
   * @param {*} parentId
   * @returns
   */
  createTodoItem(e) {
    const formValues = e.detail.formValues;
    const data = new DataStorage();

    if (e.detail.subtask) {
      const todoNode = document.createElement('todo-item');
      todoNode.setData(e.detail.subtaskObj);
      this.showButton();
      this.addTodoBtn.before(todoNode);
      return;
    }

    const parentType = this.parentType;
    const id = this.parentId;
    let parent;
    if (parentType === 'project') {
      parent = data.getProjectById(id);
    } /* if (parentType === "section") */ else {
      parent = data.getSectionById(id);
    }
    // if (parentType === "todo") {
    //     parent = data.getTodoById(id)
    // }

    formValues.tags = formValues.tags.split(' ');
    formValues.deadline = formValues.deadline ? formValues.deadline : null;

    const todo = parent.createTodo(formValues);
    data.saveTodo(todo);
    saveData();

    const todoNode = document.createElement('todo-item');
    todoNode.setData(todo);
    this.showButton();
    this.addTodoBtn.before(todoNode);
  }

  handleTodoCheck(e) {
    const todoObj = e.detail.todoObj;
    const data = new DataStorage();
    // Затоглить все субтаски этой задачи рекурсивно мб в отдельный функционал всё что тоглит выше
    this.toggleCheckedAllTodoNodes(todoObj);
    // Затогглить данные в хранилище и сохранить
    toggleCheckedTodoData(todoObj);
    saveData();

    if (todoObj.checked) {
      const todoDiag = document.querySelector('#todo-dialog');
      data.lastTimeRef = setTimeout(() => {
        this.hideTodoWithSubtasks(todoObj);
      }, 3000);
      // Popup сделать отдельным компонентом, мб наверх посылать и приложение решит само, мб в индексе
      if (!todoDiag || !todoDiag.open) showUndoPopup(todoObj);
    } else {
      if (data.lastTimeRef) clearTimeout(data.lastTimeRef);
      this.uncheckTodoContainers(todoObj);
      const undoPopup = document.querySelector('.undo-popup');
      if (undoPopup) undoPopup.remove();
    }
  }

  toggleCheckedAllTodoNodes(todo) {
    if (todo.subtask.size > 0)
      todo.subtask.forEach((subId) =>
        this.toggleCheckedAllTodoNodes(new DataStorage().getTodoById(subId))
      );

    const selector = `todo-item[data-id="${CSS.escape(todo.id)}"]`;
    const todoItem = this.shadowRoot.querySelector(selector);
    todoItem.toggleCheckedTodoContent();
    // С этим разобраться: мб это вообще не юрисдикция todo-list так что просто диалог будет какому-то верхнему компоненту передавать, который порешает
    const dialiogSelector = `.diag-todo-item[data-id="${CSS.escape(todo.id)}"]`;
    const diagTextContainer = document.querySelector(dialiogSelector);
    if (diagTextContainer) {
      diagTextContainer.classList.toggle('checked');
    }
  }

  hideTodoWithSubtasks(todo) {
    if (todo.subtask.size > 0)
      todo.subtask.forEach((subId) =>
        this.hideTodoWithSubtasks(new DataStorage().getTodoById(subId))
      );
    const selector = `todo-item[data-id="${CSS.escape(todo.id)}"]`;
    const todoNode = this.shadowRoot.querySelector(selector);
    todoNode.hide();
  }

  hideCheckedTodo(todo) {
    if (todo.subtask.size > 0)
      todo.subtask.forEach((subId) =>
        this.hideCheckedTodo(new DataStorage().getTodoById(subId))
      );
    const selector = `todo-item[data-id="${CSS.escape(todo.id)}"]`;
    const todoNode = this.shadowRoot.querySelector(selector);
    todoNode.hide();
  }

  unhideCheckedTodo(todo) {
    const selector = `todo-item[data-id="${CSS.escape(todo.id)}"]`;
    const todoNode = this.shadowRoot.querySelector(selector);
    todoNode.unhide();
  }

  uncheckTodoContainers(todo) {
    if (todo.subtask.size > 0)
      todo.subtask.forEach((subId) =>
        this.uncheckTodoContainers(new DataStorage().getTodoById(subId))
      );
    const selector = `todo-item[data-id="${CSS.escape(todo.id)}"]`;
    const todoNode = this.shadowRoot.querySelector(selector);
    if (todo.checked) todoNode.unhide();
  }
}

customElements.define('todo-list', TodoList);

/**
 *
 * @param {TodoItem} todo
 */
export function toggleCheckedTodoData(todo) {
  if (todo.subtask.size > 0)
    todo.subtask.forEach((subId) =>
      toggleCheckedTodoData(new DataStorage().getTodoById(subId))
    );
  if (todo.checked) todo.checked = false;
  else todo.checked = true;
}
