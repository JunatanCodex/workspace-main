#!/usr/bin/env python3
"""Minimal OpenClaw Python bot health check.

This succeeds when:
- the runtime env is importable
- required env vars are present
- an optional local HTTP keepalive endpoint responds

Use this as a generated or copied baseline for Python Discord bots.
"""

from __future__ import annotations

import os
import sys
import urllib.request

REQUIRED_ENV = ["DISCORD_TOKEN"]
KEEPALIVE_URL = os.getenv("OPENCLAW_HEALTHCHECK_URL", "http://127.0.0.1:8080/")

missing = [key for key in REQUIRED_ENV if not os.getenv(key)]
if missing:
    print(f"Missing required env vars: {', '.join(missing)}", file=sys.stderr)
    sys.exit(1)

try:
    with urllib.request.urlopen(KEEPALIVE_URL, timeout=5) as response:
        if response.status >= 400:
            raise RuntimeError(f"Health endpoint returned status {response.status}")
except Exception as exc:
    print(f"Health check request failed: {exc}", file=sys.stderr)
    sys.exit(1)

print("ok")
