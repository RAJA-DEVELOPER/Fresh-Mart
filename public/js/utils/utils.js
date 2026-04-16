const utils = {
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    },

    getQueryParam: (param) => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    },

    updateCartBadge: (count) => {
        const badge = document.getElementById('cart-badge');
        if (badge) {
            if (count > 0) {
                badge.innerText = count;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    },

    showToast: (message, type = 'success') => {
        // Ensure container exists
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast-pill ${type === 'success' ? '' : 'error'}`;
        
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        
        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
            <div class="toast-progress"></div>
        `;

        container.appendChild(toast);

        // Progress bar animation
        const progress = toast.querySelector('.toast-progress');
        progress.animate([
            { width: '100%' },
            { width: '0%' }
        ], {
            duration: 3500,
            easing: 'linear'
        });

        // Auto remove with exit animation
        setTimeout(() => {
            toast.style.animation = 'toast-exit 0.4s ease-in forwards';
            setTimeout(() => toast.remove(), 400);
        }, 3500);
    },

    showConfirm: (title, message) => {
        return new Promise((resolve) => {
            if (!document.getElementById('custom-alert-styles')) {
                const style = document.createElement('style');
                style.id = 'custom-alert-styles';
                style.innerHTML = `
                    .custom-alert-overlay {
                        position: fixed; inset: 0; background: rgba(2, 44, 34, 0.7); backdrop-filter: blur(8px);
                        z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 16px;
                    }
                    .custom-alert-box {
                        background: #ffffff; border-radius: 28px; width: 100%; max-width: 420px;
                        text-align: center; padding: 40px 24px; animation: alertPop 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
                    }
                    .custom-alert-icon {
                        width: 72px; height: 72px; background: #fee2e2; color: #ef4444; border-radius: 50%;
                        display: flex; align-items: center; justify-content: center; font-size: 2.2rem; margin: 0 auto 24px;
                    }
                    .custom-alert-title {
                        font-size: 1.5rem; font-weight: 800; color: #1e293b; margin: 0 0 12px; font-family: 'Plus Jakarta Sans', sans-serif;
                    }
                    .custom-alert-msg {
                        color: #64748b; font-size: 1.05rem; line-height: 1.6; margin: 0 0 32px; font-family: 'Plus Jakarta Sans', sans-serif;
                    }
                    .custom-alert-actions {
                        display: flex; gap: 12px; justify-content: center;
                    }
                    .custom-alert-btn {
                        flex: 1; padding: 14px; border: none; border-radius: 16px; font-weight: 700; font-size: 1rem;
                        cursor: pointer; transition: all 0.2s; font-family: 'Plus Jakarta Sans', sans-serif;
                    }
                    .custom-alert-cancel {
                        background: #f1f5f9; color: #475569;
                    }
                    .custom-alert-cancel:hover { background: #e2e8f0; }
                    .custom-alert-ok {
                        background: #ef4444; color: #fff; box-shadow: 0 4px 14px rgba(239,68,68,0.3);
                    }
                    .custom-alert-ok:hover { background: #dc2626; transform: translateY(-2px); }
                    @keyframes alertPop {
                        from { opacity: 0; transform: scale(0.9) translateY(10px); }
                        to { opacity: 1; transform: scale(1) translateY(0); }
                    }
                    @media (max-width: 480px) {
                        .custom-alert-box { padding: 32px 20px; border-radius: 24px; }
                        .custom-alert-icon { width: 60px; height: 60px; font-size: 1.8rem; margin-bottom: 20px; }
                        .custom-alert-title { font-size: 1.35rem; }
                        .custom-alert-msg { font-size: 0.95rem; margin-bottom: 24px; }
                        .custom-alert-actions { flex-direction: column-reverse; gap: 10px; }
                        .custom-alert-btn { padding: 12px; }
                    }
                `;
                document.head.appendChild(style);
            }

            const overlay = document.createElement('div');
            overlay.className = 'custom-alert-overlay';
            
            overlay.innerHTML = `
                <div class="custom-alert-box">
                    <div class="custom-alert-icon"><i class="fas fa-exclamation-triangle"></i></div>
                    <h3 class="custom-alert-title">${title}</h3>
                    <p class="custom-alert-msg">${message}</p>
                    <div class="custom-alert-actions">
                        <button id="confirm-cancel-btn" class="custom-alert-btn custom-alert-cancel">Cancel</button>
                        <button id="confirm-ok-btn" class="custom-alert-btn custom-alert-ok">Confirm</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            overlay.querySelector('#confirm-cancel-btn').addEventListener('click', () => {
                overlay.remove();
                resolve(false);
            });
            overlay.querySelector('#confirm-ok-btn').addEventListener('click', () => {
                overlay.remove();
                resolve(true);
            });
        });
    },

    isLoggedIn: () => {
        return !!localStorage.getItem('token');
    },

    getUser: () => {
        return JSON.parse(localStorage.getItem('user') || '{}');
    },

    initNavbar: async () => {
        const user = utils.getUser();
        const isLoggedIn = utils.isLoggedIn();

        // 1. Setup Auth/Account Logic for the 8-link navbar
        const loginLinks = document.querySelectorAll('#nav-login, #mobile-nav-login');
        const dashLinks = document.querySelectorAll('#nav-dash, #mobile-nav-dash');
        const logoutBtns = document.querySelectorAll('#nav-logout, #mobile-nav-logout');

        if (isLoggedIn) {
            loginLinks.forEach(link => link.classList.add('!hidden'));
            dashLinks.forEach(link => {
                link.classList.remove('!hidden', 'hidden');
                link.setAttribute('href', '/dashboard.html#profile');
                link.setAttribute('title', 'Account Settings');
                link.innerHTML = `<i class="fas fa-user-circle mr-1 text-emerald-600"></i> ${user.name || 'Dashboard'}`;
            });
            logoutBtns.forEach(btn => {
                btn.classList.remove('!hidden');
                if (btn.id === 'mobile-nav-logout') btn.classList.remove('hidden');
            });
        } else {
            loginLinks.forEach(link => link.classList.remove('!hidden', 'hidden'));
            dashLinks.forEach(link => link.classList.add('!hidden'));
            logoutBtns.forEach(btn => btn.classList.add('!hidden'));
        }

        // 2. Setup Search
        const searchInputs = document.querySelectorAll('#main-search, #nav-search, #mobile-search');
        searchInputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && input.value.trim()) {
                    window.location.href = `/shop.html?search=${encodeURIComponent(input.value.trim())}`;
                }
            });
        });

        // 3. Mobile Menu Toggle
        const menuBtn = document.getElementById('mobile-menu-btn');
        const closeBtn = document.getElementById('close-menu');
        const menu = document.getElementById('mobile-menu');

        if (menuBtn && menu) {
            menuBtn.addEventListener('click', () => {
                menu.classList.remove('hidden');
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            });
        }

        if (closeBtn && menu) {
            closeBtn.addEventListener('click', () => {
                menu.classList.add('hidden');
                document.body.style.overflow = ''; // Restore scrolling
            });
            // Close on backdrop click
            menu.addEventListener('click', (e) => {
                if (e.target === menu) {
                    menu.classList.add('hidden');
                    document.body.style.overflow = '';
                }
            });
        }

        // 4. Update Cart Badge
        if (isLoggedIn) {
            try {
                const res = await api.get('/cart');
                const totalItems = res.cart.reduce((sum, item) => sum + item.quantity, 0);
                utils.updateCartBadge(totalItems);
            } catch (e) {
                console.error('Navbar cart sync failed');
            }
        }

        // 5. Restore Search Input from URL
        const currentSearch = utils.getQueryParam('search');
        if (currentSearch) {
            searchInputs.forEach(input => input.value = currentSearch);
        }
    },

    persistField: (id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('input', () => {
            sessionStorage.setItem(`persist_${id}`, el.value);
        });
        // Restore
        const saved = sessionStorage.getItem(`persist_${id}`);
        if (saved !== null) el.value = saved;
    },

    persistRadio: (name) => {
        const radios = document.querySelectorAll(`input[name="${name}"]`);
        radios.forEach(r => {
            r.addEventListener('change', () => {
                sessionStorage.setItem(`persist_radio_${name}`, r.value);
            });
        });
        const saved = sessionStorage.getItem(`persist_radio_${name}`);
        if (saved) {
            const match = document.querySelector(`input[name="${name}"][value="${saved}"]`);
            if (match) match.checked = true;
        }
    },

    logout: () => {
        localStorage.clear();
        window.location.href = '/auth.html';
    },

    renderEmptyState: (containerId, message, icon = 'fa-shopping-basket') => {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = `
            <div class="col-span-full py-20 flex flex-col items-center justify-center text-center empty-state-vibe">
                <div class="w-32 h-32 bg-stone-50 rounded-full flex items-center justify-center mb-8 border border-emerald-100/50 relative">
                    <i class="fas ${icon} text-5xl text-emerald-200/60"></i>
                    <div class="absolute inset-0 bg-emerald-500/5 rounded-full blur-xl animate-pulse"></div>
                </div>
                <h3 class="text-2xl font-black text-stone-800 mb-3">Freshness is just a click away!</h3>
                <p class="text-stone-400 max-w-sm leading-relaxed">${message}</p>
                <a href="/shop.html" class="mt-8 inline-flex items-center space-x-2 bg-green-700 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20">
                    <span>Explore Products</span>
                    <i class="fas fa-arrow-right text-xs"></i>
                </a>
            </div>
        `;
    },

    initStickyHeader: () => {
        const header = document.querySelector('header.sticky');
        if (!header) return;

        const handleScroll = () => {
            if (window.scrollY > 50) {
                header.classList.add('header-scrolled');
            } else {
                header.classList.remove('header-scrolled');
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial check
    }
};

// Initialize premium interactions
document.addEventListener('DOMContentLoaded', () => {
    utils.initStickyHeader();
});


// Force heartbeats and state synchronization when returning via browser "Back" button (bfcache)
window.addEventListener('pageshow', (event) => {
    // Re-initialize navbar and sticky header to ensure UI consistency
    if (utils && typeof utils.initNavbar === 'function') {
        utils.initNavbar();
    }
    if (utils && typeof utils.initStickyHeader === 'function') {
        utils.initStickyHeader();
    }

    if (event.persisted || (performance.getEntriesByType("navigation").length && performance.getEntriesByType("navigation")[0].type === "back_forward")) {
        // Trigger page-specific reloads if functions exist
        if (typeof window.loadCart === 'function') window.loadCart();
        if (typeof window.checkAuthStatus === 'function') window.checkAuthStatus();
        if (typeof window.syncProfile === 'function') window.syncProfile();
        if (typeof window.initPageData === 'function') window.initPageData();
    }
});

// Cross-tab synchronization
window.addEventListener('storage', (event) => {
    if (event.key === 'user' || event.key === 'token') {
        if (typeof checkAuthStatus === 'function') checkAuthStatus();
        if (typeof syncProfile === 'function') syncProfile();
    }
});

window.utils = utils;
