import { DiffType, ValueType, DiffNode, DiffResult } from './types.js';

/**
 * Diff Result 构建器
 * 提供创建各类型 DiffNode 的辅助方法
 */
export class DiffResultBuilder {
  /**
   * 创建添加节点
   * @param path JSON Path
   * @param valueType 值类型
   * @param newValue 新值
   * @param children 子节点（可选）
   * @returns DiffNode
   */
  static createAddedNode(
    path: string[],
    valueType: ValueType,
    newValue: any,
    children?: DiffNode[]
  ): DiffNode {
    const node: DiffNode = {
      type: DiffType.ADDED,
      path: [...path], // 复制路径数组以避免引用问题
      valueType,
      newValue,
    };
    
    if (children && children.length > 0) {
      node.children = children;
    }
    
    return node;
  }
  
  /**
   * 创建删除节点
   * @param path JSON Path
   * @param valueType 值类型
   * @param oldValue 旧值
   * @param children 子节点（可选）
   * @returns DiffNode
   */
  static createDeletedNode(
    path: string[],
    valueType: ValueType,
    oldValue: any,
    children?: DiffNode[]
  ): DiffNode {
    const node: DiffNode = {
      type: DiffType.DELETED,
      path: [...path],
      valueType,
      oldValue,
    };
    
    if (children && children.length > 0) {
      node.children = children;
    }
    
    return node;
  }
  
  /**
   * 创建修改节点
   * @param path JSON Path
   * @param valueType 值类型
   * @param oldValue 旧值
   * @param newValue 新值
   * @param children 子节点（可选）
   * @returns DiffNode
   */
  static createModifiedNode(
    path: string[],
    valueType: ValueType,
    oldValue: any,
    newValue: any,
    children?: DiffNode[]
  ): DiffNode {
    const node: DiffNode = {
      type: DiffType.MODIFIED,
      path: [...path],
      valueType,
      oldValue,
      newValue,
    };
    
    if (children && children.length > 0) {
      node.children = children;
    }
    
    return node;
  }
  
  /**
   * 创建未改变节点
   * @param path JSON Path
   * @param valueType 值类型
   * @param value 值（oldValue 和 newValue 相同）
   * @param children 子节点（可选）
   * @returns DiffNode
   */
  static createUnchangedNode(
    path: string[],
    valueType: ValueType,
    value: any,
    children?: DiffNode[]
  ): DiffNode {
    const node: DiffNode = {
      type: DiffType.UNCHANGED,
      path: [...path],
      valueType,
      oldValue: value,
      newValue: value,
    };
    
    if (children && children.length > 0) {
      node.children = children;
    }
    
    return node;
  }
  
