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
 */
import { DataStorage } from '../../dataSaving/dataStorage';
import { ConfirmDiag } from '../confirm-diag';
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
    if (!this.diag.open) this.diag.showModal();
  }

  changeColor(e) {
    this.checkBtn.style.backgroundColor = e.detail.newColor;
  }
}

customElements.define('todo-detail', TodoDetail);

/**
 *
 * @param {*} e
 */
export function RenderTodoDiag(e) {
  const lastDiag = document.querySelector('#todo-dialog');
  if (lastDiag) lastDiag.remove();
  const diag = createDiagFromTempl(e);
  document.body.append(diag);
  diag.showModal();
}

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

// В формы перенести
/**
 * This function creates a form by initializing a template. The form provides editable fields for modifying
 * the title and description of a todo while being displayed in the extended representation of the todo (dialog window)
 * @param {TodoItem} todo
 * @param {HTMLElement} targetNode - an HTML element before which the form will be inserted in the dialog window
 */
export function createTodoTextForm(todo, targetNode) {
  const template = document.querySelector('#dialog-form-templ');
  const clone = template.content.cloneNode(true);
  const form = clone.querySelector('#dialog-form');

  const title = clone.querySelector('#dialog-form-title');
  title.textContent = todo.title;
  const desc = clone.querySelector('#dialog-form-desc');
  desc.textContent = todo.desc === '' ? 'Описание' : todo.desc;

  const confirm = clone.querySelector('#confirm-dialog-edit');
  confirm.addEventListener('click', (e) => {
    e.preventDefault();
    const newTitle = title.textContent;
    const newDesc = desc.textContent;
    todo.title = newTitle;
    todo.desc = newDesc;

    updateDiagText(newTitle, newDesc);
    updateTodoText(newTitle, newDesc, todo.id);
    form.remove();
    saveData();
    targetNode.style.display = 'flex';
  });

  const cancel = clone.querySelector('#cancel-dialog-edit');
  cancel.addEventListener('click', (e) => {
    e.preventDefault();
    form.remove();
    targetNode.style.display = 'flex';
  });

  targetNode.before(form);
  const titleTextBox = document.querySelector('#todo-title-textbox');
  titleTextBox.focus();
  targetNode.style.display = 'none';
}
