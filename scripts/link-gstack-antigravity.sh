#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
target_root="$repo_root/.agents/skills"

mkdir -p "$target_root"

candidates=(
  "$HOME/.Codex/skills/gstack"
  "$HOME/.codex/skills/gstack"
  "$HOME/.claude/skills/gstack"
  "$HOME/.agents/skills/gstack"
  "$HOME/.gemini/antigravity-cli/skills/gstack"
)

source_root=""
for candidate in "${candidates[@]}"; do
  if [[ -f "$candidate/qa/SKILL.md" ]]; then
    source_root="$candidate"
    break
  fi
done

if [[ -z "$source_root" ]]; then
  echo "Could not find an installed gstack skill directory."
  echo "Finish installing gstack, then run this script again."
  echo "You can still contribute now by following AGENTS.md and your handoff."
  exit 1
fi

skills=(
  autoplan
  browse
  careful
  design-review
  office-hours
  qa
  qa-only
  review
)

linked=0
for skill in "${skills[@]}"; do
  source_path="$source_root/$skill"
  target_path="$target_root/$skill"

  if [[ ! -f "$source_path/SKILL.md" ]]; then
    echo "Skip $skill: not present in this gstack installation."
    continue
  fi

  if [[ -L "$target_path" ]]; then
    if [[ "$(readlink "$target_path")" == "$source_path" ]]; then
      echo "Ready: $skill"
    else
      echo "Skip $skill: an existing link points somewhere else."
    fi
    continue
  fi

  if [[ -e "$target_path" ]]; then
    echo "Skip $skill: an existing file or directory is already there."
    continue
  fi

  ln -s "$source_path" "$target_path"
  echo "Linked: $skill"
  linked=$((linked + 1))
done

echo "Antigravity skill setup complete ($linked new link(s))."
echo "Open this repository root in Antigravity so it reads AGENTS.md and .agents/skills/."
