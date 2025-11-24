<template>
  <PageContainer max-width="7xl" :show-footer="false">
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
            Claude Code 使用教程
          </h1>
          <p class="mt-1 text-[10px] text-gray-600 dark:text-gray-400">
            跟着这个教程，你可以轻松在自己的电脑上安装并使用 Claude Code
          </p>
        </div>
        <div class="flex items-center gap-4">
          <!-- 主题切换按钮 -->
          <ThemeToggle class="shadow-sm transition-shadow hover:shadow-md" mode="dropdown" />
        </div>
      </div>
    </template>

    <!-- 系统选择标签 -->
    <Card class="rounded-b-none border-b-0" :no-padding="true">
      <div class="pb-1 pl-4 pr-4 pt-4">
        <TabGroup v-model="activeTutorialSystem" :options="systemOptions" />
      </div>
    </Card>

    <!-- Windows 教程 -->
    <Card v-if="activeTutorialSystem === 'windows'" class="rounded-t-none border-t-0">
      <div class="space-y-6">
        <!-- 第一步：安装 Node.js -->
        <div>
          <h4
            class="relative mb-3 mt-6 border-b-2 border-gray-100 pb-3 text-xl font-semibold text-gray-800 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-16 after:bg-primary-500 after:content-[''] dark:border-gray-700 dark:text-white"
          >
            <span
              class="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 font-bold text-white"
              >1</span
            >
            安装 Node.js 环境
          </h4>
          <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
            Claude Code 需要 Node.js 环境才能运行。
          </p>

          <div>
            <h5 class="mb-2 mt-4 text-lg font-medium text-gray-700 dark:text-white">
              Windows 安装方法
            </h5>
            <div>
              <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                方法一：官网下载（推荐）
              </p>
              <ol class="mb-4 list-inside list-decimal space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <li class="text-xs text-gray-600 dark:text-gray-400">
                  打开浏览器访问
                  <code
                    class="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                    >https://nodejs.org/</code
                  >
                </li>
                <li class="text-xs text-gray-600 dark:text-gray-400">
                  点击 "LTS" 版本进行下载（推荐长期支持版本）
                </li>
                <li class="text-xs text-gray-600 dark:text-gray-400">
                  下载完成后双击
                  <code
                    class="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                    >.msi</code
                  >
                  文件
                </li>
                <li class="text-xs text-gray-600 dark:text-gray-400">
                  按照安装向导完成安装，保持默认设置即可
                </li>
              </ol>
            </div>
            <div>
              <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                方法二：使用包管理器
              </p>
              <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                如果你安装了 Chocolatey 或 Scoop，可以使用命令行安装：
              </p>
              <CodeBlock
                language="powershell"
                :lines="[
                  '# 使用 Chocolatey',
                  'choco install nodejs',
                  '# 或使用 Scoop',
                  'scoop install nodejs'
                ]"
              />
            </div>
            <div>
              <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
                Windows 注意事项
              </h6>
              <ul class="mb-4 list-inside list-disc space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <li class="text-xs text-gray-600 dark:text-gray-400">• 建议使用 PowerShell 而不是 CMD</li>
                <li class="text-xs text-gray-600 dark:text-gray-400">
                  • 如果遇到权限问题，尝试以管理员身份运行
                </li>
                <li class="text-xs text-gray-600 dark:text-gray-400">
                  • 某些杀毒软件可能会误报，需要添加白名单
                </li>
              </ul>
            </div>
          </div>

          <!-- 验证安装 -->
          <div>
            <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
              验证安装是否成功
            </h6>
            <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              安装完成后，打开 PowerShell 或 CMD，输入以下命令：
            </p>
            <CodeBlock language="powershell" :lines="['node --version', 'npm --version']" />
            <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              如果显示版本号，说明安装成功了！
            </p>
          </div>
        </div>

        <!-- 第二步：安装 Claude Code -->
        <div>
          <h4
            class="relative mb-3 mt-6 border-b-2 border-gray-100 pb-3 text-xl font-semibold text-gray-800 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-16 after:bg-primary-500 after:content-[''] dark:border-gray-700 dark:text-white"
          >
            <span
              class="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 font-bold text-white"
              >2</span
            >
            安装 Claude Code
          </h4>

          <div>
            <h5 class="mb-2 mt-4 text-lg font-medium text-gray-700 dark:text-white">
              安装 Claude Code
            </h5>
            <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              打开 PowerShell 或 CMD，运行以下命令：
            </p>
            <CodeBlock
              language="powershell"
              :lines="['# 全局安装 Claude Code', 'npm install -g @anthropic-ai/claude-code']"
            />
            <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              这个命令会从 npm 官方仓库下载并安装最新版本的 Claude Code。
            </p>

            <div>
              <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">提示</h6>
              <ul class="mb-4 list-inside list-disc space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <li class="text-xs text-gray-600 dark:text-gray-400">
                  • 建议使用 PowerShell 而不是 CMD，功能更强大
                </li>
                <li class="text-xs text-gray-600 dark:text-gray-400">
                  • 如果遇到权限问题，以管理员身份运行 PowerShell
                </li>
              </ul>
            </div>
          </div>

          <!-- 验证安装 -->
          <div>
            <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
              验证 Claude Code 安装
            </h6>
            <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              安装完成后，输入以下命令检查是否安装成功：
            </p>
            <CodeBlock language="bash" :lines="['claude --version']" />
            <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              如果显示版本号，恭喜你！Claude Code 已经成功安装了。
            </p>
          </div>
        </div>

        <!-- 第三步：设置环境变量 -->
        <div>
          <h4
            class="relative mb-3 mt-6 border-b-2 border-gray-100 pb-3 text-xl font-semibold text-gray-800 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-16 after:bg-primary-500 after:content-[''] dark:border-gray-700 dark:text-white"
          >
            <span
              class="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 font-bold text-white"
              >3</span
            >
            设置环境变量
          </h4>

          <div>
            <h5 class="mb-2 mt-4 text-lg font-medium text-gray-700 dark:text-white">
              配置 Claude Code 环境变量
            </h5>
            <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              为了让 Claude Code 连接到你的中转服务，需要设置两个环境变量：
            </p>

            <div>
              <div>
                <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
                  方法一：PowerShell 临时设置（当前会话）
                </h6>
                <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  在 PowerShell 中运行以下命令：
                </p>
                <CodeBlock
                  language="powershell"
                  :lines="[
                    `$env:ANTHROPIC_BASE_URL = '${currentBaseUrl}'`,
                    `$env:ANTHROPIC_AUTH_TOKEN = '你的API密钥'`
                  ]"
                />
                <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  💡 记得将 "你的API密钥" 替换为在上方 "API Keys" 标签页中创建的实际密钥。
                </p>
              </div>

              <div>
                <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
                  方法二：PowerShell 永久设置（用户级）
                </h6>
                <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  在 PowerShell 中运行以下命令设置用户级环境变量：
                </p>
                <CodeBlock
                  language="powershell"
                  :lines="[
                    '# 设置用户级环境变量（永久生效）',
                    psSetEnvAnthropicBase,
                    psSetEnvAnthropicToken
                  ]"
                />
                <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  查看已设置的环境变量：
                </p>
                <CodeBlock
                  language="powershell"
                  :lines="['# 查看用户级环境变量', psGetEnvAnthropicBase, psGetEnvAnthropicToken]"
                />
                <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  💡 设置后需要重新打开 PowerShell 窗口才能生效。
                </p>
              </div>
            </div>
          </div>

          <!-- VSCode 插件配置 -->
          <div>
            <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
              VSCode Claude 插件配置
            </h6>
            <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              如果使用 VSCode 的 Claude 插件，需要在配置文件中进行设置：
            </p>
            <div>
              <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                <strong>配置文件位置：</strong>
                <code
                  class="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                  >C:\Users\你的用户名\.claude\config.json</code
                >
              </p>
              <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                💡 如果该文件不存在，请手动创建。
              </p>
            </div>
            <CodeBlock language="json" :lines="vscodeClaudeConfigJson" />
          </div>

          <!-- 验证环境变量设置 -->
          <div>
            <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
              验证环境变量设置
            </h6>
            <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              设置完环境变量后，可以通过以下命令验证是否设置成功：
            </p>

            <div>
              <div>
                <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
                  在 PowerShell 中验证：
                </h6>
                <CodeBlock
                  language="powershell"
                  :lines="['echo $env:ANTHROPIC_BASE_URL', 'echo $env:ANTHROPIC_AUTH_TOKEN']"
                />
              </div>

              <div>
                <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
                  在 CMD 中验证：
                </h6>
                <CodeBlock
                  language="cmd"
                  :lines="['echo %ANTHROPIC_BASE_URL%', 'echo %ANTHROPIC_AUTH_TOKEN%']"
                />
              </div>
            </div>

            <div>
              <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                <strong>预期输出示例：</strong>
              </p>
              <CodeBlock language="bash" :lines="[currentBaseUrl, 'cr_xxxxxxxxxxxxxxxxxx']" />
              <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                💡 如果输出为空或显示变量名本身，说明环境变量设置失败，请重新设置。
              </p>
            </div>
          </div>

          <!-- Gemini CLI 环境变量设置 -->
          <div>
            <h5 class="mb-2 mt-4 text-lg font-medium text-gray-700 dark:text-white">
              配置 Gemini CLI 环境变量
            </h5>
            <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              如果你使用 Gemini CLI，需要设置以下环境变量：
            </p>

            <div>
              <div>
                <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
                  PowerShell 设置方法
                </h6>
                <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  在 PowerShell 中运行以下命令：
                </p>
                <CodeBlock language="powershell" :lines="psSetEnvGeminiTemp" />
                <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  💡 使用与 Claude Code 相同的 API 密钥即可。
                </p>
              </div>

              <div>
                <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
                  PowerShell 永久设置（用户级）
                </h6>
                <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  在 PowerShell 中运行以下命令：
                </p>
                <CodeBlock
                  language="powershell"
                  :lines="[
                    '# 设置用户级环境变量（永久生效）',
                    psSetEnvGeminiBase,
                    psSetEnvGeminiKey,
                    psSetEnvGeminiModel
                  ]"
                />
                <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  💡 设置后需要重新打开 PowerShell 窗口才能生效。
                </p>
              </div>

              <div>
                <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
                  验证 Gemini CLI 环境变量
                </h6>
                <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  在 PowerShell 中验证：
                </p>
                <CodeBlock
                  language="powershell"
                  :lines="[
                    'echo $env:GOOGLE_GEMINI_BASE_URL',
                    'echo $env:GEMINI_API_KEY',
                    'echo $env:GEMINI_MODEL'
                  ]"
                />
              </div>
            </div>
          </div>

          <!-- Codex 环境变量设置 -->
          <div>
            <h5 class="mb-2 mt-4 text-lg font-medium text-gray-700 dark:text-white">
              配置 Codex 环境变量
            </h5>
            <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              如果你使用支持 OpenAI API 的工具（如 Codex），需要设置以下环境变量：
            </p>

            <div>
              <div>
                <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
                  Codex 配置文件
                </h6>
                <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  在
                  <code
                    class="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                    >~/.codex/config.toml</code
                  >
                  文件开头添加以下配置：
                </p>
                <CodeBlock language="toml" :lines="codexConfigContent.configToml" />
                <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  在
                  <code
                    class="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                    >~/.codex/auth.json</code
                  >
                  文件中配置API密钥：
                </p>
                <CodeBlock language="json" :lines="codexConfigContent.authJson" />
                <div>
                  <!-- 描述文字 -->
                  <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                    {{ codexConfigContent.authInstructions.description }}
                  </p>

                  <!-- 标题 -->
                  <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
                    {{ codexConfigContent.authInstructions.title }}
                  </h6>

                  <!-- 当前平台对应的环境变量设置 -->
                  <div>
                    <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                      {{ codexConfigContent.authInstructions.platform.title }}:
                    </p>
                    <CodeBlock
                      :language="activeTutorialSystem === 'windows' ? 'cmd' : 'bash'"
                      :lines="[codexConfigContent.authInstructions.platform.command]"
                    />
                  </div>

                  <!-- Shell 配置文件（仅对于 macOS/Linux 显示） -->
                  <div v-if="codexConfigContent.authInstructions.persistent">
                    <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                      {{ codexConfigContent.authInstructions.persistent.title }}:
                    </p>
                    <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                      {{ codexConfigContent.authInstructions.persistent.description }}
                    </p>
                    <CodeBlock
                      language="bash"
                      :lines="codexConfigContent.authInstructions.persistent.commands"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Droid CLI 配置 -->
        <div>
          <h5 class="mb-2 mt-4 text-lg font-medium text-gray-700 dark:text-white">
            配置 Droid CLI
          </h5>
          <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
            Droid CLI 使用
            <code
              class="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
              >~/.factory/config.json</code
            >
            保存自定义模型；在 Windows 中可直接编辑
            <code
              class="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
              >C:\Users\你的用户名\.factory\config.json</code
            >。
          </p>
          <div>
            <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">配置文件示例</h6>
            <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              将以下内容追加到配置文件中，并替换示例中的域名和 API 密钥：
            </p>
            <CodeBlock language="json" :lines="droidCliConfigLines" />
            <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              💡 在 Droid CLI 中选择自定义模型即可使用新的 Droid 账号池；确保服务地址可被本地访问。
            </p>
          </div>
        </div>
        <!-- 第四步：开始使用 -->
        <div>
          <h4
            class="relative mb-3 mt-6 border-b-2 border-gray-100 pb-3 text-xl font-semibold text-gray-800 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-16 after:bg-primary-500 after:content-[''] dark:border-gray-700 dark:text-white"
          >
            <span
              class="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 font-bold text-white"
              >4</span
            >
            开始使用 Claude Code
          </h4>
          <div>
            <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              现在你可以开始使用 Claude Code 了！
            </p>

            <div>
              <div>
                <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
                  启动 Claude Code
                </h6>
                <CodeBlock language="bash" :lines="['claude']" />
              </div>

              <div>
                <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
                  在特定项目中使用
                </h6>
                <CodeBlock
                  language="powershell"
                  :lines="[
                    '# 进入你的项目目录',
                    'cd C:\\\\path\\\\to\\\\your\\\\project',
                    '# 启动 Claude Code',
                    'claude'
                  ]"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Windows 故障排除 -->
        <div>
          <h4
            class="relative mb-3 mt-6 border-b-2 border-gray-100 pb-3 text-xl font-semibold text-gray-800 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-16 after:bg-primary-500 after:content-[''] dark:border-gray-700 dark:text-white"
          >
            Windows 常见问题解决
          </h4>
          <div>
            <details>
              <summary
                class="flex cursor-pointer items-center gap-2 font-medium text-gray-800 hover:text-primary-500 dark:text-gray-200 dark:hover:text-primary-400"
              >
                <ChevronRight class="chevron-icon flex-shrink-0 text-primary-500" :size="18" />
                安装时提示 "permission denied" 错误
              </summary>
              <div>
                <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  这通常是权限问题，尝试以下解决方法：
                </p>
                <ul class="mb-4 list-inside list-disc space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  <li class="text-xs text-gray-600 dark:text-gray-400">以管理员身份运行 PowerShell</li>
                  <li class="text-xs text-gray-600 dark:text-gray-400">
                    或者配置 npm 使用用户目录：<code
                      class="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      >npm config set prefix %APPDATA%\npm</code
                    >
                  </li>
                </ul>
              </div>
            </details>

            <details>
              <summary
                class="flex cursor-pointer items-center gap-2 font-medium text-gray-800 hover:text-primary-500 dark:text-gray-200 dark:hover:text-primary-400"
              >
                <ChevronRight class="chevron-icon flex-shrink-0 text-primary-500" :size="18" />
                PowerShell 执行策略错误
              </summary>
              <div>
                <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  如果遇到执行策略限制，运行：
                </p>
                <CodeBlock
                  language="powershell"
                  :lines="['Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser']"
                />
              </div>
            </details>

            <details>
              <summary
                class="flex cursor-pointer items-center gap-2 font-medium text-gray-800 hover:text-primary-500 dark:text-gray-200 dark:hover:text-primary-400"
              >
                <ChevronRight class="chevron-icon flex-shrink-0 text-primary-500" :size="18" />
                环境变量设置后不生效
              </summary>
              <div>
                <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  设置永久环境变量后需要：
                </p>
                <ul class="mb-4 list-inside list-disc space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  <li class="text-xs text-gray-600 dark:text-gray-400">重新启动 PowerShell 或 CMD</li>
                  <li class="text-xs text-gray-600 dark:text-gray-400">或者注销并重新登录 Windows</li>
                  <li class="text-xs text-gray-600 dark:text-gray-400">
                    验证设置：<code
                      class="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      >echo $env:ANTHROPIC_BASE_URL</code
                    >
                  </li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </div>
    </Card>

    <!-- macOS 教程 -->
    <Card v-else-if="activeTutorialSystem === 'macos'" class="rounded-t-none border-t-0">
      <div class="space-y-6">
        <!-- 第一步：安装 Node.js -->
        <div>
          <h4
            class="relative mb-3 mt-6 border-b-2 border-gray-100 pb-3 text-xl font-semibold text-gray-800 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-16 after:bg-primary-500 after:content-[''] dark:border-gray-700 dark:text-white"
          >
            <span
              class="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 font-bold text-white"
              >1</span
            >
            安装 Node.js 环境
          </h4>
          <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
            Claude Code 需要 Node.js 环境才能运行。
          </p>

          <div>
            <h5 class="mb-2 mt-4 text-lg font-medium text-gray-700 dark:text-white">
              macOS 安装方法
            </h5>
            <div>
              <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                方法一：使用 Homebrew（推荐）
              </p>
              <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                如果你已经安装了 Homebrew，使用它安装 Node.js 会更方便：
              </p>
              <CodeBlock
                language="bash"
                :lines="['# 更新 Homebrew', 'brew update', '# 安装 Node.js', 'brew install node']"
              />
            </div>
            <div>
              <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">方法二：官网下载</p>
              <ol class="mb-4 list-inside list-decimal space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <li class="text-xs text-gray-600 dark:text-gray-400">
                  访问
                  <code
                    class="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                    >https://nodejs.org/</code
                  >
                </li>
                <li class="text-xs text-gray-600 dark:text-gray-400">下载适合 macOS 的 LTS 版本</li>
                <li class="text-xs text-gray-600 dark:text-gray-400">
                  打开下载的
                  <code
                    class="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                    >.pkg</code
                  >
                  文件
                </li>
                <li class="text-xs text-gray-600 dark:text-gray-400">按照安装程序指引完成安装</li>
              </ol>
            </div>
            <div>
              <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
                macOS 注意事项
              </h6>
              <ul class="mb-4 list-inside list-disc space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <li class="text-xs text-gray-600 dark:text-gray-400">
                  • 如果遇到权限问题，可能需要使用
                  <code
                    class="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                    >sudo</code
                  >
                </li>
                <li class="text-xs text-gray-600 dark:text-gray-400">
                  • 首次运行可能需要在系统偏好设置中允许
                </li>
                <li class="text-xs text-gray-600 dark:text-gray-400">• 建议使用 Terminal 或 iTerm2</li>
              </ul>
            </div>
          </div>

          <!-- 验证安装 -->
          <div>
            <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
              验证安装是否成功
            </h6>
            <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              安装完成后，打开 Terminal，输入以下命令：
            </p>
            <CodeBlock language="bash" :lines="['node --version', 'npm --version']" />
            <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              如果显示版本号，说明安装成功了！
            </p>
          </div>
        </div>

        <!-- 第二步：安装 Claude Code -->
        <div>
          <h4
            class="relative mb-3 mt-6 border-b-2 border-gray-100 pb-3 text-xl font-semibold text-gray-800 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-16 after:bg-primary-500 after:content-[''] dark:border-gray-700 dark:text-white"
          >
            <span
              class="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 font-bold text-white"
              >2</span
            >
            安装 Claude Code
          </h4>

          <div>
            <h5 class="mb-2 mt-4 text-lg font-medium text-gray-700 dark:text-white">
              安装 Claude Code
            </h5>
            <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              打开 Terminal，运行以下命令：
            </p>
            <CodeBlock
              language="bash"
              :lines="['# 全局安装 Claude Code', 'npm install -g @anthropic-ai/claude-code']"
            />
            <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              如果遇到权限问题，可以使用 sudo：
            </p>
            <CodeBlock language="bash" :lines="['sudo npm install -g @anthropic-ai/claude-code']" />
          </div>

          <!-- 验证安装 -->
          <div>
            <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
              验证 Claude Code 安装
            </h6>
            <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              安装完成后，输入以下命令检查是否安装成功：
            </p>
            <CodeBlock language="bash" :lines="['claude --version']" />
            <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              如果显示版本号，恭喜你！Claude Code 已经成功安装了。
            </p>
          </div>
        </div>

        <!-- 第三步：设置环境变量 -->
        <div>
          <h4
            class="relative mb-3 mt-6 border-b-2 border-gray-100 pb-3 text-xl font-semibold text-gray-800 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-16 after:bg-primary-500 after:content-[''] dark:border-gray-700 dark:text-white"
          >
            <span
              class="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 font-bold text-white"
              >3</span
            >
            设置环境变量
          </h4>

          <div>
            <h5 class="mb-2 mt-4 text-lg font-medium text-gray-700 dark:text-white">
              配置 Claude Code 环境变量
            </h5>
            <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              为了让 Claude Code 连接到你的中转服务，需要设置两个环境变量：
            </p>

            <div>
              <div>
                <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
                  方法一：临时设置（当前会话）
                </h6>
                <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  在 Terminal 中运行以下命令：
                </p>
                <CodeBlock language="bash" :lines="bashSetEnvAnthropicTemp" />
                <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  💡 记得将 "你的API密钥" 替换为在上方 "API Keys" 标签页中创建的实际密钥。
                </p>
              </div>

              <div>
                <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
                  方法二：永久设置
                </h6>
                <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  编辑你的 shell 配置文件（根据你使用的 shell）：
                </p>
                <CodeBlock language="bash" :lines="bashPermanentZshAnth" />
                <CodeBlock language="bash" :lines="bashPermanentBashAnth" />
              </div>
            </div>
          </div>

          <!-- VSCode 插件配置 (macOS) -->
          <div>
            <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
              VSCode Claude 插件配置
            </h6>
            <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              如果使用 VSCode 的 Claude 插件，需要在配置文件中进行设置：
            </p>
            <div>
              <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                <strong>配置文件位置：</strong>
                <code
                  class="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                  >~/.claude/config.json</code
                >
              </p>
              <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                💡 如果该文件不存在，请手动创建。
              </p>
            </div>
            <CodeBlock language="json" :lines="vscodeClaudeConfigJson" />
          </div>

          <!-- Gemini CLI 环境变量设置 -->
          <div>
            <h5 class="mb-2 mt-4 text-lg font-medium text-gray-700 dark:text-white">
              配置 Gemini CLI 环境变量
            </h5>
            <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              如果你使用 Gemini CLI，需要设置以下环境变量：
            </p>

            <div>
              <div>
                <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
                  Terminal 设置方法
                </h6>
                <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  在 Terminal 中运行以下命令：
                </p>
                <CodeBlock language="bash" :lines="bashSetEnvGeminiTemp" />
                <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  💡 使用与 Claude Code 相同的 API 密钥即可。
                </p>
              </div>

              <div>
                <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
                  永久设置方法
                </h6>
                <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  添加到你的 shell 配置文件：
                </p>
                <CodeBlock language="bash" :lines="bashPermanentZshGemini" />
                <CodeBlock language="bash" :lines="bashPermanentBashGemini" />
              </div>

              <div>
                <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
                  验证 Gemini CLI 环境变量
                </h6>
                <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  在 Terminal 中验证：
                </p>
                <CodeBlock
                  language="bash"
                  :lines="[
                    'echo $GOOGLE_GEMINI_BASE_URL',
                    'echo $GEMINI_API_KEY',
                    'echo $GEMINI_MODEL'
                  ]"
                />
              </div>
            </div>
          </div>

          <!-- Codex 环境变量设置 -->
          <div>
            <h5 class="mb-2 mt-4 text-lg font-medium text-gray-700 dark:text-white">
              配置 Codex 环境变量
            </h5>
            <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              如果你使用支持 OpenAI API 的工具（如 Codex），需要设置以下环境变量：
            </p>

            <div>
              <div>
                <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
                  Codex 配置文件
                </h6>
                <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  在
                  <code
                    class="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                    >~/.codex/config.toml</code
                  >
                  文件开头添加以下配置：
                </p>
                <CodeBlock language="toml" :lines="codexConfigContent.configToml" />
                <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  在
                  <code
                    class="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                    >~/.codex/auth.json</code
                  >
                  文件中配置API密钥：
                </p>
                <CodeBlock language="json" :lines="codexConfigContent.authJson" />
                <div>
                  <!-- 描述文字 -->
                  <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                    {{ codexConfigContent.authInstructions.description }}
                  </p>

                  <!-- 标题 -->
                  <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
                    {{ codexConfigContent.authInstructions.title }}
                  </h6>

                  <!-- 当前平台对应的环境变量设置 -->
                  <div>
                    <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                      {{ codexConfigContent.authInstructions.platform.title }}:
                    </p>
                    <CodeBlock
                      :language="activeTutorialSystem === 'windows' ? 'cmd' : 'bash'"
                      :lines="[codexConfigContent.authInstructions.platform.command]"
                    />
                  </div>

                  <!-- Shell 配置文件（仅对于 macOS/Linux 显示） -->
                  <div v-if="codexConfigContent.authInstructions.persistent">
                    <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                      {{ codexConfigContent.authInstructions.persistent.title }}:
                    </p>
                    <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                      {{ codexConfigContent.authInstructions.persistent.description }}
                    </p>
                    <CodeBlock
                      language="bash"
                      :lines="codexConfigContent.authInstructions.persistent.commands"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Droid CLI 配置 -->
        <div>
          <h5 class="mb-2 mt-4 text-lg font-medium text-gray-700 dark:text-white">
            配置 Droid CLI
          </h5>
          <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
            Droid CLI 使用
            <code
              class="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
              >~/.factory/config.json</code
            >
            保存自定义模型；你可以在 Finder 中按
            <code
              class="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
              >⌘ + Shift + G</code
            >
            并输入路径，或运行
            <code
              class="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
              >open ~/.factory</code
            >
            快速打开配置目录。
          </p>
          <div>
            <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">配置文件示例</h6>
            <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              将以下内容追加到配置文件中，并替换示例中的域名和 API 密钥：
            </p>
            <CodeBlock language="json" :lines="droidCliConfigLines" />
            <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              💡 在 Droid CLI 中选择自定义模型即可使用新的 Droid 账号池；确保服务地址可被本地访问。
            </p>
          </div>
        </div>

        <!-- 第四步：开始使用 -->
        <div>
          <h4
            class="relative mb-3 mt-6 border-b-2 border-gray-100 pb-3 text-xl font-semibold text-gray-800 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-16 after:bg-primary-500 after:content-[''] dark:border-gray-700 dark:text-white"
          >
            <span
              class="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 font-bold text-white"
              >4</span
            >
            开始使用 Claude Code
          </h4>
          <div>
            <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              现在你可以开始使用 Claude Code 了！
            </p>

            <div>
              <div>
                <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
                  启动 Claude Code
                </h6>
                <CodeBlock language="bash" :lines="['claude']" />
              </div>

              <div>
                <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
                  在特定项目中使用
                </h6>
                <CodeBlock
                  language="bash"
                  :lines="[
                    '# 进入你的项目目录',
                    'cd /path/to/your/project',
                    '# 启动 Claude Code',
                    'claude'
                  ]"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- macOS 故障排除 -->
        <div>
          <h4
            class="relative mb-3 mt-6 border-b-2 border-gray-100 pb-3 text-xl font-semibold text-gray-800 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-16 after:bg-primary-500 after:content-[''] dark:border-gray-700 dark:text-white"
          >
            macOS 常见问题解决
          </h4>
          <div>
            <details>
              <summary
                class="flex cursor-pointer items-center gap-2 font-medium text-gray-800 hover:text-primary-500 dark:text-gray-200 dark:hover:text-primary-400"
              >
                <ChevronRight class="chevron-icon flex-shrink-0 text-primary-500" :size="18" />
                安装时提示权限错误
              </summary>
              <div>
                <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  尝试以下解决方法：
                </p>
                <ul class="mb-4 list-inside list-disc space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  <li class="text-xs text-gray-600 dark:text-gray-400">
                    使用 sudo 安装：<code
                      class="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      >sudo npm install -g @anthropic-ai/claude-code</code
                    >
                  </li>
                  <li class="text-xs text-gray-600 dark:text-gray-400">
                    或者配置 npm 使用用户目录：<code
                      class="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      >npm config set prefix ~/.npm-global</code
                    >
                  </li>
                </ul>
              </div>
            </details>

            <details>
              <summary
                class="flex cursor-pointer items-center gap-2 font-medium text-gray-800 hover:text-primary-500 dark:text-gray-200 dark:hover:text-primary-400"
              >
                <ChevronRight class="chevron-icon flex-shrink-0 text-primary-500" :size="18" />
                macOS 安全设置阻止运行
              </summary>
              <div>
                <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  如果系统阻止运行 Claude Code：
                </p>
                <ul class="mb-4 list-inside list-disc space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  <li class="text-xs text-gray-600 dark:text-gray-400">
                    打开"系统偏好设置" → "安全性与隐私"
                  </li>
                  <li class="text-xs text-gray-600 dark:text-gray-400">点击"仍要打开"或"允许"</li>
                  <li class="text-xs text-gray-600 dark:text-gray-400">
                    或者在 Terminal 中运行：<code
                      class="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      >sudo spctl --master-disable</code
                    >
                  </li>
                </ul>
              </div>
            </details>

            <details>
              <summary
                class="flex cursor-pointer items-center gap-2 font-medium text-gray-800 hover:text-primary-500 dark:text-gray-200 dark:hover:text-primary-400"
              >
                <ChevronRight class="chevron-icon flex-shrink-0 text-primary-500" :size="18" />
                环境变量不生效
              </summary>
              <div>
                <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">检查以下几点：</p>
                <ul class="mb-4 list-inside list-disc space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  <li class="text-xs text-gray-600 dark:text-gray-400">
                    确认修改了正确的配置文件（.zshrc 或 .bash_profile）
                  </li>
                  <li class="text-xs text-gray-600 dark:text-gray-400">重新启动 Terminal</li>
                  <li class="text-xs text-gray-600 dark:text-gray-400">
                    验证设置：<code
                      class="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      >echo $ANTHROPIC_BASE_URL</code
                    >
                  </li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </div>
    </Card>

    <!-- Linux 教程 -->
    <Card v-else-if="activeTutorialSystem === 'linux'" class="rounded-t-none border-t-0">
      <div class="space-y-6">
        <!-- 第一步：安装 Node.js -->
        <div>
          <h4
            class="relative mb-3 mt-6 border-b-2 border-gray-100 pb-3 text-xl font-semibold text-gray-800 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-16 after:bg-primary-500 after:content-[''] dark:border-gray-700 dark:text-white"
          >
            <span
              class="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 font-bold text-white"
              >1</span
            >
            安装 Node.js 环境
          </h4>
          <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
            Claude Code 需要 Node.js 环境才能运行。
          </p>

          <div>
            <h5 class="mb-2 mt-4 text-lg font-medium text-gray-700 dark:text-white">
              Linux 安装方法
            </h5>
            <div>
              <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                方法一：使用官方仓库（推荐）
              </p>
              <CodeBlock
                language="bash"
                :lines="[
                  '# 添加 NodeSource 仓库',
                  'curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -',
                  '# 安装 Node.js',
                  'sudo apt-get install -y nodejs'
                ]"
              />
            </div>
            <div>
              <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                方法二：使用系统包管理器
              </p>
              <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                虽然版本可能不是最新的，但对于基本使用已经足够：
              </p>
              <CodeBlock
                language="bash"
                :lines="[
                  '# Ubuntu/Debian',
                  'sudo apt update',
                  'sudo apt install nodejs npm',
                  '# CentOS/RHEL/Fedora',
                  'sudo dnf install nodejs npm'
                ]"
              />
            </div>
            <div>
              <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
                Linux 注意事项
              </h6>
              <ul class="mb-4 list-inside list-disc space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <li class="text-xs text-gray-600 dark:text-gray-400">• 某些发行版可能需要安装额外的依赖</li>
                <li class="text-xs text-gray-600 dark:text-gray-400">
                  • 如果遇到权限问题，使用
                  <code
                    class="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                    >sudo</code
                  >
                </li>
                <li class="text-xs text-gray-600 dark:text-gray-400">
                  • 确保你的用户在 npm 的全局目录有写权限
                </li>
              </ul>
            </div>
          </div>

          <!-- 验证安装 -->
          <div>
            <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
              验证安装是否成功
            </h6>
            <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              安装完成后，打开终端，输入以下命令：
            </p>
            <CodeBlock language="bash" :lines="['node --version', 'npm --version']" />
            <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              如果显示版本号，说明安装成功了！
            </p>
          </div>
        </div>

        <!-- 第二步：安装 Claude Code -->
        <div>
          <h4
            class="relative mb-3 mt-6 border-b-2 border-gray-100 pb-3 text-xl font-semibold text-gray-800 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-16 after:bg-primary-500 after:content-[''] dark:border-gray-700 dark:text-white"
          >
            <span
              class="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 font-bold text-white"
              >2</span
            >
            安装 Claude Code
          </h4>

          <div>
            <h5 class="mb-2 mt-4 text-lg font-medium text-gray-700 dark:text-white">
              安装 Claude Code
            </h5>
            <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              打开终端，运行以下命令：
            </p>
            <CodeBlock
              language="bash"
              :lines="['# 全局安装 Claude Code', 'npm install -g @anthropic-ai/claude-code']"
            />
            <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              如果遇到权限问题，可以使用 sudo：
            </p>
            <CodeBlock language="bash" :lines="['sudo npm install -g @anthropic-ai/claude-code']" />
          </div>

          <!-- 验证安装 -->
          <div>
            <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
              验证 Claude Code 安装
            </h6>
            <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              安装完成后，输入以下命令检查是否安装成功：
            </p>
            <CodeBlock language="bash" :lines="['claude --version']" />
            <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              如果显示版本号，恭喜你！Claude Code 已经成功安装了。
            </p>
          </div>
        </div>

        <!-- 第三步：设置环境变量 -->
        <div>
          <h4
            class="relative mb-3 mt-6 border-b-2 border-gray-100 pb-3 text-xl font-semibold text-gray-800 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-16 after:bg-primary-500 after:content-[''] dark:border-gray-700 dark:text-white"
          >
            <span
              class="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 font-bold text-white"
              >3</span
            >
            设置环境变量
          </h4>

          <div>
            <h5 class="mb-2 mt-4 text-lg font-medium text-gray-700 dark:text-white">
              配置 Claude Code 环境变量
            </h5>
            <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              为了让 Claude Code 连接到你的中转服务，需要设置两个环境变量：
            </p>

            <div>
              <div>
                <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
                  方法一：临时设置（当前会话）
                </h6>
                <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  在终端中运行以下命令：
                </p>
                <CodeBlock language="bash" :lines="bashSetEnvAnthropicTemp" />
                <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  💡 记得将 "你的API密钥" 替换为在上方 "API Keys" 标签页中创建的实际密钥。
                </p>
              </div>

              <div>
                <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
                  方法二：永久设置
                </h6>
                <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  编辑你的 shell 配置文件：
                </p>
                <CodeBlock language="bash" :lines="linuxBashrcAnth" />
                <CodeBlock language="bash" :lines="linuxZshAnth" />
              </div>
            </div>
          </div>

          <!-- Gemini CLI 环境变量设置 -->
          <div>
            <h5 class="mb-2 mt-4 text-lg font-medium text-gray-700 dark:text-white">
              配置 Gemini CLI 环境变量
            </h5>
            <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              如果你使用 Gemini CLI，需要设置以下环境变量：
            </p>

            <div>
              <div>
                <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
                  终端设置方法
                </h6>
                <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  在终端中运行以下命令：
                </p>
                <CodeBlock language="bash" :lines="bashSetEnvGeminiTemp" />
                <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  💡 使用与 Claude Code 相同的 API 密钥即可。
                </p>
              </div>

              <div>
                <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
                  永久设置方法
                </h6>
                <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  添加到你的 shell 配置文件：
                </p>
                <CodeBlock language="bash" :lines="linuxBashrcGemini" />
                <CodeBlock language="bash" :lines="linuxZshGemini" />
              </div>

              <div>
                <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
                  验证 Gemini CLI 环境变量
                </h6>
                <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">在终端中验证：</p>
                <CodeBlock
                  language="bash"
                  :lines="[
                    'echo $GOOGLE_GEMINI_BASE_URL',
                    'echo $GEMINI_API_KEY',
                    'echo $GEMINI_MODEL'
                  ]"
                />
              </div>
            </div>
          </div>

          <!-- Codex 环境变量设置 -->
          <div>
            <h5 class="mb-2 mt-4 text-lg font-medium text-gray-700 dark:text-white">
              配置 Codex 环境变量
            </h5>
            <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              如果你使用支持 OpenAI API 的工具（如 Codex），需要设置以下环境变量：
            </p>

            <div>
              <div>
                <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
                  Codex 配置文件
                </h6>
                <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  在
                  <code
                    class="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                    >~/.codex/config.toml</code
                  >
                  文件开头添加以下配置：
                </p>
                <CodeBlock language="toml" :lines="codexConfigContent.configToml" />
                <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  在
                  <code
                    class="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                    >~/.codex/auth.json</code
                  >
                  文件中配置API密钥：
                </p>
                <CodeBlock language="json" :lines="codexConfigContent.authJson" />
                <div>
                  <!-- 描述文字 -->
                  <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                    {{ codexConfigContent.authInstructions.description }}
                  </p>

                  <!-- 标题 -->
                  <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
                    {{ codexConfigContent.authInstructions.title }}
                  </h6>

                  <!-- 当前平台对应的环境变量设置 -->
                  <div>
                    <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                      {{ codexConfigContent.authInstructions.platform.title }}:
                    </p>
                    <CodeBlock
                      :language="activeTutorialSystem === 'windows' ? 'cmd' : 'bash'"
                      :lines="[codexConfigContent.authInstructions.platform.command]"
                    />
                  </div>

                  <!-- Shell 配置文件（仅对于 macOS/Linux 显示） -->
                  <div v-if="codexConfigContent.authInstructions.persistent">
                    <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                      {{ codexConfigContent.authInstructions.persistent.title }}:
                    </p>
                    <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                      {{ codexConfigContent.authInstructions.persistent.description }}
                    </p>
                    <CodeBlock
                      language="bash"
                      :lines="codexConfigContent.authInstructions.persistent.commands"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- VSCode 插件配置 (Linux) -->
          <div>
            <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
              VSCode Claude 插件配置
            </h6>
            <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              如果使用 VSCode 的 Claude 插件，需要在配置文件中进行设置：
            </p>
            <div>
              <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                <strong>配置文件位置：</strong>
                <code
                  class="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                  >~/.claude/config.json</code
                >
              </p>
              <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                💡 如果该文件不存在，请手动创建。
              </p>
            </div>
            <CodeBlock language="json" :lines="vscodeClaudeConfigJson" />
          </div>

          <!-- Droid CLI 配置 -->
          <div>
            <h5 class="mb-2 mt-4 text-lg font-medium text-gray-700 dark:text-white">
              配置 Droid CLI
            </h5>
            <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              Droid CLI 使用
              <code
                class="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                >~/.factory/config.json</code
              >
              保存自定义模型；在 Linux 或 WSL2 中，可直接编辑
              <code
                class="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                >/home/你的用户名/.factory/config.json</code
              >
              或在终端运行
              <code
                class="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                >xdg-open ~/.factory</code
              >
              打开目录。
            </p>
            <div>
              <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">配置文件示例</h6>
              <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                将以下内容追加到配置文件中，并替换示例中的域名和 API 密钥：
              </p>
              <div>
                <div v-for="(line, index) in droidCliConfigLines" :key="line + index">
                  {{ line }}
                </div>
              </div>
              <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                💡 在 Droid CLI 中选择自定义模型即可使用新的 Droid
                账号池；确保服务地址可被本地访问。
              </p>
            </div>
          </div>

          <!-- 第四步：开始使用 -->
          <div>
            <h4
              class="relative mb-3 mt-6 border-b-2 border-gray-100 pb-3 text-xl font-semibold text-gray-800 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-16 after:bg-primary-500 after:content-[''] dark:border-gray-700 dark:text-white"
            >
              <span
                class="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 font-bold text-white"
                >4</span
              >
              开始使用 Claude Code
            </h4>
            <div>
              <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                现在你可以开始使用 Claude Code 了！
              </p>

              <div>
                <div>
                  <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
                    启动 Claude Code
                  </h6>
                  <div>
                    <div>claude</div>
                  </div>
                </div>

                <div>
                  <h6 class="mb-2 text-base font-medium text-gray-700 dark:text-white">
                    在特定项目中使用
                  </h6>
                  <CodeBlock
                    language="bash"
                    :lines="[
                      '# 进入你的项目目录',
                      'cd /path/to/your/project',
                      '# 启动 Claude Code',
                      'claude'
                    ]"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Linux 故障排除 -->
          <div>
            <h4
              class="relative mb-3 mt-6 border-b-2 border-gray-100 pb-3 text-xl font-semibold text-gray-800 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-16 after:bg-primary-500 after:content-[''] dark:border-gray-700 dark:text-white"
            >
              Linux 常见问题解决
            </h4>
            <div>
              <details>
                <summary
                  class="cursor-pointer font-medium text-gray-800 hover:text-primary-500 dark:text-gray-200 dark:hover:text-primary-400"
                >
                  安装时提示权限错误
                </summary>
                <div>
                  <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                    尝试以下解决方法：
                  </p>
                  <ul class="mb-4 list-inside list-disc space-y-2 text-xs text-gray-600 dark:text-gray-400">
                    <li class="text-xs text-gray-600 dark:text-gray-400">
                      使用 sudo 安装：<code
                        class="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                        >sudo npm install -g @anthropic-ai/claude-code</code
                      >
                    </li>
                    <li class="text-xs text-gray-600 dark:text-gray-400">
                      或者配置 npm 使用用户目录：<code
                        class="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                        >npm config set prefix ~/.npm-global</code
                      >
                    </li>
                    <li class="text-xs text-gray-600 dark:text-gray-400">
                      然后添加到 PATH：<code
                        class="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                        >export PATH=~/.npm-global/bin:$PATH</code
                      >
                    </li>
                  </ul>
                </div>
              </details>

              <details>
                <summary
                  class="cursor-pointer font-medium text-gray-800 hover:text-primary-500 dark:text-gray-200 dark:hover:text-primary-400"
                >
                  缺少依赖库
                </summary>
                <div>
                  <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                    某些 Linux 发行版需要安装额外依赖：
                  </p>
                  <CodeBlock language="bash" :lines="linuxMissingDeps" />
                </div>
              </details>

              <details>
                <summary
                  class="cursor-pointer font-medium text-gray-800 hover:text-primary-500 dark:text-gray-200 dark:hover:text-primary-400"
                >
                  环境变量不生效
                </summary>
                <div>
                  <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                    检查以下几点：
                  </p>
                  <ul class="mb-4 list-inside list-disc space-y-2 text-xs text-gray-600 dark:text-gray-400">
                    <li class="text-xs text-gray-600 dark:text-gray-400">
                      确认修改了正确的配置文件（.bashrc 或 .zshrc）
                    </li>
                    <li class="text-xs text-gray-600 dark:text-gray-400">
                      重新启动终端或运行
                      <code
                        class="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                        >source ~/.bashrc</code
                      >
                    </li>
                    <li class="text-xs text-gray-600 dark:text-gray-400">
                      验证设置：<code
                        class="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                        >echo $ANTHROPIC_BASE_URL</code
                      >
                    </li>
                  </ul>
                </div>
              </details>
            </div>
          </div>
        </div>

        <!-- 结尾 -->
        <div>
          <h5 class="mb-2 mt-4 text-lg font-medium text-gray-700 dark:text-white">🎉 恭喜你！</h5>
          <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
            你已经成功安装并配置了 Claude Code，现在可以开始享受 AI 编程助手带来的便利了。
          </p>
          <p class="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
            如果在使用过程中遇到任何问题，可以查看官方文档或社区讨论获取帮助。
          </p>
        </div>
      </div>
    </Card>
  </PageContainer>
