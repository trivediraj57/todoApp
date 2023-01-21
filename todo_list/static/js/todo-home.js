/* eslint-disable no-undef */
tdObj.toDos = (function () {
  let userTodoList = [];
  function initializeModule() {
    generateUI();
    setupUITriggers();
    fetchToDoListFromServer();
  }

  function generateUI() {
    if (tdObj.vars.loggedinUser === 'AnonymousUser') {
      $('body').haml(
        ['%h2', 'You are not logged in'],
        [
          '%h4',
          'Click ',
          ['%a', { href: tdObj.vars.loginURL }, ' here'],
          ' to login',
        ]
      );
      return;
    }

    $('body').haml([
      '%div',
      { class: 'container' },
      ['%div', { id: 'headingDiv' }, getUserName()],
      ['%div', { id: 'formDiv' }, getUserInput()],
      ['%div', { id: 'listDiv' }, ['%h3', 'Todo Lists']],
      displayModalUI(),
      displayDeleteConfirmationUI(),
    ]);
  }

  function getUserName() {
    return [
      ['%h2', `Welcome, ${tdObj.vars.loggedinUser}!`],
      ['%a', { href: tdObj.vars.logoutURL }, 'Logout'],
    ];
  }

  function getUserInput() {
    return [
      [
        '%form',
        { method: 'post' },
        [
          '%input',
          {
            type: 'hidden',
            name: 'csrfmiddlewaretoken',
            value: tdObj.vars.tokenVal,
          },
        ],
        [
          '%button',
          {
            id: 'addListBtn',
            class: 'btn btn-outline-danger',
            type: 'button',
            style: 'margin-left:8px',
          },
          'Add List',
        ],
        [
          '%input',
          {
            type: 'hidden',
            name: 'listID',
            id: 'listID',
            placeholder: 'list ID',
          },
        ],
      ],
    ];
  }

  function displayModalUI() {
    return [
      [
        '%div',
        {
          id: 'myModal',
          class: 'modal',
          tabindex: '-1',
        },
        [
          '%div',
          { class: 'modal-dialog', role: 'document' },
          [
            '%div',
            { class: 'modal-content' },
            [
              '%div',
              { class: 'modal-header' },
              ['%div', { class: 'list-heading', contenteditable: 'true' }],
              [
                '%div',
                {
                  id: 'errorList',
                  style:
                    'padding-left:20px;font-size:20px;color:red;display:none;',
                },
                tdObj.vars.listErr,
              ],
              getUserInputOfModal(),
            ],
            ['%div', { id: 'todoTasksDiv' }],
            [
              '%div',
              { class: 'modal-footer' },
              [
                '%button',
                {
                  type: 'button',
                  id: 'btnClose',
                  class: 'btn btn-default',
                  data: 'dismiss-modal',
                },
                'Close',
              ],
            ],
          ],
        ],
      ],
    ];
  }

  function getUserInputOfModal() {
    return [
      [
        '%form',
        { method: 'post' },
        [
          '%input',
          {
            type: 'hidden',
            name: 'csrfmiddlewaretoken',
            value: tdObj.vars.tokenVal,
          },
        ],
        [
          '%input',
          {
            type: 'text',
            name: 'taskDescription',
            id: 'taskDescription',
            class: 'addInputBox',
            style: 'margin-top:18px;',
          },
        ],
        [
          '%input',
          {
            type: 'hidden',
            name: 'taskID',
            id: 'taskID',
            placeholder: 'task ID',
          },
        ],
        getControlButtons(),
        [
          '%div',
          {
            id: 'errorTask',
            style: 'padding-top:10px;font-size:20px;color:red;display:none;',
          },
          tdObj.vars.taskErr,
        ],
      ],
    ];
  }

  function getControlButtons() {
    return [
      [
        '%button',
        {
          id: 'addTaskBtn',
          class: 'btn btn-outline-danger',
          type: 'button',
          style: 'margin-left:8px',
        },
        'Add Task',
      ],

      [
        '%button',
        {
          type: 'button',
          id: 'updateTaskBtn',
          class: 'btn btn-outline-danger',
          style: 'margin-left: 10px;display:none',
        },
        'Update Task',
      ],
      [
        '%button',
        {
          type: 'button',
          id: 'cancelBtn',
          class: 'btn btn-outline-danger',
          style: 'margin-left: 10px;display:none',
        },
        'Cancel',
      ],
    ];
  }

  function displayDeleteConfirmationUI() {
    return [
      [
        '%div',
        {
          id: 'confirmModal',
          class: 'modal',
          tabindex: '-1',
        },
        [
          '%div',
          { class: 'modal-dialog', role: 'document' },
          [
            '%div',
            { class: 'modal-content' },
            ['%div', { class: 'modal-header' }, ['%h5', 'Delete Confirmation']],
            ['%div', { class: 'delete-modal-body' }],
            [
              '%div',
              { class: 'modal-footer' },
              [
                '%button',
                {
                  type: 'button',
                  id: 'btnAccept',
                  class: 'btn btn-default',
                  data: 'dismiss-modal',
                },
                'Yes',
              ],
              [
                '%button',
                {
                  type: 'button',
                  id: 'btnDeny',
                  class: 'btn btn-default',
                  data: 'dismiss-modal',
                },
                'No',
              ],
            ],
          ],
        ],
      ],
    ];
  }

  function setupUITriggers() {
    $('body').on('click', '#addListBtn', () => {
      $('.list-heading').empty();
      addToDoList();
      $('.list-heading').haml(['%h3', 'New List']);
      $('#myModal').modal({ backdrop: 'static', keyboard: false });
      $('#myModal').modal('show');
      1;
    });

    $('body').on('blur', '.list-heading', () => {
      const toDoListID = parseInt($('#listID').val());
      const listHeading = $('.list-heading').text().trim();
      updateToDoList(toDoListID, listHeading);
    });

    $('body').on('click', '.todo-task-title', function () {
      const toDoListID = parseInt($(this).attr('dataID'));
      displayModal(toDoListID);
    });

    $('body').on('click', '.edit-list-btn', function () {
      const toDoListID = parseInt(
        $(this).closest('li').find('.todo-task-title').attr('dataid')
      );
      displayModal(toDoListID);
    });

    $('body').on('click', '.delete-list-btn', function () {
      const toDoListID = parseInt(
          $(this).closest('li').find('.todo-task-title').attr('dataid')
        ),
        listDesc = $(this).closest('li').find('a').text();
      displayDeleteConfirmation(toDoListID, listDesc);
      return false;
    });

    $('body').on('click', '#btnDeny', () => {
      $('#confirmModal').modal('toggle');
      return false;
    });

    $('body').on('click', '#addTaskBtn', () => {
      const listID = parseInt($('#listID').val());
      addToDoTask(listID);
      $('#taskDescription').focus();
    });

    $('body').on('click', '.todoTaskCheckbox', function () {
      const isChecked = $(this).is(':checked'),
        taskID = parseInt($(this).attr('taskID')),
        taskDesc = $(this).val().trim(),
        listID = parseInt($('#listID').val());
      const listObj = {
        toDoListID: listID,
        toDoList: [
          {
            taskID: taskID,
            taskDescription: taskDesc,
            isCompleted: isChecked,
          },
        ],
      };
      addUpdateTaskInDB(listObj);
      return false;
    });

    $('body').on('click', '.deleteTaskBtn', function () {
      const isChecked = $(this)
          .closest('#completedTaskDiv')
          .find('.todoTaskCheckbox')
          .is(':checked'),
        taskID = parseInt($(this).attr('taskID')),
        taskDesc = $(this).attr('dataValue');
      listID = parseInt($('#listID').val());
      const listObj = {
        toDoListID: listID,
        toDoList: [
          {
            taskID: taskID,
            taskDescription: taskDesc,
            isCompleted: isChecked,
          },
        ],
      };
      deleteTaskInDB(listObj);
      return false;
    });

    $('body').on('click', '.editTaskBtn', function () {
      const getClass = document.querySelector('.addInputBox');
      getClass.style.width = '45%';
      const taskDesc = $(this).attr('dataValue');
      const taskID = parseInt($(this).attr('name'));
      editToDoTask(taskID, taskDesc);
    });

    $('body').on('click', '#updateTaskBtn', () => {
      const getClass = document.querySelector('.addInputBox');
      getClass.style.width = '75%';
      updateToDoDescription();
      $('#taskDescription').focus();
    });

    $('body').on('click', '#cancelBtn', () => {
      cancelUpdate();
    });

    $('#taskDescription').keypress((e) => {
      const taskID = parseInt($('#taskID').val());
      const listID = parseInt($('#listID').val());
      const key = e.which;
      if (key == 13) {
        const getClass = document.querySelector('.addInputBox');
        getClass.style.width = '75%';
        addUpdateTask(listID, taskID);
        $('#cancelBtn').hide();
        $('#taskID').val('');
        return false;
      }
    });

    $('body').on('click', '#btnClose', function () {
      const listHeading = $('.list-heading').text();
      if (listHeading === '') {
        return;
      }
      $('#myModal').modal('toggle');
    });
  }

  function fetchToDoListFromServer() {
    fetch(tdObj.vars.addUpdateURL)
      .then((response) => response.json())
      .then((todoObjList) => {
        userTodoList = todoObjList;
        displayToDoListTasks();
      });
  }

  function addToDoList() {
    const listObj = {
      toDoListID: Date.now(),
      listName: 'New List',
      toDoList: [],
    };
    $('#listID').val(listObj.toDoListID);
    addUpdateTaskInDB(listObj);
  }

  function addUpdateTaskInDB(todoObj) {
    fetch(tdObj.vars.addUpdateURL, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRFToken': tdObj.vars.tokenVal,
      },
      body: JSON.stringify({ todoObj }),
    })
      .then((response) => response.json())
      .then((todoObjList) => {
        const toDoListID = $('#listID').val();
        userTodoList = todoObjList;
        $.each(todoObjList, function (_, objVal) {
          if (objVal.toDoListID === parseInt(toDoListID)) {
            displayTasks(objVal);
          }
        });
        displayToDoListTasks();
      })
      .catch((err) => console.log(err));
  }

  function updateToDoList(listID, listHeading) {
    if (listHeading === '') {
      $('.list-heading').focus();
      $('#errorList').show();
      return;
    }
    $('#errorList').hide();
    const listObj = {
      toDoListID: listID,
      listName: listHeading,
    };
    addUpdateTaskInDB(listObj);
  }

  function displayModal(toDoListID) {
    $('.list-heading').empty();
    $('#listID').val(toDoListID);
    fetch(tdObj.vars.addUpdateURL)
      .then((response) => response.json())
      .then((todoObjList) => {
        $.each(todoObjList, function (_, objVal) {
          if (objVal.toDoListID === parseInt(toDoListID)) {
            displayTasks(objVal);
            $('#taskDescription').val('');
            cancelUpdate();
          }
        });
      });
    getListName(toDoListID);
    $('#myModal').modal({ backdrop: 'static', keyboard: false });
    $('#myModal').modal('show');
    $('#taskDescription').focus();
  }

  function getListName(listID) {
    fetch(tdObj.vars.addUpdateURL)
      .then((response) => response.json())
      .then((todoObjList) => {
        $.each(todoObjList, function (_, objVal) {
          if (objVal.toDoListID === listID) {
            $('.list-heading').haml([objVal.listName]);
          }
        });
      });
  }

  function displayDeleteConfirmation(toDoListID, listDesc) {
    $('#confirmModal').modal({ backdrop: 'static', keyboard: false });
    const listObj = {
      toDoListID: toDoListID,
      listName: listDesc,
    };
    fetch(tdObj.vars.addUpdateURL)
      .then((response) => response.json())
      .then((todoObjList) => {
        $.each(todoObjList, function (_, objVal) {
          if (objVal.toDoListID === toDoListID) {
            const listName = objVal['listName'];
            $('.delete-modal-body').haml([
              '%h3',
              `Are you sure you want to delete ${listName}?`,
            ]);
            $('#confirmModal').modal('show');
          }
        });
      });
    $('.delete-modal-body').empty();
    SendDeleteConfirmationToDB(listObj);
  }

  function SendDeleteConfirmationToDB(listObj) {
    $('body').on('click', '#btnAccept', () => {
      deleteTaskInDB(listObj);
      $('#confirmModal').modal('hide');
    });
  }

  function deleteTaskInDB(listObj) {
    fetch(tdObj.vars.deleteURL, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRFToken': tdObj.vars.tokenVal,
      },
      body: JSON.stringify({ listObj }),
    })
      .then((response) => response.json())
      .then((todoObjList) => {
        const toDoListID = $('#listID').val();
        userTodoList = todoObjList;
        $.each(todoObjList, function (_, objVal) {
          if (objVal.toDoListID === parseInt(toDoListID)) {
            displayTasks(objVal);
          }
        });
        displayToDoListTasks();
      })
      .catch((err) => console.log(err));
  }

  function addToDoTask(listID) {
    const taskID = parseInt($('#taskID').val());
    addUpdateTask(listID, taskID);
    return false;
  }

  function addUpdateTask(listID, taskID) {
    const taskDesc = $('#taskDescription').val().trim();

    if (taskDesc === '') {
      $('#errorTask').fadeIn().delay(3000).fadeOut();
      return;
    }

    $('#errorTask').hide();
    const todoObj = {
      toDoListID: listID,
      toDoList: [
        {
          taskID: taskID || Date.now(),
          taskDescription: taskDesc,
          isCompleted: false,
        },
      ],
    };
    clearInputUI();
    addUpdateTaskInDB(todoObj);
  }

  function clearInputUI() {
    $('#taskDescription, #taskID').val('');
    $('#updateTaskBtn').hide();
    $('#addTaskBtn').show();
  }

  function displayToDoListTasks() {
    $('#listDiv').empty();
    $('#listDiv').haml([
      ['%div', { id: 'listHeadingDiv' }, ['%h3', 'Todo Lists']],
      ['%ul', displayLists()],
    ]);
  }

  function displayLists() {
    const list = [];
    $.each(userTodoList, function (_, listValue) {
      list.push([
        '%li',
        [
          '%a',
          {
            style: 'color:black',
            dataID: listValue['toDoListID'],
            class: 'todo-task-title',
            href: '#',
          },
          listValue['listName'],
        ],
        [
          '%a',
          {
            class: 'delete-list-btn',
          },
          ['%i', { class: 'fa-solid fa-trash' }],
        ],
        [
          '%a',
          {
            class: 'edit-list-btn',
          },
          [
            '%i',
            {
              class: 'fa-solid fa-pen-to-square',
            },
          ],
        ],
      ]);
    });
    return list;
  }

  function displayTasks(todoList) {
    $('#todoTasksDiv').empty();
    $('#todoTasksDiv').haml(
      [
        '%div',
        { id: 'todoTaskDiv', class: 'task-wrapper' },
        displayTodoList('incomplete', todoList),
      ],
      [
        '%div',
        { id: 'completedTaskDiv', class: 'task-wrapper' },
        displayTodoList('complete', todoList),
      ]
    );
  }

  function displayTodoList(status, userTodoList) {
    const list = [],
      taskStatus = status === 'complete' ? true : false;
    $.each(userTodoList.toDoList, (_, userTodoObj) => {
      checkedValue = userTodoObj.isCompleted ? true : false;
      if (userTodoObj.isCompleted !== taskStatus) {
        return true;
      }

      list.push([
        '%div',
        { class: 'task-title' },
        [
          '%label',
          { class: 'checkbox-container' },
          userTodoObj.isCompleted
            ? ['%del', userTodoObj.taskDescription]
            : userTodoObj.taskDescription,
          [
            '%input',
            {
              type: 'checkbox',
              name: 'taskCheckbox',
              taskID: userTodoObj.taskID,
              class: 'todoTaskCheckbox',
              value: userTodoObj.taskDescription,
              checked: checkedValue,
            },
          ],
          ['%span', { class: 'checkmark' }],
        ],
        [
          '%a',
          {
            class: 'deleteTaskBtn',
            taskID: userTodoObj.taskID,
            dataValue: userTodoObj.taskDescription,
          },
          ['%i', { class: 'fa-solid fa-trash' }],
        ],
        !userTodoObj.isCompleted
          ? [
              '%a',
              {
                class: 'editTaskBtn',
                name: userTodoObj.taskID,
                dataValue: userTodoObj.taskDescription,
              },
              [
                '%i',
                {
                  class: 'fa-solid fa-pen-to-square',
                },
              ],
            ]
          : [],
        ['%br'],
      ]);
    });
    return list;
  }

  function editToDoTask(taskID, taskDesc) {
    $('#taskID').val(taskID);
    $('#taskDescription').val(taskDesc).focus();
    $('#updateTaskBtn, #cancelBtn').show();
    $('#addTaskBtn').hide();
    return false;
  }

  function updateToDoDescription() {
    $('#cancelBtn').hide();
    const taskID = parseInt($('#taskID').val());
    const listID = parseInt($('#listID').val());
    addUpdateTask(listID, taskID);
    return false;
  }

  function cancelUpdate() {
    const getClass = document.querySelector('.addInputBox');
    getClass.style.width = '75%';
    $('#updateTaskBtn, #cancelBtn').hide();
    $('#addTaskBtn').show();
    $('#taskDescription, #taskID').val('');
    return false;
  }

  return {
    initializeModule: initializeModule,
  };
})();
