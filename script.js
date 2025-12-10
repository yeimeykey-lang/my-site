// script.js — универсальный, упрощённый, проверенный
document.addEventListener('DOMContentLoaded', () => {

  // --- user helpers ---
  const getUser = () => {
    try { return JSON.parse(localStorage.getItem('hm_user') || 'null'); }
    catch { return null; }
  };
  const setUser = (u) => localStorage.setItem('hm_user', JSON.stringify(u));
  const removeUser = () => localStorage.removeItem('hm_user');

  // --- cart helpers ---
  const getCart = () => {
    try { return JSON.parse(localStorage.getItem('hm_cart') || '[]'); }
    catch { return []; }
  };
  const saveCart = (cart) => localStorage.setItem('hm_cart', JSON.stringify(cart));
  const addToCart = (product) => {
    const cart = getCart();
    const idx = cart.findIndex(i => i.name === product.name);
    if (idx >= 0) cart[idx].qty += 1;
    else cart.push({ ...product, qty: 1 });
    saveCart(cart);
    updateCartCount();
  };

  // update cart count badge in header
  const cartCountEl = document.getElementById('cartCount');
  function updateCartCount() {
    if (!cartCountEl) return;
    const cart = getCart();
    const total = cart.reduce((s,i) => s + (i.qty || 0), 0);
    if (total > 0) {
      cartCountEl.textContent = total;
      cartCountEl.classList.remove('hidden');
    } else cartCountEl.classList.add('hidden');
  }

  // header user
  const userGreeting = document.getElementById('userGreeting');
  const logoutBtn = document.getElementById('logoutBtn');
  const linkLogin = document.getElementById('linkLogin');
  const linkRegister = document.getElementById('linkRegister');

  function updateHeader() {
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
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      removeUser();
      updateHeader();
      updateCartCount();
      location.href = 'index.html';
    });
  }

  // --- products & search (index.html) ---
  const cardTpl = document.getElementById('cardTpl');
  const recommendedGrid = document.getElementById('recommendedGrid');
  const searchResults = document.getElementById('searchResults');
  const mayLike = document.getElementById('mayLike');
  const searchInput = document.getElementById('searchInput');

  let products = [];

  async function loadProducts() {
    if (!recommendedGrid) return;
    try {
      const res = await fetch('products.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('not found');
      const data = await res.json();
      products = Array.isArray(data) ? data : (data.recommended || []);
    } catch (err) {
      console.warn('products load failed', err);
      products = [];
    }
    renderList(recommendedGrid, products.slice(0, 8));
    renderList(mayLike, products.slice(3));
  }

  function renderList(container, list) {
    if (!container) return;
    container.innerHTML = '';
    if (!list || list.length === 0) {
      container.innerHTML = '<div class="empty">Пока нет товаров</div>';
      return;
    }
    list.forEach((p) => {
      const tpl = cardTpl.content.cloneNode(true);
      tpl.querySelector('.title').textContent = p.name || 'Без названия';
      tpl.querySelector('.desc').textContent = p.description || '';
      tpl.querySelector('.price').textContent = p.price ? `${p.price}` : '';
      const img = tpl.querySelector('img');
      if (img) img.src = p.image || 'https://via.placeholder.com/600x400?text=Фото';
      const badge = tpl.querySelector('.card-badge');
      if (p.badge) { badge.textContent = p.badge; badge.classList.remove('hidden'); }

      // actions
      const addBtn = tpl.querySelector('.btn-add');
      addBtn.addEventListener('click', () => {
        addToCart(p);
      });

      const detailsBtn = tpl.querySelector('.btn-details');
      if (detailsBtn) {
        detailsBtn.addEventListener('click', () => {
          // open small info modal if exists (optional), else alert
          if (typeof openModal === 'function') openModal(p);
          else alert(p.name + '\n\n' + p.description);
        });
      }

      container.appendChild(tpl);
    });
  }

  if (recommendedGrid) loadProducts();

  function doSearch(q) {
    if (!searchResults) return;
    const qn = String(q || '').trim().toLowerCase();
    if (!qn) { searchResults.innerHTML = ''; document.getElementById('searchResultsTitle')?.classList.add('hidden'); return; }
    const found = products.filter(p => p.name && p.name.toLowerCase().includes(qn));
    renderList(searchResults, found);
    document.getElementById('searchResultsTitle')?.classList.remove('hidden');
  }

  if (searchInput) {
    let t;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(t);
      t = setTimeout(() => doSearch(e.target.value), 180);
    });
  }

  // --- cart page quick connection: on cart.html we have rendering script there (cart.html uses localStorage directly) ---
  // keep header count synced with localStorage changes
  window.addEventListener('storage', () => updateCartCount());

  // initial update
  updateHeader();
  updateCartCount();

  // expose addToCart globally for cart modal/other inline handlers if needed
  window.hmAddToCart = addToCart;
});