</template>

<script setup>
import { computed, ref } from 'vue'
import CodeBlock from '@/components/common/CodeBlock.vue'
import TabGroup from '@/components/common/TabGroup.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import { Card } from '@/ui'
import { ChevronRight } from 'lucide-vue-next'

// 当前系统选择
const activeTutorialSystem = ref('windows')

// 系统选项
const systemOptions = [
  { value: 'windows', label: 'Windows' },
  { value: 'macos', label: 'macOS' },
  { value: 'linux', label: 'Linux / WSL2' }
]

// 获取基础URL前缀
const getBaseUrlPrefix = () => {
  // 优先使用环境变量配置的自定义前缀
  const customPrefix = import.meta.env.VITE_API_BASE_PREFIX
  if (customPrefix) {
    // 去除末尾的斜杠
    return customPrefix.replace(/\/$/, '')
  }

  // 否则使用当前浏览器访问地址
  // 更健壮的获取 origin 的方法，兼容旧版浏览器和特殊环境
  let origin = ''

  if (window.location.origin) {
    // 现代浏览器直接支持 origin
    origin = window.location.origin
  } else {
    // 旧版浏览器或特殊环境的兼容处理
    const protocol = window.location.protocol
    const hostname = window.location.hostname
    const port = window.location.port

    origin = protocol + '//' + hostname

    // 只有在非默认端口时才添加端口号
    if (
      port &&
      ((protocol === 'http:' && port !== '80') || (protocol === 'https:' && port !== '443'))
    ) {
      origin += ':' + port
    }
  }

  // 如果还是获取不到，使用当前页面的 URL 推导
  if (!origin) {
    const currentUrl = window.location.href
    const pathStart = currentUrl.indexOf('/', 8) // 跳过 http:// 或 https://
    if (pathStart !== -1) {
      origin = currentUrl.substring(0, pathStart)
    } else {
      // 最后的降级方案，使用相对路径
      return ''
    }
  }

  return origin
}

