# @json-visual-diff/dom-renderer

用于在浏览器中可视化 JSON 差异的 DOM 渲染器。该包提供了一个可插拔的渲染器实现，将标准化的 diff 结果转换为交互式 HTML 元素。

[English Documentation](./README.md)

## 特性

- 🎨 **视觉区分**: 为添加、删除、修改和未改变的值提供清晰的颜色编码显示
- 🌓 **主题支持**: 内置浅色和深色主题，支持自定义颜色配置
- 🔄 **交互式 UI**: 可折叠/展开的嵌套结构，便于导航
- ♿ **可访问性**: 语义化 HTML 和 ARIA 属性，支持屏幕阅读器
- ⌨️ **键盘导航**: 完整的键盘支持交互元素
- 🎯 **可自定义**: 灵活配置颜色、缩进和显示选项
- 💪 **TypeScript**: 包含完整的类型定义

## 安装

```bash
npm install @json-visual-diff/dom-renderer @json-visual-diff/core
# 或
pnpm add @json-visual-diff/dom-renderer @json-visual-diff/core
# 或
yarn add @json-visual-diff/dom-renderer @json-visual-diff/core
```

## 快速开始

```typescript
import { diff } from '@json-visual-diff/core';
import { DOMRenderer } from '@json-visual-diff/dom-renderer';

const oldObj = {
  name: 'John',
  age: 25,
  hobbies: ['reading', 'gaming']
};

const newObj = {
  name: 'John',
  age: 26,
  hobbies: ['reading', 'coding', 'gaming'],
  email: 'john@example.com'
};

// 计算差异
const result = diff(oldObj, newObj);

// 创建渲染器并渲染到 DOM
const renderer = new DOMRenderer();
const element = renderer.render(result);

// 添加到页面
document.body.appendChild(element);
```

## API 文档

### `DOMRenderer`

实现了 `@json-visual-diff/core` 中 `Renderer` 接口的主渲染器类。

#### 构造函数

```typescript
new DOMRenderer(config?: RendererConfig)
```

**参数:**
- `config?: RendererConfig` - 可选的渲染器配置

**示例:**

```typescript
import { DOMRenderer } from '@json-visual-diff/dom-renderer';

const renderer = new DOMRenderer({
  theme: 'dark',
  indent: 4,
  expandDepth: 2,
  showUnchanged: true,
  colors: {
    added: '#00ff00',
    deleted: '#ff0000'
  }
});
```

#### 方法

##### `render(diffResult, config?)`

将完整的 diff 结果渲染为 HTML 元素。

**参数:**
- `diffResult: DiffResult` - 来自 `@json-visual-diff/core` 的 diff 结果
- `config?: RendererConfig` - 可选配置，覆盖构造函数配置

**返回值:** `HTMLElement` - 渲染的 DOM 元素

**示例:**

```typescript
const element = renderer.render(result, {
  theme: 'light',
  showUnchanged: false
});
```

##### `renderNode(node, config?)`

将单个 diff 节点渲染为 HTML 元素。

**参数:**
- `node: DiffNode` - 单个 diff 节点
- `config?: RendererConfig` - 可选配置

**返回值:** `HTMLElement` - 渲染的 DOM 元素

**示例:**

```typescript
const nodeElement = renderer.renderNode(result.root);
```

##### `renderAdded(node, config?)`

渲染被添加的节点。

**参数:**
- `node: DiffNode` - 添加的节点
- `config?: RendererConfig` - 可选配置

**返回值:** `HTMLElement`

##### `renderDeleted(node, config?)`

渲染被删除的节点。

**参数:**
- `node: DiffNode` - 删除的节点
- `config?: RendererConfig` - 可选配置

**返回值:** `HTMLElement`

##### `renderModified(node, config?)`

渲染被修改的节点。

**参数:**
- `node: DiffNode` - 修改的节点
- `config?: RendererConfig` - 可选配置

**返回值:** `HTMLElement`

##### `renderUnchanged(node, config?)`

渲染未改变的节点。

**参数:**
- `node: DiffNode` - 未改变的节点
- `config?: RendererConfig` - 可选配置

**返回值:** `HTMLElement`

##### `toggleExpand(path)`

切换给定路径节点的展开/折叠状态。

