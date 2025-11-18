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

// Обработчик клика по датам - только обновляет окно заметок
datesElement.addEventListener('click', (event) => {
    const clickedDateElement = event.target.closest('.date:not(.inactive)');
    
    if (clickedDateElement) {
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
saveNoteBtn.addEventListener('click', () => {
    const userNote = noteInput.value.trim();
    const fullDate = currentEditingDate;

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
    console.log('Текущие заметки:', notes);
    updateCalendar();
    updateSelectedDayNotes(fullDate); // Обновляем окно заметок

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

// Инициализация при загрузке
loadNotes();
updateCalendar();

// Показываем заметки на сегодня при первой загрузке
updateSelectedDayNotes(formatDateToISO(new Date()));
