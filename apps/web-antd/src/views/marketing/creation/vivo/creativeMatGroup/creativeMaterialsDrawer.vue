<script lang="ts" setup>
import { useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';
import { ref, nextTick, type PropType } from 'vue';
import { Input, InputNumber, message, RadioButton, RadioGroup, Tag } from 'ant-design-vue';
import CreativeProductionModule from '../../creativeProduction.vue';
import {
  STORE_DISPLAY_FORMATS,
  NO_STORE_DISPLAY_FORMATS,
  ALLQIANCE_PRESENTATION_FORMAT,
} from '../projectEnum';
import { adInvestmentApi } from '#/api';
import type { AccountInfo, Material, MaterialData } from '#/views/marketing/creation/creation';
import type { VivoDeepLinkData, VivoPromotionData } from '#/views/marketing/creation/vivo/vivo';
import { useProjectPlaceholder } from '#/utils/customName';
import CreativeDeepLink from './creativeDeepLinkModule.vue';

const PROJECT_PLACEHOLDERS = [
  { label: '时间', value: '<时间>' },
  { label: '日期', value: '<日期>' },
  { label: '时分秒', value: '<时分秒>' },
  { label: '动态标号', value: '<动态标号>' },
] as const; // 使用 as const 保证类型安全

const { customizeName, handleTagClick } = useProjectPlaceholder('', 100);

const emit = defineEmits([
  'update:creativeMaterialsDrawerConfig',
  'update:creativeMaterialsGroupList',
  'update:deepLink',
]);
const creativeProductionModuleRef = ref();
const { accountInfo, campaign, deepLinkList } = defineProps({
  // 媒体账户
  accountInfo: {
    type: Array as () => AccountInfo[],
    default: () => [],
  },
  campaign: {
    type: Object,
    default: () => {
      return {
        name: '',
        adType: 0,
        mediaType: 0,
        dailyBudget: 0,
        campaignType: 0,
        pushForm: 0,
        pushType: 0,
        promotionType: 0,
        conversionMonitorType: 0,
      };
    },
  },
  deepLinkList: {
    type: Object as PropType<VivoDeepLinkData>,
    default: () => ({
      deepLinkConfig: { method: 'all' },
      data: new Map<string, string[]>(),
    }),
  },
});

// 用来做展示deepLink链接
const deepLinkText = ref<string>('');
// deepLink链接本地数据
const localdeepLinkList = ref<VivoDeepLinkData>({
  deepLinkConfig: {
    method: 'all',
  },
  data: new Map<string, Array<string>>(),
});

// 本地素材临时变量
const materialData = ref<MaterialData>({
  config: {
    method: 'all',
  },
  // 数据直接获取子组件方法
  data: new Map<string, Material[]>(),
});

/**
 * 初始化子组件本地临时变量
 */
function changeConfigMethodHandler(method: string) {
  // 1. 清空界面上的 Input 展示文字
  deepLinkText.value = '';
  // 2. 清空存储 deepLink 的数据结构
  // 注意：params 结构中的 data 是 Map，需要清空
  localdeepLinkList.value = {
    deepLinkConfig: { method },
    data: new Map(), // 直接赋予一个新的空 Map
  };
  creativeProductionModuleRef.value?.initLocalMaterialData(method);
}

/**
 * 广告信息基础字段
 */

const promotionObj = ref<VivoPromotionData>({
  deepLink: '',
  generalSwitch: 0,
  groupId: '',
  h5Code: '',
  h5Type: 0,
  name: '',
  pageUrl: '',
  videoAttribution: 0,
  config: {
    videoMaxCount: 5,
    imageMaxCount: 5,
    materialNormId: 0,
    placeType: 0,
    strongReminder: 0,
    virtualPositionId: '',
  },
});
const moduleKey = ref(0);

//创意类型的下拉
const creativeTypeOptions = ref<{ label: string; value: number; displayType: number }[]>([]);

async function creativeTypeEvent(val: number) {
  if (!val) {
    formApi.updateSchema([{ fieldName: 'materialNormId', componentProps: { options: [] } }]);
    formApi.updateSchema([{ fieldName: 'virtualPositionId', componentProps: { options: [] } }]);
    await formApi.setFieldValue('materialNormId', null);
    await formApi.setFieldValue('virtualPositionId', []);
    return;
  }
  const ids = accountInfo.map((item: AccountInfo) => item.localAdvertiserId);
  try {
    const res = await adInvestmentApi.fetchCreativeType({
      advertiserId: ids.length > 0 ? ids : [],
      displayType: val,
      adType: campaign.adType,
      mediaType: campaign.mediaType,
      positionType: 1,
      genType: 2,
    });
    creativeTypeOptions.value = (res || []).map((item: any) => ({
      label: item.displayMode1Name + '/' + item.dimensions + '/' + String(item.id),
      value: item.id,
      displayType: item.displayType,
    }));
    formApi.updateSchema([
      {
        fieldName: 'materialNormId',
        componentProps: {
          options: creativeTypeOptions.value,
        },
      },
    ]);
    await formApi.setFieldValue('materialNormId', undefined);
    await formApi.setFieldValue('virtualPositionId', []);
  } catch (e) {
    message.error('获取创意类型失败');
  }
}

//投放虚拟位置的下拉
async function virtualLocation(val: number) {
  if (!val) {
    formApi.updateSchema([{ fieldName: 'virtualPositionId', componentProps: { options: [] } }]);
    await formApi.setFieldValue('virtualPositionId', []);
    return;
  }
  const displayTypeObj = creativeTypeOptions.value.find((item) => item.value === val);
  const ids = accountInfo.map((item: AccountInfo) => item.localAdvertiserId);
  try {
    const res = await adInvestmentApi.fetchVirtualLocation({
      advertiserId: ids.length > 0 ? ids : [],
      displayType: displayTypeObj!.displayType,
      adType: campaign.adType,
      mediaType: campaign.mediaType,
      normId: displayTypeObj!.value,
    });
    const formattedOptions = (res || []).map(
      (item: { virtualPositionName: string; virtualPositionUuid: string }) => ({
        label: item.virtualPositionName,
        value: item.virtualPositionUuid,
      }),
    );
    formApi.updateSchema([
      {
        fieldName: 'virtualPositionId',
        componentProps: {
          options: formattedOptions,
        },
      },
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
    deepLinkText.value = '';
    await formApi.resetForm();
    // 先重置父组件的分配方式
    materialData.value.config.method = 'all';
    // 【关键】强制让子组件同步这个重置后的状态
    // 如果没有这一步，子组件内部的 localMaterialData 还是旧的
    creativeProductionModuleRef.value?.setLocalMaterialData(materialData.value);
    await drawerApi.close();
  },
  async onConfirm() {
    if (customizeName.value) await formApi.setValues({ name: customizeName.value });
    await formApi.setValues({ generalSwitch: promotionObj.value.generalSwitch });
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
      const allData = materialMap.get('0') || [];
      // 校验逻辑：是否有组，且第一组是否有图片或视频
      if (
        allData.length === 0 ||
        (allData[0].image.length === 0 && allData[0].video.length === 0)
      ) {
        isMaterialValid = false;
        errorMsg = '请在全部相同模式下选择素材！';
      }
    } else {
      // 【按账户分配模式】：需要检查 accountInfo 中每一个账户在 Map 里是否有数据
      for (const account of accountInfo) {
        const accountKey = String(account.localAdvertiserId);
        const accountData = materialMap.get(accountKey) || [];

        // 校验该账户下是否至少有一个组选择了素材
        const hasSelected = accountData.some(
          (group: Material) => group.image.length > 0 || group.video.length > 0,
        );

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

    const { placeType, materialNormId, virtualPositionId } = await formApi.getValues();

    promotionObj.value.config.virtualPositionId = virtualPositionId.join(',');
    promotionObj.value.config.materialNormId = materialNormId;
    promotionObj.value.config.placeType = placeType;
    promotionObj.value.name = customizeName.value;
    materialData.value = creativeProductionModuleRef.value.getLocalMaterialData();
    emit('update:creativeMaterialsDrawerConfig', promotionObj.value);
    emit('update:creativeMaterialsGroupList', materialData.value);
    emit('update:deepLink', localdeepLinkList.value);
    await formApi.resetForm();
    await drawerApi.close();
  },
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const { promotion, material } = drawerApi.getData();

      // 1. 基础同步数据赋值
      promotionObj.value = promotion;
      customizeName.value = promotion.name;
      await updateDeepLink(deepLinkList);

      // 2. 初始化素材模式
      if (material?.config) {
        materialData.value.config.method = material.config.method || 'all';
      }

      // 3. 处理级联接口回显 (核心改进)
      const { placeType, materialNormId, virtualPositionId } = promotion.config;
      const vIds = virtualPositionId?.trim() ? virtualPositionId.split(',') : [];

      // 展现形式根据项目的媒体类型来决定
      const targetOptions =
        campaign.mediaType === 0
          ? STORE_DISPLAY_FORMATS
          : campaign.mediaType === 1
            ? NO_STORE_DISPLAY_FORMATS
            : ALLQIANCE_PRESENTATION_FORMAT;

      formApi.updateSchema([
        {
          fieldName: 'placeType',
          componentProps: { options: targetOptions },
        },
      ]);

      try {
        // 第一步：先加载“创意类型”的 Options
        if (placeType) {
          await creativeTypeEvent(placeType);
        }

        // 第二步：如果已经有创意类型 ID，接着加载“虚拟位置”的 Options
        if (materialNormId) {
          await virtualLocation(materialNormId);
        }

        // 第三步：当所有 Options 都准备好了，再统一给表单赋值
        // 这样表单渲染时就能直接匹配到 Label，不会出现回显慢或跳变
        await formApi.setValues({
          name: customizeName.value,
          generalSwitch: promotion.generalSwitch,
          placeType: placeType,
          materialNormId: materialNormId,
          virtualPositionId: vIds,
        });
      } catch (error) {
        console.error('回显接口加载失败', error);
      }

      // 4. 处理素材组件数据同步
      if (material?.data && material.data.size > 0) {
        // 关键：克隆 Map 和内部数组，不直接使用material，否则还没点击确定，里面的增删改都传给了父组件
        const clonedData = new Map();
        material.data.forEach((value: any, key: string) => {
          clonedData.set(key, JSON.parse(JSON.stringify(value)));
        });

        materialData.value = {
          config: { ...material.config },
          data: clonedData,
        };
        nextTick(() => {
          // 将这份独立的数据副本交给子组件
          creativeProductionModuleRef.value?.setLocalMaterialData(materialData.value);
        });
      } else {
        await changeConfigMethodHandler(materialData.value.config.method);
        nextTick(() => {
          const initializedData = creativeProductionModuleRef.value?.getLocalMaterialData();
          if (initializedData) {
            materialData.value = initializedData;
          }
        });
      }
    }
  },
});

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    // 所有表单项
    componentProps: {
      allowClear: true,
      class: 'w-[300px]',
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
        options: [],
        onChange: async (val: number) => {
          await creativeTypeEvent(val);
        },
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
        },
      },
      fieldName: 'materialNormId', //只选一个
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
      fieldName: 'virtualPositionId', //可以选择多个
      label: '投放虚拟位置',
      rules: 'required',
    },
    {
      component: 'Default' as any,
      fieldName: 'deepLink',
      label: 'deepLink链接',
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
  materialData.value = data;
}

