(() => {
const root   = document.querySelector('.ig-card-carousel');
const stage  = root.querySelector('.ig-stage');
const slides = Array.from(root.querySelectorAll('.ig-slide'));
const prev   = root.querySelector('.ig-arrow.left');
const next   = root.querySelector('.ig-arrow.right');

let i = 0;                         // current index

function side(idx){
    const n = slides.length;
    const d = (idx - i + n) % n;     // distance clockwise from active
    if (d === 0) return 'active';
    if (d === 1) return 'next';
    if (d === n-1) return 'prev';
    return d < n/2 ? 'off-right' : 'off-left';
}

function render(){
    slides.forEach((s, idx) => {
    s.classList.remove('is-active','is-prev','is-next','is-off-left','is-off-right');
    s.classList.add('is-' + side(idx));
    s.setAttribute('aria-hidden', side(idx) !== 'active');
    });
}

function go(delta){
    i = (i + delta + slides.length) % slides.length;
    render();
}

// init
render();
prev.addEventListener('click', () => go(-1));
next.addEventListener('click', () => go(1));

// keyboard support
stage.tabIndex = 0;
stage.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  go(-1);
    if (e.key === 'ArrowRight') go(1);
});
})();