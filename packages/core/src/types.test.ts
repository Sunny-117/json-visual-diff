import { describe, it, expect } from 'vitest';
import {
  DiffType,
  ValueType,
  DiffNode,
  DiffResult,
  DiffOptions,
  RendererConfig,
  Renderer
} from './types.js';

describe('核心类型定义', () => {
  describe('DiffType 枚举', () => {
    it('应该导出所有差异类型', () => {
      expect(DiffType.ADDED).toBe('added');
      expect(DiffType.DELETED).toBe('deleted');
      expect(DiffType.MODIFIED).toBe('modified');
      expect(DiffType.UNCHANGED).toBe('unchanged');
    });

    it('应该包含 4 个枚举值', () => {
      const values = Object.values(DiffType);
      expect(values).toHaveLength(4);
    });
  });

  describe('ValueType 枚举', () => {
    it('应该导出所有值类型', () => {
      expect(ValueType.PRIMITIVE).toBe('primitive');
      expect(ValueType.OBJECT).toBe('object');
      expect(ValueType.ARRAY).toBe('array');
      expect(ValueType.FUNCTION).toBe('function');
      expect(ValueType.DATE).toBe('date');
      expect(ValueType.REGEXP).toBe('regexp');
      expect(ValueType.UNDEFINED).toBe('undefined');
      expect(ValueType.NULL).toBe('null');
      expect(ValueType.SYMBOL).toBe('symbol');
    });

    it('应该包含 9 个枚举值', () => {
      const values = Object.values(ValueType);
      expect(values).toHaveLength(9);
    });
  });

  describe('DiffNode 接口', () => {
    it('应该创建有效的 DiffNode 对象', () => {
      const node: DiffNode = {
        type: DiffType.ADDED,
        path: ['user', 'name'],
        valueType: ValueType.PRIMITIVE,
        newValue: 'John'
      };

      expect(node.type).toBe(DiffType.ADDED);
      expect(node.path).toEqual(['user', 'name']);
      expect(node.valueType).toBe(ValueType.PRIMITIVE);
      expect(node.newValue).toBe('John');
    });

    it('应该支持可选的 oldValue 和 newValue', () => {
      const modifiedNode: DiffNode = {
        type: DiffType.MODIFIED,
        path: ['age'],
        valueType: ValueType.PRIMITIVE,
        oldValue: 25,
        newValue: 26
      };

      expect(modifiedNode.oldValue).toBe(25);
      expect(modifiedNode.newValue).toBe(26);
    });

    it('应该支持可选的 children 数组', () => {
      const parentNode: DiffNode = {
        type: DiffType.MODIFIED,
        path: ['user'],
        valueType: ValueType.OBJECT,
        children: [
          {
            type: DiffType.ADDED,
            path: ['user', 'email'],
            valueType: ValueType.PRIMITIVE,
            newValue: 'john@example.com'
          }
        ]
      };

      expect(parentNode.children).toBeDefined();
      expect(parentNode.children).toHaveLength(1);
      expect(parentNode.children![0].type).toBe(DiffType.ADDED);
    });
  });

  describe('DiffResult 接口', () => {
    it('应该创建有效的 DiffResult 对象', () => {
      const result: DiffResult = {
        root: {
          type: DiffType.MODIFIED,
          path: [],
          valueType: ValueType.OBJECT,
          children: []
        },
        stats: {
          added: 1,
          deleted: 0,
          modified: 2,
          unchanged: 3
        }
      };

      expect(result.root).toBeDefined();
      expect(result.stats).toBeDefined();
      expect(result.stats.added).toBe(1);
      expect(result.stats.deleted).toBe(0);
      expect(result.stats.modified).toBe(2);
      expect(result.stats.unchanged).toBe(3);
    });

    it('stats 应该包含所有必需的计数字段', () => {
      const result: DiffResult = {
        root: {
          type: DiffType.UNCHANGED,
          path: [],
          valueType: ValueType.PRIMITIVE,
          oldValue: 'test',
          newValue: 'test'
        },
        stats: {
          added: 0,
          deleted: 0,
          modified: 0,
          unchanged: 1
        }
      };

      expect(result.stats).toHaveProperty('added');
      expect(result.stats).toHaveProperty('deleted');
      expect(result.stats).toHaveProperty('modified');
      expect(result.stats).toHaveProperty('unchanged');
    });
  });

  describe('DiffOptions 接口', () => {
    it('应该创建有效的 DiffOptions 对象', () => {
      const options: DiffOptions = {
        maxDepth: 10,
        ignoreKeys: ['password', 'token'],
        arrayDiffMode: 'lcs',
        detectCircular: true
      };

      expect(options.maxDepth).toBe(10);
      expect(options.ignoreKeys).toEqual(['password', 'token']);
      expect(options.arrayDiffMode).toBe('lcs');
      expect(options.detectCircular).toBe(true);
    });

    it('所有字段应该是可选的', () => {
      const emptyOptions: DiffOptions = {};
      expect(emptyOptions).toBeDefined();
    });

    it('arrayDiffMode 应该只接受 lcs 或 position', () => {
      const lcsMode: DiffOptions = { arrayDiffMode: 'lcs' };
      const positionMode: DiffOptions = { arrayDiffMode: 'position' };

      expect(lcsMode.arrayDiffMode).toBe('lcs');
      expect(positionMode.arrayDiffMode).toBe('position');
    });
  });

  describe('RendererConfig 接口', () => {
    it('应该创建有效的 RendererConfig 对象', () => {
      const config: RendererConfig = {
        theme: 'dark',
        colors: {
          added: '#00ff00',
          deleted: '#ff0000',
          modified: '#ffff00',
          unchanged: '#cccccc'
        },
        indent: 2,
        expandDepth: 3,
        showUnchanged: true
      };

      expect(config.theme).toBe('dark');
      expect(config.colors?.added).toBe('#00ff00');
      expect(config.indent).toBe(2);
      expect(config.expandDepth).toBe(3);
      expect(config.showUnchanged).toBe(true);
    });

    it('所有字段应该是可选的', () => {
      const emptyConfig: RendererConfig = {};
      expect(emptyConfig).toBeDefined();
    });

    it('theme 应该只接受 light、dark 或 custom', () => {
      const lightTheme: RendererConfig = { theme: 'light' };
      const darkTheme: RendererConfig = { theme: 'dark' };
      const customTheme: RendererConfig = { theme: 'custom' };

      expect(lightTheme.theme).toBe('light');
      expect(darkTheme.theme).toBe('dark');
      expect(customTheme.theme).toBe('custom');
    });
  });

  describe('Renderer 接口', () => {
    it('应该定义所有必需的方法', () => {
      // 创建一个简单的 mock renderer 来验证接口结构
      const mockRenderer: Renderer<string> = {
        render: (diffResult: DiffResult, config?: RendererConfig) => 'rendered',
        renderNode: (node: DiffNode, config?: RendererConfig) => 'node',
        renderAdded: (node: DiffNode, config?: RendererConfig) => 'added',
        renderDeleted: (node: DiffNode, config?: RendererConfig) => 'deleted',
        renderModified: (node: DiffNode, config?: RendererConfig) => 'modified',
        renderUnchanged: (node: DiffNode, config?: RendererConfig) => 'unchanged'
      };

      expect(mockRenderer.render).toBeDefined();
      expect(mockRenderer.renderNode).toBeDefined();
      expect(mockRenderer.renderAdded).toBeDefined();
      expect(mockRenderer.renderDeleted).toBeDefined();
      expect(mockRenderer.renderModified).toBeDefined();
      expect(mockRenderer.renderUnchanged).toBeDefined();
    });

    it('Renderer 应该支持泛型类型参数', () => {
      // 测试不同的返回类型
      const stringRenderer: Renderer<string> = {
        render: () => 'string result',
        renderNode: () => 'node',
        renderAdded: () => 'added',
        renderDeleted: () => 'deleted',
        renderModified: () => 'modified',
        renderUnchanged: () => 'unchanged'
      };

      const objectRenderer: Renderer<{ html: string }> = {
        render: () => ({ html: '<div>result</div>' }),
        renderNode: () => ({ html: '<div>node</div>' }),
        renderAdded: () => ({ html: '<div>added</div>' }),
        renderDeleted: () => ({ html: '<div>deleted</div>' }),
        renderModified: () => ({ html: '<div>modified</div>' }),
        renderUnchanged: () => ({ html: '<div>unchanged</div>' })
      };

      expect(typeof stringRenderer.render({} as DiffResult)).toBe('string');
      expect(objectRenderer.render({} as DiffResult)).toHaveProperty('html');
      expect(objectRenderer.render({} as DiffResult).html).toBe('<div>result</div>');
    });
  });
});
