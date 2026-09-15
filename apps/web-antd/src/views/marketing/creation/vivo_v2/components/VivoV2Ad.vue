<script setup lang="ts" name="VivoV2Ad">
import type {
  VivoV2AdData,
  VivoV2Creation,
} from '#/views/marketing/creation/vivo_v2/vivo_v2';

import { computed, ref, watch } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Alert, Button, Card, Descriptions, DescriptionsItem, message } from 'ant-design-vue';

import { z } from '#/adapter/form';
import {
  VIVO_V2_AD_H5_TYPE_OPTIONS,
  VIVO_V2_CREATIVE_SUPPLY_TYPE_OPTIONS,
} from '#/views/marketing/creation/vivo_v2/enums';
import { defaultVivoV2ConfigData } from '#/views/marketing/creation/vivo_v2/vivo_v2';

import VivoV2AdDrawer from './VivoV2AdDrawer.vue';

/**
 * vivo 2.0 广告组件 props
 * creationInfo 批创信息（广告数据取自 creationInfo.configData.ad）
 */
const props = defineProps({
  creationInfo: {
    type: Object as () => VivoV2Creation,
    default: () => ({}) as VivoV2Creation,
  },
});

/**
 * update:ad 更新广告信息
 */
const emit = defineEmits<{
  (e: 'update:ad', ad: Partial<VivoV2AdData>): void;
}>();

/**
 * 广告表单字段配置（vivo 2.0 ad/ad/add）
 *
 * 说明：
 * 1. 字段按接口文档分组，用 Divider 分块展示；
 * 2. 取值依赖 vivo 素材查询接口的字段（头像、图片、视频等）本次不接接口：
 *    - 图片素材 imgsCodeList 用 Select + mode="tags"，可先手工填写素材 code；
 *    - 单值型素材 code 用 Input，placeholder 标注待接入的接口名；
 * 3. 标题列表、视频素材为动态增减行，实际渲染在抽屉的 #titleList、#videoList 插槽中。
 */
const adFormFields: any[] = [
  // ==================== 基本信息 ====================
  {
    component: 'Divider',
    fieldName: '_dividerBasic',
    formItemClass: 'pb-0',
    hideLabel: true,
    renderComponentContent: () => ({ default: () => '基本信息' }),
  },
  {
    component: 'Input',
    fieldName: 'name',
    label: '广告名称',
    rules: z
      .string()
      .min(1, { message: '请输入广告名称' })
      .max(200, { message: '广告名称长度不得超过 200' }),
    componentProps: {
      placeholder: '广告名称，长度不得超过 200，同一计划下不可重复',
    },
  },
  {
    component: 'Input',
    fieldName: 'promotionContent',
    label: '推广名称',
    rules: z
      .string()
      .min(2, { message: '推广名称需 2-10 个字符' })
      .max(10, { message: '推广名称需 2-10 个字符' }),
    componentProps: {
      placeholder: '推广名称，2-10 个字符，不能是纯数字、纯符号',
    },
  },
  {
    component: 'Select',
    fieldName: 'creativeSupplyType',
    label: '创建方式',
    componentProps: {
      options: VIVO_V2_CREATIVE_SUPPLY_TYPE_OPTIONS,
      placeholder: '请选择创建方式',
    },
  },
  {
    component: 'Input',
    fieldName: 'avatarCode',
    label: '头像素材code',
    componentProps: {
      placeholder: '头像素材code（256*256，jpg/jpeg/png，≤50KB）（待接素材查询接口）',
    },
  },

  // ==================== 落地页与跳转（landingPage） ====================
  {
    component: 'Divider',
    fieldName: '_dividerLandingPage',
    formItemClass: 'pb-0',
    hideLabel: true,
    renderComponentContent: () => ({ default: () => '落地页与跳转（landingPage）' }),
  },
  {
    component: 'Input',
    fieldName: 'pageUrl',
    label: '落地页URL地址',
    componentProps: {
      placeholder: 'URL地址（待接落地页查询接口）',
    },
  },
  {
    component: 'Select',
    fieldName: 'h5Type',
    label: 'h5详情页来源',
    componentProps: {
      options: VIVO_V2_AD_H5_TYPE_OPTIONS,
      placeholder: '请选择h5详情页来源',
    },
  },
  {
    component: 'Input',
    fieldName: 'h5Code',
    label: 'h5详情页编码',
    componentProps: {
      placeholder: 'h5详情页ID或编码（待接落地页查询接口）',
    },
  },
  {
    component: 'Input',
    fieldName: 'deepLink',
    label: 'DeepLink',
    componentProps: {
      placeholder: 'DeepLink',
    },
  },

  // ==================== 监测地址 ====================
  {
    component: 'Divider',
    fieldName: '_dividerMonitor',
    formItemClass: 'pb-0',
    hideLabel: true,
    renderComponentContent: () => ({ default: () => '监测地址' }),
  },
  {
    component: 'Input',
    fieldName: 'viewMonitorUrl',
    label: '曝光监测地址',
    componentProps: {
      placeholder: '曝光监测地址',
    },
  },
  {
    component: 'Input',
    fieldName: 'clickMonitorUrl',
    label: '点击监测地址',
    componentProps: {
      placeholder: '点击监测地址',
    },
  },
  {
    component: 'Input',
    fieldName: 'wakeupMonitorUrl',
    label: '情景唤醒监测地址',
    componentProps: {
      placeholder: '情景唤醒监测地址',
    },
  },

  // ==================== 素材与标题 ====================
  {
    component: 'Divider',
    fieldName: '_dividerMaterial',
    formItemClass: 'pb-0',
    hideLabel: true,
    renderComponentContent: () => ({ default: () => '素材与标题' }),
  },
  {
    // 标题列表为动态增减行，实际渲染在抽屉的 #titleList 插槽中
    component: 'Input',
    fieldName: 'titleList',
    label: '标题列表',
  },
  {
    component: 'Select',
    fieldName: 'imgsCodeList',
    label: '图片素材',
    componentProps: {
      mode: 'tags',
      placeholder: '待接入素材查询接口，可先手工填写图片素材code',
    },
  },
  {
    // 视频素材为动态增减行，实际渲染在抽屉的 #videoList 插槽中
    component: 'Input',
    fieldName: 'videoList',
    label: '视频素材',
  },
];

