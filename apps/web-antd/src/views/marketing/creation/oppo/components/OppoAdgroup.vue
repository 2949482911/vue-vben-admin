<script setup lang="ts" name="OppoAdgroup">
import { ref, watch } from 'vue';
import type { OppoAdgroupData } from '#/views/marketing/creation/oppo/Oppo.types';
import { useVbenDrawer, useVbenModal } from '@vben/common-ui';
import OppoAdgroupDrawer from './OppoAdgroupDrawer.vue';
import { Alert, Button, Card, Descriptions, DescriptionsItem } from 'ant-design-vue';
import AudiencePackageModal from '#/views/marketing/creation/components/audience_package/AudiencePackageModal.vue';
import AudiencePackageShow from '#/views/marketing/creation/components/audience_package/AudiencePackageShow.vue';
import type {
  AccountInfo,
  AudienceConfigData,
} from '#/views/marketing/creation/creation';
import { Platform } from '#/constants/enums';

const emit = defineEmits(['update:adgroup', 'update:audiencePackage']);

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

const { formFields, adgroupShowLabel, adgroup, audience, accountInfo, fieldLabelMap } = defineProps({
  formFields: { type: Array, default: () => [] },
  adgroupShowLabel: { type: Object, default: () => ({}) },
  adgroup: { type: Object as () => OppoAdgroupData | null, default: () => ({}) },
  audience: { type: Object as () => AudienceConfigData | null, default: null },
  accountInfo: { type: Array<AccountInfo>, default: () => [] },
  fieldLabelMap: { type: Object as () => Record<string, (value: any) => string>, default: () => ({}) },
});

const adgroupInfo = ref<OppoAdgroupData>({
  planId: '',
  adGroupName: '',
  pageUrl: '',
  extensionType: null,
  extensionFlow: 1,
  flowScene: 1,
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
  ocpcPrice: '',
  ocpcType: 0,
  pageId: '',
  pageType: 0,
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

// ---------- 选择定向包 ----------
const [AudiencePackage, audiencePackageModalApi] = useVbenModal({
  connectedComponent: AudiencePackageModal,
});

function updateAudiencePackage(audienceConfigData: AudienceConfigData) {
  emit('update:audiencePackage', audienceConfigData);
}

function openAudiencePackage() {
  audiencePackageModalApi.setData(audience);
  audiencePackageModalApi.open();
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

      <Card title="定向包" class="info-card">
        <div class="card-content">
          <AudiencePackageShow :audience="audience" />
        </div>
        <div class="card-footer">
          <Button primary danger @click="openAudiencePackage">
            添加定向包
          </Button>
        </div>
      </Card>
    </div>

    <AdgroupDrawerModule :form-fields="formFields" />

    <AudiencePackage
      :account-info="accountInfo"
      :platform="Platform.OPPO"
      @update:orientation="updateAudiencePackage"
    />
  </div>
</template>

<style scoped lang="scss">
.oppo-adgroup-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.adgroup-cards-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
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
