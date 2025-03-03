let currentCategory = '';
let chatData;
let allOptions = [];

// טעינת הנתונים מקובץ ה-JSON
async function loadChatData() {
    try {
        const response = await fetch('data.json');
        chatData = await response.json();
        console.log('נתונים נטענו בהצלחה:', chatData);
        
        // יצירת מערך של כל האפשרויות לחיפוש
        Object.entries(chatData.categories).forEach(([categoryId, category]) => {
            category.options.forEach(option => {
                allOptions.push({
                    categoryId,
                    categoryTitle: category.title,
                    ...option
                });
            });
        });
    } catch (error) {
        console.error('שגיאה בטעינת הנתונים:', error);
        addMessage('bot', 'מצטער, אך אירעה שגיאה בטעינת הנתונים. אנא נסה שוב מאוחר יותר.');
    }
}

// פונקציה שמתבצעת בטעינת הדף
window.onload = async () => {
    await loadChatData();
};

function addMessage(sender, content, isTyping = true) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    if (isTyping && sender === 'bot') {
        // הוספת אנימציית הקלדה
        messageDiv.innerHTML = `
            <div class="message-content typing">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // המתנה של 1-2 שניות לפני הצגת התוכן
        setTimeout(() => {
            messageDiv.innerHTML = `
                <div class="message-content">
                    ${content}
                </div>
            `;
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, Math.random() * 1000 + 1000);
    } else {
        messageDiv.innerHTML = `
            <div class="message-content">
                ${content}
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

function handleCategorySelect(categoryId) {
    currentCategory = categoryId;
    
    // בדיקה אם הקטגוריה קיימת
    if (!chatData.categories[categoryId]) {
        addMessage('user', `בחרתי ב${categoryId.replace(/_/g, ' ')}`);
        addMessage('bot', 'מצטער, אך הקטגוריה המבוקשת לא נמצאה.');
        return;
    }

    const category = chatData.categories[categoryId];
    
    // הוספת הודעת משתמש
    addMessage('user', `בחרתי ב${category.title}`);
    
    // הוספת הודעת בוט עם האפשרויות
    let botMessage = `<p>מצוין! הנה האפשרויות בקטגוריית ${category.title}:</p>`;
    botMessage += '<div class="options-container">';
    
    category.options.forEach((option, index) => {
        botMessage += `
            <div class="option collapsed" onclick="toggleOption(event, ${index})">
                <div class="option-header">
                    <h3>
                        <i class="fas fa-star"></i>
                        ${option.title}
                    </h3>
                    <i class="fas fa-chevron-down expand-icon"></i>
                </div>
                <div class="option-content">
                    <p class="highlight">${option.content}</p>
                    ${option.details ? `
                        <ul>
                            ${option.details.map(detail => `
                                <li><i class="fas fa-check-circle"></i> ${detail}</li>
                            `).join('')}
                        </ul>
                    ` : ''}
                </div>
            </div>
        `;
    });
    
    botMessage += '</div>';
    botMessage += '<p class="follow-up">לחץ על כל אפשרות כדי לקרוא עוד פרטים</p>';
    
    addMessage('bot', botMessage);
    
    // הסתרת הכפתורים הראשיים
    document.getElementById('mainCategories').style.display = 'none';
    
    // הוספת כפתור חזרה
    const controls = document.getElementById('chatControls');
    controls.insertAdjacentHTML('beforeend', `
        <button class="secondary" onclick="handleBackToMain()">חזרה לתפריט הראשי</button>
    `);
}

function toggleOption(event, index) {
    event.stopPropagation(); // מונע בעיות של הפעלה כפולה
    
    const options = document.querySelectorAll('.option');
    const option = options[index];
    
    if (option.classList.contains('collapsed')) {
        // סגירת כל האפשרויות האחרות
        options.forEach((opt) => {
            if (opt !== option) {
                opt.classList.add('collapsed');
            }
        });
        // פתיחת האפשרות הנבחרת
        option.classList.remove('collapsed');
        
        // גלילה חלקה לאפשרות שנפתחה
        setTimeout(() => {
            option.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300);
    } else {
        // סגירת האפשרות
        option.classList.add('collapsed');
    }
}

function handleWorkshopSelect(workshopId) {
    const workshop = categoryContent[currentCategory].options.find(opt => opt.id === workshopId);
    
    // הוספת הודעות לצ'אט
    addMessage('user', `מעוניין במידע על ${workshop.title}`);
    addMessage('bot', detailedContent[workshopId] || 'מידע מפורט יתווסף בקרוב');
    
    // עדכון כפתורי הבחירה
    updateControls('workshop');
}

function updateControls(state, categoryId = '') {
    const controls = document.getElementById('chatControls');
    
    if (state === 'category') {
        const options = categoryContent[categoryId].options;
        controls.innerHTML = `
            <div class="button-grid">
                ${options.map(option => `
                    <button onclick="handleWorkshopSelect('${option.id}')">${option.title}</button>
                `).join('')}
            </div>
            <button class="secondary" onclick="handleBackToMain()">חזרה לתפריט הראשי</button>
        `;
    } else if (state === 'workshop') {
        controls.innerHTML = `
            <div class="button-grid">
                <button class="secondary" onclick="handleBackToCategory()">חזרה לרשימת הסדנאות</button>
                <button class="secondary" onclick="handleBackToMain()">חזרה לתפריט הראשי</button>
            </div>
        `;
    }
}

function handleBackToMain() {
    addMessage('user', 'חזרה לתפריט הראשי');
    
    // הצגת הכפתורים הראשיים מחדש
    document.getElementById('mainCategories').style.display = 'grid';
    
    // ניקוי כפתורי חזרה
    const controls = document.getElementById('chatControls');
    const backButtons = controls.querySelectorAll('button.secondary');
    backButtons.forEach(button => button.remove());
    
    // ניקוי תוצאות חיפוש אם יש
    const searchResults = document.querySelector('.search-results');
    if (searchResults) {
        searchResults.remove();
    }
    
    // ניקוי תיבת החיפוש
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }
}

function handleBackToCategory() {
    handleCategorySelect(currentCategory);
}

// פונקציית החיפוש
function handleSearch(query) {
    if (!query.trim()) {
        // אם החיפוש ריק, נציג את כל הקטגוריות
        document.getElementById('mainCategories').style.display = 'grid';
        // נסתיר את תוצאות החיפוש אם הן מוצגות
        const existingResults = document.querySelector('.search-results');
        if (existingResults) {
            existingResults.remove();
        }
        return;
    }

    // הסתרת הקטגוריות הראשיות
    document.getElementById('mainCategories').style.display = 'none';

    // חיפוש אפשרויות מתאימות
    const results = allOptions.filter(option => 
        option.title.includes(query) || 
        option.content.includes(query) ||
        (option.details && option.details.some(detail => detail.includes(query)))
    );

    // יצירת תצוגת תוצאות
    let resultsHtml = `
        <div class="search-results options-container">
            ${results.length > 0 ? results.map(option => `
                <div class="option collapsed" onclick="handleOptionClick(event, '${option.categoryId}', '${option.title}')">
                    <div class="option-header">
                        <h3>
                            <i class="fas fa-star"></i>
                            ${option.title}
                        </h3>
                        <span class="category-tag">${option.categoryTitle}</span>
                    </div>
                    <div class="option-content">
                        <p class="highlight">${option.content}</p>
                        ${option.details ? `
                            <ul>
                                ${option.details.map(detail => `
                                    <li><i class="fas fa-check-circle"></i> ${detail}</li>
                                `).join('')}
                            </ul>
                        ` : ''}
                    </div>
                </div>
            `).join('') : '<div class="no-results">לא נמצאו תוצאות לחיפוש זה</div>'}
        </div>
    `;

    // הצגת התוצאות
    const existingResults = document.querySelector('.search-results');
    if (existingResults) {
        existingResults.remove();
    }
    document.querySelector('.chat-controls').insertAdjacentHTML('afterbegin', resultsHtml);
}

function handleOptionClick(event, categoryId, optionTitle) {
    event.stopPropagation();
    const option = event.currentTarget;
    
    if (option.classList.contains('collapsed')) {
        // סגירת כל האפשרויות האחרות
        document.querySelectorAll('.option').forEach(opt => {
            if (opt !== option) opt.classList.add('collapsed');
        });
        option.classList.remove('collapsed');
    } else {
        option.classList.add('collapsed');
    }
}