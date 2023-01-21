/* eslint-disable no-undef */
tdObj.toDos = (function () {
  let userTodoList = [];
  function initializeModule() {
    generateUI();
    setupUITriggers();
    fetchToDoObjsFromServer();
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
      [
        '%div',
        { id: 'allTaskDiv' },
        ['%div', { id: 'todoTaskDiv' }, ['%h3', 'My Todo Task List']],
        ['%div', { id: 'completedTaskDiv' }, ['%h3', 'Completed Task List']],
      ],
    ]);
  }

  function getUserName() {
    return [
      ['%h2', `Welcome, ${tdObj.vars.loggedinUser}!`],
      [
        '%a',
        { href: tdObj.vars.logoutURL },
        'Logout',
        // [
        //   '%button',
        //   {
        //     type: 'button',
        //     class: 'btn btn-outline-dark',
        //     value: 'Logout',
        //   },
        //   'Logout',
        // ],
      ],
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
          '%input',
          {
            type: 'text',
            name: 'taskDescription',
            id: 'taskDescription',
            class: 'inputBox',
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
            id: 'errorTitle',
            style: 'padding-top:10px;font-size:20px;color:red;display:none;',
          },
          tdObj.vars.titleErr,
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
      // [
      //   '%a',
      //   {
      //     id: 'addTaskBtn',
      //   },
      //   ['%i', { class: 'fa-solid fa-plus' }],
      // ],

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

  function displayTodoList(status) {
    const list = [],
      taskStatus = status === 'complete' ? true : false;
    $.each(userTodoList, (_, userTodoObj) => {
      checkedValue = userTodoObj.isCompleted ? true : false;
      if (userTodoObj.isCompleted !== taskStatus || userTodoObj.isDeleted) {
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
        // [
        //   '%a',
        //   {
        //     name: 'taskCheckbox',
        //     taskID: userTodoObj.taskID,
        //     class: 'todoTaskCheckbox',
        //     value: userTodoObj.taskDescription,
        //     checked: checkedValue,
        //   },
        //   ['%a', { class: 'fa-regular fa-circle' }],
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
          ? // ? [
            //     '%button',
            //     {
            //       type: 'button',
            //       class: 'editTaskBtn',
            //       name: userTodoObj.taskID,
            //       value: userTodoObj.taskDescription,
            //       style: 'margin-left: 10px;',
            //     },
            //     'Edit',
            //   ]
            [
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
        // [
        //   '%button',
        //   {
        //     type: 'button',
        //     class: 'deleteTaskBtn',
        //     taskID: userTodoObj.taskID,
        //     value: userTodoObj.taskDescription,
        //     style: 'margin-left: 10px; margin-bottom:20px',
        //   },
        //   'Delete',
        // ],
        ['%br'],
      ]);
    });
    return list;
  }

  function setupUITriggers() {
    $('body').on('click', '#addTaskBtn', () => {
      addToDoTask();
      $('#taskDescription').focus();
    });

    $('body').on('click', '.deleteTaskBtn', function () {
      const isChecked = $(this)
          .closest('#completedTaskDiv')
          .find('.todoTaskCheckbox')
          .is(':checked'),
        taskID = parseInt($(this).attr('taskID')),
        taskDesc = $(this).attr('dataValue');
      console.log(taskDesc);
      taskObj = {
        taskID: taskID,
        taskDescription: taskDesc,
        isCompleted: isChecked,
        isDeleted: true,
      };
      addUpdateTaskInDB(taskObj);
      return false;
    });

    $('body').on('click', '.todoTaskCheckbox', function () {
      const isChecked = $(this).is(':checked'),
        taskID = parseInt($(this).attr('taskID')),
        taskDesc = $(this).val().trim(),
        taskObj = {
          taskID: taskID,
          taskDescription: taskDesc,
          isCompleted: isChecked,
          isDeleted: false,
        };
      addUpdateTaskInDB(taskObj);
      return false;
    });

    $('body').on('click', '.editTaskBtn', function () {
      const getClass = document.querySelector('.inputBox');
      getClass.style.width = '55%';
      const taskDesc = $(this).attr('dataValue');
      const taskID = parseInt($(this).attr('name'));
      editToDoTask(taskID, taskDesc);
    });

    $('body').on('click', '#updateTaskBtn', () => {
      const getClass = document.querySelector('.inputBox');
      getClass.style.width = '75%';
      updateToDoDescription();
      $('#taskDescription').focus();
    });

    $('body').on('click', '#cancelBtn', () => {
      cancelUpdate();
    });

    $('#taskDescription').keypress((e) => {
      const taskID = parseInt($('#taskID').val());
      const key = e.which;
      if (key == 13) {
        const getClass = document.querySelector('.inputBox');
        getClass.style.width = '75%';
        addUpdateTask(taskID);
        $('#cancelBtn').hide();
        $('#taskID').val('');
        return false;
      }
    });
  }

  function addToDoTask() {
    const taskID = parseInt($('#taskID').val());
    addUpdateTask(taskID);
    return false;
  }

  function updateToDoDescription() {
    $('#cancelBtn').hide();
    const taskID = parseInt($('#taskID').val());
    addUpdateTask(taskID);
    return false;
  }

  function cancelUpdate() {
    const getClass = document.querySelector('.inputBox');
    getClass.style.width = '75%';
    $('#updateTaskBtn, #cancelBtn').hide();
    $('#addTaskBtn').show();
    $('#taskDescription, #taskID').val('');
    return false;
  }

  function editToDoTask(taskID, taskDesc) {
    $('#taskID').val(taskID);
    $('#taskDescription').val(taskDesc);
    $('#updateTaskBtn, #cancelBtn').show();
    $('#addTaskBtn').hide();
    return false;
  }

  function fetchToDoObjsFromServer() {
    fetch(tdObj.vars.addUpdateURL)
      .then((response) => response.json())
      .then((todoObjList) => {
        userTodoList = todoObjList;
        displayTasks();
      });
  }

  function addUpdateTask(taskID) {
    const taskDesc = $('#taskDescription').val().trim();

    if (taskDesc === '') {
      $('#errorTitle').fadeIn().delay(3000).fadeOut();
      return;
    }

    $('#errorTitle').hide();
    const taskObj = {
      taskID: taskID || Date.now(),
      taskDescription: taskDesc,
      isCompleted: false,
      isDeleted: false,
    };
    clearInputUI();
    addUpdateTaskInDB(taskObj);
  }

  function clearInputUI() {
    $('#taskDescription, #taskID').val('');
    $('#updateTaskBtn').hide();
    $('#addTaskBtn').show();
  }

  function addUpdateTaskInDB(taskObj) {
    fetch(tdObj.vars.addUpdateURL, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRFToken': tdObj.vars.tokenVal,
      },
      body: JSON.stringify({ taskObj }),
    })
      .then((response) => response.json())
      .then((todoObjList) => {
        userTodoList = todoObjList;
        console.log(userTodoList);
        displayTasks();
      })
      .catch((err) => console.log(err));
  }

  function displayTasks() {
    $('#allTaskDiv').empty();
    $('#allTaskDiv').haml(
      [
        '%div',
        { class: 'headings-class' },
        ['%h3', 'My Todo Task List'],
        ['%h3', 'Actions'],
      ],
      [
        '%div',
        { id: 'todoTaskDiv', class: 'task-wrapper' },
        displayTodoList('incomplete'),
      ],
      ['%div', { class: 'headings-class' }, ['%h3', 'Completed Task List']],
      [
        '%div',
        { id: 'completedTaskDiv', class: 'task-wrapper' },
        displayTodoList('complete'),
      ]
    );
  }

  return {
    initializeModule: initializeModule,
  };
})();
