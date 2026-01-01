/**
 * 样式系统
 * 定义主题和颜色配置
 */

import type { RendererConfig } from '@json-visual-diff/core';

/**
 * 主题颜色接口
 */
export interface ThemeColors {
  added: string;
  deleted: string;
  modified: string;
  unchanged: string;
  background: string;
  text: string;
  border: string;
  key: string;
  value: string;
}

/**
 * 预定义主题
 */
const themes: Record<'light' | 'dark', ThemeColors> = {
  light: {
    added: '#22863a',      // 绿色 - 新增
    deleted: '#cb2431',    // 红色 - 删除
    modified: '#e36209',   // 橙色 - 修改
    unchanged: '#6a737d',  // 灰色 - 未改变
    background: '#ffffff', // 背景色
    text: '#24292e',       // 文本色
    border: '#e1e4e8',     // 边框色
    key: '#005cc5',        // 键名色
    value: '#032f62',      // 值色
  },
  dark: {
    added: '#28a745',      // 绿色 - 新增
    deleted: '#d73a49',    // 红色 - 删除
    modified: '#f97583',   // 橙色 - 修改
    unchanged: '#959da5',  // 灰色 - 未改变
    background: '#0d1117', // 背景色
    text: '#c9d1d9',       // 文本色
    border: '#30363d',     // 边框色
    key: '#79c0ff',        // 键名色
    value: '#a5d6ff',      // 值色
  },
};

/**
 * 获取默认主题
 */
export function getDefaultTheme(theme: 'light' | 'dark' | 'custom' = 'light'): ThemeColors {
  if (theme === 'custom') {
    return themes.light; // 自定义主题使用 light 作为基础
  }
  return themes[theme];
}

/**
 * 获取主题颜色
 * 支持自定义颜色覆盖
 */
export function getThemeColors(
  theme: 'light' | 'dark' | 'custom' = 'light',
  customColors?: RendererConfig['colors']
): ThemeColors {
  const baseTheme = getDefaultTheme(theme);

  if (!customColors) {
    return baseTheme;
  }

  // 合并自定义颜色
  return {
    ...baseTheme,
    ...(customColors.added && { added: customColors.added }),
    ...(customColors.deleted && { deleted: customColors.deleted }),
    ...(customColors.modified && { modified: customColors.modified }),
    ...(customColors.unchanged && { unchanged: customColors.unchanged }),
  };
}

/**
 * 生成 CSS 类名
 */
export function generateClassName(
  base: string,
  modifiers?: string[]
): string {
  if (!modifiers || modifiers.length === 0) {
    return base;
  }
  return `${base} ${modifiers.map(m => `${base}--${m}`).join(' ')}`;
}

/**
 * 生成内联样式
 */
export function generateInlineStyles(
  colors: ThemeColors,
  type: 'added' | 'deleted' | 'modified' | 'unchanged'
): Partial<CSSStyleDeclaration> {
  return {
    color: colors[type],
  };
}
