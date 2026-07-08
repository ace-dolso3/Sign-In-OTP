#!/usr/bin/env bash
# Install local git hooks for this repo.
# Currently: post-commit rebuild of standalone/ when sign-in.html changes.
# Run once per clone: `npm run install-hooks`
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
HOOK="$REPO_ROOT/.git/hooks/post-commit"

cat > "$HOOK" <<'HOOK_EOF'
#!/usr/bin/env bash
# Auto-rebuild standalone/ when sign-in.html changes on any branch.
# Installed by scripts/install-hooks.sh — safe to remove or edit.
set -e
if git diff-tree --no-commit-id --name-only -r HEAD 2>/dev/null | grep -qx 'sign-in\.html'; then
  echo "[post-commit] sign-in.html changed — rebuilding standalone/..."
  ( cd "$(git rev-parse --show-toplevel)" && npm run standalone --silent ) \
    || echo "[post-commit] standalone rebuild failed (non-fatal)"
fi
HOOK_EOF

chmod +x "$HOOK"
echo "✓ Installed $HOOK"
echo "  Trigger: commit that touches sign-in.html on any branch."
echo "  Skip: git commit --no-verify (post-commit runs after commit — cannot be skipped)."
echo "  Uninstall: rm $HOOK"
