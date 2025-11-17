#!/usr/bin/env python3
import os
import re
import glob

def fix_malformed_icons(content):
    """Fix all types of malformed Icon components"""

    # Pattern 1: Duplicate class attributes: class="..." class="..."
    # Example: <Icon name="X" class="foo ? ' ' : 'fas fa-bar'" class="baz"
    content = re.sub(
        r'(<Icon[^>]*class="[^"]*")[^>]*class="([^"]*)"',
        r'\1 \2"',
        content
    )

    # Pattern 2: Trailing colons after attributes: class="..." :
    # Example: class="foo ? ' ' : 'fas fa-bar'" :
    content = re.sub(
        r'class="([^"]*?(?:fas|fa-)[^"]*?)"\s*:',
        r':class="[\1]"',
        content
    )

    # Pattern 3: Remove trailing : before />
    content = re.sub(r'\s+:\s+/>', r' />', content)

    # Pattern 4: Fix malformed conditional class with fa- references
    # Convert: class="condition ? ' ' : 'fas fa-icon'"
    # To: :class="condition ? '' : 'fa-icon'"
    # But we need to convert to Icon :name instead

    # Pattern 5: Fix Icon with conditional class containing 'fas'
    # <Icon name="X" class="foo ? ' ' : 'fas fa-check'" />
    # Should be: <Icon :name="foo ? 'X' : 'Check'" />
    def replace_conditional_fa_class(match):
        full_match = match.group(0)
        icon_name = match.group(1)
        condition = match.group(2).strip()
        fa_class = match.group(3)

        # Extract the fa icon name
        fa_match = re.search(r'fa-([a-z-]+)', fa_class)
        if fa_match:
            fa_icon = fa_match.group(1)
            # Convert to PascalCase
            lucide_icon = ''.join(word.capitalize() for word in fa_icon.split('-'))
            return f'<Icon :name="{condition} ? \'{icon_name}\' : \'{lucide_icon}\'" />'
        return full_match

    content = re.sub(
        r'<Icon\s+name="([^"]+)"\s+class="([^"]+)\s*\?\s*\'[^\']*\'\s*:\s*\'(fas\s+fa-[^\']+)\'"\s*/?>',
        replace_conditional_fa_class,
        content
    )

    # Pattern 6: Fix standalone class with conditional containing fas
    # class="condition ? 'xxx' : 'fas fa-yyy'"
    # Should be converted to :name binding

    return content

def process_file(filepath):
    """Process a single Vue file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    fixed = fix_malformed_icons(content)

    if fixed != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(fixed)
        return True
    return False

def main():
    src_dir = 'src'
    files = glob.glob(f'{src_dir}/**/*.vue', recursive=True)

    fixed_count = 0
    for filepath in files:
        if process_file(filepath):
            fixed_count += 1
            print(f'Fixed: {filepath}')

    print(f'\nTotal files fixed: {fixed_count}')

if __name__ == '__main__':
    main()
