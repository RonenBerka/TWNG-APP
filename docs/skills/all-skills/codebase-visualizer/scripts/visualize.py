#!/usr/bin/env python3
"""Generate an interactive collapsible tree visualization of a codebase."""

import json
import sys
import webbrowser
from pathlib import Path
from collections import Counter

# Directories to ignore
IGNORE = {'.git', 'node_modules', '__pycache__', '.venv', 'venv', 'dist', 'build', '.next', '.nuxt', 'coverage', '.pytest_cache', '.mypy_cache'}

def scan(path: Path, stats: dict) -> dict:
    """Recursively scan directory and build tree structure."""
    result = {"name": path.name, "children": [], "size": 0}
    try:
        for item in sorted(path.iterdir()):
            if item.name in IGNORE or item.name.startswith('.'):
                continue
            if item.is_file():
                size = item.stat().st_size
                ext = item.suffix.lower() or '(no ext)'
                result["children"].append({"name": item.name, "size": size, "ext": ext})
                result["size"] += size
                stats["files"] += 1
                stats["extensions"][ext] += 1
                stats["ext_sizes"][ext] += size
            elif item.is_dir():
                stats["dirs"] += 1
                child = scan(item, stats)
                if child["children"]:
                    result["children"].append(child)
                    result["size"] += child["size"]
    except PermissionError:
        pass
    return result

