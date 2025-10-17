

(() => {
  const LS_KEY = 'search_linebox_items_v1';
  const form = document.getElementById('search-form');
  const input = document.getElementById('search-input');
  const list = document.getElementById('result-list');
  const template = document.getElementById('item-template');
  const emptyState = document.getElementById('empty-state');
  const btnClear = document.getElementById('btn-clear');

  let items = load();

  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Load error', e);
      return [];
    }
  }

  function save() {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }

  function render() {
    list.innerHTML = '';
    if (items.length === 0) {
      emptyState.style.display = 'block';
      return;
    } else {
      emptyState.style.display = 'none';
    }

    items.forEach((it) => {
      const node = template.content.firstElementChild.cloneNode(true);
      node.dataset.id = it.id;
      const textEl = node.querySelector('.item-text');
      const editInput = node.querySelector('.item-edit');

      textEl.textContent = it.text;
      editInput.value = it.text;














      node.setAttribute('aria-label', `Search: ${it.text}`);

      list.appendChild(node);
    });
  }

  function createItem(text) {
    const item = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2,6),
      text: text.trim()
    };
    items.unshift(item); 
    save();
    render();






    const first = list.querySelector('[data-id]');
    if (first) {
      first.focus();
    }
  }

  function findItemIndexById(id) {
    return items.findIndex(i => i.id === id);
  }

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const q = input.value.trim();
    if (!q) {
      input.focus();
      return;
    }
    createItem(q);
    input.value = '';
  });












  btnClear.addEventListener('click', () => {
    input.value = '';
    input.focus();
  });

  list.addEventListener('click', (ev) => {
    const actionBtn = ev.target.closest('.icon-btn');
    if (!actionBtn) return;
    const itemEl = actionBtn.closest('.result-item');
    if (!itemEl) return;
    const id = itemEl.dataset.id;
    const idx = findItemIndexById(id);
    if (idx === -1) return;

    if (actionBtn.classList.contains('edit-btn')) {
      startEditing(itemEl);
      return;
    }
    if (actionBtn.classList.contains('save-btn')) {
      finishEditing(itemEl, true);
      return;
    }
    if (actionBtn.classList.contains('cancel-btn')) {
      finishEditing(itemEl, false);
      return;
    }
    if (actionBtn.classList.contains('delete-btn')) {
      items.splice(idx, 1);
      save();
      itemEl.style.transition = 'opacity 160ms ease, transform 160ms ease';
      itemEl.style.opacity = '0';
      itemEl.style.transform = 'translateX(20px)';
      setTimeout(render, 160);
      return;
    }
  });

  list.addEventListener('dblclick', (ev) => {
    const item = ev.target.closest('.result-item');
    if (!item) return;
    startEditing(item);
  });

  function startEditing(itemEl) {
    const other = list.querySelector('.result-item.editing');
    if (other && other !== itemEl) {
      finishEditing(other, false);
    }
    itemEl.classList.add('editing');
    const editInput = itemEl.querySelector('.item-edit');
    const saveBtn = itemEl.querySelector('.save-btn');
    const cancelBtn = itemEl.querySelector('.cancel-btn');
    saveBtn.hidden = false;
    cancelBtn.hidden = false;
    editInput.focus();
    editInput.setSelectionRange(0, editInput.value.length);
  }

  function finishEditing(itemEl, saveChanges) {
    const id = itemEl.dataset.id;
    const idx = findItemIndexById(id);
    if (idx === -1) return;
    const editInput = itemEl.querySelector('.item-edit');
    const textEl = itemEl.querySelector('.item-text');

    if (saveChanges) {
      const val = editInput.value.trim();
      if (val === '') {
        items.splice(idx, 1);
      } else {
        items[idx].text = val;
      }
      save();
    }
    itemEl.classList.remove('editing');
    const saveBtn = itemEl.querySelector('.save-btn');
    const cancelBtn = itemEl.querySelector('.cancel-btn');
    if (saveBtn) saveBtn.hidden = true;
    if (cancelBtn) cancelBtn.hidden = true;
    render();
  }

  list.addEventListener('keydown', (ev) => {
    const itemEl = ev.target.closest('.result-item');
    if (!itemEl) return;
    const id = itemEl.dataset.id;
    const idx = findItemIndexById(id);
    if (idx === -1) return;

    if (ev.key === 'e' || ev.key === 'E') {
      ev.preventDefault();
      startEditing(itemEl);
    } else if (ev.key === 'Delete') {
      ev.preventDefault();
      items.splice(idx, 1);
      save();
      render();
    } else if (ev.key === 'Enter') {
      if (itemEl.classList.contains('editing')) {
        ev.preventDefault();
        finishEditing(itemEl, true);
      }
    } else if (ev.key === 'Escape') {
      if (itemEl.classList.contains('editing')) {
        finishEditing(itemEl, false);
      }
    }
  });

  list.addEventListener('focusin', (ev) => {
    const item = ev.target.closest('.result-item');
    if (item) item.classList.add('focused');
  });
  list.addEventListener('focusout', (ev) => {
    const item = ev.target.closest('.result-item');
    if (item) item.classList.remove('focused');
  });

  list.addEventListener('click', (ev) => {
    const item = ev.target.closest('.result-item');
    if (item) {
      item.setAttribute('tabindex', '0');
      item.focus();
    }
  });

  render();

  window._SearchLinebox = {
    get items(){ return items },
    clear(){
      items = []; save(); render();
    }
  };
})();