// 当前基础URL - Claude Code
const currentBaseUrl = computed(() => {
  return getBaseUrlPrefix() + '/api'
})

// Gemini CLI 基础URL
const geminiBaseUrl = computed(() => {
  return getBaseUrlPrefix() + '/gemini'
})

// OpenAI/Codex 基础URL
const openaiBaseUrl = computed(() => {
  return getBaseUrlPrefix() + '/openai'
})

// Droid 类型账号基础URL
const droidClaudeBaseUrl = computed(() => {
  return getBaseUrlPrefix() + '/droid/claude'
})

const droidOpenaiBaseUrl = computed(() => {
  return getBaseUrlPrefix() + '/droid/openai'
})

// PowerShell SetEnvironmentVariable 命令（Windows）
const psSetEnvAnthropicBase = computed(() => {
  return `[System.Environment]::SetEnvironmentVariable('ANTHROPIC_BASE_URL', '${currentBaseUrl.value}', [System.EnvironmentVariableTarget]::User)`
})

const psSetEnvAnthropicToken = computed(() => {
  return `[System.Environment]::SetEnvironmentVariable('ANTHROPIC_AUTH_TOKEN', '你的API密钥', [System.EnvironmentVariableTarget]::User)`
})

const psGetEnvAnthropicBase = computed(() => {
  return `[System.Environment]::GetEnvironmentVariable('ANTHROPIC_BASE_URL', [System.EnvironmentVariableTarget]::User)`
})

