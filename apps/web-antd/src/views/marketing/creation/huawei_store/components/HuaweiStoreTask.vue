<script setup lang="ts" name="HuaweiStoreTask">
import {ref, watch} from 'vue';
import type {HuaWeiStoreCampaignData} from "#/views/marketing/creation/huawei_store/huawei_store";
import {Card, Divider, Descriptions, DescriptionsItem, Alert, Button, Space} from 'ant-design-vue';
import {useVbenDrawer} from '@vben/common-ui';
import HuaweiStoreTaskDrawer from './HuaweiStoreTaskDrawer.vue'

const {formFields, taskShowLabel, campaign} = defineProps({
  formFields: {
    type: Array,
    default: () => []
  },
  taskShowLabel: {
    type: Object,
    default: () => {
    }
  },
  campaign: {
    type: Object as () => HuaWeiStoreCampaignData | null,
    default: null
  }
});


const emit = defineEmits(["update:campaign"])


const [CampaignDrawerModule, drawerApi] = useVbenDrawer({
  connectedComponent: HuaweiStoreTaskDrawer,
  onOpenChange(isOpen) {
    if (!isOpen) {
      const campaignData = drawerApi.getData();
      campaignInfo.value = campaignData as HuaWeiStoreCampaignData;
      emit('update:campaign', campaignInfo.value);
    }
  },
});

// 计划信息
const campaignInfo = ref<HuaWeiStoreCampaignData>({
  appId: "",
  attributionMode: 3,
  budget: 200,
  campaignId: "",
  campaignInfo: {
    adNetwork: 1,
    buyMode: 1,
    campaignName: "",
    dailyBudget: 200,
    marketingGoal: 1,
    type: 1
  },
  clickAdMonitorReportUrl: "",
  deliveryHours: [],
  endDate: "",
  impAdMonitorReportUrl: "",
  isExcludeInstalledApp: 0,
  isPositiveRegion: "Y",
  regions: "CN",
  startDate: "",
  taskName: ""
});

// 监听父组件传入的 campaign 数据变化，实现回显（复用策略组时）
watch(
  () => campaign,
  (newCampaign) => {
    if (newCampaign) {
      campaignInfo.value = { ...newCampaign };
    }
  },
  { immediate: true, deep: true }
);


function openCampaignDrawer() {
  drawerApi.setData(campaignInfo.value);
  drawerApi.open();
}

</script>

<template>
  <div>
    <Card title="任务">
      <Divider type="horizontal"/>
      <Descriptions title="基本信息" v-if="campaignInfo.taskName">
        <DescriptionsItem v-for="(label, key ) in taskShowLabel"
                          :key="key" :label="label" :span="5">
          {{ campaignInfo[key] }}
        </DescriptionsItem>
      </Descriptions>
      <Alert v-else type="error" message="请先填写任务信息"></Alert>
      <Divider type="horizontal"/>
      <Space align="center" class="w-full justify-center">
        <Button primary danger @click="openCampaignDrawer">
          {{ campaignInfo.taskName ? '编辑项目' : '添加项目' }}
        </Button>
      </Space>

    </Card>

    <CampaignDrawerModule :form-fields="formFields"></CampaignDrawerModule>
  </div>
</template>

<style scoped lang="scss">

</style>
