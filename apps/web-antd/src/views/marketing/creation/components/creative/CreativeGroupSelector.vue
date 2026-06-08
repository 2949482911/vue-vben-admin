<script setup lang="ts" name="CreativeGroupSelector">
// 创意组选择组件 - 供所有媒体公用
import {useVbenDrawer} from '@vben/common-ui';

import {ref, computed, watch} from 'vue';
import {Button, Card, Alert} from 'ant-design-vue';
import type {AccountInfo, MaterialData, Material} from '#/views/marketing/creation/creation';
import {RuleMethod} from '#/views/marketing/creation/creation_enums';
import CreativeGroupDrawer from './CreativeGroupDrawer.vue';
import CreativeGroupPreview from './CreativeGroupPreview.vue';

// 素材组抽屉
const [CreativeGroupDrawerComp, creativeGroupDrawerApi] = useVbenDrawer({
  connectedComponent: CreativeGroupDrawer
})


// 弹出事件
const emit = defineEmits(['update:material']);

// 传入的值
const {accountInfo, material, formSchema} = defineProps({
  accountInfo: {
    type: Array<AccountInfo>,
    default: () => [],
  },
  material: {
    type: Object as () => MaterialData | null,
    default: null,
  },
  formSchema: {
    type: Array,
    default: () => [],
  },
});

// 本地存储的创意素材数据
const localMaterial = ref<MaterialData>({
  config: {
    method: RuleMethod.ALL,
  },
  data: new Map<string, Material[]>(),
});


// 计算总素材数量
const totalCount = computed(() => {
  let total = 0;
  localMaterial.value.data.forEach(groups => {
    groups.forEach(g => {
      total += (g.video?.length || 0) + (g.image?.length || 0);
    });
  });
  return total;
});

const maxCount = 200;

// 打开编辑抽屉
function openEditDrawer() {
  creativeGroupDrawerApi.setData({
    // 将 localMaterial 的 data Map 转换为可传递的格式
    method: localMaterial.value.config.method,
    data: localMaterial.value.data,
  })
  creativeGroupDrawerApi.open();
}

// 抽屉确认回调
function handleDrawerConfirm(data: MaterialData) {
  // 直接接收完整的 MaterialData 对象
  localMaterial.value = {
    config: {...data.config},
    data: new Map(data.data),
  };
  // 弹出到最外层
  emit('update:material', {...localMaterial.value});
}

/**
 * 清空素材
 */
function handleClear() {
  localMaterial.value.data.clear();
  localMaterial.value.config.method = RuleMethod.ALL;
  emit('update:material', {...localMaterial.value});
}

// 监听父组件传入的 material 变化，实现回显
watch(
  () => material,
  (newMaterial) => {
    if (newMaterial && newMaterial.data) {
      localMaterial.value = {
        ...newMaterial,
        config: {...newMaterial.config},
        data: new Map(newMaterial.data),
      };
    }
  },
  {immediate: true, deep: true},
);
</script>

<template>
  <div>
    <!-- 已选素材预览 -->
    <Card title="创意组">
      <CreativeGroupPreview
        v-if="totalCount > 0"
        :material="localMaterial"
        :max-count="maxCount"
        @edit="openEditDrawer"
        @clear="handleClear"
      />
      <!-- 未选素材提示 -->
      <div v-else class="empty-placeholder">
        <Alert message="暂无创意组,请点击编辑添加"></Alert>
        <Button type="primary" ghost @click="openEditDrawer">编辑</Button>
      </div>

      <!-- 创意组编辑抽屉 -->
      <CreativeGroupDrawerComp
        :account-info="accountInfo"
        :form-schema="formSchema"
        @update:material="handleDrawerConfirm" />
    </Card>
  </div>
</template>

<style scoped lang="scss">
.creative-group-selector {
  width: 100%;
}

.empty-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
}
</style>
