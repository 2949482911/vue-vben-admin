<script setup lang="ts" name="OppoAdgroup">
import { ref, watch } from 'vue';
import type { OppoAdgroupData } from '#/views/marketing/creation/oppo/Oppo.types';
import { useVbenDrawer } from '@vben/common-ui';
import OppoAdgroupDrawer from './OppoAdgroupDrawer.vue';
import { Alert, Button, Card, Descriptions, DescriptionsItem } from 'ant-design-vue';

const emit = defineEmits(['update:adgroup']);

const [AdgroupDrawerModule, drawerApi] = useVbenDrawer({
  connectedComponent: OppoAdgroupDrawer,
  onOpenChange(isOpen) {
    if (!isOpen) {
      const adgroupData = drawerApi.getData();
      adgroupInfo.value = adgroupData as OppoAdgroupData;
      emit('update:adgroup', adgroupInfo.value);
    }
  },
});

const { formFields, adgroupShowLabel, adgroup, fieldLabelMap } = defineProps({
  formFields: { type: Array, default: () => [] },
  adgroupShowLabel: { type: Object, default: () => ({}) },
  adgroup: { type: Object as () => OppoAdgroupData | null, default: () => ({}) },
  fieldLabelMap: { type: Object as () => Record<string, (value: any) => string>, default: () => ({}) },
});

const adgroupInfo = ref<OppoAdgroupData>({
  planId: '',
  adGroupName: '',
  pageUrl: '',
  extensionType: 2,
  extensionFlow: 2,
  flowScene: 0,
  dayLimit: 0,
  beginTime: '',
  endTime: '',
  billingType: 1,
  adSearchPremiumKwSaveDTOList: [],
  appId: '',
  autoOpenFlag: 0,
  deepOcpcPrice: '',
  deepOcpcType: 0,
  deepUrl: '',
  instantAppId: '',
  instantAppUrl: '',
  ocpcOptmType: 0,
  ocpcPrice: 0,
  ocpcType: 0,
  pageId: '',
  pageType: 1,
  price: '',
  smartExpandType: 0,
  targetId: '',
  timeLimit: 0,
  timeSet: '',
  linkDeskFlag: 0,
  appletType: 0,
  kwOcpcPrice: '',
  kwDeepOcpcPrice: '',
  kwTargetROI: '',
  channelPkgId: '',
  defaultSecondStage: 0,
  targetROI: '',
  adsDpaProductDTO: {
    dpaProductType: 0,
    dpaProductLibraryId: 0,
    dpaProductIdList: [],
  },
  advertiseType: 0,
  pushAppPageType: 0,
  ocpxOptimizeSwitch: 0,
  ocpxOptimizeType: 0,
  extJson: '',
  appletId: '',
  appletPath: '',
  marketingObjectiveDTO: {
    dpaProductType: 3,
    dpaProductLibraryId: '',
    dpaProductIdList: [],
  },
});

watch(
  () => adgroup,
  (newAdgroup) => {
    if (newAdgroup) {
      adgroupInfo.value = { ...newAdgroup };
    }
  },
  { immediate: true, deep: true },
);

function openAdgroupDrawer() {
  drawerApi.setData(adgroupInfo.value);
  drawerApi.open();
}
</script>

<template>
  <div class="oppo-adgroup-container">
    <div class="adgroup-cards-wrapper">
      <Card title="广告组" class="info-card">
        <div class="card-content">
          <Descriptions
            title="基本信息"
            v-if="adgroupInfo.adGroupName"
            :column="1"
            class="info-descriptions"
          >
            <DescriptionsItem
              v-for="(label, key) in adgroupShowLabel"
              :key="key"
              :label="label"
            >
              {{ fieldLabelMap[key] ? fieldLabelMap[key](adgroupInfo[key]) : adgroupInfo[key] }}
            </DescriptionsItem>
          </Descriptions>
          <Alert
            v-else
            type="error"
            message="请先填写广告组信息"
            class="empty-alert"
          />
        </div>
        <div class="card-footer">
          <Button primary danger @click="openAdgroupDrawer">
            {{ adgroupInfo.adGroupName ? '编辑广告组' : '添加广告组' }}
          </Button>
        </div>
      </Card>


    </div>

    <AdgroupDrawerModule :form-fields="formFields" />
  </div>
</template>

<style scoped lang="scss">
.oppo-adgroup-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.adgroup-cards-wrapper {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
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