  /**
   * 构建 JSON Path 字符串
   * @param path 路径数组
   * @returns JSON Path 字符串（如 "$.user.name" 或 "$.items[0]"）
   */
  static buildJsonPath(path: string[]): string {
    if (path.length === 0) {
      return '$';
    }
    
    return '$.' + path.map(segment => {
      // 如果是数组索引（纯数字），使用方括号表示法
      if (/^\d+$/.test(segment)) {
        return `[${segment}]`;
      }
      // 如果包含特殊字符，使用方括号和引号
      if (/[^a-zA-Z0-9_$]/.test(segment)) {
        return `["${segment}"]`;
      }
      // 普通属性名
      return segment;
    }).join('.').replace(/\.\[/g, '['); // 清理 ".[" 为 "["
  }
  
  /**
   * 从路径数组构建人类可读的路径字符串
   * @param path 路径数组
   * @returns 路径字符串（如 "user.name" 或 "items[0].title"）
   */
  static buildReadablePath(path: string[]): string {
    if (path.length === 0) {
      return 'root';
    }
    
    return path.map(segment => {
      if (/^\d+$/.test(segment)) {
        return `[${segment}]`;
      }
      return segment;
    }).join('.').replace(/\.\[/g, '[');
  }
  
  /**
   * 计算 diff 结果的统计信息
   * @param root 根节点
   * @returns 统计信息对象
   */
  static computeStats(root: DiffNode): {
    added: number;
    deleted: number;
    modified: number;
    unchanged: number;
  } {
    const stats = {
      added: 0,
      deleted: 0,
      modified: 0,
      unchanged: 0,
    };
    
    // 递归遍历所有节点
    const traverse = (node: DiffNode) => {
      // 统计当前节点
      switch (node.type) {
        case DiffType.ADDED:
          stats.added++;
          break;
        case DiffType.DELETED:
          stats.deleted++;
          break;
        case DiffType.MODIFIED:
          stats.modified++;
          break;
        case DiffType.UNCHANGED:
          stats.unchanged++;
          break;
      }
      
      // 递归统计子节点
      if (node.children) {
        for (const child of node.children) {
          traverse(child);
        }
      }
    };
    
    traverse(root);
    
    return stats;
  }
  
  /**
   * 构建完整的 DiffResult
   * @param root 根节点
   * @returns DiffResult
   */
  static buildResult(root: DiffNode): DiffResult {
    const stats = this.computeStats(root);
    
    return {
      root,
      stats,
    };
  }
  
  /**
   * 验证 DiffNode 的结构完整性
   * @param node 要验证的节点
   * @returns 是否有效
   */
  static validateNode(node: DiffNode): boolean {
    // 检查必需字段
    if (!node.type || !node.path || !node.valueType) {
      return false;
    }
    
    // 检查类型特定的字段
    switch (node.type) {
      case DiffType.ADDED:
        // ADDED 节点必须有 newValue
        if (!('newValue' in node)) {
          return false;
        }
        break;
      case DiffType.DELETED:
        // DELETED 节点必须有 oldValue
        if (!('oldValue' in node)) {
          return false;
        }
        break;
      case DiffType.MODIFIED:
        // MODIFIED 节点必须同时有 oldValue 和 newValue
        if (!('oldValue' in node) || !('newValue' in node)) {
          return false;
        }
        break;
      case DiffType.UNCHANGED:
        // UNCHANGED 节点必须同时有 oldValue 和 newValue
        if (!('oldValue' in node) || !('newValue' in node)) {
          return false;
        }
        break;
    }
    
    // 递归验证子节点
    if (node.children) {
      for (const child of node.children) {
        if (!this.validateNode(child)) {
          return false;
        }
      }
    }
    
    return true;
  }
  
  /**
   * 克隆 DiffNode（深拷贝）
   * @param node 要克隆的节点
   * @returns 克隆的节点
   */
  static cloneNode(node: DiffNode): DiffNode {
    const cloned: DiffNode = {
      type: node.type,
      path: [...node.path],
      valueType: node.valueType,
    };
    
    if ('oldValue' in node) {
      cloned.oldValue = node.oldValue;
    }
    
    if ('newValue' in node) {
      cloned.newValue = node.newValue;
    }
    
    if (node.children) {
      cloned.children = node.children.map(child => this.cloneNode(child));
    }
    
    return cloned;
  }
  
  /**
   * 获取节点的深度
   * @param node 节点
   * @returns 深度（根节点为 0）
   */
  static getNodeDepth(node: DiffNode): number {
    return node.path.length;
  }
  
  /**
   * 获取树的最大深度
   * @param node 根节点
   * @returns 最大深度
   */
  static getMaxDepth(node: DiffNode): number {
    let maxDepth = node.path.length;
    
    if (node.children) {
      for (const child of node.children) {
        const childDepth = this.getMaxDepth(child);
        maxDepth = Math.max(maxDepth, childDepth);
      }
    }
    
    return maxDepth;
  }
  
  /**
   * 统计节点总数
   * @param node 根节点
   * @returns 节点总数
   */
  static countNodes(node: DiffNode): number {
    let count = 1; // 当前节点
    
    if (node.children) {
      for (const child of node.children) {
        count += this.countNodes(child);
      }
    }
    
    return count;
  }
  
  /**
   * 过滤节点（根据条件）
   * @param node 根节点
   * @param predicate 过滤条件
   * @returns 符合条件的节点数组
   */
  static filterNodes(
    node: DiffNode,
    predicate: (node: DiffNode) => boolean
  ): DiffNode[] {
    const result: DiffNode[] = [];
    
    const traverse = (n: DiffNode) => {
      if (predicate(n)) {
        result.push(n);
      }
      
      if (n.children) {
        for (const child of n.children) {
          traverse(child);
        }
      }
    };
    
    traverse(node);
    
    return result;
  }
  
  /**
   * 查找特定路径的节点
   * @param root 根节点
   * @param targetPath 目标路径
   * @returns 找到的节点，如果不存在则返回 undefined
   */
  static findNodeByPath(root: DiffNode, targetPath: string[]): DiffNode | undefined {
    // 检查当前节点
    if (this.pathsEqual(root.path, targetPath)) {
      return root;
    }
    
    // 递归查找子节点
    if (root.children) {
      for (const child of root.children) {
        const found = this.findNodeByPath(child, targetPath);
        if (found) {
          return found;
        }
      }
    }
    
    return undefined;
  }
  
  /**
   * 比较两个路径是否相等
   * @param path1 路径1
   * @param path2 路径2
   * @returns 是否相等
   */
  private static pathsEqual(path1: string[], path2: string[]): boolean {
    if (path1.length !== path2.length) {
      return false;
    }
    
    for (let i = 0; i < path1.length; i++) {
      if (path1[i] !== path2[i]) {
        return false;
      }
    }
    
    return true;
  }
}
