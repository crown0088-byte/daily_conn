document.addEventListener('DOMContentLoaded', () => {
    const user = getUser();
    const API_URL = window.API_URL;

    // Global error handler for easier debugging
    window.addEventListener('error', (e) => {
        showAlert('alertBox', `Script Error: ${e.message}`, 'error');
    });

    // Refactored Status Update function
    async function handleStatusUpdate(jobId, status) {
        if(!confirm(`Are you sure you want to update job status to ${status}?`)) return;
        
        try {
            const response = await fetch(`${API_URL}/worker/handle_requests.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ job_id: jobId, status: status })
            });
            const data = await response.json();
            
            if(data.status === 'success') {
                showAlert('alertBox', data.message, 'success');
                loadWorkerRequests(); // reload jobs
            } else {
                showAlert('alertBox', data.message, 'error');
            }
        } catch(err) {
            showAlert('alertBox', `Failed to update job status: ${err.message}`, 'error');
        }
    }

    // Event Delegation for jobs
    if(jobsContainer) {
        jobsContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.status-btn');
            if(btn) {
                const jobId = btn.getAttribute('data-id');
                const action = btn.getAttribute('data-status');
                handleStatusUpdate(jobId, action);
            }
        });
    }

    if(!user || user.role !== 'worker') {
        const path = window.location.pathname;
        if(path.includes('worker-dashboard') || path.includes('worker-profile')) {
            window.location.href = 'login.html';
            return;
        }
    }

    // Worker Dashboard
    const welcomeMsg = document.getElementById('welcomeMsg');
    const workerStats = document.getElementById('workerStats');
    const jobsContainer = document.getElementById('jobsContainer');

    if(welcomeMsg && user) welcomeMsg.innerText = `Welcome, ${user.name}`;
    if(workerStats && user) {
        loadWorkerStats();
    }

    async function loadWorkerStats() {
        try {
            const response = await fetch(`${API_URL}/worker/get_stats.php?worker_id=${user.worker_id}`);
            const data = await response.json();
            if(data.status === 'success') {
                const avgRating = parseFloat(data.data.avg_rating).toFixed(1);
                const reviewCount = parseInt(data.data.review_count);
                
                let badgesHTML = '';
                if(avgRating >= 4.5 && reviewCount >= 3) {
                    badgesHTML += `<span class="badge" style="background:#FFD700; color:#000; margin-right:5px; padding: 4px 8px; border-radius: 4px;">⭐ Top Rated</span>`;
                } else if(avgRating >= 4.0) {
                    badgesHTML += `<span class="badge" style="background:#2196F3; color:#fff; margin-right:5px; padding: 4px 8px; border-radius: 4px;">👍 Recommended</span>`;
                }

                let stars = '';
                if(reviewCount > 0) {
                    stars = `<span style="color:#f39c12; font-weight:bold;">${avgRating} ★</span> <span class="text-secondary">(${reviewCount} completed reviews)</span>`;
                } else {
                    stars = `<span class="text-secondary">No reviews yet</span>`;
                }

                workerStats.innerHTML = badgesHTML + stars;
            }
        } catch(e) {}
    }

    if(jobsContainer && window.location.pathname.includes('worker-dashboard')) {
        if (user && user.worker_id) {
            loadWorkerRequests();
        } else if (user && user.role === 'worker') {
            // Fallback: Try to fetch worker_id if missing from local storage
            fetch(`${API_URL}/worker/get_profile.php?user_id=${user.id}`)
                .then(r => r.json())
                .then(data => {
                    if (data.status === 'success' && data.data && data.data.worker_id) {
                        user.worker_id = data.data.worker_id;
                        localStorage.setItem('daily_connect_user', JSON.stringify(user));
                        loadWorkerRequests();
                    } else {
                        jobsContainer.innerHTML = '<p class="text-error">Error: Internal Worker ID not found. Please ensure you are registered as a worker.</p>';
                    }
                })
                .catch(() => {
                    jobsContainer.innerHTML = '<p class="text-error">Error connecting to profile. Please refresh.</p>';
                });
        }
    }

    // Profile Form
    const profileForm = document.getElementById('profileForm');
    if(profileForm && user) {
        
        async function loadProfile() {
            try {
                const response = await fetch(`${API_URL}/worker/get_profile.php?worker_id=${user.worker_id}`);
                const data = await response.json();
                if(data.status === 'success') {
                    if(document.getElementById('skills')) document.getElementById('skills').value = data.data.skills || '';
                    if(document.getElementById('pricing')) document.getElementById('pricing').value = data.data.pricing || '';
                    if(document.getElementById('location')) document.getElementById('location').value = data.data.location || '';
                    if(document.getElementById('availability')) document.getElementById('availability').value = data.data.availability || 'available';
                }
            } catch(e) {}
        }
        
        loadProfile();

        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const skills = document.getElementById('skills').value;
            const pricing = document.getElementById('pricing').value;
            const location = document.getElementById('location').value;
            const availability = document.getElementById('availability').value;

            try {
                const response = await fetch(`${API_URL}/worker/update_profile.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        worker_id: user.worker_id, 
                        skills: skills, 
                        pricing: pricing, 
                        location: location, 
                        availability: availability 
                    })
                });
                const data = await response.json();
                
                if(data.status === 'success') {
                    showAlert('profileAlert', data.message, 'success');
                    setTimeout(() => window.location.href = 'worker-dashboard.html', 1500);
                } else {
                    showAlert('profileAlert', data.message, 'error');
                }
            } catch (err) {
                showAlert('profileAlert', 'Failed to update profile.', 'error');
            }
        });
    }

    // Fetch and load worker requests
    async function loadWorkerRequests() {
        try {
            const response = await fetch(`${API_URL}/worker/my_requests.php?worker_id=${user.worker_id}`);
            const data = await response.json();

            jobsContainer.innerHTML = '';
            if(data.status === 'success') {
                if(data.data.length === 0) {
                    jobsContainer.innerHTML = '<p>No job requests found.</p>';
                    return;
                }
                
                data.data.forEach(job => {
                    const el = document.createElement('div');
                    el.className = 'card';
                    let buttons = '';
                    
                    if(job.status === 'pending') {
                        buttons = `
                            <button class="btn btn-outline status-btn" style="border-color: #4CAF50; color: #4CAF50;" data-id="${job.id}" data-status="accepted">Accept</button>
                            <button class="btn btn-outline status-btn" style="border-color: #f44336; color: #f44336;" data-id="${job.id}" data-status="rejected">Reject</button>
                        `;
                    } else if (job.status === 'accepted') {
                        buttons = `
                            <button class="btn btn-primary status-btn" data-id="${job.id}" data-status="completed">Mark as Completed</button>
                        `;
                    }

                    el.innerHTML = `
                        <div class="card-title">From: ${job.customer_name}</div>
                        <p><strong>Email:</strong> ${job.customer_email}</p>
                        <p>${job.description}</p>
                        <p class="mt-2 text-secondary"><small>Requested: ${job.created_at ? new Date(job.created_at.replace(' ', 'T')).toLocaleDateString() : 'N/A'}</small></p>
                        <div style="margin-top: 10px; display: flex; justify-content: space-between; align-items: center;">
                            <span class="badge badge-${job.status}">${job.status.toUpperCase()}</span>
                            <div>${buttons}</div>
                        </div>
                    `;
                    jobsContainer.appendChild(el);
                });
            } else {
                jobsContainer.innerHTML = `<p>${data.message}</p>`;
            }
        } catch (err) {
            if(jobsContainer) jobsContainer.innerHTML = `<p>Error loading jobs: ${err.message}</p>`;
        }
    }

    // End of worker requests logic
});
