// Utility functions

// Ripple effect on buttons
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.btn:not(.no-ripple)');
    
    buttons.forEach(button => {
        button.addEventListener('click', function (e) {
            let x = e.clientX - e.target.getBoundingClientRect().left;
            let y = e.clientY - e.target.getBoundingClientRect().top;

            let ripples = document.createElement('span');
            ripples.style.left = x + 'px';
            ripples.style.top = y + 'px';
            ripples.classList.add('ripple');
            this.appendChild(ripples);

            setTimeout(() => {
                ripples.remove();
            }, 600);
        });
    });

    // Scroll reveal animation
    const reveals = document.querySelectorAll('.reveal');

    function reveal() {
        for (let i = 0; i < reveals.length; i++) {
            let windowHeight = window.innerHeight;
            let elementTop = reveals[i].getBoundingClientRect().top;
            let elementVisible = 100;

            if (elementTop < windowHeight - elementVisible) {
                reveals[i].classList.add('active');
            }
        }
    }

    window.addEventListener('scroll', reveal);
    reveal(); // Trigger on load

    // 3D Tilt Effect
    const tiltCards = document.querySelectorAll('.tilt-card');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            card.style.transition = 'transform 0.5s ease-out';
            setTimeout(() => {
                card.style.transition = ''; // Remove transition to maintain fast interaction
            }, 500);
        });
    });

    // --- Authentication Logic ---
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginError = document.getElementById('login-error');
    const regError = document.getElementById('reg-error');
    const regSuccess = document.getElementById('reg-success');
    const logoutBtn = document.getElementById('logout-btn');

    // Tab Switching Logic
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');

    if (tabLogin && tabRegister) {
        tabLogin.addEventListener('click', () => {
            tabLogin.classList.add('active');
            tabRegister.classList.remove('active');
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
        });

        tabRegister.addEventListener('click', () => {
            tabRegister.classList.add('active');
            tabLogin.classList.remove('active');
            registerForm.classList.add('active');
            loginForm.classList.remove('active');
        });
    }

    // Page Protection
    const isLoginPage = document.body.id === 'login-page';
    const isLandingPage = document.body.id === 'landing-page';
    
    // Check auth state with backend
    async function checkAuth() {
        try {
            const res = await fetch('/api/auth/user');
            const data = await res.json();
            const isLoggedIn = data.isLoggedIn;

            if (!isLoginPage && !isLandingPage && !isLoggedIn) {
                 window.location.href = 'login.html';
            }

            if (isLoginPage && isLoggedIn) {
                window.location.href = 'dashboard.html';
            }
        } catch (err) {
            console.error('Auth check error:', err);
        }
    }

    checkAuth();

    // Handle Registration
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const user = document.getElementById('reg-username').value.trim();
            const pass = document.getElementById('reg-password').value;

            regError.classList.remove('show');
            regSuccess.classList.remove('show');

            try {
                const res = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: user, password: pass })
                });

                if (!res.ok) {
                    const data = await res.json();
                    regError.textContent = '❌ ' + (data.error || 'Registration failed');
                    regError.classList.add('show');
                    regError.style.animation = 'none';
                    regError.offsetHeight;
                    regError.style.animation = null; 
                } else {
                    regSuccess.classList.add('show');
                    registerForm.reset();
                    setTimeout(() => {
                        tabLogin.click();
                        regSuccess.classList.remove('show');
                    }, 1500);
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

    // Handle Login
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const user = document.getElementById('username').value.trim();
            const pass = document.getElementById('password').value;

            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: user, password: pass })
                });

                if (res.ok) {
                    window.location.href = 'dashboard.html';
                } else {
                    loginError.classList.add('show');
                    loginError.style.animation = 'none';
                    loginError.offsetHeight; 
                    loginError.style.animation = null; 
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

    // Handle Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            try {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = 'login.html';
            } catch (err) {
                console.error(err);
            }
        });
    }

    // --- Dashboard Specific Logic ---
    const isDashboard = document.body.id === 'dashboard-page';
    
    if (isDashboard) {
        async function loadDashboardData() {
            try {
                // Fetch stats
                const statsRes = await fetch('/api/user/stats');
                if (statsRes.ok) {
                    const stats = await statsRes.json();
                    document.getElementById('stat-resumes').textContent = stats.resumesCreated;
                    document.getElementById('stat-downloads').textContent = stats.downloads;
                    document.getElementById('stat-views').textContent = stats.profileViews;
                    document.getElementById('stat-ats-avg').textContent = (stats.atsScoreAvg || 0) + '/100';
                }

                // Fetch recent resumes
                const listRes = await fetch('/api/resume/list');
                if (listRes.ok) {
                    const resumes = await listRes.json();
                    const container = document.getElementById('recent-resumes-container');
                    
                    if (resumes.length > 0) {
                        container.innerHTML = ''; // Clear empty state
                        
                        // Calculate average progress (using fields filled as a metric)
                        let totalProgress = 0;
                        resumes.forEach(r => {
                            const fields = ['name', 'email', 'summary', 'skills', 'experience', 'education', 'projects'];
                            let filled = 0;
                            fields.forEach(f => { if(r.data && r.data[f] && r.data[f].trim()) filled++; });
                            totalProgress += (filled / fields.length) * 100;
                        });
                        const avgProgress = Math.round(totalProgress / resumes.length);
                        
                        document.getElementById('dash-progress-pct').textContent = `${avgProgress}%`;
                        document.getElementById('dash-progress-circle').style.strokeDasharray = `${avgProgress}, 100`;
                        document.getElementById('dash-progress-status').textContent = avgProgress === 100 ? 'Completed' : 'In Progress';

                        // Show up to 3 most recent
                        resumes.slice(0, 3).forEach(resume => {
                            const card = document.createElement('div');
                            card.className = 'resume-preview-card hover-lift';
                            card.innerHTML = `
                                <div class="card-head">
                                    <i class="fa-solid fa-file-contract neon-text-blue"></i>
                                    <span>${resume.title || 'Untitled Resume'}</span>
                                </div>
                                <div class="card-body-mock">
                                    <div class="mock-line"></div>
                                    <div class="mock-line w-75"></div>
                                    <div class="mock-line"></div>
                                    <div class="mock-line w-50"></div>
                                </div>
                                <div class="card-actions">
                                    <button class="btn-sm btn-neon" onclick="window.location.href='builder.html?id=${resume.id}'">View/Edit</button>
                                    <button class="btn-sm btn-outline" onclick="downloadResume('${resume.id}')"><i class="fa-solid fa-download"></i> Download</button>
                                </div>
                            `;
                            container.appendChild(card);
                        });
                    }
                }
            } catch (err) {
                console.error('Error loading dashboard data:', err);
            }
        }
        
        loadDashboardData();
    }

    // Assign globally to be called from inline handlers
    window.downloadResume = async function(id) {
         try {
             // Increment count on backend
             await fetch(`/api/resume/download/${id}`, { method: 'POST' });
             // In a real app we might redirect to a PDF generation endpoint here.
             // For now, redirecting to builder so they can use the existing print functionality.
             window.location.href = `builder.html?id=${id}&print=true`;
         } catch (err) {
             console.error('Download error:', err);
         }
    };

    // Handle Close Icons on Dashboard Checklists
    const closeIcons = document.querySelectorAll('.close-icon');
    closeIcons.forEach(icon => {
        icon.addEventListener('click', function(e) {
             const parentItem = this.closest('.check-item');
             if(parentItem){
                 parentItem.style.display = 'none';
             }
        });
    });
});
