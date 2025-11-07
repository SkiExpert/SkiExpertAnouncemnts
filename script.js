// Conversation demo
const conversation = [
    {
        type: 'user',
        text: "I want to plan a ski trip to Colorado in January with my family"
    },
    {
        type: 'assistant',
        text: "That sounds exciting! I'd love to help you plan your Colorado ski trip. To find the perfect options, could you tell me a bit more about your group? How many people will be joining you?"
    },
    {
        type: 'user',
        text: "There will be 4 of us - me, my wife, and our 2 kids who are 8 and 10. We've never skied before!"
    },
    {
        type: 'assistant',
        text: "Perfect! A family ski trip is such a great experience. Since you're all beginners, I'll focus on family-friendly resorts with excellent lesson programs. Here are some wonderful options in Colorado:",
        hasCards: true
    },
    {
        type: 'user',
        text: "Keystone looks great! Tell me more about it"
    },
    {
        type: 'assistant',
        text: "Excellent choice! Keystone is one of the best resorts for families learning to ski. Here's a package I put together for you:",
        hasPackage: true
    },
    {
        type: 'user',
        text: "This is perfect! Let's book it"
    },
    {
        type: 'assistant',
        text: "Wonderful! I'm excited for your family's first ski adventure! To complete your booking, I'll need just a few details: your full name, email address, and phone number."
    }
];

function createMessage(message, index) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${message.type}`;
    messageDiv.style.animationDelay = `${index * 0.1}s`;
    
    const avatar = document.createElement('div');
    avatar.className = `message-avatar ${message.type}-avatar`;
    
    if (message.type === 'user') {
        avatar.textContent = 'You';
    } else {
        avatar.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" stroke-width="2"/>
            </svg>
        `;
    }
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const text = document.createElement('div');
    text.className = 'message-text';
    text.textContent = message.text;
    
    content.appendChild(text);
    
    // Add resort cards
    if (message.hasCards) {
        const cards = document.createElement('div');
        cards.className = 'resort-cards';
        cards.innerHTML = `
            <div class="resort-card">
                <h4>Keystone</h4>
                <p>Family-friendly</p>
                <p>3,148 acres</p>
                <p class="price">From $811/person</p>
            </div>
            <div class="resort-card">
                <h4>Breckenridge</h4>
                <p>Village charm</p>
                <p>2,908 acres</p>
                <p class="price">From $975/person</p>
            </div>
            <div class="resort-card">
                <h4>Copper Mountain</h4>
                <p>Great value</p>
                <p>2,490 acres</p>
                <p class="price">From $750/person</p>
            </div>
        `;
        content.appendChild(cards);
    }
    
    // Add package card
    if (message.hasPackage) {
        const packageCard = document.createElement('div');
        packageCard.className = 'package-card';
        packageCard.innerHTML = `
            <h4>Keystone Family Package</h4>
            <ul>
                <li>4 nights at River Run Village (1-bedroom condo)</li>
                <li>4-day lift tickets for 4 people</li>
                <li>2 days beginner ski lessons (kids & adults)</li>
                <li>Equipment rentals included</li>
            </ul>
            <p><strong>Dates:</strong> January 15-19, 2025</p>
            <div class="package-price">
                $3,245 total
                <div class="price-detail">$811.25 per person</div>
            </div>
        `;
        content.appendChild(packageCard);
    }
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    return messageDiv;
}

function loadConversation() {
    const chatMessages = document.getElementById('chatMessages');
    
    conversation.forEach((message, index) => {
        setTimeout(() => {
            const messageElement = createMessage(message, index);
            chatMessages.appendChild(messageElement);
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, index * 800);
    });
}

// Email form submission
document.getElementById('notifyForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('emailInput').value;
    
    // Here you would typically send the email to your backend
    // For now, we'll just show a success message
    
    const form = this;
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message show';
    successMessage.textContent = `✓ Thanks! We'll notify you at ${email} when SkiExpert launches.`;
    
    form.reset();
    form.parentElement.appendChild(successMessage);
    
    setTimeout(() => {
        successMessage.remove();
    }, 5000);
});

// Start the conversation demo when the page loads
window.addEventListener('load', function() {
    // Check if the chat messages element is visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadConversation();
                observer.disconnect();
            }
        });
    });
    
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        observer.observe(chatMessages);
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

