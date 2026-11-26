<script setup lang="ts" name="AutoTaskPlanDrawer">
import type { AutoTaskItem } from '../types';

import type {
  AutoProxyCampaignCardResponse,
  AutoProxyExecuteResponse,
} from '#/api/models/auto_proxy_ads';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import {
  ApartmentOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
  LinkOutlined,
  PictureOutlined,
  PlayCircleOutlined,
  ShopOutlined,
  TeamOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons-vue';
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  message,
  Popconfirm,
  Progress,
  Row,
  Space,
  Spin,
  Statistic,
  Tag,
  Typography,
} from 'ant-design-vue';

import { autoProxyAdsApi } from '#/api/core';
import { getLabelColor } from '#/views/marketing/account/label/constants';

import { formatPlatformLabel } from '../data';

const emit = defineEmits<{ changed: [] }>();

const planTask = ref<AutoTaskItem>();
const planData = ref<AutoProxyCampaignCardResponse>();
const planLoading = ref(false);
const planError = ref('');
const executing = ref(false);
const executeResult = ref<AutoProxyExecuteResponse>();

const EXECUTE_STATUS_META: Record<string, { color: string; text: string }> = {
  failed: { color: 'red', text: '执行失败' },
  partial: { color: 'orange', text: '部分成功' },
  success: { color: 'green', text: '执行成功' },
};

const DETAIL_STATUS_META: Record<string, { color: string; text: string }> = {
  blocked: { color: 'orange', text: '已阻断' },
  failed: { color: 'red', text: '失败' },
  success: { color: 'green', text: '成功' },
};


const ASSET_ICONS: Record<string, any> = {
  audience_package: FilterOutlined,
  aweme: VideoCameraOutlined,
  loading_page: LinkOutlined,
  material: PictureOutlined,
  platform_advertiser: TeamOutlined,
  product: ShopOutlined,
  product_library: ShopOutlined,
  strategy_group: ApartmentOutlined,
  title_package: AppstoreOutlined,
};

const assetCards = computed(() =>
  (planData.value?.supportedAssets ?? []).map((asset) => ({
    ...asset,
    count: planData.value?.totals?.[asset.code] ?? 0,
    icon: ASSET_ICONS[asset.code] ?? AppstoreOutlined,
  })),
);

const labelRows = computed(() =>
  (planData.value?.labels ?? []).map((label) => {
    const conditions = (planData.value?.supportedAssets ?? []).map((asset) => {
      const count = Number(label.counts?.[asset.code] ?? 0);
      return {
        ...asset,
        count,
        ok: asset.required ? count > 0 : true,
      };
    });
    const okCount = conditions.filter((condition) => condition.ok).length;
    return {
      ...label,
      conditions,
      hitCount: conditions.reduce((sum, condition) => sum + condition.count, 0),
      okCount,
      percent: conditions.length
        ? Math.round((okCount / conditions.length) * 100)
        : 0,
      total: conditions.length,
    };
  }),
);

async function loadPlan() {
  const task = planTask.value;
  if (!task) {
    return;
  }
  planError.value = '';
  if (!task.tagIds.length) {
    planError.value = '任务缺少产品标签，无法生成计划卡';
    return;
  }
  planLoading.value = true;
  try {
    planData.value = await autoProxyAdsApi.fetchCampaignCard({
      labelIds: task.tagIds,
      platform: task.platform,
      platformMode: task.platformMode,
      projectId: task.projectId,
      taskId: task.id,
    });
  } catch (error: any) {
    planError.value = error?.message ?? '计划卡加载失败';
  } finally {
    planLoading.value = false;
  }
}

async function executeNow() {
  const task = planTask.value;
  if (!task) {
    return;
  }
  if (!task.tagIds.length) {
    message.warning('任务缺少产品标签，无法执行');
    return;
  }
  executing.value = true;
  try {
    const result = await autoProxyAdsApi.executeNow({
      labelIds: task.tagIds,
      taskId: task.id,
    });
    executeResult.value = result;
    emit('changed');
    const meta = EXECUTE_STATUS_META[result.executeStatus];
    message.success(`立即执行完成：${meta?.text ?? result.executeStatus}`);
  } catch (error: any) {
    message.error(error?.message ?? '立即执行失败');
  } finally {
    executing.value = false;
  }
}

