<script setup lang="ts" name="CustomLocationInput">
import { computed, ref, watch } from "vue";
import { Button, InputNumber, Popover, Space, Tag } from "ant-design-vue";

interface CustomLocation {
  longitude: number;
  latitude: number;
  radius: number;
}

// 数组形式
const modelValue = defineModel<CustomLocation[]>({ default: () => [] });

const visible = ref(false);

const tempLongitude = ref<number>();
const tempLatitude = ref<number>();
const tempRadius = ref<number>(200);

// 显示标签列表
const displayTags = computed(() => {
  return modelValue.value.map((item, index) => ({
    key: index,
    label: `经度:${item.longitude}, 纬度:${item.latitude}, 半径:${item.radius}米`,
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
  if (!tempLongitude.value || !tempLatitude.value || !tempRadius.value) {
    return;
  }

  // 添加新的地理位置到数组
  modelValue.value = [
    ...modelValue.value,
    {
      longitude: Number(tempLongitude.value.toFixed(6)),
      latitude: Number(tempLatitude.value.toFixed(6)),
      radius: tempRadius.value,
    },
  ];

  // 重置临时值
  tempLongitude.value = undefined;
  tempLatitude.value = undefined;
  tempRadius.value = 200;

  visible.value = false;
}

// 取消
function handleCancel() {
  tempLongitude.value = undefined;
  tempLatitude.value = undefined;
  tempRadius.value = 200;
  visible.value = false;
}

// 删除某个地理位置
function handleRemove(index: number) {
  modelValue.value = modelValue.value.filter((_, i) => i !== index);
}
</script>

<template>
  <Popover
    v-model:open="visible"
    trigger="click"
    placement="bottomLeft"
  >
    <template #content>
      <Space direction="vertical" :size="12">
        <div>
          <span class="mr-2">经度：</span>
          <InputNumber
            v-model:value="tempLongitude"
            :min="-180"
            :max="180"
            :precision="6"
            :step="0.000001"
            placeholder="-180 ~ 180"
            class="w-32"
          />
        </div>
        <div>
          <span class="mr-2">纬度：</span>
          <InputNumber
            v-model:value="tempLatitude"
            :min="-90"
            :max="90"
            :precision="6"
            :step="0.000001"
            placeholder="-90 ~ 90"
            class="w-32"
          />
        </div>
        <div>
          <span class="mr-2">半径：</span>
          <InputNumber
            v-model:value="tempRadius"
            :min="200"
            :max="25000"
            :precision="0"
            placeholder="200 ~ 25000 米"
            class="w-32"
          />
          <span class="ml-1 text-gray-400">米</span>
        </div>
        <div class="flex justify-end gap-2">
          <Button size="small" @click="handleCancel">取消</Button>
          <Button size="small" type="primary" @click="handleConfirm">确认</Button>
        </div>
      </Space>
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
