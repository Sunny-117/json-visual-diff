// 验证核心包可以独立使用的简单测试脚本
import { diff, DiffType } from './dist/index.js';

// 测试基本功能
const obj1 = {
  name: 'John',
  age: 25,
  city: 'New York'
};

const obj2 = {
  name: 'John',
  age: 26,
  city: 'New York',
  email: 'john@example.com'
};

console.log('🧪 测试核心包独立使用...\n');

try {
  const result = diff(obj1, obj2);
  
  console.log('✅ diff 函数调用成功');
  console.log('📊 统计信息:', result.stats);
  console.log('🌳 根节点类型:', result.root.type);
  
  // 验证结果结构
  if (!result.root || !result.stats) {
    throw new Error('结果结构不完整');
  }
  
  // 验证统计信息
  if (result.stats.modified !== 2 || result.stats.added !== 1) {
    console.log('⚠️  统计信息:', result.stats);
    throw new Error('统计信息不符合预期');
  }
  
  console.log('\n✨ 核心包验证通过！所有功能正常工作。');
  process.exit(0);
} catch (error) {
  console.error('\n❌ 验证失败:', error.message);
  process.exit(1);
}
