tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        gold: {
                            DEFAULT: '#C5A059',
                            light: '#E2C275',
                            dark: '#9A7B38',
                            accent: '#FFF0B3'
                        },
                        obsidian: '#000000'
                    }
                }
            }
        }

function getPreference(key) {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.warn(`Could not read the "${key}" preference.`, error);
        return null;
    }
}

function setPreference(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        console.warn(`Could not save the "${key}" preference.`, error);
    }
}

function startWelcomeAnimation() {
    const splash = document.getElementById('intro-splash');
    const canvas = document.getElementById('welcome-particles');
    const skipButton = document.getElementById('welcome-skip');

    if (!splash || !canvas || document.body.classList.contains('light-mode')) return;

    const context = canvas.getContext('2d');
    if (!context) {
        console.error('Welcome animation could not start because the browser does not support canvas.');
        return;
    }

    const symbols = ['$', '€', '£', '৳', '%', '📈', '🚀', '✨', '✦', '⭐', '💎', '🔥', '📊', '💼', '🎯'];
    const particles = [];
    const particleCount = 180;
    let animationFrame;
    let dismissTimer;
    let disposed = false;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const onKeydown = (event) => {
        if (event.key === 'Escape') closeSplash();
    };

    const resizeCanvas = () => {
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(window.innerWidth * pixelRatio);
        canvas.height = Math.round(window.innerHeight * pixelRatio);
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        particles.forEach((particle) => {
            particle.x = Math.random() * window.innerWidth;
            particle.y = Math.random() * window.innerHeight;
        });
    };

    resizeCanvas();
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            size: 12 + Math.random() * 18,
            opacity: 0.18 + Math.random() * 0.42,
            phase: Math.random() * Math.PI * 2,
            drift: 0.25 + Math.random() * 0.8,
            symbol: symbols[Math.floor(Math.random() * symbols.length)]
        });
    }

    const drawParticles = (time) => {
        if (disposed) return;
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        particles.forEach((particle) => {
            const drift = Math.sin(time / 1600 + particle.phase) * 10;
            context.globalAlpha = particle.opacity;
            context.fillStyle = '#D6B66F';
            context.font = `${particle.size}px serif`;
            context.fillText(particle.symbol, particle.x + drift, particle.y);
            particle.y -= particle.drift * 0.22;
            if (particle.y < -32) {
                particle.y = window.innerHeight + 24;
                particle.x = Math.random() * window.innerWidth;
            }
        });
        context.globalAlpha = 1;
        if (!prefersReducedMotion) animationFrame = window.requestAnimationFrame(drawParticles);
    };

    const closeSplash = () => {
        if (disposed) return;
        disposed = true;
        window.cancelAnimationFrame(animationFrame);
        window.clearTimeout(dismissTimer);
        window.removeEventListener('resize', resizeCanvas);
        document.removeEventListener('keydown', onKeydown);
        splash.classList.add('is-leaving');
        window.setTimeout(() => {
            splash.hidden = true;
            splash.classList.remove('is-visible', 'is-leaving');
        }, 650);
    };

    window.addEventListener('resize', resizeCanvas);
    if (skipButton) skipButton.addEventListener('click', closeSplash, { once: true });
    document.addEventListener('keydown', onKeydown);

    splash.hidden = false;
    window.requestAnimationFrame(() => splash.classList.add('is-visible'));
    if (skipButton) skipButton.focus({ preventScroll: true });
    animationFrame = window.requestAnimationFrame(drawParticles);
    dismissTimer = window.setTimeout(closeSplash, prefersReducedMotion ? 1800 : 3600);
}

