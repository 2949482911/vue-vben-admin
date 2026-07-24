<script setup lang="ts" name="CreativeGroupSelector">
// 创意组选择组件 - 供所有媒体公用
import { useVbenDrawer } from "@vben/common-ui";

import { computed, ref, watch } from "vue";
import { Alert, Button, Card } from "ant-design-vue";
import type { AccountInfo, Material, MaterialData, RuleInfo } from "#/views/marketing/creation/creation";
import { RuleMethod } from "#/views/marketing/creation/creation_enums";
import CreativeGroupDrawer from "./CreativeGroupDrawer.vue";
import CreativeGroupPreview from "./CreativeGroupPreview.vue";

// 素材组抽屉
const [CreativeGroupDrawerComp, creativeGroupDrawerApi] = useVbenDrawer({
  connectedComponent: CreativeGroupDrawer
});


// 弹出事件
const emit = defineEmits(["update:material"]);

// 传入的值
const { accountInfo, material, formSchema, ruleInfo } = defineProps({
  accountInfo: {
    type: Array<AccountInfo>,
    default: () => []
  },
  material: {
    type: Object as () => MaterialData | null,
    default: null
  },
  formSchema: {
    type: Array,
    default: () => []
  },
  ruleInfo: {
    type: Object as () => RuleInfo,
    default: () => {}
  }
});

// 本地存储的创意素材数据
const localMaterial = ref<MaterialData>({
  config: {
    method: RuleMethod.ALL
  },
  data: new Map<string, Material[]>()
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
    data: localMaterial.value.data
  });
  creativeGroupDrawerApi.open();
}

/**
 * 更新素材数据
 */
function updateMaterial(data: MaterialData) {
  // 直接接收完整的 MaterialData 对象
  localMaterial.value = {
    config: { ...data.config },
    data: new Map(data.data)
  };
  // 弹出到最外层
  emit("update:material", { ...localMaterial.value });
}

/**
 * 清空素材
 */
function handleClear() {
  localMaterial.value.data.clear();
  localMaterial.value.config.method = RuleMethod.ALL;
  emit("update:material", { ...localMaterial.value });
}

// 监听父组件传入的 material 变化，实现回显
watch(
  () => material,
  (newMaterial) => {
    if (newMaterial && newMaterial.data) {
      // 处理普通对象转换为 Map（复用策略组时 JSON 序列化后 Map 变成普通对象）
      const dataMap = newMaterial.data instanceof Map
        ? newMaterial.data
        : new Map(Object.entries(newMaterial.data || {}));

      localMaterial.value = {
        ...newMaterial,
        config: { ...newMaterial.config },
        data: dataMap
      };
    }
  },
  { immediate: true, deep: true }
);
</script>

<template>
  <div class="creative-group-selector-container">
    <!-- 已选素材预览 -->
    <Card title="创意组" class="info-card">
      <div class="card-content">
        <CreativeGroupPreview
          v-if="totalCount > 0"
          :material="localMaterial"
          :max-count="maxCount"
          @edit="openEditDrawer"
          @clear="handleClear"
        />
        <!-- 未选素材提示 -->
        <Alert v-else message="暂无创意组,请点击编辑添加" class="empty-alert"></Alert>
      </div>
      <div class="card-footer">
        <Button type="primary" @click="openEditDrawer">编辑</Button>
      </div>

      <!-- 创意组编辑抽屉 -->
      <CreativeGroupDrawerComp
        :account-info="accountInfo"
        :form-schema="formSchema"
        :rule-info="ruleInfo"
        @update:material="updateMaterial" />
    </Card>
  </div>
</template>

<style scoped lang="scss">
.creative-group-selector-container {
  width: 100%;
  flex: 1; // 让容器高度自适应，匹配父容器的高度
  display: flex;
  flex-direction: column;
  min-height: 0; // 允许容器收缩，防止内容被挤压
}

.info-card {
  width: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  // Card 样式优化
  &.ant-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: box-shadow 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }
  }

  :deep(.ant-card-head) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    padding: 12px 16px;
    min-height: 57px; // Card 标题固定高度
  }

  :deep(.ant-card-body) {
    padding: 16px;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}

.card-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 16px;
}

.card-footer {
  display: flex;
  justify-content: center; // 居中对齐
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
}

.empty-alert {
  margin: 8px 0;
}
</style>
