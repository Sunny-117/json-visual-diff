# @json-visual-diff/dom-renderer

A DOM renderer for visualizing JSON differences in the browser. This package provides a pluggable renderer implementation that converts standardized diff results into interactive HTML elements.

[中文文档](./README.zh-CN.md)

## Features

- 🎨 **Visual Differentiation**: Clear color-coded display for added, deleted, modified, and unchanged values
- 🌓 **Theme Support**: Built-in light and dark themes with custom color configuration
- 🔄 **Interactive UI**: Collapsible/expandable nested structures for better navigation
- ♿ **Accessibility**: Semantic HTML with ARIA attributes for screen reader support
- ⌨️ **Keyboard Navigation**: Full keyboard support for interactive elements
- 🎯 **Customizable**: Flexible configuration for colors, indentation, and display options
- 💪 **TypeScript**: Full type definitions included

## Installation

```bash
npm install @json-visual-diff/dom-renderer @json-visual-diff/core
# or
pnpm add @json-visual-diff/dom-renderer @json-visual-diff/core
# or
yarn add @json-visual-diff/dom-renderer @json-visual-diff/core
```

## Quick Start

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

// Compute the diff
const result = diff(oldObj, newObj);

// Create renderer and render to DOM
const renderer = new DOMRenderer();
const element = renderer.render(result);

// Append to your page
document.body.appendChild(element);
```

## API Documentation

### `DOMRenderer`

The main renderer class that implements the `Renderer` interface from `@json-visual-diff/core`.

#### Constructor

```typescript
new DOMRenderer(config?: RendererConfig)
```

**Parameters:**
- `config?: RendererConfig` - Optional renderer configuration

**Example:**

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

#### Methods

##### `render(diffResult, config?)`

Renders a complete diff result into an HTML element.

**Parameters:**
- `diffResult: DiffResult` - The diff result from `@json-visual-diff/core`
- `config?: RendererConfig` - Optional configuration to override constructor config

**Returns:** `HTMLElement` - The rendered DOM element

**Example:**

```typescript
const element = renderer.render(result, {
  theme: 'light',
  showUnchanged: false
});
```

##### `renderNode(node, config?)`

Renders a single diff node into an HTML element.

**Parameters:**
- `node: DiffNode` - A single diff node
- `config?: RendererConfig` - Optional configuration

**Returns:** `HTMLElement` - The rendered DOM element

**Example:**

```typescript
const nodeElement = renderer.renderNode(result.root);
```

##### `renderAdded(node, config?)`

Renders a node that was added.

**Parameters:**
- `node: DiffNode` - The added node
- `config?: RendererConfig` - Optional configuration

**Returns:** `HTMLElement`

##### `renderDeleted(node, config?)`

Renders a node that was deleted.

**Parameters:**
- `node: DiffNode` - The deleted node
- `config?: RendererConfig` - Optional configuration

**Returns:** `HTMLElement`

##### `renderModified(node, config?)`

Renders a node that was modified.

**Parameters:**
- `node: DiffNode` - The modified node
- `config?: RendererConfig` - Optional configuration

**Returns:** `HTMLElement`

##### `renderUnchanged(node, config?)`

Renders a node that was unchanged.

**Parameters:**
- `node: DiffNode` - The unchanged node
- `config?: RendererConfig` - Optional configuration

**Returns:** `HTMLElement`

##### `toggleExpand(path)`

Toggles the expand/collapse state of a node at the given path.

**Parameters:**
- `path: string[]` - The path to the node

**Example:**

```typescript
renderer.toggleExpand(['user', 'address']);
```

##### `isExpanded(path)`

Checks if a node at the given path is expanded.

**Parameters:**
- `path: string[]` - The path to the node

**Returns:** `boolean`

## Configuration

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
  indent?: number;          // Indentation spaces (default: 2)
  expandDepth?: number;     // Default expand depth (default: 3)
  showUnchanged?: boolean;  // Show unchanged nodes (default: true)
}
```

### Theme Configuration

#### Light Theme (Default)

```typescript
const renderer = new DOMRenderer({ theme: 'light' });
```

Default colors:
- Added: `#22863a` (green)
- Deleted: `#cb2431` (red)
- Modified: `#e36209` (orange)
- Unchanged: `#6a737d` (gray)

#### Dark Theme

```typescript
const renderer = new DOMRenderer({ theme: 'dark' });
```

Default colors:
- Added: `#28a745` (green)
- Deleted: `#d73a49` (red)
- Modified: `#f97583` (pink)
- Unchanged: `#959da5` (gray)

#### Custom Colors

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

## Advanced Usage

### Controlling Expand/Collapse

