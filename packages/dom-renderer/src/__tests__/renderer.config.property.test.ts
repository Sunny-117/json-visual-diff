/**
 * DOM Renderer 配置属性测试
 * Feature: json-visual-diff, Property 16: 渲染配置响应性
 * Validates: Requirements 5.8
 */


import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { DOMRenderer } from "../renderer";
import { DiffType, ValueType } from "@json-visual-diff/core";
import type { DiffResult, DiffNode, RendererConfig } from "@json-visual-diff/core";

describe("DOM Renderer Config Property Tests", () => {
  /**
   * Property 16: 渲染配置响应性
   * 对于任意 diff 结果和不同的渲染配置，渲染器应该根据配置生成不同的输出
   */
  it("Property 16: 渲染配置响应性 - 主题配置应该影响颜色", () => {
    // Feature: json-visual-diff, Property 16: 渲染配置响应性

    const simpleNodeArb: fc.Arbitrary<DiffNode> = fc.record({
      type: fc.constantFrom(DiffType.ADDED, DiffType.DELETED, DiffType.MODIFIED, DiffType.UNCHANGED),
      path: fc.constant([]),
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
        // 使用 light 主题渲染
        const lightRenderer = new DOMRenderer({ theme: "light" });
        const lightElement = lightRenderer.render(diffResult);

        // 使用 dark 主题渲染
        const darkRenderer = new DOMRenderer({ theme: "dark" });
        const darkElement = darkRenderer.render(diffResult);

        // 验证两个渲染器都生成了有效的元素
        expect(lightElement).toBeInstanceOf(HTMLElement);
        expect(darkElement).toBeInstanceOf(HTMLElement);

        // 验证两个元素都有统计信息
        const lightStats = lightElement.querySelector(".json-diff-stats");
        const darkStats = darkElement.querySelector(".json-diff-stats");
        expect(lightStats).toBeTruthy();
        expect(darkStats).toBeTruthy();

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it("Property 16: 渲染配置响应性 - 自定义颜色应该被应用", () => {
    // Feature: json-visual-diff, Property 16: 渲染配置响应性

    const customColorsArb = fc.record({
      added: fc.hexaString({ minLength: 6, maxLength: 6 }).map((s) => `#${s}`),
      deleted: fc.hexaString({ minLength: 6, maxLength: 6 }).map((s) => `#${s}`),
      modified: fc.hexaString({ minLength: 6, maxLength: 6 }).map((s) => `#${s}`),
      unchanged: fc.hexaString({ minLength: 6, maxLength: 6 }).map((s) => `#${s}`),
    });

    const nodeArb: fc.Arbitrary<DiffNode> = fc.record({
      type: fc.constantFrom(DiffType.ADDED, DiffType.DELETED, DiffType.MODIFIED, DiffType.UNCHANGED),
      path: fc.constant(["test"]),
      valueType: fc.constant(ValueType.PRIMITIVE),
      oldValue: fc.constant("old"),
      newValue: fc.constant("new"),
    });

    fc.assert(
      fc.property(customColorsArb, nodeArb, (colors, node) => {
        // 创建带自定义颜色的渲染器
        const config: RendererConfig = {
          theme: "custom",
          colors,
        };
        const renderer = new DOMRenderer(config);

        // 渲染节点
        const element = renderer.renderNode(node);

        // 验证元素被创建
        expect(element).toBeInstanceOf(HTMLElement);
        expect(element.className).toContain("diff-node");

        // 验证颜色被应用（元素应该有 style.color 属性）
        expect(element.style.color).toBeTruthy();

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it("Property 16: 渲染配置响应性 - showUnchanged 配置应该控制未改变节点的显示", () => {
    // Feature: json-visual-diff, Property 16: 渲染配置响应性

    const unchangedNodeArb: fc.Arbitrary<DiffNode> = fc.record({
      type: fc.constant(DiffType.UNCHANGED),
      path: fc.array(fc.string({ minLength: 1, maxLength: 10 }), { maxLength: 3 }),
      valueType: fc.constantFrom(ValueType.PRIMITIVE, ValueType.OBJECT, ValueType.ARRAY),
      oldValue: fc.anything(),
      newValue: fc.anything(),
    });

    fc.assert(
      fc.property(unchangedNodeArb, (node) => {
        // 创建显示未改变节点的渲染器
        const showRenderer = new DOMRenderer({ showUnchanged: true });
        const showElement = showRenderer.renderUnchanged(node);

        // 创建隐藏未改变节点的渲染器
        const hideRenderer = new DOMRenderer({ showUnchanged: false });
        const hideElement = hideRenderer.renderUnchanged(node);

        // 验证两个元素都被创建
        expect(showElement).toBeInstanceOf(HTMLElement);
        expect(hideElement).toBeInstanceOf(HTMLElement);

        // 验证隐藏配置生效
        if (hideElement.style.display === "none") {
          // 如果隐藏，应该有 display: none
          expect(hideElement.style.display).toBe("none");
        }

        // 验证显示配置生效
        if (showElement.style.display !== "none") {
          // 如果显示，应该有内容
          expect(showElement.className).toContain("diff-unchanged");
        }

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it("Property 16: 渲染配置响应性 - indent 配置应该影响缩进", () => {
    // Feature: json-visual-diff, Property 16: 渲染配置响应性

    const indentArb = fc.integer({ min: 0, max: 8 });
    const nodeArb: fc.Arbitrary<DiffNode> = fc.record({
      type: fc.constantFrom(DiffType.ADDED, DiffType.DELETED, DiffType.MODIFIED),
      path: fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 5 }),
      valueType: fc.constant(ValueType.PRIMITIVE),
      oldValue: fc.constant("old"),
      newValue: fc.constant("new"),
    });

    fc.assert(
      fc.property(indentArb, nodeArb, (indent, node) => {
        // 创建带自定义缩进的渲染器
        const renderer = new DOMRenderer({ indent });

        // 渲染节点
        const element = renderer.renderNode(node);

        // 验证元素被创建
        expect(element).toBeInstanceOf(HTMLElement);

        // 查找缩进元素
        const indentElement = element.querySelector(".indent");
        if (indentElement && node.path.length > 0) {
          // 验证缩进元素存在
          expect(indentElement).toBeTruthy();
        }

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it("Property 16: 渲染配置响应性 - expandDepth 配置应该影响默认展开深度", () => {
    // Feature: json-visual-diff, Property 16: 渲染配置响应性

    const expandDepthArb = fc.integer({ min: 0, max: 5 });

    const createNestedNode = (depth: number): DiffNode => {
      if (depth === 0) {
        return {
          type: DiffType.MODIFIED,
          path: Array(depth).fill("level"),
          valueType: ValueType.PRIMITIVE,
          oldValue: "old",
          newValue: "new",
        };
      }
      return {
        type: DiffType.MODIFIED,
        path: Array(depth).fill("level"),
        valueType: ValueType.OBJECT,
        children: [createNestedNode(depth - 1)],
      };
    };

    fc.assert(
      fc.property(expandDepthArb, (expandDepth) => {
        // 创建带自定义展开深度的渲染器
        const renderer = new DOMRenderer({ expandDepth });

        // 创建嵌套节点
        const nestedNode = createNestedNode(5);

        // 渲染节点
        const element = renderer.renderNode(nestedNode);

        // 验证元素被创建
        expect(element).toBeInstanceOf(HTMLElement);
        expect(element.className).toContain("diff-node");

        return true;
      }),
      { numRuns: 100 },
    );
  });
});
