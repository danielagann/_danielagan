
const bar = document.querySelector('.progress-line');
const updateBar = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
};
addEventListener('scroll', updateBar, { passive: true });
updateBar();


const reveal = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
        if (e.isIntersecting) {
            e.target.classList.add('in');
            reveal.unobserve(e.target);
        }
    });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el) => reveal.observe(el));


const links = document.querySelectorAll('.nav-link');
const navUl = document.querySelector('.navbar-nav');
const pill = document.createElement('span');
pill.className = 'nav-pill';
navUl.prepend(pill);
const movePill = (el) => {
    if (!el || getComputedStyle(pill).display === 'none') return;
    pill.style.width = el.offsetWidth + 'px';
    pill.style.height = el.offsetHeight + 'px';
    pill.style.transform = `translate(${el.offsetLeft}px, ${el.offsetTop}px)`;
    pill.style.opacity = 1;
};
const placePill = () => {
    const cur = document.querySelector('.nav-link.active');
    cur ? movePill(cur) : (pill.style.opacity = 0);
};
links.forEach((l) => {
    l.addEventListener('mouseenter', () => movePill(l));
    l.addEventListener('focus', () => movePill(l));
});
navUl.addEventListener('mouseleave', placePill);
addEventListener('resize', placePill);
addEventListener('load', placePill);
const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
        if (e.isIntersecting) {
            links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
            placePill();
        }
    });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('section[id]').forEach((s) => spy.observe(s));


const menu = document.getElementById('navbarNav');
links.forEach((l) => l.addEventListener('click', () => {
    if (menu.classList.contains('show')) bootstrap.Collapse.getOrCreateInstance(menu).hide();
}));


const box = document.getElementById('lightbox');
document.querySelectorAll('.cert-frame').forEach((f) => f.addEventListener('click', () => {
    const img = f.querySelector('img');
    if (!img) return;
    box.querySelector('img').src = img.src;
    box.showModal();
}));
box.addEventListener('click', () => box.close());


const heroEl = document.getElementById('home');
if (heroEl && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    heroEl.addEventListener('pointermove', (e) => {
        const r = heroEl.getBoundingClientRect();
        heroEl.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
        heroEl.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    });
}


document.querySelectorAll('canvas.net').forEach((cv) => {
    const ctx = cv.getContext('2d');
    const host = cv.parentElement;
    const rgb = cv.dataset.rgb;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mouse = { x: -999, y: -999 };
    let w = 0, h = 0, nodes = [], link = 140, visible = true;

    const build = () => {
        const dpr = Math.min(devicePixelRatio || 1, 2);
        w = cv.clientWidth; h = cv.clientHeight;
        cv.width = w * dpr; cv.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        link = w < 768 ? 105 : 140;
        const n = Math.min(w < 768 ? 36 : 80, Math.round((w * h) / 15000));
        nodes = Array.from({ length: n }, () => ({
            x: Math.random() * w, y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.55, vy: (Math.random() - 0.5) * 0.55,
        }));
    };

    const frame = (move) => {
        ctx.clearRect(0, 0, w, h);
        for (const p of nodes) {
            if (move) {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > w) p.vx *= -1;
                if (p.y < 0 || p.y > h) p.vy *= -1;
            }
            ctx.fillStyle = `rgba(${rgb}, .55)`;
            ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, 6.2832); ctx.fill();
        }
        ctx.lineWidth = 1;
        for (let i = 0; i < nodes.length; i++) {
            const a = nodes[i];
            for (let j = i + 1; j < nodes.length; j++) {
                const b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
                if (d < link) {
                    ctx.strokeStyle = `rgba(${rgb}, ${(1 - d / link) * 0.3})`;
                    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
                }
            }
            const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
            if (dm < 170) {
                ctx.strokeStyle = `rgba(${rgb}, ${(1 - dm / 170) * 0.55})`;
                ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
                if (move) { a.x += (mouse.x - a.x) * 0.004; a.y += (mouse.y - a.y) * 0.004; }
            }
        }
    };

    build();
    addEventListener('resize', build);
    addEventListener('load', build);
    if (still) { frame(false); return; }
    host.addEventListener('pointermove', (e) => {
        const r = cv.getBoundingClientRect();
        mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    host.addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; });
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(host);
    const loop = () => { if (visible) frame(true); requestAnimationFrame(loop); };
    loop();
});
