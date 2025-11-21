const monthYearElement = document.getElementById('monthYear');
const datesElement = document.getElementById('dates');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

const noteModal = document.getElementById('noteModal');
const noteDateDisplay = document.getElementById('noteDateDisplay');
const noteInput = document.getElementById('noteInput');
const saveNoteBtn = document.getElementById('saveNoteBtn');
const cancelNoteBtn = document.getElementById('cancelNoteBtn');

// === ССЫЛКИ НА ЭЛЕМЕНТЫ ВИДЖЕТА ЗАМЕТОК НА СЕГОДНЯ ===
const todayNotesWidget = document.getElementById('todayNotesWidget');
const todayDateWidget = document.getElementById('todayDateWidget');
const todayNotesList = document.getElementById('todayNotesList');

// === ССЫЛКИ НА ЭЛЕМЕНТЫ ОКНА ВЫБРАННОГО ДНЯ ===
const selectedDayNotes = document.getElementById('selectedDayNotes');
const selectedDateDisplay = document.getElementById('selectedDateDisplay');
const selectedNoteContent = document.getElementById('selectedNoteContent');
const editSelectedNoteBtn = document.getElementById('editSelectedNoteBtn');

// === ССЫЛКИ НА ГАМБУРГЕР МЕНЮ ===
const hamburgerBtn = document.getElementById('hamburgerBtn');
const hamburgerContent = document.getElementById('hamburgerContent');
const menuLink1 = document.getElementById('menuLink1');
const menuLink3 = document.getElementById('menuLink3');
const menuLink4 = document.getElementById('menuLink4');

const nahida = document.getElementById('nahida');
let currentDate = new Date();
let notes = []; 
let currentEditingDate = null;
let currentlySelectedDate = null;

const myAudio1 = new Audio('/audio(2).mp3');
const myAudio2 = new Audio('/audio(3).mp3');
const myAudio3 = new Audio('/audio(4).mp3');
const myAudio4 = new Audio('/audio(5).mp3');
const myAudio5 = new Audio('/audio(6).mp3');

function loadNotes() {
    const savedNotes = localStorage.getItem('calendarNotes');
    if (savedNotes) {
        try {
            notes = JSON.parse(savedNotes);
        } catch (e) {
            console.error("Ошибка при парсинге заметок из localStorage:", e);
            notes = [];
        }
    }
}

function saveNotes() {
    localStorage.setItem('calendarNotes', JSON.stringify(notes));
}

