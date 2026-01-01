import { describe, it, expect } from 'vitest';
import { diff, DiffEngine } from './diff.js';
import { DiffType, ValueType } from './types.js';

/**
 * 核心 Diff Engine 单元测试
 */

describe('DiffEngine', () => {
  describe('基本功能', () => {
    it('应该正确比较两个相同的原始值', () => {
      const result = diff(42, 42);
      expect(result.root.type).toBe(DiffType.UNCHANGED);
      expect(result.stats.unchanged).toBe(1);
      expect(result.stats.modified).toBe(0);
    });

    it('应该正确比较两个不同的原始值', () => {
      const result = diff(42, 43);
      expect(result.root.type).toBe(DiffType.MODIFIED);
      expect(result.root.oldValue).toBe(42);
      expect(result.root.newValue).toBe(43);
    });

    it('应该正确比较两个相同的对象', () => {
      const obj = { a: 1, b: 2 };
      const result = diff(obj, obj);
      expect(result.root.type).toBe(DiffType.UNCHANGED);
    });
  });

  describe('对象比较', () => {
    it('应该识别添加的属性', () => {
      const old = { a: 1 };
      const newObj = { a: 1, b: 2 };
      const result = diff(old, newObj);
      
      expect(result.root.type).toBe(DiffType.MODIFIED);
      expect(result.root.children).toBeDefined();
      
      const addedNode = result.root.children?.find(c => c.path[0] === 'b');
      expect(addedNode?.type).toBe(DiffType.ADDED);
      expect(addedNode?.newValue).toBe(2);
    });

    it('应该识别删除的属性', () => {
      const old = { a: 1, b: 2 };
      const newObj = { a: 1 };
      const result = diff(old, newObj);
      
      expect(result.root.type).toBe(DiffType.MODIFIED);
      
      const deletedNode = result.root.children?.find(c => c.path[0] === 'b');
      expect(deletedNode?.type).toBe(DiffType.DELETED);
      expect(deletedNode?.oldValue).toBe(2);
    });

    it('应该识别修改的属性', () => {
      const old = { a: 1, b: 2 };
      const newObj = { a: 1, b: 3 };
      const result = diff(old, newObj);
      
      expect(result.root.type).toBe(DiffType.MODIFIED);
      
      const modifiedNode = result.root.children?.find(c => c.path[0] === 'b');
      expect(modifiedNode?.type).toBe(DiffType.MODIFIED);
      expect(modifiedNode?.oldValue).toBe(2);
      expect(modifiedNode?.newValue).toBe(3);
    });
  });

  describe('数组比较', () => {
    it('应该使用 LCS 算法比较数组', () => {
      const old = [1, 2, 3];
      const newArr = [1, 3, 4];
      const result = diff(old, newArr);
      
      expect(result.root.type).toBe(DiffType.MODIFIED);
      expect(result.root.valueType).toBe(ValueType.ARRAY);
      expect(result.root.children).toBeDefined();
    });

    it('应该识别数组中添加的元素', () => {
      const old = [1, 2];
      const newArr = [1, 2, 3];
      const result = diff(old, newArr);
      
      expect(result.stats.added).toBeGreaterThan(0);
    });
  });

  describe('扩展类型', () => {
    it('应该正确比较函数', () => {
      const fn1 = function test() { return 1; };
      const fn2 = function test() { return 1; };
      const fn3 = function test() { return 2; };
      
      const result1 = diff(fn1, fn2);
      expect(result1.root.type).toBe(DiffType.UNCHANGED);
      
      const result2 = diff(fn1, fn3);
      expect(result2.root.type).toBe(DiffType.MODIFIED);
    });

    it('应该正确比较 Date 对象', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-01');
      const date3 = new Date('2024-01-02');
      
      const result1 = diff(date1, date2);
      expect(result1.root.type).toBe(DiffType.UNCHANGED);
      
      const result2 = diff(date1, date3);
      expect(result2.root.type).toBe(DiffType.MODIFIED);
    });

    it('应该正确比较 RegExp 对象', () => {
      const regex1 = /test/i;
      const regex2 = /test/i;
      const regex3 = /test/g;
      
      const result1 = diff(regex1, regex2);
      expect(result1.root.type).toBe(DiffType.UNCHANGED);
      
      const result2 = diff(regex1, regex3);
      expect(result2.root.type).toBe(DiffType.MODIFIED);
    });

    it('应该正确比较 Symbol', () => {
      const sym1 = Symbol('test');
      const sym2 = Symbol('test');
      
      const result = diff(sym1, sym2);
      expect(result.root.type).toBe(DiffType.UNCHANGED);
    });
  });

  describe('循环引用', () => {
    it('应该安全处理循环引用', () => {
      const obj1: any = { a: 1 };
      obj1.self = obj1;
      
      const obj2: any = { a: 2 };
      obj2.self = obj2;
      
      expect(() => diff(obj1, obj2)).not.toThrow();
    });
  });

  describe('配置选项', () => {
    it('应该支持 maxDepth 配置', () => {
      const deep = { a: { b: { c: { d: 1 } } } };
      const engine = new DiffEngine({ maxDepth: 2 });
      const result = engine.compute(deep, deep);
      
      expect(result).toBeDefined();
    });

    it('应该支持 ignoreKeys 配置', () => {
      const old = { a: 1, b: 2, _internal: 'old' };
      const newObj = { a: 1, b: 3, _internal: 'new' };
      const engine = new DiffEngine({ ignoreKeys: ['_internal'] });
      const result = engine.compute(old, newObj);
      
      // _internal 应该被忽略
      const internalNode = result.root.children?.find(c => c.path[0] === '_internal');
      expect(internalNode).toBeUndefined();
    });

    it('应该支持 arrayDiffMode 配置', () => {
      const old = [1, 2, 3];
      const newArr = [1, 3, 4];
      
      const lcsEngine = new DiffEngine({ arrayDiffMode: 'lcs' });
      const lcsResult = lcsEngine.compute(old, newArr);
      
      const posEngine = new DiffEngine({ arrayDiffMode: 'position' });
      const posResult = posEngine.compute(old, newArr);
      
      expect(lcsResult).toBeDefined();
      expect(posResult).toBeDefined();
    });
  });

  describe('统计信息', () => {
    it('应该正确计算统计信息', () => {
      const old = { a: 1, b: 2, c: 3 };
      const newObj = { a: 1, b: 4, d: 5 };
      const result = diff(old, newObj);
      
      expect(result.stats.unchanged).toBeGreaterThan(0); // a
      expect(result.stats.modified).toBeGreaterThan(0);  // b
      expect(result.stats.deleted).toBeGreaterThan(0);   // c
      expect(result.stats.added).toBeGreaterThan(0);     // d
    });
  });

  describe('嵌套结构', () => {
    it('应该正确处理深层嵌套', () => {
      const old = {
        user: {
          name: 'John',
          address: {
            city: 'NYC',
            zip: '10001'
          }
        }
      };
      
      const newObj = {
        user: {
          name: 'John',
          address: {
            city: 'LA',
            zip: '10001'
          }
        }
      };
      
      const result = diff(old, newObj);
      
      expect(result.root.type).toBe(DiffType.MODIFIED);
      
      // 找到 city 节点
      const findNode = (node: any, path: string[]): any => {
        if (node.path.join('.') === path.join('.')) {
          return node;
        }
        if (node.children) {
          for (const child of node.children) {
            const found = findNode(child, path);
            if (found) return found;
          }
        }
        return null;
      };
      
      const cityNode = findNode(result.root, ['user', 'address', 'city']);
      expect(cityNode).toBeDefined();
      expect(cityNode.type).toBe(DiffType.MODIFIED);
      expect(cityNode.oldValue).toBe('NYC');
      expect(cityNode.newValue).toBe('LA');
    });
  });
});
