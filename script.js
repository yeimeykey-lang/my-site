// script.js — универсальный: работает на index/register/login
document.addEventListener('DOMContentLoaded', () => {
  // --- utilities for user & cart ---
  const getUser = () => {
    try { return JSON.parse(localStorage.getItem('hm_user') || 'null'); }
    catch { return null; }
  };
  const setUser = (u) => localStorage.setItem('hm_user', JSON.stringify(u));
  const removeUser = () => localStorage.removeItem('hm_user');

  const getCart = () => {
    try { return JSON.parse(localStorage.getItem('hm_cart') || '[]'); }
    catch { return []; }
  };
  const saveCart = (c) => localStorage.setItem('hm_cart', JSON.stringify(c));
  const addToCart = (product) => {
    const cart = getCart();
    const idx = cart.findIndex(x => x.name === product.name);
    if (idx >= 0) {
      cart[idx].qty += 1;
    } else {
      cart.push({ ...product, qty: 1 });
    }
    saveCart(cart);
    updateCartUI();
  };
  const removeFromCart = (index) => {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    updateCartUI();
  };
  const clearCart = () => {
    saveCart([]);
    updateCartUI();
  };

  // --- header elements ---
  const userGreeting = document.getElementById('userGreeting');
  const logoutBtn = document.getElementById('logoutBtn');
  const linkLogin = document.getElementById('linkLogin');
  const linkRegister = document.getElementById('linkRegister');

  const cartBtn = document.getElementById('cartBtn');
  const cartCountEl = document.getElementById('cartCount');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartList = document.getElementById('cartList');
  const cartTotal = document.getElementById('cartTotal');
  const closeCart = document.getElementById('closeCart');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const clearCartBtn = document.getElementById('clearCartBtn');

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
      // stay on page or redirect
      location.href = 'index.html';
    });
  }

  // cart UI
  function updateCartUI() {
    const cart = getCart();
    const totalQty = cart.reduce((s, i) => s + (i.qty || 0), 0);
    const totalSum = cart.reduce((s, i) => s + (Number(i.price?.toString().replace(/\s/g,'') || 0) * i.qty), 0);

    if (cartCountEl) {
      if (totalQty > 0) {
        cartCountEl.classList.remove('hidden');
        cartCountEl.textContent = totalQty;
      } else cartCountEl.classList.add('hidden');
    }

    if (!cartList) return;
    cartList.innerHTML = '';
    if (cart.length === 0) {
      cartList.innerHTML = '<div class="empty">Корзина пуста</div>';
    } else {
      cart.forEach((item, idx) => {
        const node = document.createElement('div');
        node.className = 'cart-item';
        node.innerHTML = `
          <img src="${item.image || 'https://via.placeholder.com/150'}" alt="">
          <div style="flex:1">
            <div style="font-weight:600">${item.name}</div>
            <div class="muted">${item.price} ₽ × ${item.qty}</div>
          </div>
          <div>
            <button class="btn btn-sm remove-btn" data-idx="${idx}">Удалить</button>
          </div>
        `;
        cartList.appendChild(node);
      });
    }
    if (cartTotal) cartTotal.textContent = totalSum.toLocaleString('ru-RU');
  }

  if (closeCart) closeCart.addEventListener('click', () => { cartDrawer.classList.add('hidden'); cartDrawer.setAttribute('aria-hidden','true'); });
  if (cartBtn) cartBtn.addEventListener('click', () => { cartDrawer.classList.toggle('hidden'); cartDrawer.setAttribute('aria-hidden', cartDrawer.classList.contains('hidden') ? 'true' : 'false'); updateCartUI(); });
  if (clearCartBtn) clearCartBtn.addEventListener('click', () => { clearCart(); });
  if (checkoutBtn) checkoutBtn.addEventListener('click', () => {
    alert('Функция оформления — учебная. Реализацию можно добавить отдельно.');
  });

  // delegate remove in cart list
  if (cartList) cartList.addEventListener('click', (e) => {
    if (e.target.matches('.remove-btn')) {
      const idx = Number(e.target.dataset.idx);
      removeFromCart(idx);
    }
  });

  updateHeader();
  updateCartUI();

  // --- products rendering, modal and search ---
  const cardTpl = document.getElementById('cardTpl');
  const recommendedGrid = document.getElementById('recommendedGrid');
  const searchResults = document.getElementById('searchResults');
  const mayLike = document.getElementById('mayLike');
  const searchInput = document.getElementById('searchInput');

  let products = [];

  const renderList = (container, list) => {
    if (!container) return;
    container.innerHTML = '';
    if (!list || list.length === 0) {
      container.innerHTML = '<div class="empty">Пока нет товаров</div>';
      return;
    }
    list.forEach((p, idx) => {
      const tpl = cardTpl.content.cloneNode(true);
      tpl.querySelector('.title').textContent = p.name || 'Без названия';
      tpl.querySelector('.desc').textContent = p.description || '';
      tpl.querySelector('.price').textContent = p.price ? `${p.price}` : '';
      const img = tpl.querySelector('img');
      if (img) img.src = p.image || 'https://via.placeholder.com/600x400?text=Фото';
      const badge = tpl.querySelector('.card-badge');
      if (p.badge) { badge.textContent = p.badge; badge.classList.remove('hidden'); }
      // store data
      const article = tpl.querySelector('.product-card');
      article.dataset.index = idx;
      // buttons
      const addBtn = tpl.querySelector('.btn-add');
      const detailsBtn = tpl.querySelector('.btn-details');
      addBtn.addEventListener('click', () => addToCart(p));
      detailsBtn.addEventListener('click', () => openModal(p));
      container.appendChild(tpl);
    });
  };

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
      renderList(recommendedGrid, products.slice(0, 8));
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

  // --- modal behaviour ---
  const modal = document.getElementById('productModal');
  const modalImg = document.getElementById('modalImg');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalPrice = document.getElementById('modalPrice');
  const modalAdd = document.getElementById('modalAdd');
  const modalBuy = document.getElementById('modalBuy');
  const modalClose = document.getElementById('modalClose');
  let modalProduct = null;

  function openModal(p) {
    modalProduct = p;
    if (!modal) return;
    modalImg.src = p.image || '';
    modalTitle.textContent = p.name || '';
    modalDesc.textContent = p.description || '';
    modalPrice.textContent = p.price ? `${p.price} ₽` : '';
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden','true');
    modalProduct = null;
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  if (modalAdd) modalAdd.addEventListener('click', () => { if (modalProduct) { addToCart(modalProduct); closeModal(); } });
  if (modalBuy) modalBuy.addEventListener('click', () => { alert('Покупка — демонстрация.'); });

  // keyboard escape
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeModal(); cartDrawer.classList.add('hidden'); } });

  // init UI
  updateHeader();
  updateCartUI();
});
