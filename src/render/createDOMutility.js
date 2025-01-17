// Fabric на factory поменяй
import { ItcCustomSelect } from '../../assets/select/itc-custom-select';
import { DataStorage } from '../dataSaving/dataStorage';
import { saveData } from '../dataSaving/localStore';
import { Project } from '../entities/todoParent';
import { openProjectFormDiag, renderSectionForm } from './todoForm';
import {
  hideOptions,
  renderProjectContent,
  renderProjectListItem,
  renderSectionExtraOptions,
  updateProjectContentAfterChanging,
  updateProjectContentAfterDeletion,
  updateProjectListAfterChanging,
  updateProjectListAfterDeletion,
  updateSectionContentAfterDeletion,
} from './todoRender';
/**
 * Fabric that create button that can render new Section
 * @param {String} parentId - string that represent project's id. This project is parent for future sections
 * @returns {HTMLButtonElement}
 */
export function createAddSectionBtn(parentId) {
  const btn = document.createElement('button');
  btn.classList.add('add-section-btn');
  btn.type = 'button';
  btn.setAttribute('data-parent-id', parentId);
  btn.addEventListener('click', renderSectionForm);
  btn.textContent = 'Add new section';
  return btn;
}

/**
 * It creates HTML elements from each todo's subtask ans subtask's subtask and places these nodes
 * into the passed array without returning anything
 * @param {Array} arr
 * @param {TodoItem} todo
 */
export function fillArrayWithSubtaskNodes(arr, todo) {
  const data = new DataStorage();
  const subtask = todo.subtask;
  subtask.forEach((subtaskId) => {
    const subtask = data.getTodoById(subtaskId);
    // add todoNode to the array
    const todoNode = document.createElement('todo-item');
    todoNode.setData(subtask);
    if (todoNode.classList.contains('completed')) {
      todoNode.style.display = 'none';
    }
    arr.push(todoNode);
    if (subtask.subtask.size > 0) fillArrayWithSubtaskNodes(arr, subtask);
  });
}

function handleFilterClick(e) {
  const filterBtn = e.currentTarget;
  // Если нажал на уже активный фильтр
  if (filterBtn.classList.contains('active')) return true;
  const filters = document.querySelectorAll('.project-filter');
  filters.forEach((filter) => filter.classList.remove('active'));
  filterBtn.classList.add('active');
  return false;
}

function uncheckTodoContainers(todo) {
  const todoList = document.querySelector('todo-list');
  todoList.uncheckTodoContainers(todo);
}

// поменяй название, а то оно не отображает смысл
/**
 *
 * @param {Event} e
 */
export function showActualTodos(e) {
  if (handleFilterClick(e)) return;
  new DataStorage().filter = 'actual';
  renderProjectContent(
    document.querySelector('.project-container').getAttribute('data-id')
  );
}

export function showCompletedTodos(e) {
  if (handleFilterClick(e)) return;
  new DataStorage().filter = 'completed';
  // Показать спрятанные
  const projId = document
    .querySelector('.project-container')
    .getAttribute('data-id');
  const proj = new DataStorage().getProjectById(projId);
  proj.todos.forEach((todoId) => {
    const todo = new DataStorage().getTodoById(todoId);
    uncheckTodoContainers(todo);
  });

  // Для секций тоже самое
  proj.sections.forEach((secId) => {
    const section = new DataStorage().getSectionById(secId);
    section.todos.forEach((todoId) => {
      const todo = new DataStorage().getTodoById(todoId);
      uncheckTodoContainers(todo);
    });
  });
}

/**
 * This function initializes the HTML elements of the section template based on the provided
 * instance of Section
 * @param {Section} sect
 * @returns {HTMLElement}
 */
export function createSectionFromTempl(sect) {
  const template = document.querySelector('#section-container-template');
  const clone = template.content.cloneNode(true);
  const section = clone.querySelector('.section-container');
  section.addEventListener('click', (e) => {
    const target = e.target;
    e.stopPropagation();
    hideOptions(e);
    if (target.classList.contains('option')) handleSectionExtraOption(target);
  });
  section.setAttribute('data-id', sect.id);
  clone.querySelector('.section-title').textContent = sect.title;
  const select = clone.querySelector('.select-section-btn');
  const options = clone.querySelector('.options');
  options.setAttribute('data-id', sect.id);
  select.setAttribute('data-id', sect.id);

  select.addEventListener('click', renderSectionExtraOptions);

  const todoList = document.createElement('div');
  todoList.classList.add('todo-list');
  todoList.append(createAddTodoBtn('section-' + sect.id));
  section.append(todoList);

  addCollapseBtnOnSection(section);

  return section;
}

