// 测试构建后的模块导出
import * as coreModule from './dist/index.js';

console.log('🧪 测试核心包构建输出...\n');

try {
  // 检查主要导出
  const exports = Object.keys(coreModule);
  console.log('📦 导出的符号数量:', exports.length);
  
  // 检查关键函数和类
  const hasDiff = 'diff' in coreModule;
  const hasDiffEngine = 'DiffEngine' in coreModule;
  const hasTypeNormalizer = 'TypeNormalizer' in coreModule;
  const hasLCS = 'computeLCS' in coreModule;
  
  console.log('✅ diff 函数:', hasDiff);
  console.log('✅ DiffEngine 类:', hasDiffEngine);
  console.log('✅ TypeNormalizer 类:', hasTypeNormalizer);
  console.log('✅ computeLCS 函数:', hasLCS);
  
  // 检查枚举
  const hasDiffType = 'DiffType' in coreModule;
  const hasValueType = 'ValueType' in coreModule;
  
  console.log('✅ DiffType 枚举:', hasDiffType);
  console.log('✅ ValueType 枚举:', hasValueType);
  
  // 测试基本功能
  const { diff } = coreModule;
  const result = diff({ a: 1 }, { a: 2 });
  
  console.log('\n📊 功能测试:');
  console.log('  Diff 结果包含 root:', 'root' in result);
  console.log('  Diff 结果包含 stats:', 'stats' in result);
  console.log('  统计信息:', result.stats);
  
  if (hasDiff && hasDiffEngine && hasTypeNormalizer && hasDiffType && hasValueType) {
    console.log('\n✨ 核心包构建成功！所有导出正常，可以独立使用。');
    process.exit(0);
  } else {
    throw new Error('缺少必要的导出');
  }
} catch (error) {
  console.error('\n❌ 测试失败:', error.message);
  console.error(error.stack);
  process.exit(1);
}