```typescript
import { diff } from '@json-visual-diff/core';
import { DOMRenderer } from '@json-visual-diff/dom-renderer';

const result = diff(oldObj, newObj);
const renderer = new DOMRenderer({
  expandDepth: 2  // Only expand first 2 levels by default
});

const element = renderer.render(result);
document.body.appendChild(element);

// Programmatically toggle expansion
renderer.toggleExpand(['user', 'address']);

// Check if expanded
if (renderer.isExpanded(['user', 'address'])) {
  console.log('Address is expanded');
}
```

### Hiding Unchanged Values

```typescript
const renderer = new DOMRenderer({
  showUnchanged: false  // Hide unchanged values
});

const element = renderer.render(result);
```

### Custom Indentation

```typescript
const renderer = new DOMRenderer({
  indent: 4  // Use 4 spaces for indentation
});

const element = renderer.render(result);
```

### Dynamic Theme Switching

```typescript
const renderer = new DOMRenderer({ theme: 'light' });

// Render with light theme
let element = renderer.render(result);
document.body.appendChild(element);

// Switch to dark theme
element = renderer.render(result, { theme: 'dark' });
document.body.replaceChild(element, document.body.firstChild);
```

### Rendering Individual Nodes

```typescript
import { diff } from '@json-visual-diff/core';
import { DOMRenderer } from '@json-visual-diff/dom-renderer';

const result = diff(oldObj, newObj);
const renderer = new DOMRenderer();

// Render only specific nodes
if (result.root.children) {
  for (const child of result.root.children) {
    if (child.type === 'modified') {
      const nodeElement = renderer.renderNode(child);
      document.getElementById('modified-container')?.appendChild(nodeElement);
    }
  }
}
```

## HTML Structure

The renderer generates the following HTML structure:

```html
<div class="json-diff-container" role="region" aria-label="JSON difference visualization">
  <!-- Statistics -->
  <div class="json-diff-stats" role="status" aria-live="polite">
    <span class="stat-added" aria-label="1 items added">+1</span>
    <span class="stat-deleted" aria-label="1 items deleted">-1</span>
    <span class="stat-modified" aria-label="2 items modified">~2</span>
  </div>
  
  <!-- Content -->
  <div class="json-diff-content" role="tree">
    <div class="diff-node diff-modified" role="treeitem" aria-label="Modified: root">
      <div class="diff-line">
        <button class="toggle-button" aria-expanded="true">▼</button>
        <span class="key">name:</span>
        <span class="value">"John"</span>
      </div>
      <div class="children-container" role="group">
        <!-- Child nodes -->
      </div>
    </div>
  </div>
</div>
```

## CSS Classes

The renderer applies the following CSS classes that you can style:

- `.json-diff-container` - Main container
- `.json-diff-stats` - Statistics section
- `.stat-added` - Added count
- `.stat-deleted` - Deleted count
- `.stat-modified` - Modified count
- `.json-diff-content` - Content section
- `.diff-node` - Individual diff node
- `.diff-added` - Added node
- `.diff-deleted` - Deleted node
- `.diff-modified` - Modified node
- `.diff-unchanged` - Unchanged node
- `.diff-line` - Single line in the diff
- `.toggle-button` - Expand/collapse button
- `.key` - Property key
- `.value` - Property value
- `.old-value` - Old value (for modified)
- `.new-value` - New value (for modified)
- `.arrow` - Arrow between old and new values
- `.children-container` - Container for child nodes

### Example Custom Styling

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

## Accessibility Features

The renderer includes comprehensive accessibility support:

- **Semantic HTML**: Uses appropriate HTML elements (`<button>`, `<div>`, etc.)
- **ARIA Attributes**: Includes `role`, `aria-label`, `aria-expanded`, `aria-live`
- **Keyboard Navigation**: Full keyboard support for interactive elements
  - `Enter` or `Space` to toggle expand/collapse
  - `Tab` to navigate between interactive elements
- **Screen Reader Support**: Descriptive labels for all interactive elements

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions

## Performance Considerations

- **Large Diffs**: For very large diff results, consider using `showUnchanged: false` to reduce DOM nodes
- **Deep Nesting**: Use `expandDepth` to limit initially rendered depth
- **Memory**: The renderer maintains expand/collapse state in memory; for very large diffs, consider re-creating the renderer periodically

## Integration Examples

### React Integration

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

### Vue Integration

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

## License

MIT

## Related Packages

- [@json-visual-diff/core](../core) - Core diff algorithm library
- [json-visual-diff-playground](../playground) - Interactive demo application

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please file an issue on our [GitHub repository](https://github.com/yourusername/json-visual-diff).