function calculateROI() {
        const priceInput = document.getElementById('calc-price');
        const costInput = document.getElementById('calc-cost');
        const deliveryInput = document.getElementById('calc-delivery');
        const budgetInput = document.getElementById('calc-budget');
        const ordersEl = document.getElementById('res-orders');
        const revenueEl = document.getElementById('res-revenue');
        const profitEl = document.getElementById('res-profit');
        const roasEl = document.getElementById('res-roas');

        if (!priceInput || !costInput || !deliveryInput || !budgetInput || !ordersEl || !revenueEl || !profitEl || !roasEl) {
            console.error('ROI calculator could not update because a required input or result element is missing.');
            return;
        }

        const price = Math.max(0, parseFloat(priceInput.value) || 0);
        const cost = Math.max(0, parseFloat(costInput.value) || 0);
        const delivery = Math.max(0, parseFloat(deliveryInput.value) || 0);
        const budget = Math.max(0, parseFloat(budgetInput.value) || 0);
        
        const estimatedOrders = Math.round((budget / 350) * 2.5);
        const grossRevenue = estimatedOrders * price;
        const totalCost = budget + (estimatedOrders * (cost + delivery));
        const netProfit = grossRevenue - totalCost;
        const roas = budget > 0 ? (grossRevenue / budget).toFixed(1) : 0;
        
        ordersEl.textContent = estimatedOrders.toLocaleString('en-IN') + ' Orders';
        revenueEl.textContent = '৳' + grossRevenue.toLocaleString('en-IN');

        const lossPopup = document.getElementById('loss-popup');
        
        if (netProfit >= 0) {
            profitEl.textContent = '৳' + netProfit.toLocaleString('en-IN');
            profitEl.className = 'text-3xl md:text-5xl font-black mt-2 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.6)]';
            if(lossPopup) lossPopup.classList.add('hidden');
        } else {
            profitEl.textContent = '-৳' + Math.abs(netProfit).toLocaleString('en-IN');
            profitEl.className = 'text-3xl md:text-5xl font-black mt-2 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.7)] animate-pulse';
            if(lossPopup) lossPopup.classList.remove('hidden');
        }
        
        roasEl.textContent = roas + 'x';
    }
    window.addEventListener('DOMContentLoaded', calculateROI);

function openAuditModal() {
    const modal = document.getElementById('audit-modal');
    if (modal) modal.classList.remove('hidden');
}
function closeAuditModal() {
    const modal = document.getElementById('audit-modal');
    if (modal) modal.classList.add('hidden');
}
function submitAudit() {
    const bizInput = document.getElementById('audit-biz');
    const phoneInput = document.getElementById('audit-phone');
    if (!bizInput || !phoneInput) {
        console.error('Audit request could not be submitted because a form field is missing.');
        return;
    }
    const biz = bizInput.value.trim();
    const phone = phoneInput.value.trim();
    if(!biz || !phone) {
        alert('Please fill in your business name and WhatsApp number.');
        return;
    }
    const message = new URLSearchParams({
        text: `Hello Quixo, I want to claim my Free Page and Ad Audit. Business: ${biz}. Phone: ${phone}`
    });
    window.open(`https://wa.me/8801895681235?${message}`, '_blank', 'noopener,noreferrer');
    closeAuditModal();
}

const translations = {
        en: {
            heroTitle: "স্মার্ট মার্কেটিং। বড় গ্রোথ।",
            heroDesc: "Empowering Bangladeshi E-Commerce & F-Commerce brands with high-converting Facebook ads, viral reels, and elite marketing systems.",
            trialBtn: "Start 7-Day Free Trial",
            scaleBtn: "✨ আপনার বিজনেস স্কেল করতে প্রস্তুত? ↓",
            pricingTitle: "Transparent Pricing Plans",
            calcTitle: "ROI Growth Calculator"
        },
        bn: {
            heroTitle: "স্মার্ট মার্কেটিং। আরও বড় গ্রোথ।",
            heroDesc: "বাংলাদেশের ই-কমার্স ও এফ-কমার্স ব্র্যান্ডগুলোর জন্য হাই-কনভার্টিং ফেসবুক অ্যাডস, ভাইরাল রিলস এবং প্রিমিয়াম মার্কেটিং সলিউশন।",
            trialBtn: "৭ দিনের ফ্রি ট্রায়াল শুরু করুন",
            scaleBtn: "✨ আপনার বিজনেস স্কেল করতে প্রস্তুত?",
            pricingTitle: "স্বচ্ছ প্যাকেজ ও মূল্যতালিকা",
            calcTitle: "আরওআই গ্রোথ ক্যালকুলেটর"
        }
    };

    function switchLanguage(lang) {
        const btnEn = document.getElementById('lang-en');
        const btnBn = document.getElementById('lang-bn');
        if(lang === 'bn') {
            if(btnBn) btnBn.className = 'text-xs font-black px-3 py-1.5 rounded-lg bg-[#C5A059] text-black transition-all';
            if(btnEn) btnEn.className = 'text-xs font-black px-3 py-1.5 rounded-lg text-[#C5A059] hover:bg-[#C5A059]/20 transition-all';
            setPreference('quixo_lang', 'bn');
            document.querySelectorAll('[data-en]').forEach(el => {
                if(el.dataset.bn) el.innerText = el.dataset.bn;
            });
        } else {
            if(btnEn) btnEn.className = 'text-xs font-black px-3 py-1.5 rounded-lg bg-[#C5A059] text-black transition-all';
            if(btnBn) btnBn.className = 'text-xs font-black px-3 py-1.5 rounded-lg text-[#C5A059] hover:bg-[#C5A059]/20 transition-all';
            setPreference('quixo_lang', 'en');
            document.querySelectorAll('[data-en]').forEach(el => {
                if(el.dataset.en) el.innerText = el.dataset.en;
            });
        }
    }

