// Navigation, clipboard, installer summary, and the terminal preview.
(function () {
  var menu = document.querySelector('.mobile-menu');
  if (menu) {
    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) menu.open = false;
    });
    menu.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menu.open) {
        menu.open = false;
        menu.querySelector('summary').focus();
      }
    });
  }

  document.querySelectorAll("[data-copy-text]").forEach(function (button) {
    var label = button.textContent;
    var reset;
    button.setAttribute('aria-live', 'polite');
    button.addEventListener("click", async function () {
      var text = button.getAttribute("data-copy-text");
      if (!text || button.disabled) return;
      clearTimeout(reset);
      button.disabled = true;
      try {
        await navigator.clipboard.writeText(text);
        button.textContent = "Copied";
        button.classList.add("done");
      } catch (error) {
        button.textContent = "Select and copy below";
        button.classList.remove("done");
      } finally {
        button.disabled = false;
        reset = setTimeout(function () { button.textContent = label; button.classList.remove("done"); }, 2000);
      }
    });
  });

  // Ticking areas reprints the installer's own summary lines, edition included.
  // Edition rule (scripts/setup-area-questions.sh): events or bookings as the only primary area.
  var boxes = Array.prototype.slice.call(document.querySelectorAll("[data-area]"));
  var presets = Array.prototype.slice.call(document.querySelectorAll("[data-preset]"));
  var summary = document.querySelector("[data-summary]");
  var PRIMARY = ["inventory", "machines", "events", "bookings"];
  // The installer prints areas in this order.
  var ORDER = ["inventory", "machines", "events", "bookings", "membership", "payments", "reports", "chat"];
  var byKey = {};
  boxes.forEach(function (box) { byKey[box.getAttribute("data-area")] = box; });

  function render() {
    var picked = ORDER.filter(function (key) { return byKey[key] && byKey[key].checked; });
    var primary = picked.filter(function (key) { return PRIMARY.indexOf(key) !== -1; });
    var edition = primary.length === 1 && (primary[0] === "events" || primary[0] === "bookings") ? primary[0] : "makerspace";
    var lines = ["  Areas: " + (picked.join(",") || "none") + ";", "  edition: " + edition];
    ORDER.forEach(function (key) {
      if (byKey[key]) lines.push("  " + byKey[key].getAttribute("data-label") + ": " + (byKey[key].checked ? "yes" : "no"));
    });
    if (summary) summary.textContent = lines.join("\n");
    presets.forEach(function (button) {
      var wanted = button.getAttribute("data-preset").split(",").sort().join(",");
      button.setAttribute("aria-pressed", String(wanted === picked.slice().sort().join(",")));
    });
  }
  boxes.forEach(function (box) { box.addEventListener("change", render); });
  presets.forEach(function (button) {
    button.addEventListener("click", function () {
      var wanted = button.getAttribute("data-preset").split(",");
      boxes.forEach(function (box) { box.checked = wanted.indexOf(box.getAttribute("data-area")) !== -1; });
      render();
    });
  });
  if (boxes.length) render();

  var terminalForm = document.querySelector('[data-terminal-form]');
  if (terminalForm) {
    var commandInput = document.querySelector('#terminal-command');
    var response = document.querySelector('[data-terminal-response]');
    terminalForm.hidden = false;
    terminalForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var command = commandInput.value.trim().toLowerCase();
      if (!command) return;
      response.textContent = command === 'tinkerhub' ? 'six sebin' : 'Command not found.';
    });
  }
})();
