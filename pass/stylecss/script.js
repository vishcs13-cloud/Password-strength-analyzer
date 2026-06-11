// ============================================
// PASSWORD STRENGTH ANALYZER - JAVASCRIPT
// ============================================

// Function to analyze password (called when user types)
function analyzePassword() {
    const password = document.getElementById('passwordInput').value;
    
    // Check each requirement in real-time
    checkRequirement('req-length', password.length >= 8);
    checkRequirement('req-upper', /[A-Z]/.test(password));
    checkRequirement('req-lower', /[a-z]/.test(password));
    checkRequirement('req-number', /[0-9]/.test(password));
    checkRequirement('req-special', /[!@#$%^&*()_+\-=\$\${}|;:,.<>?]/.test(password));
}

// Helper function to update requirement checkmarks
function checkRequirement(id, isValid) {
    const element = document.getElementById(id);
    const icon = element.querySelector('.req-icon');
    
    if (isValid) {
        element.classList.add('active');
        icon.textContent = '✓';
    } else {
        element.classList.remove('active');
        icon.textContent = '○';
    }
}

// Function to toggle password visibility
function togglePassword() {
    const input = document.getElementById('passwordInput');
    const icon = document.getElementById('eyeIcon');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = '🙈';
    } else {
        input.type = 'password';
        icon.textContent = '👁️';
    }
}

// Main function to send password to server for analysis
function checkPassword() {
    const password = document.getElementById('passwordInput').value;
    const resultSection = document.getElementById('resultSection');
    
    // Check if password is empty
    if (password.length === 0) {
        shakeInput();
        return;
    }
    
    // Send to server
    fetch('/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: password }),
    })
    .then(response => response.json())
    .then(data => {
        // Update the meter
        updateMeter(data.score, data.level);
        
        // Update the result card
        updateResult(data.score, data.level, data.feedback);
        
        // Show result section
        resultSection.classList.add('show');
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Function to update the strength meter
function updateMeter(score, level) {
    const meterFill = document.getElementById('meterFill');
    
    // Remove all classes first
    meterFill.classList.remove('weak', 'fair', 'strong', 'very-strong');
    
    // Add the appropriate class based on level
    const levelClass = level.toLowerCase().replace(' ', '-');
    meterFill.classList.add(levelClass);
}

// Function to update the result display
function updateResult(score, level, feedback) {
    const resultSection = document.getElementById('resultSection');
    const resultIcon = document.getElementById('resultIcon');
    const resultLevel = document.getElementById('resultLevel');
    const scoreValue = document.getElementById('scoreValue');
    const feedbackList = document.getElementById('feedbackList');
    
    // Set the level class on result section
    resultSection.classList.remove('weak', 'fair', 'strong', 'very-strong');
    resultSection.classList.add(level.toLowerCase().replace(' ', '-'));
    
    // Set icon and text based on level
    const icons = {
        'Weak': '🔴',
        'Fair': '🟡',
        'Strong': '🟢',
        'Very Strong': '💪'
    };
    
    resultIcon.textContent = icons[level] || '❓';
    resultLevel.textContent = level;
    scoreValue.textContent = score;
    
    // Clear and add feedback items
    feedbackList.innerHTML = '';
    feedback.forEach(item => {
        const div = document.createElement('div');
        div.className = 'feedback-item';
        div.textContent = item;
        
        // Color code based on good/bad feedback
        if (item.startsWith('✅')) {
            div.style.borderLeft = '3px solid #4caf50';
        } else if (item.startsWith('⚠️')) {
            div.style.borderLeft = '3px solid #f59e0b';
        } else {
            div.style.borderLeft = '3px solid #e94560';
        }
        
        feedbackList.appendChild(div);
    });
}

// Shake animation for empty input
function shakeInput() {
    const container = document.querySelector('.password-container');
    container.classList.add('shake');
    
    setTimeout(() => {
        container.classList.remove('shake');
    }, 500);
}

// Add event listener for real-time analysis
document.getElementById('passwordInput').addEventListener('input', analyzePassword);

// Allow Enter key to submit
document.getElementById('passwordInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        checkPassword();
    }
});

// Add shake animation styles dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-10px); }
        40%, 80% { transform: translateX(10px); }
    }
    .shake {
        animation: shake 0.4s ease-in-out;
    }
    .feedback-item {
        padding: 12px 15px;
        margin-bottom: 8px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        font-size: 0.9rem;
        transition: all 0.3s ease;
    }
    .feedback-item:hover {
        background: rgba(255, 255, 255, 0.1);
    }
`;
document.head.appendChild(style);