document.addEventListener('click', function(e) {
        let target = e.target.closest('a, button');
        if (!target) return;
        let text = target.innerText.toLowerCase();
        let href = target.getAttribute('href') || '';
        
        if (text.includes('scale') || text.includes('pricing') || text.includes('package') || text.includes('trial') || href.includes('pricing') || href.includes('packages')) {
            let pricingSec = document.getElementById('pricing') || document.getElementById('packages');
            if (pricingSec) {
                e.preventDefault();
                pricingSec.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });

function toggleTheme() {
        const body = document.body;
        const icon = document.getElementById('theme-icon');
        const btn = document.getElementById('theme-toggle-btn');

        const applyTheme = () => {
            body.classList.toggle('light-mode');
            const isLight = body.classList.contains('light-mode');

            if (isLight) {
                icon.innerText = '🌙';
                btn.style.background = '#FFFFFF';
                btn.style.borderColor = '#C5A059';
                setPreference('quixo_theme', 'light');
            } else {
                icon.innerText = '☀️';
                btn.style.background = '#000000';
                btn.style.borderColor = 'rgba(197, 160, 89, 0.4)';
                setPreference('quixo_theme', 'dark');
            }
        };

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            applyTheme();
            return;
        }

        if (typeof document.startViewTransition === 'function') {
            document.startViewTransition(() => {
                const bounds = btn.getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                const originX = ((bounds.left + bounds.width / 2) / viewportWidth) * 100;
                const originY = ((bounds.top + bounds.height / 2) / viewportHeight) * 100;

                document.documentElement.style.setProperty('--theme-origin-x', `${originX}%`);
                document.documentElement.style.setProperty('--theme-origin-y', `${originY}%`);
                applyTheme();
            });
            return;
        }

        body.classList.add('theme-transitioning');
        applyTheme();
        window.setTimeout(() => body.classList.remove('theme-transitioning'), 800);
    }

    // Apply saved theme on load
    window.addEventListener('DOMContentLoaded', () => {
            const menuButton = document.getElementById('mobile-menu-toggle');
            const menu = document.getElementById('primary-navigation');
            const menuPath = document.querySelector('#mobile-menu-icon path');
            const backToTopButton = document.getElementById('back-to-top');

            if (backToTopButton) {
                const updateBackToTopVisibility = () => {
                    backToTopButton.classList.toggle('hidden', window.scrollY < 400);
                };

                backToTopButton.addEventListener('click', () => {
                    window.scrollTo({
                        top: 0,
                        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
                    });
                });

                window.addEventListener('scroll', updateBackToTopVisibility, { passive: true });
                updateBackToTopVisibility();
            }

            if (menuButton && menu && menuPath) {
                const setMenuOpen = (isOpen) => {
                    menu.classList.toggle('is-open', isOpen);
                    menuButton.setAttribute('aria-expanded', String(isOpen));
                    menuButton.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
                    menuPath.setAttribute('d', isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16');
                };

                menuButton.addEventListener('click', () => {
                    setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
                });

                menu.querySelectorAll('a').forEach((link) => {
                    link.addEventListener('click', () => setMenuOpen(false));
                });

                document.addEventListener('keydown', (event) => {
                    if (event.key === 'Escape') setMenuOpen(false);
                });

                window.matchMedia('(min-width: 768px)').addEventListener('change', (event) => {
                    if (event.matches) setMenuOpen(false);
                });
            }

            const savedTheme = getPreference('quixo_theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
            const icon = document.getElementById('theme-icon');
            const btn = document.getElementById('theme-toggle-btn');
            if(icon) icon.innerText = '🌙';
            if(btn) { btn.style.background = '#FFFFFF'; btn.style.borderColor = '#C5A059'; }
        }
        startWelcomeAnimation();
    });
