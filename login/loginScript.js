document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const notification = document.getElementById('notification');
    
    // Mock user database (in a real app, this would be on a server)
    const users = [
        { email: 'admin@flightmanager.com', password: 'Admin123!', role: 'admin' },
        { email: 'agent@flightmanager.com', password: 'Agent123!', role: 'agent' },
        { email: 'pilot@flightmanager.com', password: 'Pilot123!', role: 'pilot' }
    ];
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('remember').checked;
        
        // Validate user credentials
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Store user session
            sessionStorage.setItem('currentUser', JSON.stringify({
                email: user.email,
                role: user.role,
                loginTime: new Date().toISOString()
            }));
            
            if (rememberMe) {
                localStorage.setItem('rememberedUser', email);
            }
            
            showNotification('Login successful! Redirecting...', 'success');
            
            // Redirect to index.html in the parent directory
            setTimeout(() => {
                window.location.href = '../main/index.html';
            }, 1500);
        } else {
            showNotification('Invalid email or password. Please try again.', 'error');
        }
    });
    
    // Check for remembered user
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        document.getElementById('email').value = rememberedUser;
        document.getElementById('remember').checked = true;
    }
    
    function showNotification(message, type) {
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
});