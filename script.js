document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------
    // Логика для Секции 1: Синхронизация выбора страны
    // ----------------------------------------------------
    const desktopRadios = document.querySelectorAll('input[name="country_desktop"]');
    const mobileRadios = document.querySelectorAll('input[name="country_mobile"]');

    // Функция для синхронизации, выделения и симуляции "отправки"
    function setupCountrySync(sourceRadios, targetRadios) {
        sourceRadios.forEach(sourceRadio => {
            sourceRadio.addEventListener('change', (event) => {
                if (event.target.checked) {
                    const selectedValue = event.target.value;
                    
                    // 1. УДАЛЕНИЕ КЛАССА 'selected' со ВСЕХ элементов-родителей
                    document.querySelectorAll('.country-item').forEach(item => {
                        item.classList.remove('selected');
                    });

                    // 2. СИНХРОНИЗАЦИЯ radio-кнопок и ДОБАВЛЕНИЕ КЛАССА к меткам
                    targetRadios.forEach(targetRadio => {
                        targetRadio.checked = targetRadio.value === selectedValue;
                        if (targetRadio.checked) {
                             targetRadio.closest('.country-item').classList.add('selected');
                        }
                    });
                    
                    // 3. Добавляем класс 'selected' к текущему выбранному элементу
                    event.target.closest('.country-item').classList.add('selected');

                    // 4. СИМУЛЯЦИЯ: Вывод в консоль вместо отправки на сервер
                    console.log(`[FRONTEND ONLY] Выбрана страна: ${selectedValue}. Бэкенд-отправка пропущена.`);
                }
            });
        });
    }

    // Настройка синхронизации
    setupCountrySync(desktopRadios, mobileRadios);
    setupCountrySync(mobileRadios, desktopRadios);
    
    // Инициализация при загрузке: добавляем класс 'selected' к выбранному по умолчанию
    document.querySelectorAll('input[name^="country"]:checked').forEach(input => {
        input.closest('.country-item').classList.add('selected');
    });


    // ----------------------------------------------------
    // Логика для Секции 2: Выбор пола и Регистрация
    // ----------------------------------------------------
    const genderRadios = document.querySelectorAll('input[name^="gender"]');

    // Логика выделения пола
    genderRadios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            // Удаляем класс 'selected' у всех меток пола в этой форме
            event.target.closest('.gender-selection').querySelectorAll('.radio-label').forEach(label => {
                label.classList.remove('selected');
            });
            // Добавляем класс 'selected' только к выбранной метке
            event.target.closest('.radio-label').classList.add('selected');
        });
    });

    // Логика регистрации (только фронтенд, без отправки)
    const loginForms = document.querySelectorAll('.login-form');

    loginForms.forEach(form => {
        form.addEventListener('submit', (event) => {
            event.preventDefault(); // Предотвращаем стандартную отправку формы
            
            const nameInput = form.querySelector('input[type="text"]').value;
            const genderInput = form.querySelector('input[name^="gender"]:checked').value;
            
            const userData = {
                name: nameInput || "Не указано",
                gender: genderInput
            };

            // Симуляция успешной регистрации
            console.log(`[FRONTEND ONLY] Регистрация симулирована. Данные:`, userData);
            alert(`Успех! Пользователь '${userData.name}' (${userData.gender}) 'зарегистрирован'.`);
            
            // Очистка формы (по желанию)
            // form.reset();
        });
    });

    // ----------------------------------------------------
    // Логика для Секции 3: Продукты
    // ----------------------------------------------------
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach((card, index) => {
        card.addEventListener('click', (event) => {
            // Если клик был по иконке, обрабатываем иконку, иначе - карточку
            const isIcon = event.target.classList.contains('action-icon');
            
            if (isIcon) {
                if (event.target.classList.contains('cart-icon')) {
                    console.log(`Продукт #${index + 1}: Добавлен в корзину (🛒)`);
                } else if (event.target.classList.contains('user-icon')) {
                    console.log(`Продукт #${index + 1}: Просмотр профиля продавца (👤)`);
                } else if (event.target.classList.contains('home-icon')) {
                    console.log(`Продукт #${index + 1}: Переход на главную (🏠)`);
                }
            } else {
                console.log(`Клик по карточке продукта #${index + 1}. Симуляция перехода на страницу продукта.`);
            }
        });
    });
});
