import { DataStorage } from '../dataSaving/dataStorage';
import {
  addCollapseBtnOnSection,
  addCollapseBtnOnTodo,
  countTodoNodes,
  createAddSectionBtn,
  createSectionFromTempl,
  handleDragoverProjectList,
  handleDragoverSection,
  handleProjectExtraOption,
  showActualTodos,
  showCompletedTodos,
  toggleNavbar,
} from './createDOMutility';
/**
 * @param {Map} projectMap
 */
export function renderListOfProjects(projectMap) {
  if (!(projectMap instanceof Map))
    throw new Error('projectMap must be an istance of Map()!');

  // Add number of projects to the header
  const header = document.querySelector('#project-list-header');
  header.textContent += projectMap.size;

  const list = document.querySelector('#project-list');
  const fragment = document.createDocumentFragment();

  // Extract needed projects info
  projectMap.forEach((val) => {
    const listItem = document.createElement('project-list-item');
    listItem.setData(val);
    fragment.append(listItem);
  });
  list.append(fragment);

  list.addEventListener('openProject', (e) => {
    renderProjectContent(e.detail.id);
  });

  list.addEventListener('handleExtraOption', handleProjectExtraOption);

  list.addEventListener('dragstart', (e) => {
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });

  list.addEventListener('dragend', (e) => {
    e.target.classList.remove('dragging');
  });

  list.addEventListener('dragover', handleDragoverProjectList);
}

/**
 *
 * @param {*} projObj
 */
export function renderProjectListItem(projObj) {
  const list = document.querySelector('#project-list');

  const listItem = document.createElement('project-list-item');
  listItem.setData(projObj);
  list.append(listItem);

  changeProjectListHeaderNumber(1);
}

function changeProjectListHeaderNumber(number) {
  const header = document.querySelector('#project-list-header');
  const headerText = header.textContent.split(' ');
  headerText[2] = Number(headerText[2]) + number;
  header.textContent = headerText.join(' ');
}

export function renderSectionExtraOptions(e) {
  const id = e.target.getAttribute('data-id');
  hideOptions(e);
  const selector = `.select-section-btn[data-id="${CSS.escape(id)}"]`;
  const options = document.querySelector(selector).nextElementSibling;
  options.classList.toggle('hidden');
  document.addEventListener('click', hideOptions);
}

export function hideOptions(e) {
  if (
    e &&
    (e.target.closest('.options') ||
      e.target.classList.contains('select-section-btn'))
  ) {
    return;
  }
  const options = document.querySelectorAll('.options');
  options.forEach((opt) => opt.classList.add('hidden'));
  document.removeEventListener('click', hideOptions);
}

/**
 *
 * @param {*} projectId
 */
export function renderProjectContent(projectId) {
  // Cause singletone pattern, i can be sure that it will be same storage evvery time
  const data = new DataStorage();
  const project = data.getProjectById(projectId);
  if (project === undefined) {
    console.warn(
      "Project is undefined in renderProjectContent. Can't load project's content"
    );
    return;
  }
  // Render project header
  const contentDiv = document.querySelector('main');
  //const dashboard = document.querySelector("#dashboard-header")
  contentDiv.innerHTML = '';
  const templ = document.querySelector('#project-templ');
  const clone = templ.content.cloneNode(true);
  const title = clone.querySelector('.project-title');
  title.textContent = project.title;

  const toggleNavbarBtn = clone.querySelector('.toggle-navbar');
  toggleNavbarBtn.addEventListener('click', toggleNavbar);

  // Init filters behaviour
  const allTodosBtn = clone.querySelector('#all-todos-btn');
  allTodosBtn.addEventListener('click', showActualTodos);
  const completedBtn = clone.querySelector('#comleted-todos-btn');
  completedBtn.addEventListener('click', showCompletedTodos);
  data.filter = 'actual';
  // Creater main content container
  const taskContainer = clone.querySelector('.project-container');
  taskContainer.setAttribute('data-id', projectId);
  // Render porject's todos
  const todoList = document.createElement('todo-list');
  todoList.dataset.id = project.id;
  todoList.dataset.parentType = 'project';
  taskContainer.append(todoList);
  todoList.handleTodoSet(project.todos);
  taskContainer.append(createAddSectionBtn('project-' + projectId));
  // Render project's sections
  project.sections.forEach((secId) => {
    const sectObj = data.getSectionById(secId);
    const section = createSectionFromTempl(sectObj);
    const templTodoList = section.querySelector('.todo-list');
    templTodoList.remove();
    const collapseBtn = section.querySelector('.collapse-btn-section');
    const todoList = document.createElement('todo-list');
    todoList.dataset.id = section.id;
    todoList.dataset.parentType = 'section';
    section.append(todoList);
    collapseBtn.remove();
    addCollapseBtnOnSection(section);

    taskContainer.append(section);
    taskContainer.append(createAddSectionBtn('project-' + projectId));
  });

  taskContainer.addEventListener('dragstart', (e) => {
    e.target.classList.add('sect-dragging');
    e.dataTransfer.effectAllowed = 'move';
  });

  taskContainer.addEventListener('dragend', (e) => {
    e.target.classList.remove('sect-dragging');
  });

  taskContainer.addEventListener('dragover', handleDragoverSection);

  contentDiv.append(clone);
}