function formatDateToISO(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const updateCalendar = () => {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const totalDays = lastDayOfMonth.getDate();
    const firstDayIndex = (firstDayOfMonth.getDay() + 6) % 7;
    const lastDayIndex = (lastDayOfMonth.getDay() + 6) % 7;

    const monthYearString = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    monthYearElement.textContent = monthYearString;

    let datesHTML = '';

    for (let i = firstDayIndex; i > 0; i--) {
        const prevDate = new Date(currentYear, currentMonth, 1 - i);
        const formattedPrevDate = formatDateToISO(prevDate);
        datesHTML += `<div class="date inactive" data-date="${formattedPrevDate}">${prevDate.getDate()}</div>`;
    }

    for (let i = 1; i <= totalDays; i++) {
        const date = new Date(currentYear, currentMonth, i);
        const formattedDate = formatDateToISO(date);

        const todayClass = date.toDateString() === new Date().toDateString() ? 'active' : '';
        const hasNoteClass = notes.some(note => note.date === formattedDate) ? 'has-note' : '';

        datesHTML += `<div class="date ${todayClass} ${hasNoteClass}" data-date="${formattedDate}">${i}</div>`;
    }

    for (let i = 1; i <= 6 - lastDayIndex; i++) {
        const nextDate = new Date(currentYear, currentMonth + 1, i);
        const formattedNextDate = formatDateToISO(nextDate);
        datesHTML += `<div class="date inactive" data-date="${formattedNextDate}">${nextDate.getDate()}</div>`;
    }

    datesElement.innerHTML = datesHTML;

    // Обновляем виджет заметок после обновления календаря
    updateTodayNotesWidget();
};

// Функция для обновления виджета заметок на сегодня
const updateTodayNotesWidget = () => {
    const today = new Date();
    const formattedToday = formatDateToISO(today);

    // Отображаем сегодняшнюю дату в заголовке виджета
    todayDateWidget.textContent = today.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

    const todayNotes = notes.filter(note => note.date === formattedToday);

    todayNotesList.innerHTML = ''; // Очищаем список перед обновлением

    if (todayNotes.length > 0) {
        todayNotesList.classList.remove('no-notes'); // Удаляем класс, если заметки есть
        todayNotes.forEach(note => {
            const li = document.createElement('li');
            li.textContent = note.note;
            todayNotesList.appendChild(li);
        });
    } else {
        todayNotesList.classList.add('no-notes'); // Добавляем класс, если заметок нет
        const li = document.createElement('li');
        li.textContent = 'На сегодня дел нет! Выходной!';
        todayNotesList.appendChild(li);
    }
};

// Функция для обновления окна заметок выбранного дня
function updateSelectedDayNotes(fullDate) {
    if (!selectedDateDisplay || !selectedNoteContent || !editSelectedNoteBtn) {
        console.error('Элементы окна заметок не найдены');
        return;
    }

    currentlySelectedDate = fullDate;
    const date = new Date(fullDate);
    const formattedDate = date.toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'long',
        year: 'numeric'
    });
    
    selectedDateDisplay.textContent = formattedDate;
    
    const existingNote = notes.find(note => note.date === fullDate);
    
    if (existingNote && existingNote.note.trim() !== '') {
        selectedNoteContent.innerHTML = `<p>${existingNote.note}</p>`;
        editSelectedNoteBtn.style.display = 'block';
    } else {
        selectedNoteContent.innerHTML = '<p>На этот день заметок нет</p>';
        editSelectedNoteBtn.style.display = 'block';
    }
}

// Функция для открытия модального окна редактирования
function openNoteEditor(fullDate) {
    const existingNote = notes.find(note => note.date === fullDate);
    let initialNoteText = existingNote ? existingNote.note : '';
    
    noteDateDisplay.textContent = `Заметка для: ${fullDate}`;
    noteInput.value = initialNoteText;
    currentEditingDate = fullDate;
    
    noteModal.style.display = 'flex';
    noteInput.focus();
}

// Обработчик клика по датам - только обновляет окно заметок (ИСПРАВЛЕННЫЙ)
datesElement.addEventListener('click', (event) => {
    const clickedDateElement = event.target.closest('.date');
    
    if (clickedDateElement && !clickedDateElement.classList.contains('inactive')) {
        const fullDate = clickedDateElement.dataset.date;
        updateSelectedDayNotes(fullDate);
    }
});

// Обработчик кнопки редактирования в окне выбранного дня
editSelectedNoteBtn.addEventListener('click', () => {
    if (currentlySelectedDate) {
        openNoteEditor(currentlySelectedDate);
    }
});

// Обработчик сохранения заметки
saveNoteBtn.addEventListener('click', async () => {
    const userNote = noteInput.value.trim();
    const fullDate = currentEditingDate;

    if (!fullDate) {
        console.error('Не выбрана дата для сохранения заметки');
        return;
    }

    const existingNoteIndex = notes.findIndex(note => note.date === fullDate);

    if (userNote === '') {
        if (existingNoteIndex !== -1) {
            notes.splice(existingNoteIndex, 1);
        }
    } else {
        if (existingNoteIndex !== -1) {
            notes[existingNoteIndex].note = userNote;
        } else {
            notes.push({ date: fullDate, note: userNote });
        }
    }

    saveNotes();noteModal.style.display = 'none';
    console.log('Текущие заметки:', notes);
    
    // Синхронизируем с сервером если пользователь авторизован
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        console.log('Синхронизация заметок с сервером...');
        const success = await saveUserNotesToGitHub(currentUser, notes);
        if (success) {
            console.log('Заметки успешно синхронизированы с сервером');
        } else {
            console.error('Ошибка синхронизации с сервером');
            alert('Заметка сохранена локально, но не синхронизирована с сервером');
        }
    } else {
        console.log('Пользователь не авторизован, заметка сохранена только локально');
    }
    
    updateCalendar();
    
    // Обновляем окно заметок, если редактировали текущую выбранную дату
    if (currentlySelectedDate === fullDate && selectedNoteContent) {
        updateSelectedDayNotes(fullDate);
    }

    noteModal.style.display = 'none';
    noteInput.value = '';
    currentEditingDate = null;
});