/**
 * 广告编辑抽屉
 */
const [AdDrawerModule, drawerApi] = useVbenDrawer({
  connectedComponent: VivoV2AdDrawer,
  closeOnPressEscape: true,
  onOpenChange(isOpen) {
    if (!isOpen) {
      const { adData, _isConfirmed } = (drawerApi.getData() || {}) as {
        adData?: Partial<VivoV2AdData>;
        _isConfirmed?: boolean;
      };
      if (adData && _isConfirmed) {
        // 属性合并更新，避免覆盖模板预置的其他字段
        Object.assign(adInfo.value, adData);
        emit('update:ad', Object.assign({}, adData));
      }
    }
  },
});

/**
 * adInfo 广告信息 - 必须在 watch 之前定义
 */
const adInfo = ref<VivoV2AdData>(defaultVivoV2ConfigData().ad);

// 监听父组件传入的广告数据变化，实现回显（复用模板时）
watch(
  () => props.creationInfo?.configData?.ad,
  (newAd) => {
    if (newAd) {
      adInfo.value = { ...newAd };
    }
  },
  { immediate: true, deep: true },
);

/** 是否有账户 */
const hasAccount = computed(() => (props.creationInfo?.accountInfo?.length ?? 0) > 0);

/** 是否有产品 */
const hasProduct = computed(() => Boolean(props.creationInfo?.project?.projectId));

/**
 * 卡片展示字段（展示名称 -> 广告字段名），仅展示简单字段
 */
const adShowLabel: Record<string, keyof VivoV2AdData> = {
  广告名称: 'name',
  推广名称: 'promotionContent',
  DeepLink: 'deepLink',
  曝光监测地址: 'viewMonitorUrl',
  点击监测地址: 'clickMonitorUrl',
};

function openAdDrawer() {
  if (!hasProduct.value) {
    message.warning('请先选择产品');
    return;
  }
  if (!hasAccount.value) {
    message.warning('请先选择账户');
    return;
  }
  drawerApi.setData(adInfo.value);
  drawerApi.open();
}
</script>

<template>
  <div class="vivo-v2-ad-container">
    <Card title="广告" class="info-card">
      <div class="card-content">
        <Descriptions v-if="adInfo.name" :column="1">
          <DescriptionsItem v-for="(field, label) in adShowLabel" :key="field" :label="label">
            {{ adInfo[field] }}
          </DescriptionsItem>
        </Descriptions>
        <Alert v-else type="error" message="请先填写广告信息" />
      </div>

      <div class="card-footer">
        <Button type="primary" @click="openAdDrawer">
          {{ adInfo.name ? '编辑广告' : '添加广告' }}
        </Button>
      </div>
    </Card>

    <AdDrawerModule :form-fields="adFormFields" />
  </div>
</template>

<style scoped lang="scss">
.vivo-v2-ad-container {
  display: flex;
  flex: 1; // 让容器高度自适应，匹配父容器的高度
  flex-direction: column;
  width: 100%;
  min-height: 0; // 允许容器收缩，防止内容被挤压
}

.info-card {
  display: flex;
  flex: 1; // Card 自适应列高，保证与其他列底部对齐
  flex-direction: column;
  width: 100%;
  min-height: 300px;

  :deep(.ant-card-head) {
    flex-shrink: 0;
  }

  :deep(.ant-card-body) {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }
}

.card-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.card-footer {
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  padding-top: 16px;
  margin-top: 16px;
  border-top: 1px solid rgb(0 0 0 / 6%);
}
</style>
