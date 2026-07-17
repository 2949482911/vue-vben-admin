<script setup lang="ts" name="OppoPromotion">
import { ref, watch } from 'vue';
import type { OppoPromotionData } from '#/views/marketing/creation/oppo/Oppo.types';
import { useVbenDrawer } from '@vben/common-ui';
import OppoPromotionDrawer from './OppoPromotionDrawer.vue';
import { Alert, Button, Card, Descriptions, DescriptionsItem } from 'ant-design-vue';

const emit = defineEmits(['update:promotion']);

const [PromotionDrawerModule, drawerApi] = useVbenDrawer({
  connectedComponent: OppoPromotionDrawer,
  onOpenChange(isOpen) {
    if (!isOpen) {
      const promotionData = drawerApi.getData();
      promotionInfo.value = promotionData as OppoPromotionData;
      emit('update:promotion', promotionInfo.value);
    }
  },
});

const { formFields, promotionShowLabel, promotion, fieldLabelMap } = defineProps({
  formFields: { type: Array, default: () => [] },
  promotionShowLabel: { type: Object, default: () => ({}) },
  promotion: { type: Object as () => OppoPromotionData | null, default: () => ({}) },
  fieldLabelMap: { type: Object as () => Record<string, (value: any) => string>, default: () => ({}) },
});

const promotionInfo = ref<OppoPromotionData>({
  adGroupId: '',
  adName: '',
  globalSpecId: 1,
  adSource: 0,
  brandLogoImgId: '',
  brandName: '',
  buttonTxt: '',
  copywriter: '',
  copywriterId: '',
  downloadUrl: '',
  dynamicCr: 0,
  exposeUrl: '',
  videoImgId: '',
  imgMatIds: [],
  clickUrl: '',
  config: {
    videoMaxCount: 0,
    imageMaxCount: 0,
    materialNormId: 0,
    placeType: 0,
    strongReminder: 0,
    virtualPositionId: '',
  },
});

watch(
  () => promotion,
  (newPromotion) => {
    if (newPromotion) {
      promotionInfo.value = { ...newPromotion };
    }
  },
  { immediate: true, deep: true },
);

function openPromotionDrawer() {
  drawerApi.setData(promotionInfo.value);
  drawerApi.open();
}
</script>

<template>
  <div class="oppo-promotion-container">
    <Card title="广告创意" class="info-card">
      <div class="card-content">
        <Descriptions
          title="基本信息"
          v-if="promotionInfo.adName"
          :column="1"
          class="info-descriptions"
        >
          <DescriptionsItem
            v-for="(label, key) in promotionShowLabel"
            :key="key"
            :label="label"
          >
            {{ fieldLabelMap[key] ? fieldLabelMap[key](promotionInfo[key]) : promotionInfo[key] }}
          </DescriptionsItem>
        </Descriptions>
        <Alert
          v-else
          type="error"
          message="请先填写广告创意信息"
          class="empty-alert"
        />
      </div>
      <div class="card-footer">
        <Button primary danger @click="openPromotionDrawer">
          {{ promotionInfo.adName ? '编辑广告' : '添加广告' }}
        </Button>
      </div>
    </Card>
    <PromotionDrawerModule :form-fields="formFields" />
  </div>
</template>

<style scoped lang="scss">
.oppo-promotion-container {
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
