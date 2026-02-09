/// <reference lib="dom" />
/**
 * DOM Renderer 可访问性属性测试
 * Feature: json-visual-diff, Property 17: 可访问性属性存在
 * Validates: Requirements 5.9
 */


import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { DOMRenderer } from "../renderer";
import { DiffType, ValueType } from "@json-visual-diff/core";
import type { DiffResult, DiffNode } from "@json-visual-diff/core";

describe("DOM Renderer Accessibility Property Tests", () => {
  /**
   * Property 17: 可访问性属性存在
   * 对于任意 diff 结果，DOM 渲染器生成的 HTML 应该包含适当的语义化标签和 ARIA 属性
   */
  it("Property 17: 可访问性属性存在 - 容器应该有 role 和 aria-label", () => {
    // Feature: json-visual-diff, Property 17: 可访问性属性存在

    const simpleNodeArb: fc.Arbitrary<DiffNode> = fc.record({
      type: fc.constantFrom(DiffType.ADDED, DiffType.DELETED, DiffType.MODIFIED, DiffType.UNCHANGED),
      path: fc.constant([] as string[]),
      valueType: fc.constantFrom(ValueType.PRIMITIVE, ValueType.OBJECT, ValueType.ARRAY),
      oldValue: fc.anything(),
      newValue: fc.anything(),
    });

    const diffResultArb: fc.Arbitrary<DiffResult> = fc.record({
      root: simpleNodeArb,
      stats: fc.record({
        added: fc.nat({ max: 100 }),
        deleted: fc.nat({ max: 100 }),
        modified: fc.nat({ max: 100 }),
        unchanged: fc.nat({ max: 100 }),
      }),
    });

    fc.assert(
      fc.property(diffResultArb, (diffResult) => {
        const renderer = new DOMRenderer();
        const element = renderer.render(diffResult);

        // 验证容器有 role 属性
        expect(element.getAttribute("role")).toBe("region");

        // 验证容器有 aria-label 属性
        const ariaLabel = element.getAttribute("aria-label");
        expect(ariaLabel).toBeTruthy();
        expect(typeof ariaLabel).toBe("string");

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it('Property 17: 可访问性属性存在 - 内容区域应该有 role="tree"', () => {
    // Feature: json-visual-diff, Property 17: 可访问性属性存在

    const simpleNodeArb: fc.Arbitrary<DiffNode> = fc.record({
      type: fc.constantFrom(DiffType.ADDED, DiffType.DELETED, DiffType.MODIFIED, DiffType.UNCHANGED),
      path: fc.constant([] as string[]),
      valueType: fc.constantFrom(ValueType.PRIMITIVE, ValueType.OBJECT),
      oldValue: fc.string(),
      newValue: fc.string(),
    });

    const diffResultArb: fc.Arbitrary<DiffResult> = fc.record({
      root: simpleNodeArb,
      stats: fc.record({
        added: fc.nat({ max: 10 }),
        deleted: fc.nat({ max: 10 }),
        modified: fc.nat({ max: 10 }),
        unchanged: fc.nat({ max: 10 }),
      }),
    });

    fc.assert(
      fc.property(diffResultArb, (diffResult) => {
        const renderer = new DOMRenderer();
        const element = renderer.render(diffResult);

        // 查找内容区域
        const contentElement = element.querySelector(".json-diff-content");
        expect(contentElement).toBeTruthy();

        // 验证内容区域有 role="tree"
        expect(contentElement?.getAttribute("role")).toBe("tree");

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it('Property 17: 可访问性属性存在 - 每个节点应该有 role="treeitem" 和 aria-label', () => {
    // Feature: json-visual-diff, Property 17: 可访问性属性存在

    const nodeArb: fc.Arbitrary<DiffNode> = fc.record({
      type: fc.constantFrom(DiffType.ADDED, DiffType.DELETED, DiffType.MODIFIED, DiffType.UNCHANGED),
      path: fc.array(fc.string({ minLength: 1, maxLength: 10 }), { maxLength: 5 }),
      valueType: fc.constantFrom(ValueType.PRIMITIVE, ValueType.OBJECT, ValueType.ARRAY),
      oldValue: fc.anything(),
      newValue: fc.anything(),
    });

    fc.assert(
      fc.property(nodeArb, (node) => {
        const renderer = new DOMRenderer();
        const element = renderer.renderNode(node);

        // 验证节点有 role="treeitem"
        expect(element.getAttribute("role")).toBe("treeitem");

        // 验证节点有 aria-label
        const ariaLabel = element.getAttribute("aria-label");
        expect(ariaLabel).toBeTruthy();
        expect(typeof ariaLabel).toBe("string");

        // 验证 aria-label 包含节点类型信息
        expect(ariaLabel).toMatch(/(Added|Deleted|Modified|Unchanged)/);

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it('Property 17: 可访问性属性存在 - 统计信息应该有 role="status" 和 aria-live', () => {
    // Feature: json-visual-diff, Property 17: 可访问性属性存在

    const statsArb = fc.record({
      added: fc.nat({ max: 100 }),
      deleted: fc.nat({ max: 100 }),
      modified: fc.nat({ max: 100 }),
      unchanged: fc.nat({ max: 100 }),
    });

    const diffResultArb: fc.Arbitrary<DiffResult> = fc.record({
      root: fc.record({
        type: fc.constant(DiffType.MODIFIED),
        path: fc.constant([] as string[]),
        valueType: fc.constant(ValueType.OBJECT),
      }),
      stats: statsArb,
    });

    fc.assert(
      fc.property(diffResultArb, (diffResult) => {
        const renderer = new DOMRenderer();
        const element = renderer.render(diffResult);

        // 查找统计信息元素
        const statsElement = element.querySelector(".json-diff-stats");
        expect(statsElement).toBeTruthy();

        // 验证统计信息有 role="status"
        expect(statsElement?.getAttribute("role")).toBe("status");

        // 验证统计信息有 aria-live
        const ariaLive = statsElement?.getAttribute("aria-live");
        expect(ariaLive).toBeTruthy();
        expect(ariaLive).toBe("polite");

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it("Property 17: 可访问性属性存在 - 统计项应该有 aria-label", () => {
    // Feature: json-visual-diff, Property 17: 可访问性属性存在

    const statsArb = fc.record({
      added: fc.integer({ min: 1, max: 50 }),
      deleted: fc.integer({ min: 1, max: 50 }),
      modified: fc.integer({ min: 1, max: 50 }),
      unchanged: fc.nat({ max: 50 }),
    });

    const diffResultArb: fc.Arbitrary<DiffResult> = fc.record({
      root: fc.record({
        type: fc.constant(DiffType.MODIFIED),
        path: fc.constant([] as string[]),
        valueType: fc.constant(ValueType.OBJECT),
      }),
      stats: statsArb,
    });

    fc.assert(
      fc.property(diffResultArb, (diffResult) => {
        const renderer = new DOMRenderer();
        const element = renderer.render(diffResult);

        // 查找统计信息元素
        const statsElement = element.querySelector(".json-diff-stats");
        expect(statsElement).toBeTruthy();

        // 检查添加的统计项
        if (diffResult.stats.added > 0) {
          const addedStat = statsElement?.querySelector(".stat-added");
          expect(addedStat).toBeTruthy();
          const ariaLabel = addedStat?.getAttribute("aria-label");
          expect(ariaLabel).toBeTruthy();
          expect(ariaLabel).toContain("added");
        }

        // 检查删除的统计项
        if (diffResult.stats.deleted > 0) {
          const deletedStat = statsElement?.querySelector(".stat-deleted");
          expect(deletedStat).toBeTruthy();
          const ariaLabel = deletedStat?.getAttribute("aria-label");
          expect(ariaLabel).toBeTruthy();
          expect(ariaLabel).toContain("deleted");
        }

        // 检查修改的统计项
        if (diffResult.stats.modified > 0) {
          const modifiedStat = statsElement?.querySelector(".stat-modified");
          expect(modifiedStat).toBeTruthy();
          const ariaLabel = modifiedStat?.getAttribute("aria-label");
          expect(ariaLabel).toBeTruthy();
          expect(ariaLabel).toContain("modified");
        }

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it("Property 17: 可访问性属性存在 - 展开/折叠按钮应该有 aria-expanded 和 aria-label", () => {
    // Feature: json-visual-diff, Property 17: 可访问性属性存在

    const nodeWithChildrenArb: fc.Arbitrary<DiffNode> = fc.record({
      type: fc.constantFrom(DiffType.ADDED, DiffType.DELETED, DiffType.MODIFIED),
      path: fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 3 }),
      valueType: fc.constantFrom(ValueType.OBJECT, ValueType.ARRAY),
      children: fc.array(
        fc.record({
          type: fc.constantFrom(DiffType.ADDED, DiffType.DELETED, DiffType.MODIFIED, DiffType.UNCHANGED),
          path: fc.array(fc.string({ minLength: 1, maxLength: 10 }), {
            minLength: 2,
            maxLength: 4,
          }),
          valueType: fc.constant(ValueType.PRIMITIVE),
          oldValue: fc.anything(),
          newValue: fc.anything(),
        }),
        { minLength: 1, maxLength: 3 },
      ),
    });

    fc.assert(
      fc.property(nodeWithChildrenArb, (node) => {
        const renderer = new DOMRenderer();
        const element = renderer.renderNode(node);

        // 查找展开/折叠按钮
        const toggleButton = element.querySelector(".toggle-button");

        // 如果有子节点，应该有展开/折叠按钮
        if (node.children && node.children.length > 0) {
          expect(toggleButton).toBeTruthy();

          // 验证按钮有 aria-expanded 属性
          const ariaExpanded = toggleButton?.getAttribute("aria-expanded");
          expect(ariaExpanded).toBeTruthy();
          expect(["true", "false"]).toContain(ariaExpanded);

          // 验证按钮有 aria-label
          const ariaLabel = toggleButton?.getAttribute("aria-label");
          expect(ariaLabel).toBeTruthy();
          expect(typeof ariaLabel).toBe("string");

          // 验证按钮有 tabindex
          const tabindex = toggleButton?.getAttribute("tabindex");
          expect(tabindex).toBe("0");
        }

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it('Property 17: 可访问性属性存在 - 子节点容器应该有 role="group"', () => {
    // Feature: json-visual-diff, Property 17: 可访问性属性存在

    const nodeWithChildrenArb: fc.Arbitrary<DiffNode> = fc.record({
      type: fc.constantFrom(DiffType.MODIFIED, DiffType.ADDED),
      path: fc.array(fc.string({ minLength: 1, maxLength: 10 }), { maxLength: 2 }),
      valueType: fc.constantFrom(ValueType.OBJECT, ValueType.ARRAY),
      children: fc.array(
        fc.record({
          type: fc.constantFrom(DiffType.ADDED, DiffType.DELETED, DiffType.MODIFIED, DiffType.UNCHANGED),
          path: fc.array(fc.string({ minLength: 1, maxLength: 10 }), {
            minLength: 1,
            maxLength: 3,
          }),
          valueType: fc.constant(ValueType.PRIMITIVE),
          oldValue: fc.anything(),
          newValue: fc.anything(),
        }),
        { minLength: 1, maxLength: 5 },
      ),
    });

    fc.assert(
      fc.property(nodeWithChildrenArb, (node) => {
        const renderer = new DOMRenderer({ expandDepth: 10 }); // 确保展开
        const element = renderer.renderNode(node);

        // 查找子节点容器
        const childrenContainer = element.querySelector(".children-container");

        // 如果有子节点，应该有子节点容器
        if (node.children && node.children.length > 0) {
          expect(childrenContainer).toBeTruthy();

          // 验证容器有 role="group"
          expect(childrenContainer?.getAttribute("role")).toBe("group");
        }

        return true;
      }),
      { numRuns: 100 },
    );
  });
});
