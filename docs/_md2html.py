import markdown, sys, pathlib

SRC = '/Users/vodinhkhang/Documents/HaHaGoWeb/docs/table-headers-spec.md'
DST = '/Users/vodinhkhang/Documents/HaHaGoWeb/docs/table-headers-spec.html'

md_text = pathlib.Path(SRC).read_text(encoding='utf-8')
body = markdown.markdown(md_text, extensions=['fenced_code', 'tables', 'toc', 'codehilite', 'sane_lists'])

html = f"""<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<title>Spec cho Dev — HaHaGo</title>
<style>
  :root {{
    --bg: #ffffff; --fg: #1f2328; --muted: #656d76;
    --border: #d0d7de; --code-bg: #f6f8fa; --accent: #0969da;
    --warn: #bf3989; --bug: #cf222e;
  }}
  @media (prefers-color-scheme: dark) {{
    :root {{ --bg:#0d1117; --fg:#e6edf3; --muted:#8b949e; --border:#30363d; --code-bg:#161b22; --accent:#2f81f7; }}
  }}
  * {{ box-sizing: border-box; }}
  body {{
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", Segoe UI, Helvetica, Arial, sans-serif;
    background: var(--bg); color: var(--fg);
    max-width: 980px; margin: 0 auto; padding: 32px 48px 96px;
    line-height: 1.6; font-size: 15px;
  }}
  h1 {{ font-size: 28px; padding-bottom: 8px; border-bottom: 1px solid var(--border); margin-top: 0; }}
  h2 {{ font-size: 22px; padding-bottom: 6px; border-bottom: 1px solid var(--border); margin-top: 36px; }}
  h3 {{ font-size: 17px; margin-top: 24px; }}
  h2 code, h3 code {{ font-size: 0.85em; padding: 2px 6px; background: var(--code-bg); border-radius: 4px; }}
  code {{ font-family: "SF Mono", Menlo, Consolas, monospace; font-size: 13px;
          background: var(--code-bg); padding: 2px 5px; border-radius: 4px; }}
  pre {{ background: var(--code-bg); padding: 14px 16px; border-radius: 6px; overflow-x: auto;
         border: 1px solid var(--border); }}
  pre code {{ background: transparent; padding: 0; font-size: 13px; }}
  ul, ol {{ padding-left: 24px; }}
  li {{ margin: 4px 0; }}
  li::marker {{ color: var(--muted); }}
  hr {{ border: none; border-top: 1px solid var(--border); margin: 28px 0; }}
  table {{ border-collapse: collapse; margin: 14px 0; width: 100%; }}
  th, td {{ border: 1px solid var(--border); padding: 8px 12px; text-align: left; }}
  th {{ background: var(--code-bg); }}
  strong {{ color: var(--fg); }}
  a {{ color: var(--accent); text-decoration: none; }}
  a:hover {{ text-decoration: underline; }}

  /* Highlight markers */
  li:has(strong:first-child) strong:first-child {{ color: var(--accent); }}

  /* Sticky TOC */
  #toc {{
    position: fixed; top: 32px; right: 32px; max-width: 240px;
    background: var(--bg); border: 1px solid var(--border); border-radius: 8px;
    padding: 12px 14px; font-size: 12px; max-height: 80vh; overflow-y: auto;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }}
  #toc-title {{ font-weight: 600; font-size: 11px; text-transform: uppercase;
                color: var(--muted); margin-bottom: 8px; letter-spacing: 0.5px; }}
  #toc ul {{ padding: 0; margin: 0; list-style: none; }}
  #toc li {{ margin: 3px 0; }}
  #toc a {{ display: block; padding: 3px 6px; border-radius: 4px;
            color: var(--fg); }}
  #toc a:hover {{ background: var(--code-bg); text-decoration: none; }}
  @media (max-width: 1280px) {{ #toc {{ display: none; }} }}

  /* Print */
  @media print {{
    body {{ max-width: 100%; padding: 0; }}
    #toc {{ display: none; }}
    h2 {{ page-break-before: auto; }}
  }}
</style>
</head>
<body>
<nav id="toc">
  <div id="toc-title">Mục lục</div>
  <ul id="toc-list"></ul>
</nav>
<article>
{body}
</article>
<script>
  const headings = document.querySelectorAll('article h2');
  const list = document.getElementById('toc-list');
  headings.forEach((h, i) => {{
    if (!h.id) h.id = 'sec-' + i;
    const a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent.replace(/`/g, '');
    const li = document.createElement('li');
    li.appendChild(a);
    list.appendChild(li);
  }});
</script>
</body>
</html>
"""

pathlib.Path(DST).write_text(html, encoding='utf-8')
print(f'Saved: {DST}')
