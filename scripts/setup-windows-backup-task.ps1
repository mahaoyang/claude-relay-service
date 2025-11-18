# Windows定时任务设置脚本 - Redis自动备份
# 使用方法：在PowerShell管理员模式下运行此脚本

# 配置
$TaskName = "Redis自动备份"
$WSLDistro = "Ubuntu"  # 你的WSL发行版名称，如果不是Ubuntu请修改
$ProjectPath = "/home/ha/workspace/claude-relay-service"
$BackupScript = "$ProjectPath/scripts/backup-redis-docker.sh"

# 创建执行脚本
$Action = New-ScheduledTaskAction -Execute "wsl.exe" -Argument "-d $WSLDistro -- bash -c 'cd $ProjectPath && $BackupScript'"

# 设置触发器：每6小时执行一次
$Trigger = New-ScheduledTaskTrigger -Daily -At 00:00 -RepetitionInterval (New-TimeSpan -Hours 6)

# 设置运行选项
$Settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable:$false `
    -MultipleInstances IgnoreNew

# 设置运行用户（使用当前用户）
$Principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive

# 注册任务
Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $Action `
    -Trigger $Trigger `
    -Settings $Settings `
    -Principal $Principal `
    -Description "每6小时自动备份Claude Relay Service的Redis数据" `
    -Force

Write-Host "✅ 定时任务创建成功！" -ForegroundColor Green
Write-Host ""
Write-Host "📝 任务详情:" -ForegroundColor Cyan
Write-Host "  任务名称: $TaskName"
Write-Host "  执行频率: 每6小时"
Write-Host "  备份脚本: $BackupScript"
Write-Host "  WSL发行版: $WSLDistro"
Write-Host ""
Write-Host "🔍 查看任务:" -ForegroundColor Yellow
Write-Host "  Get-ScheduledTask -TaskName '$TaskName'"
Write-Host ""
Write-Host "🧪 手动测试运行:" -ForegroundColor Yellow
Write-Host "  Start-ScheduledTask -TaskName '$TaskName'"
Write-Host ""
Write-Host "🗑️  删除任务:" -ForegroundColor Red
Write-Host "  Unregister-ScheduledTask -TaskName '$TaskName' -Confirm:`$false"
