# Privacy Policy for ChatGPT & Gemini Markdown Copy

**Last Updated: November 2024**

## Data Collection

By default, this extension **does not collect, store, or transmit any user data**.

## Permissions Used

The extension requires the following permissions:

- **clipboardWrite**: This permission is used solely to copy text to your clipboard when you click the Markdown copy button. No data is sent to any external servers through this permission.

- **host_permissions** (Optional - Sentry only): If you choose to enable Sentry error tracking, the extension requires permission to connect to `*.ingest.sentry.io` to send error reports.

## Data Processing

All text processing happens locally in your browser. The extension:
- Reads the content of ChatGPT and Gemini responses on the page
- Converts HTML to Markdown format locally
- Copies the converted text to your clipboard

No content data leaves your device.

## Optional Error Tracking (Sentry)

This extension includes optional Sentry integration for error tracking, which is **disabled by default**.

### When Error Tracking is Disabled (Default)

- No data is sent to any external services
- No analytics or tracking occurs
- The extension operates completely locally

### When Error Tracking is Enabled (User Must Configure)

If you choose to configure Sentry by adding your own DSN:

**What is Collected:**
- Error messages and stack traces when the extension encounters errors
- Browser type (user agent string)
- Platform information (ChatGPT or Gemini)
- Extension version and environment

**What is NOT Collected:**
- Clipboard content
- ChatGPT or Gemini conversation content
- User identification or personal information
- Browsing history
- Any sensitive user data

**Data Filtering:**
The extension actively filters out:
- Clipboard data from error reports
- Any breadcrumbs containing clipboard information
- Sensitive information from error contexts

**Third-Party Service:**
When enabled, error data is sent to Sentry (sentry.io), a third-party error tracking service. Sentry's privacy policy applies to this data: https://sentry.io/privacy/

**How to Enable/Disable:**
- Error tracking is disabled by default
- To enable: Configure `extension/sentry-config.js` with your own Sentry DSN
- To disable: Leave the DSN as `YOUR_SENTRY_DSN_HERE` or remove Sentry files

## Third-Party Services

- **By Default**: This extension does not use any third-party services
- **Optional**: If you configure Sentry, error data may be sent to Sentry.io

## Updates

Any changes to this privacy policy will be reflected in this document and in the extension's store listing.

## Contact

For questions or concerns about this privacy policy, please open an issue on the project's GitHub repository.

---

# 隐私政策 - ChatGPT & Gemini Markdown Copy

**最后更新：2024年11月**

## 数据收集

默认情况下，此扩展程序**不收集、存储或传输任何用户数据**。

## 使用的权限

扩展程序需要以下权限：

- **clipboardWrite（剪贴板写入）**：此权限仅用于在您点击 Markdown 复制按钮时将文本复制到剪贴板。不会通过此权限向任何外部服务器发送数据。

- **host_permissions（主机权限）**（可选 - 仅 Sentry）：如果您选择启用 Sentry 错误追踪，扩展程序需要权限连接到 `*.ingest.sentry.io` 以发送错误报告。

## 数据处理

所有文本处理都在您的浏览器本地进行。扩展程序：
- 读取页面上 ChatGPT 和 Gemini 回复的内容
- 在本地将 HTML 转换为 Markdown 格式
- 将转换后的文本复制到剪贴板

没有内容数据离开您的设备。

## 可选的错误追踪（Sentry）

此扩展程序包含可选的 Sentry 错误追踪集成，**默认情况下是禁用的**。

### 当错误追踪禁用时（默认）

- 不会向任何外部服务发送数据
- 不进行任何分析或追踪
- 扩展程序完全在本地运行

### 当错误追踪启用时（用户必须配置）

如果您选择通过添加自己的 DSN 来配置 Sentry：

**收集的内容：**
- 扩展程序遇到错误时的错误消息和堆栈跟踪
- 浏览器类型（用户代理字符串）
- 平台信息（ChatGPT 或 Gemini）
- 扩展版本和环境

**不收集的内容：**
- 剪贴板内容
- ChatGPT 或 Gemini 对话内容
- 用户身份或个人信息
- 浏览历史
- 任何敏感用户数据

**数据过滤：**
扩展程序会主动过滤：
- 错误报告中的剪贴板数据
- 包含剪贴板信息的任何记录
- 错误上下文中的敏感信息

**第三方服务：**
启用后，错误数据将发送到 Sentry（sentry.io），这是一个第三方错误追踪服务。Sentry 的隐私政策适用于这些数据：https://sentry.io/privacy/

**如何启用/禁用：**
- 错误追踪默认禁用
- 启用方式：使用您自己的 Sentry DSN 配置 `extension/sentry-config.js`
- 禁用方式：将 DSN 保持为 `YOUR_SENTRY_DSN_HERE` 或删除 Sentry 文件

## 第三方服务

- **默认情况下**：此扩展程序不使用任何第三方服务
- **可选**：如果您配置 Sentry，错误数据可能会发送到 Sentry.io

## 更新

此隐私政策的任何更改都将反映在本文档和扩展程序的商店列表中。

## 联系方式

如对此隐私政策有疑问或担忧，请在项目的 GitHub 仓库上提交 issue。
