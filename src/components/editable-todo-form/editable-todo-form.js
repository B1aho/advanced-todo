import styles from './editable-todo-form.css?raw'; // Подключаем стили

export class EditableTodoForm extends HTMLElement {
  constructor(title, desc) {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const template = document.querySelector('#dialog-form-templ');
    const templateContent = template.content;
    shadow.append(templateContent.cloneNode(true));
    this.todoTitle = this.shadowRoot.querySelector('#todo-title-textbox');
    this.todoTitle.textContent = title;
    this.todoDesc = this.shadowRoot.querySelector('#todo-desc-textbox');
    this.todoDesc.textContent = desc === '' ? ' ' : desc;
    this.confirmBtn = this.shadowRoot.querySelector('#confirm-dialog-edit');
    this.cancelBtn = this.shadowRoot.querySelector('#cancel-dialog-edit');

    this.dispatchConfirm = this.dispatchConfirm.bind(this);
    this.dispatchCancel = this.dispatchCancel.bind(this);
  }

  connectedCallback() {
    // Логика при добавлении компонента в DOM
    const style = document.createElement('style');
    style.textContent = styles;
    this.shadowRoot.append(style);
    if (this.todoTitle) this.todoTitle.focus();
    this.confirmBtn.addEventListener('click', this.dispatchConfirm);
    this.cancelBtn.addEventListener('click', this.dispatchCancel);
  }

  disconnectedCallback() {
    this.confirmBtn.removeEventListener('click', this.dispatchConfirm);
    this.cancelBtn.removeEventListener('click', this.dispatchCancel);
  }

  dispatchConfirm() {
    if (this.todoTitle.textContent === '') {
      this.todoTitle.reportValidity();
      return;
    }
    const customEvent = new CustomEvent('confirmEditableForm', {
      composed: true,
      bubbles: true,
      detail: {
        newTitle: this.todoTitle.textContent,
        newDesc: this.todoDesc.textContent,
      },
    });
    this.shadowRoot.dispatchEvent(customEvent);
  }

  dispatchCancel() {
    const customEvent = new CustomEvent('cancelEditableForm', {
      composed: true,
      bubbles: true,
    });
    this.shadowRoot.dispatchEvent(customEvent);
  }
}

customElements.define('editable-todo-form', EditableTodoForm);
