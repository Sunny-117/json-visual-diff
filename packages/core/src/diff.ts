import { DiffType, ValueType, DiffNode, DiffResult, DiffOptions } from './types.js';
import { TypeNormalizer } from './normalizer.js';
import { LCSArrayDiff } from './lcs.js';

/**
 * 核心 Diff 引擎类
 * 负责计算两个值之间的差异
 */
export class DiffEngine {
  private options: Required<DiffOptions>;
  private circularRefs: WeakSet<object>;
  private currentDepth: number;
  
  constructor(options?: DiffOptions) {
    this.options = {
      maxDepth: options?.maxDepth ?? Infinity,
      ignoreKeys: options?.ignoreKeys ?? [],
      arrayDiffMode: options?.arrayDiffMode ?? 'lcs',
      detectCircular: options?.detectCircular ?? true,
    };
    this.circularRefs = new WeakSet();
    this.currentDepth = 0;
  }
  
  /**
   * 计算两个值的差异
   * @param oldValue 旧值
   * @param newValue 新值
   * @param path 当前路径
   * @returns DiffNode 差异节点
   */
  diff(oldValue: any, newValue: any, path: string[] = []): DiffNode {
    // 检测循环引用
    if (this.options.detectCircular) {
      if (this.isCircular(oldValue) || this.isCircular(newValue)) {
        return this.createCircularNode(path, oldValue, newValue);
      }
    }
    
    // 检查深度限制
    if (path.length >= this.options.maxDepth) {
      return this.createMaxDepthNode(path, oldValue, newValue);
    }
    
    // 标记对象为已访问（用于循环引用检测）
    if (this.options.detectCircular) {
      if (oldValue && typeof oldValue === 'object') {
        this.circularRefs.add(oldValue);
      }
      if (newValue && typeof newValue === 'object') {
        this.circularRefs.add(newValue);
      }
    }
    
    // 规范化类型
    const oldType = TypeNormalizer.getValueType(oldValue);
    const newType = TypeNormalizer.getValueType(newValue);
    
    // 类型不同，直接标记为修改
    if (oldType !== newType) {
      return this.createModifiedNode(path, oldValue, newValue, oldType, newType);
    }
    
    // 根据类型选择比较策略
    switch (oldType) {
      case ValueType.PRIMITIVE:
      case ValueType.NULL:
      case ValueType.UNDEFINED:
        return this.diffPrimitive(oldValue, newValue, path, oldType);
      case ValueType.OBJECT:
        return this.diffObject(oldValue, newValue, path);
      case ValueType.ARRAY:
        return this.diffArray(oldValue, newValue, path);
      case ValueType.FUNCTION:
        return this.diffFunction(oldValue, newValue, path);
      case ValueType.DATE:
        return this.diffDate(oldValue, newValue, path);
      case ValueType.REGEXP:
        return this.diffRegExp(oldValue, newValue, path);
      case ValueType.SYMBOL:
        return this.diffSymbol(oldValue, newValue, path);
      default:
        throw new Error(`Unsupported type: ${oldType}`);
    }
  }
  
  /**
   * 检测循环引用
   * @param value 要检测的值
   * @returns 是否存在循环引用
   */
  private isCircular(value: any): boolean {
    if (!value || typeof value !== 'object') {
      return false;
    }
    return this.circularRefs.has(value);
  }
  
  /**
   * 创建循环引用节点
   * @param path 路径
   * @param oldValue 旧值
   * @param newValue 新值
   * @returns DiffNode
   */
  private createCircularNode(path: string[], oldValue: any, newValue: any): DiffNode {
    return {
      type: DiffType.MODIFIED,
      path,
      valueType: ValueType.OBJECT,
      oldValue: '[Circular Reference]',
      newValue: '[Circular Reference]',
    };
  }
  
  /**
   * 创建达到最大深度的节点
   * @param path 路径
   * @param oldValue 旧值
   * @param newValue 新值
   * @returns DiffNode
   */
  private createMaxDepthNode(path: string[], oldValue: any, newValue: any): DiffNode {
    const type = oldValue === newValue ? DiffType.UNCHANGED : DiffType.MODIFIED;
    return {
      type,
      path,
      valueType: TypeNormalizer.getValueType(oldValue),
      oldValue: '[Max Depth Reached]',
      newValue: '[Max Depth Reached]',
    };
  }
  
  /**
   * 创建修改节点（类型不同时）
   * @param path 路径
   * @param oldValue 旧值
   * @param newValue 新值
   * @param oldType 旧类型
   * @param newType 新类型
   * @returns DiffNode
   */
  private createModifiedNode(
    path: string[],
    oldValue: any,
    newValue: any,
    oldType: ValueType,
    newType: ValueType
  ): DiffNode {
    return {
      type: DiffType.MODIFIED,
      path,
      valueType: oldType, // 使用旧类型
      oldValue,
      newValue,
    };
  }
  