// deepLink链接弹框
const [CreativeDeepLinkModule, modalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: CreativeDeepLink,
});
function openDeepLinkPopUp() {
  modalApi.setData(materialData.value.config.method);
  modalApi.open();
}

async function updateDeepLink(params: VivoDeepLinkData) {
  if (!params || !params.data) return;
  // 辅助工具：统一从 Map 或 Object 中取值
  const getValue = (key: string): string[] | undefined => {
    const data = params.data as any;
    if (typeof data.get === 'function') {
      return data.get(key);
    }
    return data[key];
  };

  if (params.deepLinkConfig.method === 'all') {
    const data = getValue('0');
    if (data) {
      deepLinkText.value = String(data[0]) || '';
    }
  } else {
    // 遍历账号信息，找到第一个有值的账号链接
    const firstValidAccount = accountInfo.find((account) => {
      const accountId = String(account.localAdvertiserId);
      const val = getValue(accountId);
      // 判断该账户对应的数组是否存在，且第一个元素不为空字符串
      return val && val.length > 0 && val[0] !== '';
    });

    if (firstValidAccount) {
      const accountId = String(firstValidAccount.localAdvertiserId);
      const data = getValue(accountId);
      deepLinkText.value = data ? String(data[0]) : '';
    } else {
      // 如果所有账户都没填，则清空显示
      deepLinkText.value = '';
    }
  }
  localdeepLinkList.value = params;
}
</script>

