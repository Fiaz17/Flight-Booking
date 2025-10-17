// Simple authentication for demo purposes
// In a real application, this would be handled by a proper authentication system
const validCredentials = {
    username: 'admin',
    password: 'admin123'
};

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const loginBtn = document.getElementById('loginBtn');
    
    // Show loading state
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
    
    // Simulate authentication delay
    setTimeout(() => {
        if (username === validCredentials.username && password === validCredentials.password) {
            // Store login state in sessionStorage
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('loginTime', new Date().toISOString());
            
            // Redirect to admin dashboard
            window.location.href = './admin.html';
        } else {
            // Show error message
            errorMessage.classList.add('show');
            errorText.textContent = 'Invalid username or password';
            
            // Reset button state
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
            
            // Clear password field
            document.getElementById('password').value = '';
        }
    }, 1000);
});

// Check if user is already logged in
window.addEventListener('load', function() {
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        // Redirect to admin dashboard
        window.location.href = './admin.html';
    }
});
