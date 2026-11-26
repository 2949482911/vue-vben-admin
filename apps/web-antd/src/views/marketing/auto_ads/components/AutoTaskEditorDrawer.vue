<script setup lang="ts" name="AutoTaskEditorDrawer">
import type { AutoTaskTriggerMode } from '../types';
import type {
  AccountAssetConfig,
  MaterialAssetConfig,
  MediaAssetConfig,
  StrategyAssetConfig,
  TagAssetConfig,
} from './assets/types';

import type {
  AutoProxyAssetMode,
  AutoProxyCreateTaskRequest,
} from '#/api/models/auto_proxy_ads';

import { computed, h, reactive, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import {
  AimOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons-vue';
import {
  Alert,
  Card,
  CheckboxGroup,
  Col,
  Form,
  FormItem,
  Input,
  message,
  Radio,
  RadioGroup,
  Row,
  Select,
  Space,
  Tag,
  Typography,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { autoProxyAdsApi, projectApi } from '#/api/core';
import { getLabelColor } from '#/views/marketing/account/label/constants';
import { useAccountLabelOptions } from '#/views/marketing/account/label/useAccountLabelOptions';

import {
  ACCOUNT_STRATEGY_OPTIONS,
  SCHEDULE_FREQUENCY_OPTIONS,
  WEEKDAYS,
} from '../data';
import AccountAssetCard from './assets/AccountAssetCard.vue';
import AudiencePackageAssetCard from './assets/AudiencePackageAssetCard.vue';
import AwemeAssetCard from './assets/AwemeAssetCard.vue';
import LoadingPageAssetCard from './assets/LoadingPageAssetCard.vue';
import MaterialAssetCard from './assets/MaterialAssetCard.vue';
import ProductAssetCard from './assets/ProductAssetCard.vue';
import ProductLibraryAssetCard from './assets/ProductLibraryAssetCard.vue';
import StrategyGroupAssetCard from './assets/StrategyGroupAssetCard.vue';
import TitlePackageAssetCard from './assets/TitlePackageAssetCard.vue';

interface AutoTaskDraft {
  account: AccountAssetConfig;
  audiencePackage: TagAssetConfig;
  hostingAction: string;
  hostingDimension: 'ad' | 'plan';
  hostingExecution: string;
  hostingInterval: string;
  hostingMode: 'new' | 'none' | 'reuse';
  hostingName: string;
  hostingReuseTask: string;
  loadingPage: TagAssetConfig;
  material: MaterialAssetConfig;
  media: {
    aweme: MediaAssetConfig;
    product: MediaAssetConfig;
    productLibrary: MediaAssetConfig;
  };
  name: string;
  platform: string;
  platformModeKey: string;
  project: string;
  projectId: string;
  remark: string;
  scheduleCustomEnd: string;
  scheduleCustomStart: string;
  scheduleCustomTime: string;
  scheduleFrequency: string;
  scheduleMonthDay: string;
  scheduleTime: string;
  scheduleWeekdays: string[];
  strategy: StrategyAssetConfig;
  tagIds: string[];
  titlePackage: TagAssetConfig;
  triggerMode: AutoTaskTriggerMode;
}

const emit = defineEmits<{ success: [] }>();

const HOSTING_REUSE_OPTIONS = [
  {
    label: '番茄小说-自动止损-混合模式',
    value: '番茄小说-自动止损-混合模式',
  },
  { label: '甜宠-夜间补量-自动模式', value: '甜宠-夜间补量-自动模式' },
];

const MONTH_DAY_OPTIONS = [
  ...Array.from({ length: 28 }, (_, index) => ({
    label: `${index + 1} 日`,
    value: String(index + 1),
  })),
  { label: '月末', value: 'last' },
];

const projectOptions = ref<Array<{ label: string; value: string }>>([]);
const { labelNamesOf, labelOptions, loadLabelOptions } =
  useAccountLabelOptions();

function defaultMedia(): MediaAssetConfig {
  return {
    expire: 'all',
    manual: [],
    mode: 'tag',
    randomCount: 2,
  };
}

function defaultTagAsset(): TagAssetConfig {
  return {
    mode: 'tag',
    selected: [],
  };
}

function defaultDraft(): AutoTaskDraft {
  return {
    account: {
      accountAge: '30',
      accountLimit: 6,
      accountMinBalance: 5000,
      accountMode: 'auto',
      accountSelected: [],
      accountStatus: 'enabled',
      accountStrategy: 'balance-high',
    },
    audiencePackage: defaultTagAsset(),
    hostingAction: 'stop-loss',
    hostingDimension: 'ad',
    hostingExecution: 'auto',
    hostingInterval: '30',
    hostingMode: 'new',
    hostingName: '短剧-自动止损',
    hostingReuseTask: HOSTING_REUSE_OPTIONS[0]!.value,
    loadingPage: defaultTagAsset(),
    material: {
      materialCreated: '30',
      materialDedupe: true,
      materialFolders: [],
      materialFormat: 'all',
      materialSelected: [],
      materialTotal: 100,
      materialType: 'all',
    },
    media: {
      aweme: {
        ...defaultMedia(),
        manual: ['抖音号：爱看剧场'],
      },
      product: {
        ...defaultMedia(),
        manual: ['商品：转移笔记之横扫仙界'],
      },
      productLibrary: {
        ...defaultMedia(),
        manual: ['商品库：小说推广商品库'],
      },
    },
    name: '',
    platform: '巨量引擎-全域',
    platformModeKey: '',
    project: '',
    projectId: '',
    remark: '自动任务',
    scheduleCustomEnd: '2026-12-31T23:59',
    scheduleCustomStart: '2026-11-26T09:00',
    scheduleCustomTime: '09:30',
    scheduleFrequency: 'daily',
    scheduleMonthDay: '1',
    scheduleTime: '09:30',
    scheduleWeekdays: ['周一'],
    strategy: {
      strategyGroup: '',
      strategyMode: 'tag',
      strategyRule: 'latest',
    },
    tagIds: [],
    titlePackage: defaultTagAsset(),
    triggerMode: 'scheduled',
  };
}

const formState = reactive<AutoTaskDraft>(defaultDraft());
const assetModes = ref<AutoProxyAssetMode[]>([]);
const assetMode = ref<AutoProxyAssetMode>();
const orderedAssets = computed(() =>
  [...(assetMode.value?.assets ?? [])].sort((a, b) => a.step - b.step),
);
const platformModeOptions = ref<Array<{ label: string; value: string }>>([]);
const selectedTagNames = computed(() => labelNamesOf(formState.tagIds));

function tagRender(tagProps: any) {
  return h(
    Tag,
    {
      bordered: false,
      closable: tagProps.closable,
      color: getLabelColor(tagProps.label),
      onClose: tagProps.onClose,
      style: { marginInlineEnd: '4px' },
    },
    () => tagProps.label,
  );
}
const assetPlatform = computed(
  () => formState.platformModeKey.split('#')[0] || 'bytedance',
);
const assetPlatformMode = computed(
  () => formState.platformModeKey.split('#')[1] || 'uni',
);

const strategySummary = computed(() =>
  formState.strategy.strategyMode === 'group'
    ? formState.strategy.strategyGroup
    : `按标签匹配 · ${formState.strategy.strategyRule === 'latest' ? '最新启用' : formState.strategy.strategyRule === 'random' ? '随机' : '最少使用'}`,
);

const accountSummary = computed(() =>
  formState.account.accountMode === 'manual'
    ? `手动 · ${formState.account.accountSelected.length} 个`
    : `自动 · ${ACCOUNT_STRATEGY_OPTIONS.find((item) => item.value === formState.account.accountStrategy)?.label ?? '随机'} · ≤${formState.account.accountLimit}`,
);

const materialSummary = computed(
  () =>
    `${formState.material.materialFolders.length} 个文件夹 · 已选 ${formState.material.materialSelected.length} · 上限 ${formState.material.materialTotal}`,
);

const mediaSummary = computed(() => {
  const mediaAssets = orderedAssets.value.filter(
    (asset) => asset.scope === 'media',
  );
  if (!mediaAssets.length) {
    return '—';
  }
  const platform =
    platformModeOptions.value.find(
      (item) => item.value === formState.platformModeKey,
    )?.label ?? formState.platform;
  return `${platform} · ${mediaAssets.map((asset) => asset.label).join(' / ')}`;
});

const hostingSummary = computed(() => {
  if (formState.hostingMode === 'none') {
    return '不托管';
  }
  if (formState.hostingMode === 'reuse') {
    return formState.hostingReuseTask;
  }
  return `新建 · ${formState.hostingDimension === 'ad' ? '广告' : '计划'}维度 · 自动止损`;
});

const scheduleText = computed(() => {
  if (formState.triggerMode === 'manual') {
    return '手动运行';
  }
  if (['5m', '10m', '15m', '30m', '60m'].includes(formState.scheduleFrequency)) {
    return `每 ${formState.scheduleFrequency.replace('m', '')} 分钟`;
  }
  if (formState.scheduleFrequency === 'weekly') {
    return `每周${formState.scheduleWeekdays.join('、') || '未选择'} ${formState.scheduleTime}`;
  }
  if (formState.scheduleFrequency === 'monthly') {
    return `每月 ${formState.scheduleMonthDay === 'last' ? '月末' : `${formState.scheduleMonthDay} 日`} ${formState.scheduleTime}`;
  }
  if (formState.scheduleFrequency === 'custom') {
    return `自定义 ${formState.scheduleCustomStart.replace('T', ' ')} ~ ${formState.scheduleCustomEnd.replace('T', ' ')}`;
  }
  return `每天 ${formState.scheduleTime}`;
});

async function loadProjects() {
  try {
    const res: any = await projectApi.fetchProjectList({
      page: 1,
      pageSize: 1000,
    });
    projectOptions.value = (res?.items ?? []).map((item: any) => ({
      label: item.name,
      value: String(item.id),
    }));
    const matched = projectOptions.value.find(
      (item) => item.label === formState.project,
    );
    formState.projectId =
      matched?.value ?? projectOptions.value[0]?.value ?? '';
    if (!matched && projectOptions.value[0]) {
      formState.project = projectOptions.value[0].label;
    }
  } catch {
    projectOptions.value = [];
  }
}

const ASSET_COMPONENTS: Record<string, any> = {
  audience_package: AudiencePackageAssetCard,
  aweme: AwemeAssetCard,
  loading_page: LoadingPageAssetCard,
  material: MaterialAssetCard,
  platform_advertiser: AccountAssetCard,
  product: ProductAssetCard,
  product_library: ProductLibraryAssetCard,
  strategy_group: StrategyGroupAssetCard,
  title_package: TitlePackageAssetCard,
};

function configFor(code: string): any {
  switch (code) {
    case 'audience_package': {
      return formState.audiencePackage;
    }
    case 'aweme': {
      return formState.media.aweme;
    }
    case 'loading_page': {
      return formState.loadingPage;
    }
    case 'material': {
      return formState.material;
    }
    case 'platform_advertiser': {
      return formState.account;
    }
    case 'product': {
      return formState.media.product;
    }
    case 'product_library': {
      return formState.media.productLibrary;
    }
    case 'strategy_group': {
      return formState.strategy;
    }
    case 'title_package': {
      return formState.titlePackage;
    }
    default: {
      return {};
    }
  }
}

function hasAsset(code: string) {
  return orderedAssets.value.some((asset) => asset.code === code);
}

function handleProjectChange() {
  const option = projectOptions.value.find(
    (item) => item.value === formState.projectId,
  );
  if (option) {
    formState.project = option.label;
  }
}

function platformLabel(platform: string, mode: string) {
  if (platform === 'bytedance' && mode === 'uni') {
    return '巨量引擎-全域';
  }
  if (platform === 'bytedance' && mode === 'std') {
    return '巨量引擎-智擎';
  }
  return `${platform}-${mode}`;
}

async function loadAssetModes() {
  try {
    const modes = await autoProxyAdsApi.fetchAssetModes();
    assetModes.value = modes ?? [];
    platformModeOptions.value = assetModes.value.map((item) => ({
      label: platformLabel(item.platform, item.platformMode),
      value: `${item.platform}#${item.platformMode}`,
    }));
    const matched =
      platformModeOptions.value.find(
        (item) => item.label === formState.platform,
      ) ?? platformModeOptions.value[0];
    if (matched) {
      formState.platformModeKey = matched.value;
      formState.platform = matched.label;
    }
  } catch {
    assetModes.value = [];
    platformModeOptions.value = [];
  }
}

async function loadAssetMode() {
  const [platform, platformMode] = formState.platformModeKey.split('#');
  if (!platform || !platformMode) {
    assetMode.value = undefined;
    return;
  }
  try {
    assetMode.value = await autoProxyAdsApi.fetchAssetMode({
      platform,
      platformMode,
    });
  } catch {
    assetMode.value = undefined;
  }
}

async function handlePlatformModeChange() {
  const option = platformModeOptions.value.find(
    (item) => item.value === formState.platformModeKey,
  );
  if (option) {
    formState.platform = option.label;
  }
  drawerApi.setState({ loading: true });
  assetMode.value = undefined;
  try {
    await loadAssetMode();
  } finally {
    drawerApi.setState({ loading: false });
  }
}

function stringIds(values?: Array<number | string>) {
  return (values ?? []).map(String).filter((value) => value && value !== 'NaN');
}

function buildAssetConfigs() {
  const localAsset: Record<string, any>[] = [];
  const mediaAsset: Record<string, any>[] = [];
  for (const asset of orderedAssets.value) {
    const config: any = configFor(asset.code);
    if (asset.scope === 'media') {
      mediaAsset.push({
        assetType: asset.code,
        ids:
          config.mode === 'manual' ? stringIds(config.manual) : [],
        method: config.mode === 'manual' ? 'set' : 'auto',
      });
      continue;
    }

    let method = 'auto';
    let ids: string[] = [];
    const filters: Record<string, any>[] = [];
    switch (asset.code) {
      case 'platform_advertiser': {
        method = config.accountMode === 'manual' ? 'set' : 'auto';
        ids =
          config.accountMode === 'manual'
            ? stringIds(config.accountSelected)
            : [];
        break;
      }
      case 'title_package':
      case 'loading_page':
      case 'audience_package': {
        method = config.mode === 'manual' ? 'set' : 'auto';
        ids = config.mode === 'manual' ? stringIds(config.selected) : [];
        break;
      }
      case 'strategy_group': {
        method = config.strategyMode === 'group' ? 'set' : 'auto';
        break;
      }
      case 'material': {
        method = config.materialSelected.length ? 'set' : 'auto';
        ids = stringIds(config.materialSelected);
        if (config.materialFolders.length) {
          filters.push({
            field: 'albumIds',
            operator: 1,
            values: stringIds(config.materialFolders),
          });
        }
        if (config.materialCreated !== 'all') {
          const days = Number(config.materialCreated);
          if (days) {
            filters.push({
              field: 'createTime',
              operator: 8,
              values: [
                dayjs().subtract(days, 'day').format('YYYY-MM-DD'),
                dayjs().format('YYYY-MM-DD'),
              ],
            });
          }
        }
        break;
      }
      default: {
        break;
      }
    }
    localAsset.push({
      ...(filters.length ? { filters } : {}),
      ids,
      method,
      type: asset.code,
    });
  }
  return { localAsset, mediaAsset };
}

function buildAiHosting() {
  if (formState.hostingMode === 'none') {
    return { mode: 'none' };
  }
  if (formState.hostingMode === 'reuse') {
    return {
      mode: 'reuse',
      taskName: formState.hostingReuseTask,
    };
  }
  return {
    dimension: formState.hostingDimension,
    execution: formState.hostingExecution,
    intervalMinutes: Number(formState.hostingInterval),
    mode: 'new',
    name: formState.hostingName,
    action: formState.hostingAction,
  };
}

function buildRunSetting() {
  return {
    customEnd: formState.scheduleCustomEnd,
    customStart: formState.scheduleCustomStart,
    customTime: formState.scheduleCustomTime,
    frequency: formState.scheduleFrequency,
    monthDay: formState.scheduleMonthDay,
    time: formState.scheduleTime,
    triggerMode: formState.triggerMode,
    weekdays: formState.scheduleWeekdays,
  };
}

async function initializeDrawer() {
  drawerApi.setState({ loading: true });
  try {
    await Promise.all([loadLabelOptions(), loadProjects(), loadAssetModes()]);
    if (!formState.tagIds.length) {
      const first = labelOptions.value[0]?.value;
      if (first) {
        formState.tagIds = [first];
      }
    }
    await loadAssetMode();
  } finally {
    drawerApi.setState({ loading: false });
  }
}

const [Drawer, drawerApi] = useVbenDrawer({
  class: 'w-[75%]',
  closeOnClickModal: false,
  closeOnPressEscape: true,
  onOpenChange(isOpen) {
    if (!isOpen) {
      return;
    }
    Object.assign(formState, defaultDraft());
    drawerApi.setState({ title: '新建自动任务' });
    void initializeDrawer();
  },
  onConfirm: async () => {
    if (!formState.name.trim()) {
      message.warning('请输入任务名称');
      return;
    }
    if (!formState.remark.trim()) {
      message.warning('请输入备注');
      return;
    }
    if (!formState.tagIds.length) {
      message.warning('请至少选择一个全局标签');
      return;
    }
    const projectId = formState.projectId;
    if (!projectId) {
      message.warning('请选择项目');
      return;
    }
    const [platform, platformMode] = formState.platformModeKey.split('#');
    if (!platform || !platformMode) {
      message.warning('请选择平台');
      return;
    }
    if (
      formState.triggerMode === 'scheduled' &&
      formState.scheduleFrequency === 'weekly' &&
      !formState.scheduleWeekdays.length
    ) {
      message.warning('请选择固定周几');
      return;
    }
    const { localAsset, mediaAsset } = buildAssetConfigs();
    if (!localAsset.length || !mediaAsset.length) {
      message.warning('请先完成资产编排');
      return;
    }
    const payload: AutoProxyCreateTaskRequest = {
      aiHosting: buildAiHosting(),
      labelIds: stringIds(formState.tagIds),
      localAsset,
      mediaAsset,
      name: formState.name.trim(),
      platform,
      platformMode,
      projectId,
      remark: formState.remark.trim(),
      runSetting: buildRunSetting(),
    };
    drawerApi.lock();
    try {
      await autoProxyAdsApi.createTask(payload);
      message.success('任务创建成功');
      emit('success');
      await drawerApi.close();
    } catch (error: any) {
      message.error(error?.message ?? '任务创建失败');
    } finally {
      drawerApi.unlock();
    }
  },
});
</script>

<template>
  <Drawer>
    <div class="auto-task-drawer-body">
      <Row :gutter="[24, 24]">
        <Col :lg="17" :md="24" :sm="24" :xs="24">
          <Form class="auto-task-form" layout="vertical" :model="formState">
            <Card title="基础信息" class="auto-task-card">
              <Row :gutter="[24, 16]">
                <Col :span="12">
                  <FormItem label="任务名称" required>
                    <Input
                      v-model:value="formState.name"
                      placeholder="例如：短剧 · 横扫仙界 自动下发"
                    />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="备注" required>
                    <Input
                      v-model:value="formState.remark"
                      placeholder="请输入任务备注"
                    />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="平台">
                    <Select
                      v-model:value="formState.platformModeKey"
                      :options="platformModeOptions"
                      placeholder="请选择平台"
                      @change="handlePlatformModeChange"
                    />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="项目">
                    <Select
                      v-model:value="formState.projectId"
                      :options="projectOptions"
                      option-filter-prop="label"
                      placeholder="请选择项目"
                      show-search
                      @change="handleProjectChange"
                    />
                  </FormItem>
                </Col>
              </Row>
            </Card>

            <Card title="标签条件" class="auto-task-card">
              <FormItem label="全局标签池">
                <Select
                  v-model:value="formState.tagIds"
                  mode="multiple"
                  :options="labelOptions"
                  :tag-render="tagRender"
                  option-filter-prop="label"
                  placeholder="请选择标签，可多选"
                  show-search
                />
              </FormItem>
              <Alert
                type="info"
                show-icon
                message="所选标签组成任务条件池，统一匹配账户、素材、策略组和媒体资产。"
              />
            </Card>

            <template
              v-for="asset in orderedAssets"
              :key="asset.code"
            >
              <component
                :is="ASSET_COMPONENTS[asset.code]"
                v-if="ASSET_COMPONENTS[asset.code]"
                :asset="asset"
                :config="configFor(asset.code)"
                :platform="assetPlatform"
                :platform-mode="assetPlatformMode"
                :project-id="formState.projectId"
                :tag-ids="formState.tagIds"
                :tag-names="selectedTagNames"
              />
            </template>

            <Card title="托管规则" class="auto-task-card">
              <FormItem label="托管模式">
                <RadioGroup v-model:value="formState.hostingMode">
                  <Radio value="new">新建规则</Radio>
                  <Radio value="reuse">复用已有</Radio>
                  <Radio value="none">不托管</Radio>
                </RadioGroup>
              </FormItem>

              <template v-if="formState.hostingMode === 'new'">
                <Row :gutter="[24, 16]">
                  <Col :span="12">
                    <FormItem label="规则名称">
                      <Input v-model:value="formState.hostingName" />
                    </FormItem>
                  </Col>
                  <Col :span="12">
                    <FormItem label="监控维度">
                      <Select
                        v-model:value="formState.hostingDimension"
                        :options="[
                          { label: '广告', value: 'ad' },
                          { label: '计划', value: 'plan' },
                        ]"
                      />
                    </FormItem>
                  </Col>
                  <Col :span="12">
                    <FormItem label="执行动作">
                      <Select
                        v-model:value="formState.hostingAction"
                        :options="[
                          { label: '自动止损', value: 'stop-loss' },
                          { label: '自动停投', value: 'pause' },
                          { label: '仅告警', value: 'alert' },
                        ]"
                      />
                    </FormItem>
                  </Col>
                  <Col :span="12">
                    <FormItem label="执行方式">
                      <Select
                        v-model:value="formState.hostingExecution"
                        :options="[
                          { label: '自动执行', value: 'auto' },
                          { label: '仅提醒', value: 'notify' },
                        ]"
                      />
                    </FormItem>
                  </Col>
                  <Col :span="12">
                    <FormItem label="轮询间隔">
                      <Select
                        v-model:value="formState.hostingInterval"
                        :options="[
                          { label: '每 15 分钟', value: '15' },
                          { label: '每 30 分钟', value: '30' },
                          { label: '每 60 分钟', value: '60' },
                        ]"
                      />
                    </FormItem>
                  </Col>
                </Row>
              </template>

              <FormItem v-else-if="formState.hostingMode === 'reuse'" label="已有规则">
                <Select
                  v-model:value="formState.hostingReuseTask"
                  :options="HOSTING_REUSE_OPTIONS"
                />
              </FormItem>

              <Alert
                v-else
                type="warning"
                show-icon
                message="不启用托管，批创完成后不自动纳管。"
              />
            </Card>

            <Card title="执行设置" class="auto-task-card">
              <FormItem label="执行方式">
                <RadioGroup v-model:value="formState.triggerMode">
                  <Radio value="manual">手动运行</Radio>
                  <Radio value="scheduled">定时运行</Radio>
                </RadioGroup>
              </FormItem>

              <template v-if="formState.triggerMode === 'scheduled'">
                <FormItem label="执行周期">
                  <Select
                    v-model:value="formState.scheduleFrequency"
                    :options="SCHEDULE_FREQUENCY_OPTIONS"
                  />
                </FormItem>

                <FormItem
                  v-if="formState.scheduleFrequency === 'weekly'"
                  label="固定周几"
                >
                  <CheckboxGroup
                    v-model:value="formState.scheduleWeekdays"
                    :options="WEEKDAYS"
                  />
                </FormItem>

                <Row
                  v-if="
                    ['daily', 'weekly', 'monthly'].includes(
                      formState.scheduleFrequency,
                    )
                  "
                  :gutter="[24, 16]"
                >
                  <Col v-if="formState.scheduleFrequency === 'monthly'" :span="12">
                    <FormItem label="每月日期">
                      <Select
                        v-model:value="formState.scheduleMonthDay"
                        :options="MONTH_DAY_OPTIONS"
                      />
                    </FormItem>
                  </Col>
                  <Col :span="12">
                    <FormItem label="执行时间">
                      <Input
                        v-model:value="formState.scheduleTime"
                        type="time"
                      />
                    </FormItem>
                  </Col>
                </Row>

                <Row
                  v-if="formState.scheduleFrequency === 'custom'"
                  :gutter="[24, 16]"
                >
                  <Col :span="12">
                    <FormItem label="开始时间">
                      <Input
                        v-model:value="formState.scheduleCustomStart"
                        type="datetime-local"
                      />
                    </FormItem>
                  </Col>
                  <Col :span="12">
                    <FormItem label="结束时间">
                      <Input
                        v-model:value="formState.scheduleCustomEnd"
                        type="datetime-local"
                      />
                    </FormItem>
                  </Col>
                  <Col :span="12">
                    <FormItem label="执行时间点">
                      <Input
                        v-model:value="formState.scheduleCustomTime"
                        type="time"
                      />
                    </FormItem>
                  </Col>
                </Row>

                <Alert
                  v-if="
                    ['5m', '10m', '15m', '30m', '60m'].includes(
                      formState.scheduleFrequency,
                    )
                  "
                  type="info"
                  show-icon
                  :message="`每 ${formState.scheduleFrequency.replace('m', '')} 分钟检查一次条件，命中后执行。`"
                />
              </template>
            </Card>
          </Form>
        </Col>

        <Col :lg="7" :md="24" :sm="24" :xs="24">
          <Card title="配置摘要" class="summary-card">
            <div class="summary-hero">
              <Typography.Text strong class="summary-title">
                {{ formState.name || '未命名任务' }}
              </Typography.Text>
              <Typography.Text type="secondary" class="summary-subtitle">
                {{ formState.platform }} · {{ formState.project }}
              </Typography.Text>
              <Space wrap class="mt-3">
                <Tag
                  v-for="tag in selectedTagNames"
                  :key="tag"
                  :color="getLabelColor(tag)"
                  :bordered="false"
                >
                  {{ tag }}
                </Tag>
              </Space>
            </div>

            <div class="summary-groups">
              <div class="summary-group">
                <div class="summary-group-head">
                  <span class="summary-group-icon"><CalendarOutlined /></span>
                  <span>执行</span>
                </div>
                <div class="summary-row">
                  <span>周期</span>
                  <b>{{ scheduleText }}</b>
                </div>
                <div class="summary-row">
                  <span>托管</span>
                  <b>{{ hostingSummary }}</b>
                </div>
              </div>

              <div class="summary-group">
                <div class="summary-group-head">
                  <span class="summary-group-icon"><AimOutlined /></span>
                  <span>投放</span>
                </div>
                <div
                  v-if="hasAsset('strategy_group')"
                  class="summary-row"
                >
                  <span>策略组</span>
                  <b>{{ strategySummary }}</b>
                </div>
                <div
                  v-if="hasAsset('platform_advertiser')"
                  class="summary-row"
                >
                  <span>账户</span>
                  <b>{{ accountSummary }}</b>
                </div>
              </div>

              <div class="summary-group">
                <div class="summary-group-head">
                  <span class="summary-group-icon"><AppstoreOutlined /></span>
                  <span>资产</span>
                </div>
                <div v-if="hasAsset('material')" class="summary-row">
                  <span>素材</span>
                  <b>{{ materialSummary }}</b>
                </div>
                <div v-if="mediaSummary !== '—'" class="summary-row">
                  <span>媒体</span>
                  <b>{{ mediaSummary }}</b>
                </div>
              </div>
            </div>

            <div class="summary-note">
              <CheckCircleOutlined />
              <span>所有资产共用同一标签池，计划卡审批后才下发。</span>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  </Drawer>
