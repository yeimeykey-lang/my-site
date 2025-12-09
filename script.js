// script.js — универсальный: безопасно работает на index, register, login
document.addEventListener('DOMContentLoaded', () => {
  // helpers
  const getUser = () => {
    try { return JSON.parse(localStorage.getItem('hm_user') || 'null'); }
    catch { return null; }
  };
  const setUser = (u) => localStorage.setItem('hm_user', JSON.stringify(u));
  const removeUser = () => localStorage.removeItem('hm_user');

  // header elements (may be absent on auth pages)
  const userGreeting = document.getElementById('userGreeting');
  const logoutBtn = document.getElementById('logoutBtn');
  const linkLogin = document.getElementById('linkLogin');
  const linkRegister = document.getElementById('linkRegister');

  const updateHeader = () => {
    const u = getUser();
    if (!userGreeting) return;
    if (u) {
      userGreeting.textContent = `Привет, ${u.name || u.contact}`;
      userGreeting.setAttribute('aria-hidden', 'false');
      if (logoutBtn) logoutBtn.classList.remove('hidden');
      if (linkLogin) linkLogin.classList.add('hidden');
      if (linkRegister) linkRegister.classList.add('hidden');
    } else {
      userGreeting.textContent = '';
      userGreeting.setAttribute('aria-hidden', 'true');
      if (logoutBtn) logoutBtn.classList.add('hidden');
      if (linkLogin) linkLogin.classList.remove('hidden');
      if (linkRegister) linkRegister.classList.remove('hidden');
    }
  };

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      removeUser();
      updateHeader();
      // stay on page, or redirect to index
      location.href = 'index.html';
    });
  }

  updateHeader();

  // PRODUCTS & SEARCH — only if corresponding elements exist
  const cardTpl = document.getElementById('cardTpl');
  const recommendedGrid = document.getElementById('recommendedGrid') || document.getElementById('recommended');
  const searchResults = document.getElementById('searchResults');
  const mayLike = document.getElementById('mayLike');
  const searchInput = document.getElementById('searchInput');

  const renderList = (container, list) => {
    if (!container) return;
    container.innerHTML = '';
    if (!list || list.length === 0) {
      container.innerHTML = '<div class="empty">Пока нет товаров</div>';
      return;
    }
    list.forEach(p => {
      const tpl = cardTpl ? cardTpl.content.cloneNode(true) : document.createElement('div');
      if (cardTpl) {
        tpl.querySelector('.title').textContent = p.name || 'Без названия';
        tpl.querySelector('.desc').textContent = p.description || '';
        tpl.querySelector('.price').textContent = p.price ? `${p.price} ₽` : (p.priceText || '');
        const img = tpl.querySelector('img');
        if (img) img.src = p.image || 'https://via.placeholder.com/600x400?text=Фото';
        container.appendChild(tpl);
      } else {
        const item = document.createElement('div');
        item.textContent = p.name;
        container.appendChild(item);
      }
    });
  };

  let products = [];

  const loadProducts = async () => {
    try {
      const res = await fetch('products.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('not found');
      const data = await res.json();
      products = Array.isArray(data) ? data : (data.recommended || []);
    } catch (err) {
      console.warn('products load failed', err);
      products = [];
    } finally {
      renderList(recommendedGrid, products.slice(0, 6));
      renderList(mayLike, products.slice(3));
    }
  };

  if (recommendedGrid) loadProducts();

  const doSearch = (q) => {
    if (!searchResults) return;
    const qn = String(q || '').trim().toLowerCase();
    if (!qn) { searchResults.innerHTML = ''; document.getElementById('searchResultsTitle')?.classList.add('hidden'); return; }
    const found = products.filter(p => p.name && p.name.toLowerCase().includes(qn));
    renderList(searchResults, found);
    document.getElementById('searchResultsTitle')?.classList.remove('hidden');
  };

  if (searchInput) {
    let t;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(t);
      t = setTimeout(() => doSearch(e.target.value), 180);
    });
  }

  // keep header user after registration/login
  // On auth pages, after successful action (register/login) code there sets localStorage and redirects to index,
  // updateHeader will run after redirect automatically (because this script runs on index too).
});
