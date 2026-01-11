#!/usr/bin/env sh
set -eu

REPO_ROOT=$(cd "$(dirname "$0")/../.." && pwd)
EXPECTED_FILE="$REPO_ROOT/.bun-version"

if [ ! -f "$EXPECTED_FILE" ]; then
  echo "Missing .bun-version at $EXPECTED_FILE" >&2
  exit 1
fi

EXPECTED=$(tr -d '\r\n' < "$EXPECTED_FILE")

if ! command -v bun >/dev/null 2>&1; then
  echo "bun is not installed or not on PATH. Expected Bun $EXPECTED (locked)." >&2
  exit 1
fi

ACTUAL=$(bun --version | tr -d '\r\n')

if [ "$ACTUAL" != "$EXPECTED" ]; then
  echo "Invalid Bun version. Expected $EXPECTED (locked) but got $ACTUAL." >&2
  exit 1
fi

echo "OK: Bun version is locked to $EXPECTED"