const psGetEnvAnthropicToken = computed(() => {
  return `[System.Environment]::GetEnvironmentVariable('ANTHROPIC_AUTH_TOKEN', [System.EnvironmentVariableTarget]::User)`
})

const psSetEnvGeminiBase = computed(() => {
  return `[System.Environment]::SetEnvironmentVariable('GOOGLE_GEMINI_BASE_URL', '${geminiBaseUrl.value}', [System.EnvironmentVariableTarget]::User)`
})

const psSetEnvGeminiKey = computed(() => {
  return `[System.Environment]::SetEnvironmentVariable('GEMINI_API_KEY', '你的API密钥', [System.EnvironmentVariableTarget]::User)`
})

const psSetEnvGeminiModel = computed(() => {
  return `[System.Environment]::SetEnvironmentVariable('GEMINI_MODEL', 'gemini-2.5-pro', [System.EnvironmentVariableTarget]::User)`
})

// VSCode Claude 插件配置 JSON
const vscodeClaudeConfigJson = computed(() => {
  return ['{', '  "primaryApiKey": "crs"', '}']
})

// PowerShell 临时环境变量设置（Gemini）
const psSetEnvGeminiTemp = computed(() => {
  return [
    `$env:GOOGLE_GEMINI_BASE_URL = "${geminiBaseUrl.value}"`,
    `$env:GEMINI_API_KEY = "你的API密钥"`,
    `$env:GEMINI_MODEL = "gemini-2.5-pro"`
  ]
})

