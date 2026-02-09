import { describe, it } from "vitest";
import fc from "fast-check";
import { TypeNormalizer } from "../normalizer";
import { ValueType } from "../types";

describe("Type Normalizer - Property Tests", () => {
  /**
   * Property 8: 函数比较一致性
   * Feature: json-visual-diff, Property 8: 函数比较一致性
   * Validates: Requirements 2.1
   *
   * 对于任意两个函数，如果它们的字符串表示（去除空白后）相同，
   * 规范化后的结果应该相同；否则应该不同
   */
  it("Property 8: 函数比较一致性 - 相同函数规范化后应该相同", () => {
    fc.assert(
      fc.property(fc.func(fc.anything()), (fn) => {
        const normalized1 = TypeNormalizer.normalizeFunction(fn);
        const normalized2 = TypeNormalizer.normalizeFunction(fn);
        return normalized1 === normalized2;
      }),
      { numRuns: 100 },
    );
  });

  it("Property 8: 函数比较一致性 - 不同函数规范化后应该不同", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          function a() {
            return 1;
          },
          function b() {
            return 2;
          },
          () => 3,
          () => 4,
          function test() {
            console.log("test");
          },
        ),
        fc.constantFrom(
          function c() {
            return 5;
          },
          function d() {
            return 6;
          },
          () => 7,
          () => 8,
          function other() {
            console.log("other");
          },
        ),
        (fn1, fn2) => {
          const normalized1 = TypeNormalizer.normalizeFunction(fn1);
          const normalized2 = TypeNormalizer.normalizeFunction(fn2);
          // 不同的函数应该有不同的规范化结果
          return normalized1 !== normalized2;
        },
      ),
      { numRuns: 100 },
    );
  });
});

/**
 * Property 9: Date 比较通过时间戳
 * Feature: json-visual-diff, Property 9: Date 比较通过时间戳
 * Validates: Requirements 2.2
 *
 * 对于任意两个 Date 对象，如果它们的时间戳相同，
 * 规范化后的结果应该相同；否则应该不同
 */
it("Property 9: Date 比较通过时间戳 - 相同时间戳的 Date 规范化后应该相同", () => {
  fc.assert(
    fc.property(fc.date(), (date) => {
      const timestamp = date.getTime();
      const date1 = new Date(timestamp);
      const date2 = new Date(timestamp);

      const normalized1 = TypeNormalizer.normalizeDate(date1);
      const normalized2 = TypeNormalizer.normalizeDate(date2);

      return normalized1 === normalized2;
    }),
    { numRuns: 100 },
  );
});

it("Property 9: Date 比较通过时间戳 - 不同时间戳的 Date 规范化后应该不同", () => {
  fc.assert(
    fc.property(fc.date(), fc.date(), (date1, date2) => {
      const normalized1 = TypeNormalizer.normalizeDate(date1);
      const normalized2 = TypeNormalizer.normalizeDate(date2);

      // 如果时间戳相同，规范化结果应该相同；否则应该不同
      if (date1.getTime() === date2.getTime()) {
        return normalized1 === normalized2;
      } else {
        return normalized1 !== normalized2;
      }
    }),
    { numRuns: 100 },
  );
});

/**
 * Property 10: RegExp 比较通过模式和标志
 * Feature: json-visual-diff, Property 10: RegExp 比较通过模式和标志
 * Validates: Requirements 2.3
 *
 * 对于任意两个 RegExp 对象，如果它们的 source 和 flags 都相同，
 * 规范化后的结果应该相同；否则应该不同
 */
it("Property 10: RegExp 比较通过模式和标志 - 相同模式和标志的 RegExp 规范化后应该相同", () => {
  fc.assert(
    fc.property(
      fc.string(),
      fc.constantFrom("", "i", "g", "ig", "gi", "m", "im", "gm", "igm"),
      (pattern, flags) => {
        try {
          const regex1 = new RegExp(pattern, flags);
          const regex2 = new RegExp(pattern, flags);

          const normalized1 = TypeNormalizer.normalizeRegExp(regex1);
          const normalized2 = TypeNormalizer.normalizeRegExp(regex2);

          return normalized1 === normalized2;
        } catch {
          // 如果模式无效，跳过这个测试用例
          return true;
        }
      },
    ),
    { numRuns: 100 },
  );
});

it("Property 10: RegExp 比较通过模式和标志 - 不同模式或标志的 RegExp 规范化后应该不同", () => {
  fc.assert(
    fc.property(
      fc.constantFrom(/test/, /test/i, /test/g, /abc/, /[a-z]+/, /\d+/g),
      fc.constantFrom(/other/, /other/i, /test/gi, /xyz/, /[0-9]+/, /\w+/m),
      (regex1, regex2) => {
        const normalized1 = TypeNormalizer.normalizeRegExp(regex1);
        const normalized2 = TypeNormalizer.normalizeRegExp(regex2);

        // 如果 source 和 flags 都相同，规范化结果应该相同；否则应该不同
        if (regex1.source === regex2.source && regex1.flags === regex2.flags) {
          return normalized1 === normalized2;
        } else {
          return normalized1 !== normalized2;
        }
      },
    ),
    { numRuns: 100 },
  );
});

/**
 * Property 11: 特殊值处理
 * Feature: json-visual-diff, Property 11: 特殊值处理
 * Validates: Requirements 2.4, 2.5
 *
 * 对于任意包含 undefined、null 或 Symbol 的对象，
 * getValueType 应该正确识别这些特殊值的类型
 */
it("Property 11: 特殊值处理 - 正确识别 undefined", () => {
  fc.assert(
    fc.property(fc.constant(undefined), (value) => {
      const type = TypeNormalizer.getValueType(value);
      return type === ValueType.UNDEFINED;
    }),
    { numRuns: 100 },
  );
});

it("Property 11: 特殊值处理 - 正确识别 null", () => {
  fc.assert(
    fc.property(fc.constant(null), (value) => {
      const type = TypeNormalizer.getValueType(value);
      return type === ValueType.NULL;
    }),
    { numRuns: 100 },
  );
});

it("Property 11: 特殊值处理 - 正确识别 Symbol", () => {
  fc.assert(
    fc.property(fc.string(), (description) => {
      const symbol = Symbol(description);
      const type = TypeNormalizer.getValueType(symbol);
      return type === ValueType.SYMBOL;
    }),
    { numRuns: 100 },
  );
});

it("Property 11: 特殊值处理 - Symbol 规范化保持一致性", () => {
  fc.assert(
    fc.property(fc.string(), (description) => {
      const symbol = Symbol(description);
      const normalized1 = TypeNormalizer.normalizeSymbol(symbol);
      const normalized2 = TypeNormalizer.normalizeSymbol(symbol);
      return normalized1 === normalized2;
    }),
    { numRuns: 100 },
  );
});

it("Property 11: 特殊值处理 - serialize 方法正确处理特殊值", () => {
  fc.assert(
    fc.property(
      fc.constantFrom(
        { value: undefined, type: ValueType.UNDEFINED },
        { value: null, type: ValueType.NULL },
        { value: Symbol("test"), type: ValueType.SYMBOL },
      ),
      ({ value, type }) => {
        const serialized = TypeNormalizer.serialize(value, type);
        // 序列化结果应该是字符串
        return typeof serialized === "string" && serialized.length > 0;
      },
    ),
    { numRuns: 100 },
  );
});
