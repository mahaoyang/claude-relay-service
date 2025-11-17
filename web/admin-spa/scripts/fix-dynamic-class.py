#!/usr/bin/env python3
import os
import re
import glob

def fix_dynamic_classes(content):
    """Fix malformed dynamic class bindings"""
    # Pattern 1: class="[..." : /> => :class="[..." />
    content = re.sub(r'class="(\[[^\]]+\])" :', r':class="\1"', content)

    # Pattern 2: class="[' text-xs', ... ]" : /> => :class="['text-xs', ...] />
    content = re.sub(r'class="(\[[^\]]+\])" :', r':class="\1"', content)

    return content

def process_file(filepath):
    """Process a single Vue file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    fixed = fix_dynamic_classes(content)

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
