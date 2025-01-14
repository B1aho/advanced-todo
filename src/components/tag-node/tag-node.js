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

    this.removeTag = this.removeTag.bind(this);
  }

  connectedCallback() {
    // Логика при добавлении компонента в DOM
    const style = document.createElement('style');
    style.textContent = styles;
    this.shadowRoot.append(style);

    this.tagRemoveBtn.addEventListener('click', this.removeTag);
  }

  disconnectedCallback() {
    this.tagRemoveBtn.removeEventListener('click', this.removeTag);
  }

  removeTag() {
    const tag = this.tagContent.textContent;
    const customEvent = new CustomEvent('removeTag', {
      bubbles: true,
      composed: true,
      detail: { tag: tag },
    });
    this.shadowRoot.dispatchEvent(customEvent);
    this.shadowRoot.host.remove();
  }
}

customElements.define('tag-node', TagNode);
