let scrollY = 0;

function lockScroll() {
    scrollY = window.scrollY;

    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
}

function unlockScroll() {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';

    window.scrollTo(0, scrollY);
}

function hidePreloader() {
    const preloadElement = document.getElementById("preload");

    if (!preloadElement) return;

    preloadElement.style.opacity = "0";

    preloadElement.addEventListener('transitionend', () => {
        preloadElement.style.display = "none";

        document.body.classList.remove('is-loading');
        unlockScroll();
    }, { once: true });
}

lockScroll();

if (document.readyState === "complete") {
    hidePreloader();
} else {
    window.addEventListener("load", hidePreloader);
}

document.addEventListener('DOMContentLoaded', function () {

    /** Mobile menu */
    const navbarMenu = document.getElementById('navbar__menu');
    const navbarCollapse = document.getElementById('navbar');
    const body = document.body;

    if (navbarMenu && navbarCollapse) {
        navbarMenu.addEventListener('click', function () {
            this.classList.toggle('open');
            navbarCollapse.classList.toggle('open');

            if (body.classList.contains('menu-open')) {
                setTimeout(() => {
                    body.classList.remove('menu-open');
                }, 350);
            } else {
                body.classList.add('menu-open');
            }
        });

        const navLinks = navbarCollapse.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function () {
                navbarMenu.classList.remove('open');
                navbarCollapse.classList.remove('open');

                setTimeout(() => {
                    body.classList.remove('menu-open');
                }, 350);
            });
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && navbarCollapse.classList.contains('open')) {
                navbarMenu.classList.remove('open');
                navbarCollapse.classList.remove('open');

                setTimeout(() => {
                    body.classList.remove('menu-open');
                }, 350);
            }
        });

        document.addEventListener('click', function (e) {
            if (!navbarMenu.contains(e.target) &&
                !navbarCollapse.contains(e.target) &&
                navbarCollapse.classList.contains('open')) {
                navbarMenu.classList.remove('open');
                navbarCollapse.classList.remove('open');

                setTimeout(() => {
                    body.classList.remove('menu-open');
                }, 350);
            }
        });
    }

    /** To top and Call buttons */
    const scrollTopButton = document.getElementById('scroll-top');
    const callButton = document.getElementById('call');

    const getViewportHeight = () => window.innerHeight;

    const setupButtonVisibility = (button, showThreshold, viewportHeight) => {
        if (!button) return;

        const scrollPosition = window.scrollY || document.documentElement.scrollTop;

        if (scrollPosition > showThreshold) {
            button.style.display = 'block';
            setTimeout(() => {
                button.style.opacity = '1';
            }, 10);
        } else {
            button.style.opacity = '0';
            setTimeout(() => {
                if (window.scrollY <= showThreshold) {
                    button.style.display = 'none';
                }
            }, 300);
        }
    };

    const initButtonStyles = (button) => {
        if (!button) return;
        button.style.opacity = '0';
        button.style.display = 'none';
        button.style.transition = 'opacity 0.3s ease';
    };

    scrollTopButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    if (callButton) {
        callButton.addEventListener('click', (e) => {
            e.preventDefault();
        });
    }

    const toggleButtons = () => {
        const viewportHeight = getViewportHeight();

        setupButtonVisibility(scrollTopButton, viewportHeight, viewportHeight);
        setupButtonVisibility(callButton, viewportHeight * 0.2, viewportHeight);
    };

    initButtonStyles(scrollTopButton);
    initButtonStyles(callButton);

    window.addEventListener('scroll', toggleButtons);

    toggleButtons();

    /** Swiper Slider */
    try {
        const swiper = new Swiper(".swiper-slider", {
            loop: true,
            centeredSlides: true,
            slidesPerView: "auto",
            spaceBetween: 40,
            speed: 800,

            autoplay: {
                delay: 10000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            },

            keyboard: {
                enabled: true,
                onlyInViewport: true,
                pageUpDown: true,
            },

            navigation: {
                nextEl: ".swiper-next",
                prevEl: ".swiper-prev",
            },

            breakpoints: {
                0: {
                    slidesPerView: 1,
                    spaceBetween: 12,
                    centeredSlides: false
                },
                768: {
                    slidesPerView: "auto",
                    spaceBetween: 20,
                    centeredSlides: true
                }
            }
        });
    } catch (error) {
        console.error(error);
    }


    /** Article sticky menu */
    const stickyMenu = document.querySelector('.article__menu');
    if (!stickyMenu) return;

    const menuList = stickyMenu.querySelector('.article__list');
    let originalTop = stickyMenu.getBoundingClientRect().top + window.pageYOffset;
    let spacer = null;

    spacer = document.createElement('div');
    stickyMenu.parentNode.insertBefore(spacer, stickyMenu);

    function checkSticky() {
        if (window.innerWidth < 992) {
            if (stickyMenu.hasAttribute('data-sticky')) {
                stickyMenu.removeAttribute('data-sticky');
                spacer.style.display = 'none';
                stickyMenu.style.position = '';
                stickyMenu.style.top = '';
                stickyMenu.style.left = '';
                stickyMenu.style.width = '';
                stickyMenu.style.zIndex = '';
                if (menuList) {
                    menuList.style.maxHeight = '';
                    menuList.style.overflowY = '';
                }
            }
            return;
        }

        const scrollTop = window.pageYOffset;
        const shouldSticky = scrollTop + 20 > originalTop;

        if (shouldSticky && !stickyMenu.hasAttribute('data-sticky')) {
            stickyMenu.setAttribute('data-sticky', 'true');
            const rect = stickyMenu.getBoundingClientRect();

            spacer.style.display = 'block';
            spacer.style.height = rect.height + 'px';

            stickyMenu.style.position = 'fixed';
            stickyMenu.style.top = '20px';
            stickyMenu.style.left = rect.left + 'px';
            stickyMenu.style.width = rect.width + 'px';
            stickyMenu.style.zIndex = '1000';

            if (menuList) {
                menuList.style.maxHeight = 'calc(100vh - 40px)';
                menuList.style.overflowY = 'auto';
            }
        } else if (!shouldSticky && stickyMenu.hasAttribute('data-sticky')) {
            stickyMenu.removeAttribute('data-sticky');

            spacer.style.display = 'none';
            stickyMenu.style.position = '';
            stickyMenu.style.top = '';
            stickyMenu.style.left = '';
            stickyMenu.style.width = '';
            stickyMenu.style.zIndex = '';

            if (menuList) {
                menuList.style.maxHeight = '';
                menuList.style.overflowY = '';
            }
        }
    }

    function handleResize() {
        originalTop = stickyMenu.getBoundingClientRect().top + window.pageYOffset;
        if (stickyMenu.hasAttribute('data-sticky')) {
            const rect = stickyMenu.getBoundingClientRect();
            stickyMenu.style.left = rect.left + 'px';
            stickyMenu.style.width = rect.width + 'px';
        }
        checkSticky();
    }

    window.addEventListener('scroll', checkSticky);
    window.addEventListener('resize', handleResize);

    checkSticky();


    /** Build article menu */
    try {
        buildArticleMenu();

        function buildArticleMenu({
            contentSelector = '.article__content',
            menuSelector = '.article__list',
            offset = 130
        } = {}) {
            const section = document.querySelector(contentSelector);
            const sidebarMenu = document.querySelector(menuSelector);

            if (!section || !sidebarMenu) return;

            const headings = section.querySelectorAll('h1, h2, h3, h4, h5, h6');

            headings.forEach((heading, index) => {
                const id = heading.id || `heading-${index}`;
                heading.id = id;

                const li = document.createElement('li');
                const a = document.createElement('a');

                a.classList.add('article__link');
                a.textContent = heading.textContent;
                a.href = `#${id}`;

                a.addEventListener('click', (e) => {
                    e.preventDefault();

                    const target = document.getElementById(id);
                    if (!target) return;

                    const top =
                        target.getBoundingClientRect().top +
                        window.pageYOffset -
                        offset;

                    window.scrollTo({
                        top,
                        behavior: 'smooth'
                    });
                });

                li.appendChild(a);
                sidebarMenu.appendChild(li);
            });
        }
    } catch (e) {
        console.error('Article script error:', e);
    }
});