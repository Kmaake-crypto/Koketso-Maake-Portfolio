document.addEventListener('DOMContentLoaded', () => {

    /*1. THEME TOGGLE (light / dark) - persisted in localStorage*/
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

    /*  2. MOBILE HAMBURGER MENU*/
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

    /*3. SCROLL PROGRESS BAR*/
    const scrollProgress = document.getElementById('scrollProgress');
    function updateScrollProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        if (scrollProgress) scrollProgress.style.width = pct + '%';
    }

    /* 4. BACK TO TOP BUTTON*/
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

    /* 5. SCROLLSPY - highlight active nav link */
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

    /* 6. TYPEWRITER EFFECT - types out roles word for word */
    const typedTextEl = document.getElementById('typedText');
    const roles = [
        'Full-Stack Web Developer',
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

    /*7. ANIMATED STAT COUNTERS */
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

    /* 8. INTERSECTION OBSERVER - reveal-on-scroll + skill bars + counters */
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

    /*8b. LIVE-SITE SLIDESHOW (Run4U) - auto-pan when in view*/
    const siteSlideshows = document.querySelectorAll('.site-slideshow[data-autoplay="true"]');
    if (siteSlideshows.length) {
        const slideshowObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                entry.target.classList.toggle('active', entry.isIntersecting);
            });
        }, { threshold: 0.35 });
        siteSlideshows.forEach((el) => slideshowObserver.observe(el));
    }

    /* 8c. GRAPHIC DESIGN VIDEO CARDS - play on hover / in view */
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

    /*9. PROJECT FILTER TOGGLE */
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

    /*10. COPY EMAIL TO CLIPBOARD */
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
       =======*/
    const footerYear = document.getElementById('footerYear');
    if (footerYear) footerYear.textContent = new Date().getFullYear();

    /* =========================================================
       12. CASE STUDY MODAL
       ========================================================= */
    const caseStudyContent = {
        'tesla-case-study': {
            title: 'Tesla Landing Page Clone',
            summary: 'A pixel-accurate clone of the Tesla homepage focused on premium spacing, full-screen hero presentation, and responsive layout.',
            problem: 'Recreating a premium brand\'s web presence requires more than copying layout — it demands understanding how whitespace, typography weight, and full-bleed imagery combine to communicate luxury and trust.',
            solution: 'Built the hero section using full-viewport height with carefully tuned CSS positioning. Matched Tesla\'s font weights and spacing ratios to preserve the brand\'s premium feel across desktop and mobile.',
            points: [
                'Full-screen hero section with overlay text and CTA buttons.',
                'CSS Flexbox used for section layout and nav alignment.',
                'Responsive breakpoints ensure no content breaks on smaller screens.'
            ]
        },
        'todo-case-study': {
            title: 'My To-Do List Application',
            summary: 'A functional task manager that lets users add, complete, and remove tasks with a clean and interactive interface.',
            problem: 'Building a to-do app sounds simple — but managing live DOM updates, state changes, and user interactions without a framework requires careful JavaScript structure.',
            solution: 'Used vanilla JavaScript to capture user input, push tasks into an array, and dynamically render list items. Each task has its own delete and complete toggle tied directly to DOM events.',
            points: [
                'Dynamic task creation and removal via DOM manipulation.',
                'Completion toggle updates visual state without a page reload.',
                'Clean UI keeps focus on usability over decoration.'
            ]
        },
        'netflix-case-study': {
            title: 'Netflix Landing Page Project',
            summary: 'A responsive Netflix homepage clone focused on structure, dark theme identity, and content hierarchy.',
            problem: 'Netflix\'s homepage uses a layered dark aesthetic with bold headers and clear CTAs — replicating it means handling background overlays, gradient text, and responsive content stacking correctly.',
            solution: 'Structured the page using semantic HTML sections with background image overlays and linear gradients. Used CSS Grid for the feature rows and ensured the email CTA section collapsed cleanly on mobile.',
            points: [
                'Dark theme with gradient overlays on the hero background image.',
                'Feature section rows built with CSS Grid for alignment.',
                'Responsive stacking of content blocks on small screens.'
            ]
        },
        'ui-screenshot-case-study': {
            title: 'UI Screenshot Layout Project',
            summary: 'A front-end build that translates a static visual design reference into a real, working webpage.',
            problem: 'Given only a screenshot as a reference, the challenge was to reverse-engineer spacing, font sizes, component structure, and overlay effects without any design file or measurements.',
            solution: 'Used browser DevTools to estimate proportions and rebuilt the layout from scratch using HTML and CSS. Focused on visual hierarchy, transparent UI layers, and matching the original\'s composition as closely as possible.',
            points: [
                'Layout reconstructed purely from visual inspection.',
                'Transparent UI elements and filter overlays applied with CSS.',
                'Precise spacing and padding tuned to match the reference closely.'
            ]
        },
        'youtube-case-study': {
            title: 'YouTube Clone Project',
            summary: 'A responsive YouTube UI clone that replicates the video grid, sidebar, and navigation structure.',
            problem: 'YouTube\'s interface is dense — a sidebar, a top nav, and a responsive video grid that needs to reflow cleanly across screen sizes without losing its familiar structure.',
            solution: 'Used CSS Grid for the video card layout with auto-fill columns that reflow at breakpoints. Built the sidebar and top nav as fixed components and used JavaScript to handle basic interaction states.',
            points: [
                'Responsive video grid using CSS Grid with auto-fill columns.',
                'Sidebar and top navigation match YouTube\'s structure.',
                'JavaScript handles hover states and basic UI interactions.'
            ]
        },
        'twitter-case-study': {
            title: 'Twitter Landing Page Project',
            summary: 'A clean social-style landing page with a two-column layout, polished typography, and modern visual balance.',
            problem: 'Twitter\'s landing page relies on a confident two-column split — bold headline on one side, sign-up form on the other — and getting that balance right on all screen sizes is the core challenge.',
            solution: 'Used Flexbox to build the two-column split with a clear visual hierarchy. Styled the form elements and buttons to match the brand\'s signature blue while adding JavaScript for subtle interactive touches.',
            points: [
                'Two-column Flexbox layout with responsive stacking on mobile.',
                'Brand-consistent button and input styling.',
                'JavaScript adds interactive feedback to form elements.'
            ]
        },
        'searchbar-case-study': {
            title: 'Live Search Bar — Group Project',
            summary: 'A responsive live search component that filters results in real time as the user types.',
            problem: 'Search bars that feel instant require filtering logic that runs on every keystroke without causing layout shifts or delays — and the UI needs to communicate results clearly without clutter.',
            solution: 'Built the filter function in JavaScript using input event listeners and array filtering. Results update live with each keypress and the UI highlights matching terms. Collaborated via GitHub with team members for version control.',
            points: [
                'Live filtering on every keypress using JavaScript event listeners.',
                'Array filter logic matches input against a dataset in real time.',
                'Collaborated on GitHub — merged branches and resolved conflicts.'
            ]
        },
        'bible-case-study': {
            title: 'My Bible Verses App',
            summary: 'A daily Bible verse app built with React that lets users browse and read verses with a clean, focused interface.',
            problem: 'Displaying structured scripture data in a readable, navigable way requires a component architecture that keeps content organised and the interface distraction-free.',
            solution: 'Built using React with a component-based structure — verse data is stored and passed through props, with state managing the currently displayed verse. The UI is intentionally minimal to keep the reading experience calm.',
            points: [
                'React component structure with props and state for verse display.',
                'Minimal UI designed around readability and focus.',
                'Deployed on Netlify with clean routing for direct verse access.'
            ]
        },
        'google-keep-case-study': {
            title: 'Google Keep React Clone',
            summary: 'A note-taking app inspired by Google Keep, built with React, featuring note creation, colour coding, and deletion.',
            problem: 'A note app needs to feel lightweight and instant — adding, editing, and deleting notes should feel fluid, and the card grid layout must reflow cleanly as notes are added or removed.',
            solution: 'Used React state to manage the notes array, rendering each note as a reusable card component. The add/delete flow updates state directly and the grid reflows using CSS auto-fill columns.',
            points: [
                'React state manages the full notes array dynamically.',
                'Reusable NoteCard component renders each note independently.',
                'CSS Grid auto-fill layout reflows as notes are added or removed.'
            ]
        },
        'run4u-case-study': {
            title: 'RUN4U Website',
            summary: 'A live website built for RUN4U — a personal shopping and errand-running service in Johannesburg — extending the brand identity from logo and poster design into a fully functioning site.',
            problem: 'RUN4U needed more than a brochure site — customers needed to browse a real product catalog, understand pricing, and place orders fast without a complex checkout system.',
            solution: 'Built a browsable catalog with category filters and a deposit cost calculator. Every product links to a pre-filled WhatsApp message so customers can order in one tap. The brand identity from the logo and poster designs (see Graphic Design) was carried through into the site\'s visual language.',
            points: [
                'Product catalog with category filter built in JavaScript.',
                'Deposit calculator updates costs dynamically per selection.',
                'One-tap WhatsApp ordering via pre-filled message links.',
                'Brand identity consistent across graphic design and web build.',
                'Deployed and live on Vercel for real-world customer access.'
            ]
        },
        'mzansi-case-study': {
            title: 'Inside Mzansi Website',
            summary: 'A self-driven brand-style website exploring South African culture and identity through bold editorial web design.',
            problem: 'Building a multi-section editorial site from scratch — without a template — requires planning clear content hierarchy, consistent visual identity, and smooth section-to-section flow.',
            solution: 'Structured the site around distinct content panels with a consistent typographic system and colour palette. Used JavaScript for interactive elements and scroll-based transitions. Deployed and version-controlled end-to-end on GitHub and Netlify.',
            points: [
                'Multi-section editorial layout with strong typographic hierarchy.',
                'Consistent visual identity across all panels.',
                'JavaScript powers scroll interactions and animated transitions.',
                'Full Git workflow — committed, pushed, and deployed on Netlify.'
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
                <div class="cs-block">
                    <h4 class="cs-label">Problem</h4>
                    <p>${content.problem}</p>
                </div>
                <div class="cs-block">
                    <h4 class="cs-label">Solution</h4>
                    <p>${content.solution}</p>
                </div>
                <div class="cs-block">
                    <h4 class="cs-label">Key Highlights</h4>
                    <ul>${content.points.map((point) => `<li>${point}</li>`).join('')}</ul>
                </div>
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
