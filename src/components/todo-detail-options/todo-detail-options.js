/** Здесь осталось по аналогии реализовать обновление приоритета
 * И в tagNode реализуй удаление тэгов и также генерируй ивент обновления
 *
 *  И реализовать компонент форма text area для изменения на лету названия. И тоже генерить тоже самое событие
 * Только это сделать в todo-detail
 */

import { Datepicker } from 'vanillajs-datepicker';
import styles from './todo-detail-options.css?raw';
import ItcStyles from '../../../assets/select/itc-custom-select.css?raw';
import DatepickerStyles from '../../../assets/datepicker.css?raw';
import { ItcCustomSelect } from '../../../assets/select/itc-custom-select';
import { format } from 'date-fns';
import { TodoItem } from '../../entities/todoItem';
import { DataStorage } from '../../dataSaving/dataStorage';
import { saveData } from '../../dataSaving/localStore';
import { TagNode } from '../tag-node/tag-node';

export class TodoDetailOptions extends HTMLElement {
  constructor() {
    super();
    // Клонируем шаблон
    const shadow = this.attachShadow({ mode: 'open' });
    const template = document.querySelector('#detail-options-templ');
    const templateContent = template.content;
    shadow.append(templateContent.cloneNode(true));

    this.changeDeadlineInput =
      this.shadowRoot.querySelector('#change-deadline');
    new Datepicker(this.changeDeadlineInput, {
      minDate: format(new Date(), 'P'),
      autohide: true,
      title: 'Set dead line',
      clearButton: true,
      todayButton: true,
    });

    this.prioritySelect = this.shadowRoot.querySelector('#priority-menu-diag');
    this.selectBtn = this.shadowRoot.querySelector('#select-btn');
    new ItcCustomSelect(this.prioritySelect);

    this.tagList = this.shadowRoot.querySelector('#tag-list');
    this.tagInput = this.shadowRoot.querySelector('#add-tag-input');
    this.addTagBtn = this.shadowRoot.querySelector('#add-tag-btn');

    this.updateTagList = this.updateTagList.bind(this);
    this.updateData = this.updateData.bind(this);
    this.addTags = this.addTags.bind(this);
    this.makeUpdateEvent = this.makeUpdateEvent.bind(this);
    this.updateDeadline = this.updateDeadline.bind(this);
  }

  connectedCallback() {
    const style = document.createElement('style');
    style.textContent = styles + ItcStyles + DatepickerStyles;
    this.shadowRoot.append(style);

    this.addTagBtn.addEventListener('click', this.addTags);
  }

  addTags() {
    if (this.tagInput.value === '') return;
    let newTags = this.tagInput.value.split(' ');
    const todoObj = new DataStorage().getTodoById(this.todoId);
    newTags = removeDuplicatedTagsAndSave(todoObj, newTags);
    this.updateTagList(newTags);
    this.shadowRoot.host.dispatchEvent(this.makeUpdateEvent);
    this.tagInput.value = '';
  }

  disconnectedCallback() {
    this.addTagBtn.removeEventListener('click', this.addTags);
    this.changeDeadlineInput.removeEventListener(
      'changeDate',
      this.updateDeadline
    );
  }

  makeUpdateEvent() {
    const customEvent = new CustomEvent('updateTodo', {
      bubbles: true,
      composed: true,
      detail: { id: this.todoId },
    });
    return customEvent;
  }

  updateDeadline() {
    const newDeadline = this.changeDeadlineInput.value;
    const todo = new DataStorage().getTodoById(this.todoId);
    todo.setDeadline(newDeadline);
    saveData();
    this.shadowRoot.host.dispatchEvent(this.makeUpdateEvent());
  }

  /**
   *
   * @param {TodoItem} todoObj
   */
  updateData(todoObj) {
    this.todoId = todoObj.id;
    this.changeDeadlineInput.value = todoObj.deadline;
    this.changeDeadlineInput.addEventListener(
      'changeDate',
      this.updateDeadline
    );
    this.selectBtn.textContent = getCheckWord(todoObj.priorLevel);
    this.tagList.innerHTML = '';
    this.updateTagList(todoObj.tags);
  }

  updateTagList(tagArray) {
    tagArray.forEach((tag) => {
      this.tagList.append(new TagNode(tag));
    });
  }
}

customElements.define('todo-detail-options', TodoDetailOptions);

/**
 *
 * @param {TodoItem} todoObj
 * @param {Array} newTags
 */
function removeDuplicatedTagsAndSave(todoObj, newTags) {
  const noDuplicateArr = [];
  const oldTags = todoObj.tags;
  newTags.forEach((tag) => {
    if (!oldTags.find((el) => el === '#' + tag)) noDuplicateArr.push(tag);
  });
  todoObj.setTags(noDuplicateArr);
  saveData();
  return noDuplicateArr;
}

/**
 * В общую папкус utility функциями, если нужна не только здесь!!!!!!!!!
 *
 * This function returns a string representing the word representation of todo priority level
 * @param {Number} prior - TodoItem.priorityLevel
 * @returns {String}
 */
function getCheckWord(prior) {
  let word = 'None';
  switch (prior) {
    case 1:
      word = 'Low';
      break;
    case 2:
      word = 'Medium';
      break;
    case 3:
      word = 'High';
      break;
    default:
      break;
  }
  return word;
}