// Bash/Shell 临时环境变量设置（Anthropic/macOS/Linux）
const bashSetEnvAnthropicTemp = computed(() => {
  return [
    `export ANTHROPIC_BASE_URL="${currentBaseUrl.value}"`,
    `export ANTHROPIC_AUTH_TOKEN="你的API密钥"`
  ]
})

// Bash/Shell 临时环境变量设置（Gemini/macOS/Linux）
const bashSetEnvGeminiTemp = computed(() => {
  return [
    `export GOOGLE_GEMINI_BASE_URL="${geminiBaseUrl.value}"`,
    `export GEMINI_API_KEY="你的API密钥"`,
    `export GEMINI_MODEL="gemini-2.5-pro"`
  ]
})

// Bash永久设置 - zsh (Anthropic)
const bashPermanentZshAnth = computed(() => {
  return [
    '# 对于 zsh (默认)',
    `echo 'export ANTHROPIC_BASE_URL="${currentBaseUrl.value}"' >> ~/.zshrc`,
    `echo 'export ANTHROPIC_AUTH_TOKEN="你的API密钥"' >> ~/.zshrc`,
    'source ~/.zshrc'
  ]
})

// Bash永久设置 - bash (Anthropic)
const bashPermanentBashAnth = computed(() => {
  return [
    '# 对于 bash',
    `echo 'export ANTHROPIC_BASE_URL="${currentBaseUrl.value}"' >> ~/.bash_profile`,
    `echo 'export ANTHROPIC_AUTH_TOKEN="你的API密钥"' >> ~/.bash_profile`,
    'source ~/.bash_profile'
  ]
})

