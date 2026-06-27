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
  <div class="huawei-store-task-container">
    <Card title="任务" class="info-card">
      <div class="card-content">
        <Descriptions title="基本信息" v-if="campaignInfo.taskName" :column="1" class="info-descriptions">
          <DescriptionsItem v-for="(label, key ) in taskShowLabel"
                            :key="key" :label="label">
            {{ campaignInfo[key] }}
          </DescriptionsItem>
        </Descriptions>
        <Alert v-else type="error" message="请先填写任务信息" class="empty-alert"></Alert>
      </div>
      <div class="card-footer">
        <Button primary danger @click="openCampaignDrawer">
          {{ campaignInfo.taskName ? '编辑项目' : '添加项目' }}
        </Button>
      </div>

    </Card>

    <CampaignDrawerModule :form-fields="formFields"></CampaignDrawerModule>
  </div>
</template>

<style scoped lang="scss">
.huawei-store-task-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.info-card {
  width: 100%;
  height: 100%;
  min-height: 616px; // 固定最小高度，匹配子任务（300px * 2 + 16px gap）
  
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
