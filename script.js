// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar background on scroll
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

if (navbar) {
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.boxShadow = 'none';
        }

        lastScroll = currentScroll;
    });
}

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all sections and cards
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section');
    const cards = document.querySelectorAll('.project-card, .challenge-card');

    sections.forEach(section => {
        observer.observe(section);
    });

    cards.forEach(card => {
        observer.observe(card);
    });
});

// Contact Form Handling
const contactForm = document.getElementById('contactForm');

if (contactForm) contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    const submitBtn = contactForm.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;

    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    fetch('/api/contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message })
    })
    .then(async response => {
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            await response.text();
            throw new Error('Server returned non-JSON response. Is the contact handler running?');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            submitBtn.textContent = 'Message Sent!';
            submitBtn.style.background = '#047857';

            contactForm.reset();

            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
            }, 3000);
        } else {
            throw new Error(data.message || 'Failed to send message');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        submitBtn.textContent = 'Server Error';
        submitBtn.style.background = '#ef4444';

        const errorMsg = error.message.includes('contact handler')
            ? 'Contact handler server is not running. Please start it with: ./start-contact-server.sh'
            : 'Failed to send message. Please try again.';

        console.error(errorMsg);

        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.style.background = '';
            submitBtn.disabled = false;
        }, 5000);
    });
});

function initProjectDetailCards() {
    document.querySelectorAll('.project-card[data-project-detail]').forEach(card => {
        const url = card.getAttribute('data-project-detail');
        if (!url) return;
        card.classList.add('project-card--detail');
        const title = card.querySelector('.project-header h3, h3');
        if (title && !card.hasAttribute('aria-label')) {
            card.setAttribute('aria-label', `Open project overview: ${title.textContent.trim()}`);
        }
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'link');

        card.addEventListener('click', (e) => {
            if (e.target.closest('a, button')) return;
            window.location.href = url;
        });
        card.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            if (e.target.closest('a, button')) return;
            e.preventDefault();
            window.location.href = url;
        });
    });
}

// Active navigation link highlighting
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

if (sections.length && navLinks.length) {
    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Add active state styling for nav links
const style = document.createElement('style');
style.textContent = `
    .nav-link.active {
        color: var(--primary-color);
    }
    .nav-link.active::after {
        width: 100%;
    }
`;
document.head.appendChild(style);

// Add smooth reveal animation for text elements
const textElements = document.querySelectorAll('.description, .mission-statement p, .education p');

const textObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.2 });

textElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    textObserver.observe(el);
});

// Carousel Functionality
function initCarousel(carouselName) {
    const carousel = document.getElementById(`${carouselName}Carousel`);
    if (!carousel) return;

    const track = carousel;
    const cards = track.querySelectorAll('.project-card, .challenge-card');
    if (cards.length === 0) return;

    const prevBtn = document.querySelector(`.carousel-btn-prev[data-carousel="${carouselName}"]`);
    const nextBtn = document.querySelector(`.carousel-btn-next[data-carousel="${carouselName}"]`);

    let currentIndex = 0;
    let cardWidth = 0;
    let visibleCards = 3;

    function updateVisibleCards() {
        if (window.innerWidth <= 768) {
            visibleCards = 1;
        } else if (window.innerWidth <= 968) {
            visibleCards = 2;
        } else {
            visibleCards = 3;
        }

        if (cards.length > 0) {
            const firstCard = cards[0];
            const gap = 32;
            cardWidth = firstCard.getBoundingClientRect().width + gap;
        }
    }

    updateVisibleCards();
    window.addEventListener('resize', () => {
        updateVisibleCards();
        updateCarousel();
    });

    function updateCarousel() {
        updateVisibleCards();

        const maxIndex = Math.max(0, cards.length - visibleCards);
        currentIndex = Math.min(currentIndex, maxIndex);
        currentIndex = Math.max(0, currentIndex);

        if (cards.length > 0 && cardWidth > 0) {
            const translateX = -currentIndex * cardWidth;
            track.style.transform = `translateX(${translateX}px)`;
        }

        if (prevBtn) {
            prevBtn.style.opacity = '1';
            prevBtn.style.cursor = 'pointer';
            prevBtn.disabled = false;
        }
        if (nextBtn) {
            nextBtn.style.opacity = '1';
            nextBtn.style.cursor = 'pointer';
            nextBtn.disabled = false;
        }
    }

    function scrollNext() {
        updateVisibleCards();
        const maxIndex = Math.max(0, cards.length - visibleCards);

        if (currentIndex < maxIndex) {
            currentIndex++;
        } else {
            currentIndex = 0;
        }
        updateCarousel();
    }

    function scrollPrev() {
        updateVisibleCards();
        const maxIndex = Math.max(0, cards.length - visibleCards);

        if (currentIndex > 0) {
            currentIndex--;
        } else {
            currentIndex = maxIndex;
        }
        updateCarousel();
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', scrollNext);
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', scrollPrev);
    }

    let startX = 0;
    let isDragging = false;

    track.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.pageX;
        track.style.cursor = 'grabbing';
    });

    track.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
    });

    track.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        track.style.cursor = 'grab';

        const diffX = startX - e.pageX;
        if (Math.abs(diffX) > 50) {
            if (diffX > 0) {
                scrollNext();
            } else {
                scrollPrev();
            }
        }
        updateCarousel();
    });

    track.addEventListener('mouseleave', () => {
        isDragging = false;
        track.style.cursor = 'grab';
    });

    track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].pageX;
    });

    track.addEventListener('touchmove', (e) => {
        e.preventDefault();
    });

    track.addEventListener('touchend', (e) => {
        const diffX = startX - e.changedTouches[0].pageX;
        if (Math.abs(diffX) > 50) {
            if (diffX > 0) {
                scrollNext();
            } else {
                scrollPrev();
            }
        }
        updateCarousel();
    });

    setTimeout(() => {
        updateVisibleCards();
        updateCarousel();
    }, 100);

    if (document.readyState === 'complete') {
        setTimeout(() => {
            updateVisibleCards();
            updateCarousel();
        }, 100);
    }

    track.style.cursor = 'grab';
}

document.addEventListener('DOMContentLoaded', () => {
    initProjectDetailCards();
    initCarousel('projects');
});