/**
 * This function returns a string representing the word representation of todo priority level
 * @param {}
 * @return {}
 */
function getColorWord(colorVal) {
  let word = 'Project color';
  switch (colorVal) {
    case 'red':
      word = 'Red';
      break;
    case 'blue':
      word = 'Blue';
      break;
    case 'green':
      word = 'Green';
      break;
    case 'gray':
      word = 'Gray';
      break;
    default:
      break;
  }
  return word;
}

/**
 * This function counts the total number of all subtasks (including their subtasks) of the provided todo
 * and returns the number
 * @param {TodoItem} todoNode
 * @returns {Number}
 */
export function countTodoNodes(todoNode) {
  const data = new DataStorage();
  const subtasks = todoNode.subtask;
  let num = subtasks.size;
  subtasks.forEach((taskId) => {
    num += countTodoNodes(data.getTodoById(taskId));
  });
  return num;
}

/**
 * This function initializes a button element, attaching an event handler to open the form for adding a project
 */
export function initAddProjectBtn() {
  const btn = document.querySelector('#add-project-btn');
  btn.addEventListener('click', openProjectFormDiag);
}

/**
 * This function creates a form by initializing a template.
 * The form provides the option to choose the title and color for the new project
 * @returns {HTMLElement}
 */
export function createProjectForm() {
  const template = document.querySelector('#diag-project-form-templ');
  const clone = template.content.cloneNode(true);
  const diag = clone.querySelector('#project-dialog');
  const form = clone.querySelector('#dialog-project-form');
  const inputTitle = clone.querySelector('#project-title-input');
  const select = clone.querySelector('#project-color');
  new ItcCustomSelect(select);
  const selectBtn = clone.querySelector('#project-color-btn');

  const confirm = clone.querySelector('#confirm-project-form');
  const cancel = clone.querySelector('#close-project-form');

  confirm.addEventListener('click', (e) => {
    if (!form.reportValidity()) return;
    e.preventDefault();
    const title = inputTitle.value;
    const color = selectBtn.value;
    const projObj = new Project(title, color);
    new DataStorage().saveProject(projObj);
    saveData();
    renderProjectListItem(projObj);
    diag.close();
    diag.remove();
  });
  cancel.addEventListener('click', () => {
    diag.close();
    diag.remove();
  });
  return diag;
}

export function handleProjectExtraOption(e) {
  const actionType = e.detail.action;
  const projId = e.detail.projId;
  switch (actionType) {
    case 'remove':
      createConfirmDiagAndShow(projId, 'project');
      break;
    case 'change':
      changeProject(projId);
      break;
    default:
      break;
  }
}

// function removeProject(projId) {
//   const data = new DataStorage();
//   data.removeElement(projId);
//   updateProjectListAfterDeletion(projId);
//   updateProjectContentAfterDeletion(projId);
//   saveData();
// }

function changeProject(projId) {
  // Появляется диалог, с формой, в которой можно изменить название проекта и цвет. и подвтердить, отменить
  // Далее эти изменения сохраняются в рантайме, проихводится запись памяти и ререндеринг в списке проектов и main
  // если проект открыт
  const proj = new DataStorage().getProjectById(projId);
  const template = document.querySelector('#diag-project-form-templ');
  const clone = template.content.cloneNode(true);
  const diag = clone.querySelector('#project-dialog');
  const form = clone.querySelector('#dialog-project-form');
  const inputTitle = clone.querySelector('#project-title-input');
  inputTitle.value = proj.title;
  const select = clone.querySelector('#project-color');
  new ItcCustomSelect(select);
  const selectBtn = clone.querySelector('#project-color-btn');
  selectBtn.value = proj.color;
  selectBtn.textContent = getColorWord(proj.color);
  const confirm = clone.querySelector('#confirm-project-form');
  confirm.textContent = 'Изменить';
  const cancel = clone.querySelector('#close-project-form');

  confirm.addEventListener('click', (e) => {
    if (!form.reportValidity()) return;
    e.preventDefault();
    proj.title = inputTitle.value;
    proj.color = selectBtn.value;
    saveData();
    // Update list rendering and main
    updateProjectListAfterChanging(proj);
    updateProjectContentAfterChanging(proj);
    diag.close();
    diag.remove();
  });
  cancel.addEventListener('click', () => {
    diag.close();
    diag.remove();
  });
  document.body.append(diag);
  diag.showModal();
}

