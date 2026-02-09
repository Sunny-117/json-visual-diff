import { describe, it } from "vitest";
import fc from "fast-check";
import { LCSArrayDiff } from "./lcs";

/**
 * 属性测试：数组差异识别
 * Feature: json-visual-diff, Property 4: 数组差异识别
 * Validates: Requirements 1.4
 */
describe("LCS 数组 Diff 算法 - 属性测试", () => {
  it("Property 4: 数组差异识别 - 对于任意包含数组的对象，当数组元素发生增加、删除或修改时，diff 结果应该正确识别这些变化类型", () => {
    // Feature: json-visual-diff, Property 4: 数组差异识别

    fc.assert(
      fc.property(fc.array(fc.anything()), fc.array(fc.anything()), (arr1, arr2) => {
        const ops = LCSArrayDiff.diff(arr1, arr2);

        // 属性 1: 操作序列应该能够将 arr1 转换为 arr2
        const result = applyOps(arr1, ops);

        // 验证结果数组长度与 arr2 相同
        if (result.length !== arr2.length) {
          return false;
        }

        // 验证结果数组内容与 arr2 相同
        for (let i = 0; i < arr2.length; i++) {
          if (!LCSArrayDiff.isEqual(result[i], arr2[i])) {
            return false;
          }
        }

        // 属性 2: 操作类型应该只包含 add, delete, keep, modify
        const validTypes = ["add", "delete", "keep", "modify"];
        const allTypesValid = ops.every((op) => validTypes.includes(op.type));

        if (!allTypesValid) {
          return false;
        }

        // 属性 3: keep 操作应该对应相等的元素
        const keepOps = ops.filter((op) => op.type === "keep");
        const allKeepsValid = keepOps.every((op) => {
          // keep 操作的值应该在两个数组中都存在
          return (
            arr1.some((item) => LCSArrayDiff.isEqual(item, op.value)) &&
            arr2.some((item) => LCSArrayDiff.isEqual(item, op.value))
          );
        });

        return allKeepsValid;
      }),
      { numRuns: 100 },
    );
  });

  it("Property 4.1: LCS 长度不应超过较短数组的长度", () => {
    fc.assert(
      fc.property(fc.array(fc.anything()), fc.array(fc.anything()), (arr1, arr2) => {
        const dp = LCSArrayDiff.computeLCS(arr1, arr2);
        const lcsLength = dp[arr1.length][arr2.length];
        const minLength = Math.min(arr1.length, arr2.length);

        return lcsLength <= minLength;
      }),
      { numRuns: 100 },
    );
  });

  it("Property 4.2: 相同数组的 diff 应该只包含 keep 操作", () => {
    fc.assert(
      fc.property(fc.array(fc.anything()), (arr) => {
        const ops = LCSArrayDiff.diff(arr, arr);

        // 所有操作都应该是 keep
        return ops.every((op) => op.type === "keep") && ops.length === arr.length;
      }),
      { numRuns: 100 },
    );
  });

  it("Property 4.3: 空数组与任意数组的 diff 应该只包含 add 或 delete 操作", () => {
    fc.assert(
      fc.property(fc.array(fc.anything()), (arr) => {
        // 空数组 -> arr 应该只有 add 操作
        const ops1 = LCSArrayDiff.diff([], arr);
        const allAdds = ops1.every((op) => op.type === "add");

        // arr -> 空数组 应该只有 delete 操作
        const ops2 = LCSArrayDiff.diff(arr, []);
        const allDeletes = ops2.every((op) => op.type === "delete");

        return allAdds && allDeletes;
      }),
      { numRuns: 100 },
    );
  });

  it("Property 4.4: isEqual 应该是对称的", () => {
    fc.assert(
      fc.property(fc.anything(), fc.anything(), (a, b) => {
        return LCSArrayDiff.isEqual(a, b) === LCSArrayDiff.isEqual(b, a);
      }),
      { numRuns: 100 },
    );
  });

  it("Property 4.5: isEqual 应该是自反的", () => {
    fc.assert(
      fc.property(fc.anything(), (a) => {
        return LCSArrayDiff.isEqual(a, a);
      }),
      { numRuns: 100 },
    );
  });
});

/**
 * 辅助函数：应用操作序列到数组
 * 这个函数模拟如何使用 diff 操作序列将 arr1 转换为 arr2
 */
function applyOps(arr1: any[], ops: any[]): any[] {
  const result: any[] = [];

  for (const op of ops) {
    if (op.type === "keep" || op.type === "add") {
      result.push(op.value);
    } else if (op.type === "modify") {
      // modify 操作使用新值
      result.push(op.newValue);
    }
    // delete 操作不添加到结果中
  }

  return result;
}
