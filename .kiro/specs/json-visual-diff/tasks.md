# Implementation Plan: JSON Visual Diff SDK

## Overview

本实现计划将 JSON Visual Diff SDK 分解为可执行的开发任务。采用增量开发方式，从核心算法开始，逐步添加扩展功能、渲染层和演示应用。每个任务都包含明确的实现目标和需求追溯。

## Tasks

- [x] 1. 项目初始化和基础架构
  - 创建 pnpm workspace 配置
  - 设置 TypeScript 配置（根目录和各 package）
  - 配置 Vitest 测试框架
  - 配置 ESLint 和 Prettier
  - 创建基础目录结构（packages/core, packages/dom-renderer, packages/playground）
  - _Requirements: 7.1, 7.8_

- [-] 2. 核心类型定义
  - [x] 2.1 定义核心类型和接口
    - 创建 `packages/core/src/types.ts`
    - 定义 DiffType、ValueType 枚举
    - 定义 DiffNode、DiffResult、DiffOptions 接口
    - 定义 Renderer 接口
    - _Requirements: 3.1, 4.1_

  - [x] 2.2 编写类型定义的单元测试
    - 验证类型导出正确
    - 验证接口结构完整
    - _Requirements: 3.1_

- [x] 3. Type Normalizer 实现
  - [x] 3.1 实现类型规范化器
    - 创建 `packages/core/src/normalizer.ts`
    - 实现 getValueType 方法
    - 实现各类型的 normalize 方法（Function、Date、RegExp、Symbol）
    - 实现 serialize 方法
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 3.2 编写 Type Normalizer 的属性测试
    - **Property 8: 函数比较一致性**
    - **Validates: Requirements 2.1**

  - [x] 3.3 编写 Type Normalizer 的属性测试
    - **Property 9: Date 比较通过时间戳**
    - **Validates: Requirements 2.2**

  - [x] 3.4 编写 Type Normalizer 的属性测试
    - **Property 10: RegExp 比较通过模式和标志**
    - **Validates: Requirements 2.3**

  - [x] 3.5 编写 Type Normalizer 的属性测试
    - **Property 11: 特殊值处理**
    - **Validates: Requirements 2.4, 2.5**

- [x] 4. LCS 数组 Diff 算法
  - [x] 4.1 实现 LCS 算法
    - 创建 `packages/core/src/lcs.ts`
    - 实现 computeLCS 方法（动态规划）
    - 实现 backtrack 方法生成 diff 操作序列
    - 实现 isEqual 深度比较方法
    - _Requirements: 1.4_

  - [x] 4.2 编写 LCS 算法的单元测试
    - 测试空数组
    - 测试相同数组
    - 测试完全不同的数组
    - 测试部分重叠的数组
    - _Requirements: 1.4_

  - [x] 4.3 编写 LCS 算法的属性测试
    - **Property 4: 数组差异识别**
    - **Validates: Requirements 1.4**

- [x] 5. 核心 Diff Engine 实现
  - [x] 5.1 实现基础 Diff Engine 类
    - 创建 `packages/core/src/diff.ts`
    - 实现 DiffEngine 类构造函数
    - 实现主 diff 方法
    - 实现循环引用检测
    - _Requirements: 1.1, 2.6_

  - [x] 5.2 实现原始类型比较
    - 实现 diffPrimitive 方法
    - 处理 string、number、boolean、null
    - _Requirements: 1.1_

  - [x] 5.3 实现对象比较
    - 实现 diffObject 方法
    - 递归比较对象属性
    - 识别添加、删除、修改的属性
    - _Requirements: 1.1, 1.3_

  - [x] 5.4 实现数组比较
    - 实现 diffArray 方法
    - 集成 LCS 算法
    - 支持位置比较模式（可选）
    - _Requirements: 1.4_

  - [x] 5.5 实现扩展类型比较
    - 实现 diffFunction、diffDate、diffRegExp、diffSymbol 方法
    - 使用 Type Normalizer 进行规范化
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

  - [x] 5.6 编写核心 Diff Engine 的属性测试
    - **Property 1: Diff 结果结构完整性**
    - **Validates: Requirements 1.1, 3.1**

  - [x] 5.7 编写核心 Diff Engine 的属性测试
    - **Property 2: 自反性（Identity）**
    - **Validates: Requirements 1.2**

  - [x] 5.8 编写核心 Diff Engine 的属性测试
    - **Property 3: 嵌套结构递归性**
    - **Validates: Requirements 1.3, 3.6**

  - [x] 5.9 编写核心 Diff Engine 的属性测试
    - **Property 5: 差异类型完整性**
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.5**

  - [x] 5.10 编写核心 Diff Engine 的属性测试
    - **Property 12: 循环引用安全性**
    - **Validates: Requirements 2.6**