export function handleSectionExtraOption(target) {
  const sectId = target.parentElement.getAttribute('data-id');
  const actionType = target.getAttribute('data-action');
  //const data = new DataStorage()
  //const section = data.getProjectById(sectId)
  switch (actionType) {
    case 'remove':
      //createConfirmDiagAndShow(sectId, 'section');
      break;
    case 'rename':
      createSectionTextArea(sectId);
      break;
    default:
      break;
  }
}

// function removeSection(sectId) {
//   const data = new DataStorage();
//   data.removeElement(sectId);
//   updateSectionContentAfterDeletion(sectId);
//   saveData();
// }

function createSectionTextArea(sectId) {
  const selector = `.section-container[data-id="${CSS.escape(sectId)}"]`;
  const sectContainer = document.querySelector(selector);
  const targetNode = sectContainer.querySelector('.section-header-container');
  const section = new DataStorage().getSectionById(sectId);

  const template = document.querySelector('#section-rename-templ');
  const clone = template.content.cloneNode(true);
  const form = clone.querySelector('#section-rename-form');
  const title = clone.querySelector('#section-form-title');
  title.textContent = section.title;

  const confirm = clone.querySelector('#confirm-section-edit');
  confirm.addEventListener('click', (e) => {
    e.preventDefault();
    const newTitle = title.textContent;
    section.title = newTitle;
    const sectionHeader = targetNode.querySelector('.section-title');
    sectionHeader.textContent = newTitle;
    form.remove();
    saveData();
    targetNode.style.display = 'flex';
  });

  const cancel = clone.querySelector('#cancel-section-edit');
  cancel.addEventListener('click', (e) => {
    e.preventDefault();
    form.remove();
    targetNode.style.display = 'flex';
  });

  targetNode.before(form);
  const textBox = document.querySelector('#section-textbox');
  textBox.focus();
  targetNode.style.display = 'none';
}

// Надо как-то сохранять этот порядок при следующем открытии
// Пройтись по элементам списка, и разместить id памяти соответсующим образом
export function handleDragoverProjectList(evt) {
  const list = document.querySelector('#project-list');
  const activeElement = list.querySelector('.dragging');

  if (activeElement) {
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'move';
  } else return;

  const currentElement = evt.target;
  const isMoveable =
    activeElement !== currentElement &&
    currentElement.classList.contains('project-list-item');

  if (!isMoveable) {
    return;
  }

  // Находим элемент, перед которым будем вставлять
  //const nextElement = currentElement
  const nextElement = getNextElement(evt.clientY, currentElement);

  if (nextElement === null) return;
  // Вставляем activeElement перед nextElement
  if (currentElement.nextElementSibling === null)
    nextElement.after(activeElement);
  else list.insertBefore(activeElement, nextElement);

  saveNewListOrder();
}

function getNextElement(cursorPosition, currentElement) {
  // Получаем объект с размерами и координатами
  const currentElementCoord = currentElement.getBoundingClientRect();
  // Находим вертикальную координату центра текущего элемента
  const currentElementCenter =
    currentElementCoord.y + currentElementCoord.height / 2;

  // Если курсор выше центра элемента, возвращаем текущий элемент
  // В ином случае — следующий DOM-элемент
  const nextElement =
    cursorPosition < currentElementCenter
      ? currentElement
      : currentElement.nextElementSibling;

  return nextElement;
}

function saveNewListOrder() {
  const list = document.querySelector('#project-list');
  const listItems = list.querySelectorAll('.project-list-item');
  const idOrder = [];
  listItems.forEach((item) => idOrder.push(item.getAttribute('data-id')));

  const projectMap = new DataStorage().projects;
  const newProjectMap = new Map();

  idOrder.forEach((id) => newProjectMap.set(id, projectMap.get(id)));
  new DataStorage().projects = newProjectMap;
  saveData();
}

export function handleDragoverSection(evt) {
  const projectContainer = document.querySelector('.project-container');
  const activeElement = projectContainer.querySelector('.sect-dragging');

  if (activeElement) {
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'move';
  } else return;

  const activeElementAddSectionBtn = activeElement.nextElementSibling;
  const currentElement = evt.target.parentNode;
  const isMoveable =
    activeElement !== currentElement &&
    currentElement.classList.contains('section-container');

  if (!isMoveable) {
    return;
  }

  const nextElement = getNextSectionElement(activeElement, currentElement);

  nextElement.after(activeElement);
  activeElement.after(activeElementAddSectionBtn);

  saveNewSectionOrder();
}

