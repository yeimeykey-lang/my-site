// Sample products and countries load
document.addEventListener('DOMContentLoaded', () => {
  fetch('products.json')
    .then(resp => resp.json())
    .then(data => {
      renderProducts(data.recommended, 'productsGrid');
      renderProducts(data.searchResults, 'searchProductsGrid');
      renderProducts(data.mayLike, 'mayLikeGrid');
      renderCountries(data.countries);
    });
  
  // Login form logic
  document.getElementById('loginBtn').addEventListener('click', () => {
    document.getElementById('loginForm').style.display = 'block';
  });
  document.getElementById('registerBtn').addEventListener('click', () => {
    alert('Форма регистрации в разработке');
  });
  document.getElementById('getCodeBtn').addEventListener('click', () => {
    alert('Код отправлен на номер: ' + document.getElementById('phoneInput').value);
  });
});

function renderProducts(products, gridId) {
  if (!products) return;
  const grid = document.getElementById(gridId);
  grid.innerHTML = '';
  products.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `<div class="product-info">Информация о продукте<br><strong>${prod.name}</strong></div>`;
    grid.appendChild(card);
  });
}

function renderCountries(countries) {
  const countriesList = document.getElementById('countriesList');
  countriesList.innerHTML = '';
  countries.forEach((c, idx) => {
    const item = document.createElement('div');
    item.className = 'country-item' + (idx === 0 ? ' country-selected' : '');
    item.innerHTML = `
      <span>${c.name}</span>
      <span>${idx === 0 ? '✔️' : '⚪'}</span>
    `;
    item.onclick = () => {
      document.querySelectorAll('.country-item').forEach(el => el.classList.remove('country-selected'));
      item.classList.add('country-selected');
    };
    countriesList.appendChild(item);
  });
}
