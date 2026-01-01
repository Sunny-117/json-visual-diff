/**
 * 差异类型枚举
 */
export enum DiffType {
  ADDED = 'added',       // 新增
  DELETED = 'deleted',   // 删除
  MODIFIED = 'modified', // 修改
  UNCHANGED = 'unchanged' // 未改变
}

/**
 * 值类型枚举
 */
export enum ValueType {
  PRIMITIVE = 'primitive', // 原始类型
  OBJECT = 'object',       // 对象
  ARRAY = 'array',         // 数组
  FUNCTION = 'function',   // 函数
  DATE = 'date',           // 日期
  REGEXP = 'regexp',       // 正则
  UNDEFINED = 'undefined', // undefined
  NULL = 'null',           // null
  SYMBOL = 'symbol'        // Symbol
}

/**
 * 差异节点接口
 */
export interface DiffNode {
  type: DiffType;           // 差异类型
  path: string[];           // JSON Path
  valueType: ValueType;     // 值类型
  oldValue?: any;           // 旧值（删除或修改时）
  newValue?: any;           // 新值（添加或修改时）
  children?: DiffNode[];    // 子节点（对象或数组）
}

/**
 * Diff 结果接口
 */
export interface DiffResult {
  root: DiffNode;           // 根节点
  stats: {                  // 统计信息
    added: number;
    deleted: number;
    modified: number;
    unchanged: number;
  };
}

/**
 * Diff 配置选项
 */
export interface DiffOptions {
  maxDepth?: number;        // 最大比较深度
  ignoreKeys?: string[];    // 忽略的键
  arrayDiffMode?: 'lcs' | 'position'; // 数组比较模式
  detectCircular?: boolean; // 是否检测循环引用
}

/**
 * 渲染器配置接口
 */
export interface RendererConfig {
  theme?: 'light' | 'dark' | 'custom';
  colors?: {
    added?: string;
    deleted?: string;
    modified?: string;
    unchanged?: string;
  };
  indent?: number;          // 缩进空格数
  expandDepth?: number;     // 默认展开深度
  showUnchanged?: boolean;  // 是否显示未改变的节点
}

/**
 * 渲染器接口（Adapter 模式）
 */
export interface Renderer<T> {
  /**
   * 渲染 diff 结果
   */
  render(diffResult: DiffResult, config?: RendererConfig): T;
  
  /**
   * 渲染单个节点
   */
  renderNode(node: DiffNode, config?: RendererConfig): T;
  
  /**
   * 渲染添加的节点
   */
  renderAdded(node: DiffNode, config?: RendererConfig): T;
  
  /**
   * 渲染删除的节点
   */
  renderDeleted(node: DiffNode, config?: RendererConfig): T;
  
  /**
   * 渲染修改的节点
   */
  renderModified(node: DiffNode, config?: RendererConfig): T;
  
  /**
   * 渲染未改变的节点
   */
  renderUnchanged(node: DiffNode, config?: RendererConfig): T;
}