- [ ] 6. Diff Result Builder
  - [ ] 6.1 实现 Diff Result 构建器
    - 创建 `packages/core/src/result.ts`
    - 实现创建各类型 DiffNode 的辅助方法
    - 实现统计信息计算
    - 实现 JSON Path 构建
    - _Requirements: 3.1, 3.6_

  - [ ] 6.2 编写 Diff Result Builder 的属性测试
    - **Property 6: 统计信息一致性**
    - **Validates: Requirements 3.1**

  - [ ] 6.3 编写 Diff Result Builder 的属性测试
    - **Property 7: Diff 结果可序列化**
    - **Validates: Requirements 3.7**

- [ ] 7. 核心包导出和文档
  - [ ] 7.1 配置核心包导出
    - 创建 `packages/core/src/index.ts`
    - 导出所有公共 API
    - 配置 package.json（main, module, types, exports）
    - _Requirements: 8.6_

  - [ ] 7.2 编写核心包的 README
    - 包含安装说明、快速开始、API 文档
    - 提供中英文版本
    - _Requirements: 8.5, 9.1, 9.2, 9.3_

- [ ] 8. Checkpoint - 核心功能验证
  - 确保所有核心测试通过
  - 验证核心包可以独立使用
  - 询问用户是否有问题或需要调整

- [ ] 9. DOM Renderer 实现
  - [ ] 9.1 实现 DOM Renderer 类
    - 创建 `packages/dom-renderer/src/renderer.ts`
    - 实现 Renderer 接口
    - 实现 render 主方法
    - 实现 renderNode 方法
    - _Requirements: 5.1, 5.2_

  - [ ] 9.2 实现各类型节点渲染
    - 实现 renderAdded 方法
    - 实现 renderDeleted 方法
    - 实现 renderModified 方法
    - 实现 renderUnchanged 方法
    - _Requirements: 5.3, 5.4, 5.5, 5.6_

  - [ ] 9.3 实现样式系统
    - 创建 `packages/dom-renderer/src/styles.ts`
    - 定义默认主题（light、dark）
    - 实现 CSS 类名生成
    - 支持自定义颜色配置
    - _Requirements: 5.8_

  - [ ] 9.4 实现交互功能
    - 实现折叠/展开嵌套结构
    - 添加事件监听器
    - _Requirements: 5.7_

  - [ ] 9.5 实现可访问性支持
    - 添加语义化 HTML 标签
    - 添加 ARIA 属性
    - 支持键盘导航
    - _Requirements: 5.9_

  - [ ] 9.6 编写 DOM Renderer 的属性测试
    - **Property 14: DOM 渲染输出有效性**
    - **Validates: Requirements 5.2**

  - [ ] 9.7 编写 DOM Renderer 的属性测试
    - **Property 15: DOM 渲染视觉区分**
    - **Validates: Requirements 5.3, 5.4, 5.5, 5.6**

  - [ ] 9.8 编写 DOM Renderer 的属性测试
    - **Property 16: 渲染配置响应性**
    - **Validates: Requirements 5.8**

  - [ ] 9.9 编写 DOM Renderer 的属性测试
    - **Property 17: 可访问性属性存在**
    - **Validates: Requirements 5.9**

- [ ] 10. DOM Renderer 包配置
  - [ ] 10.1 配置 DOM Renderer 包
    - 创建 `packages/dom-renderer/src/index.ts`
    - 配置 package.json
    - 添加对 core 包的依赖
    - _Requirements: 8.6_

  - [ ] 10.2 编写 DOM Renderer 的 README
    - 包含使用示例和 API 文档
    - 提供中英文版本
    - _Requirements: 8.5, 9.1, 9.2, 9.3_

- [ ] 11. Checkpoint - 渲染器验证
  - 确保所有渲染器测试通过
  - 验证 DOM 输出在浏览器中正确显示
  - 询问用户是否有问题或需要调整

- [ ] 12. Playground 应用基础
  - [ ] 12.1 初始化 Playground 项目
    - 使用 Vite 创建项目
    - 配置 React 或 Vue（根据偏好）
    - 添加对 core 和 dom-renderer 的依赖
    - _Requirements: 7.4_

  - [ ] 12.2 实现基础 UI 布局
    - 创建双栏布局（左右两个 JSON 输入区）
    - 添加比较按钮
    - 添加结果展示区域
    - _Requirements: 6.1_

  - [ ] 12.3 实现 JSON 输入和验证
    - 实现 JSON 编辑器组件
    - 实时 JSON 语法验证
    - 显示错误提示
    - _Requirements: 6.2, 6.3_

  - [ ] 12.4 编写 JSON 验证的属性测试
    - **Property 18: JSON 验证正确性**
    - **Validates: Requirements 6.2, 6.3**