// Bash永久设置 - zsh (Gemini)
const bashPermanentZshGemini = computed(() => {
  return [
    '# 对于 zsh (默认)',
    `echo 'export GOOGLE_GEMINI_BASE_URL="${geminiBaseUrl.value}"' >> ~/.zshrc`,
    `echo 'export GEMINI_API_KEY="你的API密钥"' >> ~/.zshrc`,
    `echo 'export GEMINI_MODEL="gemini-2.5-pro"' >> ~/.zshrc`,
    'source ~/.zshrc'
  ]
})

// Bash永久设置 - bash (Gemini)
const bashPermanentBashGemini = computed(() => {
  return [
    '# 对于 bash',
    `echo 'export GOOGLE_GEMINI_BASE_URL="${geminiBaseUrl.value}"' >> ~/.bash_profile`,
    `echo 'export GEMINI_API_KEY="你的API密钥"' >> ~/.bash_profile`,
    `echo 'export GEMINI_MODEL="gemini-2.5-pro"' >> ~/.bash_profile`,
    'source ~/.bash_profile'
  ]
})

// Linux bashrc永久设置 (Anthropic)
const linuxBashrcAnth = computed(() => {
  return [
    '# 对于 bash (默认)',
    `echo 'export ANTHROPIC_BASE_URL="${currentBaseUrl.value}"' >> ~/.bashrc`,
    `echo 'export ANTHROPIC_AUTH_TOKEN="你的API密钥"' >> ~/.bashrc`,
    'source ~/.bashrc'
  ]
})

