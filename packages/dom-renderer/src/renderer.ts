/**
 * DOM 渲染器实现
 * 将 DiffResult 渲染为浏览器 DOM 元素
 */

import type { DiffResult, DiffNode, Renderer, RendererConfig } from '@json-visual-diff/core';
import { getThemeColors, type ThemeColors } from './styles.js';

/**
 * DOM 渲染器类
 * 实现 Renderer 接口，将 diff 结果渲染为 HTML DOM 元素
 */
export class DOMRenderer implements Renderer<HTMLElement> {
  private config: Required<RendererConfig>;
  private colors: ThemeColors;
  private expandedPaths: Set<string>;

  constructor(config?: RendererConfig) {
    // 设置默认配置
    this.config = {
      theme: config?.theme ?? 'light',
      colors: config?.colors ?? {},
      indent: config?.indent ?? 2,
      expandDepth: config?.expandDepth ?? 3,
      showUnchanged: config?.showUnchanged ?? true,
    };

    // 获取主题颜色
    this.colors = getThemeColors(this.config.theme, this.config.colors);

    // 初始化展开路径集合
    this.expandedPaths = new Set();
  }

  /**
   * 渲染 diff 结果
   * 生成完整的 diff 可视化容器
   */
  render(diffResult: DiffResult, config?: RendererConfig): HTMLElement {
    // 如果提供了新配置，更新配置
    if (config) {
      this.updateConfig(config);
    }

    // 创建容器元素
    const container = document.createElement('div');
    container.className = 'json-diff-container';
    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', 'JSON difference visualization');

    // 创建统计信息区域
    const statsElement = this.renderStats(diffResult.stats);
    container.appendChild(statsElement);

    // 创建内容区域
    const contentElement = document.createElement('div');
    contentElement.className = 'json-diff-content';
    contentElement.setAttribute('role', 'tree');

    // 渲染根节点
    const rootElement = this.renderNode(diffResult.root, config);
    contentElement.appendChild(rootElement);

    container.appendChild(contentElement);

    return container;
  }

  /**
   * 渲染单个节点
   * 根据节点类型调用相应的渲染方法
   */
  renderNode(node: DiffNode, config?: RendererConfig): HTMLElement {
    // 如果提供了新配置，更新配置
    if (config) {
      this.updateConfig(config);
    }

    // 根据差异类型选择渲染方法
    switch (node.type) {
      case 'added':
        return this.renderAdded(node, config);
      case 'deleted':
        return this.renderDeleted(node, config);
      case 'modified':
        return this.renderModified(node, config);
      case 'unchanged':
        return this.renderUnchanged(node, config);
      default:
        throw new Error(`Unknown diff type: ${node.type}`);
    }
  }

  /**
   * 渲染添加的节点
   */
  renderAdded(node: DiffNode, config?: RendererConfig): HTMLElement {
    const element = document.createElement('div');
    element.className = 'diff-node diff-added';
    element.style.color = this.colors.added;
    element.setAttribute('role', 'treeitem');
    element.setAttribute('aria-label', `Added: ${this.getPathLabel(node.path)}`);

    const line = document.createElement('div');
    line.className = 'diff-line';

    // 添加缩进
    const indent = this.createIndent(node.path.length);
    line.appendChild(indent);

    // 添加展开/折叠按钮（如果有子节点）
    if (node.children && node.children.length > 0) {
      const toggle = this.createToggleButton(node.path);
      line.appendChild(toggle);
    }

    // 添加键名（如果有）
    if (node.path.length > 0) {
      const key = document.createElement('span');
      key.className = 'key';
      key.style.color = this.colors.key;
      key.textContent = node.path[node.path.length - 1] + ': ';
      line.appendChild(key);
    }

    // 添加值
    const value = document.createElement('span');
    value.className = 'value';
    value.style.color = this.colors.added;
    value.textContent = this.formatValue(node.newValue, node.valueType);
    line.appendChild(value);

    element.appendChild(line);

    // 渲染子节点
    if (node.children && node.children.length > 0) {
      const childrenContainer = this.createChildrenContainer(node.path);
      for (const child of node.children) {
        childrenContainer.appendChild(this.renderNode(child, config));
      }
      element.appendChild(childrenContainer);
    }

    return element;
  }