- [ ] 13. Playground 核心功能
  - [ ] 13.1 集成 Diff 和渲染
    - 调用 core 包的 diff 函数
    - 使用 dom-renderer 渲染结果
    - 显示统计信息
    - _Requirements: 6.4_

  - [ ] 13.2 实现示例数据
    - 提供多个预设示例
    - 实现示例选择器
    - _Requirements: 6.5_

  - [ ] 13.3 实现文件导入导出
    - 支持导入 JSON 文件
    - 支持导出 diff 结果
    - _Requirements: 6.6_

- [ ] 14. Playground 国际化
  - [ ] 14.1 配置 i18n
    - 安装 i18n 库（如 react-i18next）
    - 创建语言文件（en.json, zh-CN.json）
    - 实现语言切换功能
    - _Requirements: 9.6_

  - [ ] 14.2 翻译所有界面文本
    - 翻译 UI 标签和按钮
    - 翻译示例数据
    - 翻译错误消息
    - _Requirements: 9.7_

- [ ] 15. Playground 样式和响应式
  - [ ] 15.1 实现样式系统
    - 使用 CSS-in-JS 或 Tailwind CSS
    - 实现主题切换（light/dark）
    - 优化视觉设计
    - _Requirements: 6.7_

  - [ ] 15.2 实现响应式布局
    - 适配移动设备
    - 适配平板设备
    - 测试不同屏幕尺寸
    - _Requirements: 6.8_

- [ ] 16. Checkpoint - Playground 验证
  - 确保 Playground 所有功能正常
  - 在不同浏览器和设备上测试
  - 询问用户是否有问题或需要调整

- [ ] 17. 文档和对比分析
  - [ ] 17.1 编写根目录 README
    - 项目介绍和特性列表
    - 安装和快速开始
    - 架构说明
    - 链接到各包的文档
    - 提供英文和中文版本
    - _Requirements: 9.1, 9.2, 9.3_

  - [ ] 17.2 编写对比分析文档
    - 列出主要竞品（jsondiffpatch、deep-diff、json-diff）
    - 创建功能对比表格
    - 说明本 SDK 的优势
    - 诚实说明设计权衡
    - _Requirements: 10.1, 10.2, 10.3, 10.5, 10.6_

  - [ ] 17.3 编写性能基准测试
    - 创建基准测试脚本
    - 对比各方案的性能
    - 生成性能报告
    - _Requirements: 10.4_

  - [ ] 17.4 编写 API 文档
    - 使用 TypeDoc 生成 API 文档
    - 提供中英文版本
    - _Requirements: 9.5_

- [ ] 18. 性能优化
  - [ ] 18.1 实现深度限制
    - 在 DiffEngine 中实现 maxDepth 配置
    - 测试深度限制功能
    - _Requirements: 12.3_

  - [ ] 18.2 编写深度限制的属性测试
    - **Property 19: 深度限制配置有效性**
    - **Validates: Requirements 12.3**

  - [ ] 18.3 优化大型数据处理
    - 实现虚拟滚动（如果需要）
    - 优化 LCS 算法性能
    - 添加性能监控
    - _Requirements: 12.1, 12.4_

- [ ] 19. 测试覆盖和 CI/CD
  - [ ] 19.1 配置测试覆盖率报告
    - 配置 Vitest 覆盖率
    - 生成覆盖率报告
    - 确保达到 80% 覆盖率
    - _Requirements: 11.5, 11.7_

  - [ ] 19.2 配置 GitHub Actions
    - 创建 CI workflow
    - 自动运行测试
    - 自动生成覆盖率报告
    - _Requirements: 11.6_

- [ ] 20. 包发布准备
  - [ ] 20.1 配置发布脚本
    - 创建 changeset 配置
    - 配置版本管理
    - 创建发布脚本
    - _Requirements: 8.3_

  - [ ] 20.2 准备发布资源
    - 添加 LICENSE 文件（MIT）
    - 确保所有 package.json 配置正确
    - 确保类型定义文件生成
    - _Requirements: 8.4, 8.7_

  - [ ] 20.3 发布到 npm
    - 发布 @json-visual-diff/core
    - 发布 @json-visual-diff/dom-renderer
    - 验证包可以正常安装和使用
    - _Requirements: 8.1, 8.2_

- [ ] 21. Playground 部署
  - [ ] 21.1 部署 Playground 到 Vercel/Netlify
    - 配置部署脚本
    - 部署到生产环境
    - 配置自定义域名（可选）
    - _Requirements: 6.1_

- [ ] 22. 最终验证和发布
  - 运行所有测试确保通过
  - 验证文档完整性
  - 验证 npm 包可用性
  - 验证 Playground 在线可访问
  - 宣布项目发布

## Notes

- 所有任务都是必需的，确保从一开始就有全面的测试覆盖
- 每个任务都包含需求追溯，确保实现符合规范
- Checkpoint 任务用于阶段性验证和用户反馈
- 属性测试使用 fast-check 库，每个测试至少运行 100 次迭代
- 所有代码注释使用中文编写
- 文档提供中英文双语版本