  /**
   * 比较原始类型
   * @param oldValue 旧值
   * @param newValue 新值
   * @param path 路径
   * @param valueType 值类型
   * @returns DiffNode
   */
  private diffPrimitive(
    oldValue: any,
    newValue: any,
    path: string[],
    valueType: ValueType
  ): DiffNode {
    if (oldValue === newValue) {
      return {
        type: DiffType.UNCHANGED,
        path,
        valueType,
        oldValue,
        newValue,
      };
    }
    return {
      type: DiffType.MODIFIED,
      path,
      valueType,
      oldValue,
      newValue,
    };
  }
  
  /**
   * 比较对象
   * @param oldValue 旧对象
   * @param newValue 新对象
   * @param path 路径
   * @returns DiffNode
   */
  private diffObject(oldValue: any, newValue: any, path: string[]): DiffNode {
    const children: DiffNode[] = [];
    const oldKeys = Object.keys(oldValue);
    const newKeys = Object.keys(newValue);
    const allKeys = new Set([...oldKeys, ...newKeys]);
    
    // 遍历所有键
    for (const key of allKeys) {
      // 检查是否在忽略列表中
      if (this.options.ignoreKeys.includes(key)) {
        continue;
      }
      
      const hasOld = key in oldValue;
      const hasNew = key in newValue;
      
      if (hasOld && hasNew) {
        // 键在两个对象中都存在，递归比较
        const childDiff = this.diff(oldValue[key], newValue[key], [...path, key]);
        children.push(childDiff);
      } else if (hasOld && !hasNew) {
        // 键被删除
        children.push({
          type: DiffType.DELETED,
          path: [...path, key],
          valueType: TypeNormalizer.getValueType(oldValue[key]),
          oldValue: oldValue[key],
        });
      } else if (!hasOld && hasNew) {
        // 键被添加
        children.push({
          type: DiffType.ADDED,
          path: [...path, key],
          valueType: TypeNormalizer.getValueType(newValue[key]),
          newValue: newValue[key],
        });
      }
    }
    
    // 判断对象整体的差异类型
    const hasChanges = children.some(child => child.type !== DiffType.UNCHANGED);
    const type = hasChanges ? DiffType.MODIFIED : DiffType.UNCHANGED;
    
    return {
      type,
      path,
      valueType: ValueType.OBJECT,
      oldValue,
      newValue,
      children,
    };
  }
  
  /**
   * 比较数组
   * @param oldValue 旧数组
   * @param newValue 新数组
   * @param path 路径
   * @returns DiffNode
   */
  private diffArray(oldValue: any[], newValue: any[], path: string[]): DiffNode {
    const children: DiffNode[] = [];
    
    if (this.options.arrayDiffMode === 'lcs') {
      // 使用 LCS 算法进行智能比较
      const ops = LCSArrayDiff.diff(oldValue, newValue);
      let oldIndex = 0;
      let newIndex = 0;
      
      for (const op of ops) {
        switch (op.type) {
          case 'keep':
            // 元素保持不变，递归比较
            const childDiff = this.diff(
              oldValue[oldIndex],
              newValue[newIndex],
              [...path, String(newIndex)]
            );
            children.push(childDiff);
            oldIndex++;
            newIndex++;
            break;
          case 'add':
            // 元素被添加
            children.push({
              type: DiffType.ADDED,
              path: [...path, String(newIndex)],
              valueType: TypeNormalizer.getValueType(newValue[newIndex]),
              newValue: newValue[newIndex],
            });
            newIndex++;
            break;
          case 'delete':
            // 元素被删除
            children.push({
              type: DiffType.DELETED,
              path: [...path, String(oldIndex)],
              valueType: TypeNormalizer.getValueType(oldValue[oldIndex]),
              oldValue: oldValue[oldIndex],
            });
            oldIndex++;
            break;
          case 'modify':
            // 元素被修改
            children.push({
              type: DiffType.MODIFIED,
              path: [...path, String(newIndex)],
              valueType: TypeNormalizer.getValueType(oldValue[oldIndex]),
              oldValue: oldValue[oldIndex],
              newValue: newValue[newIndex],
            });
            oldIndex++;
            newIndex++;
            break;
        }
      }
    } else {
      // 位置比较模式：按索引逐个比较
      const maxLength = Math.max(oldValue.length, newValue.length);
      for (let i = 0; i < maxLength; i++) {
        const hasOld = i < oldValue.length;
        const hasNew = i < newValue.length;
        
        if (hasOld && hasNew) {
          const childDiff = this.diff(oldValue[i], newValue[i], [...path, String(i)]);
          children.push(childDiff);
        } else if (hasOld && !hasNew) {
          children.push({
            type: DiffType.DELETED,
            path: [...path, String(i)],
            valueType: TypeNormalizer.getValueType(oldValue[i]),
            oldValue: oldValue[i],
          });
        } else if (!hasOld && hasNew) {
          children.push({
            type: DiffType.ADDED,
            path: [...path, String(i)],
            valueType: TypeNormalizer.getValueType(newValue[i]),
            newValue: newValue[i],
          });
        }
      }
    }
    
    // 判断数组整体的差异类型
    const hasChanges = children.some(child => child.type !== DiffType.UNCHANGED);
    const type = hasChanges ? DiffType.MODIFIED : DiffType.UNCHANGED;
    
    return {
      type,
      path,
      valueType: ValueType.ARRAY,
      oldValue,
      newValue,
      children,
    };
  }
  
