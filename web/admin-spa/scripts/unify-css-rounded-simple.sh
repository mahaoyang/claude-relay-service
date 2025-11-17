#!/bin/bash

cd "$(dirname "$0")/.."

echo "开始统一 CSS 中的 border-radius..."

# 替换各种 border-radius 值为 0.375rem (6px = rounded-md)
# 保留 50% 和 inherit

find src -type f \( -name "*.vue" -o -name "*.css" \) -exec sed -i \
  -e 's/border-radius: 9999px/border-radius: 0.375rem/g' \
  -e 's/border-radius: 16px/border-radius: 0.375rem/g' \
  -e 's/border-radius: 12px/border-radius: 0.375rem/g' \
  -e 's/border-radius: 8px/border-radius: 0.375rem/g' \
  -e 's/border-radius: 4px/border-radius: 0.375rem/g' \
  -e 's/border-radius: 3px/border-radius: 0.375rem/g' \
  -e 's/border-radius: 1rem/border-radius: 0.375rem/g' \
  -e 's/border-radius: 0\.75rem/border-radius: 0.375rem/g' \
  -e 's/border-radius: 0\.5rem/border-radius: 0.375rem/g' \
  -e 's/border-radius: 0\.25rem/border-radius: 0.375rem/g' \
  -e 's/border-radius: 50px/border-radius: 0.375rem/g' \
  -e 's/border-radius: 100px/border-radius: 0.375rem/g' \
  {} +

echo "统一完成！"
echo ""
echo "保留的特殊圆角："
grep -r "border-radius:" src/ --include="*.vue" --include="*.css" | grep -E "(50%|inherit)" | wc -l
echo "个 50% 或 inherit"
echo ""
echo "统一后的圆角："
grep -r "border-radius: 0.375rem" src/ --include="*.vue" --include="*.css" | wc -l
echo "个 0.375rem"
