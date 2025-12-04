const monthYearElement = document.getElementById('monthYear');
const datesElement = document.getElementById('dates');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

const noteModal = document.getElementById('noteModal');
const noteDateDisplay = document.getElementById('noteDateDisplay');
const noteInput = document.getElementById('noteInput');
const saveNoteBtn = document.getElementById('saveNoteBtn');
const cancelNoteBtn = document.getElementById('cancelNoteBtn');

// Ссылки на элементы виджета заметок на сегодня
const todayNotesWidget = document.getElementById('todayNotesWidget');
const todayDateWidget = document.getElementById('todayDateWidget');
const todayNotesList = document.getElementById('todayNotesList');

// Ссылки на элементы окна выбранного дня
const selectedDayNotes = document.getElementById('selectedDayNotes');
const selectedDateDisplay = document.getElementById('selectedDateDisplay');
const selectedNoteContent = document.getElementById('selectedNoteContent');
const editSelectedNoteBtn = document.getElementById('editSelectedNoteBtn');

// Ссылки на гамбургер меню
const hamburgerBtn = document.getElementById('hamburgerBtn');
const hamburgerContent = document.getElementById('hamburgerContent');

const nahida = document.getElementById('nahida');
let currentDate = new Date();
let notes = []; 
let currentEditingDate = null;
let currentlySelectedDate = null;

// === ЛОКАЛЬНЫЕ ФУНКЦИИ ===
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

    const monthYearString = currentDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
    monthYearElement.textContent = monthYearString.charAt(0).toUpperCase() + monthYearString.slice(1);

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
    
    if (todayNotesWidget) {
        updateTodayNotesWidget();
    }
};

// Функция для обновления виджета заметок на сегодня
const updateTodayNotesWidget = () => {
    if (!todayDateWidget || !todayNotesList) {
        console.warn('Элементы виджета сегодняшних заметок не найдены');
        return;
    }
    
    const today = new Date();
    const formattedToday = formatDateToISO(today);

    todayDateWidget.textContent = today.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

    const todayNotes = notes.filter(note => note.date === formattedToday);

    todayNotesList.innerHTML = '';

    if (todayNotes.length > 0) {
        todayNotesList.classList.remove('no-notes');
        todayNotes.forEach(note => {
            const li = document.createElement('li');
            li.textContent = note.note;
            todayNotesList.appendChild(li);
        });
    } else {
        todayNotesList.classList.add('no-notes');
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

// === ОБРАБОТЧИКИ СОБЫТИЙ ===

// Обработчик клика по датам
datesElement.addEventListener('click', (event) => {
    const clickedDateElement = event.target.closest('.date');
    
    if (clickedDateElement && !clickedDateElement.classList.contains('inactive')) {
        const fullDate = clickedDateElement.dataset.date;
        updateSelectedDayNotes(fullDate);
    }
});

// Обработчик кнопки редактирования в окне выбранного дня
if (editSelectedNoteBtn) {
    editSelectedNoteBtn.addEventListener('click', () => {
        if (currentlySelectedDate) {
            openNoteEditor(currentlySelectedDate);
        }
    });
}

// Обработчик сохранения заметки
saveNoteBtn.addEventListener('click', () => {
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

    saveNotes();
    
    updateCalendar();
    
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

// Обработчики для гамбургер меню
if (hamburgerBtn && hamburgerContent) {
    hamburgerBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        hamburgerContent.classList.toggle('show');
    });

    document.addEventListener('click', (event) => {
        if (hamburgerContent && hamburgerBtn && 
            !hamburgerContent.contains(event.target) && 
            !hamburgerBtn.contains(event.target)) {
            hamburgerContent.classList.remove('show');
        }
    });
}

// Обработчики для окон проекта
const projectShadow = document.getElementById('Projectshadow');
const closeProjectBtn = document.getElementById('CloseProjectshadow');
const menuLink3 = document.getElementById('menuLink3');

if (menuLink3 && projectShadow && closeProjectBtn) {
    menuLink3.addEventListener('click', (e) => {
        e.preventDefault();
        projectShadow.style.display = 'flex';
    });
    
    closeProjectBtn.addEventListener('click', () => {
        projectShadow.style.display = 'none';
    });
    
    projectShadow.addEventListener('click', (e) => {
        if (e.target === projectShadow) {
            projectShadow.style.display = 'none';
        }
    });
}

// Упрощенные функции для Google API (только для отображения)
function updateAuthUI() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const syncBtn = document.getElementById('syncBtn');
    
    // Показываем сообщение, что функция доступна только онлайн
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.location.protocol === 'file:') {
                alert('Вход через Google доступен только при размещении на HTTPS сервере (не локально)');
            } else {
                alert('Для работы Google API необходимо настроить OAuth 2.0 клиент');
            }
        });
    }
    
    // Скрываем кнопки синхронизации и выхода
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (syncBtn) syncBtn.style.display = 'none';
}

// === ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ===
function initApp() {
    console.log('Инициализация приложения в локальном режиме...');
    
    // Загружаем заметки
    loadNotes();
    
    // Обновляем UI авторизации
    updateAuthUI();
    
    // Обновляем календарь
    updateCalendar();
    updateSelectedDayNotes(formatDateToISO(new Date()));
    
    console.log('Приложение инициализировано');
}

// === НАЧАЛЬНАЯ ЗАГРУЗКА ===
console.log('Загрузка приложения...');

// Работаем только в локальном режиме (без Google API)
initApp();
