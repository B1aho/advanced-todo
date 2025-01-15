import styles from './undo-popup.css?raw';

export class UndoPopup extends HTMLElement {
  constructor(todoId) {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const template = document.querySelector('#undo-popup-templ');
    const templateContent = template.content;
    shadow.append(templateContent.cloneNode(true));

    this.diag = this.shadowRoot.querySelector('#undo-popup');
    this.undoBtn = this.shadowRoot.querySelector('#undo-btn');
    this.closeBtn = this.shadowRoot.querySelector('#close-undo-btn');
    this.loader = this.shadowRoot.querySelector('#loader');
    this.todoId = todoId;

    this.removeSelf = this.removeSelf.bind(this);
    this.dispatchUndo = this.dispatchUndo.bind(this);
  }

  connectedCallback() {
    const style = document.createElement('style');
    style.textContent = styles;
    this.shadowRoot.append(style);

    this.diag.show();
    this.loader.style.transform = 'scaleX(0)';
    this.autoCloseTimeout = setTimeout(() => {
      this.shadowRoot.host.remove();
    }, 3000);

    this.undoBtn.addEventListener('click', this.dispatchUndo);

    // Обработчик кнопки "Закрыть"
    this.closeBtn.addEventListener('click', this.removeSelf);
  }

  removeSelf() {
    clearTimeout(this.autoCloseTimeout); // Убираем автозакрытие попапа
    this.shadowRoot.host.remove();
  }

  disconnectedCallback() {
    this.closeBtn.removeEventListener('click', this.removeSelf);
    this.undoBtn.removeEventListener('click', this.dispatchUndo);
  }

  dispatchUndo() {
    const customEvent = new CustomEvent('undoCheck', {
      bubbles: true,
      composed: true,
      detail: { id: this.todoId },
    });
    this.shadowRoot.dispatchEvent(customEvent);
    clearTimeout(this.autoCloseTimeout); // Убираем автозакрытие попапа
    this.removeSelf();
  }
}

customElements.define('undo-popup', UndoPopup);
