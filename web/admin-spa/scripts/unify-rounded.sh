#!/bin/bash

# 统一所有圆角为 md 大小
# 保留 rounded-full（完全圆形）

cd "$(dirname "$0")/.."

echo "开始统一圆角为 rounded-md..."

# 替换所有 Vue 和 CSS 文件中的圆角类
# 注意：保留 rounded-full
find src -type f \( -name "*.vue" -o -name "*.css" \) -exec sed -i \
  -e 's/rounded-3xl/rounded-md/g' \
  -e 's/rounded-2xl/rounded-md/g' \
  -e 's/rounded-xl/rounded-md/g' \
  -e 's/rounded-lg/rounded-md/g' \
  {} +

echo "圆角统一完成！"
echo "统计结果："
grep -roh "rounded-[a-z0-9]*" src/ --include="*.vue" --include="*.css" | sort | uniq -c | sort -rn
