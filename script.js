// Инициализация базы данных в localStorage, если она пуста
if (!localStorage.getItem('videos')) {
    localStorage.setItem('videos', JSON.stringify([
        {
            id: 1,
            title: "Рик Ролл (Тестовое YouTube видео)",
            url: "dQw4w9WgXcQ", // ID YouTube видео
            desc: "Это классическое тестовое видео для проверки работы плеера.",
            comments: [{ user: "User1", text: "Ого, это же классика!", isOwner: false }]
        }
    ]));
}

let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let currentVideoId = null;

// Элементы DOM
const videoGrid = document.getElementById('videoGrid');
const authBlock = document.getElementById('authBlock');
const authModal = document.getElementById('authModal');
const commentForm = document.getElementById('commentForm');
const commentAuthWarning = document.getElementById('commentAuthWarning');

// При старте страницы
document.addEventListener("DOMContentLoaded", () => {
    updateAuthUI();
    renderVideos();
    
    // Слушатели событий поиска
    document.getElementById('searchBtn').addEventListener('click', handleSearch);
    document.getElementById('searchInput').addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
});

// Навигация между страницами
function showSection(sectionId) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden');
    if(sectionId === 'main-page') renderVideos();
}

// Управление авторизацией
function updateAuthUI() {
    if (currentUser) {
        let nameHTML = currentUser.isOwner 
            ? `<span class="owner-nickname">Admin <span class="owner-tag">Владелец</span></span>`
            : `<span>${currentUser.name}</span>`;
            
        authBlock.innerHTML = `${nameHTML} <button onclick="logout()" class="btn" style="background:#333; margin-left:10px;">Выйти</button>`;
        commentForm.classList.remove('hidden');
        commentAuthWarning.classList.add('hidden');
        
        if (currentUser.isOwner) {
            document.getElementById('adminPanelBtn').classList.remove('hidden');
        } else {
            document.getElementById('adminPanelBtn').classList.add('hidden');
        }
    } else {
        authBlock.innerHTML = `<button onclick="openAuthModal()" class="btn">Войти</button>`;
        commentForm.classList.add('hidden');
        commentAuthWarning.classList.remove('hidden');
        document.getElementById('adminPanelBtn').classList.add('hidden');
    }
}

function openAuthModal() { authModal.classList.remove('hidden'); }
function closeAuthModal() { authModal.classList.add('hidden'); }

document.getElementById('modalForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('usernameInput').value.trim();
    if (!name) return;

    // Проверка на Владельца
    if (name.toLowerCase() === 'admin') {
        currentUser = { name: 'Admin', isOwner: true };
    } else {
        currentUser = { name: name, isOwner: false };
    }

    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateAuthUI();
    closeAuthModal();
    // Перерисовать комментарии, если мы внутри видео
    if(currentVideoId) watchVideo(currentVideoId); 
});

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateAuthUI();
    showSection('main-page');
}

// Отображение видео на главной
function renderVideos(searchQuery = "") {
    const videos = JSON.parse(localStorage.getItem('videos'));
    videoGrid.innerHTML = "";
    
    const filtered = videos.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filtered.length === 0) {
        videoGrid.innerHTML = "<p>Видео не найдены.</p>";
        return;
    }

    filtered.forEach(video => {
        const item = document.createElement('div');
        item.className = 'video-item';
        item.onclick = () => watchVideo(video.id);
        item.innerHTML = `
            <div class="thumbnail-placeholder">🎬</div>
            <div class="video-info">
                <h3>${video.title}</h3>
                <small style="color:#aaa;">Смотреть ролик</small>
            </div>
        `;
        videoGrid.appendChild(item);
    });
}

// Поиск
function handleSearch() {
    const query = document.getElementById('searchInput').value;
    document.getElementById('pageTitle').textContent = query ? `Результаты поиска: "${query}"` : "Рекомендации";
    showSection('main-page');
    renderVideos(query);
}

// Просмотр конкретного видео
function watchVideo(id) {
    currentVideoId = id;
    const videos = JSON.parse(localStorage.getItem('videos'));
    const video = videos.find(v => v.id === id);
    if (!video) return;

    showSection('watch-page');
    document.getElementById('watchTitle').textContent = video.title;
    document.getElementById('watchDesc').textContent = video.desc;
    
    // Оформление автора (всегда Владелец)
    document.getElementById('watchAuthor').innerHTML = `Автор: <span class="owner-nickname">Admin <span class="owner-tag">Владелец</span></span>`;

    // Рендер Плеера (YouTube iframe или обычный HTML5 тег)
    const playerWrapper = document.getElementById('videoPlayerWrapper');
    if (video.url.length === 11 || !video.url.includes('.')) {
        // Если это ID YouTube
        playerWrapper.innerHTML = `<iframe src="https://youtube.com{video.url}" allowfullscreen></iframe>`;
    } else {
        // Если это прямая ссылка mp4
        playerWrapper.innerHTML = `<video src="${video.url}" controls></video>`;
    }

    // Отрендерить комментарии
    renderComments(video.comments);
}

// Комментарии
function renderComments(comments) {
    document.getElementById('commentsCount').textContent = comments.length;
    const list = document.getElementById('commentsList');
    list.innerHTML = "";

    comments.forEach(c => {
        const div = document.createElement('div');
        div.className = 'comment-node';
        
        let userHTML = c.isOwner 
            ? `<span class="owner-nickname">Admin <span class="owner-tag">Владелец</span></span>`
            : `<span>${c.user}</span>`;

        div.innerHTML = `
            <div class="comment-user">${userHTML}</div>
            <div class="comment-text">${c.text}</div>
        `;
        list.appendChild(div);
    });
}

// Отправка нового комментария
commentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentUser || !currentVideoId) return;

    const text = document.getElementById('commentInput').value.trim();
    if (!text) return;

    const videos = JSON.parse(localStorage.getItem('videos'));
    const videoIndex = videos.findIndex(v => v.id === currentVideoId);
    
    if (videoIndex !== -1) {
        videos[videoIndex].comments.push({
            user: currentUser.name,
            text: text,
            isOwner: currentUser.isOwner
        });
        localStorage.setItem('videos', JSON.stringify(videos));
        document.getElementById('commentInput').value = "";
        renderComments(videos[videoIndex].comments);
    }
});

// Добавление нового видео (Только для Владельца)
document.getElementById('addVideoForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentUser || !currentUser.isOwner) {
        alert("Доступ запрещен!");
        return;
    }

    const title = document.getElementById('videoTitleInput').value.trim();
    const url = document.getElementById('videoUrlInput').value.trim();
    const desc = document.getElementById('videoDescInput').value.trim();

    const videos = JSON.parse(localStorage.getItem('videos'));
    const newVideo = {
        id: Date.now(), // генерация ID
        title: title,
        url: url,
        desc: desc,
        comments: []
    };

    videos.push(newVideo);
    localStorage.setItem('videos', JSON.stringify(videos));
    
    // Сброс формы и возврат
    e.target.reset();
    showSection('main-page');
});
