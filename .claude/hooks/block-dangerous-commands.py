#!/usr/bin/env python3
"""Blocks dangerous bash commands."""
import json, re, sys

DANGEROUS = [
    r"rm\s+-rf\s+[/~.]",
    r"sudo\s+rm",
    r"git\s+push\s+.*--force(?!\-with\-lease)",
    r"git\s+reset\s+--hard\s+HEAD~[1-9]\d",
    r"chmod\s+-R\s+777",
    r"DROP\s+(TABLE|DATABASE|SCHEMA)",
    r"TRUNCATE\s+",
]

def main():
    try:
        data = json.load(sys.stdin)
    except:
        sys.exit(0)

    cmd = data.get("tool_input", {}).get("command", "")
    for pattern in DANGEROUS:
        if re.search(pattern, cmd, re.IGNORECASE):
            print(json.dumps({
                "decision": "block",
                "reason": f"Blocked dangerous command: {cmd[:100]}"
            }))
            sys.exit(2)

if __name__ == "__main__":
    main()
