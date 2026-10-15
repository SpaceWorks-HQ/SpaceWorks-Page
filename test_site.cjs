const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const clicks = {}, menuEvents = {};
let focused = false, copyText, timer, writes = 0;
const button = {
  textContent: 'Copy command', disabled: false,
  setAttribute() {}, getAttribute: () => 'curl example | bash',
  classList: { add() {}, remove() {} },
  addEventListener: (name, callback) => { clicks[name] = callback; }
};
const menu = {
  open: true,
  addEventListener: (name, callback) => { menuEvents[name] = callback; },
  querySelector: () => ({ focus() { focused = true; } })
};
const clipboard = { async writeText(text) { writes++; copyText = text; } };
vm.runInNewContext(fs.readFileSync(__dirname + '/site.js', 'utf8'), {
  document: {
    querySelector: selector => selector === '.mobile-menu' ? menu : null,
    querySelectorAll: selector => selector === '[data-copy-text]' ? [button] : []
  },
  navigator: { clipboard },
  setTimeout(callback) { timer = callback; return 1; }, clearTimeout() {}
});

(async () => {
  const firstClick = clicks.click();
  assert.equal(button.disabled, true);
  await clicks.click(); // Ignore repeated clicks while a write is pending.
  await firstClick;
  assert.equal(writes, 1);
  assert.equal(copyText, 'curl example | bash');
  assert.equal(button.textContent, 'Copied');
  assert.equal(button.disabled, false);
  timer();
  assert.equal(button.textContent, 'Copy command');

  clipboard.writeText = async () => { throw new Error('Permission denied'); };
  await clicks.click();
  assert.equal(button.textContent, 'Select and copy below');
  assert.equal(button.disabled, false);
  timer();
  assert.equal(button.textContent, 'Copy command');

  delete clipboard.writeText;
  await clicks.click();
  assert.equal(button.textContent, 'Select and copy below');
  assert.equal(button.disabled, false);

  menuEvents.click({ target: { closest: () => null } });
  assert.equal(menu.open, true);
  menuEvents.click({ target: { closest: () => ({}) } });
  assert.equal(menu.open, false);
  menu.open = true;
  menuEvents.keydown({ key: 'Enter' });
  assert.equal(menu.open, true);
  menuEvents.keydown({ key: 'Escape' });
  assert.equal(menu.open, false);
  assert.equal(focused, true);
  console.log('Clipboard success, denied/unavailable API, repeat clicks, and mobile menu checks pass.');
})().catch(error => { console.error(error); process.exitCode = 1; });
