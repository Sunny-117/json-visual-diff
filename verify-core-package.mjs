// 从 workspace 根目录验证核心包可以被正确导入和使用
import { diff, DiffType, ValueType } from '@json-visual-diff/core';

console.log('🧪 从 workspace 根目录测试核心包导入...\n');

try {
  // 验证导出的类型和函数
  console.log('✅ diff 函数已导出:', typeof diff === 'function');
  console.log('✅ DiffType 枚举已导出:', typeof DiffType === 'object');
  console.log('✅ ValueType 枚举已导出:', typeof ValueType === 'object');
  
  // 测试基本功能
  const obj1 = { name: 'Alice', age: 30 };
  const obj2 = { name: 'Alice', age: 31, city: 'Paris' };
  
  const result = diff(obj1, obj2);
  
  console.log('\n📊 Diff 结果统计:');
  console.log('  - 添加:', result.stats.added);
  console.log('  - 删除:', result.stats.deleted);
  console.log('  - 修改:', result.stats.modified);
  console.log('  - 未改变:', result.stats.unchanged);
  
  // 验证结果正确性
  if (result.stats.added === 1 && result.stats.modified === 1) {
    console.log('\n✨ 核心包可以独立使用！所有导出和功能正常。');
    process.exit(0);
  } else {
    throw new Error('结果统计不符合预期');
  }
} catch (error) {
  console.error('\n❌ 验证失败:', error.message);
  console.error(error.stack);
  process.exit(1);
}
