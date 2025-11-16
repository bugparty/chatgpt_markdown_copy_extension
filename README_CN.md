# ChatGPT & Gemini Markdown 复制扩展

一个浏览器扩展，为 ChatGPT 和 Google Gemini 的回复添加 Markdown 复制按钮，轻松将 AI 回复复制为 Markdown 格式。

## 功能特性

- 🔄 同时支持 ChatGPT (chatgpt.com, chat.openai.com) 和 Google Gemini (gemini.google.com)
- 📝 将 HTML 回复转换为干净的 Markdown 格式
- ✨ 支持带语法高亮的代码块
- 🔢 处理数学公式（KaTeX 和 Gemini 数学公式）
- 📋 保留格式：标题、列表、链接、引用等
- 🎯 与原生 UI 无缝集成

## 安装方法

### 开发/测试安装

#### Chrome/Edge/Brave

1. 打开浏览器，访问 `chrome://extensions/`
2. 开启"开发者模式"（右上角切换开关）
3. 点击"加载已解压的扩展程序"
4. 选择本项目中的 `extension` 文件夹

#### Firefox

1. 打开 Firefox，访问 `about:debugging#/runtime/this-firefox`
2. 点击"临时载入附加组件"
3. 导航到 `extension` 文件夹，选择 `manifest.json` 文件

#### Safari

1. 打开 Safari，进入 `Safari` > `设置` > `高级`
2. 勾选"在菜单栏中显示开发菜单"
3. 进入 `开发` > `允许未签名的扩展`（用于开发）
4. 进入 `Safari` > `设置` > `扩展`
5. 点击"+"按钮，选择 `extension` 文件夹

**注意**：要在 Safari 上正式使用，扩展需要使用 Xcode 转换为 Safari App Extension。可以使用以下命令转换构建好的 Safari 包：
```bash
xcrun safari-web-extension-converter /path/to/extension --app-name "ChatGPT Markdown Copy"
```

## 发布前：生成图标

扩展需要图标文件。按以下步骤生成：

### 方法 1：使用图标生成器（推荐）

1. 在浏览器中打开 `icon-generator.html`
2. 图标会自动生成并显示
3. 点击"Download All"下载所有三个尺寸的图标
4. 将下载的文件移动到 `extension/icons/` 文件夹：
   - `icon16.png` (16x16)
   - `icon48.png` (48x48)
   - `icon128.png` (128x128)

### 方法 2：使用在线工具

1. 在 SVG 编辑器或在线转换工具中打开 `extension/icons/icon.svg`
2. 导出为 PNG，尺寸分别为：16x16、48x48、128x128
3. 保存为 `icon16.png`、`icon48.png` 和 `icon128.png`，放在 `extension/icons/` 文件夹中

### 方法 3：使用命令行（需要 ImageMagick）

```bash
cd extension/icons
convert icon.svg -resize 16x16 icon16.png
convert icon.svg -resize 48x48 icon48.png
convert icon.svg -resize 128x128 icon128.png
```

## 使用 Sentry 进行错误追踪（可选）

此扩展内置了 Sentry 错误追踪集成。这是**可选的**，默认情况下是禁用的。

### 配置 Sentry

