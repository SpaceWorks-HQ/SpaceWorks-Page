# SpaceWorks — landing page

The public landing page for [SpaceWorks](https://github.com/SpaceWorks-HQ/SpaceWorks), free self-hosted
software for makerspaces and tool libraries.

It is a static page: `index.html`, `styles.css`, `site.js`, self-hosted fonts in `fonts/` and two SVGs in
`assets/`. There is no framework and no build step at runtime, so any static host works (GitHub Pages,
Netlify, a plain web server).

## Editing

Edit `index.template.html`, then rebuild `index.html`:

```bash
python build.py
```

`build.py` fills in the SpaceWorks box mark (the same mark as the app's `SpaceWorksLogo`) and the QR code
on the sample loan record, and writes the favicon to `assets/mark.svg`. The QR code encodes the main
repository; regenerate it with:

```bash
npx qrcode@1.5.4 -t svg -e M -m 0 -o assets/qr.svg "https://github.com/SpaceWorks-HQ/SpaceWorks"
```

Commit both the template and the generated `index.html`.

## Preview locally

```bash
python -m http.server 5100
```

Then open <http://localhost:5100/>. The theme toggle remembers light or dark per browser.

## What the page says, and where it comes from

Everything on the page describes the real product, so keep it in step with the main repository:

- The area presets and the installer summary in the terminal follow `scripts/setup-area-questions.sh`
  (area labels, their order, and the `events` / `bookings` / `makerspace` edition rule).
- The sample loan follows the request workflow: requested, accepted, issued with a box QR scan and a
  photo, returned with a photo and a note.
- The version line in the footer should match the latest release.
