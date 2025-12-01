window.addEventListener('DOMContentLoaded', function() {
  const regForm = document.getElementById('formRegister');
  const logForm = document.getElementById('formLogin');

  // Показать форму регистрации
  document.getElementById('showRegister').addEventListener('click', function() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
  });
  // Показать форму входа
  document.getElementById('showLogin').addEventListener('click', function() {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
  });
  // Ссылки внутри форм для переключения
  document.getElementById('toRegister').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
  });
  document.getElementById('toLogin').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
  });

  // Обработка отправки регистрации
  regForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('fullName').value;
    const country = document.getElementById('country').value;
    const contact = document.getElementById('phoneOrEmail').value;
    // Сохраняем данные в localStorage
    localStorage.setItem('userName', name);
    localStorage.setItem('userCountry', country);
    localStorage.setItem('userContact', contact);
    localStorage.setItem('loggedIn', 'true');
    // Показ раздела с товарами
    showProductsSection();
  });

  // Обработка входа
  logForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const contact = document.getElementById('loginField').value;
    localStorage.setItem('userContact', contact);
    localStorage.setItem('loggedIn', 'true');
    showProductsSection();
  });

  // Если уже залогинен, сразу показать товары
  if (localStorage.getItem('loggedIn') === 'true') {
    showProductsSection();
  }

  function showProductsSection() {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('productsSection').style.display = 'block';
    // Можно вывести приветствие, например:
    // document.getElementById('welcome').textContent = 'Привет, ' + localStorage.getItem('userName');
  }
});
