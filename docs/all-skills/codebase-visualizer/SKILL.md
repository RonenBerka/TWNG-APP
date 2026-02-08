---
name: codebase-visualizer
description: Generate an interactive HTML tree visualization of a codebase. Use when exploring a new repo, understanding project structure, identifying large files, getting an overview of a project's file organization, or when asked to visualize/map a codebase.
allowed-tools: Bash(python *)
---

# Codebase Visualizer

Generate an interactive HTML tree view showing project file structure with collapsible directories.

## Usage

Run the visualization script from the project root:

```bash
python ~/.claude/skills/codebase-visualizer/scripts/visualize.py .
```

Or specify a different directory:

```bash
python ~/.claude/skills/codebase-visualizer/scripts/visualize.py /path/to/project
```

This creates `codebase-map.html` in the current directory and opens it in the default browser.

## What the Visualization Shows

- **Collapsible directories**: Click folders to expand/collapse
- **File sizes**: Displayed next to each file
- **Color coding**: Different colors for different file types
- **Directory totals**: Shows aggregate size of each folder
- **Summary sidebar**: File count, directory count, total size, file type breakdown
- **File type chart**: Bar chart showing codebase composition by file type

## Ignored Directories

The script automatically ignores common non-essential directories:
- `.git`, `node_modules`, `__pycache__`
- `.venv`, `venv`, `dist`, `build`
- Hidden files (starting with `.`)

## Customization

To customize ignored directories, edit the `IGNORE` set in the Python script.

## Requirements

- Python 3 (uses only built-in libraries)
- Modern web browser to view the output