const [Drawer, drawerApi] = useVbenDrawer({
  class: 'w-[70%]',
  closeOnClickModal: false,
  closeOnPressEscape: true,
  footer: false,
  onOpenChange(isOpen) {
    if (!isOpen) {
      return;
    }
    const task = drawerApi.getData() as AutoTaskItem | undefined;
    planTask.value = task;
    planData.value = undefined;
    planError.value = '';
    executeResult.value = undefined;
    drawerApi.setState({
      title: `计划卡 · ${task?.name ?? ''}`,
    });
    void loadPlan();
  },
});
</script>

<template>
  <Drawer>
    <div class="plan-drawer-body">
      <Spin :spinning="planLoading">
        <Alert v-if="planError" show-icon type="error" :message="planError" />

        <div v-else-if="planData" class="flex flex-col gap-6">
          <Card title="计划概览">
            <template #extra>
              <Space>
                <Button :loading="planLoading" @click="loadPlan">
                  刷新预检
                </Button>
                <Popconfirm
                  cancel-text="取消"
                  description="将按全部产品标签执行计划卡匹配、资产回填并提交内部批创任务；存在阻断的标签会被跳过。"
                  ok-text="立即执行"
                  title="立即执行该任务？"
                  @confirm="executeNow"
                >
                  <Button
                    :disabled="planLoading"
                    :loading="executing"
                    type="primary"
                  >
                    <template #icon>
                      <PlayCircleOutlined />
                    </template>
                    立即执行
                  </Button>
                </Popconfirm>
                <Button @click="drawerApi.close()">关闭</Button>
              </Space>
            </template>
            <Space :size="[6, 6]" wrap>
              <Tag color="blue" :bordered="false">
                {{ formatPlatformLabel(planData.platform, planData.platformMode) }}
              </Tag>
              <Tag :bordered="false">标签 {{ planData.labels.length }}</Tag>
              <Tag
                :color="planData.blockerCount > 0 ? 'red' : 'green'"
                :bordered="false"
              >
                Blocker {{ planData.blockerCount }}
              </Tag>
            </Space>
            <Typography.Title :level="4" class="!mt-3 !mb-1">
              计划卡预检
            </Typography.Title>
            <Typography.Text type="secondary">
              按固定资产编排实时匹配；出现阻断只会跳过对应标签/账户。
            </Typography.Text>
          </Card>

          <section>
            <Typography.Text strong class="mb-3 block">
              固定资产编排
            </Typography.Text>
            <Row :gutter="[16, 16]">
              <Col
                v-for="asset in assetCards"
                :key="asset.code"
                :lg="8"
                :md="12"
                :sm="12"
                :xl="6"
                :xs="24"
              >
                <Card size="small" class="h-full">
                  <template #title>
                    <Space :size="6">
                      <component :is="asset.icon" />
                      <span>{{ asset.label }}</span>
                    </Space>
                  </template>
                  <template #extra>
                    <Tag
                      :bordered="false"
                      :color="asset.required ? 'blue' : 'default'"
                    >
                      {{ asset.required ? '必填' : '可选' }}
                    </Tag>
                  </template>
                  <Statistic :value="asset.count" suffix="项" />
                  <Typography.Text
                    type="secondary"
                    class="mt-3 block text-xs"
                  >
                    {{ asset.matchRule }}
                  </Typography.Text>
                </Card>
              </Col>
            </Row>
          </section>

          <section>
            <Card>
              <template #title>产品子任务与下发条件</template>
              <template #extra>
                <Typography.Text type="secondary" class="text-xs">
                  执行时按产品拆分，账户级局部下发
                </Typography.Text>
              </template>

              <Empty
                v-if="!labelRows.length"
                :image="Empty.PRESENTED_IMAGE_SIMPLE"
                description="没有匹配标签计划"
              />

              <div v-else class="flex flex-col">
                <template
                  v-for="(row, index) in labelRows"
                  :key="String(row.labelId)"
                >
                  <div class="product-progress-row">
                    <div class="flex flex-wrap items-center gap-3">
                      <Tag
                        :bordered="false"
                        :color="getLabelColor(row.labelName || String(row.labelId))"
                      >
                        {{ row.labelName || row.labelId }}
                      </Tag>
                      <Progress
                        :percent="row.percent"
                        :show-info="false"
                        :stroke-color="
                          row.blockers.length ? '#faad14' : '#52c41a'
                        "
                        class="min-w-[160px] flex-1"
                        size="small"
                      />
                      <Typography.Text type="secondary" class="text-xs">
                        {{ row.okCount }}/{{ row.total }} 条件 · 命中
                        {{ row.hitCount }} 个资产
                      </Typography.Text>
                      <Tag
                        :bordered="false"
                        :color="row.blockers.length ? 'orange' : 'green'"
                      >
                        {{
                          row.blockers.length
                            ? `${row.blockers.length} 项待补齐`
                            : '可下发'
                        }}
                      </Tag>
                    </div>

                    <div class="mt-2 flex flex-wrap gap-2">
                      <Tag
                        v-for="condition in row.conditions"
                        :key="condition.code"
                        :bordered="false"
                        :color="condition.ok ? 'green' : 'orange'"
                      >
                        <CheckCircleOutlined v-if="condition.ok" />
                        <ExclamationCircleOutlined v-else />
                        {{ condition.label }} · {{ condition.count }}
                      </Tag>
                    </div>

                    <Typography.Text
                      v-if="row.blockers.length"
                      type="secondary"
                      class="mt-2 block text-xs"
                    >
                      {{ row.blockers.map((blocker) => blocker.message).join(' · ') }}
                    </Typography.Text>
                  </div>
                  <Divider v-if="index < labelRows.length - 1" class="!my-4" />
                </template>
              </div>
            </Card>
          </section>

          <section v-if="executeResult">
            <Card title="最近一次执行结果">
              <template #extra>
                <Space :size="8">
                  <Tag
                    :bordered="false"
                    :color="
                      EXECUTE_STATUS_META[executeResult.executeStatus]?.color ??
                      'default'
                    "
                  >
                    {{
                      EXECUTE_STATUS_META[executeResult.executeStatus]?.text ??
                      executeResult.executeStatus
                    }}
                  </Tag>
                  <Typography.Text
                    v-if="executeResult.executeTime"
                    type="secondary"
                    class="text-xs"
                  >
                    {{ executeResult.executeTime }}
                  </Typography.Text>
                </Space>
              </template>

              <Empty
                v-if="!executeResult.items.length"
                :image="Empty.PRESENTED_IMAGE_SIMPLE"
                description="没有产生执行明细"
              />

              <div v-else class="flex flex-col">
                <template
                  v-for="(item, index) in executeResult.items"
                  :key="String(item.detailId ?? item.labelId)"
                >
                  <div class="exec-result-row">
                    <div class="flex flex-wrap items-center gap-2">
                      <Tag
                        :bordered="false"
                        :color="
                          getLabelColor(item.labelName || String(item.labelId))
                        "
                      >
                        {{ item.labelName || item.labelId }}
                      </Tag>
                      <Tag
                        :bordered="false"
                        :color="
                          DETAIL_STATUS_META[item.detailStatus]?.color ??
                          'default'
                        "
                      >
                        {{
                          DETAIL_STATUS_META[item.detailStatus]?.text ??
                          item.detailStatus
                        }}
                      </Tag>
                      <Typography.Text type="secondary" class="text-xs">
                        批创任务 {{ item.batchTaskId ?? '-' }} · 广告
                        {{ item.totalAdCount ?? 0 }} 条 · 账户
                        {{ item.advertiserIds?.length ?? 0 }} 个
                      </Typography.Text>
                    </div>

                    <div
                      v-if="item.configArea || item.fullParamsData"
                      class="mt-2 flex flex-wrap gap-4"
                    >
                      <Typography.Link
                        v-if="item.configArea"
                        :href="item.configArea"
                        target="_blank"
                      >
                        配置区 JSON
                      </Typography.Link>
                      <Typography.Link
                        v-if="item.fullParamsData"
                        :href="item.fullParamsData"
                        target="_blank"
                      >
                        广告 FullParams
                      </Typography.Link>
                    </div>

                    <Typography.Text
                      v-if="item.message"
                      type="secondary"
                      class="mt-2 block text-xs"
                    >
                      {{ item.message }}
                    </Typography.Text>
                  </div>
                  <Divider
                    v-if="index < executeResult.items.length - 1"
                    class="!my-4"
                  />
                </template>
              </div>
            </Card>
          </section>
        </div>

        <Empty
          v-else-if="!planLoading"
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
          description="暂无计划卡数据"
        />
      </Spin>
    </div>
  </Drawer>
</template>

<style scoped lang="scss">
.plan-drawer-body {
  max-height: calc(100vh - 140px);
  padding-right: 6px;
  overflow-y: auto;
  scrollbar-gutter: stable;
}

:deep(.ant-card-small > .ant-card-body) {
  padding: 16px;
}

.product-progress-row {
  padding: 2px 0;
}

.exec-result-row {
  padding: 2px 0;
}
</style>
