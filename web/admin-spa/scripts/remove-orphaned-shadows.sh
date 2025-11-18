#!/bin/bash

# 移除孤立的box-shadow值（没有属性名的行）
find src -name "*.vue" -type f -exec sed -i \
  -e '/^ *0 [0-9].*rgba.*,$/d' \
  -e '/^ *0 [0-9].*rgba.*;$/d' \
  -e '/^ *inset 0 .*rgba.*,$/d' \
  -e '/^ *inset 0 .*rgba.*;$/d' \
  {} +

echo "✓ 已移除孤立的阴影值"
