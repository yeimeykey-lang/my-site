// script.js
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const tabRegister = document.getElementById('tabRegister');
  const tabLogin = document.getElementById('tabLogin');
  const formRegister = document.getElementById('formRegister');
  const formLogin = document.getElementById('formLogin');
  const toLogin = document.getElementById('toLogin');
  const toRegister = document.getElementById('toRegister');
  const authMsg = document.getElementById('authMsg');
  const openAuthBtn = document.getElementById('openAuthBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const countrySelect = document.getElementById('countrySelect');
  const countryRadios = document.getElementsByName('country_right');

  const recommendedEl = document.getElementById('recommended');
  const searchResultsEl = document.getElementById('searchResults');
  const mayLikeEl = document.getElementById('mayLike');
  const searchInput = document.getElementById('searchInput');
  const cardTpl = document.getElementById('cardTpl');

  // State
  let products = { recommended: [], searchResults: [], mayLike: [] };
  let currentUser = loadUser();

  // Helpers
  const show = el => { el.classList.remove('hidden'); el.style.display = ''; };
  const hide = el => { el.classList.add('hidden'); el.style.display = 'none'; };
  const setActive = isReg => {
    if (isReg) { tabRegister.classList.add('active'); tabLogin.classList.remove('active'); show(formRegister); hide(formLogin); }
    else { tabRegister.classList.remove('active'); tabLogin.classList.add('active'); hide(formRegister); show(formLogin); }
  };

  // Tabs
  tabRegister.addEventListener('click', () => setActive(true));
  tabLogin.addEventListener('click', () => setActive(false));
  toLogin.addEventListener('click', e => { e.preventDefault(); setActive(false); });
  toRegister.addEventListener('click', e => { e.preventDefault(); setActive(true); });

  openAuthBtn.addEventListener('click', () => {
    // scroll left panel into view
    document.getElementById('leftPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Validators
  const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isPhone = v => /^(\+?\d[\d\s-]{5,}\d)$/.test(v.replace(/\s+/g,'')); // loose but practical

  // Local storage user helpers
  function loadUser() {
    try { return JSON.parse(localStorage.getItem('hm_user') || 'null'); }
    catch { return null; }
  }
  function saveUser(u) { localStorage.setItem('hm_user', JSON.stringify(u)); }

  function loginUser(user) {
    currentUser = user;
    saveUser(user);
    authMsg.textContent = `Привет, ${user.name || user.contact}`;
    document.getElementById('authCard').classList.add('hidden');
    logoutBtn.classList.remove('hidden');
    // set header country
    if (user.country) countrySelect.value = user.country;
    // scroll to products
    document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
  }

  // Registration
  formRegister.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('fullName').value.trim();
    const contact = document.getElementById('contactReg').value.trim();
    const country = document.getElementById('countryReg').value;

    if (!name) { authMsg.textContent = 'Введите ФИО.'; return; }
    if (!contact) { authMsg.textContent = 'Введите телефон или email.'; return; }
    if (!isEmail(contact) && !isPhone(contact)) { authMsg.textContent = 'Формат телефона или email неверен.'; return; }
    if (!country) { authMsg.textContent = 'Выберите страну.'; return; }

    const user = { name, contact, country, created: Date.now() };
    loginUser(user);
    authMsg.textContent = 'Регистрация успешна (локально).';
    localStorage.setItem('hm_selected_country', country);
  });

  // Login
  formLogin.addEventListener('submit', e => {
    e.preventDefault();
    const contact = document.getElementById('contactLogin').value.trim();
    if (!contact) { authMsg.textContent = 'Введите телефон или email.'; return; }
    if (!isEmail(contact) && !isPhone(contact)) { authMsg.textContent = 'Формат неверен.'; return; }

    // try reuse stored user
    let stored = loadUser();
    if (stored && stored.contact === contact) {
      loginUser(stored);
      authMsg.textContent = 'Вход выполнен.';
    } else {
      // no backend: create minimal session user
      const user = { name: '', contact, country: countrySelect.value || '' };
      loginUser(user);
      authMsg.textContent = 'Вход (локально).';
    }
  });

  // Logout
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('hm_user');
    currentUser = null;
    logoutBtn.classList.add('hidden');
    document.getElementById('authCard').classList.remove('hidden');
    authMsg.textContent = 'Вы вышли.';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // country radios (left panel) -> sync header select
  Array.from(countryRadios).forEach(r => r.addEventListener('change', e => {
    countrySelect.value = e.target.value;
    localStorage.setItem('hm_selected_country', e.target.value);
  }));
  // header select -> sync radios
  countrySelect.addEventListener('change', e => {
    localStorage.setItem('hm_selected_country', e.target.value);
    Array.from(countryRadios).forEach(r => { r.checked = (r.value === e.target.value); });
  });

  // render list
  function renderList(container, list) {
    container.innerHTML = '';
    if (!list || list.length === 0) {
      container.innerHTML = '<div class="empty">Пока нет товаров</div>';
      return;
    }
    list.forEach(p => {
      const tpl = cardTpl.content.cloneNode(true);
      const img = tpl.querySelector('img');
      tpl.querySelector('.title').textContent = p.name || 'Без названия';
      tpl.querySelector('.desc').textContent = p.description || '';
      tpl.querySelector('.price').textContent = p.price ? `${p.price} ₽` : (p.priceText || '');
      img.src = p.image || 'https://via.placeholder.com/600x400?text=Фото';
      img.alt = p.name || 'product';
      container.appendChild(tpl);
    });
  }

  // load products.json
  async function loadProducts() {
    try {
      const res = await fetch('products.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('not found');
      const data = await res.json();
      products = Object.assign({ recommended: [], searchResults: [], mayLike: [] }, data);
    } catch (err) {
      products = { recommended: [], searchResults: [], mayLike: [] };
    } finally {
      renderList(recommendedEl, products.recommended);
      renderList(searchResultsEl, products.searchResults);
      renderList(mayLikeEl, products.mayLike);
    }
  }

  // search
  function doSearch(q) {
    const qn = String(q || '').trim().toLowerCase();
    if (!qn) { renderList(searchResultsEl, []); return; }
    const all = [...products.recommended, ...products.searchResults, ...products.mayLike];
    const found = all.filter(p => p.name && p.name.toLowerCase().includes(qn));
    renderList(searchResultsEl, found);
  }
  let timer;
  searchInput.addEventListener('input', e => {
    clearTimeout(timer);
    timer = setTimeout(() => doSearch(e.target.value), 200);
  });

  // init UI state
  const savedCountry = localStorage.getItem('hm_selected_country');
  if (savedCountry) { countrySelect.value = savedCountry; Array.from(countryRadios).forEach(r => r.checked = (r.value === savedCountry)); }

  if (currentUser) {
    authMsg.textContent = `Привет, ${currentUser.name || currentUser.contact}`;
    document.getElementById('authCard').classList.add('hidden');
    logoutBtn.classList.remove('hidden');
  }

  // initial load
  loadProducts();
});