def generate_html(data: dict, stats: dict, output: Path) -> None:
    """Generate interactive HTML visualization."""
    ext_sizes = stats["ext_sizes"]
    total_size = sum(ext_sizes.values()) or 1
    sorted_exts = sorted(ext_sizes.items(), key=lambda x: -x[1])[:8]

    # Color mapping for common file types
    colors = {
        '.js': '#f7df1e', '.ts': '#3178c6', '.py': '#3776ab', '.go': '#00add8',
        '.rs': '#dea584', '.rb': '#cc342d', '.css': '#264de4', '.html': '#e34c26',
        '.json': '#6b7280', '.md': '#083fa1', '.yaml': '#cb171e', '.yml': '#cb171e',
        '.mdx': '#083fa1', '.tsx': '#3178c6', '.jsx': '#61dafb', '.sh': '#4eaa25',
        '.java': '#b07219', '.c': '#555555', '.cpp': '#f34b7d', '.h': '#555555',
        '.php': '#4F5D95', '.swift': '#ffac45', '.kt': '#A97BFF', '.scala': '#c22d40',
        '.vue': '#41b883', '.svelte': '#ff3e00', '.scss': '#c6538c', '.less': '#1d365d',
    }

    lang_bars = "".join(
        f'<div class="bar-row"><span class="bar-label">{ext}</span>'
        f'<div class="bar" style="width:{(size/total_size)*100}%;background:{colors.get(ext,"#6b7280")}"></div>'
        f'<span class="bar-pct">{(size/total_size)*100:.1f}%</span></div>'
        for ext, size in sorted_exts
    )

    def fmt(b):
        if b < 1024: return f"{b} B"
        if b < 1048576: return f"{b/1024:.1f} KB"
        return f"{b/1048576:.1f} MB"

    html = f'''<!DOCTYPE html>
<html><head>
  <meta charset="utf-8"><title>Codebase Explorer - {data["name"]}</title>
  <style>
    body {{ font: 14px/1.5 system-ui, -apple-system, sans-serif; margin: 0; background: #1a1a2e; color: #eee; }}
    .container {{ display: flex; height: 100vh; }}
    .sidebar {{ width: 300px; background: #252542; padding: 20px; border-right: 1px solid #3d3d5c; overflow-y: auto; flex-shrink: 0; }}
    .main {{ flex: 1; padding: 20px; overflow-y: auto; }}
    h1 {{ margin: 0 0 10px 0; font-size: 18px; color: #fff; }}
    h2 {{ margin: 20px 0 10px 0; font-size: 14px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }}
    .stat {{ display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #3d3d5c; }}
    .stat-value {{ font-weight: bold; color: #4fc3f7; }}
    .bar-row {{ display: flex; align-items: center; margin: 6px 0; }}
    .bar-label {{ width: 60px; font-size: 12px; color: #aaa; font-family: monospace; }}
    .bar {{ height: 18px; border-radius: 3px; min-width: 2px; }}
    .bar-pct {{ margin-left: 8px; font-size: 12px; color: #888; }}
    .tree {{ list-style: none; padding-left: 20px; margin: 0; }}
    .tree > li {{ padding-left: 0; }}
    details {{ cursor: pointer; }}
    details > summary {{ list-style: none; }}
    details > summary::-webkit-details-marker {{ display: none; }}
    summary {{ padding: 4px 8px; border-radius: 4px; display: flex; align-items: center; }}
    summary:hover {{ background: #2d2d44; }}
    .folder {{ color: #ffd700; }}
    .folder::before {{ content: "📁 "; }}
    details[open] > summary .folder::before {{ content: "📂 "; }}
    .file {{ display: flex; align-items: center; padding: 4px 8px; border-radius: 4px; }}
    .file:hover {{ background: #2d2d44; }}
    .size {{ color: #888; margin-left: auto; font-size: 12px; font-family: monospace; }}
    .dot {{ width: 8px; height: 8px; border-radius: 50%; margin-right: 8px; flex-shrink: 0; }}
    .search {{ width: 100%; padding: 8px 12px; border: 1px solid #3d3d5c; border-radius: 6px; background: #1a1a2e; color: #fff; margin-bottom: 15px; font-size: 14px; }}
    .search:focus {{ outline: none; border-color: #4fc3f7; }}
    .hidden {{ display: none; }}
  </style>
</head><body>
  <div class="container">
    <div class="sidebar">
      <h1>📊 Summary</h1>
      <div class="stat"><span>Files</span><span class="stat-value">{stats["files"]:,}</span></div>
      <div class="stat"><span>Directories</span><span class="stat-value">{stats["dirs"]:,}</span></div>
      <div class="stat"><span>Total size</span><span class="stat-value">{fmt(data["size"])}</span></div>
      <div class="stat"><span>File types</span><span class="stat-value">{len(stats["extensions"])}</span></div>
      <h2>By file type</h2>
      {lang_bars}
    </div>
    <div class="main">
      <input type="text" class="search" placeholder="🔍 Search files..." id="search">
      <h1>📁 {data["name"]}</h1>
      <ul class="tree" id="root"></ul>
    </div>
  </div>
  <script>
    const data = {json.dumps(data)};
    const colors = {json.dumps(colors)};

    function fmt(b) {{
      if (b < 1024) return b + ' B';
      if (b < 1048576) return (b/1024).toFixed(1) + ' KB';
      return (b/1048576).toFixed(1) + ' MB';
    }}

    function render(node, parent, path = '') {{
      const fullPath = path ? path + '/' + node.name : node.name;
      if (node.children) {{
        const det = document.createElement('details');
        det.open = parent === document.getElementById('root');
        det.dataset.path = fullPath.toLowerCase();
        det.innerHTML = `<summary><span class="folder">${{node.name}}</span><span class="size">${{fmt(node.size)}}</span></summary>`;
        const ul = document.createElement('ul');
        ul.className = 'tree';
        node.children.sort((a,b) => (b.children?1:0)-(a.children?1:0) || a.name.localeCompare(b.name));
        node.children.forEach(c => render(c, ul, fullPath));
        det.appendChild(ul);
        const li = document.createElement('li');
        li.appendChild(det);
        parent.appendChild(li);
      }} else {{
        const li = document.createElement('li');
        li.className = 'file';
        li.dataset.path = fullPath.toLowerCase();
        li.innerHTML = `<span class="dot" style="background:${{colors[node.ext]||'#6b7280'}}"></span>${{node.name}}<span class="size">${{fmt(node.size)}}</span>`;
        parent.appendChild(li);
      }}
    }}

    data.children.forEach(c => render(c, document.getElementById('root')));

    // Search functionality
    document.getElementById('search').addEventListener('input', function(e) {{
      const query = e.target.value.toLowerCase();
      document.querySelectorAll('[data-path]').forEach(el => {{
        if (query === '') {{
          el.classList.remove('hidden');
        }} else if (el.dataset.path.includes(query)) {{
          el.classList.remove('hidden');
          // Open parent details
          let parent = el.parentElement;
          while (parent) {{
            if (parent.tagName === 'DETAILS') parent.open = true;
            parent = parent.parentElement;
          }}
        }} else if (el.tagName === 'DETAILS') {{
          // Keep folders visible if they have matching children
          const hasMatch = el.querySelector('[data-path*="' + query + '"]');
          el.classList.toggle('hidden', !hasMatch);
          if (hasMatch) el.open = true;
        }} else {{
          el.classList.add('hidden');
        }}
      }});
    }});
  </script>
</body></html>'''
    output.write_text(html)

if __name__ == '__main__':
    target = Path(sys.argv[1] if len(sys.argv) > 1 else '.').resolve()
    stats = {"files": 0, "dirs": 0, "extensions": Counter(), "ext_sizes": Counter()}
    data = scan(target, stats)
    out = Path('codebase-map.html')
    generate_html(data, stats, out)
    print(f'✅ Generated {out.absolute()}')
    print(f'📊 {stats["files"]} files, {stats["dirs"]} directories')
    webbrowser.open(f'file://{out.absolute()}')