  /**
   * 比较函数
   * @param oldValue 旧函数
   * @param newValue 新函数
   * @param path 路径
   * @returns DiffNode
   */
  private diffFunction(oldValue: Function, newValue: Function, path: string[]): DiffNode {
    const oldNormalized = TypeNormalizer.normalizeFunction(oldValue);
    const newNormalized = TypeNormalizer.normalizeFunction(newValue);
    
    if (oldNormalized === newNormalized) {
      return {
        type: DiffType.UNCHANGED,
        path,
        valueType: ValueType.FUNCTION,
        oldValue,
        newValue,
      };
    }
    return {
      type: DiffType.MODIFIED,
      path,
      valueType: ValueType.FUNCTION,
      oldValue,
      newValue,
    };
  }
  
  /**
   * 比较 Date 对象
   * @param oldValue 旧 Date
   * @param newValue 新 Date
   * @param path 路径
   * @returns DiffNode
   */
  private diffDate(oldValue: Date, newValue: Date, path: string[]): DiffNode {
    const oldTime = TypeNormalizer.normalizeDate(oldValue);
    const newTime = TypeNormalizer.normalizeDate(newValue);
    
    if (oldTime === newTime) {
      return {
        type: DiffType.UNCHANGED,
        path,
        valueType: ValueType.DATE,
        oldValue,
        newValue,
      };
    }
    return {
      type: DiffType.MODIFIED,
      path,
      valueType: ValueType.DATE,
      oldValue,
      newValue,
    };
  }
  
  /**
   * 比较 RegExp 对象
   * @param oldValue 旧 RegExp
   * @param newValue 新 RegExp
   * @param path 路径
   * @returns DiffNode
   */
  private diffRegExp(oldValue: RegExp, newValue: RegExp, path: string[]): DiffNode {
    const oldNormalized = TypeNormalizer.normalizeRegExp(oldValue);
    const newNormalized = TypeNormalizer.normalizeRegExp(newValue);
    
    if (oldNormalized === newNormalized) {
      return {
        type: DiffType.UNCHANGED,
        path,
        valueType: ValueType.REGEXP,
        oldValue,
        newValue,
      };
    }
    return {
      type: DiffType.MODIFIED,
      path,
      valueType: ValueType.REGEXP,
      oldValue,
      newValue,
    };
  }
  
  /**
   * 比较 Symbol
   * @param oldValue 旧 Symbol
   * @param newValue 新 Symbol
   * @param path 路径
   * @returns DiffNode
   */
  private diffSymbol(oldValue: Symbol, newValue: Symbol, path: string[]): DiffNode {
    const oldNormalized = TypeNormalizer.normalizeSymbol(oldValue);
    const newNormalized = TypeNormalizer.normalizeSymbol(newValue);
    
    if (oldNormalized === newNormalized) {
      return {
        type: DiffType.UNCHANGED,
        path,
        valueType: ValueType.SYMBOL,
        oldValue,
        newValue,
      };
    }
    return {
      type: DiffType.MODIFIED,
      path,
      valueType: ValueType.SYMBOL,
      oldValue,
      newValue,
    };
  }
  
  /**
   * 计算完整的 diff 结果（包含统计信息）
   * @param oldValue 旧值
   * @param newValue 新值
   * @returns DiffResult
   */
  compute(oldValue: any, newValue: any): DiffResult {
    // 重置循环引用检测
    this.circularRefs = new WeakSet();
    this.currentDepth = 0;
    
    // 计算 diff
    const root = this.diff(oldValue, newValue);
    
    // 计算统计信息
    const stats = this.computeStats(root);
    
    return {
      root,
      stats,
    };
  }
  
  /**
   * 计算统计信息
   * @param node 根节点
   * @returns 统计信息
   */
  private computeStats(node: DiffNode): {
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
    
    const traverse = (n: DiffNode) => {
      // 统计当前节点
      switch (n.type) {
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
      if (n.children) {
        for (const child of n.children) {
          traverse(child);
        }
      }
    };
    
    traverse(node);
    
    return stats;
  }
}

/**
 * 便捷函数：计算两个值的差异
 * @param oldValue 旧值
 * @param newValue 新值
 * @param options 配置选项
 * @returns DiffResult
 */
export function diff(oldValue: any, newValue: any, options?: DiffOptions): DiffResult {
  const engine = new DiffEngine(options);
  return engine.compute(oldValue, newValue);
}
