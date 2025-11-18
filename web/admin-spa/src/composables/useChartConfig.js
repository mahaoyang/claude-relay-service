import { Chart } from 'chart.js/auto'

export function useChartConfig() {
  // 设置Chart.js默认配置
  Chart.defaults.font.family =
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  Chart.defaults.color = 'rgba(255, 255, 255, 0.9)'
  Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(0, 0, 0, 0.9)'
  Chart.defaults.plugins.tooltip.padding = 12
  Chart.defaults.plugins.tooltip.cornerRadius = 8
  Chart.defaults.plugins.tooltip.titleFont.size = 14
  Chart.defaults.plugins.tooltip.bodyFont.size = 12
  Chart.defaults.plugins.tooltip.titleColor = '#ffffff'
  Chart.defaults.plugins.tooltip.bodyColor = 'rgba(255, 255, 255, 0.9)'

  // 全局禁用网格线
  Chart.defaults.scale.grid.display = false
  Chart.defaults.scale.grid.drawBorder = false

  // 全局设置图例为圆形
  Chart.defaults.plugins.legend.labels.usePointStyle = true
  Chart.defaults.plugins.legend.labels.pointStyle = 'circle'
  Chart.defaults.plugins.legend.labels.boxWidth = 8
  Chart.defaults.plugins.legend.labels.boxHeight = 8

  // 创建渐变色
  const getGradient = (ctx, color, opacity = 0.2) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 300)
    gradient.addColorStop(
      0,
      `${color}${Math.round(opacity * 255)
        .toString(16)
        .padStart(2, '0')}`
    )
    gradient.addColorStop(1, `${color}00`)
    return gradient
  }

  // 通用图表选项
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          },
          color: 'rgba(255, 255, 255, 0.9)'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        borderColor: 'rgba(20, 184, 166, 0.5)',
        borderWidth: 1,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || ''
            if (label) {
              label += ': '
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('zh-CN').format(context.parsed.y)
            }
            return label
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11
          },
          color: 'rgba(255, 255, 255, 0.7)'
        }
      },
      y: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11
          },
          color: 'rgba(255, 255, 255, 0.7)',
          callback: function (value) {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + 'M'
            } else if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'K'
            }
            return value
          }
        }
      }
    }
  }

  // 线条图样式配置
  const lineChartStyle = {
    borderWidth: 2,
    tension: 0.4,
    pointRadius: 0,
    pointHoverRadius: 6,
    pointHoverBorderWidth: 2,
    pointHoverBackgroundColor: '#ffffff',
    fill: true
  }

  // 颜色方案
  const colorSchemes = {
    primary: ['#14b8a6', '#0d9488', '#2dd4bf', '#5eead4', '#99f6e4'],
    success: ['#10b981', '#059669', '#34d399', '#6ee7b7', '#a7f3d0'],
    warning: ['#f59e0b', '#d97706', '#fbbf24', '#fcd34d', '#fde68a'],
    danger: ['#ef4444', '#dc2626', '#f87171', '#fca5a5', '#fecaca']
  }

  // Token使用趋势图线条颜色配置 - 使用统一的青绿色系渐变
  const trendLineColors = {
    inputToken: '#14b8a6', // Teal-500 主色
    inputTokenBg: 'rgba(20, 184, 166, 0.15)',
    outputToken: '#2dd4bf', // Teal-400 亮色
    outputTokenBg: 'rgba(45, 212, 191, 0.15)',
    cacheCreate: '#06b6d4', // Cyan-500
    cacheCreateBg: 'rgba(6, 182, 212, 0.15)',
    cacheRead: '#22d3ee', // Cyan-400
    cacheReadBg: 'rgba(34, 211, 238, 0.15)',
    cost: '#10b981', // Emerald-500 绿色
    costBg: 'rgba(16, 185, 129, 0.15)',
    requests: '#0d9488', // Teal-600 深色
    requestsBg: 'rgba(13, 148, 136, 0.15)'
  }

  return {
    getGradient,
    commonOptions,
    lineChartStyle,
    colorSchemes,
    trendLineColors
  }
}