// Linux zsh永久设置 (Anthropic)
const linuxZshAnth = computed(() => {
  return [
    '# 对于 zsh',
    `echo 'export ANTHROPIC_BASE_URL="${currentBaseUrl.value}"' >> ~/.zshrc`,
    `echo 'export ANTHROPIC_AUTH_TOKEN="你的API密钥"' >> ~/.zshrc`,
    'source ~/.zshrc'
  ]
})

// Linux bashrc永久设置 (Gemini)
const linuxBashrcGemini = computed(() => {
  return [
    '# 对于 bash (默认)',
    `echo 'export GOOGLE_GEMINI_BASE_URL="${geminiBaseUrl.value}"' >> ~/.bashrc`,
    `echo 'export GEMINI_API_KEY="你的API密钥"' >> ~/.bashrc`,
    `echo 'export GEMINI_MODEL="gemini-2.5-pro"' >> ~/.bashrc`,
    'source ~/.bashrc'
  ]
})

// Linux zsh永久设置 (Gemini)
const linuxZshGemini = computed(() => {
  return [
    '# 对于 zsh',
    `echo 'export GOOGLE_GEMINI_BASE_URL="${geminiBaseUrl.value}"' >> ~/.zshrc`,
    `echo 'export GEMINI_API_KEY="你的API密钥"' >> ~/.zshrc`,
    `echo 'export GEMINI_MODEL="gemini-2.5-pro"' >> ~/.zshrc`,
    'source ~/.zshrc'
  ]
})

