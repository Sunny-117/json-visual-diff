import { TypeNormalizer } from './normalizer.js';

/**
 * 数组 Diff 操作类型
 */
export interface ArrayDiffOp {
  type: 'add' | 'delete' | 'keep' | 'modify';
  index: number;
  value: any;
  newValue?: any;
}

/**
 * LCS（最长公共子序列）算法实现
 * 用于智能数组 diff
 */
export class LCSArrayDiff {
  /**
   * 计算两个数组的 LCS
   * 使用动态规划算法
   * @param arr1 第一个数组
   * @param arr2 第二个数组
   * @returns LCS 动态规划表
   */
  static computeLCS<T>(arr1: T[], arr2: T[]): number[][] {
    const m = arr1.length;
    const n = arr2.length;
    const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));
    
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (this.isEqual(arr1[i - 1], arr2[j - 1])) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }
    
    return dp;
  }
  
  /**
   * 从 LCS 表回溯生成 diff 操作序列
   * @param arr1 第一个数组
   * @param arr2 第二个数组
   * @param dp LCS 动态规划表
   * @param i 当前在 arr1 中的位置
   * @param j 当前在 arr2 中的位置
   * @returns diff 操作序列
   */
  static backtrack<T>(
    arr1: T[],
    arr2: T[],
    dp: number[][],
    i: number,
    j: number
  ): ArrayDiffOp[] {
    if (i === 0 && j === 0) return [];
    
    if (i === 0) {
      return [
        ...this.backtrack(arr1, arr2, dp, i, j - 1),
        { type: 'add', index: j - 1, value: arr2[j - 1] }
      ];
    }
    
    if (j === 0) {
      return [
        ...this.backtrack(arr1, arr2, dp, i - 1, j),
        { type: 'delete', index: i - 1, value: arr1[i - 1] }
      ];
    }
    
    if (this.isEqual(arr1[i - 1], arr2[j - 1])) {
      return [
        ...this.backtrack(arr1, arr2, dp, i - 1, j - 1),
        { type: 'keep', index: i - 1, value: arr1[i - 1] }
      ];
    }
    
    if (dp[i - 1][j] > dp[i][j - 1]) {
      return [
        ...this.backtrack(arr1, arr2, dp, i - 1, j),
        { type: 'delete', index: i - 1, value: arr1[i - 1] }
      ];
    } else {
      return [
        ...this.backtrack(arr1, arr2, dp, i, j - 1),
        { type: 'add', index: j - 1, value: arr2[j - 1] }
      ];
    }
  }
  
  /**
   * 深度比较两个值是否相等
   * @param a 第一个值
   * @param b 第二个值
   * @returns 是否相等
   */
  static isEqual(a: any, b: any): boolean {
    // 处理原始类型
    if (a === b) return true;
    
    // 处理 null 和 undefined
    if (a == null || b == null) return a === b;
    
    // 获取类型
    const typeA = TypeNormalizer.getValueType(a);
    const typeB = TypeNormalizer.getValueType(b);
    
    // 类型不同则不相等
    if (typeA !== typeB) return false;
    
    // 根据类型进行比较
    switch (typeA) {
      case 'function':
        return TypeNormalizer.normalizeFunction(a) === TypeNormalizer.normalizeFunction(b);
      case 'date':
        return TypeNormalizer.normalizeDate(a) === TypeNormalizer.normalizeDate(b);
      case 'regexp':
        return TypeNormalizer.normalizeRegExp(a) === TypeNormalizer.normalizeRegExp(b);
      case 'symbol':
        return TypeNormalizer.normalizeSymbol(a) === TypeNormalizer.normalizeSymbol(b);
      case 'array':
        if (a.length !== b.length) return false;
        return a.every((item: any, index: number) => this.isEqual(item, b[index]));
      case 'object':
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        if (keysA.length !== keysB.length) return false;
        return keysA.every(key => keysB.includes(key) && this.isEqual(a[key], b[key]));
      default:
        // 原始类型已经在开头处理
        return a === b;
    }
  }
  
  /**
   * 计算两个数组的 diff 操作序列
   * @param arr1 第一个数组
   * @param arr2 第二个数组
   * @returns diff 操作序列
   */
  static diff<T>(arr1: T[], arr2: T[]): ArrayDiffOp[] {
    const dp = this.computeLCS(arr1, arr2);
    return this.backtrack(arr1, arr2, dp, arr1.length, arr2.length);
  }
}
