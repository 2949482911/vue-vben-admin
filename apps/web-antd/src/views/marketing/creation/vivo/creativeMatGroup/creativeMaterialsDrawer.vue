<script lang="ts" setup>
import {useVbenDrawer} from '@vben/common-ui';
import {useVbenForm} from '#/adapter/form';
import {ref} from 'vue';
import {Input, InputNumber, message, RadioButton, RadioGroup, Tag} from 'ant-design-vue';
import CreativeProductionModule from '../../creativeProduction.vue';
import {DISPLAYFORM_SELECT} from '../projectEnum';
import {adInvestmentApi} from '#/api';
import type {AccountInfo, Material, MaterialData} from "#/views/marketing/creation/creation";
import type {VivoPromotionData} from "#/views/marketing/creation/vivo/vivo";
import { useProjectPlaceholder } from "#/utils/customName";

const { customizeName, handleTagClick, placeholders } = useProjectPlaceholder('', 100);

const emit = defineEmits(['update:creativeMaterialsDrawerConfig', 'update:creativeMaterialsGroupList'])
const creativeProductionModuleRef = ref();
const {accountInfo, campaign} = defineProps({
  // 媒体账户
  accountInfo: {
    type: Array as () => AccountInfo[],
    default: () => ([])
  },
  campaign: {
    type: Object,
    default: () => {
      return {
        name: "",
        adType: 0,
        mediaType: 0,
        dailyBudget: 0,
        campaignType: 0,
        pushForm: 0,
        pushType: 0,
        promotionType: 0,
        conversionMonitorType: 0
      }
    }
  },
  // 广告创意素材组信息
});

// 本地素材临时变量
const materialData = ref<MaterialData>(
  {
    config: {
      method: "all",
    },
    // 数据直接获取子组件方法
    data: new Map<string, Material[]>
  }
);

/**
 * 初始化子组件本地临时变量
 */
function changeConfigMethodHandler(method: string) {
  creativeProductionModuleRef.value?.initLocalMaterialData(method);
}

/**
 * 广告信息基础字段
 */

const promotionObj = ref<VivoPromotionData>({
  deepLink: "",
  generalSwitch: 0,
  groupId: "",
  h5Code: "",
  h5Type: 0,
  name: "",
  pageUrl: "",
  videoAttribution: 0,
  config: {
    videoMaxCount: 5,
    imageMaxCount: 5,
    materialNormId: 0,
    placeType: 0,
    strongReminder: 0,
    virtualPositionId: ""
  }
});
const moduleKey = ref(0);

//创意类型的下拉
const creativeTypeOptions = ref<{ label: string; value: number; displayType: number }[]>([])

async function creativeTypeEvent(val: number) {
  if (!val) {
    formApi.updateSchema([{fieldName: 'materialNormId', componentProps: {options: []}}]);
    await formApi.setFieldValue("materialNormId", null)
    return;
  }
  // const ids = accountInfo.map((item: AccountInfo) => item.localAdvertiserId)
  try {
    const res = await adInvestmentApi.fetchCreativeType({
      // advertiserId: selectedAccountsInfo.ids > 0 ? ids : ["2004432916973719554"],上线需要放开
      advertiserId: ["2004432916973719554"],
      displayType: val,
      adType: campaign.adType,
      mediaType: campaign.mediaType,
      positionType: 1,
      genType: 2
    });
    creativeTypeOptions.value = (res || []).map((item: any) => ({
      label: String(item.id),
      value: item.id,
      displayType: item.displayType
    }));
    formApi.updateSchema([
      {
        fieldName: 'materialNormId',
        componentProps: {
          options: creativeTypeOptions.value
        }
      }
    ]);
    await formApi.setFieldValue('materialNormId', undefined);
  } catch (e) {
    message.error('获取创意类型失败');
  }
}

