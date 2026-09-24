<script setup lang="ts" name="TitleTextarea">
import { computed, ref, watch } from 'vue';

import { Input } from 'ant-design-vue';

const TextArea = Input.TextArea;

const props = withDefaults(
  defineProps<{
    /** 标准 v-model（手动使用时的绑定，数组每一项为一个标题） */
    modelValue?: string[];
    /** Vben 表单绑定字段（baseModelPropName: 'value'） */
    value?: string[];
    placeholder?: string;
    rows?: number;
    disabled?: boolean;
    /** 计数字段后缀文案，如「标题」显示为「共 N 个标题」 */
    countLabel?: string;
  }>(),
  {
    placeholder: '每行一个标题，按换行分隔',
    rows: 8,
    disabled: false,
    countLabel: '标题',
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string[]];
  'update:value': [value: string[]];
}>();

/** 优先 modelValue（标准 v-model），回退 value（Vben 表单绑定） */
const effectiveValue = computed<string[]>(() => {
  const val = props.modelValue ?? props.value;
  return Array.isArray(val) ? val : [];
});

const count = computed(() => effectiveValue.value.length);

/** 文本域内容，独立于 props 存储，避免输入时被外部旧值回写清空 */
const text = ref(effectiveValue.value.join('\n'));

// 外部值变化时同步到文本域
watch(effectiveValue, (val) => {
  const joined = (val ?? []).join('\n');
  if (joined !== text.value) {
    text.value = joined;
  }
});

/** 输入时：每行一个标题，自动去除空行与首尾空格 */
function handleChange(val: string) {
  text.value = val;
  const titles = val
    .split('\n')
    .map((item) => item.trim())
    .filter((item) => item !== '');
  emit('update:modelValue', titles);
  emit('update:value', titles);
}
</script>

<template>
  <div class="title-textarea">
    <TextArea
      :value="text"
      :rows="rows"
      :placeholder="placeholder"
      :disabled="disabled"
      @update:value="handleChange"
    />
    <div class="title-textarea-footer">
      共 {{ count }} 个{{ countLabel }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.title-textarea-footer {
  margin-top: 4px;
  font-size: 12px;
  color: #999;
  text-align: right;
  line-height: 20px;
}
</style>
