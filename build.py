"""Build the static landing page from its template and approved brand assets."""
from pathlib import Path
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).parent
MARK_INLINE = (
    '<img class="logo-light" src="assets/brand/lockup-horizontal.svg" width="360" height="58" alt="">'
    '<img class="logo-dark" src="assets/brand/lockup-horizontal-reversed.svg" width="360" height="58" alt="">'
)


def build() -> str:
    qr = ET.parse(ROOT / "assets/qr.svg").getroot()
    viewbox = qr.attrib["viewBox"]
    paths = [n.attrib["d"] for n in qr if n.tag.endswith("path") and n.get("stroke") == "#000000"]
    if len(paths) != 1:
        raise ValueError("Expected one QR foreground path")
    html = (ROOT / "index.template.html").read_text(encoding="utf-8")
    for token, value in {"MARK": MARK_INLINE, "QR_VIEWBOX": viewbox, "QR_PATH": paths[0]}.items():
        if "{{" + token + "}}" not in html:
            raise ValueError(f"Missing template token: {token}")
        html = html.replace("{{" + token + "}}", value)
    if re.search(r"\{\{[^}]+\}\}", html):
        raise ValueError("Unresolved template token")
    for source in re.findall(r'(?:src|href)="((?:assets|fonts)/[^\"]+)"', html):
        if not (ROOT / source).is_file():
            raise FileNotFoundError(source)
    return html


if __name__ == "__main__":
    with (ROOT / "index.html").open("w", encoding="utf-8", newline="\n") as output:
        output.write(build())
    print("Built index.html from the template and verified local asset references.")
