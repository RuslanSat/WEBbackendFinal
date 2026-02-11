(function () {
  const API_BASE = '';

  const els = {
    alert: document.getElementById('news-alert'),
    grid: document.getElementById('news-grid'),
    subtitle: document.getElementById('news-subtitle'),
    search: document.getElementById('news-search'),
    searchClear: document.getElementById('news-search-clear'),
    mode: document.getElementById('news-mode'),
    newBtn: document.getElementById('news-new-btn'),
    prev: document.getElementById('news-prev'),
    next: document.getElementById('news-next'),
    pageInfo: document.getElementById('news-pagination-info'),

    authEmail: document.getElementById('auth-email'),
    authPassword: document.getElementById('auth-password'),
    authLogin: document.getElementById('auth-login'),
    authLogout: document.getElementById('auth-logout'),
    authStatus: document.getElementById('auth-status'),

    editorModal: document.getElementById('newsEditorModal'),
    editorTitle: document.getElementById('newsEditorTitle'),
    editorAlert: document.getElementById('news-editor-alert'),
    editorId: document.getElementById('news-editor-id'),
    editorTitleInput: document.getElementById('news-editor-title'),
    editorGameInput: document.getElementById('news-editor-game'),
    editorContentInput: document.getElementById('news-editor-content'),
    editorSave: document.getElementById('news-editor-save'),
    editorPublish: document.getElementById('news-editor-publish'),
    editorUnpublish: document.getElementById('news-editor-unpublish'),
    editorDelete: document.getElementById('news-editor-delete')
  };

  const state = {
    page: 1,
    limit: 12,
    pages: 1,
    token: null,
    me: null,
    mode: 'published',
    query: ''
  };

  function showAlert(message, type = 'warning') {
    if (!els.alert) return;
    els.alert.className = `alert alert-${type}`;
    els.alert.textContent = message;
    els.alert.classList.remove('d-none');
  }

  function hideAlert() {
    if (!els.alert) return;
    els.alert.classList.add('d-none');
  }

  function showEditorAlert(message) {
    if (!els.editorAlert) return;
    els.editorAlert.textContent = message;
    els.editorAlert.classList.remove('d-none');
  }

  function hideEditorAlert() {
    if (!els.editorAlert) return;
    els.editorAlert.classList.add('d-none');
  }

  function getToken() {
    return localStorage.getItem('authToken'); // Используем наш общий authManager
  }

  function setToken(token) {
    if (token) localStorage.setItem('authToken', token);
    else localStorage.removeItem('authToken');
    state.token = token;
  }

  async function apiFetch(path, options = {}) {
    const headers = new Headers(options.headers || {});
    headers.set('Accept', 'application/json');
    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json');
    }

    const token = state.token || getToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const res = await fetch(API_BASE + path, { ...options, headers });
    const text = await res.text();
    let json;
    try {
      json = text ? JSON.parse(text) : null;
    } catch (_) {
      json = null;
    }

    if (!res.ok) {
      const message = json?.message || `Request failed (${res.status})`;
      const err = new Error(message);
      err.status = res.status;
      err.body = json;
      throw err;
    }

    return json;
  }

  function formatDate(d) {
    if (!d) return '';
    try {
      return new Date(d).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      });
    } catch (_) {
      return '';
    }
  }

  function canManage() {
    const user = window.authManager ? window.authManager.getUser() : null;
    return !!user && (user.role === 'author' || user.role === 'admin');
  }

  function renderCard(item) {
    const isPublished = !!item.publishedAt;
    const user = window.authManager ? window.authManager.getUser() : null;
    const isAuthor = user && item.author && item.author._id === user.id;

    const col = document.createElement('div');
    col.className = 'col-lg-3 col-md-6 col-sm-12';

    const card = document.createElement('div');
    card.className = 'card h-100 game-bootstrap-card';

    const body = document.createElement('div');
    body.className = 'card-body d-flex flex-column';

    const title = document.createElement('h5');
    title.className = 'card-title';
    title.textContent = item.title;

    const meta = document.createElement('div');
    meta.className = 'text-muted small mb-2';
    meta.textContent = formatDate(item.createdAt);

    const content = document.createElement('div');
    content.className = 'card-text flex-grow-1';
    content.textContent = item.content.substring(0, 100) + (item.content.length > 100 ? '...' : '');

    const footer = document.createElement('div');
    footer.className = 'd-flex justify-content-between align-items-center mt-auto';

    const badge = document.createElement('span');
    badge.className = `badge ${isPublished ? 'bg-success' : 'bg-secondary'}`;
    badge.textContent = isPublished ? 'Published' : 'Draft';

    const btn = document.createElement('button');
    btn.className = 'btn btn-sm btn-outline-warning';
    btn.type = 'button';
    btn.textContent = (isAuthor || canManage()) ? 'Manage' : 'View';
    btn.addEventListener('click', () => openEditor(item));

    footer.appendChild(badge);
    footer.appendChild(btn);

    body.appendChild(title);
    body.appendChild(meta);
    body.appendChild(content);
    body.appendChild(footer);

    card.appendChild(body);
    col.appendChild(card);

    return col;
  }

  function setPagination(pagination) {
    const page = pagination?.page || 1;
    const pages = pagination?.pages || 1;
    state.page = page;
    state.pages = pages;

    if (els.pageInfo) {
      const total = pagination?.total;
      els.pageInfo.textContent = typeof total === 'number'
        ? `Page ${page} of ${pages} • Total ${total}`
        : `Page ${page} of ${pages}`;
    }

    if (els.prev) els.prev.disabled = page <= 1;
    if (els.next) els.next.disabled = page >= pages;
  }

  function applyModeUI() {
    if (!els.mode) return;

    if (state.mode === 'mine') {
      els.subtitle.textContent = 'Your articles (drafts + published)';
    } else {
      els.subtitle.textContent = 'Latest published updates';
    }

    if (els.newBtn) {
      const user = window.authManager ? window.authManager.getUser() : null;
      const logged = !!user;
      els.newBtn.disabled = !logged || !canManage();
    }
  }

  async function loadMe() {
    state.token = getToken();
    if (!state.token) {
      state.me = null;
      updateAuthUI();
      return;
    }

    try {
      const res = await apiFetch('/api/users/profile');
      // Используем наш authManager для хранения данных
      if (window.authManager && res?.data) {
        localStorage.setItem('user', JSON.stringify(res.data));
      }
      state.me = res?.data || null;
    } catch (e) {
      state.me = null;
      setToken(null);
    }

    updateAuthUI();
  }

  function updateAuthUI() {
    // Используем наш общий authManager
    const user = window.authManager ? window.authManager.getUser() : null;
    const logged = !!user;

    if (els.authStatus) {
      els.authStatus.textContent = logged
        ? `Logged in as ${user.username} (${user.role})`
        : 'Not logged in';
    }

    if (els.authLogin) els.authLogin.style.display = logged ? 'none' : '';
    if (els.authLogout) els.authLogout.style.display = logged ? '' : 'none';

    if (els.mode) {
      const mineOpt = Array.from(els.mode.options).find(o => o.value === 'mine');
      if (mineOpt) mineOpt.disabled = !(logged && canManage());
    }

    if (!logged && state.mode === 'mine') {
      state.mode = 'published';
      if (els.mode) els.mode.value = 'published';
    }

    applyModeUI();
  }

  function buildQueryString(params) {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v === null || typeof v === 'undefined' || v === '') return;
      sp.set(k, String(v));
    });
    const s = sp.toString();
    return s ? `?${s}` : '';
  }

  function matchesSearch(item, q) {
    if (!q) return true;
    const s = q.toLowerCase();
    const fields = [item.title, item.game, item.content].filter(Boolean).map(v => String(v).toLowerCase());
    return fields.some(f => f.includes(s));
  }

  async function loadNews() {
    hideAlert();

    let endpoint;
    if (state.mode === 'mine') {
      endpoint = '/api/news/mine';
    } else {
      endpoint = '/api/news';
    }

    const qs = buildQueryString({
      page: state.page,
      limit: state.limit
    });

    try {
      const res = await apiFetch(endpoint + qs);
      const items = Array.isArray(res?.data) ? res.data : [];
      const filtered = state.query ? items.filter(i => matchesSearch(i, state.query)) : items;

      if (els.grid) {
        els.grid.innerHTML = '';
        filtered.forEach(item => els.grid.appendChild(renderCard(item)));
      }

      setPagination(res?.pagination || { page: 1, pages: 1 });

      if (!filtered.length) {
        showAlert(state.mode === 'mine'
          ? 'No articles yet. Click "New article" to create one.'
          : 'No published news yet.');
      }
    } catch (e) {
      showAlert(e.message || 'Failed to load news', 'danger');
      if (els.grid) els.grid.innerHTML = '';
      setPagination({ page: 1, pages: 1, total: 0 });
    }
  }

  function openEditor(item) {
    hideEditorAlert();

    const isNew = !item;
    const canEdit = canManage();

    const modal = bootstrap.Modal.getOrCreateInstance(els.editorModal);

    els.editorId.value = item?._id || '';
    els.editorTitleInput.value = item?.title || '';
    els.editorGameInput.value = item?.game || '';
    els.editorContentInput.value = item?.content || '';

    const isPublished = !!item?.publishedAt;

    els.editorTitle.textContent = isNew ? 'New article' : (canEdit ? 'Manage article' : 'View article');

    const readonly = !canEdit && !isNew;
    els.editorTitleInput.disabled = readonly;
    els.editorGameInput.disabled = readonly;
    els.editorContentInput.disabled = readonly;

    els.editorSave.style.display = canEdit ? '' : 'none';
    els.editorPublish.style.display = canEdit ? '' : 'none';
    els.editorDelete.style.display = (!isNew && canEdit) ? '' : 'none';
    els.editorUnpublish.style.display = (!isNew && canEdit && isPublished) ? '' : 'none';

    modal.show();
  }

  function readEditor() {
    return {
      id: (els.editorId.value || '').trim(),
      title: (els.editorTitleInput.value || '').trim(),
      game: (els.editorGameInput.value || '').trim(),
      content: (els.editorContentInput.value || '').trim()
    };
  }

  function validateEditor(data) {
    if (!data.title) return 'Title is required';
    if (!data.game) return 'Game is required';
    if (!data.content || data.content.length < 10) return 'Content must be at least 10 characters';
    return null;
  }

  async function saveArticle() {
    hideEditorAlert();
    const d = readEditor();
    const err = validateEditor(d);
    if (err) return showEditorAlert(err);

    try {
      if (!canManage()) throw new Error('Not authorized');

      if (!d.id) {
        await apiFetch('/api/news', {
          method: 'POST',
          body: JSON.stringify({ title: d.title, content: d.content, game: d.game })
        });
      } else {
        await apiFetch(`/api/news/${d.id}`, {
          method: 'PUT',
          body: JSON.stringify({ title: d.title, content: d.content, game: d.game })
        });
      }

      bootstrap.Modal.getOrCreateInstance(els.editorModal).hide();
      await loadNews();
    } catch (e) {
      showEditorAlert(e.message || 'Failed to save');
    }
  }

  async function publishArticle() {
    hideEditorAlert();
    const d = readEditor();
    if (!d.id) {
      return showEditorAlert('Save the article first');
    }

    try {
      await apiFetch(`/api/news/${d.id}/publish`, { method: 'PUT' });
      bootstrap.Modal.getOrCreateInstance(els.editorModal).hide();
      await loadNews();
    } catch (e) {
      showEditorAlert(e.message || 'Failed to publish');
    }
  }

  async function unpublishArticle() {
    hideEditorAlert();
    const d = readEditor();
    if (!d.id) return;

    try {
      await apiFetch(`/api/news/${d.id}/unpublish`, { method: 'PUT' });
      bootstrap.Modal.getOrCreateInstance(els.editorModal).hide();
      await loadNews();
    } catch (e) {
      showEditorAlert(e.message || 'Failed to unpublish');
    }
  }

  async function deleteArticle() {
    hideEditorAlert();
    const d = readEditor();
    if (!d.id) return;

    const ok = confirm('Delete this news article?');
    if (!ok) return;

    try {
      await apiFetch(`/api/news/${d.id}`, { method: 'DELETE' });
      bootstrap.Modal.getOrCreateInstance(els.editorModal).hide();
      await loadNews();
    } catch (e) {
      showEditorAlert(e.message || 'Failed to delete');
    }
  }

  async function login() {
    hideAlert();

    const email = (els.authEmail.value || '').trim();
    const password = (els.authPassword.value || '').trim();

    if (!email || !password) {
      showAlert('Enter email and password', 'warning');
      return;
    }

    try {
      const res = await apiFetch('/api/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      const token = res?.data?.token;
      if (!token) throw new Error('Token not returned');

      setToken(token);
      await loadMe();
      await loadNews();
    } catch (e) {
      showAlert(e.message || 'Login failed', 'danger');
    }
  }

  async function logout() {
    // Используем наш общий authManager
    if (window.authManager) {
      window.authManager.logout();
    } else {
      setToken(null);
      state.me = null;
      updateAuthUI();
      if (els.authPassword) els.authPassword.value = '';
      state.mode = 'published';
      if (els.mode) els.mode.value = 'published';
    }
    state.page = 1;
    applyModeUI();
    await loadNews();
  }

  function bind() {
    if (els.search) {
      els.search.addEventListener('input', () => {
        state.query = els.search.value || '';
        loadNews();
      });
    }
    if (els.searchClear) {
      els.searchClear.addEventListener('click', () => {
        els.search.value = '';
        state.query = '';
        loadNews();
      });
    }

    if (els.mode) {
      els.mode.addEventListener('change', () => {
        state.mode = els.mode.value;
        state.page = 1;
        applyModeUI();
        loadNews();
      });
    }

    if (els.prev) {
      els.prev.addEventListener('click', () => {
        if (state.page <= 1) return;
        state.page -= 1;
        loadNews();
      });
    }
    if (els.next) {
      els.next.addEventListener('click', () => {
        if (state.page >= state.pages) return;
        state.page += 1;
        loadNews();
      });
    }

    if (els.newBtn) {
      els.newBtn.addEventListener('click', () => {
        openEditor(null);
      });
    }

    if (els.editorSave) els.editorSave.addEventListener('click', saveArticle);
    if (els.editorPublish) els.editorPublish.addEventListener('click', publishArticle);
    if (els.editorUnpublish) els.editorUnpublish.addEventListener('click', unpublishArticle);
    if (els.editorDelete) els.editorDelete.addEventListener('click', deleteArticle);

    if (els.authLogin) els.authLogin.addEventListener('click', login);
    if (els.authLogout) els.authLogout.addEventListener('click', logout);
  }

  async function init() {
    bind();
    // Ждем пока authManager загрузится
    if (window.authManager) {
      setToken(window.authManager.getToken());
    } else {
      setToken(getToken());
    }
    await loadMe();
    applyModeUI();
    await loadNews();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
