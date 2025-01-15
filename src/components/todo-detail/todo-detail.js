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
 * Правильное добавление подзадач
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
    if (!this.diag.open) this.diag.showModal();
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

/**
 * It creates HTML elements from each todo's subtask (but not subtask's subtasks) and places these nodes
 * into the passed array without returning anything
 * @param {Array} arr
 * @param {TodoItem} todo
 */
function fillArrayWithDirectSubtaskNodes(arr, todo) {
  const data = new DataStorage();
  const subtaskSet = todo.subtask;
  subtaskSet.forEach((subtaskId) => {
    const subtask = data.getTodoById(subtaskId);
    // add todoNode to the array
    // add todoNode to the array
    const todoNode = document.createElement('todo-item');
    todoNode.setData(subtask);
    arr.push(todoNode);
  });
}
