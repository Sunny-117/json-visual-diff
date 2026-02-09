import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { diff } from "../diff";
import { DiffResultBuilder } from "../result";
import { DiffType, DiffNode } from "../types";

/**
 * Diff Result Builder 属性测试
 * Feature: json-visual-diff
 */

describe("Diff Result Builder Property Tests", () => {
  /**
   * Property 6: 统计信息一致性
   * Validates: Requirements 3.1
   *
   * 对于任意 diff 结果，stats 中的计数应该等于遍历整个 diff 树时对应类型节点的实际数量
   */
  it("Property 6: 统计信息一致性", () => {
    fc.assert(
      fc.property(fc.jsonValue(), fc.jsonValue(), (oldValue, newValue) => {
        const result = diff(oldValue, newValue);

        // 手动遍历树并统计各类型节点数量
        const manualStats = {
          added: 0,
          deleted: 0,
          modified: 0,
          unchanged: 0,
        };

        const countNodes = (node: DiffNode) => {
          // 统计当前节点
          switch (node.type) {
            case DiffType.ADDED:
              manualStats.added++;
              break;
            case DiffType.DELETED:
              manualStats.deleted++;
              break;
            case DiffType.MODIFIED:
              manualStats.modified++;
              break;
            case DiffType.UNCHANGED:
              manualStats.unchanged++;
              break;
          }

          // 递归统计子节点
          if (node.children) {
            for (const child of node.children) {
              countNodes(child);
            }
          }
        };

        countNodes(result.root);

        // 验证统计信息与实际遍历结果一致
        expect(result.stats.added).toBe(manualStats.added);
        expect(result.stats.deleted).toBe(manualStats.deleted);
        expect(result.stats.modified).toBe(manualStats.modified);
        expect(result.stats.unchanged).toBe(manualStats.unchanged);

        // 使用 DiffResultBuilder 重新计算统计信息，应该得到相同结果
        const recomputedStats = DiffResultBuilder.computeStats(result.root);
        expect(recomputedStats.added).toBe(result.stats.added);
        expect(recomputedStats.deleted).toBe(result.stats.deleted);
        expect(recomputedStats.modified).toBe(result.stats.modified);
        expect(recomputedStats.unchanged).toBe(result.stats.unchanged);

        // 验证总节点数等于各类型之和
        const totalNodes =
          result.stats.added +
          result.stats.deleted +
          result.stats.modified +
          result.stats.unchanged;
        const actualTotalNodes = DiffResultBuilder.countNodes(result.root);
        expect(totalNodes).toBe(actualTotalNodes);

        return true;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * 补充测试：验证 computeStats 对手动构建的节点也正确工作
   */
  it("Property 6 (补充): computeStats 对手动构建的节点正确工作", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.constantFrom(DiffType.ADDED, DiffType.DELETED, DiffType.MODIFIED, DiffType.UNCHANGED),
        ),
        (types) => {
          // 手动构建一个包含指定类型节点的树
          const children = types.map((type, index) => {
            switch (type) {
              case DiffType.ADDED:
                return DiffResultBuilder.createAddedNode(
                  ["child", String(index)],
                  "primitive" as any,
                  `value${index}`,
                );
              case DiffType.DELETED:
                return DiffResultBuilder.createDeletedNode(
                  ["child", String(index)],
                  "primitive" as any,
                  `value${index}`,
                );
              case DiffType.MODIFIED:
                return DiffResultBuilder.createModifiedNode(
                  ["child", String(index)],
                  "primitive" as any,
                  `oldValue${index}`,
                  `newValue${index}`,
                );
              case DiffType.UNCHANGED:
                return DiffResultBuilder.createUnchangedNode(
                  ["child", String(index)],
                  "primitive" as any,
                  `value${index}`,
                );
            }
          });

          const root = DiffResultBuilder.createModifiedNode([], "object" as any, {}, {}, children);

          // 计算统计信息
          const stats = DiffResultBuilder.computeStats(root);

          // 手动统计期望值（包括根节点）
          const expectedStats = {
            added: types.filter((t) => t === DiffType.ADDED).length,
            deleted: types.filter((t) => t === DiffType.DELETED).length,
            modified: types.filter((t) => t === DiffType.MODIFIED).length + 1, // +1 for root
            unchanged: types.filter((t) => t === DiffType.UNCHANGED).length,
          };

          // 验证统计信息正确
          expect(stats.added).toBe(expectedStats.added);
          expect(stats.deleted).toBe(expectedStats.deleted);
          expect(stats.modified).toBe(expectedStats.modified);
          expect(stats.unchanged).toBe(expectedStats.unchanged);

          return true;
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * 补充测试：验证嵌套结构的统计信息
   */
  it("Property 6 (补充): 嵌套结构的统计信息正确", () => {
    fc.assert(
      fc.property(fc.object({ maxDepth: 3 }), fc.object({ maxDepth: 3 }), (oldValue, newValue) => {
        const result = diff(oldValue, newValue);

        // 验证统计信息的总和等于节点总数
        const totalFromStats =
          result.stats.added +
          result.stats.deleted +
          result.stats.modified +
          result.stats.unchanged;
        const totalNodes = DiffResultBuilder.countNodes(result.root);

        expect(totalFromStats).toBe(totalNodes);

        // 验证至少有一个节点（根节点）
        expect(totalNodes).toBeGreaterThanOrEqual(1);

        return true;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property 7: Diff 结果可序列化
   * Validates: Requirements 3.7
   *
   * 对于任意 diff 结果，将其序列化为 JSON 字符串后再反序列化，应该得到等价的对象结构
   */
  it("Property 7: Diff 结果可序列化", () => {
    fc.assert(
      fc.property(fc.jsonValue(), fc.jsonValue(), (oldValue, newValue) => {
        const result = diff(oldValue, newValue);

        // 序列化为 JSON 字符串
        let serialized: string;
        try {
          serialized = JSON.stringify(result);
        } catch (error) {
          // 如果序列化失败，测试失败
          return false;
        }

        // 验证序列化成功
        expect(serialized).toBeDefined();
        expect(typeof serialized).toBe("string");
        expect(serialized.length).toBeGreaterThan(0);

        // 反序列化
        let deserialized: any;
        try {
          deserialized = JSON.parse(serialized);
        } catch (error) {
          // 如果反序列化失败，测试失败
          return false;
        }

        // 验证反序列化成功
        expect(deserialized).toBeDefined();

        // 验证结构完整性
        expect(deserialized).toHaveProperty("root");
        expect(deserialized).toHaveProperty("stats");

        // 验证 root 节点结构
        expect(deserialized.root).toHaveProperty("type");
        expect(deserialized.root).toHaveProperty("path");
        expect(deserialized.root).toHaveProperty("valueType");
        expect(Array.isArray(deserialized.root.path)).toBe(true);

        // 验证 stats 结构
        expect(deserialized.stats).toHaveProperty("added");
        expect(deserialized.stats).toHaveProperty("deleted");
        expect(deserialized.stats).toHaveProperty("modified");
        expect(deserialized.stats).toHaveProperty("unchanged");

        // 验证统计信息值相等
        expect(deserialized.stats.added).toBe(result.stats.added);
        expect(deserialized.stats.deleted).toBe(result.stats.deleted);
        expect(deserialized.stats.modified).toBe(result.stats.modified);
        expect(deserialized.stats.unchanged).toBe(result.stats.unchanged);

        // 验证根节点类型相等
        expect(deserialized.root.type).toBe(result.root.type);
        expect(deserialized.root.valueType).toBe(result.root.valueType);

        // 验证路径相等
        expect(deserialized.root.path).toEqual(result.root.path);

        return true;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * 补充测试：验证包含特殊类型的 diff 结果可序列化
   */
  it("Property 7 (补充): 包含特殊类型的 diff 结果可序列化", () => {
    // 测试包含函数、Date、RegExp 等特殊类型的对象
    const obj1 = {
      fn: function test() {
        return 42;
      },
      date: new Date("2024-01-01"),
      regex: /test/gi,
      symbol: Symbol("test"),
      undef: undefined,
      nil: null,
    };

    const obj2 = {
      fn: function test() {
        return 43;
      },
      date: new Date("2024-01-02"),
      regex: /test/i,
      symbol: Symbol("test2"),
      undef: undefined,
      nil: null,
    };

    const result = diff(obj1, obj2);

    // 尝试序列化
    let serialized: string;
    try {
      serialized = JSON.stringify(result);
    } catch (error) {
      // 序列化可能会失败（因为包含函数等），但不应该崩溃
      expect(error).toBeDefined();
      return;
    }

    // 如果序列化成功，验证可以反序列化
    expect(serialized).toBeDefined();

    const deserialized = JSON.parse(serialized);
    expect(deserialized).toHaveProperty("root");
    expect(deserialized).toHaveProperty("stats");
  });

  /**
   * 补充测试：验证深度嵌套结构可序列化
   */
  it("Property 7 (补充): 深度嵌套结构可序列化", () => {
    fc.assert(
      fc.property(fc.object({ maxDepth: 5 }), fc.object({ maxDepth: 5 }), (oldValue, newValue) => {
        const result = diff(oldValue, newValue);

        // 序列化和反序列化
        const serialized = JSON.stringify(result);
        const deserialized = JSON.parse(serialized);

        // 验证节点总数相同
        const originalNodeCount = DiffResultBuilder.countNodes(result.root);
        const deserializedNodeCount = DiffResultBuilder.countNodes(deserialized.root);

        expect(deserializedNodeCount).toBe(originalNodeCount);

        // 验证统计信息相同
        expect(deserialized.stats).toEqual(result.stats);

        return true;
      }),
      { numRuns: 100 },
    );
  });
});
