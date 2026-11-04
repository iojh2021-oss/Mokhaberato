#!/usr/bin/env python3
"""Builds dist/index.html: one self-contained file (CSS + all JS inlined) so the site works even when
folders are not uploaded to GitHub. Three.js is still loaded at runtime: ./three.min.js, js/vendor/three.min.js, then CDNs.
Usage:  python3 tools/build_single.py   (run from the repo root)"""
import re, os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rd = lambda p: open(os.path.join(root, p), encoding='utf-8').read()
html = rd('index.html')
html = re.sub(r'\s*<link rel="stylesheet" href="css/style.css">', '\n  <style>\n' + rd('css/style.css') + '\n  </style>', html)
for t in re.findall(r'  <script src="js/[^"]+"></script>\n', html):
    html = html.replace(t, '')
inline = ''.join('  <script>\n' + rd('js/%s.js' % n) + '\n  </script>\n' for n in ['i18n', 'units', 'radio-core', 'anim', 'radio'])
inline += '  <script type="text/plain" id="src-city">\n' + rd('js/city.js') + '\n  </script>\n'
inline += '  <script type="text/plain" id="src-app">\n' + rd('js/app.js') + '\n  </script>\n'
loader = rd('js/loader.js')
loader = loader.replace("const SOURCES = [\n    'js/vendor/three.min.js',", "const SOURCES = [\n    'three.min.js', 'js/vendor/three.min.js',")
loader = re.sub(r"return load\('js/city.js', 10000\)\.then\(function \(\) \{ return load\('js/app.js', 10000\); \}\);",
                "runInline('src-city'); runInline('src-app');", loader)
loader = loader.replace("  async function getThree()", "  function runInline(id) { var s = document.createElement('script'); s.text = document.getElementById(id).textContent; document.head.appendChild(s); }\n  async function getThree()")
inline += '  <script>\n' + loader + '\n  </script>\n'
html = html.replace('</body>', inline + '</body>')
os.makedirs(os.path.join(root, 'dist'), exist_ok=True)
open(os.path.join(root, 'dist', 'index.html'), 'w', encoding='utf-8').write(html)
print('dist/index.html', len(html), 'bytes')
