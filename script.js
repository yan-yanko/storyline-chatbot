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

function addMessage(sender, content) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.innerHTML = `
        <div class="message-content">
            ${content}
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function handleCategorySelect(category) {
    currentCategory = category;
    const categoryData = chatData.categories[category];
    
    if (!categoryData) {
        addMessage('bot', 'מצטער, אך הקטגוריה המבוקשת לא נמצאה.');
        return;
    }

    let content = `
        <div class="category-content">
            <h2>${categoryData.title}</h2>
            ${categoryData.description ? `<p class="description">${categoryData.description}</p>` : ''}
            <div class="options-container">
    `;

    categoryData.options.forEach(option => {
        content += `
            <div class="option">
                <h3>${option.title}</h3>
                <p class="highlight">${option.content}</p>
                ${option.details && option.details.length > 0 ? `
                    <ul>
                        ${option.details.map(detail => `<li>${detail}</li>`).join('')}
                    </ul>
                ` : ''}
            </div>
        `;
    });

    content += `
            </div>
        </div>
    `;

    addMessage('bot', content);
    
    // הוספת כפתור חזרה
    const controls = document.getElementById('chatControls');
    controls.innerHTML = `
        <div class="button-grid">
            <button class="secondary" onclick="handleBackToMain()">חזרה לתפריט הראשי</button>
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
    location.reload();
}

function handleBackToCategory() {
    handleCategorySelect(currentCategory);
}