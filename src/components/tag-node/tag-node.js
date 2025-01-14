import styles from './tag-node.css?raw'; // Подключаем стили

export class TagNode extends HTMLElement {
  constructor(tag) {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const template = document.querySelector('#tag-teml');
    const templateContent = template.content;
    shadow.append(templateContent.cloneNode(true));

    this.tagContent = this.shadowRoot.querySelector('.tag-content');
    this.tagContent.textContent = tag[0] === '#' ? tag : '#' + tag;
    this.tagRemoveBtn = this.shadowRoot.querySelector('.tag-delete');
  }

  connectedCallback() {
    // Логика при добавлении компонента в DOM
    const style = document.createElement('style');
    style.textContent = styles;
    this.shadowRoot.append(style);
  }

  disconnectedCallback() {}
}

customElements.define('tag-node', TagNode);