**参数:**
- `path: string[]` - 节点的路径

**示例:**

```typescript
renderer.toggleExpand(['user', 'address']);
```

##### `isExpanded(path)`

检查给定路径的节点是否已展开。

**参数:**
- `path: string[]` - 节点的路径

**返回值:** `boolean`

## 配置

### `RendererConfig`

```typescript
interface RendererConfig {
  theme?: 'light' | 'dark' | 'custom';
  colors?: {
    added?: string;
    deleted?: string;
    modified?: string;
    unchanged?: string;
  };
  indent?: number;          // 缩进空格数（默认: 2）
  expandDepth?: number;     // 默认展开深度（默认: 3）
  showUnchanged?: boolean;  // 显示未改变的节点（默认: true）
}
```

### 主题配置

#### 浅色主题（默认）

```typescript
const renderer = new DOMRenderer({ theme: 'light' });
```

默认颜色:
- 添加: `#22863a` (绿色)
- 删除: `#cb2431` (红色)
- 修改: `#e36209` (橙色)
- 未改变: `#6a737d` (灰色)

#### 深色主题

```typescript
const renderer = new DOMRenderer({ theme: 'dark' });
```

默认颜色:
- 添加: `#28a745` (绿色)
- 删除: `#d73a49` (红色)
- 修改: `#f97583` (粉色)
- 未改变: `#959da5` (灰色)

#### 自定义颜色

```typescript
const renderer = new DOMRenderer({
  theme: 'custom',
  colors: {
    added: '#00ff00',
    deleted: '#ff0000',
    modified: '#ffaa00',
    unchanged: '#888888'
  }
});
```

## 高级用法

### 控制展开/折叠

```typescript
import { diff } from '@json-visual-diff/core';
import { DOMRenderer } from '@json-visual-diff/dom-renderer';

const result = diff(oldObj, newObj);
const renderer = new DOMRenderer({
  expandDepth: 2  // 默认只展开前 2 层
});

const element = renderer.render(result);
document.body.appendChild(element);

// 程序化切换展开状态
renderer.toggleExpand(['user', 'address']);

// 检查是否已展开
if (renderer.isExpanded(['user', 'address'])) {
  console.log('地址已展开');
}
```

### 隐藏未改变的值

```typescript
const renderer = new DOMRenderer({
  showUnchanged: false  // 隐藏未改变的值
});

const element = renderer.render(result);
```

### 自定义缩进

```typescript
const renderer = new DOMRenderer({
  indent: 4  // 使用 4 个空格缩进
});

const element = renderer.render(result);
```

### 动态主题切换

```typescript
const renderer = new DOMRenderer({ theme: 'light' });

// 使用浅色主题渲染
let element = renderer.render(result);
document.body.appendChild(element);

// 切换到深色主题
element = renderer.render(result, { theme: 'dark' });
document.body.replaceChild(element, document.body.firstChild);
```

### 渲染单个节点

```typescript
import { diff } from '@json-visual-diff/core';
import { DOMRenderer } from '@json-visual-diff/dom-renderer';

const result = diff(oldObj, newObj);
const renderer = new DOMRenderer();

// 只渲染特定节点
if (result.root.children) {
  for (const child of result.root.children) {
    if (child.type === 'modified') {
      const nodeElement = renderer.renderNode(child);
      document.getElementById('modified-container')?.appendChild(nodeElement);
    }
  }
}
```

## HTML 结构

渲染器生成以下 HTML 结构:

```html
<div class="json-diff-container" role="region" aria-label="JSON difference visualization">
  <!-- 统计信息 -->
  <div class="json-diff-stats" role="status" aria-live="polite">
    <span class="stat-added" aria-label="1 items added">+1</span>
    <span class="stat-deleted" aria-label="1 items deleted">-1</span>
    <span class="stat-modified" aria-label="2 items modified">~2</span>
  </div>
  
  <!-- 内容 -->
  <div class="json-diff-content" role="tree">
    <div class="diff-node diff-modified" role="treeitem" aria-label="Modified: root">
      <div class="diff-line">
        <button class="toggle-button" aria-expanded="true">▼</button>
        <span class="key">name:</span>
        <span class="value">"John"</span>
      </div>
      <div class="children-container" role="group">
        <!-- 子节点 -->
      </div>
    </div>
  </div>
</div>
```

