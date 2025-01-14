import styles from './project-list-item.css?raw'; // Подключаем стили

export class ProjectListItem extends HTMLElement {
  constructor() {
    super();
    // Клонируем шаблон
    const shadow = this.attachShadow({ mode: 'open' });
    const template = document.querySelector('#project-list-item');
    const templateContent = template.content;

    // Вставляем клонированный шаблон в элемент
    shadow.append(templateContent.cloneNode(true));

    this.listItem = this.shadowRoot.querySelector('.sidebar-list-item');
    this.svgContainer = this.shadowRoot.querySelector('.sidebar-svg-container');
    this.listItemTitle = this.shadowRoot.querySelector(
      '.sidebar-project-title'
    );
    this.shadow = this.shadowRoot;
    this.dispatchOpenProjectEvent = this.dispatchOpenProjectEvent.bind(this);
    this.setData = this.setData.bind(this);
  }

  connectedCallback() {
    // Логика при добавлении компонента в DOM
    const style = document.createElement('style');
    style.textContent = styles;

    this.shadowRoot.append(style);

    this.listItem.addEventListener('click', this.dispatchOpenProjectEvent);
  }

  disconnectedCallback() {
    this.listItem.removeEventListener('click', this.dispatchOpenProjectEvent);
  }

  setData(project) {
    this.setAttribute('data-id', project.id);
    this.setAttribute('draggable', true);
    this.classList.add('project-list-item');
    this.listItem.setAttribute('data-id', project.id);
    this.svgContainer.setAttribute('color', project.color);

    const select = document.createElement('my-select');
    this.select = select;
    const options = [
      {
        action: 'remove',
        content: 'Удалить',
      },
      {
        action: 'change',
        content: 'Изменить',
      },
    ];
    select.setData(options);
    select.setAttribute('data-id', project.id);
    this.listItem.append(select);

    this.listItemTitle.textContent = project.title;
  }

  dispatchOpenProjectEvent(e) {
    if (e.target !== this.select) {
      const customEvent = new CustomEvent('openProject', {
        bubbles: true,
        composed: true, // Событие сможет выйти из Shadow DOM
        detail: { id: this.dataset.id }, // Передаем строку через detail
      });
      this.listItem.dispatchEvent(customEvent);
    }
  }

  confirmChanges(title, color) {
    if (title) this.listItemTitle.textContent = title;
    if (color) this.svgContainer.setAttribute('color', color);
  }
}

customElements.define('project-list-item', ProjectListItem);
