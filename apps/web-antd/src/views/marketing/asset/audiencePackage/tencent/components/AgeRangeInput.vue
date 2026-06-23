<script setup lang="ts" name="AgeRangeInput">
import { computed, ref, watch } from "vue";
import { InputNumber, Popover, Space, Tag, Button } from "ant-design-vue";

interface AgeRange {
  min: number;
  max: number;
}

// 改为数组形式
const modelValue = defineModel<AgeRange[]>({ default: () => [] });

const visible = ref(false);

const tempMin = ref(18);
const tempMax = ref(66);

// 显示标签列表
const displayTags = computed(() => {
  return modelValue.value.map((item, index) => ({
    key: index,
    label: `${item.min}-${item.max}岁`,
  }));
});

// 监听 modelValue 变化
watch(
  () => modelValue.value,
  () => {
    visible.value = false;
  },
  { deep: true }
);

// 确认添加
function handleConfirm() {
  // 校验：最小值不能大于最大值
  if (tempMin.value > tempMax.value) {
    const temp = tempMin.value;
    tempMin.value = tempMax.value;
    tempMax.value = temp;
  }

  // 添加新的年龄范围到数组
  modelValue.value = [
    ...modelValue.value,
    { min: tempMin.value, max: tempMax.value },
  ];

  visible.value = false;
}

// 取消
function handleCancel() {
  tempMin.value = 18;
  tempMax.value = 66;
  visible.value = false;
}

// 删除某个年龄范围
function handleRemove(index: number) {
  modelValue.value = modelValue.value.filter((_, i) => i !== index);
}

// 打开弹窗
function handleOpen() {
  tempMin.value = 18;
  tempMax.value = 66;
  visible.value = true;
}
</script>

<template>
  <Popover
    v-model:open="visible"
    trigger="click"
    placement="bottomLeft"
  >
    <template #content>
      <div class="p-2">
        <Space direction="vertical" :size="8">
          <div class="flex items-center gap-2">
            <span class="text-sm">最小年龄：</span>
            <InputNumber
              v-model:value="tempMin"
              :min="18"
              :max="66"
              :precision="0"
              class="w-24"
            />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm">最大年龄：</span>
            <InputNumber
              v-model:value="tempMax"
              :min="18"
              :max="66"
              :precision="0"
              class="w-24"
            />
          </div>
          <div class="flex justify-end gap-2 mt-2">
            <Button size="small" @click="handleCancel">取消</Button>
            <Button size="small" type="primary" @click="handleConfirm">确认</Button>
          </div>
        </Space>
      </div>
    </template>
    <div class="flex items-center gap-1 flex-wrap min-h-[32px] px-2 py-1 border border-solid rounded cursor-pointer hover:border-primary transition-colors">
      <Tag
        v-for="tag in displayTags"
        :key="tag.key"
        closable
        @close="handleRemove(tag.key)"
      >
        {{ tag.label }}
      </Tag>
    </div>
  </Popover>
</template>

<style scoped lang="scss">
</style>
