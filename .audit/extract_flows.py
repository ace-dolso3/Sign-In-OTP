"""Extract the FLOWS registry from sign-in.html into JSON.

Treats the file as text; locates `const FLOWS = [` and balances brackets until
the matching `];`. Converts the JS object literals to JSON by:
  - quoting unquoted keys
  - converting single-quoted string values to double-quoted
  - stripping trailing commas
  - stripping JS line comments
"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "sign-in.html"
OUT = ROOT / ".audit" / "flows.json"

text = SRC.read_text()

# Locate FLOWS array
start_match = re.search(r"\bconst\s+FLOWS\s*=\s*\[", text)
if not start_match:
    raise SystemExit("FLOWS not found")
start = start_match.end() - 1  # position of opening `[`

# Walk brackets respecting strings to find matching `]`
i = start
depth = 0
in_str = None
end = None
while i < len(text):
    c = text[i]
    if in_str:
        if c == "\\":
            i += 2
            continue
        if c == in_str:
            in_str = None
        i += 1
        continue
    if c in ("'", '"', "`"):
        in_str = c
        i += 1
        continue
    if c == "[":
        depth += 1
    elif c == "]":
        depth -= 1
        if depth == 0:
            end = i + 1
            break
    i += 1

if end is None:
    raise SystemExit("Could not balance FLOWS array")

raw = text[start:end]

# Strip JS line comments (// ...) but not inside strings.
# Simple state machine.
def strip_line_comments(s):
    out = []
    i = 0
    in_str = None
    while i < len(s):
        c = s[i]
        if in_str:
            out.append(c)
            if c == "\\" and i + 1 < len(s):
                out.append(s[i + 1])
                i += 2
                continue
            if c == in_str:
                in_str = None
            i += 1
            continue
        if c in ("'", '"', "`"):
            in_str = c
            out.append(c)
            i += 1
            continue
        if c == "/" and i + 1 < len(s) and s[i + 1] == "/":
            # skip to end of line
            while i < len(s) and s[i] != "\n":
                i += 1
            continue
        out.append(c)
        i += 1
    return "".join(out)

raw = strip_line_comments(raw)

# Quote unquoted keys: `key:` -> `"key":`
# Only when key is identifier and preceded by `{` or `,` (with optional whitespace)
raw = re.sub(r"([\{,]\s*)([A-Za-z_][\w$]*)\s*:", r'\1"\2":', raw)

# Convert single-quoted string literals to double-quoted.
# Walk character-by-character to handle escapes properly.
def sq_to_dq(s):
    out = []
    i = 0
    in_dq = False
    while i < len(s):
        c = s[i]
        if in_dq:
            out.append(c)
            if c == "\\" and i + 1 < len(s):
                out.append(s[i + 1])
                i += 2
                continue
            if c == '"':
                in_dq = False
            i += 1
            continue
        if c == '"':
            in_dq = True
            out.append(c)
            i += 1
            continue
        if c == "'":
            # collect until next unescaped '
            j = i + 1
            inner = []
            while j < len(s):
                cj = s[j]
                if cj == "\\" and j + 1 < len(s):
                    nxt = s[j + 1]
                    if nxt == "'":
                        # `\'` inside single-quoted string -> literal `'` in JSON
                        inner.append("'")
                    else:
                        inner.append(cj)
                        inner.append(nxt)
                    j += 2
                    continue
                if cj == "'":
                    break
                inner.append(cj)
                j += 1
            inner_str = "".join(inner)
            # Escape any unescaped double-quotes inside
            inner_str = re.sub(r'(?<!\\)"', r'\\"', inner_str)
            out.append('"' + inner_str + '"')
            i = j + 1
            continue
        out.append(c)
        i += 1
    return "".join(out)

raw = sq_to_dq(raw)

# Strip trailing commas before ] or }
raw = re.sub(r",(\s*[\]\}])", r"\1", raw)

# Replace JS `null`/`true`/`false` — same in JSON, keep as-is.
# `undefined` becomes null
raw = re.sub(r"\bundefined\b", "null", raw)

# Replace FIGMA constant references like `FIGMA + '660-213'` — already handled
# by sq_to_dq into `FIGMA + "660-213"`. Now resolve the concatenation by
# substituting FIGMA with its base URL value, then joining strings.
# Look for FIGMA constant definition.
figma_match = re.search(r"const\s+FIGMA\s*=\s*['\"]([^'\"]+)['\"]", text)
figma_base = figma_match.group(1) if figma_match else ""
# Pattern: "FIGMA + \"node-id-value\"" -> just the full URL string.
raw = re.sub(r'FIGMA\s*\+\s*"([^"]+)"', lambda m: '"' + figma_base + m.group(1) + '"', raw)

try:
    data = json.loads(raw)
except json.JSONDecodeError as e:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    (OUT.parent / "flows.raw.txt").write_text(raw)
    print(f"JSON parse failed at line {e.lineno} col {e.colno}: {e.msg}")
    # Show context
    lines = raw.split("\n")
    lo = max(0, e.lineno - 5)
    hi = min(len(lines), e.lineno + 5)
    for n in range(lo, hi):
        marker = ">>" if n + 1 == e.lineno else "  "
        print(f"{marker} {n+1:5d}: {lines[n]}")
    raise SystemExit(1)

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(data, indent=2))
print(f"Extracted {len(data)} flows -> {OUT.relative_to(ROOT)}")

# Quick summary
groups = {}
for f in data:
    groups.setdefault(f.get("group", "?"), []).append(f.get("id"))
for g, ids in groups.items():
    print(f"  {g}: {len(ids)} flows")
