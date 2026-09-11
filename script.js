document.addEventListener('DOMContentLoaded', () => {

    /* =========================================================
       1. THEME TOGGLE (light / dark) - persisted in localStorage
       ========================================================= */
    const root = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('koketso-theme');
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

    function applyTheme(theme) {
        root.setAttribute('data-theme', theme);
        themeToggle?.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
        themeToggle?.setAttribute('aria-label', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
    }

    applyTheme(savedTheme || (prefersLight ? 'light' : 'dark'));

    themeToggle?.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        applyTheme(next);
        localStorage.setItem('koketso-theme', next);
    });

    /* =========================================================
       2. MOBILE HAMBURGER MENU
       ========================================================= */
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobileNav');

    function closeMobileNav() {
        hamburger?.classList.remove('open');
        mobileNav?.classList.remove('open');
        hamburger?.setAttribute('aria-expanded', 'false');
    }

    hamburger?.addEventListener('click', () => {
        const isOpen = hamburger.classList.toggle('open');
        mobileNav?.classList.toggle('open', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    mobileNav?.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closeMobileNav);
    });

    /* =========================================================
       3. SCROLL PROGRESS BAR
       ========================================================= */
    const scrollProgress = document.getElementById('scrollProgress');
    function updateScrollProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        if (scrollProgress) scrollProgress.style.width = pct + '%';
    }

    /* =========================================================
       4. BACK TO TOP BUTTON
       ========================================================= */
    const backToTop = document.getElementById('backToTop');
    function updateBackToTop() {
        if (window.scrollY > 500) {
            backToTop?.classList.add('show');
        } else {
            backToTop?.classList.remove('show');
        }
    }
    backToTop?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* =========================================================
       5. SCROLLSPY - highlight active nav link
       ========================================================= */
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    const sections = Array.from(navLinks)
        .map((link) => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    function updateActiveNav() {
        let currentId = '';
        const scrollPos = window.scrollY + 140;
        sections.forEach((section) => {
            if (section.offsetTop <= scrollPos) {
                currentId = section.id;
            }
        });
        navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
        });
    }

    /* Combine scroll listeners for performance */
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateScrollProgress();
                updateBackToTop();
                updateActiveNav();
                ticking = false;
            });
            ticking = true;
        }
    });
    updateScrollProgress();
    updateBackToTop();
    updateActiveNav();

    /* =========================================================
       6. TYPEWRITER EFFECT - types out roles word for word
       ========================================================= */
    const typedTextEl = document.getElementById('typedText');
    const roles = [
        'Full-Stack Web Developer Trainee',
        'Graphic Designer',
        'UI Enthusiast',
        'Problem Solver'
    ];

    if (typedTextEl && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        let roleIndex = 0;
        let charIndex = 0;
        let deleting = false;

        function typeLoop() {
            const currentRole = roles[roleIndex];

            if (!deleting) {
                charIndex++;
                typedTextEl.textContent = currentRole.slice(0, charIndex);
                if (charIndex === currentRole.length) {
                    deleting = true;
                    setTimeout(typeLoop, 1500);
                    return;
                }
            } else {
                charIndex--;
                typedTextEl.textContent = currentRole.slice(0, charIndex);
                if (charIndex === 0) {
                    deleting = false;
                    roleIndex = (roleIndex + 1) % roles.length;
                }
            }
            setTimeout(typeLoop, deleting ? 35 : 65);
        }
        typeLoop();
    } else if (typedTextEl) {
        typedTextEl.textContent = roles[0];
    }

    /* =========================================================
       7. ANIMATED STAT COUNTERS
       ========================================================= */
    const statNumbers = document.querySelectorAll('.stat-number');
    function animateCount(el) {
        const target = parseInt(el.getAttribute('data-count'), 10) || 0;
        const duration = 1200;
        const start = performance.now();

        function step(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target);
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target;
            }
        }
        requestAnimationFrame(step);
    }

    /* =========================================================
       8. INTERSECTION OBSERVER - reveal-on-scroll + skill bars + counters
       ========================================================= */
    const revealEls = document.querySelectorAll('.reveal');
    const skillBars = document.querySelectorAll('.skill-bar span');
    let countersAnimated = false;
    let barsAnimated = false;

    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            if (entry.target.classList.contains('reveal')) {
                entry.target.classList.add('in-view');
            }

            if (entry.target.id === 'stack-proficiency' && !barsAnimated) {
                barsAnimated = true;
                skillBars.forEach((bar) => {
                    bar.style.width = bar.getAttribute('style').match(/width:\s*([\d.]+%)/)?.[1] || bar.style.width;
                });
            }

            if (entry.target.classList.contains('hero-stats') && !countersAnimated) {
                countersAnimated = true;
                statNumbers.forEach(animateCount);
            }
        });
    }, { threshold: 0.2 });

    revealEls.forEach((el) => io.observe(el));
    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) io.observe(statsSection);
    const stackSection = document.getElementById('stack-proficiency');
    if (stackSection) io.observe(stackSection);

    /* Skill bars already have inline width set in HTML; ensure they start at 0
       then fill in once visible for a nicer effect. */
    skillBars.forEach((bar) => {
        const target = bar.style.width;
        bar.setAttribute('data-target-width', target);
        bar.style.width = '0%';
    });
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('.skill-bar span').forEach((bar) => {
                    bar.style.width = bar.getAttribute('data-target-width');
                });
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    document.querySelectorAll('.stack-card').forEach((card) => skillObserver.observe(card));

    /* =========================================================
       8b. LIVE-SITE SLIDESHOW (Run4U) - auto-pan when in view
       ========================================================= */
    const siteSlideshows = document.querySelectorAll('.site-slideshow[data-autoplay="true"]');
    if (siteSlideshows.length) {
        const slideshowObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                entry.target.classList.toggle('active', entry.isIntersecting);
            });
        }, { threshold: 0.35 });
        siteSlideshows.forEach((el) => slideshowObserver.observe(el));
    }

    /* =========================================================
       8c. GRAPHIC DESIGN VIDEO CARDS - play on hover / in view
       ========================================================= */
    const gridVideos = document.querySelectorAll('.grid-video');
    gridVideos.forEach((video) => {
        const wrapper = video.closest('.grid-item-video');
        wrapper?.addEventListener('mouseenter', () => video.play().catch(() => {}));
        wrapper?.addEventListener('mouseleave', () => { video.pause(); video.currentTime = 0; });

        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    video.play().catch(() => {});
                } else {
                    video.pause();
                }
            });
        }, { threshold: 0.5 });
        videoObserver.observe(video);
    });

    /* =========================================================
       9. PROJECT FILTER TOGGLE
       ========================================================= */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            filterBtns.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');

            projectCards.forEach((card) => {
                const tags = card.getAttribute('data-tags') || '';
                const show = filter === 'all' || tags.split(' ').includes(filter);
                card.classList.toggle('filtered-out', !show);
            });
        });
    });

    /* =========================================================
       10. COPY EMAIL TO CLIPBOARD
       ========================================================= */
    const copyToast = document.getElementById('copyToast');
    document.querySelectorAll('[data-copy]').forEach((el) => {
        el.addEventListener('click', (e) => {
            const value = el.getAttribute('data-copy');
            if (navigator.clipboard && value) {
                e.preventDefault();
                navigator.clipboard.writeText(value).then(() => {
                    copyToast?.classList.add('show');
                    setTimeout(() => copyToast?.classList.remove('show'), 2000);
                    setTimeout(() => { window.location.href = 'mailto:' + value; }, 350);
                }).catch(() => {
                    window.location.href = 'mailto:' + value;
                });
            }
        });
    });

    /* =========================================================
       11. FOOTER YEAR
       ========================================================= */
    const footerYear = document.getElementById('footerYear');
    if (footerYear) footerYear.textContent = new Date().getFullYear();

    /* =========================================================
       12. CASE STUDY MODAL
       ========================================================= */
    const caseStudyContent = {
        'tesla-case-study': {
            title: 'Tesla Landing Page Clone',
            summary: 'A polished landing page clone focused on premium spacing, full-screen hero presentation, and responsive layout behavior.',
            points: [
                'Built a visually clean layout that mirrors the Tesla brand feel.',
                'Used CSS positioning and responsive design to keep content centered and readable.',
                'Learned how to create immersive hero sections without breaking on smaller screens.'
            ]
        },
        'todo-case-study': {
            title: 'My To-Do List Application',
            summary: 'A functional app that lets users add, complete, and remove tasks while keeping the interface simple and interactive.',
            points: [
                'Implemented interactive task behavior with JavaScript.',
                'Focused on clarity and a clean task flow for users.',
                'Learned how to update the DOM dynamically based on user actions.'
            ]
        },
        'netflix-case-study': {
            title: 'Netflix Landing Page Project',
            summary: 'A responsive landing page that recreates the feel of the Netflix homepage with a focus on structure and visual identity.',
            points: [
                'Recreated the key hero area and content sections with HTML and CSS.',
                'Built a polished dark theme that reflects the platform\u2019s brand.',
                'Improved layout skills through careful spacing and component structure.'
            ]
        },
        'ui-screenshot-case-study': {
            title: 'UI Screenshot Layout Project',
            summary: 'A design-focused front-end build translated from a visual reference into a real webpage.',
            points: [
                'Focused on accurate layout matching and visual hierarchy.',
                'Learned how to layer transparent UI elements and overlays elegantly.',
                'Improved precision in spacing, padding, and component composition.'
            ]
        },
        'youtube-case-study': {
            title: 'YouTube Clone Project',
            summary: 'A responsive video gallery experience designed to feel familiar and modern while staying lightweight.',
            points: [
                'Organized content into a flexible card-based layout.',
                'Used CSS and JavaScript to improve the overall browsing experience.',
                'Learned how to build responsive content areas that adapt smoothly to different screen sizes.'
            ]
        },
        'twitter-case-study': {
            title: 'Twitter Landing Page Project',
            summary: 'A clean social-style landing page designed with a simple structure and polished visual balance.',
            points: [
                'Built a clear two-column layout with thoughtful spacing.',
                'Focused on readability, contrast, and modern UI feel.',
                'Improved understanding of responsive web page composition.'
            ]
        },
        'searchbar-case-study': {
            title: 'Live Search Bar Project',
            summary: 'A responsive search experience designed to feel fast, modern, and intuitive for users.',
            points: [
                'Implemented a live search interaction with JavaScript.',
                'Focused on a clean interface that works well on mobile and desktop.',
                'Learned how to tie user input directly to visible results in real time.'
            ]
        },
        'bible-case-study': {
            title: 'My Bible Verses Project',
            summary: 'A simple and welcoming app experience focused on browsing and finding Bible verses with ease.',
            points: [
                'Built a user-friendly interface centered on readability and navigation.',
                'Used React-based structure to keep the project organized.',
                'Learned how to present content clearly in a minimal, focused layout.'
            ]
        },
        'google-keep-case-study': {
            title: 'Google Keep React App',
            summary: 'A note-taking inspired app designed to feel practical, bright, and easy to interact with.',
            points: [
                'Created a lightweight note-based experience with a clean UI.',
                'Focused on usability, interaction flow, and visual simplicity.',
                'Learned how to structure a React project around reusable content blocks.'
            ]
        },
        'run4u-case-study': {
            title: 'RUN4U Website',
            summary: 'A personal project extending the RUN4U brand identity — first designed as a logo and poster (see Graphic Design) — into a live website for a personal shopping and errand-running service in Johannesburg.',
            points: [
                'Carried a single brand identity across both graphic design and web development.',
                'Built a browsable product catalog with category filters and a deposit cost calculator.',
                'Connected every product directly to a pre-filled WhatsApp order message for fast, real ordering.',
                'Deployed and hosted live on Vercel for real-world access.'
            ]
        },
        'mzansi-case-study': {
            title: 'Inside Mzansi Website',
            summary: 'A brand-style website project built to practice structuring multi-section pages with clean, modern styling.',
            points: [
                'Structured a multi-section site with clear visual hierarchy.',
                'Used JavaScript to add small interactive touches across the page.',
                'Practiced deploying and version-controlling a full project end-to-end.'
            ]
        }
    };

    const caseStudyModal = document.getElementById('case-study-modal');
    const caseStudyModalBody = document.getElementById('case-study-modal-body');
    const caseStudyCloseButton = document.querySelector('.case-study-close');

    function closeCaseStudyModal() {
        if (!caseStudyModal) return;
        caseStudyModal.classList.remove('open');
        caseStudyModal.setAttribute('aria-hidden', 'true');
        caseStudyModalBody.innerHTML = '';
        document.body.classList.remove('modal-open');
    }

    function openCaseStudyModal(targetId) {
        const content = caseStudyContent[targetId];
        if (!content || !caseStudyModal || !caseStudyModalBody) return;

        caseStudyModalBody.innerHTML = `
            <div class="case-study-modal-box">
                <h3>${content.title}</h3>
                <p>${content.summary}</p>
                <ul>${content.points.map((point) => `<li>${point}</li>`).join('')}</ul>
            </div>
        `;

        caseStudyModal.classList.add('open');
        caseStudyModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        caseStudyCloseButton?.focus();
    }

    document.querySelectorAll('a[href*="case-study"]').forEach((button) => {
        button.addEventListener('click', (event) => {
            const targetId = button.getAttribute('href')?.slice(1);
            if (!targetId) return;
            event.preventDefault();
            openCaseStudyModal(targetId);
        });
    });

    caseStudyCloseButton?.addEventListener('click', closeCaseStudyModal);
    caseStudyModal?.addEventListener('click', (event) => {
        if (event.target === caseStudyModal) closeCaseStudyModal();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && caseStudyModal?.classList.contains('open')) {
            closeCaseStudyModal();
        }
    });
});
