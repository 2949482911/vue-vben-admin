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
const { formFields, adgroupShowLabel, adgroup } = defineProps({
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
  }
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
  <div>
    <Card title="广告">
      <Divider type="horizontal" />
      <Descriptions title="基本信息" v-if="adgroupInfo.dynamic_creative_name">
        <DescriptionsItem v-for="(label, key ) in adgroupShowLabel"
                          :key="key" :label="label" :span="5">
          {{ adgroupInfo[key] }}
        </DescriptionsItem>
      </Descriptions>
      <Alert v-else type="error" message="请先填写广告信息"></Alert>
      <Divider type="horizontal" />
      <Space align="center" class="w-full justify-center">
        <Button primary  @click="openAdgroupDrawer">
          {{ adgroupInfo.dynamic_creative_name ? "编辑广告" : "添加广告" }}
        </Button>
      </Space>
    </Card>

    <AdgroupDrawerModule :form-fields="formFields" />
  </div>
</template>

<style scoped lang="scss">

</style>
