// script.js — полный, исправленный

document.addEventListener('DOMContentLoaded', () => {
  // --- TOAST ---
  const toastContainer = document.createElement('div');
  toastContainer.className = 'toast-container';
  document.body.appendChild(toastContainer);

  window.showToast = (message, icon = '✅') => {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<div class="toast-icon">${icon}</div><div class="toast-body">${message}</div>`;
    toastContainer.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => { toast.classList.remove('show'); setTimeout(()=>toast.remove(), 300); }, 3000);
  };

  // --- USER & HEADER ---
  const getUser = () => { try { return JSON.parse(localStorage.getItem('hm_user')); } catch { return null; } };
  const userGreeting = document.getElementById('userGreeting');
  const linkLogin = document.getElementById('linkLogin');
  const logoutBtn = document.getElementById('logoutBtn');

  function updateHeader() {
    const user = getUser();
    if (user) {
      if(userGreeting) userGreeting.textContent = `Привет, ${user.name.split(' ')[0]}`;
      if(linkLogin) linkLogin.classList.add('hidden');
      if(logoutBtn) logoutBtn.classList.remove('hidden');
    } else {
      if(userGreeting) userGreeting.textContent = '';
      if(linkLogin) linkLogin.classList.remove('hidden');
      if(logoutBtn) logoutBtn.classList.add('hidden');
    }
  }
  if (logoutBtn) logoutBtn.addEventListener('click', () => { localStorage.removeItem('hm_user'); location.reload(); });

  // --- FAVS ---
  const getFavs = () => JSON.parse(localStorage.getItem('hm_favs') || '[]');
  const toggleFav = (id, btn) => {
    let favs = getFavs();
    if (favs.includes(id)) {
      favs = favs.filter(i => i !== id);
      btn.classList.remove('active');
      showToast('Удалено из избранного', '💔');
    } else {
      favs.push(id);
      btn.classList.add('active');
      showToast('Добавлено в избранное', '❤️');
    }
    localStorage.setItem('hm_favs', JSON.stringify(favs));
  };

  // --- CART ---
  const getCart = () => JSON.parse(localStorage.getItem('hm_cart') || '[]');
  const saveCart = (c) => localStorage.setItem('hm_cart', JSON.stringify(c));

  window.updateCartBadge = () => {
    const countEl = document.getElementById('cartCount');
    if (!countEl) return;
    const total = getCart().reduce((a, i) => a + (i.qty || 0), 0);
    countEl.textContent = total;
    countEl.classList.toggle('hidden', total === 0);
  };

  window.addToCart = (product) => {
    const cart = getCart();
    const existing = cart.find(i => i.id === product.id);
    if (existing) existing.qty++; else {
      // хранить priceRaw для надежных расчетов
      const priceRaw = Number(String(product.price).replace(/\D/g, '')) || 0;
      cart.push({ ...product, qty: 1, priceRaw });
    }
    saveCart(cart);
    window.updateCartBadge();
    showToast(`"${product.name}" в корзине!`);
  };

  // --- VIEWED (RECENT) ---
  function addToViewed(productId) {
    if (!productId) return;
    const key = 'hm_viewed';
    let viewed = JSON.parse(localStorage.getItem(key) || '[]');
    viewed = viewed.filter(id => id !== productId);
    viewed.unshift(productId);
    if (viewed.length > 4) viewed = viewed.slice(0, 4);
    localStorage.setItem(key, JSON.stringify(viewed));
  }

  // --- PRODUCTS / RENDER ---
  const cardTpl = document.getElementById('cardTpl');
  const recommendedGrid = document.getElementById('recommendedGrid');
  const mayLikeGrid = document.getElementById('mayLike');
  const searchResultsSection = document.getElementById('searchResultsSection');
  const searchResults = document.getElementById('searchResults');
  const categoryFilters = document.getElementById('categoryFilters');
  const recentGrid = document.getElementById('recentGrid');
  const recentSection = document.getElementById('recentSection');

  let allProducts = [];

  const getRandomRating = () => {
    const stars = (Math.random() * (5.0 - 4.2) + 4.2).toFixed(1);
    const reviews = Math.floor(Math.random() * 300) + 10;
    return { stars, reviews };
  };

  async function initShop() {
    if (!recommendedGrid) return;
    try {
      const res = await fetch('products.json');
      allProducts = await res.json();

      // добавить поле priceRaw к каждому товару для надежных расчетов
      allProducts = allProducts.map(p => ({ ...p, priceRaw: Number(String(p.price).replace(/\D/g, '')) || 0 }));

      // динамические категории
      const cats = Array.from(new Set(allProducts.map(p => p.category))).sort();
      // очистим и добавим кнопки
      categoryFilters.innerHTML = '';
      const allBtn = document.createElement('button');
      allBtn.className = 'cat-btn active';
      allBtn.dataset.cat = 'all';
      allBtn.textContent = 'Все';
      categoryFilters.appendChild(allBtn);

      cats.forEach(c => {
        const b = document.createElement('button');
        b.className = 'cat-btn';
        b.dataset.cat = c;
        b.textContent = c;
        categoryFilters.appendChild(b);
      });

      renderProducts(recommendedGrid, allProducts.slice(0, 8));
      renderProducts(mayLikeGrid, allProducts.slice(8, 12));
      renderRecent(); // показать недавно просмотренные
    } catch (e) {
      if (recommendedGrid) recommendedGrid.innerHTML = '<div class="empty">Ошибка загрузки товаров.</div>';
      console.error(e);
    }
  }

  function renderProducts(container, list) {
    if (!container) return;
    container.innerHTML = '';
    const favs = getFavs();

    list.forEach(p => {
      const el = cardTpl.content.cloneNode(true);
      const { stars, reviews } = getRandomRating();

      const img = el.querySelector('.card-img');
      img.src = p.image;
      img.alt = p.name || 'product';

      el.querySelector('.title').textContent = p.name;
      el.querySelector('.price-actual').textContent = `${p.price} ₽`;

      // рейтинг
      const ratingDiv = document.createElement('div');
      ratingDiv.className = 'rating';
      ratingDiv.innerHTML = `★ ${stars} <span>(${reviews} отзывов)</span>`;
      el.querySelector('.card-body').insertBefore(ratingDiv, el.querySelector('.title'));

      // old price
      if (p.oldPrice) {
        const old = el.querySelector('.price-old');
        old.textContent = `${p.oldPrice} ₽`;
        old.classList.remove('hidden');
      }

      // badge
      if (p.badge) {
        const b = el.querySelector('.card-badge');
        b.textContent = p.badge;
        b.classList.remove('hidden');
      }

      // fav button
      const favBtn = document.createElement('button');
      favBtn.className = `btn-fav ${favs.includes(p.id) ? 'active' : ''}`;
      favBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
      favBtn.onclick = (e) => { e.stopPropagation(); toggleFav(p.id, favBtn); };
      el.querySelector('.media').appendChild(favBtn);

      // actions
      el.querySelector('.btn-add').onclick = (e) => { e.stopPropagation(); window.addToCart(p); };
      el.querySelector('.btn-details').onclick = (e) => { e.stopPropagation(); openModal(p, stars, reviews); };

      // open modal when clicking the card
      el.querySelector('.product-card').onclick = () => openModal(p, stars, reviews);

      container.appendChild(el);
    });
  }

  // --- MODAL ---
  const modal = document.getElementById('productModal');
  const modalBuyBtn = document.getElementById('modalBuyBtn');

  function openModal(product, stars = '4.9', reviews = '100') {
    if (!modal || !product) return;
    document.getElementById('modalImg').src = product.image;
    document.getElementById('modalTitle').textContent = product.name;
    document.getElementById('modalDesc').textContent = product.description;
    document.getElementById('modalPrice').textContent = `${product.price} ₽`;
    document.getElementById('modalCat').textContent = `${product.category} • ★ ${stars} (${reviews} отзывов)`;

    addToViewed(product.id);

    modalBuyBtn.onclick = () => {
      window.addToCart(product);
      modal.classList.remove('open');
      document.body.style.overflow = '';
    };

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  if (modal) {
    document.getElementById('closeModal').onclick = () => { modal.classList.remove('open'); document.body.style.overflow = ''; };
    modal.onclick = (e) => { if (e.target === modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }};
  }

  // --- SEARCH & CATEGORIES ---
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (!q) { searchResultsSection.classList.add('hidden'); return; }
      searchResultsSection.classList.remove('hidden');
      const found = allProducts.filter(p => {
        return String(p.name).toLowerCase().includes(q) ||
               String(p.description).toLowerCase().includes(q) ||
               String(p.category).toLowerCase().includes(q);
      });
      renderProducts(searchResults, found);
    });
  }

  // category buttons (delegation)
  categoryFilters.addEventListener('click', (ev) => {
    const b = ev.target.closest('.cat-btn');
    if (!b) return;
    categoryFilters.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
    b.classList.add('active');
    const cat = b.dataset.cat;
    const filtered = cat === 'all' ? allProducts : allProducts.filter(p => p.category === cat);
    renderProducts(recommendedGrid, filtered);
  });

  // --- RECENT ---
  function renderRecent() {
    const viewedIds = JSON.parse(localStorage.getItem('hm_viewed') || '[]');
    const container = recentGrid;
    const section = recentSection;
    if (!container || viewedIds.length === 0) { if(section) section.classList.add('hidden'); return; }

    // согласуем типы id (строка/число)
    const viewedProducts = allProducts.filter(p => viewedIds.includes(p.id) || viewedIds.includes(String(p.id)));
    if (viewedProducts.length > 0) {
      section.classList.remove('hidden');
      renderProducts(container, viewedProducts);
    } else {
      section.classList.add('hidden');
    }
  }

  // --- INIT ---
  updateHeader();
  window.updateCartBadge();
  initShop();

  // --- SLIDER ---
  const slides = document.querySelectorAll('.slide');
  const dotsContainer = document.getElementById('sliderDots');
  let currentSlide = 0;
  if (slides.length > 0 && dotsContainer) {
    slides.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = `dot ${i === 0 ? 'active' : ''}`;
      dot.onclick = () => goToSlide(i);
      dotsContainer.appendChild(dot);
    });
    function goToSlide(n) {
      slides[currentSlide].classList.remove('active');
      document.querySelectorAll('.dot')[currentSlide]?.classList.remove('active');
      currentSlide = (n + slides.length) % slides.length;
      slides[currentSlide].classList.add('active');
      document.querySelectorAll('.dot')[currentSlide]?.classList.add('active');
    }
    setInterval(() => goToSlide(currentSlide + 1), 5000);
  }
});