<template>
  <div>
    <Drawer class="w-[50%]" title="广告创意素材组">
      <div class="mb-4">
        分配方式：
        <RadioGroup
          v-model:value="materialData.config.method"
          @change="(val) => changeConfigMethodHandler(val.target.value)"
        >
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
              <template v-for="item in PROJECT_PLACEHOLDERS" :key="item.value">
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
          <div style="margin: 0 30px 0 0; font-size: 14px">
            <InputNumber
              id="inputNumber"
              v-model:value="promotionObj.config.videoMaxCount"
              :min="0"
              :max="100"
            />
            个视频
          </div>
          <div style="font-size: 14px">
            <InputNumber
              id="inputNumber"
              v-model:value="promotionObj.config.imageMaxCount"
              :min="0"
              :max="100"
            />
            个图片
          </div>
        </template>
        <template #generalSwitch>
          <RadioGroup v-model:value="promotionObj.generalSwitch">
            <RadioButton :value="0">关闭</RadioButton>
            <RadioButton :value="1">开启</RadioButton>
          </RadioGroup>
        </template>
        <template #deepLink>
          <Input
            class="w-[300px]"
            placeholder="请输入"
            v-model:value="deepLinkText"
            readonly
            @click="openDeepLinkPopUp"
          />
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
    <CreativeDeepLinkModule
      :accountInfo="accountInfo"
      :deepLinkList="deepLinkList"
      @update:deepLink="updateDeepLink"
    />
  </div>
</template>

<style lang="scss" scoped></style>
