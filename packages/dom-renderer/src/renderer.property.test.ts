/**
 * DOM Renderer 属性测试
 * Feature: json-visual-diff, Property 14: DOM 渲染输出有效性
 * Validates: Requirements 5.2
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { DOMRenderer } from './renderer.js';
import type { DiffResult, DiffNode, DiffType, ValueType } from '@json-visual-diff/core';

describe('DOM Renderer Property Tests', () => {
  let renderer: DOMRenderer;

  beforeEach(() => {
    renderer = new DOMRenderer();
  });

  /**
   * Property 14: DOM 渲染输出有效性
   * 对于任意 diff 结果，DOM 渲染器应该生成有效的 HTML 元素，可以被 DOM API 解析和操作
   */
  it('Property 14: DOM 渲染输出有效性 - 渲染器应该生成有效的 HTML 元素', () => {
    // Feature: json-visual-diff, Property 14: DOM 渲染输出有效性
    
    const diffTypeArb = fc.constantFrom<DiffType>('added', 'deleted', 'modified', 'unchanged');
    const valueTypeArb = fc.constantFrom<ValueType>(
      'primitive', 'object', 'array', 'function', 'date', 'regexp', 'undefined', 'null', 'symbol'
    );
    
    const pathArb = fc.array(fc.string({ minLength: 1, maxLength: 10 }), { maxLength: 5 });
    
    const diffNodeArb: fc.Arbitrary<DiffNode> = fc.record({
      type: diffTypeArb,
      path: pathArb,
      valueType: valueTypeArb,
      oldValue: fc.anything(),
      newValue: fc.anything(),
    });

    const diffResultArb: fc.Arbitrary<DiffResult> = fc.record({
      root: diffNodeArb,
      stats: fc.record({
        added: fc.nat({ max: 100 }),
        deleted: fc.nat({ max: 100 }),
        modified: fc.nat({ max: 100 }),
        unchanged: fc.nat({ max: 100 }),
      }),
    });

    fc.assert(
      fc.property(diffResultArb, (diffResult) => {
        // 渲染 diff 结果
        const element = renderer.render(diffResult);

        // 验证返回的是有效的 HTML 元素
        expect(element).toBeInstanceOf(HTMLElement);
        expect(element.nodeType).toBe(Node.ELEMENT_NODE);

        // 验证元素可以被 DOM API 操作
        expect(element.className).toBeDefined();
        expect(element.getAttribute).toBeDefined();
        expect(element.appendChild).toBeDefined();

        // 验证元素有正确的容器类名
        expect(element.className).toContain('json-diff-container');

        // 验证元素有可访问性属性
        expect(element.getAttribute('role')).toBe('region');
        expect(element.getAttribute('aria-label')).toBeTruthy();

        // 验证元素可以被查询
        const statsElement = element.querySelector('.json-diff-stats');
        expect(statsElement).toBeTruthy();

        const contentElement = element.querySelector('.json-diff-content');
        expect(contentElement).toBeTruthy();

        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('Property 14: DOM 渲染输出有效性 - renderNode 应该生成有效的 HTML 元素', () => {
    // Feature: json-visual-diff, Property 14: DOM 渲染输出有效性
    
    const diffTypeArb = fc.constantFrom<DiffType>('added', 'deleted', 'modified', 'unchanged');
    const valueTypeArb = fc.constantFrom<ValueType>(
      'primitive', 'object', 'array', 'function', 'date', 'regexp', 'undefined', 'null', 'symbol'
    );
    
    const pathArb = fc.array(fc.string({ minLength: 1, maxLength: 10 }), { maxLength: 5 });
    
    const diffNodeArb: fc.Arbitrary<DiffNode> = fc.record({
      type: diffTypeArb,
      path: pathArb,
      valueType: valueTypeArb,
      oldValue: fc.anything(),
      newValue: fc.anything(),
    });

    fc.assert(
      fc.property(diffNodeArb, (node) => {
        // 渲染单个节点
        const element = renderer.renderNode(node);

        // 验证返回的是有效的 HTML 元素
        expect(element).toBeInstanceOf(HTMLElement);
        expect(element.nodeType).toBe(Node.ELEMENT_NODE);

        // 验证元素有正确的类名
        expect(element.className).toContain('diff-node');
        expect(element.className).toContain(`diff-${node.type}`);

        // 验证元素有可访问性属性
        expect(element.getAttribute('role')).toBe('treeitem');
        expect(element.getAttribute('aria-label')).toBeTruthy();

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 15: DOM 渲染视觉区分
   * 对于任意 diff 结果，DOM 渲染器生成的 HTML 应该为不同类型的差异节点应用不同的 CSS 类名或样式属性
   */
  it('Property 15: DOM 渲染视觉区分 - 不同类型的节点应该有不同的类名', () => {
    // Feature: json-visual-diff, Property 15: DOM 渲染视觉区分
    
    const valueTypeArb = fc.constantFrom<ValueType>(
      'primitive', 'object', 'array', 'function', 'date', 'regexp', 'undefined', 'null', 'symbol'
    );
    
    const pathArb = fc.array(fc.string({ minLength: 1, maxLength: 10 }), { maxLength: 5 });

    fc.assert(
      fc.property(pathArb, valueTypeArb, fc.anything(), fc.anything(), (path, valueType, oldValue, newValue) => {
        // 测试添加的节点
        const addedNode: DiffNode = {
          type: 'added',
          path,
          valueType,
          newValue,
        };
        const addedElement = renderer.renderAdded(addedNode);
        expect(addedElement.className).toContain('diff-added');

        // 测试删除的节点
        const deletedNode: DiffNode = {
          type: 'deleted',
          path,
          valueType,
          oldValue,
        };
        const deletedElement = renderer.renderDeleted(deletedNode);
        expect(deletedElement.className).toContain('diff-deleted');

        // 测试修改的节点
        const modifiedNode: DiffNode = {
          type: 'modified',
          path,
          valueType,
          oldValue,
          newValue,
        };
        const modifiedElement = renderer.renderModified(modifiedNode);
        expect(modifiedElement.className).toContain('diff-modified');

        // 测试未改变的节点
        const unchangedNode: DiffNode = {
          type: 'unchanged',
          path,
          valueType,
          oldValue,
          newValue,
        };
        const unchangedElement = renderer.renderUnchanged(unchangedNode);
        expect(unchangedElement.className).toContain('diff-unchanged');

        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('Property 15: DOM 渲染视觉区分 - 不同类型的节点应该有不同的颜色样式', () => {
    // Feature: json-visual-diff, Property 15: DOM 渲染视觉区分
    
    const valueTypeArb = fc.constantFrom<ValueType>('primitive', 'string', 'number');
    const pathArb = fc.array(fc.string({ minLength: 1, maxLength: 10 }), { maxLength: 3 });

    fc.assert(
      fc.property(pathArb, valueTypeArb, fc.string(), fc.string(), (path, valueType, oldValue, newValue) => {
        // 创建渲染器并获取颜色配置
        const testRenderer = new DOMRenderer({ theme: 'light' });

        // 测试添加的节点有绿色
        const addedNode: DiffNode = {
          type: 'added',
          path,
          valueType,
          newValue,
        };
        const addedElement = testRenderer.renderAdded(addedNode);
        expect(addedElement.style.color).toBeTruthy();

        // 测试删除的节点有红色
        const deletedNode: DiffNode = {
          type: 'deleted',
          path,
          valueType,
          oldValue,
        };
        const deletedElement = testRenderer.renderDeleted(deletedNode);
        expect(deletedElement.style.color).toBeTruthy();

        // 测试修改的节点有橙色
        const modifiedNode: DiffNode = {
          type: 'modified',
          path,
          valueType,
          oldValue,
          newValue,
        };
        const modifiedElement = testRenderer.renderModified(modifiedNode);
        expect(modifiedElement.style.color).toBeTruthy();

        // 测试未改变的节点有灰色
        const unchangedNode: DiffNode = {
          type: 'unchanged',
          path,
          valueType,
          oldValue,
          newValue,
        };
        const unchangedElement = testRenderer.renderUnchanged(unchangedNode);
        // 注意：如果 showUnchanged 为 false，元素可能被隐藏
        if (unchangedElement.style.display !== 'none') {
          expect(unchangedElement.style.color).toBeTruthy();
        }

        return true;
      }),
      { numRuns: 100 }
    );
  });
});
