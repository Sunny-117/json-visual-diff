# @json-visual-diff/core

A powerful and flexible JSON diff algorithm library that computes differences between two JSON objects and generates standardized diff results.

[中文文档](./README.zh-CN.md)

## Features

- 🚀 **Pure Algorithm**: Platform-agnostic core library that works in any JavaScript environment
- 🔍 **Smart Array Diff**: Uses LCS (Longest Common Subsequence) algorithm for intelligent array comparison
- 🎯 **Extended Type Support**: Handles Function, Date, RegExp, Symbol, and other non-standard JSON types
- 🔄 **Circular Reference Detection**: Safely handles circular references without infinite loops
- 📊 **Standardized Output**: Generates consistent DiffResult format for easy consumption
- 🎨 **Renderer-Agnostic**: Core algorithm is completely decoupled from rendering logic
- 💪 **TypeScript First**: Full type definitions for excellent IDE support
- ⚡ **Performance Optimized**: Configurable depth limits and efficient algorithms

## Installation

```bash
npm install @json-visual-diff/core
# or
pnpm add @json-visual-diff/core
# or
yarn add @json-visual-diff/core
```

## Quick Start

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

## API Documentation

### `diff(oldValue, newValue, options?)`

Computes the difference between two values and returns a DiffResult.

**Parameters:**
- `oldValue: any` - The original value
- `newValue: any` - The new value to compare against
- `options?: DiffOptions` - Optional configuration

**Returns:** `DiffResult`

**Example:**

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

The core diff engine class that performs the comparison.

**Constructor:**

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

**Methods:**

- `compute(oldValue, newValue): DiffResult` - Computes the full diff result with statistics
- `diff(oldValue, newValue, path?): DiffNode` - Computes diff for a specific path

### `TypeNormalizer`

Utility class for normalizing non-standard JSON types.

**Static Methods:**

```typescript
import { TypeNormalizer } from '@json-visual-diff/core';

// Get value type
const type = TypeNormalizer.getValueType(value);

// Normalize function to comparable string
const fnStr = TypeNormalizer.normalizeFunction(myFunction);

// Normalize Date to timestamp
const timestamp = TypeNormalizer.normalizeDate(new Date());

// Normalize RegExp to string
const regexpStr = TypeNormalizer.normalizeRegExp(/test/gi);

// Serialize value to displayable string
const str = TypeNormalizer.serialize(value, type);
```

### `LCSArrayDiff`

LCS (Longest Common Subsequence) algorithm implementation for smart array diffing.

**Static Methods:**

```typescript
import { LCSArrayDiff } from '@json-visual-diff/core';

// Compute LCS between two arrays
const dp = LCSArrayDiff.computeLCS(arr1, arr2);

// Get diff operations
const ops = LCSArrayDiff.diff(arr1, arr2);

// Deep equality check
const isEqual = LCSArrayDiff.isEqual(value1, value2);
```

### `DiffResultBuilder`

Helper class for building and manipulating DiffNode structures.

**Static Methods:**

```typescript
import { DiffResultBuilder } from '@json-visual-diff/core';

// Create different types of nodes
const addedNode = DiffResultBuilder.createAddedNode(path, valueType, newValue);
const deletedNode = DiffResultBuilder.createDeletedNode(path, valueType, oldValue);
const modifiedNode = DiffResultBuilder.createModifiedNode(path, valueType, oldValue, newValue);
const unchangedNode = DiffResultBuilder.createUnchangedNode(path, valueType, value);

// Build JSON Path
const jsonPath = DiffResultBuilder.buildJsonPath(['user', 'address', 'city']);
// Returns: "$.user.address.city"

// Compute statistics
const stats = DiffResultBuilder.computeStats(rootNode);

// Validate node structure
const isValid = DiffResultBuilder.validateNode(node);

// Find node by path
const node = DiffResultBuilder.findNodeByPath(root, ['user', 'name']);
```

## Type Definitions

### `DiffType`

```typescript
enum DiffType {
  ADDED = 'added',       // Property was added
  DELETED = 'deleted',   // Property was deleted
  MODIFIED = 'modified', // Property was modified
  UNCHANGED = 'unchanged' // Property unchanged
}
```

### `ValueType`

```typescript
enum ValueType {
  PRIMITIVE = 'primitive', // string, number, boolean
  OBJECT = 'object',       // Plain object
  ARRAY = 'array',         // Array
  FUNCTION = 'function',   // Function
  DATE = 'date',           // Date object
  REGEXP = 'regexp',       // RegExp object
  UNDEFINED = 'undefined', // undefined
  NULL = 'null',           // null
  SYMBOL = 'symbol'        // Symbol
}
```

### `DiffNode`

```typescript
interface DiffNode {
  type: DiffType;           // Type of difference
  path: string[];           // JSON Path as array
  valueType: ValueType;     // Type of the value
  oldValue?: any;           // Old value (for deleted/modified)
  newValue?: any;           // New value (for added/modified)
  children?: DiffNode[];    // Child nodes (for objects/arrays)
}
```

### `DiffResult`

```typescript
interface DiffResult {
  root: DiffNode;           // Root diff node
  stats: {                  // Statistics
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
  maxDepth?: number;        // Maximum comparison depth (default: Infinity)
  ignoreKeys?: string[];    // Keys to ignore (default: [])
  arrayDiffMode?: 'lcs' | 'position'; // Array comparison mode (default: 'lcs')
  detectCircular?: boolean; // Detect circular references (default: true)
}
```

## Advanced Usage

### Handling Extended Types

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
// Correctly identifies that date and regex are modified
```

### Circular Reference Handling

```typescript
import { diff } from '@json-visual-diff/core';

const obj1 = { name: 'circular' };
obj1.self = obj1;

const obj2 = { name: 'circular' };
obj2.self = obj2;

const result = diff(obj1, obj2, { detectCircular: true });
// Safely handles circular references without infinite loop
```

### Custom Depth Limit

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
// Stops comparison at level 3
```

### Array Diff Modes

```typescript
import { diff } from '@json-visual-diff/core';

const arr1 = [1, 2, 3, 4];
const arr2 = [1, 3, 4, 5];

// LCS mode (smart diff)
const lcsResult = diff(arr1, arr2, { arrayDiffMode: 'lcs' });
// Identifies that 2 was removed and 5 was added

// Position mode (index-by-index)
const posResult = diff(arr1, arr2, { arrayDiffMode: 'position' });
// Compares arr1[0] with arr2[0], arr1[1] with arr2[1], etc.
```

### Ignoring Specific Keys

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
// Only compares 'data' field
```

## Integration with Renderers

This core library is designed to work with pluggable renderers. The standardized `DiffResult` format can be consumed by any renderer implementation.

```typescript
import { diff } from '@json-visual-diff/core';
import { DOMRenderer } from '@json-visual-diff/dom-renderer';

const result = diff(oldObj, newObj);
const renderer = new DOMRenderer();
const htmlElement = renderer.render(result);

document.body.appendChild(htmlElement);
```

## Performance Considerations

- **Large Objects**: Use `maxDepth` option to limit comparison depth
- **Large Arrays**: LCS algorithm is O(m*n), consider using `arrayDiffMode: 'position'` for very large arrays
- **Circular References**: Enable `detectCircular` to prevent infinite loops (enabled by default)

## License

MIT

## Related Packages

- [@json-visual-diff/dom-renderer](../dom-renderer) - DOM renderer for browser visualization
- [json-visual-diff-playground](../playground) - Interactive demo application

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please file an issue on our [GitHub repository](https://github.com/yourusername/json-visual-diff).