//投放虚拟位置的下拉
async function virtualLocation(val: number) {
  if (!val) {
    formApi.updateSchema([{fieldName: 'virtualPositionId', componentProps: {options: []}}]);
    await formApi.setFieldValue("virtualPositionId", [])
    return;
  }
  const displayTypeObj = creativeTypeOptions.value.find(item => item.value === val)
  // const ids = accountInfo.map((item: AccountInfo) => item.localAdvertiserId)
  try {
    const res = await adInvestmentApi.fetchVirtualLocation({
      // advertiserId: selectedAccountsInfo.ids > 0 ? ids : ["2004432916973719554"],上线需要放开
      advertiserId: ["2004432916973719554"],
      displayType: displayTypeObj!.displayType,
      adType: campaign.adType,
      mediaType: campaign.mediaType,
      normId: displayTypeObj!.value,
    });
    const formattedOptions = (res || []).map((item: {
      virtualPositionName: string,
      virtualPositionUuid: string
    }) => ({
      label: item.virtualPositionName,
      value: item.virtualPositionUuid,
    }));
    formApi.updateSchema([
      {
        fieldName: 'virtualPositionId',
        componentProps: {
          options: formattedOptions
        }
      }
    ]);
    await formApi.setFieldValue('virtualPositionId', []);
  } catch (e) {
    message.error('获取投放虚拟位置失败');
  }
}

//广告创意素材组
const [Drawer, drawerApi] = useVbenDrawer({
  closeOnClickModal: false,
  async onCancel() {
    await formApi.resetForm();
    // 先重置父组件的分配方式
    materialData.value.config.method = 'all';
    // await changeConfigMethodHandler('all')
    // 【关键】强制让子组件同步这个重置后的状态
    // 如果没有这一步，子组件内部的 localMaterialData 还是旧的
    creativeProductionModuleRef.value?.setLocalMaterialData(materialData.value);
    await drawerApi.close();
  },
  async onConfirm() {
    if (customizeName.value) await formApi.setValues({name: customizeName.value});
    await formApi.setValues({generalSwitch: promotionObj.value.generalSwitch});
    const isValidate = await formApi.validate();
    if (!isValidate.valid) return;

    // 2. 获取最新的素材数据
    // 注意：建议先获取最新数据再做判断，防止判断的是旧数据
    const latestMaterialData = creativeProductionModuleRef.value.getLocalMaterialData();
    const { data: materialMap } = latestMaterialData;

    // 【关键修改】：以父组件当前选中的 method 为准，而不是子组件返回的 config
    const currentMethod = materialData.value.config.method;

    // 3. 核心校验逻辑：判断素材是否选择完整
    let isMaterialValid = true;
    let errorMsg = '';

    if (currentMethod === 'all') {
      // 【全部相同模式】：只需判断 key 为 "0" 的数据
      const allData = materialMap.get("0") || [];
      // 校验逻辑：是否有组，且第一组是否有图片或视频
      if (allData.length === 0 || (allData[0].image.length === 0 && allData[0].video.length === 0)) {
        isMaterialValid = false;
        errorMsg = '请在全部相同模式下选择素材！';
      }
    } else {
      // 【按账户分配模式】：需要检查 accountInfo 中每一个账户在 Map 里是否有数据
      for (const account of accountInfo) {
        const accountKey = String(account.localAdvertiserId);
        const accountData = materialMap.get(accountKey) || [];
        
        // 校验该账户下是否至少有一个组选择了素材
        const hasSelected = accountData.some((group:Material) => group.image.length > 0 || group.video.length > 0);
        
        if (!hasSelected) {
          isMaterialValid = false;
          errorMsg = `账户 [${account.localAdvertiserId}] 尚未选择素材！`;
          break; // 只要有一个没选，就停止检查并报错
        }
      }
    }

    if (!isMaterialValid) {
      return message.warning(errorMsg);
    }

    const {
      placeType, materialNormId, virtualPositionId
    } = await formApi.getValues();

    promotionObj.value.config.virtualPositionId = virtualPositionId.join(',');
    promotionObj.value.config.materialNormId = materialNormId;
    promotionObj.value.config.placeType = placeType;
    promotionObj.value.name = customizeName.value;
    materialData.value = creativeProductionModuleRef.value.getLocalMaterialData()
    emit('update:creativeMaterialsDrawerConfig', promotionObj.value)
    emit('update:creativeMaterialsGroupList', materialData.value)
    await formApi.resetForm();
    await drawerApi.close();
  },
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const {promotion, material} = drawerApi.getData()
      promotionObj.value = promotion;
      customizeName.value = promotion.name
      if (material && material.config) {
      // 无论 material.data 有没有数据，都要先把模式同步过来
        materialData.value.config.method = material.config.method || 'all';
      }
      // 如果传入的数据有效，则赋值；否则保持默认
      if (material && material.data && material.data.size > 0) {
        materialData.value = material;
      } else {
        // 【解决消失的关键】如果发现没数据，主动初始化一次
        await changeConfigMethodHandler(materialData.value.config.method || 'all');
      }
      creativeProductionModuleRef.value?.setLocalMaterialData(materialData.value);
      await Promise.all([
        creativeTypeEvent(promotionObj.value.config.placeType || 0),
        virtualLocation(promotionObj.value.config.materialNormId || 0)
      ]);

      // 获取位置 ID 数组，严谨处理空字符串情况
      const vIds = promotionObj.value.config.virtualPositionId;
      const virtualPositionIdArray = (vIds && vIds.trim() !== "") 
        ? vIds.split(',') 
        : [];

      await formApi.setValues({
        name: customizeName.value,
        generalSwitch: promotionObj.value.generalSwitch,
        placeType: promotionObj.value.config.placeType,
        materialNormId: promotionObj.value.config.materialNormId,
        virtualPositionId: virtualPositionIdArray,
      });
    }
  }
});

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    // 所有表单项
    componentProps: {
      allowClear: true,
      class: 'w-[300px]'
    },
    labelWidth: 120,
  },
  schema: [
    {
      component: 'Default' as any,
      fieldName: 'name',
      label: '广告名称',
      rules: 'required',
      formItemClass: 'items-baseline',
    },
    {
      component: 'Default' as any,
      fieldName: 'creativity',
      label: '创意配置',
      formItemClass: 'items-baseline',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择',
        options: DISPLAYFORM_SELECT,
        onChange: async (val: number) => {
          await creativeTypeEvent(val);
        }
      },
      fieldName: 'placeType',
      label: '展现形式',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择',
        options: [],
        onChange: async (val: number) => {
          await virtualLocation(val);
        }
      },
      fieldName: 'materialNormId',//只选一个
      label: '创意类型',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择',
        options: [],
        mode: 'multiple',
      },
      fieldName: 'virtualPositionId',//可以选择多个
      label: '投放虚拟位置',
      rules: 'required',
    },
    {
      component: 'Default' as any,
      fieldName: 'generalSwitch',
      label: '流量优选开关',
      formItemClass: 'items-baseline',
    },
  ],
});

