# JSON Visual Diff SDK

一个强大且灵活的 JSON 可视化差异对比 SDK，采用可插拔的渲染器架构设计，支持实时编辑预览和多种扩展类型。

## ✨ 核心特性

### 🧠 智能算法引擎
- **LCS 数组对比**：使用最长公共子序列算法实现智能数组差异识别
- **扩展类型支持**：原生支持 Function、Date、RegExp、Symbol 等非标准 JSON 类型
- **循环引用检测**：安全处理循环引用，避免无限循环
- **深度可配置**：灵活的深度限制和忽略字段配置

### 🎨 可插拔渲染器
- **架构解耦**：核心算法与渲染逻辑完全分离
- **标准化输出**：统一的 DiffResult 格式，易于集成
- **多主题支持**：内置浅色/深色主题，支持自定义配色
- **无障碍访问**：完整的 ARIA 属性和键盘导航支持

### 🚀 交互式 Playground
- **Monaco Editor**：集成 VS Code 同款编辑器，语法高亮、自动补全、错误检测
- **实时预览**：编辑内容时自动触发差异计算，无需手动点击比较按钮
- **响应式设计**：完美适配桌面、平板和移动设备
- **设置持久化**：用户偏好自动保存到本地存储

## ✨ 最新更新

### Playground 实时预览
- ⚡ **实时对比**：移除手动比较按钮，编辑内容时自动计算并显示差异
- 🎯 **默认示例**：页面加载时自动显示 basic 示例数据
- 📐 **优化布局**：精简头部设计，增大编辑器区域，提升用户体验

### 构建系统升级
- ⚡ **Tsdown 构建**：使用 tsdown 替代 tsc，构建速度更快
- 📦 **双格式输出**：同时生成 ESM 和 CJS 格式
- 🗺️ **Source Maps**：完整的源码映射支持

## 项目结构

```
json-visual-diff/
├── packages/
│   ├── core/                 # 核心 diff 算法库
│   ├── dom-renderer/         # DOM 渲染器
│   └── playground/           # 演示应用
├── pnpm-workspace.yaml       # pnpm workspace 配置
├── package.json              # 根 package.json
├── tsconfig.json             # TypeScript 配置
└── vitest.config.ts          # Vitest 测试配置
```

## 开发环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

## 安装依赖

```bash
pnpm install
```

## 可用脚本

- `pnpm build` - 构建所有包
- `pnpm test` - 运行所有测试
- `pnpm test:watch` - 监听模式运行测试
- `pnpm lint` - 代码检查
- `pnpm format` - 格式化代码
- `pnpm typecheck` - 类型检查

## 包说明

### @json-visual-diff/core

核心差异算法引擎，提供高性能的 JSON 对象比较功能。

- **纯算法实现**：平台无关的核心库，可在任何 JavaScript 环境中运行
- **智能数组对比**：基于 LCS 算法的数组差异识别
- **扩展类型支持**：处理 Function、Date、RegExp、Symbol 等非标准类型
- **循环引用安全**：内置循环引用检测机制
- **TypeScript 优先**：完整的类型定义，提供优秀的 IDE 支持

### @json-visual-diff/dom-renderer

DOM 渲染器，将差异结果渲染为可交互的浏览器 DOM 元素。

- **视觉差异化**：清晰的颜色编码显示（新增、删除、修改、未变）
- **主题系统**：内置浅色/深色主题，支持自定义配色方案
- **交互式 UI**：可折叠/展开的嵌套结构，便于导航
- **无障碍访问**：语义化 HTML 和 ARIA 属性，支持屏幕阅读器
- **键盘导航**：完整的键盘操作支持

### @json-visual-diff/playground

交互式演示应用，提供完整的差异对比体验。

- **Monaco Editor 集成**：VS Code 同款编辑器，语法高亮、自动补全、错误检测
- **实时编辑预览**：编辑内容时自动计算并显示差异，无需手动触发
- **响应式设计**：完美适配桌面、平板和移动设备
- **设置持久化**：用户偏好自动保存到本地存储
- **示例库**：内置多个示例，快速上手体验

**快速启动：**

```bash
cd packages/playground
pnpm dev
```

访问 http://localhost:3000 体验 Playground！

## License

MIT
