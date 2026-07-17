<script setup lang="ts" name="TencentAdgroup">
import { ref, watch } from "vue";
import type { TencentAdgroupData } from "#/views/marketing/creation/tencent/tencent";
import { useVbenDrawer } from "@vben/common-ui";
import TencentAdgroupDrawer from "./TencentAdgroupDrawer.vue";
import {
  Alert,
  Button,
  Card,
  Descriptions,
  DescriptionsItem,
  Divider,
  Space
} from "ant-design-vue";

/**
 * update:adgroup 更新广告信息
 */
const emit = defineEmits(["update:adgroup"]);


/**
 * 广告编辑抽屉
 */
const [AdgroupDrawerModule, drawerApi] = useVbenDrawer({
  connectedComponent: TencentAdgroupDrawer,
  onOpenChange(isOpen) {
    if (!isOpen) {
      const adgroupData = drawerApi.getData();
      adgroupInfo.value = adgroupData as TencentAdgroupData;
      emit("update:adgroup", adgroupInfo.value);
    }
  }
});


/**
 * formFields 展示的表单
 * adgroupShowLabel 展示的label
 * adgroup 广告数据
 */
const { formFields, adgroupShowLabel, adgroup, fieldLabelMap } = defineProps({
  formFields: {
    type: Array,
    default: () => []
  },
  adgroupShowLabel: {
    type: Object,
    default: () => {}
  },
  adgroup: {
    type: Object as () => TencentAdgroupData | null,
    default: () => {}
  },
  fieldLabelMap: { type: Object as () => Record<string, (value: any) => string>, default: () => ({}) },
});


// adgroupInfo 广告信息 - 必须在 watch 之前定义
const adgroupInfo = ref<TencentAdgroupData>({
  click_tracking_url: "",
  impression_tracking_url: "",
  page_track_url: "",
  adgroup_id: 0,
  dynamic_creative_name: "",
  creative_template_id: "",
  delivery_mode: "",
  dynamic_creative_type: "",
  auto_derived_program_creative_switch: false,
  configured_status: "",
  site_set_validate_model: "",
  creative_components: [],
  program_creative_info_switch: false,
  program_creative_info: {
    material_derive_id: 0,
    bid_mode: "",
    derive_version: "",
    material_derive_info: {
      original_material_id_list: [],
      original_adcreative_template_id_list: [],
      original_cover_image_id: "",
      derive_data_list: []
    }
  }
});


// 监听父组件传入的 adgroup 数据变化，实现回显（复用策略组时）
watch(
  () => adgroup,
  (newAdgroup) => {
    if (newAdgroup) {
      adgroupInfo.value = { ...newAdgroup };
    }
  },
  { immediate: true, deep: true }
);


function openAdgroupDrawer() {
  drawerApi.setData(adgroupInfo.value);
  drawerApi.open();
}

</script>

<template>
  <div class="tencent-adgroup-container">
    <Card title="动态创意" class="info-card">
      <div class="card-content">
        <Descriptions title="基本信息" v-if="adgroupInfo.dynamic_creative_name" :column="1" class="info-descriptions">
          <DescriptionsItem v-for="(label, key ) in adgroupShowLabel"
                            :key="key" :label="label">
            {{ fieldLabelMap[key] ? fieldLabelMap[key](adgroupInfo[key]) : adgroupInfo[key] }}
          </DescriptionsItem>
        </Descriptions>
        <Alert v-else type="error" message="请先填写广告信息" class="empty-alert"></Alert>
      </div>
      <div class="card-footer">
        <Button primary @click="openAdgroupDrawer">
          {{ adgroupInfo.dynamic_creative_name ? "编辑广告" : "添加广告" }}
        </Button>
      </div>
    </Card>
    <AdgroupDrawerModule :form-fields="formFields" />
  </div>
</template>

<style scoped lang="scss">
.tencent-adgroup-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.info-card {
  width: 100%;
  height: 100%;
  min-height: 616px; // 固定最小高度，匹配营销单元（300px * 2 + 16px gap）
  
  // Card 样式优化
  &.ant-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: box-shadow 0.3s ease;
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }
  }
  
  .ant-card-head {
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    padding: 12px 16px;
    min-height: 57px; // Card 标题固定高度
  }
  
  .ant-card-body {
    padding: 16px;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
}

.card-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 16px;
  min-height: 150px; // 增大内容区域最小高度，确保有足够空间显示内容
}

.card-footer {
  display: flex;
  justify-content: center; // 居中对齐
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  margin-top: auto; // 自动推到底部
}

.info-descriptions {
  .ant-descriptions-item-label {
    font-weight: 500;
  }
}

.empty-alert {
  margin: 8px 0;
}
</style>
