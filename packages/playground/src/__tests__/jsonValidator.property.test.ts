import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { validateJSON, formatJSON } from "../utils/jsonValidator";

/**
 * Feature: json-visual-diff, Property 18: JSON 验证正确性
 * Validates: Requirements 6.2, 6.3
 *
 * 对于任意有效的 JSON 字符串，Playground 的解析器应该成功解析；
 * 对于任意无效的 JSON 字符串，应该返回错误信息
 */
describe("JSON Validator Property Tests", () => {
  it("Property 18: 对于任意有效的 JSON 值，验证应该成功", () => {
    fc.assert(
      fc.property(fc.jsonValue(), (value) => {
        const jsonString = JSON.stringify(value);
        const result = validateJSON(jsonString);

        // 有效的 JSON 字符串应该验证成功
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      }),
      { numRuns: 100 },
    );
  });

  it("Property 18: 对于任意有效的 JSON 对象，验证应该成功", () => {
    fc.assert(
      fc.property(fc.object(), (obj) => {
        const jsonString = JSON.stringify(obj);
        const result = validateJSON(jsonString);

        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      }),
      { numRuns: 100 },
    );
  });

  it("Property 18: 对于任意有效的 JSON 数组，验证应该成功", () => {
    fc.assert(
      fc.property(fc.array(fc.jsonValue()), (arr) => {
        const jsonString = JSON.stringify(arr);
        const result = validateJSON(jsonString);

        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      }),
      { numRuns: 100 },
    );
  });

  it("Property 18: 空字符串应该被视为有效（未输入状态）", () => {
    const result = validateJSON("");
    expect(result.isValid).toBe(true);
  });

  it("Property 18: 纯空白字符串应该被视为有效（未输入状态）", () => {
    fc.assert(
      fc.property(fc.stringOf(fc.constantFrom(" ", "\t", "\n", "\r")), (whitespace) => {
        const result = validateJSON(whitespace);
        expect(result.isValid).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  it("Property 18: 无效的 JSON 字符串应该返回错误", () => {
    const invalidJsonSamples = [
      "{invalid}",
      '{"key": undefined}',
      "{'key': 'value'}", // 单引号
      '{key: "value"}', // 键没有引号
      '{"key": "value",}', // 尾随逗号
      "[1, 2, 3,]", // 尾随逗号
      '{"key": NaN}',
      '{"key": Infinity}',
    ];

    invalidJsonSamples.forEach((invalidJson) => {
      const result = validateJSON(invalidJson);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  it("Property 18: 格式化有效 JSON 后应该仍然有效", () => {
    fc.assert(
      fc.property(fc.jsonValue(), (value) => {
        const jsonString = JSON.stringify(value);
        const formatted = formatJSON(jsonString);
        const result = validateJSON(formatted);

        expect(result.isValid).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  it("Property 18: 格式化后的 JSON 应该与原始值等价", () => {
    fc.assert(
      fc.property(fc.jsonValue(), (value) => {
        const jsonString = JSON.stringify(value);
        const formatted = formatJSON(jsonString);

        // 解析格式化后的字符串应该得到相同的值
        const originalParsed = JSON.parse(jsonString);
        const formattedParsed = JSON.parse(formatted);

        expect(formattedParsed).toEqual(originalParsed);
      }),
      { numRuns: 100 },
    );
  });

  it("Property 18: 对于包含嵌套结构的 JSON，验证应该正确", () => {
    fc.assert(
      fc.property(
        fc.object({
          maxDepth: 5,
          key: fc.string(),
          values: [fc.jsonValue()],
        }),
        (obj) => {
          const jsonString = JSON.stringify(obj);
          const result = validateJSON(jsonString);

          expect(result.isValid).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("Property 18: 验证错误应该包含有用的错误信息", () => {
    const invalidJson = '{"key": "value"'; // 缺少闭合括号
    const result = validateJSON(invalidJson);

    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
    expect(typeof result.error).toBe("string");
    expect(result.error!.length).toBeGreaterThan(0);
  });
});
