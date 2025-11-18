# WSL环境下的Redis自动备份方案

## ❓ 为什么WSL的cron不可靠？

WSL的cron有以下限制：
- ❌ WSL关闭时，cron服务也会停止
- ❌ Windows重启后，WSL不会自动启动
- ❌ cron服务需要手动启动（`sudo service cron start`）
- ❌ 可能因为权限问题无法正常运行

## ✅ 推荐方案：Windows任务计划程序

**优点：**
- ✅ 即使WSL关闭，Windows会自动启动WSL执行任务
- ✅ Windows重启后自动恢复
- ✅ 有完整的GUI管理界面
- ✅ 详细的执行日志和错误报告
- ✅ 可以精确设置执行时间

---

## 🚀 快速设置（3种方法）

### 方法1：一键批处理脚本（最简单）

**步骤：**

1. **以管理员身份**打开PowerShell或CMD
2. 导航到项目目录：
   ```cmd
   cd C:\Users\你的用户名\workspace\claude-relay-service
   ```
3. 运行设置脚本：
   ```cmd
   .\scripts\setup-backup-task.bat
   ```

**就这么简单！** 任务会自动创建，每6小时执行一次备份。

---

### 方法2：PowerShell脚本（推荐）

**步骤：**

1. **以管理员身份**打开PowerShell
2. 导航到项目目录并运行：
   ```powershell
   cd C:\Users\你的用户名\workspace\claude-relay-service
   .\scripts\setup-windows-backup-task.ps1
   ```

**如果遇到执行策略错误：**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

### 方法3：手动创建（完全控制）

#### 步骤1：打开任务计划程序
- 按 `Win + R`
- 输入 `taskschd.msc`
- 点击"确定"

#### 步骤2：创建基本任务
1. 右侧点击"创建基本任务"
2. 名称：`Redis自动备份`
3. 描述：`每6小时备份Claude Relay Service的Redis数据`

#### 步骤3：设置触发器
1. 选择"每天"
2. 开始时间：`00:00:00`
3. 勾选"每隔"：`6 小时`（需要在高级设置中）
4. 或者创建多个触发器：0:00、6:00、12:00、18:00

#### 步骤4：设置操作
1. 选择"启动程序"
2. 程序或脚本：
   ```
   wsl
   ```
3. 添加参数：
   ```
   -d Ubuntu -- bash -c "cd /home/ha/workspace/claude-relay-service && ./scripts/backup-redis-docker.sh"
   ```

   **注意：**
   - 如果你的WSL不是Ubuntu，替换为你的发行版名称（查看：`wsl -l`）
   - 确保路径正确

#### 步骤5：高级设置
1. 勾选"如果过了计划开始时间，立即启动任务"
2. 勾选"如果任务运行失败，每隔...重新启动"
3. 勾选"使用以下电源管理设置" → 取消勾选"只有在计算机使用交流电源时才启动此任务"

---

## 🔍 验证和测试

### 查看任务是否创建成功

**PowerShell：**
```powershell
Get-ScheduledTask -TaskName "Redis自动备份"
```

**CMD：**
```cmd
schtasks /query /tn "Redis自动备份" /v
```

### 手动测试运行

**PowerShell：**
```powershell
Start-ScheduledTask -TaskName "Redis自动备份"
```

**CMD：**
```cmd
schtasks /run /tn "Redis自动备份"
```

### 查看执行结果

1. 打开任务计划程序（`taskschd.msc`）
2. 找到"Redis自动备份"任务
3. 右键 → 属性 → "历史记录"选项卡

或者检查备份目录：
```bash
# 在WSL中
ls -lh ~/workspace/claude-relay-service/backups/
```

---

## 📊 备份计划建议

| 频率 | 适用场景 | 配置 |
|------|---------|------|
| **每6小时** | 推荐 - 平衡性能和安全性 | `/ri 360` |
| **每4小时** | 频繁变动的生产环境 | `/ri 240` |
| **每12小时** | 低频变动的环境 | `/ri 720` |
| **每天1次** | 仅开发环境 | 删除 `/ri` 参数 |

