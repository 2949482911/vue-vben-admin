<script setup lang="ts" name="AdNameGen">
import { watch } from 'vue';

import { Input, Tag } from 'ant-design-vue';

import { useProjectPlaceholder } from '#/utils/customName';

interface Props {
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

const modelValue = defineModel<string>({ default: '' });

// 使用已有的通配符管理逻辑
const { customizeName, handleTagClick } = useProjectPlaceholder(
  modelValue.value,
  props.maxLength,
);

// 双向同步：父组件 modelValue ↔ 内部 customizeName
watch(modelValue, (val) => {
  if (customizeName.value !== val) {
    customizeName.value = val;
  }
});

watch(customizeName, (val) => {
  if (modelValue.value !== val) {
    modelValue.value = val;
  }
});

function onTagClick(tag: string) {
  handleTagClick(tag);
}
</script>

<template>
  <div class="ad-name-gen">
    <Input
      v-model:value="customizeName"
      :placeholder="placeholder"
      :disabled="disabled"
      :maxlength="maxLength"
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
