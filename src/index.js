// Использовать min, max, clamp - функции для указания ширины, resizable, когда двигается navbar
import '../assets/style.css';
import './components';
import { DataStorage } from './dataSaving/dataStorage';
import { getApp } from './dataSaving/localStore';
import { renderListOfProjects } from './render/todoRender';
import {
  initAddProjectBtn,
  openNavbar,
  toggleNavbar,
} from './render/createDOMutility';

/**
 * Инициализуируем ран-тайм хранилище, либо пусто, либо что-то есть. Отрисовываем то, что есть
 * Отрисовать список проектов в navbar
 */
document.addEventListener('DOMContentLoaded', () => {
  const data = initData();
  initAddProjectBtn();
  renderListOfProjects(data.projects);

  const resizer = document.querySelector('#resizer');
  const navbar = document.querySelector('nav');
  let isResizing = false;

  resizer.addEventListener('mousedown', () => {
    isResizing = true;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    navbar.style.pointerEvents = 'none';
  });

  // Неправильно, надо его вешать только когда mousedown, а то так на постояенке тектит
  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;

    const newWidth = e.clientX;
    const minWidth = parseInt(getComputedStyle(navbar).minWidth, 10);
    const maxWidth = parseInt(getComputedStyle(navbar).maxWidth, 10);

    if (newWidth >= minWidth && newWidth <= maxWidth) {
      navbar.style.width = `${newWidth - 20}px`;
    }

    if (newWidth < minWidth) {
      toggleNavbar();
      isResizing = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    }

    if (newWidth >= 70 && minWidth === 0) {
      openNavbar();
      isResizing = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    }
  });

  document.addEventListener('mouseup', () => {
    isResizing = false;
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
    navbar.style.pointerEvents = 'auto';
  });
});

/**
 * Check if localStorage have valid data then return it. Else create new instance and return
 * @returns {DataStorage} - Instance of DataStorage class
 */
function initData() {
  const lastData = getApp();
  if (lastData) {
    return new DataStorage(lastData);
  }
  return new DataStorage();
}
