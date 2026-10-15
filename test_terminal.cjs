const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

let submit;
const form = { hidden: true, addEventListener(name, callback) { assert.equal(name, 'submit'); submit = callback; } };
const input = { value: '' }, response = { textContent: '' };
const nodes = { '[data-terminal-form]': form, '#terminal-command': input, '[data-terminal-response]': response };
vm.runInNewContext(fs.readFileSync(__dirname + '/site.js', 'utf8'), {
  document: {
    documentElement: { dataset: { theme: 'light' } },
    querySelector: selector => nodes[selector] || null,
    querySelectorAll: () => []
  }
});
assert.equal(form.hidden, false);
function enter(value) {
  input.value = value;
  let prevented = false;
  submit({ preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  return response.textContent;
}
assert.equal(enter('tinkerhub'), 'six sebin');
assert.equal(enter('  TinkerHub  '), 'six sebin');
assert.equal(enter('   '), 'six sebin');
assert.equal(enter('unknown'), 'Command not found.');
assert.equal(enter('<script>alert(1)</script>'), 'Command not found.');
assert.equal(enter('tinkerhub'), 'six sebin');
console.log('Terminal preview: submit, normalization, empty input, unknown command and repeat input pass.');
