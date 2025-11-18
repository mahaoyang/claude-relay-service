@echo off
REM 简易版 - 创建Windows定时任务（无需PowerShell脚本）
REM 需要在管理员模式下运行

echo 🔧 创建Redis自动备份定时任务...
echo.

REM 配置变量
set TASK_NAME=Redis自动备份
set WSL_DISTRO=Ubuntu
set PROJECT_PATH=/home/ha/workspace/claude-relay-service
set BACKUP_SCRIPT=%PROJECT_PATH%/scripts/backup-redis-docker.sh

REM 删除已存在的任务（如果有）
schtasks /delete /tn "%TASK_NAME%" /f >nul 2>&1

REM 创建���任务 - 每6小时执行一次
schtasks /create ^
  /tn "%TASK_NAME%" ^
  /tr "wsl -d %WSL_DISTRO% -- bash -c 'cd %PROJECT_PATH% && %BACKUP_SCRIPT%'" ^
  /sc daily ^
  /st 00:00 ^
  /ri 360 ^
  /du 24:00 ^
  /ru SYSTEM ^
  /f

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ 定时任务创建成功！
    echo.
    echo 📝 任务详情:
    echo   任务名称: %TASK_NAME%
    echo   执行频率: 每6小时（从午夜开始）
    echo   备份位置: %PROJECT_PATH%/backups/
    echo.
    echo 🔍 查看任务:
    echo   schtasks /query /tn "%TASK_NAME%" /v
    echo.
    echo 🧪 手动测试运行:
    echo   schtasks /run /tn "%TASK_NAME%"
    echo.
    echo 🗑️  删除任务:
    echo   schtasks /delete /tn "%TASK_NAME%" /f
    echo.
) else (
    echo.
    echo ❌ 任务创建失败！请确保：
    echo   1. 以管理员身份运行此脚本
    echo   2. WSL发行版名称正确（当前: %WSL_DISTRO%）
    echo   3. 项目路径正确（当前: %PROJECT_PATH%）
    echo.
)

pause
