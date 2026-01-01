import { ValueType } from './types';

/**
 * 类型规范化器
 * 处理非标准 JSON 类型
 */
export class TypeNormalizer {
  /**
   * 获取值的类型
   */
  static getValueType(value: any): ValueType {
    if (value === null) return ValueType.NULL;
    if (value === undefined) return ValueType.UNDEFINED;
    if (typeof value === 'symbol') return ValueType.SYMBOL;
    if (typeof value === 'function') return ValueType.FUNCTION;
    if (value instanceof Date) return ValueType.DATE;
    if (value instanceof RegExp) return ValueType.REGEXP;
    if (Array.isArray(value)) return ValueType.ARRAY;
    if (typeof value === 'object') return ValueType.OBJECT;
    return ValueType.PRIMITIVE;
  }
  
  /**
   * 规范化函数为可比较的字符串
   */
  static normalizeFunction(fn: Function): string {
    return fn.toString().replace(/\s+/g, ' ').trim();
  }
  
  /**
   * 规范化 Date 为时间戳
   */
  static normalizeDate(date: Date): number {
    return date.getTime();
  }
  
  /**
   * 规范化 RegExp 为字符串表示
   */
  static normalizeRegExp(regexp: RegExp): string {
    return `${regexp.source}|${regexp.flags}`;
  }
  
  /**
   * 规范化 Symbol 为描述字符串
   */
  static normalizeSymbol(symbol: Symbol): string {
    return symbol.toString();
  }
  
  /**
   * 序列化值为可显示的字符串
   */
  static serialize(value: any, type: ValueType): string {
    switch (type) {
      case ValueType.FUNCTION:
        return this.normalizeFunction(value);
      case ValueType.DATE:
        return new Date(this.normalizeDate(value)).toISOString();
      case ValueType.REGEXP:
        return value.toString();
      case ValueType.SYMBOL:
        return this.normalizeSymbol(value);
      case ValueType.UNDEFINED:
        return 'undefined';
      case ValueType.NULL:
        return 'null';
      default:
        return JSON.stringify(value);
    }
  }
}
