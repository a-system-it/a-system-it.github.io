// Detailed glass artwork with composited motion. No runtime WebGL or canvas resize.
(() => {
  const sequence = document.querySelector('.hero-sequence');
  if (!sequence) return;
  const hero = sequence.querySelector('.hero');
  const art = hero.querySelector('.hero-art');
  const stage = hero.querySelector('.glass-stage');
  const picture = stage.querySelector('img');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 901px)');
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = (a, b, value) => { const t = clamp((value-a)/(b-a)); return t*t*(3-2*t); };
  let frame = 0, last = 0, current = 0, target = 0, visible = true;
  let start = 0, span = 1, shift = 0, maxScale = 1.2;
  stage.dataset.renderMode = 'glass-artwork';
  stage.classList.add('glass-photo');
  const drift = picture.animate([
    { transform: 'translate3d(0,0,0) rotate(-1.2deg)' },
    { transform: 'translate3d(0,-7px,0) rotate(1.2deg)' },
    { transform: 'translate3d(0,0,0) rotate(-1.2deg)' }
  ], { duration: 14000, iterations: Infinity, easing: 'ease-in-out' });
  function draw(value) {
    const shot = smooth(0, .9, value);
    if (desktop.matches) {
      art.style.transform = `translate3d(${-shift*shot}px,0,0)`;
      stage.style.transform = `translate3d(-50%,-50%,0) rotate(${-8*shot}deg) scale(${(1+(maxScale-1)*shot)/maxScale})`;
      hero.style.setProperty('--shot', shot.toFixed(5));
      hero.style.setProperty('--intro-alpha', (1-smooth(.08,.48,value)).toFixed(5));
      hero.style.setProperty('--label-alpha', (1-smooth(.12,.4,value)).toFixed(5));
      hero.style.setProperty('--resolution-alpha', smooth(.56,.85,value).toFixed(5));
      hero.style.setProperty('--release-one', smooth(.54,.76,value).toFixed(5));
      hero.style.setProperty('--release-two', smooth(.6,.82,value).toFixed(5));
      hero.style.setProperty('--release-three', smooth(.66,.88,value).toFixed(5));
    } else {
      art.style.transform = '';
      stage.style.transform = `translate3d(-50%,calc(-50% + ${-9*value}px),0) rotate(${-3+6*value}deg)`;
    }
  }
  function tick(now) {
    frame = 0;
    const dt = last ? Math.min(now-last, 50) : 16.7;
    last = now;
    current += (target-current)*(1-Math.exp(-dt/95));
    if (Math.abs(target-current) < .00005) current = target;
    draw(current);
    if (current !== target && visible && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function request() {
    if (reduced.matches || !visible || document.hidden) return;
    target = clamp((scrollY-start)/span);
    if (!frame) { last = 0; frame = requestAnimationFrame(tick); }
  }
  function measure() {
    // Read geometry at load/resize only. Rasterize once at the largest needed size.
    const sequenceTop = sequence.getBoundingClientRect().top + scrollY;
    const artTop = art.getBoundingClientRect().top + scrollY;
    start = desktop.matches ? sequenceTop-88 : artTop-innerHeight;
    span = desktop.matches ? Math.max(1,sequence.offsetHeight-hero.offsetHeight) : innerHeight+art.offsetHeight;
    shift = innerWidth*.24;
    const pixelBudget = (picture.naturalWidth || 1536)/Math.min(devicePixelRatio || 1,2);
    maxScale = Math.max(1,Math.min(1.3,pixelBudget/Math.max(1,art.clientWidth)));
    stage.style.width = desktop.matches ? `${art.clientWidth*maxScale}px` : '100%';
    request();
  }
  function playback() {
    if (reduced.matches || document.hidden || !visible) drift.pause();
    else drift.play();
    if (reduced.matches) {
      cancelAnimationFrame(frame); frame = 0;
      drift.cancel(); art.style.transform = ''; stage.style.transform = ''; stage.style.width='';
      ['--shot','--intro-alpha','--label-alpha','--resolution-alpha','--release-one','--release-two','--release-three'].forEach(name => hero.style.removeProperty(name));
    } else request();
  }
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (!visible) { cancelAnimationFrame(frame); frame=0; }
    playback();
  }, { rootMargin:'100px' }).observe(sequence);
  addEventListener('scroll', request, {passive:true});
  addEventListener('resize', measure, {passive:true});
  document.addEventListener('visibilitychange', playback);
  desktop.addEventListener('change', measure);
  reduced.addEventListener('change', () => { measure(); playback(); });
  picture.addEventListener('load', measure, {once:true});
  measure(); playback();
})();
