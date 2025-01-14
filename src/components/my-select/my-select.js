import styles from './my-select.css?raw';

// Глобальный реестр всех селектов
const allSelects = new Set();

export class MySelect extends HTMLElement {
  constructor() {
    super();
    console.log('activate-my select');
    // Клонируем шаблон
    const shadow = this.attachShadow({ mode: 'open' });
    const template = document.querySelector('#my-select-templ');
    const templateContent = template.content;

    // Вставляем клонированный шаблон в элемент
    shadow.append(templateContent.cloneNode(true));

    this.self = this.shadowRoot.querySelector('.my-select');
    this.selectBtn = this.self.querySelector('.select-btn');
    this.options = this.self.querySelector('.select-options');

    this.openSelect = this.openSelect.bind(this);
    this.dispatchOptionEvent = this.dispatchOptionEvent.bind(this);
  }

  connectedCallback() {
    allSelects.add(this);
    // Добавляем инкапсулируемые стили
    const style = document.createElement('style');
    style.textContent = styles;

    this.self.append(style);
    this.options.addEventListener('click', this.dispatchOptionEvent);
    this.selectBtn.addEventListener('click', this.openSelect);
  }

  disconnectedCallback() {
    this.selectBtn.removeEventListener('click', this.openSelect);
    this.options.removeEventListener('click', this.dispatchOptionEvent);
  }

  openSelect(e) {
    this.closeOtherSelects();
    if (e.target === this.selectBtn) e.stopPropagation(); // Предотвращаем событие от всплытия
    this.options.classList.toggle('hidden');
    document.addEventListener('click', () => {
      this.closeSelect(this.options);
    });
  }

  closeSelect() {
    this.options.classList.add('hidden');
    document.removeEventListener('click', () => {
      this.closeSelect();
    });
  }

  dispatchOptionEvent(e) {
    const customEvent = new CustomEvent('handleExtraOption', {
      bubbles: true,
      composed: true, // Событие сможет выйти из Shadow DOM
      detail: {
        action: e.target.dataset.action,
        projId: this.dataset.id,
      },
    });

    this.options.dispatchEvent(customEvent);
  }

  setData(optionsArr) {
    const elem = this.shadowRoot;
    const options = elem.querySelector('.select-options');
    optionsArr.forEach((optionObj) => {
      const option = document.createElement('button');
      option.classList.add('option');
      option.dataset.action = optionObj.action;
      option.textContent = optionObj.content;
      options.append(option);
    });
  }

  closeOtherSelects() {
    allSelects.forEach((select) => {
      if (select !== this) {
        select.closeSelect();
      }
    });
  }
}

customElements.define('my-select', MySelect);
