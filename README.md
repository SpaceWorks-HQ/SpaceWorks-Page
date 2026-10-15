# Space Works — landing page

The public landing page for [SpaceWorks](https://github.com/SpaceWorks-HQ/SpaceWorks), free self-hosted
software for makerspaces and tool libraries.

It is a static page: `index.html`, `styles.css`, `site.js`, `hero.js`, self-hosted fonts in `fonts/`
and brand assets in `assets/`. There is no framework and no build step at runtime, so any static host
works (GitHub Pages, Netlify, a plain web server).

## Editing

Edit `index.template.html`, then rebuild `index.html`:

```bash
python build.py
```

`build.py` inserts the approved logo lockups and the QR code on the sample loan record, and checks
that local asset references exist. The favicon and other brand exports are checked in separately.
The QR code encodes the main repository; regenerate it with:

```bash
npx qrcode@1.5.4 -t svg -e M -m 0 -o assets/qr.svg "https://github.com/SpaceWorks-HQ/SpaceWorks"
```

Commit both the template and the generated `index.html`.
Run `python3 -m unittest test_build.py` to check that the export is complete and reproducible.

## Preview locally

```bash
python -m http.server 5100
```

Then open <http://localhost:5100/>. The site uses the cream brand theme for every visitor.

`hero.js` brings the inventory concept fully into view, holds it, then zooms from its center until
the white content fills the screen. The next section's text enters after the zoom finishes. Reduced-motion
preferences and short viewports use the normal document flow. Run `node test_hero.cjs` for its focused
entry, reveal, reverse and fallback checks.

The browser terminal preview accepts typing at the blinking cursor. Entering `tinkerhub` and pressing
Enter responds with `six sebin`; it does not execute commands.
Run `node test_terminal.cjs` to check input handling.
Run `node test_site.cjs` to check clipboard feedback and mobile menu navigation.

## What the page says, and where it comes from

Everything on the page describes the real product, so keep it in step with the main repository:

- The area presets and the installer summary in the terminal follow `scripts/setup-area-questions.sh`
  (area labels, their order, and the `events` / `bookings` / `makerspace` edition rule).
- The sample loan follows the request workflow: requested, accepted, issued with a box QR scan and a
  photo, returned with a photo and a note.
- The version line in the footer should match the latest release.
- Deployment locations and the combined 1,000+ member count were supplied by the project owner;
  logo provenance is recorded in `assets/deployments/README.md`.

## License

**[GNU Affero General Public License v3](LICENSE)** (`AGPL-3.0-or-later`), matching SpaceWorks.
Font licensing and provenance are documented in `fonts/README.md`.
