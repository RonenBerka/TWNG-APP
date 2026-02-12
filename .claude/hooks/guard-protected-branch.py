#!/usr/bin/env python3
"""Blocks git commit/push/merge on protected branches (main, production)."""
import json, subprocess, sys

def main():
    try:
        data = json.load(sys.stdin)
    except:
        sys.exit(0)

    cmd = data.get("tool_input", {}).get("command", "")
    if not any(op in cmd for op in ["git commit", "git push", "git merge"]):
        sys.exit(0)

    try:
        branch = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            capture_output=True, text=True, timeout=5
        ).stdout.strip()
    except:
        sys.exit(0)

    if branch in ("main", "production", "master"):
        print(json.dumps({
            "decision": "block",
            "reason": f"Cannot {cmd.split()[1]} on protected branch '{branch}'. Create a feature branch first."
        }))
        sys.exit(2)

if __name__ == "__main__":
    main()
