from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

def check_password_strength(password):
    
    
    score = 0
    feedback = []
    
    
    if len(password) >= 8:
        score += 20
        if len(password) >= 12:
            score += 10  
    else:
        feedback.append("❌ Password should be at least 8 characters")
    
    if len(password) >= 16:
        score += 10  
    
    
    if any(c.isupper() for c in password):
        score += 15
    else:
        feedback.append("❌ Add uppercase letters (A-Z)")
    
    
    if any(c.islower() for c in password):
        score += 15
    else:
        feedback.append("❌ Add lowercase letters (a-z)")
    
    
    if any(c.isdigit() for c in password):
        score += 15
    else:
        feedback.append("❌ Add numbers (0-9)")
    
    
    special_chars = "!@#$%^&*()_+-=[]{}|;:,.<>?"
    if any(c in special_chars for c in password):
        score += 15
    else:
        feedback.append("❌ Add special characters (!@#$%^&*)")
    
    
    common_patterns = [
        "123", "abc", "qwerty", "password", "admin",
        "letmein", "welcome", "login"
    ]
    
    password_lower = password.lower()
    has_common = False
    for pattern in common_patterns:
        if pattern in password_lower:
            has_common = True
            score -= 20
            feedback.append("❌ Avoid common patterns like '123' or 'abc'")
            break
    
    
    
    has_repeated = False
    for i in range(len(password) - 2):
        if password[i] == password[i+1] == password[i+2]:
            has_repeated = True
            score -= 10
            feedback.append("⚠️ Avoid repeated characters (aaa)")
            break
    
   
    score = max(0, min(100, score))
    
    
    if score >= 80:
        level = "Very Strong"
    elif score >= 60:
        level = "Strong"
    elif score >= 40:
        level = "Fair"
    else:
        level = "Weak"
    
    
    if score >= 70 and len(feedback) == 0:
        feedback.append("✅ Great password! It's secure.")
    elif score >= 50 and len(feedback) < 3:
        feedback.append("✅ Good start, but could be stronger")
    
    return score, level, feedback


@app.route('/')
def home():
    
    return render_template('index.html')


@app.route('/analyze', methods=['POST'])
def analyze():
    
    try:
        # Get password from request
        data = request.get_json()
        password = data.get('password', '')
        
        # Analyze password
        score, level, feedback = check_password_strength(password)
        
        # Return results
        return jsonify({
            'score': score,
            'level': level,
            'feedback': feedback
        })
        
    except Exception as e:
        return jsonify({
            'score': 0,
            'level': 'Error',
            'feedback': [f'Server error: {str(e)}']
        })


if __name__ == '__main__':
    app.run(debug=True, port=5000)