// Обработчик отмены редактирования
cancelNoteBtn.addEventListener('click', () => {
    noteModal.style.display = 'none';
    noteInput.value = '';
    currentEditingDate = null;
});

// Обработчики кнопок навигации
prevBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
});

nextBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
});

// Обработчик клика по Нахиде
nahida.addEventListener('click', () => {
    const randomAudio = Math.floor((Math.random() * 5) + 1);
    if (randomAudio === 1) myAudio1.play();
    else if (randomAudio === 2) myAudio2.play();
    else if (randomAudio === 3) myAudio3.play();
    else if (randomAudio === 4) myAudio4.play();
    else if (randomAudio === 5) myAudio5.play();
    
    updateCalendar();
});

// Обработчики для гамбургер меню
hamburgerBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    hamburgerContent.classList.toggle('show');
});

// Закрытие меню при клике вне его
document.addEventListener('click', (event) => {
    if (!hamburgerContent.contains(event.target) && !hamburgerBtn.contains(event.target)) {
        hamburgerContent.classList.remove('show');
    }
});
authBtn.addEventListener('click', (event) => {
if (auth.style.display == 'flex'){auth.style.display = 'none';}else {auth.style.display = 'flex';}});
cross.addEventListener('click', (event) => {
    auth.style.display = 'none';
});
menuLink3.addEventListener('click', (event) => {
    event.preventDefault();
    Projectshadow.style.display = 'flex';
});
CloseProjectshadow.addEventListener('click', (event) => {
    event.preventDefault();
    Projectshadow.style.display = 'none';
    noteInput.focus();
    hamburgerContent.classList.remove('show');
});
// === GitHub API функции ===
const GITHUB_TOKEN = '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'; // Нужно будет создать Personal Access Token
const GITHUB_USERNAME = 'vikvita333-art';
const REPO_NAME = 'akasha-calendar-data';
const DATA_FILE = 'users-data.json';

// Функция для создания/обновления файла на GitHub
// Функция для создания/обновления файла на GitHub
async function updateGitHubFile(content, message) {
    try {
        let sha = null;
        
        // Пытаемся получить информацию о существующем файле
        try {
            const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${DATA_FILE}`);
            if (response.ok) {
                const data = await response.json();
                sha = data.sha;
            }
        } catch (e) {
            // Файл не существует, это нормально
            console.log('Файл не существует, будет создан новый');
        }

        // Кодируем содержимое в base64
        const contentString = JSON.stringify(content, null, 2);
        const encodedContent = btoa(unescape(encodeURIComponent(contentString)));
        
        const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${DATA_FILE}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                content: encodedContent,
                sha: sha
            })
        });

        if (response.ok) {
            console.log('Файл успешно обновлен на GitHub');
            return true;
        } else {
            const errorData = await response.json();
            console.error('Ошибка GitHub API:', errorData);
            return false;
        }
    } catch (error) {
        console.error('Ошибка при обновлении файла на GitHub:', error);
        return false;
    }
}

// Функция для получения данных с GitHub
async function getGitHubData() {
    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${DATA_FILE}`);
        if (response.ok) {
            const data = await response.json();
            const content = JSON.parse(decodeURIComponent(escape(atob(data.content))));
            return content;
        } else if (response.status === 404) {
            // Файл не существует - это нормально для нового репозитория
            console.log('Файл данных не найден, будет создан новый');
            return { users: [] };
        }
        return null;
    } catch (error) {
        console.error('Ошибка при получении данных с GitHub:', error);
        return null;
    }
}