</template>

<style scoped lang="scss">
.auto-task-drawer-body {
  max-height: calc(100vh - 140px);
  padding-right: 6px;
  overflow-y: auto;
  scrollbar-gutter: stable;
}

.auto-task-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.auto-task-card {
  margin-bottom: 0;
}

.summary-card {
  position: sticky;
  top: 0;
}

.summary-card :deep(.ant-card-body) {
  padding: 16px;
}

.summary-hero {
  padding: 14px;
  background: linear-gradient(135deg, #f0f7ff 0%, #fafcff 100%);
  border: 1px solid #e6f4ff;
  border-radius: 10px;
}

.summary-title {
  display: block;
  font-size: 16px;
  line-height: 1.4;
}

.summary-subtitle {
  display: block;
  margin-top: 2px;
  font-size: 12px;
}

.summary-groups {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
}

.summary-group {
  padding: 10px 12px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
}

.summary-group-head {
  display: flex;
  gap: 7px;
  align-items: center;
  margin-bottom: 6px;
  color: #262626;
  font-size: 12px;
  font-weight: 600;
}

.summary-group-icon {
  display: grid;
  width: 24px;
  height: 24px;
  color: #1677ff;
  background: #e6f4ff;
  border-radius: 7px;
  place-items: center;
}

.summary-group-icon :deep(svg) {
  width: 13px;
  height: 13px;
}

.summary-row {
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding: 5px 0;
  font-size: 12px;
}

.summary-row + .summary-row {
  border-top: 1px solid #f0f0f0;
}

.summary-row span {
  flex: none;
  color: #8c8c8c;
}

.summary-row b {
  max-width: 66%;
  color: #262626;
  font-weight: 500;
  text-align: right;
  word-break: break-word;
}

.summary-note {
  display: flex;
  gap: 6px;
  align-items: flex-start;
  margin-top: 12px;
  color: #8c8c8c;
  font-size: 11px;
  line-height: 1.5;
}

.summary-note :deep(svg) {
  flex: none;
  margin-top: 2px;
  color: #52c41a;
}

@media (max-width: 1200px) {
  .summary-card {
    position: static;
  }
}
</style>
