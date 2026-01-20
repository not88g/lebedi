document.addEventListener('DOMContentLoaded', () => {
    // Детектор Apple устройств (Safari / iOS)
    const isApple = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
                    /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isApple) {
        document.body.classList.add('is-safari');
        console.log("Apple device detected: Applying Marker Felt fallback.");
    }
}

// --- ЛОГИКА БАННЕРА И ТАЙМЕРА ---

// Целевая дата: 28 января 2026 года, 09:00
const releaseDate = new Date('2026-01-28T09:00:00').getTime();

// Обновляем таймер каждую секунду
const timerInterval = setInterval(function() {
    const now = new Date().getTime();
    const distance = releaseDate - now;

    // Расчеты времени
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Вывод в элемент
    const timerElement = document.getElementById("countdown");
    if (timerElement) {
        timerElement.innerHTML = days + "д " + hours + "ч " + minutes + "м " + seconds + "с ";
    }

    // Если время вышло
    if (distance < 0) {
        clearInterval(timerInterval);
        if (timerElement) timerElement.innerHTML = "!!! РЕЛИЗ ВЫШЕЛ !!!";
    }
}, 1000);
    
// Функции открытия и закрытия окна альбома
function openAlbumPage() {
    document.getElementById('album-popup').style.display = 'block';
}

function closeAlbumPage() {
    document.getElementById('album-popup').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    const singlesContainer = document.getElementById('singles-container');
    const epsContainer = document.getElementById('eps-container');
    const BOT_USERNAME = 'dvalebebdya_bot';

    function createCard(item) {
        const card = document.createElement('div');
        card.className = 'release-card';
        
        let buttonHtml = '';
        
        // Логика кнопки: если цена 0 — кнопка скачать, иначе — в бота
        if (item.price === 0) {
            buttonHtml = `<a href="${item.file}" class="buy-btn" download style="background: linear-gradient(to bottom, #fff, #ccc); color: black;">💾 СКАЧАТЬ (FREE)</a>`;
        } else {
            const botLink = `https://t.me/${BOT_USERNAME}?start=buy_${item.id}`;
            buttonHtml = `<a href="${botLink}" class="buy-btn" target="_blank">КУПИТЬ: ${item.price} ⭐</a>`;
        }

        // Если это EP, добавляем обработчик клика на карточку для открытия треклиста
        const clickAttr = item.type === 'ep' ? `onclick="showAlbumDetails('${item.id}')"` : '';

        card.innerHTML = `
            <div ${clickAttr} style="cursor: ${item.type === 'ep' ? 'pointer' : 'default'}">
                <img src="${item.image}" alt="${item.title}" width="150" height="150">
                <p><b>${item.title}</b></p>
                <p style="font-size: 11px;">Дата: ${item.year}</p>
            </div>
            ${buttonHtml}
        `;
        return card;
    }

    // Функция для показа деталей EP (используется глобально)
    window.showAlbumDetails = function(albumId) {
        fetch('data.json')
            .then(r => r.json())
            .then(data => {
                const album = data.find(a => a.id === albumId);
                if (!album) return;

                const popup = document.getElementById('album-popup');
                popup.querySelector('h2').innerText = album.title;
                popup.querySelector('.album-cover-glossy').src = album.image;
                
                const list = popup.querySelector('.tracklist-web2 ol');
                list.innerHTML = album.tracks.map(t => `<li>${t}</li>`).join('');
                
                popup.style.display = 'block';
            });
    };

    
// --- ЛОГИКА БОНУСНОГО БАННЕРА ---
const bonusBanner = document.getElementById('bonus-promo-banner');
const releaseTime = new Date('2026-01-28T09:00:00').getTime();

function updateBonusVisibility() {
    const now = new Date().getTime();
    
    if (now < releaseTime) {
        // Если релиз еще не вышел - показываем бонусный баннер
        if (bonusBanner) bonusBanner.style.display = 'block';
    } else {
        // Если время вышло - удаляем его совсем
        if (bonusBanner) bonusBanner.remove();
    }
}

// Проверяем при загрузке
updateBonusVisibility();
// И проверяем каждую минуту (на случай если юзер зашел прямо перед релизом)
setInterval(updateBonusVisibility, 60000);


// --- ОБНОВЛЕНИЕ showAlbumDetails ДЛЯ БОНУСНОЙ ВЕРСИИ ---
// Найди старую функцию и убедись, что она обрабатывает новый ID:
const originalShowDetails = window.showAlbumDetails;
window.showAlbumDetails = function(albumId) {
    if (albumId === 'perya_bonus_ep') {
        const popup = document.getElementById('album-popup');
        popup.querySelector('h2').innerText = "ПЕРЬЯ НА АСФАЛЬТЕ (БОНУС-ИЗДАНИЕ)";
        popup.querySelector('.album-cover-glossy').src = "https://github.com/not88g/lebedi/raw/refs/heads/main/alt%20cover.png";
        
        // Список с 8-м треком
        const tracks = [
            "1. Без Слов", "2. Hello", "3. Смешно и Весело!", 
            "4. Фристайл", "5. Мертвые Мечты", "6. Ответ: Гудбай", 
            "7. Аутро", "8. стчпр!рем (EXCLUSIVE)"
        ];
        
        const listElem = popup.querySelector('.tracklist-web2 ol');
        listElem.innerHTML = tracks.map(t => `<li>${t}</li>`).join('');
        popup.style.display = 'block';
    } else {
        // Если ID не бонусный - запускаем стандартную логику
        // (Тут должен быть твой fetch из data.json, который мы писали ранее)
        fetch('data.json').then(r => r.json()).then(data => {
            const album = data.find(a => a.id === albumId);
            if (album) {
                const popup = document.getElementById('album-popup');
                popup.querySelector('h2').innerText = album.title;
                popup.querySelector('.album-cover-glossy').src = album.image;
                popup.querySelector('.tracklist-web2 ol').innerHTML = album.tracks.map(t => `<li>${t}</li>`).join('');
                popup.style.display = 'block';
            }
        });
    }
};



    // Загрузка
    fetch('data.json')
        .then(r => r.json())
        .then(data => {
            singlesContainer.innerHTML = '';
            epsContainer.innerHTML = '';
            data.forEach(item => {
                if (item.type === 'single') singlesContainer.appendChild(createCard(item));
                else epsContainer.appendChild(createCard(item));
            });
        });

});