  /**
   * 渲染删除的节点
   */
  renderDeleted(node: DiffNode, config?: RendererConfig): HTMLElement {
    const element = document.createElement('div');
    element.className = 'diff-node diff-deleted';
    element.style.color = this.colors.deleted;
    element.setAttribute('role', 'treeitem');
    element.setAttribute('aria-label', `Deleted: ${this.getPathLabel(node.path)}`);

    const line = document.createElement('div');
    line.className = 'diff-line';

    // 添加缩进
    const indent = this.createIndent(node.path.length);
    line.appendChild(indent);

    // 添加展开/折叠按钮（如果有子节点）
    if (node.children && node.children.length > 0) {
      const toggle = this.createToggleButton(node.path);
      line.appendChild(toggle);
    }

    // 添加键名（如果有）
    if (node.path.length > 0) {
      const key = document.createElement('span');
      key.className = 'key';
      key.style.color = this.colors.key;
      key.textContent = node.path[node.path.length - 1] + ': ';
      line.appendChild(key);
    }

    // 添加值
    const value = document.createElement('span');
    value.className = 'value';
    value.style.color = this.colors.deleted;
    value.textContent = this.formatValue(node.oldValue, node.valueType);
    line.appendChild(value);

    element.appendChild(line);

    // 渲染子节点
    if (node.children && node.children.length > 0) {
      const childrenContainer = this.createChildrenContainer(node.path);
      for (const child of node.children) {
        childrenContainer.appendChild(this.renderNode(child, config));
      }
      element.appendChild(childrenContainer);
    }

    return element;
  }

  /**
   * 渲染修改的节点
   */
  renderModified(node: DiffNode, config?: RendererConfig): HTMLElement {
    const element = document.createElement('div');
    element.className = 'diff-node diff-modified';
    element.style.color = this.colors.modified;
    element.setAttribute('role', 'treeitem');
    element.setAttribute('aria-label', `Modified: ${this.getPathLabel(node.path)}`);

    const line = document.createElement('div');
    line.className = 'diff-line';

    // 添加缩进
    const indent = this.createIndent(node.path.length);
    line.appendChild(indent);

    // 添加展开/折叠按钮（如果有子节点）
    if (node.children && node.children.length > 0) {
      const toggle = this.createToggleButton(node.path);
      line.appendChild(toggle);
    }

    // 添加键名（如果有）
    if (node.path.length > 0) {
      const key = document.createElement('span');
      key.className = 'key';
      key.style.color = this.colors.key;
      key.textContent = node.path[node.path.length - 1] + ': ';
      line.appendChild(key);
    }

    // 如果没有子节点，显示旧值和新值
    if (!node.children || node.children.length === 0) {
      const oldValue = document.createElement('span');
      oldValue.className = 'old-value';
      oldValue.style.color = this.colors.deleted;
      oldValue.textContent = this.formatValue(node.oldValue, node.valueType);
      line.appendChild(oldValue);

      const arrow = document.createElement('span');
      arrow.className = 'arrow';
      arrow.textContent = ' → ';
      arrow.style.color = this.colors.text;
      line.appendChild(arrow);

      const newValue = document.createElement('span');
      newValue.className = 'new-value';
      newValue.style.color = this.colors.added;
      newValue.textContent = this.formatValue(node.newValue, node.valueType);
      line.appendChild(newValue);
    }

    element.appendChild(line);

    // 渲染子节点
    if (node.children && node.children.length > 0) {
      const childrenContainer = this.createChildrenContainer(node.path);
      for (const child of node.children) {
        childrenContainer.appendChild(this.renderNode(child, config));
      }
      element.appendChild(childrenContainer);
    }

    return element;
  }

