let currentCategory = '';
let chatData;
let allOptions = [];
let userDetails = {};

// טעינת הנתונים מקובץ ה-JSON
async function loadChatData() {
    try {
        const response = await fetch('/catalog/data.json');
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

        // הצגת האפשרויות הראשיות בצ'אט
        showMainOptions();
    } catch (error) {
        console.error('שגיאה בטעינת הנתונים:', error);
        addMessage('bot', 'מצטער, אך אירעה שגיאה בטעינת הנתונים. אנא נסה שוב מאוחר יותר.');
    }
}

function showMainOptions() {
    let optionsMessage = '<p>הנה כל הנושאים שלדעתי יכולים להיות רלוונטיים לכם:</p>';
    optionsMessage += '<div class="options-container">';
    
    optionsMessage += `
        <div class="option main-category" onclick="handleCategorySelect('פיתוחי_מנהלים')">
            <div class="option-header">
                <h3><i class="fas fa-users-gear"></i> פיתוחי מנהלים</h3>
            </div>
        </div>
        <div class="option main-category" onclick="handleCategorySelect('ניהול_ממשקים_ושותפויות')">
            <div class="option-header">
                <h3><i class="fas fa-network-wired"></i> ניהול ממשקים ושותפויות</h3>
            </div>
        </div>
        <div class="option main-category" onclick="handleCategorySelect('מיומנויות_שירות_ומכירה')">
            <div class="option-header">
                <h3><i class="fas fa-headset"></i> מיומנויות שירות ומכירה</h3>
            </div>
        </div>
        <div class="option main-category" onclick="handleCategorySelect('תהליכים_ארגוניים')">
            <div class="option-header">
                <h3><i class="fas fa-sitemap"></i> תהליכים ארגוניים</h3>
            </div>
        </div>
        <div class="option main-category" onclick="handleCategorySelect('סדנאות_חד_פעמיות')">
            <div class="option-header">
                <h3><i class="fas fa-chalkboard-user"></i> סדנאות חד פעמיות</h3>
            </div>
        </div>
        <div class="option main-category" onclick="handleCategorySelect('הרצאות')">
            <div class="option-header">
                <h3><i class="fas fa-microphone"></i> הרצאות</h3>
            </div>
        </div>
    `;
    
    optionsMessage += '</div>';
    addMessage('bot', optionsMessage);
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
            <div class="message-avatar">
                <img src="/catalog/images/אייק.png" alt="HR Bot">
            </div>
            <div class="message-content typing">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        
        // המתנה של 1-2 שניות לפני הצגת התוכן
        setTimeout(() => {
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <img src="/catalog/images/אייק.png" alt="HR Bot">
                </div>
                <div class="message-content">
                    ${content}
                </div>
            `;
        }, Math.random() * 1000 + 1000);
    } else {
        messageDiv.innerHTML = `
            ${sender === 'bot' ? `
                <div class="message-avatar">
                    <img src="/catalog/images/אייק.png" alt="HR Bot">
                </div>
            ` : ''}
            <div class="message-content">
                ${content}
            </div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    
    // גלילה חלקה לתחתית הצ'אט
    setTimeout(() => {
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
}

function handleCategorySelect(categoryId) {
    currentCategory = categoryId;
    
    if (!chatData || !chatData.categories || !chatData.categories[categoryId]) {
        addMessage('user', `בחרתי ב${categoryId.replace(/_/g, ' ')}`);
        addMessage('bot', 'מצטער, אך הקטגוריה המבוקשת לא נמצאה.');
        return;
    }

    const category = chatData.categories[categoryId];
    addMessage('user', `בחרתי ב${category.title}`);
    
    let botMessage = `<p>מצוין! הנה האפשרויות בקטגוריית ${category.title}:</p>`;
    botMessage += '<div class="subcategories-container">';
    
    category.options.forEach((option, index) => {
        botMessage += `
            <div class="option subcategory collapsed" onclick="toggleOption(event, ${index})">
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
                    <button class="want-this-btn" onclick="event.stopPropagation(); handleWantThis('${option.title.replace(/'/g, "\\'")}')">אני רוצה את זה!</button>
                </div>
            </div>
        `;
    });
    
    botMessage += '</div>';
    addMessage('bot', botMessage);
    
    // גלילה חלקה לתחתית הצ'אט
    setTimeout(() => {
        const chatMessages = document.getElementById('chat-messages');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
}

function handleWantThis(optionTitle) {
    userDetails.selectedOption = optionTitle;
    addMessage('user', `אני רוצה את ${optionTitle}`);
    addMessage('bot', `מעולה! אני רואה שבחרת את ${optionTitle}. כדי שנוכל להרחיב אבקש כמה פרטים ואדאג שייצרו איתך קשר.`);
    setTimeout(() => askForName(), 1500);
}

function askForName() {
    addMessage('bot', `
        <p>מה שמך המלא?</p>
        <div class="input-container">
            <input type="text" id="fullName" placeholder="הקלד/י את שמך המלא" onkeypress="handleNameInput(event)">
        </div>
    `);
}

function handleNameInput(event) {
    if (event.key === 'Enter') {
        const fullName = document.getElementById('fullName').value.trim();
        if (fullName) {
            userDetails.fullName = fullName;
            addMessage('user', fullName);
            addMessage('bot', `נעים להכיר ${fullName}!`);
            setTimeout(() => askForEmail(), 1500);
        }
    }
}

function askForEmail() {
    addMessage('bot', `
        <p>מה המייל שלך?</p>
        <div class="input-container">
            <input type="email" id="email" placeholder="הקלד/י את כתובת המייל שלך" onkeypress="handleEmailInput(event)">
        </div>
    `);
}

function handleEmailInput(event) {
    if (event.key === 'Enter') {
        const email = document.getElementById('email').value.trim();
        if (email && email.includes('@')) {
            userDetails.email = email;
            addMessage('user', email);
            addMessage('bot', 'יופי!');
            setTimeout(() => askForPhone(), 1500);
        }
    }
}

function askForPhone() {
    addMessage('bot', `
        <p>איכפת לך שיצרו איתך קשר טלפוני?</p>
        <div class="yes-no-buttons">
            <button class="yes" onclick="handlePhonePermission(true)">אני רוצה</button>
            <button class="no" onclick="handlePhonePermission(false)">אני לא רוצה</button>
        </div>
    `);
}

function handlePhonePermission(wantsPhone) {
    userDetails.wantsPhone = wantsPhone;
    addMessage('user', wantsPhone ? 'אני רוצה' : 'אני לא רוצה');
    
    if (wantsPhone) {
        setTimeout(() => askForPhoneNumber(), 1500);
    } else {
        addMessage('bot', 'סבבה לגמרי. כבר דואג שיחזרו אלייך למייל.');
        // כאן אפשר להוסיף קוד לשליחת הפרטים לשרת
    }
}

function askForPhoneNumber() {
    addMessage('bot', `
        <p>מה הטלפון שבו אפשר לתפוס אותך?</p>
        <div class="input-container">
            <input type="tel" id="phone" placeholder="הקלד/י את מספר הטלפון שלך" onkeypress="handlePhoneInput(event)">
        </div>
    `);
}

function handlePhoneInput(event) {
    if (event.key === 'Enter') {
        const phone = document.getElementById('phone').value.trim();
        if (phone) {
            userDetails.phone = phone;
            addMessage('user', phone);
            addMessage('bot', 'מעולה! אדאג שיצרו איתך קשר בהקדם.');
            // כאן אפשר להוסיף קוד לשליחת הפרטים לשרת
        }
    }
}

function toggleOption(event, index) {
    event.stopPropagation();
    
    const options = document.querySelectorAll('.subcategory');
    const option = options[index];
    const content = option.querySelector('.option-content');
    const expandIcon = option.querySelector('.expand-icon');
    
    // סגירת כל האפשרויות האחרות
    options.forEach((opt) => {
        if (opt !== option && !opt.classList.contains('collapsed')) {
            opt.classList.add('collapsed');
            const otherContent = opt.querySelector('.option-content');
            const otherIcon = opt.querySelector('.expand-icon');
            if (otherContent) {
                otherContent.style.maxHeight = '0';
                otherContent.style.opacity = '0';
            }
            if (otherIcon) {
                otherIcon.style.transform = 'rotate(-90deg)';
            }
        }
    });
    
    // פתיחה או סגירה של האפשרות הנבחרת
    if (option.classList.contains('collapsed')) {
        // פתיחת האפשרות
        option.classList.remove('collapsed');
        if (content) {
            content.style.maxHeight = content.scrollHeight + 'px';
            content.style.opacity = '1';
            content.style.padding = '1rem 0.5rem';
        }
        if (expandIcon) {
            expandIcon.style.transform = 'rotate(0)';
        }
        
        // גלילה חלקה לאפשרות שנפתחה
        setTimeout(() => {
            option.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300);
    } else {
        // סגירת האפשרות
        option.classList.add('collapsed');
        if (content) {
            content.style.maxHeight = '0';
            content.style.opacity = '0';
            content.style.padding = '0';
        }
        if (expandIcon) {
            expandIcon.style.transform = 'rotate(-90deg)';
        }
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
    showMainOptions();
    
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

function restartChat() {
    // ניקוי כל ההודעות
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';
    
    // הצגת הודעת פתיחה מחדש
    showBotMessage("היי! אני אייק, עוזר אישי מבית +HR. אשמח לעזור לך למצוא את הפתרון המתאים עבורך.");
    setTimeout(() => {
        showMainOptions();
    }, 1000);
}

function sendContactDetails(fullName, email, phone, topic) {
    // יצירת תוכן המייל
    const emailBody = `היי,
${fullName} מתעניין ב${topic}

הנה הפרטים ליצור איתו קשר:
מייל: ${email}
${phone ? `טלפון: ${phone}` : ''}`;

    // שליחת המייל באמצעות EmailJS
    emailjs.send('default_service', 'template_default', {
        to_email: 'yan@hrplus.co.il',
        from_name: fullName,
        message: emailBody,
        reply_to: email
    })
    .then(
        function(response) {
            console.log("SUCCESS", response);
            showBotMessage("תודה רבה! הפרטים נשלחו בהצלחה. ניצור איתך קשר בהקדם.");
        },
        function(error) {
            console.log("FAILED", error);
            showBotMessage("מצטערים, הייתה בעיה בשליחת הפרטים. אנא נסה שוב מאוחר יותר או צור קשר ישירות במייל yan@hrplus.co.il");
        }
    );
}