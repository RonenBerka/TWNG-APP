#!/usr/bin/env python3
"""Writes timestamped logs for every action to logs/ directory."""
import json, os, subprocess, sys
from datetime import datetime

LOGS_DIR = os.path.join(os.getcwd(), "logs")

def get_log_file():
    os.makedirs(LOGS_DIR, exist_ok=True)
    today = datetime.now().strftime("%Y-%m-%d")
    return os.path.join(LOGS_DIR, f"session-{today}.log")

def log(message, level="INFO"):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(get_log_file(), "a") as f:
        f.write(f"[{ts}] [{level}] {message}\n")

def handle_pre():
    try:
        data = json.load(sys.stdin)
    except:
        return
    tool = data.get("tool_name", "unknown")
    inp = data.get("tool_input", {})
    if tool == "Bash":
        log(f"EXEC  > {inp.get('command', '?')}")
    elif tool in ("Write", "Edit", "MultiEdit"):
        log(f"WRITE > {tool}: {inp.get('file_path', '?')}")
    else:
        log(f"TOOL  > {tool}")

def handle_post():
    try:
        data = json.load(sys.stdin)
    except:
        return
    tool = data.get("tool_name", "unknown")
    inp = data.get("tool_input", {})
    resp = data.get("tool_response", {})
    ec = resp.get("exit_code")
    if tool == "Bash":
        cmd = inp.get("command", "?")
        if ec is not None and ec != 0:
            stderr = resp.get("stderr", "")[:500]
            log(f"FAIL  x (exit {ec}): {cmd}", "ERROR")
            if stderr:
                log(f"STDERR: {stderr}", "ERROR")
        else:
            log(f"OK    v {cmd}")
    else:
        log(f"OK    v {tool}: {inp.get('file_path', '')}")

def handle_stop():
    try:
        branch = subprocess.run(["git", "rev-parse", "--abbrev-ref", "HEAD"],
            capture_output=True, text=True, timeout=5).stdout.strip()
        commit = subprocess.run(["git", "log", "--oneline", "-1"],
            capture_output=True, text=True, timeout=5).stdout.strip()
    except:
        branch, commit = "?", "?"
    log("=" * 50)
    log(f"SESSION END | branch: {branch} | last commit: {commit}")
    log("=" * 50)

if __name__ == "__main__":
    action = sys.argv[1] if len(sys.argv) > 1 else ""
    if action == "pre": handle_pre()
    elif action == "post": handle_post()
    elif action == "stop": handle_stop()
    sys.exit(0)
