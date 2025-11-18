@echo off
REM Docker Redis 自动备份脚本 (Windows版本)
REM 用法：backup-redis-docker.bat

setlocal enabledelayedexpansion

REM 配置
set REDIS_CONTAINER=claude-relay-redis
set REDIS_PASSWORD=y8cQENYsMQjWpUC4aW+WbMvaDvSwg2yLSwwBrO1mC6Y=
set BACKUP_DIR=backups
set MAX_BACKUPS=7

REM 生成时间戳
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TIMESTAMP=%datetime:~0,8%-%datetime:~8,6%

REM 创建备份目录
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo 🔍 开始备份Docker Redis数据...

REM 检查容器是否运行
docker ps | findstr /C:"%REDIS_CONTAINER%" >nul
if errorlevel 1 (
    echo ❌ Redis容器未运行！
    exit /b 1
)

REM 获取数据库大小
for /f "tokens=*" %%i in ('docker exec %REDIS_CONTAINER% redis-cli -a %REDIS_PASSWORD% DBSIZE 2^>nul') do set DBSIZE=%%i
echo 📊 当前数据库大小: %DBSIZE%

REM 触发Redis后台保存
echo 💾 触发Redis后台保存...
docker exec %REDIS_CONTAINER% redis-cli -a %REDIS_PASSWORD% BGSAVE 2>nul

REM 等待保存完成
echo ⏳ 等待保存完成...
timeout /t 3 /nobreak >nul

REM 复制RDB文件
echo 📦 复制RDB文件...
docker cp %REDIS_CONTAINER%:/data/dump.rdb "%BACKUP_DIR%\dump-%TIMESTAMP%.rdb"

REM 检查并复制AOF文件
docker exec %REDIS_CONTAINER% test -f /data/appendonly.aof 2>nul
if not errorlevel 1 (
    echo 📦 复制AOF文件...
    docker cp %REDIS_CONTAINER%:/data/appendonly.aof "%BACKUP_DIR%\appendonly-%TIMESTAMP%.aof"
)

REM 清理旧备份（保留最近7个）
echo 🧹 清理旧备份（保留最近%MAX_BACKUPS%个）...
cd /d "%BACKUP_DIR%"
for /f "skip=%MAX_BACKUPS% delims=" %%f in ('dir /b /o-d dump-*.rdb 2^>nul') do del "%%f"
for /f "skip=%MAX_BACKUPS% delims=" %%f in ('dir /b /o-d appendonly-*.aof 2^>nul') do del "%%f"
cd ..

REM 显示备份结果
echo.
echo ✅ 备份完成！
echo 📂 备份位置: %BACKUP_DIR%
echo 📝 备份文件:
dir "%BACKUP_DIR%\*-%TIMESTAMP%.*"
echo.

REM 统计备份数量
for /f %%i in ('dir /b "%BACKUP_DIR%\dump-*.rdb" 2^>nul ^| find /c /v ""') do set RDB_COUNT=%%i
for /f %%i in ('dir /b "%BACKUP_DIR%\appendonly-*.aof" 2^>nul ^| find /c /v ""') do set AOF_COUNT=%%i

echo 📊 当前备份数量:
echo   - RDB备份: %RDB_COUNT%
echo   - AOF备份: %AOF_COUNT%

endlocal
