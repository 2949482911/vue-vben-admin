import dayjs from 'dayjs';
import { ref } from 'vue';

/**批头名字生成的方法 */
export const renderProjectTitle = (template: string, currentIndex: number = 0): string => {
  if (!template) return '';

  const now = dayjs();
  
  // 严格匹配图片中的规则
  const mapping: Record<string, string> = {
    '<时间>': now.format('MMDDHHmmss'), 
    '<日期>': now.format('MMDD'),       
    '<时分秒>': now.format('HHmmss'),     
    '<动态标号>': String(currentIndex),
  };

  let result = template;

  // 遍历替换。注意：用户手输入的数字、字母、下划线因为不在 mapping 里，会原样保留
  Object.keys(mapping).forEach((key) => {
    result = result.split(key).join(mapping[key]);
  });

  return result;
};

// 1. 抽离通配符配置（如果你想增加新的通配符，只需改这里）
export const PROJECT_PLACEHOLDERS = [
  { label: '时间', value: '<时间>' },
  { label: '日期', value: '<日期>' },
  { label: '时分秒', value: '<时分秒>' },
  { label: '动态标号', value: '<动态标号>' },
] as const; // 使用 as const 保证类型安全

export function useProjectPlaceholder(initialValue: string = '', maxLength: number = 100) {
  // 响应式变量，接管输入框内容
  const customizeName = ref<string>(initialValue);

  /**
   * 处理点击标签的逻辑
   * @param tagValue 通配符的值
   */
  const handleTagClick = (tagValue: string) => {
    const currentVal = customizeName.value.trim();

    // 切换功能：如果已存在则移除
    if (currentVal.includes(tagValue)) {
      // 转义特殊字符并匹配 "_<通配符>" 或 "<通配符>"
      const escapedTag = tagValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const reg = new RegExp(`_?${escapedTag}`, 'g');
      customizeName.value = currentVal.replace(reg, '');
    } else {
      // 追加逻辑：已有内容时自动补下划线
      const separator = currentVal.length > 0 ? '_' : '';
      customizeName.value = currentVal + separator + tagValue;
    }

    // 长度截断
    if (customizeName.value.length > maxLength) {
      customizeName.value = customizeName.value.slice(0, maxLength);
    }
  };

  return {
    customizeName,       // 对应 v-model
    handleTagClick,    // 对应 @click
    placeholders: PROJECT_PLACEHOLDERS, // 导出配置供 UI 渲染
  };
}