// /**
//  *
//  * @param {*} e
//  */
// export function RenderTodoDiag(e) {
//     let lastDiag = document.querySelector("#todo-dialog")
//     if (lastDiag)
//         lastDiag.remove()
//     const diag = createDiagFromTempl(e)
//     document.body.append(diag)
//     diag.showModal()
// }

/**
 *
 * @param {*} parentId
 * @param {*} todoNode
 */
export function updateProjectRendering(todoObj) {
  const selector = `todo-item[data-id="${CSS.escape(todoObj.parentId)}"]`;
  const data = new DataStorage();
  // Везде в таких местах предусмотреть ошибки, чтобы программа не крашилась
  let previousSibling = document.querySelector(selector);
  const todoNode = document.createElement('todo-item');
  todoNode.setData(todoObj);

  const taskNumber = countTodoNodes(data.getTodoById(todoObj.parentId));
  for (let i = 1; i < taskNumber; i++) {
    previousSibling = previousSibling.nextElementSibling;
  }
  addCollapseBtnOnTodo(previousSibling);
  previousSibling.after(todoNode);
}

export function updateTodoRemoveRender(todoId, number) {
  const selector = `todo-item[data-id="${CSS.escape(todoId)}"]`;
  let todoItem = document.querySelector(selector);

  while (number) {
    const nextTodo = todoItem.nextSibling;
    todoItem.remove();
    number--;
    todoItem = nextTodo;
  }
}

export function updateProjectListAfterDeletion(projId) {
  // Просто найти проджект лист итем с этим айди и удалить узел
  const selector = `.project-list-item[data-id="${CSS.escape(projId)}"]`;
  const projListItem = document.querySelector(selector);
  projListItem.remove();
  changeProjectListHeaderNumber(-1);
}

export function updateProjectContentAfterDeletion(projId) {
  // Проверить есть ли в main такой узлел и если есть, очистить main innerhtml
  const selector = `.project-container[data-id="${CSS.escape(projId)}"]`;
  const projContainer = document.querySelector(selector);
  if (projContainer) document.querySelector('main').innerHTML = '';
}

export function updateSectionContentAfterDeletion(sectId) {
  // Проверить есть ли в main такой узлел и если есть, очистить main innerhtml
  const selector = `.section-container[data-id="${CSS.escape(sectId)}"]`;
  const sectContainer = document.querySelector(selector);
  if (sectContainer) {
    sectContainer.nextElementSibling.remove();
    sectContainer.remove();
  }
}

export function updateProjectListAfterChanging(proj) {
  const projId = proj.id;
  // Просто найти проджект лист итем с этим айди и изменить узел
  const selector = `.project-list-item[data-id="${CSS.escape(projId)}"]`;
  const projListItem = document.querySelector(selector);
  projListItem.confirmChanges(proj.title);
  // const title = projListItem.querySelector(".sidebar-project-title")
  // title.textContent = proj.title
}

export function updateProjectContentAfterChanging(proj) {
  const projId = proj.id;
  // Проверить есть ли в main такой узлел и если есть - зименить хедер
  const selector = `.project-container[data-id="${CSS.escape(projId)}"]`;
  const projContainer = document.querySelector(selector);
  if (projContainer) {
    const header = document
      .querySelector('.project-title-container')
      .querySelector('h1');
    header.textContent = proj.title;
  }
}