  /**
   * 渲染未改变的节点
   */
  renderUnchanged(node: DiffNode, config?: RendererConfig): HTMLElement {
    // 如果配置为不显示未改变的节点，返回空元素
    if (!this.config.showUnchanged) {
      const element = document.createElement('div');
      element.style.display = 'none';
      return element;
    }

    const element = document.createElement('div');
    element.className = 'diff-node diff-unchanged';
    element.style.color = this.colors.unchanged;
    element.setAttribute('role', 'treeitem');
    element.setAttribute('aria-label', `Unchanged: ${this.getPathLabel(node.path)}`);

    const line = document.createElement('div');
    line.className = 'diff-line';

    // 添加缩进
    const indent = this.createIndent(node.path.length);
    line.appendChild(indent);

    // 添加展开/折叠按钮（如果有子节点）
    if (node.children && node.children.length > 0) {
      const toggle = this.createToggleButton(node.path);
      line.appendChild(toggle);
    }

    // 添加键名（如果有）
    if (node.path.length > 0) {
      const key = document.createElement('span');
      key.className = 'key';
      key.style.color = this.colors.key;
      key.textContent = node.path[node.path.length - 1] + ': ';
      line.appendChild(key);
    }

    // 添加值
    const value = document.createElement('span');
    value.className = 'value';
    value.style.color = this.colors.unchanged;
    value.textContent = this.formatValue(node.oldValue ?? node.newValue, node.valueType);
    line.appendChild(value);

    element.appendChild(line);

    // 渲染子节点
    if (node.children && node.children.length > 0) {
      const childrenContainer = this.createChildrenContainer(node.path);
      for (const child of node.children) {
        childrenContainer.appendChild(this.renderNode(child, config));
      }
      element.appendChild(childrenContainer);
    }

    return element;
  }

  /**
   * 渲染统计信息
   */
  private renderStats(stats: DiffResult['stats']): HTMLElement {
    const statsElement = document.createElement('div');
    statsElement.className = 'json-diff-stats';
    statsElement.setAttribute('role', 'status');
    statsElement.setAttribute('aria-live', 'polite');

    // 添加统计项
    if (stats.added > 0) {
      const addedSpan = document.createElement('span');
      addedSpan.className = 'stat-added';
      addedSpan.textContent = `+${stats.added}`;
      addedSpan.style.color = this.colors.added;
      addedSpan.setAttribute('aria-label', `${stats.added} items added`);
      statsElement.appendChild(addedSpan);
    }

    if (stats.deleted > 0) {
      const deletedSpan = document.createElement('span');
      deletedSpan.className = 'stat-deleted';
      deletedSpan.textContent = `-${stats.deleted}`;
      deletedSpan.style.color = this.colors.deleted;
      deletedSpan.setAttribute('aria-label', `${stats.deleted} items deleted`);
      statsElement.appendChild(deletedSpan);
    }

    if (stats.modified > 0) {
      const modifiedSpan = document.createElement('span');
      modifiedSpan.className = 'stat-modified';
      modifiedSpan.textContent = `~${stats.modified}`;
      modifiedSpan.style.color = this.colors.modified;
      modifiedSpan.setAttribute('aria-label', `${stats.modified} items modified`);
      statsElement.appendChild(modifiedSpan);
    }

    return statsElement;
  }

  /**
   * 更新配置
   */
  private updateConfig(config: RendererConfig): void {
    if (config.theme !== undefined) {
      this.config.theme = config.theme;
    }
    if (config.colors !== undefined) {
      this.config.colors = { ...this.config.colors, ...config.colors };
    }
    if (config.indent !== undefined) {
      this.config.indent = config.indent;
    }
    if (config.expandDepth !== undefined) {
      this.config.expandDepth = config.expandDepth;
    }
    if (config.showUnchanged !== undefined) {
      this.config.showUnchanged = config.showUnchanged;
    }

    // 更新主题颜色
    this.colors = getThemeColors(this.config.theme, this.config.colors);
  }

