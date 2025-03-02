let currentCategory = '';
let chatData;

// טעינת הנתונים מקובץ ה-JSON
async function loadChatData() {
    try {
        const response = await fetch('data.json');
        chatData = await response.json();
        console.log('נתונים נטענו בהצלחה:', chatData);
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

function handleCategorySelect(category) {
    currentCategory = category;
    const categoryData = chatData.categories[category];
    
    if (!categoryData) {
        addMessage('bot', 'מצטער, אך הקטגוריה המבוקשת לא נמצאה.');
        return;
    }

    // הוספת הודעת משתמש
    addMessage('user', `<p>אני מעוניין לשמוע על ${categoryData.title}</p>`, false);

    // הוספת תגובת הבוט
    let content = `
        <div class="category-content">
            <h2><i class="fas fa-lightbulb"></i> ${categoryData.title}</h2>
            ${categoryData.description ? `<p class="description">${categoryData.description}</p>` : ''}
            <div class="options-container">
    `;

    categoryData.options.forEach(option => {
        content += `
            <div class="option">
                <h3><i class="fas fa-star"></i> ${option.title}</h3>
                <p class="highlight">${option.content}</p>
                ${option.details && option.details.length > 0 ? `
                    <ul>
                        ${option.details.map(detail => `<li><i class="fas fa-check-circle"></i> ${detail}</li>`).join('')}
                    </ul>
                ` : ''}
            </div>
        `;
    });

    content += `
            </div>
            <p class="follow-up">האם תרצו לשמוע עוד על אחת מהאפשרויות הללו?</p>
        </div>
    `;

    addMessage('bot', content);
    
    // עדכון כפתורי הבחירה
    const controls = document.getElementById('chatControls');
    controls.innerHTML = `
        <div class="button-grid">
            <button class="secondary" onclick="handleBackToMain()">
                <i class="fas fa-arrow-right"></i> חזרה לתפריט הראשי
            </button>
        </div>
    `;
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
    addMessage('user', '<p>אני רוצה לחזור לתפריט הראשי</p>', false);
    setTimeout(() => {
        location.reload();
    }, 1000);
}

function handleBackToCategory() {
    handleCategorySelect(currentCategory);
}