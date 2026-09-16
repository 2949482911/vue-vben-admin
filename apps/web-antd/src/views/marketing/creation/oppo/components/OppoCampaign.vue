<script setup lang="ts" name="OppoCampaign">
import { ref, watch } from 'vue';
import type { OppoCampaignData } from '#/views/marketing/creation/oppo/Oppo.types';
import { useVbenDrawer } from '@vben/common-ui';
import OppoCampaignDrawer from './OppoCampaignDrawer.vue';
import { Alert, Button, Card, Descriptions, DescriptionsItem } from 'ant-design-vue';

const emit = defineEmits(['update:campaign']);

const [CampaignDrawerModule, drawerApi] = useVbenDrawer({
  connectedComponent: OppoCampaignDrawer,
  onOpenChange(isOpen) {
    if (!isOpen) {
      debugger
      const campaignData = drawerApi.getData();
      campaignInfo.value = campaignData as OppoCampaignData;
      emit('update:campaign', campaignInfo.value);
    }
  },
});

const { formFields, campaignShowLabel, campaign, fieldLabelMap } = defineProps({
  formFields: { type: Array, default: () => [] },
  campaignShowLabel: { type: Object, default: () => ({}) },
  campaign: { type: Object as () => OppoCampaignData | null, default: () => ({}) },
  fieldLabelMap: { type: Object as () => Record<string, (value: any) => string>, default: () => ({}) },
});

const campaignInfo = ref<OppoCampaignData>({
  planName: '',
  extensionType: 1,
  dayLimit: 0,
  dayBudget: 0,
  deliveryMode: 0,
});

watch(
  () => campaign,
  (newCampaign) => {
    if (newCampaign) {
      campaignInfo.value = { ...newCampaign };
    }
  },
  { immediate: true, deep: true },
);

function openCampaignDrawer() {
  drawerApi.setData(campaignInfo.value);
  drawerApi.open();
}
</script>

<template>
  <div class="oppo-campaign-container">
    <Card title="计划" class="info-card">
      <div class="card-content">
        <Descriptions
          title="基本信息"
          v-if="campaignInfo.planName"
          :column="1"
          class="info-descriptions"
        >
          <DescriptionsItem
            v-for="(label, key) in campaignShowLabel"
            :key="key"
            :label="label"
          >
            {{ fieldLabelMap[key] ? fieldLabelMap[key](campaignInfo[key]) : campaignInfo[key] }}
          </DescriptionsItem>
        </Descriptions>
        <Alert
          v-else
          type="error"
          message="请先填写计划信息"
          class="empty-alert"
        />
      </div>
      <div class="card-footer">
        <Button primary danger @click="openCampaignDrawer">
          {{ campaignInfo.planName ? '编辑计划' : '添加计划' }}
        </Button>
      </div>
    </Card>
    <CampaignDrawerModule :form-fields="formFields" />
  </div>
</template>

<style scoped lang="scss">
.oppo-campaign-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.info-card {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  min-height: 0;
  overflow: hidden;

  &.ant-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
    transition: box-shadow 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgb(0 0 0 / 12%);
    }
  }

  :deep(.ant-card-head) {
    min-height: 57px;
    padding: 12px 16px;
    border-bottom: 1px solid rgb(0 0 0 / 6%);
  }

  :deep(.ant-card-body) {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    padding: 16px;
    overflow-y: auto;
  }
}

.card-content {
  flex: 1;
  padding-bottom: 16px;
  overflow-y: auto;
}

.card-footer {
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  padding-top: 16px;
  border-top: 1px solid rgb(0 0 0 / 6%);
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