// Linux故障排除 - 缺少依赖库
const linuxMissingDeps = computed(() => {
  return [
    '# Ubuntu/Debian',
    'sudo apt install build-essential',
    '# CentOS/RHEL',
    'sudo dnf groupinstall "Development Tools"'
  ]
})

// Codex 配置内容
const codexConfigContent = computed(() => {
  // 根据当前激活的教程系统获取对应的环境变量设置说明
  const getCurrentPlatformAuthInstructions = () => {
    const baseInstructions = {
      title: '环境变量设置方法',
      description:
        '💡 将 OPENAI_API_KEY 设置为 null，然后设置环境变量 CRS_OAI_KEY 为您的 API 密钥（格式如 cr_xxxxxxxxxx）。'
    }

    switch (activeTutorialSystem.value) {
      case 'windows':
        return {
          ...baseInstructions,
          platform: {
            title: 'Windows',
            command: 'set CRS_OAI_KEY=cr_xxxxxxxxxx'
          }
        }
      case 'macos':
        return {
          ...baseInstructions,
          platform: {
            title: 'macOS',
            command: 'export CRS_OAI_KEY=cr_xxxxxxxxxx'
          },
          persistent: {
            title: 'Shell 配置文件（持久保存）',
            description: '添加到您的 shell 配置文件中：',
            commands: [
              '# 对于 zsh (默认)',
              'echo "export CRS_OAI_KEY=cr_xxxxxxxxxx" >> ~/.zshrc',
              'source ~/.zshrc',
              '',
              '# 对于 bash',
              'echo "export CRS_OAI_KEY=cr_xxxxxxxxxx" >> ~/.bash_profile',
              'source ~/.bash_profile'
            ]
          }
        }
      case 'linux':
        return {
          ...baseInstructions,
          platform: {
            title: 'Linux',
            command: 'export CRS_OAI_KEY=cr_xxxxxxxxxx'
          },
          persistent: {
            title: 'Shell 配置文件（持久保存）',
            description: '添加到您的 shell 配置文件中：',
            commands: [
              '# 对于 bash (默认)',
              'echo "export CRS_OAI_KEY=cr_xxxxxxxxxx" >> ~/.bashrc',
              'source ~/.bashrc',
              '',
              '# 对于 zsh',
              'echo "export CRS_OAI_KEY=cr_xxxxxxxxxx" >> ~/.zshrc',
              'source ~/.zshrc'
            ]
          }
        }
      default:
        return baseInstructions
    }
  }

  return {
    configToml: [
      'model_provider = "crs"',
      'model = "gpt-5-codex"',
      'model_reasoning_effort = "high"',
      'disable_response_storage = true',
      'preferred_auth_method = "apikey"',
      '',
      '[model_providers.crs]',
      'name = "crs"',
      `base_url = "${openaiBaseUrl.value}"`,
      'wire_api = "responses"',
      'requires_openai_auth = true',
      'env_key = "CRS_OAI_KEY"'
    ],
    authJson: ['{', ' "OPENAI_API_KEY": null', '}'],
    authInstructions: getCurrentPlatformAuthInstructions()
  }
})

// Droid CLI 配置示例
const droidCliConfigLines = computed(() => [
  '{',
  ' "custom_models": [',
  ' {',
  ' "model_display_name": "Sonnet 4.5 [crs]",',
  ' "model": "claude-sonnet-4-5-20250929",',
  ` "base_url": "${droidClaudeBaseUrl.value}",`,
  ' "api_key": "你的API密钥",',
  ' "provider": "anthropic",',
  ' "max_tokens": 8192',
  ' },',
  ' {',
  ' "model_display_name": "GPT5-Codex [crs]",',
  ' "model": "gpt-5-codex",',
  ` "base_url": "${droidOpenaiBaseUrl.value}",`,
  ' "api_key": "你的API密钥",',
  ' "provider": "openai",',
  ' "max_tokens": 16384',
  ' }',
  ' ]',
  '}'
])
</script>

<style scoped>
/* 确保代码有等宽字体 */
code,
pre,
.font-mono {
  font-family: 'Fira Code', 'Monaco', 'Courier New', monospace;
}

/* 隐藏默认的 disclosure triangle */
details summary {
  list-style: none;
}

details summary::-webkit-details-marker {
  display: none;
}

/* 图标旋转动画 */
details[open] summary .chevron-icon {
  transform: rotate(90deg);
}

.chevron-icon {
  transition: transform 0.2s ease;
}
</style>
