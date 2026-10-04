#!/usr/bin/env bash
# Run a verification command and record what actually happened: commit, tree state, full output, exit code.
# Writes ONE plain-text record per run to evidence/runs/<UTC timestamp>_<label>.log and exits with the command's exit code.
# Records are committed and never edited by hand; an existing record is never overwritten.
# Usage: bash scripts/record-run.sh <label> [-- command...]   (default command: pnpm check)
# RECORD_RUN_DIR overrides the output folder (only for testing this script).
set -u -o pipefail

if [ $# -lt 1 ] || [ -z "$1" ] || [ "$1" = "--" ]; then
  echo "Usage: bash scripts/record-run.sh <label> [-- command...]" >&2
  exit 2
fi

label=$(printf '%s' "$1" | tr '[:upper:]' '[:lower:]' | tr -c 'a-z0-9._-' '-')
shift
if [ "${1:-}" = "--" ]; then shift; fi
if [ $# -eq 0 ]; then set -- pnpm check; fi

cd "$(git rev-parse --show-toplevel)" || exit 2

out_dir="${RECORD_RUN_DIR:-evidence/runs}"
started=$(date -u +%Y-%m-%dT%H:%M:%SZ)
file="$out_dir/${started//[-:]/}_$label.log"

mkdir -p "$out_dir"
if [ -e "$file" ]; then
  echo "record-run: refusing to overwrite $file" >&2
  exit 2
fi

# Tree state is read BEFORE the record exists, so the record never reports itself as a change.
# "tree" is the SOURCE tree: the hook log and the run records change on every run, so they do not make it dirty.
# The full git status is still recorded, so those excluded changes stay visible.
status=$(git status --short)
tree=$(git status --short -- . ':(exclude).agent-log' ':(exclude)evidence')

{
  echo "# run: $label"
  echo "# started: $started"
  echo "# commit: $(git rev-parse HEAD) ($(git rev-parse --abbrev-ref HEAD))"
  if [ -z "$tree" ]; then
    echo "# tree: clean (excluding .agent-log/ and evidence/)"
  else
    echo "# tree: dirty (excluding .agent-log/ and evidence/)"
  fi
  if [ -z "$status" ]; then
    echo "# git status: nothing to report"
  else
    echo "# git status:"
    printf '%s\n' "$status" | sed 's/^/#   /'
  fi
  echo "# node: $(node -v)  pnpm: $(pnpm -v)"
  echo "# command: $*"
  echo "----"
} > "$file"

# The footer is written from an EXIT trap, so an interrupted run still records its exit code.
finish() {
  code=${code:-$?}
  if [ "$code" -eq 0 ]; then result=GREEN; else result=RED; fi
  {
    echo "----"
    echo "# finished: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo "# duration_s: $(( $(date +%s) - start_s ))"
    echo "# exit: $code"
    echo "# result: $result"
  } >> "$file"
  echo "record-run: $result (exit $code) -> $file" >&2
  exit "$code"
}

start_s=$(date +%s)
trap finish EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

NO_COLOR=1 "$@" 2>&1 | tee -a "$file"
code=${PIPESTATUS[0]}
exit "$code"
