"""Small regression check for a complete, reproducible static export."""
from html.parser import HTMLParser
from pathlib import Path
import re
import unittest
from build import build, ROOT


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.anchors = []
        self.areas = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        if tag == "a" and attrs.get("href", "").startswith("#"):
            self.anchors.append(attrs["href"][1:])
        if "data-area" in attrs:
            self.areas.append(attrs["data-area"])


class BuildTest(unittest.TestCase):
    def test_complete_page_and_preserved_installer(self):
        html = build()
        self.assertEqual(html, (ROOT / "index.html").read_text(encoding="utf-8"))
        page = PageParser()
        page.feed(html)
        self.assertEqual(len(page.ids), len(set(page.ids)))
        self.assertTrue(set(page.anchors) <= set(page.ids))
        self.assertEqual(set(page.areas), {"inventory", "machines", "events", "bookings", "membership", "payments", "reports", "chat"})
        self.assertEqual(html.count('class="module"'), 9)
        self.assertEqual(html.count('class="feature"'), 12)
        self.assertIn('data-copy-text="curl -fsSL https://raw.githubusercontent.com/SpaceWorks-HQ/SpaceWorks/main/install.sh | bash"', html)
        css = (ROOT / "styles.css").read_text(encoding="utf-8")
        for font in re.findall(r'url\("(fonts/[^\"]+)"\)', css):
            self.assertTrue((ROOT / font).is_file(), font)
        self.assertNotRegex(html + css, r"IBM|Plex|Archivo")


if __name__ == "__main__":
    unittest.main()
