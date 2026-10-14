"""Build index.html from index.template.html.

Fills in the SpaceWorks box mark and the QR code on the loan record's box label.
The QR code encodes the source repository; regenerate it with
`npx qrcode@1.5.4 -t svg -e M -m 0 -o assets/qr.svg "https://github.com/SpaceWorks-HQ/SpaceWorks"`.
"""
import re
from pathlib import Path

ROOT = Path(__file__).parent

# The SpaceWorks box, as drawn in the app (frontend/src/components/SpaceWorksLogo.tsx): an open box
# outlined in ink with four compartments in the brand colours. The outline follows currentColor.
MARK_PATHS = (
    '<g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">'
    '<polygon points="8,22 2,10 28,10 32,22"/><polygon points="32,22 36,10 62,10 56,22"/>'
    '<rect x="8" y="22" width="48" height="34" rx="5"/></g>'
    '<rect fill="#7dd3fc" x="12" y="27" width="18" height="11" rx="2.5"/>'
    '<rect fill="#fcdf46" x="34" y="27" width="18" height="11" rx="2.5"/>'
    '<rect fill="#74dd9c" x="12" y="42" width="18" height="11" rx="2.5"/>'
    '<rect fill="#f9a8d4" x="34" y="42" width="18" height="11" rx="2.5"/>'
)
MARK_INLINE = f'<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">{MARK_PATHS}</svg>'
FAVICON = (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
    '<style>svg{color:#18191e}@media (prefers-color-scheme:dark){svg{color:#e6ebf2}}</style>'
    f"{MARK_PATHS}</svg>\n"
)


def main() -> None:
    qr = (ROOT / "assets" / "qr.svg").read_text(encoding="utf-8")
    viewbox = re.search(r'viewBox="([^"]+)"', qr).group(1)
    path = re.search(r'<path stroke="#000000" d="([^"]+)"', qr).group(1)
    html = (ROOT / "index.template.html").read_text(encoding="utf-8")
    html = html.replace("{{MARK}}", MARK_INLINE).replace("{{QR_VIEWBOX}}", viewbox).replace("{{QR_PATH}}", path)
    (ROOT / "index.html").write_text(html, encoding="utf-8", newline="\n")
    (ROOT / "assets" / "mark.svg").write_text(FAVICON, encoding="utf-8", newline="\n")
    print("built index.html")


if __name__ == "__main__":
    main()
