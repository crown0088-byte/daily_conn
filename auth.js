document.addEventListener('DOMContentLoaded', () => {
    const API_URL = window.API_URL;
    
    // Register Form
    const registerForm = document.getElementById('registerForm');
    if(registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;

            try {
                const response = await fetch(`${API_URL}/auth/register.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password, role })
                });
                const data = await response.json();
                
                if(data.status === 'success') {
                    showAlert('registerAlert', data.message, 'success');
                    setTimeout(() => window.location.href = 'login.html', 1500);
                } else {
                    showAlert('registerAlert', data.message, 'error');
                }
            } catch (err) {
                showAlert('registerAlert', 'Server error during registration.', 'error');
            }
        });
    }

    // Login Form
    const loginForm = document.getElementById('loginForm');
    if(loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch(`${API_URL}/auth/login.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();
                
                if(data.status === 'success') {
                    localStorage.setItem('daily_connect_user', JSON.stringify(data.user));
                    showAlert('loginAlert', data.message, 'success');
                    
                    setTimeout(() => {
                        if(data.user.role === 'worker') {
                            window.location.href = 'worker-dashboard.html';
                        } else if(data.user.role === 'admin') {
                            window.location.href = 'admin-dashboard.html';
                        } else {
                            window.location.href = 'user-dashboard.html';
                        }
                    }, 1000);
                } else {
                    showAlert('loginAlert', data.message, 'error');
                }
            } catch (err) {
                showAlert('loginAlert', 'Server error during login.', 'error');
            }
        });
    }

});
