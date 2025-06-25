#!/bin/bash

BRANCH_NAME="$1"
echo "Debug: Branch name is $BRANCH_NAME"

echo "## 📦 Release Preview" > preview.md
echo "" >> preview.md
echo "Running semantic-release dry run to preview what would be released..." >> preview.md
echo "" >> preview.md

# Run dry-run
if OUTPUT=$(npx semantic-release --dry-run --no-ci --branches "$BRANCH_NAME" --plugins "@semantic-release/commit-analyzer, @semantic-release/release-notes-generator, @semantic-release/changelog" 2>&1); then
  # Echo the output to make it visible in the GitHub Actions logs
  echo "=== semantic-release dry-run output ==="
  echo "$OUTPUT"
  echo "=== End of semantic-release dry-run output ==="
  if echo "$OUTPUT" | grep -q "Release note for version"; then
    VERSION=$(echo "$OUTPUT" | grep -oP 'The next release version is \K[0-9]+\.[0-9]+\.[0-9]+')
    echo "🚀 **A new release would be created: \`v$VERSION\`**" >> preview.md
    echo "" >> preview.md

    # Extract release type
    if echo "$OUTPUT" | grep -q "major"; then
      echo "📈 **Release Type:** Major (breaking changes)" >> preview.md
    elif echo "$OUTPUT" | grep -q "minor"; then
      echo "📈 **Release Type:** Minor (new features)" >> preview.md
    elif echo "$OUTPUT" | grep -q "patch"; then
      echo "📈 **Release Type:** Patch (bug fixes)" >> preview.md
    fi
    echo "" >> preview.md

    # Extract and format release notes
    if echo "$OUTPUT" | grep -A 50 "Release note" | grep -q "###\|##\|#"; then
      echo "### 📝 Release Notes Preview" >> preview.md
      echo '```markdown' >> preview.md
      echo "$OUTPUT" | sed -n '/Release note/,/^[[:space:]]*$/p' | head -20 >> preview.md
      echo '```' >> preview.md
    fi
  else
    echo "ℹ️ **No release would be created** - no relevant changes detected." >> preview.md
    echo "" >> preview.md
    echo "Changes in this PR don't trigger a release based on conventional commit format." >> preview.md
    echo "" >> preview.md
    echo "💡 **Tip:** Use conventional commits to trigger releases:" >> preview.md
    echo "- \`feat:\` for new features (minor version)" >> preview.md
    echo "- \`fix:\` for bug fixes (patch version)" >> preview.md
    echo "- \`feat!:\` or \`BREAKING CHANGE:\` for breaking changes (major version)" >> preview.md
  fi
else
  # Echo the output to make it visible in the GitHub Actions logs even in case of failure
  echo "=== semantic-release dry-run output (failed) ==="
  echo "$OUTPUT"
  echo "=== End of semantic-release dry-run output ==="

  echo "⚠️ **Could not determine release preview** - there may be an issue with the semantic-release configuration." >> preview.md
  echo "" >> preview.md
  echo "<details><summary>Debug output</summary>" >> preview.md
  echo "" >> preview.md
  echo '```' >> preview.md
  echo "$OUTPUT" >> preview.md
  echo '```' >> preview.md
  echo "" >> preview.md
  echo "</details>" >> preview.md
fi

echo "" >> preview.md
echo "---" >> preview.md
echo "*This preview is based on the conventional commit format. Actual release will happen when PR is merged to main.*" >> preview.md
