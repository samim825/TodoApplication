(function(){
  const todoInput = document.getElementById('todoInput');
  const addBtn = document.getElementById('addBtn');
  const todoList = document.getElementById('todoList');
  const countEl = document.getElementById('count');
  const activeCountEl = document.getElementById('activeCount');
  const completedCountEl = document.getElementById('completedCount');
  const clearAllBtn = document.getElementById('clearAll');
  const emptyState = document.getElementById('emptyState');
  const STORAGE_KEY = 'my_todos_v1';

  let todos = load();

  function setTimeNow(){
    const el = document.getElementById('timeNow');
    const d = new Date();
    el.textContent = d.toLocaleString();
  }
  setTimeNow();
  setInterval(setTimeNow, 60000);

  function save(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }
  function load(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch(e){
      console.error('Failed to load todos', e);
      return [];
    }
  }
  function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

  function addTodo(text){
    const t = text.trim();
    if(!t) return;
    const todo = { id: uid(), text: t, completed: false, createdAt: Date.now() };
    todos.unshift(todo);
    save();
    render();
  }

  function toggleCompleted(id){
    const it = todos.find(x => x.id === id);
    if(!it) return;
    it.completed = !it.completed;
    save();
    render();
  }

  function deleteTodo(id){
    todos = todos.filter(x => x.id !== id);
    save();
    render();
  }

  function updateTodoText(id, newText){
    const it = todos.find(x => x.id === id);
    if(!it) return;
    it.text = newText.trim() || it.text;
    save();
    render();
  }

  function clearCompleted(){
    todos = todos.filter(x => !x.completed);
    save();
    render();
  }

  function render(){
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const active = total - completed;
    countEl.textContent = `${total} item${total !== 1 ? 's' : ''}`;
    activeCountEl.textContent = `${active} active`;
    completedCountEl.textContent = `${completed} completed`;

    emptyState.style.display = total === 0 ? 'block' : 'none';
    todoList.innerHTML = '';

    todos.forEach(todo => {
      const li = document.createElement('li');
      li.className = 'todo-item';
      li.dataset.id = todo.id;

      const left = document.createElement('div');
      left.className = 'todo-left';

      const chk = document.createElement('label');
      chk.className = 'chk';
      chk.title = todo.completed ? 'Mark as not completed' : 'Mark as completed';
      chk.tabIndex = 0;
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = todo.completed;
      chk.appendChild(input);
      const checkIcon = document.createElement('span');
      checkIcon.innerHTML = todo.completed ? '✓' : '';
      chk.appendChild(checkIcon);

      const labelWrap = document.createElement('div');
      labelWrap.style.flex = '1';
      labelWrap.style.minWidth = '0';

      const label = document.createElement('div');
      label.className = 'label' + (todo.completed ? ' completed' : '');
      label.textContent = todo.text;
      label.title = todo.text;
      labelWrap.appendChild(label);

      left.appendChild(chk);
      left.appendChild(labelWrap);

      const actions = document.createElement('div');
      actions.className = 'actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'icon-btn';
      editBtn.title = 'Edit';
      editBtn.innerHTML = '✎';

      const delBtn = document.createElement('button');
      delBtn.className = 'icon-btn';
      delBtn.title = 'Delete';
      delBtn.innerHTML = '🗑';

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      li.appendChild(left);
      li.appendChild(actions);

      chk.addEventListener('click', (e) => {
        e.preventDefault();
        toggleCompleted(todo.id);
      });

      delBtn.addEventListener('click', () => {
        if(confirm('Delete this todo?')) deleteTodo(todo.id);
      });

      editBtn.addEventListener('click', () => {
        const inputEl = document.createElement('input');
        inputEl.className = 'edit-input';
        inputEl.value = todo.text;
        labelWrap.replaceChild(inputEl, label);
        inputEl.focus();
        inputEl.setSelectionRange(0, inputEl.value.length);

        function commit(){
          updateTodoText(todo.id, inputEl.value || todo.text);
        }
        function cancel(){
          labelWrap.replaceChild(label, inputEl);
        }

        inputEl.addEventListener('blur', () => commit());
        inputEl.addEventListener('keydown', (ev) => {
          if(ev.key === 'Enter'){ commit(); }
          else if(ev.key === 'Escape'){ cancel(); }
        });
      });

      todoList.appendChild(li);
    });
  }

  addBtn.addEventListener('click', () => {
    addTodo(todoInput.value);
    todoInput.value = '';
    todoInput.focus();
  });
  todoInput.addEventListener('keydown', (e) => {
    if(e.key === 'Enter'){ addTodo(todoInput.value); todoInput.value = ''; }
  });

  clearAllBtn.addEventListener('click', () => {
    clearCompleted();
  });

  render();

})();
