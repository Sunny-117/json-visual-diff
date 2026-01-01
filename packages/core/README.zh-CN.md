# @json-visual-diff/core

一个强大且灵活的 JSON diff 算法库，用于计算两个 JSON 对象之间的差异并生成标准化的 diff 结果。

[English Documentation](./README.md)

## 特性

- 🚀 **纯算法实现**: 平台无关的核心库，可在任何 JavaScript 环境中运行
- 🔍 **智能数组 Diff**: 使用 LCS（最长公共子序列）算法进行智能数组比较
- 🎯 **扩展类型支持**: 处理 Function、Date、RegExp、Symbol 等非标准 JSON 类型
- 🔄 **循环引用检测**: 安全处理循环引用，避免无限循环
- 📊 **标准化输出**: 生成一致的 DiffResult 格式，便于使用
- 🎨 **渲染器无关**: 核心算法与渲染逻辑完全解耦
- 💪 **TypeScript 优先**: 完整的类型定义，提供出色的 IDE 支持
- ⚡ **性能优化**: 可配置的深度限制和高效算法

## 安装

```bash
npm install @json-visual-diff/core
# 或
pnpm add @json-visual-diff/core
# 或
yarn add @json-visual-diff/core
```

## 快速开始

```typescript
import { diff } from '@json-visual-diff/core';

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

const result = diff(oldObj, newObj);

console.log(result);
// {
//   root: { ... },
//   stats: {
//     added: 1,
//     deleted: 0,
//     modified: 2,
//     unchanged: 1
//   }
// }
```

## API 文档

### `diff(oldValue, newValue, options?)`

计算两个值之间的差异并返回 DiffResult。

**参数:**
- `oldValue: any` - 原始值
- `newValue: any` - 要比较的新值
- `options?: DiffOptions` - 可选配置

**返回值:** `DiffResult`

**示例:**

```typescript
import { diff } from '@json-visual-diff/core';

const result = diff(
  { a: 1, b: 2 },
  { a: 1, b: 3, c: 4 },
  {
    maxDepth: 10,
    arrayDiffMode: 'lcs',
    detectCircular: true
  }
);
```

### `DiffEngine`

执行比较的核心 diff 引擎类。

**构造函数:**

```typescript
import { DiffEngine } from '@json-visual-diff/core';

const engine = new DiffEngine({
  maxDepth: 10,
  ignoreKeys: ['_id', 'timestamp'],
  arrayDiffMode: 'lcs',
  detectCircular: true
});

const result = engine.compute(oldValue, newValue);
```

**方法:**

- `compute(oldValue, newValue): DiffResult` - 计算完整的 diff 结果（包含统计信息）
- `diff(oldValue, newValue, path?): DiffNode` - 计算特定路径的 diff

### `TypeNormalizer`

用于规范化非标准 JSON 类型的工具类。

**静态方法:**

```typescript
import { TypeNormalizer } from '@json-visual-diff/core';

// 获取值的类型
const type = TypeNormalizer.getValueType(value);

// 将函数规范化为可比较的字符串
const fnStr = TypeNormalizer.normalizeFunction(myFunction);

// 将 Date 规范化为时间戳
const timestamp = TypeNormalizer.normalizeDate(new Date());

// 将 RegExp 规范化为字符串
const regexpStr = TypeNormalizer.normalizeRegExp(/test/gi);

// 将值序列化为可显示的字符串
const str = TypeNormalizer.serialize(value, type);
```

### `LCSArrayDiff`

用于智能数组 diff 的 LCS（最长公共子序列）算法实现。

**静态方法:**

```typescript
import { LCSArrayDiff } from '@json-visual-diff/core';

// 计算两个数组的 LCS
const dp = LCSArrayDiff.computeLCS(arr1, arr2);

// 获取 diff 操作序列
const ops = LCSArrayDiff.diff(arr1, arr2);

// 深度相等性检查
const isEqual = LCSArrayDiff.isEqual(value1, value2);
```

### `DiffResultBuilder`

用于构建和操作 DiffNode 结构的辅助类。

**静态方法:**

```typescript
import { DiffResultBuilder } from '@json-visual-diff/core';

// 创建不同类型的节点
const addedNode = DiffResultBuilder.createAddedNode(path, valueType, newValue);
const deletedNode = DiffResultBuilder.createDeletedNode(path, valueType, oldValue);
const modifiedNode = DiffResultBuilder.createModifiedNode(path, valueType, oldValue, newValue);
const unchangedNode = DiffResultBuilder.createUnchangedNode(path, valueType, value);

// 构建 JSON Path
const jsonPath = DiffResultBuilder.buildJsonPath(['user', 'address', 'city']);
// 返回: "$.user.address.city"

// 计算统计信息
const stats = DiffResultBuilder.computeStats(rootNode);

// 验证节点结构
const isValid = DiffResultBuilder.validateNode(node);

// 根据路径查找节点
const node = DiffResultBuilder.findNodeByPath(root, ['user', 'name']);
```

## 类型定义

### `DiffType`

```typescript
enum DiffType {
  ADDED = 'added',       // 属性被添加
  DELETED = 'deleted',   // 属性被删除
  MODIFIED = 'modified', // 属性被修改
  UNCHANGED = 'unchanged' // 属性未改变
}
```

