<script setup lang="ts" name="VivoPromotionDrawer">
import { ref } from "vue";
import { useVbenDrawer } from "@vben/common-ui";
import { useVbenForm } from "#/adapter/form";
import type { VivoCampaignData } from "#/views/marketing/creation/vivo/vivo";
import type { AccountInfo } from "#/views/marketing/creation/creation";
import { COMPREHENSIVESEARCH_SELECT } from "#/views/marketing/creation/vivo/projectEnum";
import { adInvestmentApi } from "#/api";

/**
 * formFields 基础表单字段（从VivoBaseTemplate传入）
 * campaign 计划数据（用于获取adType、mediaType）
 * accountInfo 账户信息（用于传递advertiserId给接口）
 */
const { formFields, campaign, accountInfo } = defineProps({
  formFields: {
    type: Array,
    default: () => []
  },
  campaign: {
    type: Object as () => VivoCampaignData | null,
    default: () => null
  },
  accountInfo: {
    type: Array as () => AccountInfo[],
    default: () => []
  }
});

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    labelClass: 'w-[200px]',
    componentProps: {
      class: "w-[300px]"
    }
  }
});

// 创意类型选项（materialNormId 的下拉数据）
const creativeTypeOptions = ref<Array<{ label: string; value: number }>>([]);
// 虚拟广告位选项（virtualPositionId 的下拉数据）
const virtualPositionOptions = ref<Array<{ label: string; value: string }>>([]);

/**
 * placeType 变化 → 加载创意类型
 */
async function handlePlaceTypeChange(value: number) {
  if (!value || !campaign) return;

  creativeTypeOptions.value = [];
  // 重置下级选项
  virtualPositionOptions.value = [];

  const advertiserIds = accountInfo.map((x) => x.localAdvertiserId);
  const data = await adInvestmentApi.fetchCreativeType({
    advertiserId: advertiserIds,
    displayType: value,
    adType: campaign.adType,
    mediaType: campaign.mediaType,
    positionType: 1,
    genType: 2
  });

  creativeTypeOptions.value = (data || []).map((x: any) => ({
    label: `${x.displayMode1Name}-${x.dimensions}`,
    value: x.id
  }));

  // 更新 materialNormId 下拉选项
  formApi.updateSchema([
    {
      fieldName: 'materialNormId',
      componentProps: {
        options: creativeTypeOptions.value
      }
    }
  ]);

  // 清除已选的 materialNormId 和 virtualPositionId
  await formApi.setValues({
    materialNormId: undefined,
    virtualPositionId: undefined
  });
}

/**
 * materialNormId 变化 → 加载虚拟广告位
 */
async function handleMaterialNormChange(value: number) {
  if (!value || !campaign) return;

  virtualPositionOptions.value = [];

  const advertiserIds = accountInfo.map((x) => x.localAdvertiserId);
  const currentValues = await formApi.getValues();

  const data = await adInvestmentApi.fetchVirtualLocation({
    advertiserId: advertiserIds,
    normId: value,
    displayType: currentValues.placeType,
    adType: campaign.adType,
    mediaType: campaign.mediaType
  });

  virtualPositionOptions.value = (data || []).map((x: any) => ({
    label: x.virtualPositionName,
    value: x.virtualPositionUuid?.toString() || x.value?.toString() || ''
  }));

  // 更新 virtualPositionId 下拉选项
  formApi.updateSchema([
    {
      fieldName: 'virtualPositionId',
      componentProps: {
        options: virtualPositionOptions.value
      }
    }
  ]);

  // 清除已选的 virtualPositionId
  await formApi.setValues({
    virtualPositionId: undefined
  });
}

/**
 * 构建完整表单 schema：基础字段 + 三个联动字段
 */
function buildFullSchema() {
  return [
    ...(formFields as any[]),
    {
      component: 'Select',
      fieldName: 'placeType',
      label: '展现形式',
      rules: 'required',
      componentProps: {
        options: COMPREHENSIVESEARCH_SELECT,
        onChange: (value: number) => {
          handlePlaceTypeChange(value);
        },

      }
    },
    {
      component: 'Select',
      fieldName: 'materialNormId',
      label: '创意类型',
      rules: 'required',
      componentProps: {
        options: creativeTypeOptions.value,
        onChange: (value: number) => {
          handleMaterialNormChange(value);
        }
      }
    },
    {
      component: 'Select',
      fieldName: 'virtualPositionId',
      label: '虚拟广告位',
      rules: 'required',
      componentProps: {
        mode: "multiple",
        options: virtualPositionOptions.value
      }
    }
  ];
}

const [Drawer, drawerApi] = useVbenDrawer({
  closeOnClickModal: false,
  class: 'w-[30vw]',
  closeOnPressEscape: true,
  onOpenChange: async (isOpen: boolean) => {
    if (isOpen) {
      const promotion = drawerApi.getData();

      // 设置完整 schema（基础字段 + 联动字段）
      formApi.setState({
        schema: buildFullSchema()
      });

      // 将 promotion.config 平铺出来，用于表单回显
      const flattenedData = {
        ...promotion,
        placeType: promotion.config?.placeType ?? undefined,
        materialNormId: promotion.config?.materialNormId ?? undefined,
        virtualPositionId: promotion.config?.virtualPositionId ?? undefined
      };

      await formApi.setValues(flattenedData);

      // 如果有已选值，需要加载对应的下拉选项
      if (promotion.config?.placeType && campaign) {
        await handlePlaceTypeChange(promotion.config.placeType);
        if (promotion.config?.materialNormId) {
          await handleMaterialNormChange(promotion.config.materialNormId);
          // 恢复 virtualPositionId 的值（因为 handleMaterialNormChange 会清除它）
          if (promotion.config?.virtualPositionId) {
            await formApi.setValues({
              virtualPositionId: promotion.config.virtualPositionId
            });
          }
        }
        // 恢复 materialNormId 的值
        if (promotion.config?.materialNormId) {
          await formApi.setValues({
            materialNormId: promotion.config.materialNormId
          });
        }
      }
    }
  },
  onConfirm: async () => {
    const isValidate = await formApi.validate();
    if (!isValidate.valid) return;

    const currentValues = await formApi.getValues();

    // 将平铺的 config 字段还原到 config 对象中
    const promotion = {
      ...currentValues,
      config: {
        videoMaxCount: currentValues.config?.videoMaxCount ?? 0,
        imageMaxCount: currentValues.config?.imageMaxCount ?? 0,
        materialNormId: currentValues.materialNormId ?? 0,
        placeType: currentValues.placeType ?? 0,
        strongReminder: currentValues.config?.strongReminder ?? 0,
        virtualPositionId: currentValues.virtualPositionId ?? ''
      }
    };

    // 标记为已确认提交
    promotion._isConfirmed = true;

    drawerApi.setData(promotion);
    await drawerApi.close();
  },
  onClosed() {
    formApi.resetForm();
    drawerApi.close();
  },
  onCancel() {
    formApi.resetForm();
    drawerApi.close();
  }
});
</script>

<template>
  <div>
    <Drawer title="广告">
      <Form></Form>
    </Drawer>
  </div>
</template>

<style scoped lang="scss">
</style>
