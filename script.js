// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Matrix code effect
    createMatrixEffect();
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Newsletter form handling
    const form = document.querySelector('.newsletter-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = form.querySelector('input[type="email"]').value;
            alert('感谢您的订阅！您已成为数字祭祀的一部分。');
            form.reset();
            
            // Increment the data counter
            incrementCounter();
        });
    }

    // Parallax effect on scroll
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.3}px)`;
        }
        
        // Add glitch effect to elements when they come into view
        document.querySelectorAll('.glass-card').forEach(card => {
            const cardPosition = card.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (cardPosition < screenPosition) {
                card.classList.add('fade-in');
            }
        });
    });

    // Add glitch effect to main title
    const glitchTexts = document.querySelectorAll('.glitch-text');
    if (glitchTexts.length > 0) {
        glitchTexts.forEach(text => {
            setInterval(() => {
                text.classList.add('glitch');
                setTimeout(() => {
                    text.classList.remove('glitch');
                }, 200);
            }, 3000 + Math.random() * 2000); // Random interval for more organic feel
        });
    }
    
    // Animate counter
    animateCounter();
    
    // Add typing effect to manifesto text
    addTypingEffect();
});

// Create matrix code effect
function createMatrixEffect() {
    const matrixContainer = document.querySelector('.matrix-code');
    if (!matrixContainer) return;
    
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$+-*/=%"\'#&_(),.;:?!\\|{}<>[]^~';
    const columns = Math.floor(window.innerWidth / 20);
    const drops = [];
    
    for (let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * 100) - 100;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    matrixContainer.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    function draw() {
        ctx.fillStyle = 'rgba(10, 14, 23, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#00F5FF';
        ctx.font = '15px monospace';
        
        for (let i = 0; i < drops.length; i++) {
            const text = characters.charAt(Math.floor(Math.random() * characters.length));
            const x = i * 20;
            const y = drops[i] * 20;
            
            ctx.fillText(text, x, y);
            
            if (y > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            
            drops[i]++;
        }
    }
    
    setInterval(draw, 50);
}

// Animate the data counter
function animateCounter() {
    const counter = document.querySelector('.counter');
    if (!counter) return;
    
    const target = parseInt(counter.textContent.replace(/,/g, ''));
    let current = 0;
    const increment = target / 100;
    const duration = 2000; // 2 seconds
    const frameDuration = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameDuration);
    let frame = 0;
    
    function updateCounter() {
        frame++;
        const progress = frame / totalFrames;
        const currentCount = Math.round(progress * target);
        
        if (currentCount <= target) {
            counter.textContent = currentCount.toLocaleString();
            requestAnimationFrame(updateCounter);
        } else {
            counter.textContent = target.toLocaleString();
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// Increment the data counter when form is submitted
function incrementCounter() {
    const counter = document.querySelector('.counter');
    if (!counter) return;
    
    const currentValue = parseInt(counter.textContent.replace(/,/g, ''));
    const newValue = currentValue + Math.floor(Math.random() * 1000) + 1;
    counter.textContent = newValue.toLocaleString();
}

// Add typing effect to manifesto text
function addTypingEffect() {
    const manifestoText = document.querySelector('.manifesto-text');
    if (!manifestoText) return;
    
    const paragraphs = manifestoText.querySelectorAll('p');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('typing-text');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    paragraphs.forEach(p => {
        observer.observe(p);
    });
}