function getNextSectionElement(activeElement, currentElement) {
  // Получаем объект с размерами и координатами
  const currentElementCoord = currentElement.getBoundingClientRect();
  const activeElementCoord = activeElement.getBoundingClientRect();

  // Находим вертикальную координату центра текущего элемента
  const coordDelta = currentElementCoord.y - activeElementCoord.y;

  // Если курсор выше центра элемента, возвращаем текущий элемент
  // В ином случае — следующий DOM-элемент
  if (coordDelta < 0) return currentElement.previousElementSibling;
  return currentElement.nextElementSibling;
}

export function saveNewSectionOrder() {
  const projContainer = document.querySelector('.project-container');
  const sections = projContainer.querySelectorAll('.section-container');
  const idOrder = [];
  sections.forEach((sec) => idOrder.push(sec.getAttribute('data-id')));

  const project = new DataStorage().getProjectById(
    projContainer.getAttribute('data-id')
  );
  const newOrder = new Set();
  idOrder.forEach((id) => newOrder.add(id));
  project.sections = newOrder;

  saveData();
}

export function addCollapseBtnOnTodo(todoItem) {
  const collapseBtn = document.createElement('button');
  collapseBtn.classList.add('collapse-btn');
  collapseBtn.textContent = '▶';
  collapseBtn.addEventListener('click', () => {
    collapseBtn.classList.toggle('active-collapse');
    const data = new DataStorage();
    const isNeedToCollapse = collapseBtn.classList.contains('active-collapse');
    const todo = data.getTodoById(todoItem.dataset.id);

    if (isNeedToCollapse) {
      collapseAllSubtasks(todo);
    } else {
      unCollapseAllSubtasks(todo);
    }
  });
  todoItem.prepend(collapseBtn);
}

function collapseAllSubtasks(todo) {
  const subtasks = todo.subtask;
  for (const id of subtasks) {
    const subtask = new DataStorage().getTodoById(id);
    if (subtask.subtask.size > 0) collapseAllSubtasks(subtask);
    // Вынести в отдельную функцию getTodoContainerById
    const selector = `todo-item[data-id="${CSS.escape(id)}"]`;
    const todoContainer = document.querySelector(selector);
    todoContainer.hide();
  }
}

function unCollapseAllSubtasks(todo) {
  const subtasks = todo.subtask;
  for (const id of subtasks) {
    const subtask = new DataStorage().getTodoById(id);
    if (subtask.subtask.size > 0) unCollapseAllSubtasks(subtask);
    // Вынести в отдельную функцию getTodoContainerById
    const selector = `todo-item[data-id="${CSS.escape(id)}"]`;
    const todoContainer = document.querySelector(selector);
    todoContainer.unhide();
  }
}

export function addCollapseBtnOnSection(sectionContainer) {
  const collapseBtn = document.createElement('button');
  collapseBtn.classList.add('collapse-btn-section');
  collapseBtn.textContent = '▶';
  const sectionTodoList = sectionContainer.querySelector('.todo-list');
  collapseBtn.addEventListener('click', (e) => {
    collapseSectionTodoList(e.currentTarget, sectionTodoList);
  });
  const sectionHeaderContainer = sectionContainer.querySelector(
    '.section-header-container'
  );
  sectionHeaderContainer.prepend(collapseBtn);
}

export function collapseSectionTodoList(collapseBtn, sectionTodoList) {
  collapseBtn.classList.toggle('active-collapse');
  const isNeedToCollapse = collapseBtn.classList.contains('active-collapse');
  if (isNeedToCollapse) {
    sectionTodoList.classList.add('collapsed');
  } else {
    sectionTodoList.classList.remove('collapsed');
  }
}

export function toggleNavbar() {
  const navbar = document.querySelector('nav');
  if (navbar.style.width !== '0px') {
    navbar.style.width = '0px';
    navbar.style.minWidth = '0';
  } else {
    navbar.style.width = '250px';
    navbar.style.minWidth = '100px';
  }
}

export function openNavbar() {
  const navbar = document.querySelector('nav');

  navbar.style.width = '250px';
  navbar.style.minWidth = '100px';
}
