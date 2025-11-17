# Privacy Policy for ChatGPT & Gemini Markdown Copy

**Last Updated: November 2024**

## Overview

This extension respects your privacy. **By default, this extension does not collect, store, or transmit any user data or personal information.**

## Data Collection

### What We DON'T Collect

- We **do not** collect any personal information
- We **do not** track your browsing history
- We **do not** store your conversations with ChatGPT or Gemini
- We **do not** upload any data to our servers (we don't even have any servers)
- We **do not** use analytics or tracking services

### User-Initiated Data Sharing

The **only** way any information leaves your device is when **you explicitly choose** to submit feedback:

1. **Feedback Button**: When you click the feedback button in the extension options page:
   - You are redirected directly to GitHub Issues in your browser
   - No data passes through any intermediate servers
   - You have full control over what information to include before submitting the GitHub issue

2. **Optional Contact Information**:
   - You may optionally provide your email address in the feedback form
   - This email is included in the GitHub issue body (if you choose to include it)
   - The email is submitted directly to GitHub's public issue tracker
   - **Important**: GitHub issues are public, so only provide contact information you're comfortable sharing publicly

3. **Optional System Information**:
   - You can choose to include system information (browser type, extension version, platform) in your feedback
   - This is off by default and controlled by a checkbox
   - This information helps us debug issues but is completely optional

## Permissions Used

The extension requires the following permissions:

### Required Permissions

- **clipboardWrite**: This permission is used solely to copy Markdown-formatted text to your clipboard when you click the copy button. No data is transmitted anywhere through this permission.

- **activeTab / host_permissions**: These permissions allow the extension to access ChatGPT and Gemini pages to add the Markdown copy button. All processing happens locally in your browser.

### Optional Permissions (Sentry Error Tracking)

- **host_permissions for *.ingest.sentry.io** (Optional - Sentry only): If you choose to enable Sentry error tracking by configuring your own DSN, the extension requires permission to connect to Sentry's servers.

## How the Extension Works

All operations happen locally in your browser:

1. The extension reads AI responses from ChatGPT and Gemini pages
2. Converts the HTML content to Markdown format **locally**
3. Copies the result to your clipboard when you click the button

**No content data ever leaves your device.**

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

### By Default
This extension **does not use any third-party services**.

### Optional/User-Initiated
- **GitHub Issues**: Only when you click the feedback button and choose to submit feedback
- **Sentry.io**: Only if you manually configure Sentry error tracking with your own DSN

## Data Storage

- All settings are stored locally in your browser using Chrome's storage API
- Settings are synced across your devices if you use Chrome Sync (this is a browser feature, not controlled by the extension)
- No data is stored on any external servers

## Updates to This Policy

Any changes to this privacy policy will be:
- Reflected in this document
- Noted in the extension's store listing
- Included in release notes

## Children's Privacy

This extension does not knowingly collect any information from anyone, including children under the age of 13.

## Your Rights

Since we don't collect any data:
- There's no data to request
- There's no data to delete
- There's no data to export

All operations are local to your device.

## Contact

For questions or concerns about this privacy policy, please:
- Open an issue on our [GitHub repository](https://github.com/bugparty/chatgpt_markdown_copy_extension/issues)
- Note: GitHub issues are public

## Transparency

This extension is open source. You can review the entire source code at:
https://github.com/bugparty/chatgpt_markdown_copy_extension

---

# 隐私政策 - ChatGPT & Gemini Markdown Copy

**最后更新：2024年11月**

## 概述

本扩展尊重您的隐私。**默认情况下，本扩展不收集、存储或传输任何用户数据或个人信息。**

## 数据收集

### 我们不收集什么

- 我们**不**收集任何个人信息
- 我们**不**追踪您的浏览历史
- 我们**不**存储您与 ChatGPT 或 Gemini 的对话
- 我们**不**上传任何数据到我们的服务器（我们甚至没有任何服务器）
- 我们**不**使用分析或追踪服务

### 用户主动分享的数据

**唯一**会让信息离开您设备的情况是**您明确选择**提交反馈时：

1. **反馈按钮**：当您在扩展选项页面点击反馈按钮时：
   - 您会在浏览器中直接跳转到 GitHub Issues
   - 数据不会经过任何中间服务器
   - 在提交 GitHub issue 之前，您完全控制要包含哪些信息

2. **可选的联系信息**：
   - 您可以选择在反馈表单中提供您的电子邮箱
   - 此邮箱会包含在 GitHub issue 正文中（如果您选择包含它）
   - 邮箱直接提交到 GitHub 的公开 issue 追踪器
   - **重要提示**：GitHub issues 是公开的，所以只提供您愿意公开分享的联系信息

3. **可选的系统信息**：
   - 您可以选择在反馈中包含系统信息（浏览器类型、扩展版本、平台）
   - 默认情况下此选项是关闭的，由复选框控制
   - 这些信息有助于我们调试问题，但完全是可选的

## 使用的权限

扩展需要以下权限：

### 必需权限

- **clipboardWrite（剪贴板写入）**：此权限仅用于在您点击复制按钮时将 Markdown 格式的文本复制到剪贴板。不会通过此权限传输任何数据。

- **activeTab / host_permissions（活动标签页/主机权限）**：这些权限允许扩展访问 ChatGPT 和 Gemini 页面以添加 Markdown 复制按钮。所有处理都在您的浏览器本地进行。

### 可选权限（Sentry 错误追踪）

- **host_permissions for *.ingest.sentry.io（*.ingest.sentry.io 的主机权限）**（可选 - 仅 Sentry）：如果您选择通过配置自己的 DSN 来启用 Sentry 错误追踪，扩展需要权限连接到 Sentry 的服务器。

## 扩展工作原理

所有操作都在您的浏览器本地进行：

1. 扩展从 ChatGPT 和 Gemini 页面读取 AI 回复
2. **在本地**将 HTML 内容转换为 Markdown 格式
3. 当您点击按钮时将结果复制到剪贴板

**内容数据永远不会离开您的设备。**

## 可选的错误追踪（Sentry）

本扩展包含可选的 Sentry 错误追踪集成，**默认情况下是禁用的**。

### 当错误追踪禁用时（默认）

- 不会向任何外部服务发送数据
- 不进行任何分析或追踪
- 扩展完全在本地运行

### 当错误追踪启用时（用户必须配置）

如果您选择通过添加自己的 DSN 来配置 Sentry：

**收集的内容：**
- 扩展遇到错误时的错误消息和堆栈跟踪
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
扩展会主动过滤：
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

### 默认情况下
本扩展**不使用任何第三方服务**。

### 可选/用户主动使用
- **GitHub Issues**：仅当您点击反馈按钮并选择提交反馈时
- **Sentry.io**：仅当您使用自己的 DSN 手动配置 Sentry 错误追踪时

## 数据存储

- 所有设置都使用 Chrome 的 storage API 本地存储在您的浏览器中
- 如果您使用 Chrome 同步功能，设置会在您的设备间同步（这是浏览器功能，不由扩展控制）
- 没有数据存储在任何外部服务器上

## 政策更新

此隐私政策的任何更改都将：
- 反映在本文档中
- 在扩展的商店列表中注明
- 包含在发布说明中

## 儿童隐私

本扩展不会故意收集任何人的信息，包括 13 岁以下的儿童。

## 您的权利

由于我们不收集任何数据：
- 没有数据可供请求
- 没有数据可供删除
- 没有数据可供导出

所有操作都在您的设备本地进行。

## 联系方式

如对此隐私政策有疑问或担忧，请：
- 在我们的 [GitHub 仓库](https://github.com/bugparty/chatgpt_markdown_copy_extension/issues)上提交 issue
- 注意：GitHub issues 是公开的

## 透明度

本扩展是开源的。您可以在以下位置查看完整源代码：
https://github.com/bugparty/chatgpt_markdown_copy_extension
