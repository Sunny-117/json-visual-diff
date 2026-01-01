import { describe, it, expect } from 'vitest';
import { LCSArrayDiff } from './lcs.js';

describe('LCS 数组 Diff 算法', () => {
  describe('computeLCS', () => {
    it('应该处理空数组', () => {
      const arr1: number[] = [];
      const arr2: number[] = [];
      const dp = LCSArrayDiff.computeLCS(arr1, arr2);
      
      expect(dp).toHaveLength(1);
      expect(dp[0]).toHaveLength(1);
      expect(dp[0][0]).toBe(0);
    });
    
    it('应该处理一个空数组和一个非空数组', () => {
      const arr1: number[] = [];
      const arr2 = [1, 2, 3];
      const dp = LCSArrayDiff.computeLCS(arr1, arr2);
      
      expect(dp).toHaveLength(1);
      expect(dp[0]).toHaveLength(4);
      expect(dp[0][3]).toBe(0);
    });
    
    it('应该处理相同数组', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 3];
      const dp = LCSArrayDiff.computeLCS(arr1, arr2);
      
      // LCS 长度应该等于数组长度
      expect(dp[arr1.length][arr2.length]).toBe(3);
    });
    
    it('应该处理完全不同的数组', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [4, 5, 6];
      const dp = LCSArrayDiff.computeLCS(arr1, arr2);
      
      // LCS 长度应该为 0
      expect(dp[arr1.length][arr2.length]).toBe(0);
    });
    
    it('应该处理部分重叠的数组', () => {
      const arr1 = [1, 2, 3, 4];
      const arr2 = [2, 3, 5];
      const dp = LCSArrayDiff.computeLCS(arr1, arr2);
      
      // LCS 长度应该为 2 (元素 2 和 3)
      expect(dp[arr1.length][arr2.length]).toBe(2);
    });
  });
  
  describe('diff', () => {
    it('应该为空数组生成空操作序列', () => {
      const arr1: number[] = [];
      const arr2: number[] = [];
      const ops = LCSArrayDiff.diff(arr1, arr2);
      
      expect(ops).toHaveLength(0);
    });
    
    it('应该为相同数组生成 keep 操作', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 3];
      const ops = LCSArrayDiff.diff(arr1, arr2);
      
      expect(ops).toHaveLength(3);
      expect(ops.every(op => op.type === 'keep')).toBe(true);
    });
    
    it('应该为完全不同的数组生成 delete 和 add 操作', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [4, 5, 6];
      const ops = LCSArrayDiff.diff(arr1, arr2);
      
      const deleteOps = ops.filter(op => op.type === 'delete');
      const addOps = ops.filter(op => op.type === 'add');
      
      expect(deleteOps).toHaveLength(3);
      expect(addOps).toHaveLength(3);
    });
    
    it('应该为部分重叠的数组生成正确的操作序列', () => {
      const arr1 = [1, 2, 3, 4];
      const arr2 = [2, 3, 5];
      const ops = LCSArrayDiff.diff(arr1, arr2);
      
      // 应该删除 1 和 4，保留 2 和 3，添加 5
      const deleteOps = ops.filter(op => op.type === 'delete');
      const keepOps = ops.filter(op => op.type === 'keep');
      const addOps = ops.filter(op => op.type === 'add');
      
      expect(deleteOps.length).toBeGreaterThan(0);
      expect(keepOps.length).toBeGreaterThan(0);
      expect(addOps.length).toBeGreaterThan(0);
    });
  });
  
  describe('isEqual', () => {
    it('应该正确比较原始类型', () => {
      expect(LCSArrayDiff.isEqual(1, 1)).toBe(true);
      expect(LCSArrayDiff.isEqual(1, 2)).toBe(false);
      expect(LCSArrayDiff.isEqual('hello', 'hello')).toBe(true);
      expect(LCSArrayDiff.isEqual('hello', 'world')).toBe(false);
      expect(LCSArrayDiff.isEqual(true, true)).toBe(true);
      expect(LCSArrayDiff.isEqual(true, false)).toBe(false);
    });
    
    it('应该正确比较 null 和 undefined', () => {
      expect(LCSArrayDiff.isEqual(null, null)).toBe(true);
      expect(LCSArrayDiff.isEqual(undefined, undefined)).toBe(true);
      expect(LCSArrayDiff.isEqual(null, undefined)).toBe(false);
    });
    
    it('应该正确比较数组', () => {
      expect(LCSArrayDiff.isEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(LCSArrayDiff.isEqual([1, 2, 3], [1, 2, 4])).toBe(false);
      expect(LCSArrayDiff.isEqual([1, 2], [1, 2, 3])).toBe(false);
    });
    
    it('应该正确比较对象', () => {
      expect(LCSArrayDiff.isEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
      expect(LCSArrayDiff.isEqual({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
      expect(LCSArrayDiff.isEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    });
    
    it('应该正确比较 Date 对象', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-01');
      const date3 = new Date('2024-01-02');
      
      expect(LCSArrayDiff.isEqual(date1, date2)).toBe(true);
      expect(LCSArrayDiff.isEqual(date1, date3)).toBe(false);
    });
    
    it('应该正确比较 RegExp 对象', () => {
      expect(LCSArrayDiff.isEqual(/test/i, /test/i)).toBe(true);
      expect(LCSArrayDiff.isEqual(/test/i, /test/g)).toBe(false);
      expect(LCSArrayDiff.isEqual(/test/, /other/)).toBe(false);
    });
    
    it('应该正确比较函数', () => {
      const fn1 = function() { return 1; };
      const fn2 = function() { return 1; };
      const fn3 = function() { return 2; };
      
      expect(LCSArrayDiff.isEqual(fn1, fn2)).toBe(true);
      expect(LCSArrayDiff.isEqual(fn1, fn3)).toBe(false);
    });
    
    it('应该正确比较包含重复元素的数组', () => {
      const arr1 = [1, 2, 2, 3];
      const arr2 = [1, 2, 3, 3];
      
      expect(LCSArrayDiff.isEqual(arr1, arr2)).toBe(false);
    });
  });
});
