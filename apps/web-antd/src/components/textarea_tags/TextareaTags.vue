<script setup lang="ts" name="TextareaTags">
import { computed, nextTick, ref, watch } from 'vue';
import { Input, Tag } from 'ant-design-vue';
import { CloseOutlined } from '@ant-design/icons-vue';

const props = withDefaults(
  defineProps<{
    value?: string[];
    /** 最大标签数量 */
    maxCount?: number;
    /** 单个标签最小长度 */
    minLength?: number;
    /** 单个标签最大长度 */
    maxLength?: number;
    placeholder?: string;
    disabled?: boolean;
  }>(),
  {
    value: () => [],
    maxCount: Infinity,
    minLength: 0,
    maxLength: Infinity,
    placeholder: '请输入内容，按回车添加标签',
    disabled: false,
  },
);

const emit = defineEmits<{
  'update:value': [value: string[]];
}>();

const tags = ref<string[]>([...props.value]);
const inputValue = ref('');

// 外部值同步
watch(
  () => props.value,
  (newVal) => {
    tags.value = [...(newVal || [])];
  },
);

/** 是否还能添加标签 */
const canAddMore = computed(() => tags.value.length < props.maxCount);
const showInput = computed(() => !props.disabled && canAddMore);

function emitUpdate() {
  emit('update:value', [...tags.value]);
}

function addTag() {
  const text = inputValue.value.trim();
  if (!text) return;

  if (tags.value.length >= props.maxCount) return;

  if (text.length < props.minLength || text.length > props.maxLength) return;

  tags.value.push(text);
  inputValue.value = '';
  emitUpdate();
}

function removeTag(index: number) {
  tags.value.splice(index, 1);
  emitUpdate();
  // 删除后聚焦输入框
  nextTick(() => {
    const inputEl = document.querySelector<HTMLInputElement>(
      '.textarea-tags-input input',
    );
    inputEl?.focus();
  });
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault();
    addTag();
  }
  // Backspace 在输入框为空时删除最后一个 tag
  if (e.key === 'Backspace' && inputValue.value === '' && tags.value.length > 0) {
    tags.value.pop();
    emitUpdate();
  }
}
</script>

<template>
  <div
    class="textarea-tags-wrapper"
    :class="{ 'is-disabled': disabled }"
    @click="
      () => {
        const inputEl = document.querySelector<HTMLInputElement>(
          '.textarea-tags-input input',
        );
        inputEl?.focus();
      }
    "
  >
    <div class="textarea-tags-container">
      <TransitionGroup name="tag-item" tag="div" class="textarea-tags-list">
        <Tag
          v-for="(tag, index) in tags"
          :key="tag + index"
          :closable="!disabled"
          class="textarea-tag"
          @close="removeTag(index)"
        >
          <span class="tag-text">{{ tag }}</span>
          <template #closeIcon>
            <CloseOutlined class="tag-close-icon" />
          </template>
        </Tag>
      </TransitionGroup>

      <Input
        v-if="showInput"
        ref="inputRef"
        v-model:value="inputValue"
        class="textarea-tags-input"
        :disabled="disabled"
        :maxlength="maxLength < Infinity ? maxLength : undefined"
        :minlength="minLength > 0 ? minLength : undefined"
        :placeholder="tags.length === 0 ? placeholder : ''"
        :bordered="false"
        @keydown="handleKeydown"
      />
    </div>

    <div
      v-if="!disabled && maxCount < Infinity"
      class="textarea-tags-count"
    >
      {{ tags.length }} / {{ maxCount }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.textarea-tags-wrapper {
  position: relative;
  width: 100%;
  min-height: 80px;
  padding: 8px 12px 28px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background-color: #fff;
  cursor: text;
  transition: border-color 0.3s;

  &:hover {
    border-color: #4096ff;
  }

  &:focus-within {
    border-color: #4096ff;
    box-shadow: 0 0 0 2px rgba(5, 145, 255, 0.1);
  }

  &.is-disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
    border-color: #d9d9d9;

    &:hover {
      border-color: #d9d9d9;
    }
  }
}

.textarea-tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: flex-start;
  min-height: 40px;
}

.textarea-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.textarea-tag {
  display: inline-flex;
  align-items: center;
  margin: 0;
  max-width: 100%;
  line-height: 22px;

  :deep(.ant-tag-close-icon) {
    display: inline-flex;
    align-items: center;
    margin-left: 4px;
    cursor: pointer;

    .tag-close-icon {
      font-size: 10px;
      color: #999;

      &:hover {
        color: #ff4d4f;
      }
    }
  }
}

.textarea-tags-input {
  flex: 1;
  min-width: 120px;
  height: 28px;

  :deep(.ant-input) {
    height: 28px;
    padding: 0;
    border: none;
    box-shadow: none;
    background: transparent;

    &:focus {
      box-shadow: none;
    }
  }
}

.textarea-tags-count {
  position: absolute;
  bottom: 2px;
  right: 8px;
  font-size: 12px;
  color: #999;
  line-height: 20px;
  pointer-events: none;
}

/* 标签动画 */
.tag-item-enter-active {
  transition: all 0.25s ease;
}

.tag-item-leave-active {
  transition: all 0.2s ease;
}

.tag-item-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.tag-item-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