### `ValueType`

```typescript
enum ValueType {
  PRIMITIVE = 'primitive', // string, number, boolean
  OBJECT = 'object',       // 普通对象
  ARRAY = 'array',         // 数组
  FUNCTION = 'function',   // 函数
  DATE = 'date',           // Date 对象
  REGEXP = 'regexp',       // RegExp 对象
  UNDEFINED = 'undefined', // undefined
  NULL = 'null',           // null
  SYMBOL = 'symbol'        // Symbol
}
```

### `DiffNode`

```typescript
interface DiffNode {
  type: DiffType;           // 差异类型
  path: string[];           // JSON Path（数组形式）
  valueType: ValueType;     // 值的类型
  oldValue?: any;           // 旧值（删除/修改时）
  newValue?: any;           // 新值（添加/修改时）
  children?: DiffNode[];    // 子节点（对象/数组）
}
```

### `DiffResult`

```typescript
interface DiffResult {
  root: DiffNode;           // 根 diff 节点
  stats: {                  // 统计信息
    added: number;
    deleted: number;
    modified: number;
    unchanged: number;
  };
}
```

### `DiffOptions`

```typescript
interface DiffOptions {
  maxDepth?: number;        // 最大比较深度（默认: Infinity）
  ignoreKeys?: string[];    // 要忽略的键（默认: []）
  arrayDiffMode?: 'lcs' | 'position'; // 数组比较模式（默认: 'lcs'）
  detectCircular?: boolean; // 检测循环引用（默认: true）
}
```

## 高级用法

### 处理扩展类型

```typescript
import { diff } from '@json-visual-diff/core';

const oldObj = {
  fn: function add(a, b) { return a + b; },
  date: new Date('2024-01-01'),
  regex: /test/gi,
  sym: Symbol('test')
};

const newObj = {
  fn: function add(a, b) { return a + b; },
  date: new Date('2024-01-02'),
  regex: /test/i,
  sym: Symbol('test')
};

const result = diff(oldObj, newObj);
// 正确识别 date 和 regex 被修改
```

### 循环引用处理

```typescript
import { diff } from '@json-visual-diff/core';

const obj1 = { name: 'circular' };
obj1.self = obj1;

const obj2 = { name: 'circular' };
obj2.self = obj2;

const result = diff(obj1, obj2, { detectCircular: true });
// 安全处理循环引用，不会导致无限循环
```

### 自定义深度限制

```typescript
import { diff } from '@json-visual-diff/core';

const deepObj1 = {
  level1: {
    level2: {
      level3: {
        level4: { value: 'deep' }
      }
    }
  }
};

const deepObj2 = {
  level1: {
    level2: {
      level3: {
        level4: { value: 'deeper' }
      }
    }
  }
};

const result = diff(deepObj1, deepObj2, { maxDepth: 3 });
// 在第 3 层停止比较
```

### 数组 Diff 模式

```typescript
import { diff } from '@json-visual-diff/core';

const arr1 = [1, 2, 3, 4];
const arr2 = [1, 3, 4, 5];

// LCS 模式（智能 diff）
const lcsResult = diff(arr1, arr2, { arrayDiffMode: 'lcs' });
// 识别出 2 被删除，5 被添加

// 位置模式（逐个索引比较）
const posResult = diff(arr1, arr2, { arrayDiffMode: 'position' });
// 比较 arr1[0] 与 arr2[0]，arr1[1] 与 arr2[1]，等等
```

### 忽略特定键

```typescript
import { diff } from '@json-visual-diff/core';

const obj1 = {
  id: '123',
  timestamp: 1234567890,
  data: { value: 'old' }
};

const obj2 = {
  id: '456',
  timestamp: 9876543210,
  data: { value: 'new' }
};

const result = diff(obj1, obj2, {
  ignoreKeys: ['id', 'timestamp']
});
// 只比较 'data' 字段
```

## 与渲染器集成

这个核心库设计为可与可插拔的渲染器配合使用。标准化的 `DiffResult` 格式可以被任何渲染器实现使用。

```typescript
import { diff } from '@json-visual-diff/core';
import { DOMRenderer } from '@json-visual-diff/dom-renderer';

const result = diff(oldObj, newObj);
const renderer = new DOMRenderer();
const htmlElement = renderer.render(result);

document.body.appendChild(htmlElement);
```

## 性能考虑

- **大型对象**: 使用 `maxDepth` 选项限制比较深度
- **大型数组**: LCS 算法的时间复杂度为 O(m*n)，对于非常大的数组考虑使用 `arrayDiffMode: 'position'`
- **循环引用**: 启用 `detectCircular` 以防止无限循环（默认启用）

## 许可证

MIT

## 相关包

- [@json-visual-diff/dom-renderer](../dom-renderer) - 用于浏览器可视化的 DOM 渲染器
- [json-visual-diff-playground](../playground) - 交互式演示应用

## 贡献

欢迎贡献！请随时提交 Pull Request。

## 支持

如果您遇到任何问题或有疑问，请在我们的 [GitHub 仓库](https://github.com/yourusername/json-visual-diff) 上提交 issue。
