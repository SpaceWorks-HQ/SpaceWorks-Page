// Show the inventory, then zoom through its white surface into the next section.
(function () {
  var sequence = document.querySelector('[data-hero-sequence]');
  if (!sequence) return;
  var scene = sequence.querySelector('.hero-scene');
  var copy = sequence.querySelector('.hero-copy');
  var panel = sequence.querySelector('.product-section');
  var frame = sequence.querySelector('.product-viewport');
  var figure = sequence.querySelector('.product-preview');
  var content = sequence.querySelector('.inventory-content');
  var story = sequence.querySelector('.workspace-section');
  var backdrop = sequence.querySelector('.hero-backdrop');
  var reduced = matchMedia('(prefers-reduced-motion: reduce)');
  var geometry, lastProgress, pending = false;

  function clamp(value) { return Math.max(0, Math.min(1, value)); }
  function ease(value) { var t = clamp(value); return t * t * (3 - 2 * t); }

  function paint() {
    pending = false;
    if (!geometry) return;
    var progress = clamp(-sequence.getBoundingClientRect().top / geometry.distance);
    if (progress === lastProgress) return;
    lastProgress = progress;
    var rise = ease(progress / .38);
    var zoom = ease((progress - .55) / .29);
    var reveal = ease((progress - .86) / .14);
    var fade = clamp(progress / .25);
    copy.style.transform = 'translateY(' + (-90 * fade) + 'px)';
    copy.style.opacity = String(1 - fade);
    copy.inert = fade === 1;
    panel.style.transform = 'translateY(' + (geometry.start + (geometry.rest - geometry.start) * rise) + 'px)';
    frame.style.transform = 'scale(' + (1 + (geometry.scale - 1) * zoom) + ')';
    figure.style.opacity = String(1 - ease((progress - .7) / .14));
    story.style.opacity = String(reveal);
    story.style.transform = 'translateY(' + (32 * (1 - reveal)) + 'px) scale(' + (.94 + .06 * reveal) + ')';
    story.inert = reveal === 0;
    backdrop.style.opacity = String(rise);
  }

  function schedule() {
    if (geometry && !pending) { pending = true; requestAnimationFrame(paint); }
  }

  function measure() {
    lastProgress = null;
    var height = innerHeight;
    var header = document.querySelector('.top').offsetHeight;
    var enabled = !reduced.matches && height > copy.offsetHeight + header + 140;
    sequence.classList.toggle('is-animated', enabled);
    if (enabled && (story.scrollHeight > height + 2 || frame.offsetHeight > height - 48)) {
      enabled = false;
      sequence.classList.toggle('is-animated', false);
    }
    if (!enabled) {
      geometry = null;
      sequence.style.removeProperty('--copy-top');
      sequence.style.removeProperty('--preview-start');
      [copy, panel, frame, figure, backdrop, story].forEach(function (item) { item.removeAttribute('style'); });
      copy.inert = story.inert = false;
      return;
    }
    sequence.style.setProperty('--copy-top', Math.max(24, (height - header - 116 - copy.offsetHeight) / 2) + 'px');
    sequence.style.setProperty('--preview-start', (height - header - 116) + 'px');
    var rest = (height - frame.offsetHeight) / 2;
    var centerX = frame.offsetWidth / 2, centerY = frame.offsetHeight / 2;
    var halfWidth = Math.min(centerX - content.offsetLeft, content.offsetLeft + content.offsetWidth - centerX);
    var halfHeight = Math.min(centerY - content.offsetTop, content.offsetTop + content.offsetHeight - centerY);
    geometry = {
      start: height - header - 116,
      rest: rest,
      distance: sequence.offsetHeight - scene.offsetHeight,
      scale: Math.max(innerWidth / (2 * halfWidth), height / (2 * halfHeight)) * 1.06
    };
    paint();
  }

  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', measure);
  reduced.addEventListener('change', measure);
  document.querySelectorAll('a[href="#workspace"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      if (!geometry) return;
      event.preventDefault();
      window.scrollTo({ top: scrollY + sequence.getBoundingClientRect().top + geometry.distance, behavior: 'smooth' });
    });
  });
  if (document.fonts) document.fonts.ready.then(measure);
  measure();
})();
