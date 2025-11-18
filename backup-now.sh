#!/bin/bash
# 快捷备份命令 - 一键备份Redis数据
# 使用方法：./backup-now.sh

cd "$(dirname "$0")"
./scripts/backup-redis-docker.sh
