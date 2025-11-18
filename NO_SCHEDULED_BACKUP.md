# 无定时备份的数据保护方案

## ✅ 你已经有的保护（无需额外操作）

### 自动持久化（已配置）
- ✅ **AOF**：每秒自动保存，Redis崩溃最多丢1秒
- ✅ **RDB**：60秒/300秒/900秒自动快照
- ✅ **Docker卷**：数据永久保存

**这已经很安全了！** 正常使用不会丢失数据。

---

## 🎯 简单的手动备份方案

### 方案1：重要操作后手动备份（推荐）

**何时备份：**
- ✅ 添加新账户后
- ✅ 创建新API Key后
- ✅ 修改重要配置后

**如何备份：**
```bash
# 一条命令搞定
./scripts/backup-redis-docker.sh
```

**备份保存在：** `backups/` 目录，自动保留最近7个

---

### 方案2：导出JSON（可读，方便查看）

**何时使用：**
- 想查看所有数据
- 需要迁移到其他系统
- 想用Git版本控制

**如何使用：**
```bash
# 导出所有数据到JSON
./scripts/manual-export.sh

# 查看导出的文件
cat data-exports/data-最新时间戳.json
```

**优点：**
- JSON格式，直接可读
- 可以编辑
- 方便分享

---

### 方案3：Git版本控制（专业）

**适合：** 经常修改配置的用户

**使用：**
```bash
# 每次重要修改后运行
./scripts/git-backup.sh

# 查看备份历史
cd data-git-backup && git log

# 恢复到某个版本
git checkout <commit-id> -- backup-YYYYMMDD-HHMMSS.json
```

**优点：**
- 完整的版本历史
- 可以看到每次改动
- 支持回滚

---

### 方案4：云盘自动同步

**设置一次，永久同步：**

1. **创建符号链接到云盘：**
   ```cmd
   REM Windows PowerShell管理员
   mklink /D "C:\Users\你的用户名\OneDrive\redis-backups" "\\wsl$\Ubuntu\home\ha\workspace\claude-relay-service\backups"
   ```

2. **手动备份时自动上传：**
   ```bash
   ./scripts/backup-redis-docker.sh
   # 文件会自动同步到OneDrive/Google Drive
   ```

**优点：**
- 自动云端备份
- 多设备访问
- 防止本地磁盘损坏

---

## 📋 推荐的备份频率

| 使用场景 | 推荐频率 | 方法 |
|---------|---------|------|
| **个人使用** | 每周1次或重要操作后 | 手动备份 |
| **小团队** | 每天1次或重要操作后 | 手动备份 + 云盘同步 |
| **生产环境** | 每天多次 | 考虑定时任务（但你说不想要） |

---

## 🔍 检查数据安全性

**随时检查当前持久化状态：**

```bash
# 检查AOF是否启用
docker exec claude-relay-redis redis-cli -a y8cQENYsMQjWpUC4aW+WbMvaDvSwg2yLSwwBrO1mC6Y= CONFIG GET appendonly

# 查看数据文件
docker exec claude-relay-redis ls -lh /data/

# 检查最后保存时间
docker exec claude-relay-redis redis-cli -a y8cQENYsMQjWpUC4aW+WbMvaDvSwg2yLSwwBrO1mC6Y= LASTSAVE
```

---

## 💡 最佳实践建议

### 最小化方案（懒人必备）

**只做3件事：**

1. ✅ **确保Docker卷存在**（已完成）
   ```bash
   docker volume ls | grep redis-data
   ```

2. ✅ **重要操作后手动备份**
   ```bash
   ./scripts/backup-redis-docker.sh
   ```

3. ✅ **每月导出一次JSON**
   ```bash
   ./scripts/manual-export.sh
   ```

**就这么简单！**

---

### 进阶方案（更安全）

**额外添加：**

4. ✅ 云盘同步备份目录
5. ✅ 使用Git管理重要变更
6. ✅ 定期测试数据恢复

---

## 🆘 数据恢复方法

### 从RDB恢复（最常用）

```bash
# 1. 停止Redis
docker stop claude-relay-redis

# 2. 恢复备份文件
docker run --rm -v redis-data:/data -v $(pwd)/backups:/backups alpine sh -c "cp /backups/dump-最新时间戳.rdb /data/dump.rdb"

# 3. 重启Redis
docker start claude-relay-redis

# 4. 验证数据
docker exec claude-relay-redis redis-cli -a y8cQENYsMQjWpUC4aW+WbMvaDvSwg2yLSwwBrO1mC6Y= DBSIZE
```

### 从JSON恢复

```bash
# 使用项目工具导入
node scripts/data-transfer-enhanced.js import data-exports/data-最新时间戳.json
```

---

## 📊 数据丢失风险评估

| 场景 | 风险 | 你的保护 | 结果 |
|------|------|---------|------|
| **Redis进程崩溃** | 丢失最近1秒 | AOF每秒保存 | ✅ 安全 |
| **意外重启** | 丢失未保存数据 | RDB自动快照 | ✅ 安全 |
| **Docker卷损坏** | 丢失所有数据 | 手动备份 | ⚠️ 需要定期备份 |
| **磁盘故障** | 丢失所有数据 | 云盘同步 | ⚠️ 推荐云盘 |
| **误删除** | 丢失部分数据 | Git版本控制 | ✅ 可恢复 |

---

## 🎯 总结

**你不需要定时备份，只需要：**

1. ✅ 保持AOF+RDB开启（已配置）
2. ✅ 重要操作后手动备份
3. ✅ 可选：云盘同步

**这样已经足够安全了！**

---

## 快捷命令

```bash
# 手动备份Redis
./scripts/backup-redis-docker.sh

# 导出JSON
./scripts/manual-export.sh

# Git版本控制
./scripts/git-backup.sh

# 查看当前数据
docker exec claude-relay-redis redis-cli -a y8cQENYsMQjWpUC4aW+WbMvaDvSwg2yLSwwBrO1mC6Y= DBSIZE
```

---

**记住：数据安全 = 持久化配置 + 定期手动备份**

你现在两者都有了！✅
