/** Before DOMContentLoaded */
let scrollY = 0;

function initScrollReveal() {
    const revealElements = document.querySelectorAll('.left, .right, .up, .down');
    if (!revealElements.length) return;

    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    }

    function revealVisibleElements() {
        revealElements.forEach(el => {
            if (isElementInViewport(el)) {
                el.classList.add('revealed');
            }
        });
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            } else {
                entry.target.classList.remove('revealed');
            }
        });
    }, { threshold: 0 });

    revealElements.forEach(el => observer.observe(el));
    revealVisibleElements();

    window.addEventListener('load', revealVisibleElements);
}

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

        initScrollReveal();
    }, { once: true });
}

lockScroll();

if (document.readyState === "complete") {
    hidePreloader();
} else {
    window.addEventListener("load", hidePreloader);
}

document.addEventListener('DOMContentLoaded', function () {

    /** Плавная прокрутка до элемента */
    function smoothScrollTo(targetId, offset = 80) {
        const targetElement = document.getElementById(targetId);
        if (!targetElement) return;

        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });

        // После окончания плавной прокрутки (с задержкой) обновляем активный класс
        setTimeout(() => updateActiveMenuItem(), 600);
    }

    /** Обновление активного пункта меню на основе видимой секции */
    function updateActiveMenuItem() {
        const smoothLinks = document.querySelectorAll('.smooth');
        if (!smoothLinks.length) return;

        // Собираем все цели и соответствующие им ссылки
        const targets = [];
        smoothLinks.forEach(link => {
            let targetId = null;
            if (link.getAttribute('href') && link.getAttribute('href').startsWith('#')) {
                targetId = link.getAttribute('href').substring(1);
            } else if (link.dataset.href) {
                targetId = link.dataset.href.startsWith('#') ? link.dataset.href.substring(1) : link.dataset.href;
            }
            if (targetId && document.getElementById(targetId)) {
                targets.push({ id: targetId, link });
            }
        });

        if (targets.length === 0) return;

        const scrollPos = window.pageYOffset + 120; // 120px – отступ от верха (настройте под ваш хедер)
        let activeId = null;

        // Ищем последний блок, который поднялся выше порога (чтобы подсвечивать текущий)
        for (let i = targets.length - 1; i >= 0; i--) {
            const target = document.getElementById(targets[i].id);
            if (target && target.offsetTop <= scrollPos) {
                activeId = targets[i].id;
                break;
            }
        }

        // Если ничего не найдено, возможно, верх страницы – тогда активен первый блок?
        if (!activeId && targets[0]) {
            activeId = targets[0].id;
        }

        // Устанавливаем/убираем класс active
        targets.forEach(({ link, id }) => {
            if (id === activeId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    /** Mobile menu */
    const navbarMenu = document.getElementById('navbar__menu');
    const navbarCollapse = document.getElementById('navbar');
    const body = document.body;
    const closeBtn = document.querySelector('.close-nav');

    if (navbarCollapse && navbarMenu) {
        navbarCollapse.addEventListener('click', function (e) {
            e.stopPropagation();
            this.classList.toggle('open');
            navbarMenu.classList.toggle('open');

            if (body.classList.contains('menu-open')) {
                setTimeout(() => body.classList.remove('menu-open'), 350);
            } else {
                body.classList.add('menu-open');
            }
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                navbarCollapse.classList.remove('open');
                navbarMenu.classList.remove('open');
                setTimeout(() => body.classList.remove('menu-open'), 350);
            });
        }

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && navbarCollapse.classList.contains('open')) {
                navbarCollapse.classList.remove('open');
                navbarMenu.classList.remove('open');
                setTimeout(() => body.classList.remove('menu-open'), 350);
            }
        });

        document.addEventListener('click', function (e) {
            const isSmooth = e.target.closest('.smooth');
            if (!isSmooth && !navbarCollapse.contains(e.target) && !navbarMenu.contains(e.target) && navbarCollapse.classList.contains('open')) {
                navbarCollapse.classList.remove('open');
                navbarMenu.classList.remove('open');
                setTimeout(() => body.classList.remove('menu-open'), 350);
            }
        });
    }

    document.addEventListener('click', function (e) {
        const smoothElement = e.target.closest('.smooth');
        if (!smoothElement) return;

        e.preventDefault();

        let targetId = null;
        if (smoothElement.getAttribute('href') && smoothElement.getAttribute('href').startsWith('#')) {
            targetId = smoothElement.getAttribute('href').substring(1);
        } else if (smoothElement.dataset.href) {
            targetId = smoothElement.dataset.href.startsWith('#') ? smoothElement.dataset.href.substring(1) : smoothElement.dataset.href;
        }

        if (targetId) {
            smoothScrollTo(targetId, 80);
        }

        if (navbarMenu && navbarMenu.contains(smoothElement)) {
            navbarCollapse.classList.remove('open');
            navbarMenu.classList.remove('open');
            setTimeout(() => body.classList.remove('menu-open'), 350);
        }
    });

    let throttleTimer;
    window.addEventListener('scroll', function () {
        if (throttleTimer) return;
        throttleTimer = setTimeout(() => {
            updateActiveMenuItem();
            throttleTimer = null;
        }, 100);
    });
    window.addEventListener('load', updateActiveMenuItem);
    window.addEventListener('resize', updateActiveMenuItem);

    /** FAQ */
    const faq = () => {
        const items = document.querySelectorAll('.block-btn');

        items.forEach(item => {
            item.addEventListener('click', () => {
                const question = item;
                const answer = item.nextElementSibling;

                if (!answer || !answer.classList) return;

                if (question.classList.contains('active')) {
                    question.classList.remove('active');
                    answer.classList.remove('open');
                } else {
                    items.forEach(btn => {
                        btn.classList.remove('active');
                        const sibling = btn.nextElementSibling;
                        if (sibling && sibling.classList) {
                            sibling.classList.remove('open');
                        }
                    });
                    question.classList.add('active');
                    answer.classList.add('open');
                }
            });
        });
    };

    faq();

    /** To top button */
    const scrollTopButton = document.getElementById('scroll-top');

    const getViewportHeight = () => window.innerHeight;

    const setupButtonVisibility = (button, showThreshold, viewportHeight) => {
        if (!button) return;

        const scrollPosition = window.scrollY || document.documentElement.scrollTop;

        if (scrollPosition > showThreshold) {
            button.style.display = 'flex';
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

    const toggleButtons = () => {
        const viewportHeight = getViewportHeight();

        setupButtonVisibility(scrollTopButton, viewportHeight, viewportHeight);
    };

    initButtonStyles(scrollTopButton);

    window.addEventListener('scroll', toggleButtons);

    toggleButtons();

    /** Swiper Slider */
    try {
        const swiperTestimonial = new Swiper(".testimonial-block", {
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
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
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

        const swiperCatalog = new Swiper(".catalog-block", {
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
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },

            breakpoints: {
                0: {
                    slidesPerView: 1,
                    spaceBetween: 12,
                    centeredSlides: false
                },
                577: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                    centeredSlides: false
                },
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 30,
                    centeredSlides: false
                },
                1400: {
                    slidesPerView: 4,
                    spaceBetween: 40,
                    centeredSlides: false
                }
            }
        });

        const swiperPartner = new Swiper(".partner-block", {
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
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },

            breakpoints: {
                0: {
                    slidesPerView: 1,
                    spaceBetween: 12,
                    centeredSlides: false
                },
                577: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                    centeredSlides: false
                },
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 30,
                    centeredSlides: false
                },
                1400: {
                    slidesPerView: 4,
                    spaceBetween: 40,
                    centeredSlides: false
                }
            }
        });

        const swiperAwards = new Swiper(".awards-block", {
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
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },

            breakpoints: {
                0: {
                    slidesPerView: 2,
                    spaceBetween: 12,
                    centeredSlides: false
                },
                577: {
                    slidesPerView: 3,
                    spaceBetween: 20,
                    centeredSlides: false
                },
                1024: {
                    slidesPerView: 4,
                    spaceBetween: 30,
                    centeredSlides: false
                },
                1400: {
                    slidesPerView: 5,
                    spaceBetween: 40,
                    centeredSlides: false
                }
            }
        });

        const swiperDoc = new Swiper(".doc-block", {
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
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },

            breakpoints: {
                0: {
                    slidesPerView: 1,
                    spaceBetween: 12,
                    centeredSlides: false
                },
                768: {
                    slidesPerView: 1,
                    spaceBetween: 20,
                    centeredSlides: true
                }
            }
        });

        const swiperProduct = new Swiper(".product-images", {
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
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },

            breakpoints: {
                0: {
                    slidesPerView: 1,
                    spaceBetween: 12,
                    centeredSlides: false
                },
                768: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                    centeredSlides: true
                }
                ,
                1200: {
                    slidesPerView: 3,
                    spaceBetween: 30,
                    centeredSlides: true
                }
            }
        });
    } catch (error) {
        console.error(error);
    }

    /** Language switcher */
    const langSwitcher = document.querySelector('.header-link-lang');
    if (langSwitcher) {
        langSwitcher.addEventListener('click', (e) => {
            e.preventDefault();
        });
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

            // if (menuList) {
            //     menuList.style.maxHeight = 'calc(100vh - 40px)';
            //     menuList.style.overflowY = 'auto';
            // }
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