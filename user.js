document.addEventListener('DOMContentLoaded', () => {
    const user = getUser();
    if(!user || user.role !== 'user') {
        const path = window.location.pathname;
        if(path.includes('user-dashboard') || path.includes('job-request')) {
            window.location.href = 'login.html';
            return;
        }
    }

    // User dashboard
    const welcomeMsg = document.getElementById('welcomeMsg');
    if(welcomeMsg && user) welcomeMsg.innerText = `Welcome, ${user.name}`;
    
    // Global function to be called from inline onclick - Define EARLY
    window.openReviewModal = function(jobId, workerId) {
        document.getElementById('reviewJobId').value = jobId;
        document.getElementById('reviewWorkerId').value = workerId;
        document.getElementById('reviewModal').style.display = 'flex';
    };
    
    // Global state for this page
    let allRequests = [];
    let allWorkers = [];
    let currentPage = 1;
    const itemsPerPage = 5;

    const jobsContainer = document.getElementById('jobsContainer');
    const historyContainer = document.getElementById('historyContainer');
    const reviewsContainer = document.getElementById('reviewsContainer');
    
    if(jobsContainer && window.location.pathname.includes('user-dashboard')) {
        loadMyRequests('dashboard');
    } else if(historyContainer && window.location.pathname.includes('user-history')) {
        loadMyRequests('history');
    }
    
    if(reviewsContainer) {
        loadMyReviews();
    }

    // Workers page
    const workersContainer = document.getElementById('workersContainer');
    const searchInput = document.getElementById('searchInput');
    if(workersContainer) {
        loadWorkers();
        
        // Setup filter listeners
        const filterElements = [
            searchInput,
            document.getElementById('priceRange'),
            document.getElementById('topRatedFilter'),
            document.getElementById('recommendedFilter'),
            document.getElementById('availabilityFilter'),
            ...document.querySelectorAll('.category-filter')
        ];

        filterElements.forEach(el => {
            if(el) {
                el.addEventListener(el.type === 'text' ? 'input' : 'change', () => {
                    if(el.id === 'priceRange') {
                        document.getElementById('priceValue').innerText = el.value;
                    }
                    loadWorkers();
                });
            }
        });

        const clearBtn = document.getElementById('clearFiltersBtn');
        if(clearBtn) {
            clearBtn.addEventListener('click', () => {
                if(searchInput) searchInput.value = '';
                const priceRange = document.getElementById('priceRange');
                if(priceRange) { priceRange.value = 200; document.getElementById('priceValue').innerText = '200'; }
                
                document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
                loadWorkers();
            });
        }
    }

    // Job Request form
    const jobRequestForm = document.getElementById('jobRequestForm');
    if(jobRequestForm) {
        jobRequestForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const workerId = document.getElementById('workerId').value;
            const description = document.getElementById('description').value;

            try {
                const response = await fetch(`${API_URL}/user/send_request.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: user.id, worker_id: workerId, description: description })
                });
                const data = await response.json();
                
                if(data.status === 'success') {
                    showAlert('requestAlert', data.message, 'success');
                    setTimeout(() => window.location.href = 'user-dashboard.html', 1500);
                } else {
                    showAlert('requestAlert', data.message, 'error');
                }
            } catch (err) {
                showAlert('requestAlert', 'Failed to send request.', 'error');
            }
        });
    }

    // Fetch and load my requests
    async function loadMyRequests(mode = 'dashboard') {
        const container = mode === 'dashboard' ? document.getElementById('jobsContainer') : document.getElementById('historyContainer');
        
        try {
            if(allRequests.length === 0) {
                const response = await fetch(`${API_URL}/user/my_requests.php?user_id=${user.id}`);
                const data = await response.json();
                if(data.status === 'success') {
                    allRequests = data.data;
                }
            }

            container.innerHTML = '';
            
            if(allRequests.length === 0) {
                container.innerHTML = '<p style="text-align:center; color:var(--text-secondary); margin-top:2rem;">No job requests found.</p>';
                return;
            }

            let displayRequests = allRequests;
            
            if(mode === 'dashboard') {
                displayRequests = allRequests.slice(0, 3); // Max 3 on dashboard
            } else if (mode === 'history') {
                const startIndex = (currentPage - 1) * itemsPerPage;
                displayRequests = allRequests.slice(startIndex, startIndex + itemsPerPage);
            }
            
            displayRequests.forEach(job => {
                const el = document.createElement('div');
                el.className = mode === 'dashboard' ? 'card' : 'history-card';
                
                let reviewBtn = '';
                if(job.status === 'completed') {
                    reviewBtn = `<button class="btn ${mode === 'dashboard' ? 'btn-outline' : 'btn-primary'}" style="${mode === 'dashboard' ? 'margin-top:10px; border-color:#FFD700; color:#b8860b;' : ''}" onclick="openReviewModal(${job.id}, ${job.worker_id})">Leave a Review</button>`;
                }

                if(mode === 'dashboard') {
                    el.innerHTML = `
                        <div class="card-title">To: ${job.worker_name} (${job.skills})</div>
                        <p>${job.description}</p>
                        <p class="mt-2 text-secondary"><small>Requested: ${job.created_at ? new Date(job.created_at.replace(' ', 'T')).toLocaleDateString() : 'N/A'}</small></p>
                        <div style="margin-top: 10px;">
                            <span class="badge badge-${job.status}">${job.status.toUpperCase()}</span>
                        </div>
                        ${reviewBtn}
                    `;
                } else {
                    el.innerHTML = `
                        <div class="history-info">
                            <div class="history-title">Worker: ${job.worker_name}</div>
                            <p style="margin-bottom:0.5rem;"><strong>Job:</strong> ${job.description}</p>
                            <p class="text-secondary"><small>Date: ${new Date(job.created_at).toLocaleDateString()}</small></p>
                            ${reviewBtn ? `<div style="margin-top:10px;">${reviewBtn}</div>` : ''}
                        </div>
                        <div class="history-status">
                            <span class="badge badge-${job.status}">${job.status.toUpperCase()}</span>
                        </div>
                    `;
                }
                container.appendChild(el);
            });

            if(mode === 'history') {
                renderPagination();
            }
        } catch (err) {
            container.innerHTML = '<p>Error loading jobs.</p>';
        }
    }

    function renderPagination() {
        const paginationContainer = document.getElementById('historyPagination');
        if(!paginationContainer) return;
        
        paginationContainer.innerHTML = '';
        const totalPages = Math.ceil(allRequests.length / itemsPerPage);
        if(totalPages <= 1) return;

        const prevBtn = document.createElement('button');
        prevBtn.className = 'page-btn';
        prevBtn.innerText = 'Prev';
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => { currentPage--; loadMyRequests('history'); };
        paginationContainer.appendChild(prevBtn);

        for(let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `page-btn ${currentPage === i ? 'active' : ''}`;
            pageBtn.innerText = i;
            pageBtn.onclick = () => { currentPage = i; loadMyRequests('history'); };
            paginationContainer.appendChild(pageBtn);
        }

        const nextBtn = document.createElement('button');
        nextBtn.className = 'page-btn';
        nextBtn.innerText = 'Next';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.onclick = () => { currentPage++; loadMyRequests('history'); };
        paginationContainer.appendChild(nextBtn);
    }

    // Fetch all workers
    async function loadWorkers() {
        try {
            if(allWorkers.length === 0) {
                const response = await fetch(`${API_URL}/user/get_workers.php`);
                const data = await response.json();
                if(data.status === 'success') {
                    allWorkers = data.data;
                }
            }

            // Gather filter values
            const filterText = document.getElementById('searchInput') ? document.getElementById('searchInput').value.toLowerCase() : '';
            const maxPrice = document.getElementById('priceRange') ? parseInt(document.getElementById('priceRange').value) : 200;
            const topRatedOnly = document.getElementById('topRatedFilter')?.checked;
            const recommendedOnly = document.getElementById('recommendedFilter')?.checked;
            const availableOnly = document.getElementById('availabilityFilter')?.checked;
            
            const selectedCategories = Array.from(document.querySelectorAll('.category-filter:checked')).map(cb => cb.value.toLowerCase());

            const filteredWorkers = allWorkers.filter(w => {
                const searchMatch = (w.skills && w.skills.toLowerCase().includes(filterText)) || 
                                    (w.name && w.name.toLowerCase().includes(filterText)) ||
                                    (w.location && w.location.toLowerCase().includes(filterText));
                
                const pricing = parseFloat(w.pricing || 0);
                const priceMatch = pricing <= maxPrice;
                
                const avgRating = parseFloat(w.avg_rating || 0);
                const reviewCount = parseInt(w.review_count || 0);
                
                let ratingMatch = true;
                if(topRatedOnly && !(avgRating >= 4.5 && reviewCount >= 3)) ratingMatch = false;
                if(recommendedOnly && !(avgRating >= 4.0)) ratingMatch = false;
                
                let availMatch = true;
                if(availableOnly && w.availability !== 'available') availMatch = false;
                
                let categoryMatch = true;
                if(selectedCategories.length > 0) {
                    const workerSkills = w.skills ? w.skills.toLowerCase() : '';
                    categoryMatch = selectedCategories.some(cat => workerSkills.includes(cat));
                }

                return searchMatch && priceMatch && ratingMatch && availMatch && categoryMatch;
            });

            workersContainer.innerHTML = '';
            
            const resultsCountSpan = document.getElementById('resultsCount');
            if(resultsCountSpan) resultsCountSpan.innerText = `${filteredWorkers.length} found`;

            if(filteredWorkers.length === 0) {
                workersContainer.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); margin-top: 2rem;">No workers match your selected filters. Try broadening your search.</p>';
                return;
            }
            
            filteredWorkers.forEach(worker => {
                const avgRating = parseFloat(worker.avg_rating || 0).toFixed(1);
                const reviewCount = parseInt(worker.review_count || 0);
                
                let badgesHTML = '';
                if(avgRating >= 4.5 && reviewCount >= 3) {
                    badgesHTML += `<span class="badge" style="background:#FFD700; color:#000; margin-left:5px;">⭐ Top Rated</span>`;
                } else if(avgRating >= 4.0) {
                    badgesHTML += `<span class="badge" style="background:#2196F3; color:#fff; margin-left:5px;">👍 Recommended</span>`;
                }

                let stars = '';
                if(reviewCount > 0) {
                    stars = `<span style="color:#f39c12; font-weight:bold;">${avgRating} ★</span> <small class="text-secondary">(${reviewCount} reviews)</small>`;
                } else {
                    stars = `<small class="text-secondary">No reviews yet</small>`;
                }

                const el = document.createElement('div');
                el.className = 'card';
                el.innerHTML = `
                    <div class="card-title" style="display:flex; align-items:center; justify-content:space-between;">
                        <span><a href="worker-details.html?id=${worker.worker_id}" style="text-decoration:none; color:var(--primary-color);">${worker.name}</a> ${badgesHTML}</span>
                        <span>${stars}</span>
                    </div>
                    <p><strong>Skills:</strong> ${worker.skills || 'Not specified'}</p>
                    <p><strong>Location:</strong> ${worker.location || 'Not specified'}</p>
                    <p><strong>Rate:</strong> $${worker.pricing}/day</p>
                    <div style="margin-top: 10px;">
                        <span class="badge badge-${worker.availability === 'available' ? 'completed' : (worker.availability === 'busy' ? 'pending' : 'rejected')}">${worker.availability ? worker.availability.toUpperCase() : 'OFFLINE'}</span>
                    </div>
                    ${worker.availability === 'available' && user ? 
                        `<a href="job-request.html?worker=${worker.worker_id}&name=${encodeURIComponent(worker.name)}&rate=${worker.pricing}" class="btn btn-outline mt-2" style="display:block; text-align:center;">Request Job</a>` 
                        : (user ? `<button class="btn btn-outline mt-2" disabled style="display:block; width:100%; opacity: 0.5;">Not Available</button>` : `<a href="login.html" class="btn btn-outline mt-2" style="display:block; text-align:center;">Login to Request</a>`)}
                `;
                workersContainer.appendChild(el);
            });
        } catch (err) {
            if(workersContainer) workersContainer.innerHTML = `<p>Error loading workers: ${err.message}</p>`;
            console.error(err);
        }
    }

// Review handling is now at the top of the listener

    const reviewForm = document.getElementById('reviewForm');
    if(reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const jobId = document.getElementById('reviewJobId').value;
            const workerId = document.getElementById('reviewWorkerId').value;
            const rating = document.getElementById('reviewRating').value;
            const text = document.getElementById('reviewText').value;

            try {
                const response = await fetch(`${API_URL}/user/submit_review.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        user_id: user.id, 
                        job_id: jobId, 
                        worker_id: workerId, 
                        rating: parseInt(rating),
                        review_text: text
                    })
                });
                const data = await response.json();
                
                if(data.status === 'success') {
                    showAlert('reviewAlert', data.message, 'success');
                    setTimeout(() => {
                        document.getElementById('reviewModal').style.display = 'none';
                        reviewForm.reset();
                    }, 1500);
                } else {
                    showAlert('reviewAlert', data.message, 'error');
                }
            } catch (err) {
                showAlert('reviewAlert', 'Failed to submit review.', 'error');
            }
        });
    }

    // Load My Reviews
    async function loadMyReviews() {
        if(!reviewsContainer) return;
        
        try {
            const response = await fetch(`${API_URL}/user/my_reviews.php?user_id=${user.id}`);
            const data = await response.json();
            
            reviewsContainer.innerHTML = '';
            
            if(data.status === 'success') {
                if(data.data.length === 0) {
                    reviewsContainer.innerHTML = "<p style='text-align:center; color:var(--text-secondary); margin-top:2rem;'>You haven't left any reviews yet.</p>";
                    return;
                }
                
                data.data.forEach(review => {
                    const el = document.createElement('div');
                    el.className = 'review-card';
                    
                    let starsHTML = '';
                    for(let i=0; i<5; i++) {
                        starsHTML += i < review.rating ? '★' : '☆';
                    }
                    
                    const reviewBody = review.review_text ? `<div class="review-body">${review.review_text}</div>` : '';
                    
                    el.innerHTML = `
                        <div class="review-header">
                            <div>
                                <a href="worker-details.html?id=${review.worker_id}" class="worker-name">${review.worker_name}</a>
                                <div class="review-job">Job: ${review.job_description}</div>
                            </div>
                            <div class="stars">${starsHTML}</div>
                        </div>
                        ${reviewBody}
                        <div class="review-date">Submitted on ${new Date(review.created_at).toLocaleDateString()}</div>
                    `;
                    reviewsContainer.appendChild(el);
                });
            } else {
                reviewsContainer.innerHTML = `<p>${data.message}</p>`;
            }
        } catch (err) {
            reviewsContainer.innerHTML = '<p>Error loading reviews.</p>';
        }
    }
});
