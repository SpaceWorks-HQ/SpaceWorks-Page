// Theme toggle, copy-to-clipboard, and the area picker that drives the installer summary.
(function () {
  var root = document.documentElement;
  var toggle = document.querySelector("[data-theme-toggle]");
  var moon = '<path d="M13.5 9.6A5.6 5.6 0 0 1 6.4 2.5a5.6 5.6 0 1 0 7.1 7.1Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>';
  var sun = '<circle cx="8" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6 13 13M3 13l1.4-1.4M11.6 4.4 13 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>';

  function paint() {
    var dark = root.dataset.theme === "dark";
    if (!toggle) return;
    toggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    toggle.querySelector("svg").innerHTML = dark ? sun : moon;
  }
  if (toggle) {
    toggle.addEventListener("click", function () {
      root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
      try { localStorage.setItem("sw-theme", root.dataset.theme); } catch (e) {}
      paint();
    });
  }
  paint();

  document.querySelectorAll("[data-copy-text]").forEach(function (button) {
    var label = button.textContent;
    button.addEventListener("click", function () {
      var text = button.getAttribute("data-copy-text");
      if (!text || !navigator.clipboard) return;
      navigator.clipboard.writeText(text).then(function () {
        button.textContent = "Copied";
        button.classList.add("done");
        setTimeout(function () { button.textContent = label; button.classList.remove("done"); }, 1600);
      });
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
})();
