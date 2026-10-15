const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function element(measurements = {}) {
  return Object.assign({
    style: {
      setProperty(key, value) { this[key] = value; },
      removeProperty(key) { delete this[key]; }
    },
    removeAttribute() { this.style = {}; }
  }, measurements);
}
const copy = element({ offsetHeight: 420 });
const panel = element(), figure = element(), backdrop = element(), story = element();
const nodes = {
  '.hero-scene': element({ offsetHeight: 800 }), '.hero-copy': copy,
  '.product-section': panel, '.product-viewport': element({ offsetWidth: 1160, offsetHeight: 680 }),
  '.product-preview': figure, '.workspace-section': story,
  '.inventory-content': element({ offsetWidth: 960, offsetHeight: 630, offsetLeft: 200, offsetTop: 50 }),
  '.hero-backdrop': backdrop
};
let top = 85, enabled;
const sequence = element({ offsetHeight: 2315,
  querySelector: selector => nodes[selector],
  getBoundingClientRect: () => ({ top }),
  classList: { toggle(name, value) { enabled = value; } }
});
const events = {};
const reduced = { matches: false, addEventListener(name, callback) { this.change = callback; } };
const context = {
  document: { querySelector: selector => selector === '.top' ? { offsetHeight: 85 } : sequence, querySelectorAll: () => [] },
  innerHeight: 800, innerWidth: 1440, matchMedia: () => reduced,
  addEventListener: (name, callback) => { events[name] = callback; },
  requestAnimationFrame: callback => callback()
};
vm.runInNewContext(fs.readFileSync(__dirname + '/hero.js', 'utf8'), context);
assert.equal(enabled, true);
assert.equal(copy.style.opacity, '1');
assert.equal(copy.inert, false);
assert.equal(panel.style.transform, 'translateY(599px)');
top = -1515 * .45; events.scroll();
assert.equal(panel.style.transform, 'translateY(60px)');
assert.equal(figure.style.opacity, '1');
assert.equal(nodes['.product-viewport'].style.transform, 'scale(1)');
assert.equal(story.style.opacity, '0');
top = -1515 * .74; events.scroll();
assert.ok(Number(figure.style.opacity) > 0 && Number(figure.style.opacity) < 1);
assert.ok(Number(nodes['.product-viewport'].style.transform.match(/scale\(([^)]+)\)/)[1]) > 1);
top = -1515 * .85; events.scroll();
const completedZoom = nodes['.product-viewport'].style.transform;
assert.equal(figure.style.opacity, '0');
assert.equal(story.style.opacity, '0');
top = -1515 * .92; events.scroll();
assert.equal(nodes['.product-viewport'].style.transform, completedZoom);
assert.ok(Number(story.style.opacity) > 0 && Number(story.style.opacity) < 1);
top = -1515; events.scroll();
assert.equal(panel.style.transform, 'translateY(60px)');
assert.equal(copy.style.opacity, '0');
assert.equal(copy.inert, true);
assert.equal(backdrop.style.opacity, '1');
assert.equal(figure.style.opacity, '0');
assert.equal(story.style.opacity, '1');
assert.equal(story.style.transform, 'translateY(0px) scale(1)');
assert.equal(story.inert, false);

// Scrolling beyond the sequence should not repaint the same completed state.
Object.defineProperty(copy.style, 'opacity', {
  configurable: true, get() { return '0'; },
  set() { assert.fail('Completed sequence was painted again'); }
});
top = -2000; events.scroll();
delete copy.style.opacity;
top = 85; events.scroll();
assert.equal(copy.inert, false);
assert.equal(copy.style.opacity, '1');
assert.equal(story.inert, true);
reduced.matches = true; reduced.change();
assert.equal(enabled, false);
assert.equal(figure.style.transform, undefined);
assert.equal(copy.inert, false);
assert.equal(story.inert, false);
assert.equal(sequence.style['--copy-top'], undefined);
assert.equal(sequence.style['--preview-start'], undefined);
reduced.matches = false; context.innerHeight = 540; events.resize();
assert.equal(enabled, false);
context.innerHeight = 800; story.scrollHeight = 900; events.resize();
assert.equal(enabled, false);
console.log('Hero transition: entry, full UI hold, zoom, next-section reveal, reverse and fallbacks pass.');
