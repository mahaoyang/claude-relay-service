#!/bin/bash

# 移除所有 box-shadow 样式
find src/components src/views -type f -name "*.vue" -exec sed -i \
  -e '/box-shadow:/d' \
  {} +

# 移除所有 filter: drop-shadow 样式
find src/components src/views -type f -name "*.vue" -exec sed -i \
  -e '/filter: drop-shadow/d' \
  {} +

# 移除 Tailwind CSS drop-shadow 类
find src/components src/views -type f -name "*.vue" -exec sed -i \
  -e "s/drop-shadow-\[0_1px_2px_rgba(0,0,0,0\.8)\]//g" \
  -e "s/drop-shadow-\[0_2px_4px_rgba(0,0,0,0\.9)\]//g" \
  -e "s/drop-shadow-sm//g" \
  -e "s/drop-shadow-md//g" \
  -e "s/drop-shadow-lg//g" \
  -e "s/drop-shadow-xl//g" \
  -e "s/drop-shadow-2xl//g" \
  -e "s/drop-shadow-none//g" \
  -e "s/drop-shadow//g" \
  {} +

# 清理可能产生的多余空格和问号
find src/components src/views -type f -name "*.vue" -exec sed -i \
  -e "s/  \+/ /g" \
  -e "s/ '/' /g" \
  -e "s/' $/'/g" \
  -e "s/^  *$//" \
  {} +

echo "✓ 已移除所有组件的阴影样式"
