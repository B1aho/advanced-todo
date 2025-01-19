/**
 * Компонент отвечающий за детальное прдеставление задачи
 * Имеет дочерний компонент: textAreaForm, - форма для имзенения описания или названия задачи на лету
 * diag options - тоже сделать отдельным компонентом - как имзенения какие-то он пускает наверх событие и это событие
 * слушает как detail-этот диалого, так и todo-list и вносят изменения в рендеринг
 * Также и textAreaForm генерирует событие которое они оба слушают,
 * Также и checkBtn
 * Также и addSubtask добавляет сюда todo-item и в todo-list, добавляет todo-item по событию испускаемому
 *
 * Субтаска, которая здесь в subtakList, которая по существу todo-item при нажатии, генерит open detail view
 * Что означает, что todo-list открывает компонент todo-detail, значит todo-detail сначала закрывает себя на всякий случай
 * -------------------------------------------------------------------------------------------------------------------
 * Осталось для checktodoBtn - правильное поведение дописать (после того как компонент undoPopup сделаешь)
 */
import { DataStorage } from '../../dataSaving/dataStorage';
import { saveData } from '../../dataSaving/localStore';
import { ConfirmDiag } from '../confirm-diag';
import { EditableTodoForm } from '../editable-todo-form';
import { getCheckColor } from '../todo-detail-options/todo-detail-options';
import styles from './todo-detail.css?raw';

export class TodoDetail extends HTMLElement {
  constructor() {
    super();
    // Клонируем шаблон
    const shadow = this.attachShadow({ mode: 'open' });
    const template = document.querySelector('#todo-detail-templ');
    const templateContent = template.content;
    shadow.append(templateContent.cloneNode(true));
    this.confirmDiag = new ConfirmDiag(
      'Эта задача будет удалена со всеми подзадачами - безвозвратно!'
    );
    this.shadowRoot.append(this.confirmDiag);
    this.closeBtn = this.shadowRoot.querySelector('#close-diag-btn');
    this.checkBtn = this.shadowRoot.querySelector('#todo-check-btn');
    this.todoTitle = this.shadowRoot.querySelector('#diag-todo-title');
    this.desc = this.shadowRoot.querySelector('#diag-todo-desc');
    this.todoText = this.shadowRoot.querySelector('#diag-todo-item');
    this.todoTextWrapper = this.shadowRoot.querySelector(
      '.cursor-wrapper-todo'
    );
    this.mainPart = this.shadowRoot.querySelector('#main-part');
    this.subtaskList = document.createElement('subtask-list');
    this.mainPart.append(this.subtaskList);
    this.optionWrapper = this.shadowRoot.querySelector('#option-part');
    this.options = document.createElement('todo-detail-options');
    this.optionWrapper.append(this.options);
    this.diag = this.shadowRoot.querySelector('#todo-detail-dialog');

    this.showDiag = this.showDiag.bind(this);
    this.closeDiag = this.closeDiag.bind(this);
    this.changeColor = this.changeColor.bind(this);
    this.addEditableForm = this.addEditableForm.bind(this);
    this.changeTodoText = this.changeTodoText.bind(this);
    this.showTodoItem = this.showTodoItem.bind(this);
    this.blockInteraction = this.blockInteraction.bind(this);
    this.handleTodoCheck = this.handleTodoCheck.bind(this);
    this.showPopup = this.showPopup.bind(this);
    this.uncheckTodos = this.uncheckTodos.bind(this);
  }

  connectedCallback() {
    // Логика при добавлении компонента в DOM
    const style = document.createElement('style');
    style.textContent = styles;

    this.shadowRoot.append(style);
    this.closeBtn.addEventListener('click', this.closeDiag);
    this.shadowRoot.addEventListener('showConfirmDiag', (e) => {
      e.stopPropagation();
      this.confirmDiag.showDiag(e);
    });
    this.shadowRoot.addEventListener(
      'confirmEditableForm',
      this.changeTodoText
    );
    this.shadowRoot.addEventListener('cancelEditableForm', this.showTodoItem);
    this.checkBtn.addEventListener('click', this.handleTodoCheck);
    this.diag.addEventListener(
      'todoChecked',
      (e) => (e.detail.inDetail = true)
    );
    this.shadowRoot.addEventListener('undoCheck', this.uncheckTodos);
  }

