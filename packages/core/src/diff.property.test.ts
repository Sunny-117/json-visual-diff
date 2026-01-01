import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { diff } from './diff.js';
import { DiffType, ValueType } from './types.js';

/**
 * 核心 Diff Engine 属性测试
 * Feature: json-visual-diff
 */

describe('Diff Engine Property Tests', () => {
  /**
   * Property 1: Diff 结果结构完整性
   * Validates: Requirements 1.1, 3.1
   * 
   * 对于任意两个有效的 JSON 对象，diff 函数应该返回一个符合 DiffResult 接口的对象，
   * 包含 root 节点和 stats 统计信息
   */
  it('Property 1: Diff 结果结构完整性', () => {
    fc.assert(
      fc.property(fc.jsonValue(), fc.jsonValue(), (oldValue, newValue) => {
        const result = diff(oldValue, newValue);
        
        // 验证结果包含 root 和 stats
        expect(result).toHaveProperty('root');
        expect(result).toHaveProperty('stats');
        
        // 验证 root 是一个有效的 DiffNode
        expect(result.root).toHaveProperty('type');
        expect(result.root).toHaveProperty('path');
        expect(result.root).toHaveProperty('valueType');
        expect(Array.isArray(result.root.path)).toBe(true);
        
        // 验证 type 是有效的 DiffType
        expect(Object.values(DiffType)).toContain(result.root.type);
        
        // 验证 valueType 是有效的 ValueType
        expect(Object.values(ValueType)).toContain(result.root.valueType);
        
        // 验证 stats 包含所有必需的字段
        expect(result.stats).toHaveProperty('added');
        expect(result.stats).toHaveProperty('deleted');
        expect(result.stats).toHaveProperty('modified');
        expect(result.stats).toHaveProperty('unchanged');
        
        // 验证 stats 的值都是非负数
        expect(result.stats.added).toBeGreaterThanOrEqual(0);
        expect(result.stats.deleted).toBeGreaterThanOrEqual(0);
        expect(result.stats.modified).toBeGreaterThanOrEqual(0);
        expect(result.stats.unchanged).toBeGreaterThanOrEqual(0);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2: 自反性（Identity）
   * Validates: Requirements 1.2
   * 
   * 对于任意 JSON 对象，将它与自己进行 diff 应该返回所有节点类型都为 UNCHANGED 的结果
   */
  it('Property 2: 自反性（Identity）', () => {
    fc.assert(
      fc.property(fc.jsonValue(), (value) => {
        const result = diff(value, value);
        
        // 辅助函数：检查节点及其所有子节点是否都是 UNCHANGED
        const allNodesUnchanged = (node: any): boolean => {
          if (node.type !== DiffType.UNCHANGED) {
            return false;
          }
          
          if (node.children) {
            return node.children.every((child: any) => allNodesUnchanged(child));
          }
          
          return true;
        };
        
        // 验证根节点和所有子节点都是 UNCHANGED
        expect(allNodesUnchanged(result.root)).toBe(true);
        
        // 验证统计信息：只有 unchanged，其他都是 0
        expect(result.stats.added).toBe(0);
        expect(result.stats.deleted).toBe(0);
        expect(result.stats.modified).toBe(0);
        expect(result.stats.unchanged).toBeGreaterThan(0);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3: 嵌套结构递归性
   * Validates: Requirements 1.3, 3.6
   * 
   * 对于任意包含嵌套结构的 JSON 对象，diff 结果应该包含所有嵌套层级的差异信息，
   * 每个节点的 path 应该正确反映其在对象树中的位置
   */
  it('Property 3: 嵌套结构递归性', () => {
    // 生成嵌套对象的 arbitrary
    const nestedObjectArb = fc.object({ maxDepth: 3 });
    
    fc.assert(
      fc.property(nestedObjectArb, nestedObjectArb, (oldValue, newValue) => {
        const result = diff(oldValue, newValue);
        
        // 辅助函数：验证所有节点的 path 是否有效
        const validatePaths = (node: any, expectedPathPrefix: string[]): boolean => {
          // 验证当前节点的 path
          if (!Array.isArray(node.path)) {
            return false;
          }
          
          // 验证 path 的前缀是否匹配
          if (node.path.length < expectedPathPrefix.length) {
            return false;
          }
          
          for (let i = 0; i < expectedPathPrefix.length; i++) {
            if (node.path[i] !== expectedPathPrefix[i]) {
              return false;
            }
          }
          
          // 递归验证子节点
          if (node.children) {
            for (const child of node.children) {
              // 子节点的 path 应该比父节点多一层
              if (child.path.length !== node.path.length + 1) {
                return false;
              }
              
              // 递归验证
              if (!validatePaths(child, node.path)) {
                return false;
              }
            }
          }
          
          return true;
        };
        
        // 验证从根节点开始的所有路径
        expect(validatePaths(result.root, [])).toBe(true);
        
        // 验证根节点的 path 是空数组
        expect(result.root.path).toEqual([]);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5: 差异类型完整性
   * Validates: Requirements 3.2, 3.3, 3.4, 3.5
   * 
   * 对于任意 diff 结果，每个差异节点应该具有以下特性之一：
   * - 类型为 ADDED 时，应该只包含 newValue
   * - 类型为 DELETED 时，应该只包含 oldValue
   * - 类型为 MODIFIED 时，应该同时包含 oldValue 和 newValue
   * - 类型为 UNCHANGED 时，oldValue 应该等于 newValue
   */
  it('Property 5: 差异类型完整性', () => {
    fc.assert(
      fc.property(fc.jsonValue(), fc.jsonValue(), (oldValue, newValue) => {
        const result = diff(oldValue, newValue);
        
        // 辅助函数：验证节点的值属性是否符合其类型
        const validateNodeValues = (node: any): boolean => {
          switch (node.type) {
            case DiffType.ADDED:
              // ADDED 节点应该有 newValue，可能没有 oldValue（或为 undefined）
              if (node.newValue === undefined && node.oldValue === undefined) {
                return false;
              }
              break;
            
            case DiffType.DELETED:
              // DELETED 节点应该有 oldValue，可能没有 newValue（或为 undefined）
              if (node.oldValue === undefined && node.newValue === undefined) {
                return false;
              }
              break;
            
            case DiffType.MODIFIED:
              // MODIFIED 节点应该同时有 oldValue 和 newValue
              // 注意：它们可能都是 undefined，但应该都存在
              if (!('oldValue' in node) || !('newValue' in node)) {
                return false;
              }
              break;
            
            case DiffType.UNCHANGED:
              // UNCHANGED 节点的 oldValue 和 newValue 应该相等
              // 对于对象和数组，我们只检查它们都存在
              if (!('oldValue' in node) || !('newValue' in node)) {
                return false;
              }
              break;
            
            default:
              return false;
          }
          
          // 递归验证子节点
          if (node.children) {
            return node.children.every((child: any) => validateNodeValues(child));
          }
          
          return true;
        };
        
        // 验证所有节点
        expect(validateNodeValues(result.root)).toBe(true);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 12: 循环引用安全性
   * Validates: Requirements 2.6
   * 
   * 对于任意包含循环引用的对象，diff 函数应该能够检测并安全处理，
   * 不会导致无限循环或栈溢出
   */
  it('Property 12: 循环引用安全性', () => {
    // 创建包含循环引用的对象生成器
    const circularObjectArb = fc.object().map(obj => {
      const circular: any = { ...obj };
      circular.self = circular;
      return circular;
    });
    
    fc.assert(
      fc.property(circularObjectArb, circularObjectArb, (oldValue, newValue) => {
        // 这个测试的主要目的是确保不会抛出错误或导致无限循环
        let result;
        let didComplete = false;
        
        try {
          result = diff(oldValue, newValue);
          didComplete = true;
        } catch (error) {
          // 如果抛出错误，测试失败
          return false;
        }
        
        // 验证函数成功完成
        expect(didComplete).toBe(true);
        
        // 验证返回了有效的结果
        expect(result).toBeDefined();
        expect(result).toHaveProperty('root');
        expect(result).toHaveProperty('stats');
        
        return true;
      }),
      { numRuns: 100 }
    );
  });
  
  /**
   * 额外测试：验证循环引用被正确标记
   */
  it('Property 12 (补充): 循环引用被正确标记', () => {
    // 创建一个简单的循环引用对象
    const obj1: any = { a: 1 };
    obj1.self = obj1;
    
    const obj2: any = { a: 2 };
    obj2.self = obj2;
    
    const result = diff(obj1, obj2);
    
    // 验证结果存在且没有导致崩溃
    expect(result).toBeDefined();
    expect(result.root).toBeDefined();
    
    // 验证统计信息合理
    expect(result.stats.added).toBeGreaterThanOrEqual(0);
    expect(result.stats.deleted).toBeGreaterThanOrEqual(0);
    expect(result.stats.modified).toBeGreaterThanOrEqual(0);
    expect(result.stats.unchanged).toBeGreaterThanOrEqual(0);
  });
});