1. **创建 Sentry 账户**
   - 访问 [sentry.io](https://sentry.io) 并创建免费账户
   - 为浏览器 JavaScript 创建新项目

2. **获取 DSN**
   - 创建项目后，您将获得 DSN（数据源名称）
   - 格式类似：`https://abc123def456@o123456.ingest.sentry.io/7890123`

3. **配置扩展**
   - 打开 `extension/sentry-config.js`
   - 将 `YOUR_SENTRY_DSN_HERE` 替换为您的实际 DSN：
     ```javascript
     dsn: 'https://abc123def456@o123456.ingest.sentry.io/7890123',
     ```
   - 根据需要更新其他设置（环境、发布版本等）

4. **隐私考虑**
   - 扩展会过滤掉剪贴板数据和敏感信息
   - 仅发送错误消息和堆栈跟踪到 Sentry
   - 不收集用户身份信息
   - 查看 `PRIVACY.md` 了解完整详情

### 禁用 Sentry

在以下情况下，Sentry 会自动禁用：
- DSN 未配置（默认状态）
- DSN 设置为 `YOUR_SENTRY_DSN_HERE`

完全移除 Sentry：
1. 从 `extension/` 文件夹中删除 `sentry.min.js` 和 `sentry-config.js`
2. 更新 `manifest.json`，从 `js` 数组中移除这些文件：
   ```json
   "js": ["content.js"]
   ```
3. 从 `manifest.json` 中移除 `host_permissions` 和 `content_security_policy`

## 发布到浏览器商店

### Chrome 网上应用店

1. **创建开发者账户**
   - 访问 [Chrome Web Store 开发者控制台](https://chrome.google.com/webstore/devconsole/)
   - 支付一次性 $5 注册费

2. **准备安装包**
   ```bash
   cd extension
   zip -r ../chatgpt-markdown-copy.zip .
   ```

3. **上传**
   - 在控制台中点击"新商品"
   - 上传 ZIP 文件
   - 填写商店列表详情：
     - 名称：ChatGPT & Gemini Markdown Copy
     - 描述：为 ChatGPT 和 Gemini 回复添加 Markdown 复制按钮
     - 类别：生产力工具
     - 截图（至少 1 张，1280x800 或 640x400）
     - 图标（128x128，已包含在您的包中）

4. **提交审核**
   - 审核可能需要几天时间

### Firefox 附加组件 (AMO)

1. **创建开发者账户**
   - 访问 [Firefox 附加组件开发者中心](https://addons.mozilla.org/developers/)
   - 创建账户（免费）

2. **准备安装包**
   ```bash
   cd extension
   zip -r ../chatgpt-markdown-copy-firefox.zip .
   ```

3. **上传**
   - 访问[提交新附加组件](https://addons.mozilla.org/developers/addon/submit/)
   - 上传 ZIP 文件
   - 选择分发渠道（在此站点上/自行分发）
   - 填写列表详情

4. **提交审核**
   - Firefox 的审核通常比 Chrome 快

### Safari 扩展库

Safari 扩展需要转换为 Safari App Extension 格式，并通过 Mac App Store 提交。

1. **要求**
   - 安装了 Xcode 的 macOS 系统
   - Apple 开发者账户（$99/年）
   - 代码签名证书

2. **转换为 Safari App Extension**
   ```bash
   # 将 web extension 转换为 Safari 格式
   xcrun safari-web-extension-converter extension/ --app-name "ChatGPT Markdown Copy"
   ```
   这将创建一个 Xcode 项目。

3. **在 Xcode 中构建**
   - 打开生成的 Xcode 项目
   - 配置签名和功能
   - 构建并归档应用

4. **提交到 App Store**
   - 使用 Xcode 上传到 App Store Connect
   - 填写应用元数据
   - 提交审核

**注意**：Safari 扩展作为 macOS 应用的一部分分发。转换工具会创建 Safari 扩展和一个最小化的宿主应用。

### 发布重要说明

- **隐私政策**：两个商店都可能需要隐私政策。由于此扩展仅使用 `clipboardWrite` 权限且不收集任何数据，您可以包含以下简单声明：

  ```
  ChatGPT & Gemini Markdown Copy 隐私政策

  此扩展不收集、存储或传输任何用户数据。
  它仅需要剪贴板写入权限，以便在您点击 Markdown 复制按钮时将文本复制到剪贴板。
  所有处理都在您的浏览器本地完成。
  ```

- **截图**：创建展示以下内容的截图：
  - 扩展在 ChatGPT 上的运行效果
  - 扩展在 Gemini 上的运行效果
  - 高亮显示的 Markdown 复制按钮
  - 复制的 Markdown 内容示例

- **宣传图片**：Chrome 需要宣传图片（440x280、920x680、1400x560）

## 项目结构

```
chatgpt_markdown_copy_extension/
├── extension/
│   ├── manifest.json          # 扩展配置文件
│   ├── content.js             # 主扩展脚本
│   └── icons/
│       ├── icon.svg           # 源 SVG 图标
│       ├── icon16.png         # 16x16 图标（需生成）
│       ├── icon48.png         # 48x48 图标（需生成）
│       └── icon128.png        # 128x128 图标（需生成）
├── icon-generator.html        # 从 SVG 生成 PNG 图标的工具
└── README.md                  # 英文说明文档
└── README_CN.md               # 中文说明文档（本文件）
```

## 支持的 Markdown 功能

- 标题（H1-H6）
- 粗体和斜体文本
- 带语言检测的代码块
- 行内代码
- 链接
- 有序和无序列表（支持嵌套）
- 引用块
- 水平分隔线
- 数学公式（行内和块级）

## 浏览器兼容性

- Chrome/Edge/Brave：版本 88+
- Firefox：版本 109+
- Safari：版本 14+（需要 macOS Big Sur 或更高版本）

## 开发

### 修改扩展

1. 编辑 `extension/content.js` 以修改功能
2. 编辑 `extension/manifest.json` 以修改权限或元数据
3. 在浏览器中重新加载扩展：
   - Chrome：访问 `chrome://extensions/`，点击刷新图标
   - Firefox：访问 `about:debugging`，点击"重新加载"

### 测试

1. 以开发者模式安装扩展
2. 访问 [ChatGPT](https://chatgpt.com) 或 [Google Gemini](https://gemini.google.com)
3. 从 AI 生成一个回复
4. 查找 Markdown 复制按钮（标有"M"），位于常规复制按钮旁边
5. 点击它并粘贴结果以验证 Markdown 格式

## 故障排除

**按钮没有出现？**
- 安装扩展后刷新页面
- 检查浏览器控制台是否有错误（按 F12）
- 确保扩展在浏览器的扩展管理器中已启用

**Markdown 格式问题？**
- 扩展会尽可能保留原始格式
- 某些复杂的嵌套结构可能无法完美转换
- 如果发现一致的格式问题，请提交 issue

## 许可证

MIT License - 可自由修改和分发

## 贡献

欢迎贡献！请随时提交 Pull Request。

## 作者

bugparty

## 版本历史

- **2.0.0** - 浏览器扩展版本
  - 从 Tampermonkey 脚本转换
  - 支持 Chrome 和 Firefox
  - 改进的稳定性和性能
