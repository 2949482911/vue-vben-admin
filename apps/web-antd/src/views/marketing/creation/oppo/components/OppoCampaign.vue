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
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.info-card {
  width: 100%;
  height: 100%;
  min-height: 300px;

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
    min-height: 57px;
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
  min-height: 150px;
}

.card-footer {
  display: flex;
  justify-content: center;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  margin-top: auto;
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
