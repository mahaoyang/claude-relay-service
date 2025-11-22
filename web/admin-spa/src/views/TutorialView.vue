<template>
  <div>
    <div>
      <h3>Claude Code 使用教程</h3>
      <p>跟着这个教程，你可以轻松在自己的电脑上安装并使用 Claude Code。</p>
    </div>

    <!-- 系统选择标签 -->
    <div>
      <div>
        <button
          v-for="system in tutorialSystems"
          :key="system.key"
          @click="activeTutorialSystem = system.key"
        >
          <i />
          {{ system.name }}
        </button>
      </div>
    </div>

    <!-- Windows 教程 -->
    <div v-if="activeTutorialSystem === 'windows'">
      <!-- 第一步：安装 Node.js -->
      <div>
        <h4>
          <span>1</span>
          安装 Node.js 环境
        </h4>
        <p>Claude Code 需要 Node.js 环境才能运行。</p>

        <div>
          <h5>Windows 安装方法</h5>
          <div>
            <p>方法一：官网下载（推荐）</p>
            <ol>
              <li>
                打开浏览器访问
                <code>https://nodejs.org/</code>
              </li>
              <li>点击 "LTS" 版本进行下载（推荐长期支持版本）</li>
              <li>
                下载完成后双击
                <code>.msi</code>
                文件
              </li>
              <li>按照安装向导完成安装，保持默认设置即可</li>
            </ol>
          </div>
          <div>
            <p>方法二：使用包管理器</p>
            <p>如果你安装了 Chocolatey 或 Scoop，可以使用命令行安装：</p>
            <div>
              <div># 使用 Chocolatey</div>
              <div>choco install nodejs</div>
              <div># 或使用 Scoop</div>
              <div>scoop install nodejs</div>
            </div>
          </div>
          <div>
            <h6>Windows 注意事项</h6>
            <ul>
              <li>• 建议使用 PowerShell 而不是 CMD</li>
              <li>• 如果遇到权限问题，尝试以管理员身份运行</li>
              <li>• 某些杀毒软件可能会误报，需要添加白名单</li>
            </ul>
          </div>
        </div>

        <!-- 验证安装 -->
        <div>
          <h6>验证安装是否成功</h6>
          <p>安装完成后，打开 PowerShell 或 CMD，输入以下命令：</p>
          <div>
            <div>node --version</div>
            <div>npm --version</div>
          </div>
          <p>如果显示版本号，说明安装成功了！</p>
        </div>
      </div>

      <!-- 第二步：安装 Claude Code -->
      <div>
        <h4>
          <span>2</span>
          安装 Claude Code
        </h4>

        <div>
          <h5>安装 Claude Code</h5>
          <p>打开 PowerShell 或 CMD，运行以下命令：</p>
          <div>
            <div># 全局安装 Claude Code</div>
            <div>npm install -g @anthropic-ai/claude-code</div>
          </div>
          <p>这个命令会从 npm 官方仓库下载并安装最新版本的 Claude Code。</p>

          <div>
            <h6>提示</h6>
            <ul>
              <li>• 建议使用 PowerShell 而不是 CMD，功能更强大</li>
              <li>• 如果遇到权限问题，以管理员身份运行 PowerShell</li>
            </ul>
          </div>
        </div>

        <!-- 验证安装 -->
        <div>
          <h6>验证 Claude Code 安装</h6>
          <p>安装完成后，输入以下命令检查是否安装成功：</p>
          <div>
            <div>claude --version</div>
          </div>
          <p>如果显示版本号，恭喜你！Claude Code 已经成功安装了。</p>
        </div>
      </div>

      <!-- 第三步：设置环境变量 -->
      <div>
        <h4>
          <span>3</span>
          设置环境变量
        </h4>

        <div>
          <h5>配置 Claude Code 环境变量</h5>
          <p>为了让 Claude Code 连接到你的中转服务，需要设置两个环境变量：</p>

          <div>
            <div>
              <h6>方法一：PowerShell 临时设置（当前会话）</h6>
              <p>在 PowerShell 中运行以下命令：</p>
              <div>
                <div>$env:ANTHROPIC_BASE_URL = "{{ currentBaseUrl }}"</div>
                <div>$env:ANTHROPIC_AUTH_TOKEN = "你的API密钥"</div>
              </div>
              <p>💡 记得将 "你的API密钥" 替换为在上方 "API Keys" 标签页中创建的实际密钥。</p>
            </div>

            <div>
              <h6>方法二：PowerShell 永久设置（用户级）</h6>
              <p>在 PowerShell 中运行以下命令设置用户级环境变量：</p>
              <div>
                <div># 设置用户级环境变量（永久生效）</div>
                <div>
                  [System.Environment]::SetEnvironmentVariable("ANTHROPIC_BASE_URL", "{{
                    currentBaseUrl
                  }}", [System.EnvironmentVariableTarget]::User)
                </div>
                <div>
                  [System.Environment]::SetEnvironmentVariable("ANTHROPIC_AUTH_TOKEN",
                  "你的API密钥", [System.EnvironmentVariableTarget]::User)
                </div>
              </div>
              <p>查看已设置的环境变量：</p>
              <div>
                <div># 查看用户级环境变量</div>
                <div>
                  [System.Environment]::GetEnvironmentVariable("ANTHROPIC_BASE_URL",
                  [System.EnvironmentVariableTarget]::User)
                </div>
                <div>
                  [System.Environment]::GetEnvironmentVariable("ANTHROPIC_AUTH_TOKEN",
                  [System.EnvironmentVariableTarget]::User)
                </div>
              </div>
              <p>💡 设置后需要重新打开 PowerShell 窗口才能生效。</p>
            </div>
          </div>
        </div>

        <!-- VSCode 插件配置 -->
        <div>
          <h6>VSCode Claude 插件配置</h6>
          <p>如果使用 VSCode 的 Claude 插件，需要在配置文件中进行设置：</p>
          <div>
            <p>
              <strong>配置文件位置：</strong>
              <code>C:\Users\你的用户名\.claude\config.json</code>
            </p>
            <p>💡 如果该文件不存在，请手动创建。</p>
          </div>
          <div>
            <div>{</div>
            <div>"primaryApiKey": "crs"</div>
            <div>}</div>
          </div>
        </div>

        <!-- 验证环境变量设置 -->
        <div>
          <h6>验证环境变量设置</h6>
          <p>设置完环境变量后，可以通过以下命令验证是否设置成功：</p>

          <div>
            <div>
              <h6>在 PowerShell 中验证：</h6>
              <div>
                <div>echo $env:ANTHROPIC_BASE_URL</div>
                <div>echo $env:ANTHROPIC_AUTH_TOKEN</div>
              </div>
            </div>

            <div>
              <h6>在 CMD 中验证：</h6>
              <div>
                <div>echo %ANTHROPIC_BASE_URL%</div>
                <div>echo %ANTHROPIC_AUTH_TOKEN%</div>
              </div>
            </div>
          </div>

          <div>
            <p>
              <strong>预期输出示例：</strong>
            </p>
            <div>
              <div>{{ currentBaseUrl }}</div>
              <div>cr_xxxxxxxxxxxxxxxxxx</div>
            </div>
            <p>💡 如果输出为空或显示变量名本身，说明环境变量设置失败，请重新设置。</p>
          </div>
        </div>

        <!-- Gemini CLI 环境变量设置 -->
        <div>
          <h5>配置 Gemini CLI 环境变量</h5>
          <p>如果你使用 Gemini CLI，需要设置以下环境变量：</p>

          <div>
            <div>
              <h6>PowerShell 设置方法</h6>
              <p>在 PowerShell 中运行以下命令：</p>
              <div>
                <div>$env:GOOGLE_GEMINI_BASE_URL = "{{ geminiBaseUrl }}"</div>
                <div>$env:GEMINI_API_KEY = "你的API密钥"</div>
                <div>$env:GEMINI_MODEL = "gemini-2.5-pro"</div>
              </div>
              <p>💡 使用与 Claude Code 相同的 API 密钥即可。</p>
            </div>

            <div>
              <h6>PowerShell 永久设置（用户级）</h6>
              <p>在 PowerShell 中运行以下命令：</p>
              <div>
                <div># 设置用户级环境变量（永久生效）</div>
                <div>
                  [System.Environment]::SetEnvironmentVariable("GOOGLE_GEMINI_BASE_URL", "{{
                    geminiBaseUrl
                  }}", [System.EnvironmentVariableTarget]::User)
                </div>
                <div>
                  [System.Environment]::SetEnvironmentVariable("GEMINI_API_KEY", "你的API密钥",
                  [System.EnvironmentVariableTarget]::User)
                </div>
                <div>
                  [System.Environment]::SetEnvironmentVariable("GEMINI_MODEL", "gemini-2.5-pro",
                  [System.EnvironmentVariableTarget]::User)
                </div>
              </div>
              <p>💡 设置后需要重新打开 PowerShell 窗口才能生效。</p>
            </div>

            <div>
              <h6>验证 Gemini CLI 环境变量</h6>
              <p>在 PowerShell 中验证：</p>
              <div>
                <div>echo $env:GOOGLE_GEMINI_BASE_URL</div>
                <div>echo $env:GEMINI_API_KEY</div>
                <div>echo $env:GEMINI_MODEL</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Codex 环境变量设置 -->
        <div>
          <h5>配置 Codex 环境变量</h5>
          <p>如果你使用支持 OpenAI API 的工具（如 Codex），需要设置以下环境变量：</p>

          <div>
            <div>
              <h6>Codex 配置文件</h6>
              <p>
                在
                <code>~/.codex/config.toml</code>
                文件开头添加以下配置：
              </p>
              <div>
                <div v-for="line in codexConfigContent.configToml" :key="line">
                  {{ line }}
                </div>
              </div>
              <p>
                在
                <code>~/.codex/auth.json</code>
                文件中配置API密钥：
              </p>
              <div>
                <div v-for="line in codexConfigContent.authJson" :key="line">
                  {{ line }}
                </div>
              </div>
              <div>
                <!-- 描述文字 -->
                <p>{{ codexConfigContent.authInstructions.description }}</p>

                <!-- 标题 -->
                <h6>
                  {{ codexConfigContent.authInstructions.title }}
                </h6>

                <!-- 当前平台对应的环境变量设置 -->
                <div>
                  <p>{{ codexConfigContent.authInstructions.platform.title }}:</p>
                  <div>
                    <div>
                      {{ codexConfigContent.authInstructions.platform.command }}
                    </div>
                  </div>
                </div>

                <!-- Shell 配置文件（仅对于 macOS/Linux 显示） -->
                <div v-if="codexConfigContent.authInstructions.persistent">
                  <p>{{ codexConfigContent.authInstructions.persistent.title }}:</p>
                  <p>
                    {{ codexConfigContent.authInstructions.persistent.description }}
                  </p>
                  <div>
                    <div
                      v-for="command in codexConfigContent.authInstructions.persistent.commands"
                      :key="command"
                    >
                      {{ command }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Droid CLI 配置 -->
      <div>
        <h5>配置 Droid CLI</h5>
        <p>
          Droid CLI 使用
          <code>~/.factory/config.json</code>
          保存自定义模型；在 Windows 中可直接编辑
          <code>C:\Users\你的用户名\.factory\config.json</code>。
        </p>
        <div>
          <h6>配置文件示例</h6>
          <p>将以下内容追加到配置文件中，并替换示例中的域名和 API 密钥：</p>
          <div>
            <div v-for="(line, index) in droidCliConfigLines" :key="line + index">
              {{ line }}
            </div>
          </div>
          <p>
            💡 在 Droid CLI 中选择自定义模型即可使用新的 Droid 账号池；确保服务地址可被本地访问。
          </p>
        </div>
      </div>
      <!-- 第四步：开始使用 -->
      <div>
        <h4>
          <span>4</span>
          开始使用 Claude Code
        </h4>
        <div>
          <p>现在你可以开始使用 Claude Code 了！</p>

          <div>
            <div>
              <h6>启动 Claude Code</h6>
              <div>
                <div>claude</div>
              </div>
            </div>

            <div>
              <h6>在特定项目中使用</h6>
              <div>
                <div># 进入你的项目目录</div>
                <div>cd C:\path\to\your\project</div>
                <div># 启动 Claude Code</div>
                <div>claude</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Windows 故障排除 -->
      <div>
        <h4>Windows 常见问题解决</h4>
        <div>
          <details>
            <summary>安装时提示 "permission denied" 错误</summary>
            <div>
              <p>这通常是权限问题，尝试以下解决方法：</p>
              <ul>
                <li>以管理员身份运行 PowerShell</li>
                <li>或者配置 npm 使用用户目录：<code>npm config set prefix %APPDATA%\npm</code></li>
              </ul>
            </div>
          </details>

          <details>
            <summary>PowerShell 执行策略错误</summary>
            <div>
              <p>如果遇到执行策略限制，运行：</p>
              <div>
                <div>Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser</div>
              </div>
            </div>
          </details>

          <details>
            <summary>环境变量设置后不生效</summary>
            <div>
              <p>设置永久环境变量后需要：</p>
              <ul>
                <li>重新启动 PowerShell 或 CMD</li>
                <li>或者注销并重新登录 Windows</li>
                <li>验证设置：<code>echo $env:ANTHROPIC_BASE_URL</code></li>
              </ul>
            </div>
          </details>
        </div>
      </div>
    </div>

    <!-- macOS 教程 -->
    <div v-else-if="activeTutorialSystem === 'macos'">
      <!-- 第一步：安装 Node.js -->
      <div>
        <h4>
          <span>1</span>
          安装 Node.js 环境
        </h4>
        <p>Claude Code 需要 Node.js 环境才能运行。</p>

        <div>
          <h5>macOS 安装方法</h5>
          <div>
            <p>方法一：使用 Homebrew（推荐）</p>
            <p>如果你已经安装了 Homebrew，使用它安装 Node.js 会更方便：</p>
            <div>
              <div># 更新 Homebrew</div>
              <div>brew update</div>
              <div># 安装 Node.js</div>
              <div>brew install node</div>
            </div>
          </div>
          <div>
            <p>方法二：官网下载</p>
            <ol>
              <li>
                访问
                <code>https://nodejs.org/</code>
              </li>
              <li>下载适合 macOS 的 LTS 版本</li>
              <li>
                打开下载的
                <code>.pkg</code>
                文件
              </li>
              <li>按照安装程序指引完成安装</li>
            </ol>
          </div>
          <div>
            <h6>macOS 注意事项</h6>
            <ul>
              <li>
                • 如果遇到权限问题，可能需要使用
                <code>sudo</code>
              </li>
              <li>• 首次运行可能需要在系统偏好设置中允许</li>
              <li>• 建议使用 Terminal 或 iTerm2</li>
            </ul>
          </div>
        </div>

        <!-- 验证安装 -->
        <div>
          <h6>验证安装是否成功</h6>
          <p>安装完成后，打开 Terminal，输入以下命令：</p>
          <div>
            <div>node --version</div>
            <div>npm --version</div>
          </div>
          <p>如果显示版本号，说明安装成功了！</p>
        </div>
      </div>

      <!-- 第二步：安装 Claude Code -->
      <div>
        <h4>
          <span>2</span>
          安装 Claude Code
        </h4>

        <div>
          <h5>安装 Claude Code</h5>
          <p>打开 Terminal，运行以下命令：</p>
          <div>
            <div># 全局安装 Claude Code</div>
            <div>npm install -g @anthropic-ai/claude-code</div>
          </div>
          <p>如果遇到权限问题，可以使用 sudo：</p>
          <div>
            <div>sudo npm install -g @anthropic-ai/claude-code</div>
          </div>
        </div>

        <!-- 验证安装 -->
        <div>
          <h6>验证 Claude Code 安装</h6>
          <p>安装完成后，输入以下命令检查是否安装成功：</p>
          <div>
            <div>claude --version</div>
          </div>
          <p>如果显示版本号，恭喜你！Claude Code 已经成功安装了。</p>
        </div>
      </div>

      <!-- 第三步：设置环境变量 -->
      <div>
        <h4>
          <span>3</span>
          设置环境变量
        </h4>

        <div>
          <h5>配置 Claude Code 环境变量</h5>
          <p>为了让 Claude Code 连接到你的中转服务，需要设置两个环境变量：</p>

          <div>
            <div>
              <h6>方法一：临时设置（当前会话）</h6>
              <p>在 Terminal 中运行以下命令：</p>
              <div>
                <div>export ANTHROPIC_BASE_URL="{{ currentBaseUrl }}"</div>
                <div>export ANTHROPIC_AUTH_TOKEN="你的API密钥"</div>
              </div>
              <p>💡 记得将 "你的API密钥" 替换为在上方 "API Keys" 标签页中创建的实际密钥。</p>
            </div>

            <div>
              <h6>方法二：永久设置</h6>
              <p>编辑你的 shell 配置文件（根据你使用的 shell）：</p>
              <div>
                <div># 对于 zsh (默认)</div>
                <div>echo 'export ANTHROPIC_BASE_URL="{{ currentBaseUrl }}"' >> ~/.zshrc</div>
                <div>echo 'export ANTHROPIC_AUTH_TOKEN="你的API密钥"' >> ~/.zshrc</div>
                <div>source ~/.zshrc</div>
              </div>
              <div>
                <div># 对于 bash</div>
                <div>
                  echo 'export ANTHROPIC_BASE_URL="{{ currentBaseUrl }}"' >> ~/.bash_profile
                </div>
                <div>echo 'export ANTHROPIC_AUTH_TOKEN="你的API密钥"' >> ~/.bash_profile</div>
                <div>source ~/.bash_profile</div>
              </div>
            </div>
          </div>
        </div>

        <!-- VSCode 插件配置 (macOS) -->
        <div>
          <h6>VSCode Claude 插件配置</h6>
          <p>如果使用 VSCode 的 Claude 插件，需要在配置文件中进行设置：</p>
          <div>
            <p>
              <strong>配置文件位置：</strong>
              <code>~/.claude/config.json</code>
            </p>
            <p>💡 如果该文件不存在，请手动创建。</p>
          </div>
          <div>
            <div>{</div>
            <div>"primaryApiKey": "crs"</div>
            <div>}</div>
          </div>
        </div>

        <!-- Gemini CLI 环境变量设置 -->
        <div>
          <h5>配置 Gemini CLI 环境变量</h5>
          <p>如果你使用 Gemini CLI，需要设置以下环境变量：</p>

          <div>
            <div>
              <h6>Terminal 设置方法</h6>
              <p>在 Terminal 中运行以下命令：</p>
              <div>
                <div>export GOOGLE_GEMINI_BASE_URL="{{ geminiBaseUrl }}"</div>
                <div>export GEMINI_API_KEY="你的API密钥"</div>
                <div>export GEMINI_MODEL="gemini-2.5-pro"</div>
              </div>
              <p>💡 使用与 Claude Code 相同的 API 密钥即可。</p>
            </div>

            <div>
              <h6>永久设置方法</h6>
              <p>添加到你的 shell 配置文件：</p>
              <div>
                <div># 对于 zsh (默认)</div>
                <div>echo 'export GOOGLE_GEMINI_BASE_URL="{{ geminiBaseUrl }}"' >> ~/.zshrc</div>
                <div>echo 'export GEMINI_API_KEY="你的API密钥"' >> ~/.zshrc</div>
                <div>echo 'export GEMINI_MODEL="gemini-2.5-pro"' >> ~/.zshrc</div>
                <div>source ~/.zshrc</div>
              </div>
              <div>
                <div># 对于 bash</div>
                <div>
                  echo 'export GOOGLE_GEMINI_BASE_URL="{{ geminiBaseUrl }}"' >> ~/.bash_profile
                </div>
                <div>echo 'export GEMINI_API_KEY="你的API密钥"' >> ~/.bash_profile</div>
                <div>echo 'export GEMINI_MODEL="gemini-2.5-pro"' >> ~/.bash_profile</div>
                <div>source ~/.bash_profile</div>
              </div>
            </div>

            <div>
              <h6>验证 Gemini CLI 环境变量</h6>
              <p>在 Terminal 中验证：</p>
              <div>
                <div>echo $GOOGLE_GEMINI_BASE_URL</div>
                <div>echo $GEMINI_API_KEY</div>
                <div>echo $GEMINI_MODEL</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Codex 环境变量设置 -->
        <div>
          <h5>配置 Codex 环境变量</h5>
          <p>如果你使用支持 OpenAI API 的工具（如 Codex），需要设置以下环境变量：</p>

          <div>
            <div>
              <h6>Codex 配置文件</h6>
              <p>
                在
                <code>~/.codex/config.toml</code>
                文件开头添加以下配置：
              </p>
              <div>
                <div v-for="line in codexConfigContent.configToml" :key="line">
                  {{ line }}
                </div>
              </div>
              <p>
                在
                <code>~/.codex/auth.json</code>
                文件中配置API密钥：
              </p>
              <div>
                <div v-for="line in codexConfigContent.authJson" :key="line">
                  {{ line }}
                </div>
              </div>
              <div>
                <!-- 描述文字 -->
                <p>{{ codexConfigContent.authInstructions.description }}</p>

                <!-- 标题 -->
                <h6>
                  {{ codexConfigContent.authInstructions.title }}
                </h6>

                <!-- 当前平台对应的环境变量设置 -->
                <div>
                  <p>{{ codexConfigContent.authInstructions.platform.title }}:</p>
                  <div>
                    <div>
                      {{ codexConfigContent.authInstructions.platform.command }}
                    </div>
                  </div>
                </div>

                <!-- Shell 配置文件（仅对于 macOS/Linux 显示） -->
                <div v-if="codexConfigContent.authInstructions.persistent">
                  <p>{{ codexConfigContent.authInstructions.persistent.title }}:</p>
                  <p>
                    {{ codexConfigContent.authInstructions.persistent.description }}
                  </p>
                  <div>
                    <div
                      v-for="command in codexConfigContent.authInstructions.persistent.commands"
                      :key="command"
                    >
                      {{ command }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Droid CLI 配置 -->
      <div>
        <h5>配置 Droid CLI</h5>
        <p>
          Droid CLI 使用
          <code>~/.factory/config.json</code>
          保存自定义模型；你可以在 Finder 中按
          <code>⌘ + Shift + G</code>
          并输入路径，或运行
          <code>open ~/.factory</code>
          快速打开配置目录。
        </p>
        <div>
          <h6>配置文件示例</h6>
          <p>将以下内容追加到配置文件中，并替换示例中的域名和 API 密钥：</p>
          <div>
            <div v-for="(line, index) in droidCliConfigLines" :key="line + index">
              {{ line }}
            </div>
          </div>
          <p>
            💡 在 Droid CLI 中选择自定义模型即可使用新的 Droid 账号池；确保服务地址可被本地访问。
          </p>
        </div>
      </div>

      <!-- 第四步：开始使用 -->
      <div>
        <h4>
          <span>4</span>
          开始使用 Claude Code
        </h4>
        <div>
          <p>现在你可以开始使用 Claude Code 了！</p>

          <div>
            <div>
              <h6>启动 Claude Code</h6>
              <div>
                <div>claude</div>
              </div>
            </div>

            <div>
              <h6>在特定项目中使用</h6>
              <div>
                <div># 进入你的项目目录</div>
                <div>cd /path/to/your/project</div>
                <div># 启动 Claude Code</div>
                <div>claude</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- macOS 故障排除 -->
      <div>
        <h4>macOS 常见问题解决</h4>
        <div>
          <details>
            <summary>安装时提示权限错误</summary>
            <div>
              <p>尝试以下解决方法：</p>
              <ul>
                <li>使用 sudo 安装：<code>sudo npm install -g @anthropic-ai/claude-code</code></li>
                <li>或者配置 npm 使用用户目录：<code>npm config set prefix ~/.npm-global</code></li>
              </ul>
            </div>
          </details>

          <details>
            <summary>macOS 安全设置阻止运行</summary>
            <div>
              <p>如果系统阻止运行 Claude Code：</p>
              <ul>
                <li>打开"系统偏好设置" → "安全性与隐私"</li>
                <li>点击"仍要打开"或"允许"</li>
                <li>或者在 Terminal 中运行：<code>sudo spctl --master-disable</code></li>
              </ul>
            </div>
          </details>

          <details>
            <summary>环境变量不生效</summary>
            <div>
              <p>检查以下几点：</p>
              <ul>
                <li>确认修改了正确的配置文件（.zshrc 或 .bash_profile）</li>
                <li>重新启动 Terminal</li>
                <li>验证设置：<code>echo $ANTHROPIC_BASE_URL</code></li>
              </ul>
            </div>
          </details>
        </div>
      </div>
    </div>

    <!-- Linux 教程 -->
    <div v-else-if="activeTutorialSystem === 'linux'">
      <!-- 第一步：安装 Node.js -->
      <div>
        <h4>
          <span>1</span>
          安装 Node.js 环境
        </h4>
        <p>Claude Code 需要 Node.js 环境才能运行。</p>

        <div>
          <h5>Linux 安装方法</h5>
          <div>
            <p>方法一：使用官方仓库（推荐）</p>
            <div>
              <div># 添加 NodeSource 仓库</div>
              <div>curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -</div>
              <div># 安装 Node.js</div>
              <div>sudo apt-get install -y nodejs</div>
            </div>
          </div>
          <div>
            <p>方法二：使用系统包管理器</p>
            <p>虽然版本可能不是最新的，但对于基本使用已经足够：</p>
            <div>
              <div># Ubuntu/Debian</div>
              <div>sudo apt update</div>
              <div>sudo apt install nodejs npm</div>
              <div># CentOS/RHEL/Fedora</div>
              <div>sudo dnf install nodejs npm</div>
            </div>
          </div>
          <div>
            <h6>Linux 注意事项</h6>
            <ul>
              <li>• 某些发行版可能需要安装额外的依赖</li>
              <li>
                • 如果遇到权限问题，使用
                <code>sudo</code>
              </li>
              <li>• 确保你的用户在 npm 的全局目录有写权限</li>
            </ul>
          </div>
        </div>

        <!-- 验证安装 -->
        <div>
          <h6>验证安装是否成功</h6>
          <p>安装完成后，打开终端，输入以下命令：</p>
          <div>
            <div>node --version</div>
            <div>npm --version</div>
          </div>
          <p>如果显示版本号，说明安装成功了！</p>
        </div>
      </div>

      <!-- 第二步：安装 Claude Code -->
      <div>
        <h4>
          <span>2</span>
          安装 Claude Code
        </h4>

        <div>
          <h5>安装 Claude Code</h5>
          <p>打开终端，运行以下命令：</p>
          <div>
            <div># 全局安装 Claude Code</div>
            <div>npm install -g @anthropic-ai/claude-code</div>
          </div>
          <p>如果遇到权限问题，可以使用 sudo：</p>
          <div>
            <div>sudo npm install -g @anthropic-ai/claude-code</div>
          </div>
        </div>

        <!-- 验证安装 -->
        <div>
          <h6>验证 Claude Code 安装</h6>
          <p>安装完成后，输入以下命令检查是否安装成功：</p>
          <div>
            <div>claude --version</div>
          </div>
          <p>如果显示版本号，恭喜你！Claude Code 已经成功安装了。</p>
        </div>
      </div>

      <!-- 第三步：设置环境变量 -->
      <div>
        <h4>
          <span>3</span>
          设置环境变量
        </h4>

        <div>
          <h5>配置 Claude Code 环境变量</h5>
          <p>为了让 Claude Code 连接到你的中转服务，需要设置两个环境变量：</p>

          <div>
            <div>
              <h6>方法一：临时设置（当前会话）</h6>
              <p>在终端中运行以下命令：</p>
              <div>
                <div>export ANTHROPIC_BASE_URL="{{ currentBaseUrl }}"</div>
                <div>export ANTHROPIC_AUTH_TOKEN="你的API密钥"</div>
              </div>
              <p>💡 记得将 "你的API密钥" 替换为在上方 "API Keys" 标签页中创建的实际密钥。</p>
            </div>

            <div>
              <h6>方法二：永久设置</h6>
              <p>编辑你的 shell 配置文件：</p>
              <div>
                <div># 对于 bash (默认)</div>
                <div>echo 'export ANTHROPIC_BASE_URL="{{ currentBaseUrl }}"' >> ~/.bashrc</div>
                <div>echo 'export ANTHROPIC_AUTH_TOKEN="你的API密钥"' >> ~/.bashrc</div>
                <div>source ~/.bashrc</div>
              </div>
              <div>
                <div># 对于 zsh</div>
                <div>echo 'export ANTHROPIC_BASE_URL="{{ currentBaseUrl }}"' >> ~/.zshrc</div>
                <div>echo 'export ANTHROPIC_AUTH_TOKEN="你的API密钥"' >> ~/.zshrc</div>
                <div>source ~/.zshrc</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Gemini CLI 环境变量设置 -->
        <div>
          <h5>配置 Gemini CLI 环境变量</h5>
          <p>如果你使用 Gemini CLI，需要设置以下环境变量：</p>

          <div>
            <div>
              <h6>终端设置方法</h6>
              <p>在终端中运行以下命令：</p>
              <div>
                <div>export GOOGLE_GEMINI_BASE_URL="{{ geminiBaseUrl }}"</div>
                <div>export GEMINI_API_KEY="你的API密钥"</div>
                <div>export GEMINI_MODEL="gemini-2.5-pro"</div>
              </div>
              <p>💡 使用与 Claude Code 相同的 API 密钥即可。</p>
            </div>

            <div>
              <h6>永久设置方法</h6>
              <p>添加到你的 shell 配置文件：</p>
              <div>
                <div># 对于 bash (默认)</div>
                <div>echo 'export GOOGLE_GEMINI_BASE_URL="{{ geminiBaseUrl }}"' >> ~/.bashrc</div>
                <div>echo 'export GEMINI_API_KEY="你的API密钥"' >> ~/.bashrc</div>
                <div>echo 'export GEMINI_MODEL="gemini-2.5-pro"' >> ~/.bashrc</div>
                <div>source ~/.bashrc</div>
              </div>
              <div>
                <div># 对于 zsh</div>
                <div>echo 'export GOOGLE_GEMINI_BASE_URL="{{ geminiBaseUrl }}"' >> ~/.zshrc</div>
                <div>echo 'export GEMINI_API_KEY="你的API密钥"' >> ~/.zshrc</div>
                <div>echo 'export GEMINI_MODEL="gemini-2.5-pro"' >> ~/.zshrc</div>
                <div>source ~/.zshrc</div>
              </div>
            </div>

            <div>
              <h6>验证 Gemini CLI 环境变量</h6>
              <p>在终端中验证：</p>
              <div>
                <div>echo $GOOGLE_GEMINI_BASE_URL</div>
                <div>echo $GEMINI_API_KEY</div>
                <div>echo $GEMINI_MODEL</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Codex 环境变量设置 -->
        <div>
          <h5>配置 Codex 环境变量</h5>
          <p>如果你使用支持 OpenAI API 的工具（如 Codex），需要设置以下环境变量：</p>

          <div>
            <div>
              <h6>Codex 配置文件</h6>
              <p>
                在
                <code>~/.codex/config.toml</code>
                文件开头添加以下配置：
              </p>
              <div>
                <div v-for="line in codexConfigContent.configToml" :key="line">
                  {{ line }}
                </div>
              </div>
              <p>
                在
                <code>~/.codex/auth.json</code>
                文件中配置API密钥：
              </p>
              <div>
                <div v-for="line in codexConfigContent.authJson" :key="line">
                  {{ line }}
                </div>
              </div>
              <div>
                <!-- 描述文字 -->
                <p>{{ codexConfigContent.authInstructions.description }}</p>

                <!-- 标题 -->
                <h6>
                  {{ codexConfigContent.authInstructions.title }}
                </h6>

                <!-- 当前平台对应的环境变量设置 -->
                <div>
                  <p>{{ codexConfigContent.authInstructions.platform.title }}:</p>
                  <div>
                    <div>
                      {{ codexConfigContent.authInstructions.platform.command }}
                    </div>
                  </div>
                </div>

                <!-- Shell 配置文件（仅对于 macOS/Linux 显示） -->
                <div v-if="codexConfigContent.authInstructions.persistent">
                  <p>{{ codexConfigContent.authInstructions.persistent.title }}:</p>
                  <p>
                    {{ codexConfigContent.authInstructions.persistent.description }}
                  </p>
                  <div>
                    <div
                      v-for="command in codexConfigContent.authInstructions.persistent.commands"
                      :key="command"
                    >
                      {{ command }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- VSCode 插件配置 (Linux) -->
        <div>
          <h6>VSCode Claude 插件配置</h6>
          <p>如果使用 VSCode 的 Claude 插件，需要在配置文件中进行设置：</p>
          <div>
            <p>
              <strong>配置文件位置：</strong>
              <code>~/.claude/config.json</code>
            </p>
            <p>💡 如果该文件不存在，请手动创建。</p>
          </div>
          <div>
            <div>{</div>
            <div>"primaryApiKey": "crs"</div>
            <div>}</div>
          </div>
        </div>

        <!-- Droid CLI 配置 -->
        <div>
          <h5>配置 Droid CLI</h5>
          <p>
            Droid CLI 使用
            <code>~/.factory/config.json</code>
            保存自定义模型；在 Linux 或 WSL2 中，可直接编辑
            <code>/home/你的用户名/.factory/config.json</code>
            或在终端运行
            <code>xdg-open ~/.factory</code>
            打开目录。
          </p>
          <div>
            <h6>配置文件示例</h6>
            <p>将以下内容追加到配置文件中，并替换示例中的域名和 API 密钥：</p>
            <div>
              <div v-for="(line, index) in droidCliConfigLines" :key="line + index">
                {{ line }}
              </div>
            </div>
            <p>
              💡 在 Droid CLI 中选择自定义模型即可使用新的 Droid 账号池；确保服务地址可被本地访问。
            </p>
          </div>
        </div>

        <!-- 第四步：开始使用 -->
        <div>
          <h4>
            <span>4</span>
            开始使用 Claude Code
          </h4>
          <div>
            <p>现在你可以开始使用 Claude Code 了！</p>

            <div>
              <div>
                <h6>启动 Claude Code</h6>
                <div>
                  <div>claude</div>
                </div>
              </div>

              <div>
                <h6>在特定项目中使用</h6>
                <div>
                  <div># 进入你的项目目录</div>
                  <div>cd /path/to/your/project</div>
                  <div># 启动 Claude Code</div>
                  <div>claude</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Linux 故障排除 -->
        <div>
          <h4>Linux 常见问题解决</h4>
          <div>
            <details>
              <summary>安装时提示权限错误</summary>
              <div>
                <p>尝试以下解决方法：</p>
                <ul>
                  <li>
                    使用 sudo 安装：<code>sudo npm install -g @anthropic-ai/claude-code</code>
                  </li>
                  <li>
                    或者配置 npm 使用用户目录：<code>npm config set prefix ~/.npm-global</code>
                  </li>
                  <li>然后添加到 PATH：<code>export PATH=~/.npm-global/bin:$PATH</code></li>
                </ul>
              </div>
            </details>

            <details>
              <summary>缺少依赖库</summary>
              <div>
                <p>某些 Linux 发行版需要安装额外依赖：</p>
                <div>
                  <div># Ubuntu/Debian</div>
                  <div>sudo apt install build-essential</div>
                  <div># CentOS/RHEL</div>
                  <div>sudo dnf groupinstall "Development Tools"</div>
                </div>
              </div>
            </details>

            <details>
              <summary>环境变量不生效</summary>
              <div>
                <p>检查以下几点：</p>
                <ul>
                  <li>确认修改了正确的配置文件（.bashrc 或 .zshrc）</li>
                  <li>
                    重新启动终端或运行
                    <code>source ~/.bashrc</code>
                  </li>
                  <li>验证设置：<code>echo $ANTHROPIC_BASE_URL</code></li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </div>

      <!-- 结尾 -->
      <div>
        <h5>🎉 恭喜你！</h5>
        <p>你已经成功安装并配置了 Claude Code，现在可以开始享受 AI 编程助手带来的便利了。</p>
        <p>如果在使用过程中遇到任何问题，可以查看官方文档或社区讨论获取帮助。</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

// 当前系统选择
const activeTutorialSystem = ref('windows')

// 系统列表
const tutorialSystems = [
  { key: 'windows', name: 'Windows', icon: 'fab fa-windows' },
  { key: 'macos', name: 'macOS', icon: 'fab fa-apple' },
  { key: 'linux', name: 'Linux / WSL2', icon: 'fab fa-linux' }
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
