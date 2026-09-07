<script setup lang="ts" name="AdNameGen">
import { computed, ref, watch } from 'vue';

import { Input, Tag } from 'ant-design-vue';

interface Props {
  /** 标准 v-model，兼容 useVbenForm */
  modelValue?: string;
  /** 兼容旧版 value prop */
  value?: string;
  /** 可选的通配符标签列表 */
  placeholderTags?: string[];
  /** 名字最大长度 */
  maxLength?: number;
  /** input 占位文本 */
  placeholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  maxLength: 100,
  placeholder: '请选择通配符或手动输入',
  placeholderTags: () => [
    '<产品名称>',
    '<日期>',
    '<时间>',
    '<时分秒>',
    '<动态标号>',
  ],
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'update:value': [value: string];
}>();

/** 优先 modelValue（标准 v-model），回退 value */
const effectiveValue = computed<string>(() => props.modelValue ?? props.value ?? '');

/** 内部输入内容（单一受控源） */
const customizeName = ref<string>(effectiveValue.value);

// 外部值（表单 setValues / 回填）变化时同步到内部
watch(effectiveValue, (val) => {
  if (customizeName.value !== val) {
    customizeName.value = val;
  }
});

/** 更新内部值并同步给表单（兼容两种绑定约定） */
function syncValue(next: string) {
  const val = typeof next === 'string' ? next : '';
  customizeName.value = val;
  emit('update:modelValue', val);
  emit('update:value', val);
}

function onInputChange(next: string) {
  syncValue(next);
}

function onTagClick(tag: string) {
  const currentVal = customizeName.value.trim();

  let next: string;
  // 切换功能：如果已存在则移除
  if (currentVal.includes(tag)) {
    // 转义特殊字符并匹配 "_<通配符>" 或 "<通配符>"
    const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const reg = new RegExp(`_?${escapedTag}`, 'g');
    next = currentVal.replace(reg, '');
  } else {
    // 追加逻辑：已有内容时自动补下划线
    const separator = currentVal.length > 0 ? '_' : '';
    next = currentVal + separator + tag;
  }

  // 长度截断
  if (next.length > props.maxLength) {
    next = next.slice(0, props.maxLength);
  }
  syncValue(next);
}
</script>

<template>
  <div class="ad-name-gen">
    <Input
      :value="customizeName"
      :placeholder="placeholder"
      :disabled="disabled"
      :maxlength="maxLength"
      @update:value="onInputChange"
    />
    <div class="mt-2 flex flex-wrap gap-1">
      <Tag
        v-for="tag in placeholderTags"
        :key="tag"
        :color="customizeName.includes(tag) ? 'blue' : 'default'"
        class="cursor-pointer"
        @click="onTagClick(tag)"
      >
        {{ tag }}
      </Tag>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ad-name-gen {
  width: 100%;
}

:deep(.ant-tag) {
  user-select: none;
  margin: 0;
}
</style>