async function handleCreativeMaterialsGroupList(data: MaterialData) {
  materialData.value = data
}
</script>

<template>
  <div>
    <Drawer class="w-[50%]" title="广告创意素材组">
      <div class="mb-4">分配方式：
        <RadioGroup v-model:value="materialData.config.method" @change="(val) => changeConfigMethodHandler(val.target.value)">
          <RadioButton value="all">全部相同</RadioButton>
          <RadioButton value="account">按账户分配</RadioButton>
        </RadioGroup>
      </div>
      <Form>
        <template #name>
          <div class="flex flex-col gap-2 w-full">
            <Input
              v-model:value="customizeName"
              :maxlength="100"
              allow-clear
              show-count
              class="w-[300px]"
            />

            <div class="flex flex-wrap items-center gap-2 text-xs mt-1">
              <span class="text-gray-500 font-medium">通配符：</span>
              <template v-for="item in placeholders" :key="item.value">
                <Tag
                  class="cursor-pointer select-none transition-all hover:border-blue-400"
                  :color="customizeName.includes(item.value) ? 'blue' : 'default'"
                  @click="handleTagClick(item.value)"
                >
                  {{ item.value }}
                </Tag>
              </template>
            </div>
          </div>
        </template>
        <template #creativity>
          <div style="margin: 0 30px 0 0;font-size: 14px;">
            <InputNumber id="inputNumber" v-model:value="promotionObj.config.videoMaxCount" :min="1"
                         :max="100"/>
            个视频
          </div>
          <div style="font-size: 14px;">
            <InputNumber id="inputNumber" v-model:value="promotionObj.config.imageMaxCount" :min="1"
                         :max="100"/>
            个图片
          </div>
        </template>
        <template #generalSwitch>
          <RadioGroup v-model:value="promotionObj.generalSwitch">
            <RadioButton :value="0">关闭</RadioButton>
            <RadioButton :value="1">开启</RadioButton>
          </RadioGroup>
        </template>
      </Form>

      <!-- 创意组的组件 -->
      <CreativeProductionModule
        ref="creativeProductionModuleRef"
        :key="moduleKey"
        :videoMaxCount="promotionObj.config.videoMaxCount"
        :imageMaxCount="promotionObj.config.imageMaxCount"
        :distribution-mode="materialData.config.method"
        :accountInfo="accountInfo"
        @update:creativeMaterialsGroupList="handleCreativeMaterialsGroupList"
      />
    </Drawer>
  </div>
</template>

<style lang="scss" scoped>

</style>
