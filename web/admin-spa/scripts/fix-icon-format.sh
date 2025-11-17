#!/bin/bash

# Fix all malformed Icon component tags
# Pattern: ...class="..." v-if="..." / /> should be ...v-if="..." class="..." />

echo "Fixing Icon component tag formats..."

# Find all Vue files and fix the format
find src -name "*.vue" -type f | while read file; do
  # Fix pattern: class="..." v-directive / /> => v-directive class="..." />
  sed -i -E 's/class="([^"]*)" (v-[a-z-]+[^>]*) \/ >/\2 class="\1" \/>/g' "$file"

  # Fix pattern: name="..." class="..." v-directive / /> => name="..." v-directive class="..." />
  sed -i -E 's/(name="[^"]*") class="([^"]*)" (v-[a-z-]+[^>]*) \/ >/\1 \3 class="\2" \/>/g' "$file"

  # Fix any remaining / /> => />
  sed -i 's/ \/ >/ \/>/g' "$file"
done

echo "Done! Fixed Icon component formats in all Vue files."
