// Auto-detect the API base path based on current location
window.API_URL = window.location.origin + (window.location.pathname.includes('/frontend/') ? '' : '/daily_connect') + '/backend';
// Fallback for direct localhost root serving
if (window.location.port === '8000' && window.location.pathname.includes('/frontend/')) {
    window.API_URL = window.location.origin + '/backend';
}

const API_URL = window.API_URL;

// Helper to show alerts
function showAlert(boxId, message, type) {
    const box = document.getElementById(boxId);
    if(box) {
        box.innerText = message;
        box.className = `alert alert-${type}`;
        box.style.display = 'block';
        setTimeout(() => box.style.display = 'none', 5000);
    }
}

// Get user from local storage
function getUser() {
    const user = localStorage.getItem('daily_connect_user');
    return user ? JSON.parse(user) : null;
}

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if(logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await fetch(`${API_URL}/auth/logout.php`);
        } catch (error) {
            console.error('Logout error:', error);
        }
        localStorage.removeItem('daily_connect_user');
        window.location.href = 'login.html';
    });
}

// simple state management for UI links
document.addEventListener('DOMContentLoaded', () => {
    const user = getUser();
    const navLinks = document.querySelector('.nav-links');
    const path = window.location.pathname;

    if (navLinks) {
        // Clear or prepare common links
        const navLoginBtn = document.getElementById('navLoginBtn');
        const navRegBtn = document.getElementById('navRegBtn');

        if (user) {
            // Logged in state
            if (navLoginBtn) navLoginBtn.style.display = 'none';
            if (navRegBtn) navRegBtn.style.display = 'none';

            // Universal "Home/Dashboard" logic
            let dashUrl = 'user-dashboard.html';
            if (user.role === 'worker') dashUrl = 'worker-dashboard.html';
            if (user.role === 'admin') dashUrl = 'admin-dashboard.html';

            // Update/Add dashboard links
            const currentLinks = navLinks.querySelectorAll('a');
            let hasDash = false;
            currentLinks.forEach(link => {
                if (link.innerText.includes('Dashboard')) {
                    link.href = dashUrl;
                    hasDash = true;
                }
            });

            if (!hasDash && (path.endsWith('index.html') || path === '/' || path.includes('about') || path.includes('contact') || path.includes('workers'))) {
                const dashLink = document.createElement('a');
                dashLink.href = dashUrl;
                dashLink.className = 'btn btn-primary';
                dashLink.innerText = 'My Dashboard';
                navLinks.appendChild(dashLink);

                // Add Logout button for homepage/guest pages when logged in
                const logoutLink = document.createElement('a');
                logoutLink.href = '#';
                logoutLink.id = 'logoutBtn';
                logoutLink.className = 'btn btn-outline';
                logoutLink.innerText = 'Logout';
                navLinks.appendChild(logoutLink);
                
                // Re-bind logout listener since we added a new button
                logoutLink.addEventListener('click', async (e) => {
                    e.preventDefault();
                    try { await fetch(`${API_URL}/auth/logout.php`); } catch (err) {}
                    localStorage.removeItem('daily_connect_user');
                    window.location.href = 'login.html';
                });
            }

            const lBtn = document.getElementById('logoutBtn');
            if (lBtn) lBtn.classList.remove('hidden');
        } else {
            // Guest state
            const lBtn = document.getElementById('logoutBtn');
            if (lBtn) lBtn.classList.add('hidden');
            
            // Ensure login/reg buttons are visible if they exist
            if (navLoginBtn) navLoginBtn.style.display = 'inline-flex';
            if (navRegBtn) navRegBtn.style.display = 'inline-flex';
        }
    }

    // Auto-active navbar links
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (path.includes(link.getAttribute('href')) && link.getAttribute('href') !== '#') {
            link.style.color = 'var(--primary-color)';
            link.style.fontWeight = '700';
        }
    });

    // Mobile menu toggle (if burger icon exists)
    const mobileToggle = document.querySelector('.navbar-toggle'); 
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.classList.toggle('active');
        });
    }
});
