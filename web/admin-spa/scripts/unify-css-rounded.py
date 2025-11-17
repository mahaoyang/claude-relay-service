#!/usr/bin/env python3
import os
import re
import glob

def fix_border_radius(content):
    """统一所有 border-radius 为 0.375rem (6px = rounded-md)"""

    # 保留 50% 和 inherit，替换其他所有值
    # 匹配 border-radius: <value>; 但不匹配 50% 和 inherit
    def replace_radius(match):
        value = match.group(1).strip()
        # 保留 50% (圆形) 和 inherit (继承)
        if value in ['50%', 'inherit']:
            return match.group(0)
        # 统一为 0.375rem (6px = rounded-md)
        return '  border-radius: 0.375rem;'

    # 匹配 border-radius: <任意值>;
    content = re.sub(
        r'  border-radius:\s*([^;]+);',
        replace_radius,
        content
    )

    return content

def process_file(filepath):
    """处理单个文件"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    fixed = fix_border_radius(content)

    if fixed != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(fixed)
        return True
    return False

def main():
    src_dir = 'src'
    files = glob.glob(f'{src_dir}/**/*.vue', recursive=True)
    files += glob.glob(f'{src_dir}/**/*.css', recursive=True)

    fixed_count = 0
    for filepath in files:
        if process_file(filepath):
            fixed_count += 1
            print(f'Fixed: {filepath}')

    print(f'\nTotal files fixed: {fixed_count}')

if __name__ == '__main__':
    main()