---

## 🛠️ 故障排除

### 问题1：任务执行但没有生成备份

**检查WSL发行版名称：**
```cmd
wsl -l -v
```

如果不是Ubuntu，修改任务中的 `-d Ubuntu` 为实际的发行版名称。

---

### 问题2：权限错误

**解决方案：** 将任务改为以SYSTEM账户运行

1. 打开任务计划程序
2. 右键任务 → 属性
3. "常规"选项卡 → "更改用户或组"
4. 输入：`SYSTEM` → 确定
5. 勾选"不管用户是否登录都要运行"

---

### 问题3：WSL未启动

**解决方案：** 在任务前添加启动WSL的步骤

创建一个批处理脚本 `run-backup.bat`：
```batch
@echo off
REM 确保WSL启动
wsl -d Ubuntu echo "WSL已启动" >nul 2>&1
timeout /t 2 /nobreak >nul

REM 执行备份
wsl -d Ubuntu -- bash -c "cd /home/ha/workspace/claude-relay-service && ./scripts/backup-redis-docker.sh"
```

然后在任务中调用这个批处理文件。

---

### 问题4：路径包含空格

如果路径包含空格，需要用引号包裹：

```batch
wsl -d Ubuntu -- bash -c "cd '/mnt/c/Users/用户名/workspace/claude-relay-service' && ./scripts/backup-redis-docker.sh"
```

---

## 📝 查看备份日志

备份脚本会输出详细日志，可以在任务计划程序中查看。

**更好的方式：** 修改备份脚本，将输出重定向到日志文件：

在 `backup-redis-docker.sh` 最后添加：
```bash
# 记录备份日志
echo "[$(date)] 备份完成" >> /home/ha/workspace/claude-relay-service/backups/backup.log
```

---

## 🔄 其他方案（备选）

### 方案A：WSL的systemd定时器（WSL 2.0.0+）

如果你的WSL支持systemd：

1. 创建service文件：
   ```bash
   sudo nano /etc/systemd/system/redis-backup.service
   ```

2. 添加内容：
   ```ini
   [Unit]
   Description=Redis Backup Service

   [Service]
   Type=oneshot
   User=ha
   ExecStart=/home/ha/workspace/claude-relay-service/scripts/backup-redis-docker.sh
   WorkingDirectory=/home/ha/workspace/claude-relay-service
   ```

3. 创建timer文件：
   ```bash
   sudo nano /etc/systemd/system/redis-backup.timer
   ```

4. 添加内容：
   ```ini
   [Unit]
   Description=Redis Backup Timer

   [Timer]
   OnCalendar=*-*-* 00,06,12,18:00:00
   Persistent=true

   [Install]
   WantedBy=timers.target
   ```

5. 启用timer：
   ```bash
   sudo systemctl enable redis-backup.timer
   sudo systemctl start redis-backup.timer
   ```

**缺点：** WSL关闭时仍然不会运行。

---

### 方案B：Docker容器内的cron

在docker-compose.yml中添加一个专门的备份容器：

```yaml
backup:
  image: alpine:latest
  volumes:
    - redis-data:/data
    - ./backups:/backups
  command: sh -c "echo '0 */6 * * * cp /data/dump.rdb /backups/dump-\$(date +\%Y\%m\%d-\%H\%M\%S).rdb && find /backups -name \"dump-*.rdb\" -mtime +7 -delete' | crontab - && crond -f"
  restart: unless-stopped
```

**优点：** 只要Docker运行就会执行
**缺点：** 需要修改docker-compose配置

---

## 🎯 总结

**最佳实践：**

1. ✅ **使用Windows任务计划程序**（推荐方案1或2）
2. ✅ 每6小时自动备份
3. ✅ 保留最近7个备份（脚本已自动处理）
4. ✅ 定期检查备份是否成功
5. ✅ 每月测试一次数据恢复

**一键命令：**
```cmd
REM 以管理员身份运行
.\scripts\setup-backup-task.bat
```

---

**创建时间：** 2025-11-18
**适用环境：** Windows 10/11 + WSL2 + Docker Desktop