  /**
   * 检查路径是否应该展开
   */
  private shouldExpand(path: string[]): boolean {
    return path.length < this.config.expandDepth;
  }

  /**
   * 切换路径的展开状态
   */
  toggleExpand(path: string[]): void {
    const pathKey = path.join('.');
    if (this.expandedPaths.has(pathKey)) {
      this.expandedPaths.delete(pathKey);
    } else {
      this.expandedPaths.add(pathKey);
    }
  }

  /**
   * 检查路径是否已展开
   */
  isExpanded(path: string[]): boolean {
    const pathKey = path.join('.');
    return this.expandedPaths.has(pathKey);
  }

  /**
   * 创建缩进元素
   */
  private createIndent(depth: number): HTMLElement {
    const indent = document.createElement('span');
    indent.className = 'indent';
    indent.style.paddingLeft = `${depth * this.config.indent}ch`;
    return indent;
  }

  /**
   * 创建展开/折叠按钮
   */
  private createToggleButton(path: string[]): HTMLElement {
    const button = document.createElement('button');
    button.className = 'toggle-button';
    button.setAttribute('type', 'button');
    button.setAttribute('aria-expanded', this.shouldExpand(path) ? 'true' : 'false');
    button.setAttribute('aria-label', 'Toggle expand/collapse');
    button.setAttribute('tabindex', '0');
    button.textContent = this.shouldExpand(path) || this.isExpanded(path) ? '▼' : '▶';
    button.style.border = 'none';
    button.style.background = 'transparent';
    button.style.cursor = 'pointer';
    button.style.padding = '0 4px';
    button.style.color = this.colors.text;

    // 切换展开状态的处理函数
    const toggleHandler = () => {
      this.toggleExpand(path);
      button.textContent = this.isExpanded(path) ? '▼' : '▶';
      button.setAttribute('aria-expanded', this.isExpanded(path) ? 'true' : 'false');
      
      // 切换子节点容器的显示状态
      const parent = button.closest('.diff-node');
      if (parent) {
        const childrenContainer = parent.querySelector('.children-container') as HTMLElement;
        if (childrenContainer) {
          childrenContainer.style.display = this.isExpanded(path) ? 'block' : 'none';
        }
      }
    };

    // 添加点击事件
    button.addEventListener('click', toggleHandler);

    // 添加键盘导航支持
    button.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleHandler();
      }
    });

    return button;
  }

  /**
   * 创建子节点容器
   */
  private createChildrenContainer(path: string[]): HTMLElement {
    const container = document.createElement('div');
    container.className = 'children-container';
    container.setAttribute('role', 'group');
    
    // 根据展开状态设置初始显示
    const shouldShow = this.shouldExpand(path) || this.isExpanded(path);
    container.style.display = shouldShow ? 'block' : 'none';
    
    return container;
  }

  /**
   * 格式化值为字符串
   */
  private formatValue(value: any, valueType: string): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';

    switch (valueType) {
      case 'string':
        return `"${value}"`;
      case 'number':
      case 'boolean':
        return String(value);
      case 'object':
        return '{...}';
      case 'array':
        return '[...]';
      case 'function':
        return 'function() {...}';
      case 'date':
        return value instanceof Date ? value.toISOString() : String(value);
      case 'regexp':
        return value instanceof RegExp ? value.toString() : String(value);
      case 'symbol':
        return String(value);
      default:
        return JSON.stringify(value);
    }
  }

  /**
   * 获取路径标签
   */
  private getPathLabel(path: string[]): string {
    return path.length > 0 ? path.join('.') : 'root';
  }
}
