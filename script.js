document.addEventListener('DOMContentLoaded', () => {
    // --- 1. ДЕТЕКТОР APPLE (ЧИНИТ ШРИФТЫ) ---
    const isApple = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                    (navigator.vendor && navigator.vendor.indexOf('Apple') > -1) ||
                    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (isApple) {
        document.documentElement.classList.add('is-safari');
        document.body.classList.add('is-safari');
        console.log("Apple device detected: Marker Felt activated.");
    }

    // --- 2. ТАЙМЕР ОБРАТНОГО ОТСЧЕТА ---
    const releaseDate = new Date('2026-01-28T09:00:00').getTime();
    const timerElem = document.getElementById("countdown");

    if (timerElem) {
        const timerInterval = setInterval(() => {
            const now = new Date().getTime();
            const distance = releaseDate - now;

            if (distance < 0) {
                clearInterval(timerInterval);
                timerElem.innerHTML = "РЕЛИЗ ВЫШЕЛ!";
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            timerElem.innerHTML = `${days}д ${hours}ч ${minutes}м ${seconds}с`;
        }, 1000);
    }

    // --- 3. ГЕНЕРАЦИЯ СЕТКИ РЕЛИЗОВ ИЗ DATA.JSON ---
    const singlesContainer = document.getElementById('singles-container');
    const epsContainer = document.getElementById('eps-container');
    const BOT_USERNAME = 'dvalebedya_bot';

    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            if (singlesContainer) singlesContainer.innerHTML = '';
            if (epsContainer) epsContainer.innerHTML = '';

            data.forEach(item => {
                // Пропускаем бонусную версию в общей сетке, чтобы не дублировать
                if (item.id === 'perya_bonus_ep') return;

                const card = document.createElement('div');
                card.className = 'release-card';
                
                let btn = item.price === 0 
                    ? `<a href="${item.file}" class="buy-btn" download style="background:linear-gradient(#fff,#ccc);color:#000">💾 СКАЧАТЬ (FREE)</a>`
                    : `<a href="https://t.me/${BOT_USERNAME}?start=buy_${item.id}" class="buy-btn" target="_blank">КУПИТЬ: ${item.price} ⭐</a>`;

                // Для EP добавляем клик для открытия подробностей
                const clickAction = item.type === 'ep' ? `onclick="showAlbumDetails('${item.id}')"` : '';

                card.innerHTML = `
                    <div ${clickAction} style="cursor: ${item.type === 'ep' ? 'pointer' : 'default'}">
                        <img src="${item.image}" alt="${item.title}" width="150" height="150">
                        <p><b>${item.title}</b></p>
                        <p style="font-size:11px">Дата: ${item.year}</p>
                    </div>
                    ${btn}
                `;
                
                if (item.type === 'single' && singlesContainer) singlesContainer.appendChild(card);
                else if (item.type === 'ep' && epsContainer) epsContainer.appendChild(card);
            });
        })
        .catch(err => console.error('Ошибка загрузки:', err));
});

// --- 4. ФУНКЦИЯ ОТКРЫТИЯ АЛЬБОМА (УПРОЩЕННАЯ) ---
window.showAlbumDetails = function(albumId) {
    fetch('data.json')
        .then(r => r.json())
        .then(data => {
            // Просто ищем ID в базе. 
            // Если передан 'perya_bonus_ep', он найдет запись с 8 треками и альт. обложкой.
            const album = data.find(a => a.id === albumId);
            if (!album) return;

            const popup = document.getElementById('album-popup');
            
            // Заполняем данными из JSON
            popup.querySelector('h2').innerText = album.title;
            popup.querySelector('.album-cover-glossy').src = album.image;
            popup.querySelector('.tracklist-web2 ol').innerHTML = album.tracks.map(t => `<li>${t}</li>`).join('');

            // Удаляем старую кнопку превью, если была
            const existingBtn = popup.querySelector('.preview-btn');
            if (existingBtn) existingBtn.remove();

            // Добавляем кнопку превью только для нужных альбомов
            if (albumId === 'perya_ep' || albumId === 'perya_bonus_ep') {
                const previewBtn = `
                    <button onclick="playPreview('https://github.com/not88g/lebedi/raw/refs/heads/main/music/aftercare.m4a')" 
                            class="preview-btn" style="margin-top:10px; width:100%;">
                        ▶ ПОСЛУШАТЬ ОТРЫВОК (0:40)
                    </button>`;
                popup.querySelector('.tracklist-web2').insertAdjacentHTML('beforeend', previewBtn);
            }

            popup.style.display = 'block';
        });
};

window.closeAlbumPage = function() {
    const p = document.getElementById('album-popup');
    if (p) {
        p.style.display = 'none';
        // Если музыка играла, останавливаем её при закрытии
        if (typeof previewAudio !== 'undefined') {
            previewAudio.pause();
            previewAudio.currentTime = 0;
        }
    }
};

// --- 5. АУДИО ПЛЕЕР (FADE IN/OUT) ---
let previewAudio = new Audio();

window.playPreview = function(url) {
    if (!previewAudio.paused) {
        previewAudio.pause();
    }

    previewAudio.src = url;
    previewAudio.currentTime = 40; // Старт с 40 сек
    previewAudio.volume = 0;       // Начало с тишины
    previewAudio.play();

    // Плавное нарастание громкости
    let fadeIn = setInterval(() => {
        if (previewAudio.volume < 0.9) {
            previewAudio.volume += 0.1;
        } else {
            clearInterval(fadeIn);
        }
    }, 150);

    // Таймер на выключение через 15 секунд
    setTimeout(() => {
        let fadeOut = setInterval(() => {
            if (previewAudio.volume > 0.1) {
                previewAudio.volume -= 0.1;
            } else {
                clearInterval(fadeOut);
                previewAudio.pause();
            }
        }, 150);
    }, 13500); // Начинаем затухать чуть раньше
};
