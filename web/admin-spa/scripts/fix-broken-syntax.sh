#!/bin/bash

# 修复被破坏的语法
find src -name "*.vue" -type f -exec sed -i \
  -e "s/from' /from '/g" \
  -e "s/=== '/==='/g" \
  -e "s/!== '/!=='/g" \
  -e "s/ ' /' /g" \
  -e "s/' $/'/g" \
  -e "s/ compact'/ 'compact'/g" \
  -e "s/ dropdown'/ 'dropdown'/g" \
  -e "s/ segmented'/ 'segmented'/g" \
  -e "s/' is-/ 'is-/g" \
  -e "s/value:' /value: '/g" \
  -e "s/label:' /label: '/g" \
  -e "s/icon:' /icon: '/g" \
  -e "s/type:' /type: '/g" \
  -e "s/default:' /default: '/g" \
  {} +

echo "✓ 已修复语法错误"