// Функция для поиска пользователя в данных GitHub
async function findUserInGitHub(username, password) {
    const gitHubData = await getGitHubData();
    if (gitHubData && gitHubData.users) {
        const user = gitHubData.users.find(user => user.username === username);
        if (user) {
            // Проверяем пароль только если пользователь найден
            return user.password === password ? user : null;
        }
    }
    return null;
}

// Функция для регистрации нового пользователя
async function registerUserInGitHub(username, password) {
    let gitHubData = await getGitHubData();
    
    // Если не удалось получить данные, создаем новую структуру
    if (!gitHubData) {
        gitHubData = { users: [] };
    }
    
    // Проверяем, нет ли уже такого пользователя
    if (gitHubData.users.find(user => user.username === username)) {
        return false;
    }
    
    // Добавляем нового пользователя
    gitHubData.users.push({
        username: username,
        password: password,
        notes: []
    });
    
    const success = await updateGitHubFile(gitHubData, `Register new user: ${username}`);
    
    if (success) {
        console.log('Пользователь успешно зарегистрирован');
        return true;
    } else {
        console.error('Ошибка при сохранении на GitHub');
        return false;
    }
}

// Функция для сохранения заметок пользователя на GitHub
// Функция для сохранения заметок пользователя на GitHub
async function saveUserNotesToGitHub(username, userNotes) {
    try {
        const gitHubData = await getGitHubData() || { users: [] };
        
        const userIndex = gitHubData.users.findIndex(user => user.username === username);
        if (userIndex !== -1) {
            gitHubData.users[userIndex].notes = userNotes;
            const success = await updateGitHubFile(gitHubData, `Update notes for user: ${username}`);
            
            if (success) {
                console.log(`Заметки пользователя ${username} сохранены на GitHub`);
                return true;
            } else {
                console.error(`Ошибка сохранения заметок пользователя ${username} на GitHub`);
                return false;
            }
        } else {
            console.error(`Пользователь ${username} не найден в данных GitHub`);
            return false;
        }
    } catch (error) {
        console.error('Ошибка при сохранении заметок на GitHub:', error);
        return false;
    }
}

// Функция для автоматической синхронизации при изменении данных
async function autoSyncWithServer() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser && notes.length > 0) {
        console.log('Автоматическая синхронизация заметок с сервером...');
        const success = await saveUserNotesToGitHub(currentUser, notes);
        if (success) {
            console.log('Автоматическая синхронизация завершена');
        } else {
            console.warn('Автоматическая синхронизация не удалась');
        }
    }
}

// Вызывай эту функцию при загрузке и после изменений
// Функция для получения заметок пользователя с GitHub
async function getUserNotesFromGitHub(username) {
    const gitHubData = await getGitHubData();
    if (gitHubData && gitHubData.users) {
        const user = gitHubData.users.find(user => user.username === username);
        return user ? user.notes : [];
    }
    return [];
}

