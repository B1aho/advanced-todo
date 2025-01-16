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
import { fillArrayWithSubtaskNodes } from '../../render/createDOMutility';
import { ConfirmDiag } from '../confirm-diag';
import { UndoPopup } from '../undo-popup/undo-popup';
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
    this.unhideTodoWithSubtasks = this.unhideTodoWithSubtasks.bind(this);
    this.hideTodoWithSubtasks = this.hideTodoWithSubtasks.bind(this);
    this.removeTodo = this.removeTodo.bind(this);
    this.openDetailView = this.openDetailView.bind(this);
    this.updateTodoItem = this.updateTodoItem.bind(this);
    this.changeColor = this.changeColor.bind(this);
    this.addSubtask = this.addSubtask.bind(this);
    this.undoCheck = this.undoCheck.bind(this);
    this.toggleCheckedAllTodoParentNodes =
      this.toggleCheckedAllTodoParentNodes.bind(this);
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
    this.list.addEventListener('undoCheck', this.undoCheck);
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
    this.list.removeEventListener('undoCheck', this.undoCheck);
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
      const todoObj = e.detail.subtaskObj;
      this.addSubtask(todoObj);
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

  addSubtask(todoObj) {
    const data = new DataStorage();
    const todoNode = document.createElement('todo-item');
    todoNode.setData(todoObj);
    const selector = `todo-item[data-id="${CSS.escape(todoObj.parentId)}"]`;
    let todoParent = this.shadowRoot.querySelector(selector);
    let childNum = getSubtasksNumber(data.getTodoById(todoObj.parentId)) - 1;
    // Функцию сделать которая считаает не только подзадачи этой задачи, но и всех подзадач и выдает число
    while (childNum) {
      todoParent = todoParent.nextElementSibling;
      childNum--;
    }
    todoParent.after(todoNode);
    this.showButton();
  }

  // определится с логикой - на бумаге!!!
  handleTodoCheck(e) {
    const todoObj = e.detail.todoObj;
    const inDetail = e.detail.inDetail;
    //const data = new DataStorage();
    // Затоглить все субтаски этой задачи рекурсивно
    this.toggleCheckedAllTodoNodes(todoObj);
    this.toggleCheckedAllTodoParentNodes(todoObj);
    // Затоглить данные в хранилище и сохранить
    toggleCheckedTodoDataWithSubtasks(todoObj);
    saveData();
    if (this.undoPopup) this.undoPopup.removeSelf();
    if (todoObj.checked) {
      this.hideTodoWithSubtasks(todoObj);
      if (!inDetail) {
        this.undoPopup = new UndoPopup(todoObj.id);
        this.shadowRoot.append(this.undoPopup);
      }
    } else {
      if (inDetail) {
        e.detail.onlyTodo = true;
        e.detail.id = todoObj.id;
        e.detail.touchUndo = true;
        this.undoCheck(e);
      }
      else this.unhideTodoWithSubtasks(todoObj);
    }
  }

  undoCheck(evt) {
    const todoObj = new DataStorage().getTodoById(evt.detail.id);
    if (evt.detail.onlyTodo) {
      // if (evt.detail.touchUndo) {
      //   //toggleCheckedTodoData(todoObj);
      //   this.unhideCheckedTodo(todoObj);
      //   return;
      // }
      toggleCheckedTodoData(todoObj);
      this.unhideCheckedTodo(todoObj);
      this.toggleCheckedTodoNode(todoObj);
      return;
    }
    this.toggleCheckedAllTodoNodes(todoObj);
    // Затогглить данные в хранилище и сохранить
    toggleCheckedTodoDataWithSubtasks(todoObj);
    //this.uncheckTodoContainers(todoObj);
    this.unhideTodoWithSubtasks(todoObj);
    //clearTimeout(new DataStorage().lastTimeRef); // Отменяем переданный таймаут
  }

  toggleCheckedAllTodoNodes(todo) {
    if (todo.subtask.size > 0)
      todo.subtask.forEach((subId) =>
        this.toggleCheckedAllTodoNodes(new DataStorage().getTodoById(subId))
      );

    const selector = `todo-item[data-id="${CSS.escape(todo.id)}"]`;
    const todoItem = this.shadowRoot.querySelector(selector);
    todoItem.toggleCheckedTodoContent();
  }

  toggleCheckedAllTodoParentNodes(todo) {
    const todoParentObj = new DataStorage().getTodoById(todo.parentId);
    if (todoParentObj && todoParentObj.checked) {
      const selector = `todo-item[data-id="${CSS.escape(todoParentObj.id)}"]`;
      const todoItem = this.shadowRoot.querySelector(selector);
      todoItem.toggleCheckedTodoContent();
      toggleCheckedTodoData(todoParentObj);
      this.toggleCheckedAllTodoParentNodes(todoParentObj);
    }
    return;
  }

  toggleCheckedTodoNode(todo) {
    const selector = `todo-item[data-id="${CSS.escape(todo.id)}"]`;
    const todoItem = this.shadowRoot.querySelector(selector);
    todoItem.toggleCheckedTodoContent();
  }

  unhideTodoWithSubtasks(todo) {
    if (todo.subtask.size > 0)
      todo.subtask.forEach((subId) =>
        this.unhideTodoWithSubtasks(new DataStorage().getTodoById(subId))
      );
    if (todo.checked) return;
    const selector = `todo-item[data-id="${CSS.escape(todo.id)}"]`;
    const todoNode = this.shadowRoot.querySelector(selector);
    todoNode.unhide();
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
export function toggleCheckedTodoDataWithSubtasks(todo) {
  if (todo.subtask.size > 0)
    todo.subtask.forEach((subId) =>
      toggleCheckedTodoDataWithSubtasks(new DataStorage().getTodoById(subId))
    );
  if (todo.checked) todo.checked = false;
  else todo.checked = true;
  saveData();
}

function toggleCheckedTodoData(todo) {
  if (todo.checked) todo.checked = false;
  else todo.checked = true;
  saveData();
}

/**
 * @param {TodoItem} todoObj
 */
function getSubtasksNumber(todoObj) {
  const data = new DataStorage();
  let number = 0;
  todoObj.subtask.forEach((subId) => {
    number++;
    number += getSubtasksNumber(data.getTodoById(subId));
  });
  return number;
}