## CSS 类

渲染器应用以下 CSS 类，您可以自定义样式:

- `.json-diff-container` - 主容器
- `.json-diff-stats` - 统计信息区域
- `.stat-added` - 添加计数
- `.stat-deleted` - 删除计数
- `.stat-modified` - 修改计数
- `.json-diff-content` - 内容区域
- `.diff-node` - 单个 diff 节点
- `.diff-added` - 添加的节点
- `.diff-deleted` - 删除的节点
- `.diff-modified` - 修改的节点
- `.diff-unchanged` - 未改变的节点
- `.diff-line` - diff 中的单行
- `.toggle-button` - 展开/折叠按钮
- `.key` - 属性键
- `.value` - 属性值
- `.old-value` - 旧值（用于修改）
- `.new-value` - 新值（用于修改）
- `.arrow` - 旧值和新值之间的箭头
- `.children-container` - 子节点容器

### 自定义样式示例

```css
.json-diff-container {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  padding: 16px;
  background: #f6f8fa;
  border-radius: 8px;
}

.json-diff-stats {
  margin-bottom: 12px;
  padding: 8px;
  background: white;
  border-radius: 4px;
}

.stat-added,
.stat-deleted,
.stat-modified {
  margin-right: 12px;
  padding: 4px 8px;
  border-radius: 3px;
  font-weight: bold;
}

.toggle-button:hover {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.diff-line {
  padding: 2px 0;
  line-height: 1.5;
}

.key {
  font-weight: 600;
}
```

## 可访问性特性

渲染器包含全面的可访问性支持:

- **语义化 HTML**: 使用适当的 HTML 元素（`<button>`、`<div>` 等）
- **ARIA 属性**: 包含 `role`、`aria-label`、`aria-expanded`、`aria-live`
- **键盘导航**: 完整的键盘支持交互元素
  - `Enter` 或 `Space` 切换展开/折叠
  - `Tab` 在交互元素之间导航
- **屏幕阅读器支持**: 所有交互元素都有描述性标签

## 浏览器支持

- Chrome/Edge: 最新 2 个版本
- Firefox: 最新 2 个版本
- Safari: 最新 2 个版本

## 性能考虑

- **大型 Diff**: 对于非常大的 diff 结果，考虑使用 `showUnchanged: false` 来减少 DOM 节点
- **深层嵌套**: 使用 `expandDepth` 限制初始渲染深度
- **内存**: 渲染器在内存中维护展开/折叠状态；对于非常大的 diff，考虑定期重新创建渲染器

## 集成示例

### React 集成

```typescript
import { useEffect, useRef } from 'react';
import { diff } from '@json-visual-diff/core';
import { DOMRenderer } from '@json-visual-diff/dom-renderer';

function DiffViewer({ oldValue, newValue }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (containerRef.current) {
      const result = diff(oldValue, newValue);
      const renderer = new DOMRenderer({ theme: 'light' });
      const element = renderer.render(result);
      
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(element);
    }
  }, [oldValue, newValue]);
  
  return <div ref={containerRef} />;
}
```

### Vue 集成

```vue
<template>
  <div ref="container"></div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { diff } from '@json-visual-diff/core';
import { DOMRenderer } from '@json-visual-diff/dom-renderer';

const props = defineProps(['oldValue', 'newValue']);
const container = ref(null);

const renderDiff = () => {
  if (container.value) {
    const result = diff(props.oldValue, props.newValue);
    const renderer = new DOMRenderer({ theme: 'dark' });
    const element = renderer.render(result);
    
    container.value.innerHTML = '';
    container.value.appendChild(element);
  }
};

watch(() => [props.oldValue, props.newValue], renderDiff);
onMounted(renderDiff);
</script>
```

## 许可证

MIT

## 相关包

- [@json-visual-diff/core](../core) - 核心 diff 算法库
- [json-visual-diff-playground](../playground) - 交互式演示应用

## 贡献

欢迎贡献！请随时提交 Pull Request。

## 支持

如果您遇到任何问题或有疑问，请在我们的 [GitHub 仓库](https://github.com/yourusername/json-visual-diff) 上提交 issue。