// Функция для синхронизации локальных заметок с GitHub
async function syncLocalNotesWithGitHub(username) {
    try {
        const localNotes = JSON.parse(localStorage.getItem('calendarNotes') || '[]');
        const gitHubNotes = await getUserNotesFromGitHub(username);
        
        console.log('Локальные заметки:', localNotes);
        console.log('Заметки с GitHub:', gitHubNotes);
        
        // Объединяем заметки (приоритет у более новых локальных)
        const mergedNotes = [...gitHubNotes];
        
        localNotes.forEach(localNote => {
            const existingIndex = mergedNotes.findIndex(gitNote => gitNote.date === localNote.date);
            if (existingIndex !== -1) {
                // Если локальная заметка существует, заменяем
                mergedNotes[existingIndex] = localNote;
            } else {
                // Добавляем новую заметку
                mergedNotes.push(localNote);
            }
        });
        
        // Сохраняем объединенные заметки на GitHub
        const saveSuccess = await saveUserNotesToGitHub(username, mergedNotes);
        
        if (saveSuccess) {
            // Обновляем локальные данные
            localStorage.setItem('calendarNotes', JSON.stringify(mergedNotes));
            notes = mergedNotes;
            console.log('Синхронизация завершена. Объединенные заметки:', mergedNotes);
            return mergedNotes;
        } else {
            console.error('Ошибка сохранения объединенных заметок на GitHub');
            return localNotes;
        }
    } catch (error) {
        console.error('Ошибка синхронизации:', error);
        return notes;
    }
}
// Обработчик ручной синхронизации
document.getElementById('syncBtn').addEventListener('click', async (event) => {
    event.preventDefault();
    
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        alert('Синхронизация...');
        await syncLocalNotesWithGitHub(currentUser);
        updateCalendar();
        alert('Синхронизация завершена');
    } else {
        alert('Для синхронизации необходимо войти в систему');
    }
    hamburgerContent.classList.remove('show');
});
// Обработчик отправки формы авторизации/регистрации
document.querySelector('.auth-content form').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        alert('Пожалуйста, заполните все поля');
        return;
    }
    
    console.log('Попытка входа для пользователя:', username);
    
    // Пытаемся найти пользователя
    const user = await findUserInGitHub(username, password);
    
    if (user) {
        // Вход успешен
        console.log('Вход успешен для пользователя:', username);
        alert(`Добро пожаловать, ${username}!`);
        localStorage.setItem('currentUser', username);
        
        // Синхронизируем заметки
        await syncLocalNotesWithGitHub(username);
        
        auth.style.display = 'none';
        updateCalendar();
    } else {
        console.log('Пользователь не найден, предлагаем регистрацию');
        
        // Проверяем, есть ли пользователь с таким именем (но другим паролем)
        const gitHubData = await getGitHubData();
        const usernameExists = gitHubData && gitHubData.users.find(user => user.username === username);
        
        if (usernameExists) {
            alert('Неверный пароль!');
        } else {
            // Пользователь не найден - предлагаем регистрацию
            const register = confirm('Пользователь не найден. Хотите зарегистрироваться?');
            if (register) {
                console.log('Начинаем регистрацию пользователя:', username);
                const success = await registerUserInGitHub(username, password);
                if (success) {
                    alert('Регистрация успешна! Теперь вы можете войти.');
                    localStorage.setItem('currentUser', username);
                    
                    // Синхронизируем локальные заметки с новым аккаунтом
                    await syncLocalNotesWithGitHub(username);
                    
                    auth.style.display = 'none';
                    updateCalendar();
                } else {
                    alert('Ошибка регистрации. Проверьте консоль для подробностей.');
                }
            }
        }
    }
});
// Обработчик выхода
document.getElementById('logoutBtn').addEventListener('click', (event) => {
    event.preventDefault();
    localStorage.removeItem('currentUser');
    alert('Вы вышли из системы');
    hamburgerContent.classList.remove('show');
});
// Функция для проверки авторизации и синхронизации при загрузке
async function checkAuthAndSync() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        // Пользователь авторизован - синхронизируем данные
        await syncLocalNotesWithGitHub(currentUser);
        console.log('Данные синхронизированы с GitHub');
    }
}

// Функция для проверки подключения к GitHub
async function testGitHubConnection() {
    console.log('Тестирование подключения к GitHub...');
    console.log('Username:', GITHUB_USERNAME);
    console.log('Repo:', REPO_NAME);
    
    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}`);
        if (response.ok) {
            console.log('✅ Репозиторий доступен');
            const data = await getGitHubData();
            console.log('Данные из репозитория:', data);
        } else {
            console.error('❌ Репозиторий не доступен:', response.status);
        }
    } catch (error) {
        console.error('❌ Ошибка подключения:', error);
    }
}
// В конце файла добавь
console.log('Все элементы загружены:');
console.log('- monthYearElement:', monthYearElement);
console.log('- datesElement:', datesElement);
console.log('- selectedDayNotes:', selectedDayNotes);
console.log('- noteModal:', noteModal);
console.log('- todayNotesWidget:', todayNotesWidget);
console.log('- editSelectedNoteBtn:', editSelectedNoteBtn);

// Проверь загрузку заметок
console.log('Загруженные заметки:', notes);
// Вызови эту функцию при загрузке для отладки
testGitHubConnection();
loadNotes();
updateCalendar();
updateSelectedDayNotes(formatDateToISO(new Date()));
checkAuthAndSync(); // Добавь этот вызов