  disconnectedCallback() {
    this.closeBtn.removeEventListener('click', this.closeDiag);
    this.shadowRoot.removeEventListener('showConfirmDiag', (e) => {
      this.confirmDiag.showDiag(e);
    });
    this.shadowRoot.removeEventListener(
      'removeElement',
      this.subtaskList.removeTodo
    );
    this.checkBtn.removeEventListener('changeCheckBtnColor', this.changeColor);
    this.shadowRoot.removeEventListener(
      'confirmEditableForm',
      this.changeTodoText
    );
    this.shadowRoot.removeEventListener(
      'cancelEditableForm',
      this.showTodoItem
    );
    this.diag.removeEventListener(
      'todoChecked',
      (e) => (e.detail.inDetail = true)
    );
    this.shadowRoot.removeEventListener('undoCheck', this.uncheckTodos);
    this.checkBtn.removeEventListener('click', this.handleTodoCheck);
  }

  handleTodoCheck(evt) {
    if (this.undoPopup) this.undoPopup.remove();
    // Как минимум здесь нужно будет создать undoPopup,
    const todoObj = evt.detail.todoObj
      ? evt.detail.todoObj
      : new DataStorage().getTodoById(this.todoId);
    const customEvent = new CustomEvent('todoChecked', {
      bubbles: true,
      composed: true,
      detail: {
        todoObj: todoObj,
        inDetail: true,
      },
    });
    this.blockInteraction();
    this.shadowRoot.dispatchEvent(customEvent);
  }

  showPopup(popup) {
    this.undoPopup = popup;
    this.diag.append(this.undoPopup);
  }

  dispatchRemoveEvent() {
    const customEvent = new CustomEvent('removeElement', {
      bubbles: true,
      composed: true,
      detail: { id: this.elemId },
    });
    this.shadowRoot.dispatchEvent(customEvent);
    this.diag.close();
  }

  closeDiag() {
    this.diag.close();
  }

  // Данные должные при открытии заполнятся
  showDiag(e) {
    this.todoId = e.detail.id;
    this.options.todoId = this.todoId;
    const data = new DataStorage();
    const todoObj = data.getTodoById(this.todoId);
    this.showTodoItem();
    this.todoTitle.textContent = todoObj.title;
    this.desc.textContent = todoObj.desc;
    this.options.updateData(todoObj);
    this.subtaskList.remove();
    this.subtaskList = document.createElement('subtask-list');
    this.mainPart.append(this.subtaskList);
    this.checkBtn.style.backgroundColor = getCheckColor(todoObj.priorLevel);
    this.subtaskList.id = e.detail.id;
    this.subtaskList.renderSubtasks(todoObj.subtask, todoObj.indent < 5);
    this.shadowRoot.addEventListener(
      'removeElement',
      this.subtaskList.removeTodo
    );
    this.shadowRoot.addEventListener('changeCheckBtnColor', this.changeColor);
    this.todoText.addEventListener('click', this.addEditableForm);
    if (todoObj.checked) {
      this.blockInteraction();
    }
    if (!this.diag.open) this.diag.showModal();
  }

  blockInteraction(number) {
    this.optionWrapper.classList.toggle('block');
    this.subtaskList.classList.toggle('block');
    this.todoTextWrapper.classList.toggle('block');
    this.todoText.classList.toggle('checked');
    this.checkBtn.classList.toggle('checked');
    if (number) this.subtaskList.uncheckTodos();
    else this.subtaskList.checkTodos();
  }

  uncheckTodos(evt) {
    const todoId = evt.detail.id;
    // Если отмена основной задачи и её подзадач(потенциально)
    if (todoId === this.todoId) {
      const number = evt.detail.number;
      // Разчекинить основную задачу все задачи, и субтаски, пока > number - 1, или пока есть субтаски
      this.blockInteraction(number);
    } else {
      // Если отмена субтаска
      this.subtaskList.uncheckTodo(todoId);
    }
  }

  addEditableForm() {
    const todo = new DataStorage().getTodoById(this.todoId);
    this.editForm = new EditableTodoForm(todo.title, todo.desc);
    this.todoText.before(this.editForm);
    this.todoText.style.display = 'none';
  }

  changeTodoText(evt) {
    const newTitle = evt.detail.newTitle;
    const newDesc = evt.detail.newDesc;
    this.todoTitle.textContent = newTitle;
    this.desc.textContent = newDesc;
    const todo = new DataStorage().getTodoById(this.todoId);
    todo.title = newTitle;
    todo.desc = newDesc;
    saveData();

    const customEvent = new CustomEvent('updateTodo', {
      bubbles: true,
      composed: true,
      detail: { id: this.todoId },
    });

    this.shadowRoot.dispatchEvent(customEvent);
    this.showTodoItem();
  }

  showTodoItem() {
    if (this.editForm) this.editForm.remove();
    this.todoText.style.display = 'flex';
  }

  changeColor(e) {
    this.checkBtn.style.backgroundColor = e.detail.newColor;
  }
}

customElements.define('todo-detail', TodoDetail);
