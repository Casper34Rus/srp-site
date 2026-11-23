"""Проверка статических относительных ссылок сайта без сетевых запросов."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
SKIP = ('http:', 'https:', 'mailto:', 'tel:', 'data:', 'javascript:', '//', '#')

class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs = []
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in ('src', 'href', 'poster') and value:
                self.refs.append(value)

def verify(path, link):
    link = link.strip()
    if not link or link.startswith(SKIP) or '{' in link or '}' in link:
        return None
    parsed = urlsplit(link)
    if parsed.scheme or not parsed.path:
        return None
    name = unquote(parsed.path)
    target = (ROOT / name.lstrip('/')) if name.startswith('/') else (path.parent / name)
    if not target.resolve().is_relative_to(ROOT.resolve()):
        return f'{path.relative_to(ROOT)}: path outside site: {link}'
    if not target.exists():
        return f'{path.relative_to(ROOT)}: missing {link}'
    return None

def main():
    errors = []
    count = 0
    for path in sorted(ROOT.rglob('*')):
        if not path.is_file() or '.git' in path.parts or path.suffix.lower() not in ('.html', '.css'):
            continue
        if path.suffix.lower() == '.html':
            parser = Links()
            parser.feed(path.read_text(encoding='utf-8-sig'))
            refs = parser.refs
        else:
            refs = re.findall(r'url\(\s*[\'\"]?([^\'\")]+)', path.read_text(encoding='utf-8-sig'))
        for link in refs:
            count += 1
            issue = verify(path, link)
            if issue:
                errors.append(issue)
    print(f'Checked {count} static local references; missing: {len(errors)}')
    for problem in errors:
        print(problem)
    return 1 if errors else 0

if __name__ == '__main__':
    sys.exit(main())
