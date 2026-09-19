<script setup lang="ts">
/**
 * 批量操作-批量新增广告创意（add_promotion）
 *
 * OPPO 新增创意 target 直接透传创意字段（字段名与 OPPO 接口一致），
 * 常用字段：adGroupId(必填)/adPlanId(必填)/adName(必填)/globalSpecId(必填)/
 * clickUrl/downloadUrl/imgMatIds/videoMatIds/brandName/buttonTxt/copywriter/
 * exposeUrl/exposeEndUrl/mDpaProductIds/demoGameId 等。
 * 同一批新增必须在同一个广告组下（后端按 adGroupId 分组）。
 */
import { aManagementApi } from '#/api';
import { $t } from '#/locales';
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Row,
  Space,
  Tag,
} from 'ant-design-vue';
import { computed, ref } from 'vue';
import { Page } from '@vben/common-ui';
import { BATCH_OPERATION_LABEL_KEYS, BatchOperationType } from '../../platformOptions';
import TaskProgressPanel from '../TaskProgressPanel.vue';

const props = defineProps<{
  /** 勾选的行数据（用于回填账户/平台/广告组/计划） */
  rows: any[];
}>();

const emit = defineEmits<{
  /** 任务执行完毕，通知父级刷新列表 */
  taskCompleted: [];
}>();

interface CreativeEntry {
  adName: string;
  globalSpecId: number | undefined;
  clickUrl: string;
  downloadUrl: string;
  imgMatIds: string;
  videoMatIds: string;
  brandName: string;
  buttonTxt: string;
  copywriter: string;
  exposeUrl: string;
  exposeEndUrl: string;
  mDpaProductIds: string;
  demoGameId: number | undefined;
}

function emptyCreative(): CreativeEntry {
  return {
    adName: '',
    globalSpecId: undefined,
    clickUrl: '',
    downloadUrl: '',
    imgMatIds: '',
    videoMatIds: '',
    brandName: '',
    buttonTxt: '',
    copywriter: '',
    exposeUrl: '',
    exposeEndUrl: '',
    mDpaProductIds: '',
    demoGameId: undefined,
  };
}

// ==================== 提交状态 ====================
const submitting = ref(false);
const taskId = ref<string | number | null>(null);

// ==================== 公共参数（从选中行回填） ====================
const firstRow = computed(() => props.rows[0]);
const advertiserId = computed(
  () => firstRow.value?.advertiserId || firstRow.value?.platform_account_id || '',
);
const platform = computed(() => firstRow.value?.platform || 'oppo');

const adGroupId = ref<number | undefined>(
  firstRow.value?.adgroupId ? Number(firstRow.value.adgroupId) : undefined,
);
const adPlanId = ref<number | undefined>(
  firstRow.value?.campaignId ? Number(firstRow.value.campaignId) : undefined,
);

// ==================== 创意列表 ====================
const creativeList = ref<CreativeEntry[]>([emptyCreative()]);

function addCreative() {
  creativeList.value.push(emptyCreative());
}

function removeCreative(index: number) {
  if (creativeList.value.length <= 1) return;
  creativeList.value.splice(index, 1);
}

const canSubmit = computed(() => {
  if (!advertiserId.value) return false;
  if (adGroupId.value === undefined || adPlanId.value === undefined) return false;
  return creativeList.value.every(
    (c) => c.adName.trim().length > 0 && c.globalSpecId !== undefined,
  );
});

/** 组装 items（单个账户 item，target 为创意数组） */
function buildItems() {
  const target = creativeList.value.map((c) => {
    const fields: Record<string, any> = {
      adGroupId: adGroupId.value,
      adPlanId: adPlanId.value,
      adName: c.adName.trim(),
      globalSpecId: c.globalSpecId,
    };
    // 可选字段仅在有值时透传
    const optionalKeys: (keyof CreativeEntry)[] = [
      'clickUrl',
      'downloadUrl',
      'imgMatIds',
      'videoMatIds',
      'brandName',
      'buttonTxt',
      'copywriter',
      'exposeUrl',
      'exposeEndUrl',
      'mDpaProductIds',
      'demoGameId',
    ];
    optionalKeys.forEach((key) => {
      const v = c[key];
      if (v !== null && v !== undefined && String(v).trim() !== '') {
        fields[key] = v;
      }
    });
    return fields;
  });

  return [
    {
      advertiserId: advertiserId.value,
      platform: platform.value,
      level: 'promotion',
      target,
    },
  ];
}

async function handleConfirm() {
  if (!canSubmit.value) return;
  submitting.value = true;
  try {
    const res = await aManagementApi.fetchCreateBatch({
      name: `${$t(BATCH_OPERATION_LABEL_KEYS[BatchOperationType.ADD_PROMOTION])}_${creativeList.value.length}`,
      optionType: BatchOperationType.ADD_PROMOTION,
      items: buildItems(),
    });
    taskId.value = res;
    message.success(
      `${$t('marketing.promotionManager.tips.submitSuccess')}，${$t('marketing.promotionManager.tips.taskId')}: ${res}`,
    );
  } catch (err) {
    console.error('批量新增广告创意提交失败:', err);
  } finally {
    submitting.value = false;
  }
}

function handleTaskCompleted() {
  emit('taskCompleted');
}
</script>

<template>
  <Page>
    <Space direction="vertical" class="w-full">
      <Alert
        type="info"
        show-icon
        :message="$t('marketing.promotionManager.addPromotion.alert')"
      />

      <!-- 公共参数 -->
      <Card
        v-if="!taskId"
        size="small"
        :title="$t('marketing.promotionManager.addPromotion.groupTitle')"
      >
        <Form layout="vertical">
          <Row :gutter="12">
            <Col :span="8">
              <FormItem :label="$t('marketing.promotionManager.addPromotion.accountId')">
                <Input :value="advertiserId" disabled />
              </FormItem>
            </Col>
            <Col :span="8">
              <FormItem :label="$t('marketing.promotionManager.addPromotion.adGroupId')" required>
                <InputNumber
                  v-model:value="adGroupId"
                  :min="0"
                  :precision="0"
                  :placeholder="$t('marketing.promotionManager.addPromotion.placeholder.adGroupId')"
                  class="w-full"
                />
              </FormItem>
            </Col>
            <Col :span="8">
              <FormItem :label="$t('marketing.promotionManager.addPromotion.adPlanId')" required>
                <InputNumber
                  v-model:value="adPlanId"
                  :min="0"
                  :precision="0"
                  :placeholder="$t('marketing.promotionManager.addPromotion.placeholder.adPlanId')"
                  class="w-full"
                />
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Card>

      <!-- 创意列表 -->
      <template v-if="!taskId">
        <Card
          v-for="(creative, index) in creativeList"
          :key="index"
          size="small"
          :title="$t('marketing.promotionManager.addPromotion.creativeIndex', { index: index + 1 })"
          class="mb-3"
        >
          <template #extra>
            <Button v-if="creativeList.length > 1" type="link" danger @click="removeCreative(index)">
              {{ $t('marketing.promotionManager.addPromotion.remove') }}
            </Button>
          </template>
          <Form layout="vertical">
            <Row :gutter="12">
              <Col :span="12">
                <FormItem :label="$t('marketing.promotionManager.addPromotion.adName')" required>
                  <Input
                    v-model:value="creative.adName"
                    :placeholder="$t('marketing.promotionManager.addPromotion.placeholder.adName')"
                  />
                </FormItem>
              </Col>
              <Col :span="12">
                <FormItem :label="$t('marketing.promotionManager.addPromotion.globalSpecId')" required>
                  <InputNumber
                    v-model:value="creative.globalSpecId"
                    :min="0"
                    :precision="0"
                    :placeholder="$t('marketing.promotionManager.addPromotion.placeholder.globalSpecId')"
                    class="w-full"
                  />
                </FormItem>
              </Col>
              <Col :span="12">
                <FormItem :label="$t('marketing.promotionManager.addPromotion.clickUrl')">
                  <Input
                    v-model:value="creative.clickUrl"
                    :placeholder="$t('marketing.promotionManager.addPromotion.placeholder.clickUrl')"
                  />
                </FormItem>
              </Col>
              <Col :span="12">
                <FormItem :label="$t('marketing.promotionManager.addPromotion.downloadUrl')">
                  <Input
                    v-model:value="creative.downloadUrl"
                    :placeholder="$t('marketing.promotionManager.addPromotion.placeholder.downloadUrl')"
                  />
                </FormItem>
              </Col>
              <Col :span="12">
                <FormItem :label="$t('marketing.promotionManager.addPromotion.imgMatIds')">
                  <Input
                    v-model:value="creative.imgMatIds"
                    :placeholder="$t('marketing.promotionManager.addPromotion.placeholder.imgMatIds')"
                  />
                </FormItem>
              </Col>
              <Col :span="12">
                <FormItem :label="$t('marketing.promotionManager.addPromotion.videoMatIds')">
                  <Input
                    v-model:value="creative.videoMatIds"
                    :placeholder="$t('marketing.promotionManager.addPromotion.placeholder.videoMatIds')"
                  />
                </FormItem>
              </Col>
              <Col :span="12">
                <FormItem :label="$t('marketing.promotionManager.addPromotion.brandName')">
                  <Input
                    v-model:value="creative.brandName"
                    :placeholder="$t('marketing.promotionManager.addPromotion.placeholder.brandName')"
                  />
                </FormItem>
              </Col>
              <Col :span="12">
                <FormItem :label="$t('marketing.promotionManager.addPromotion.buttonTxt')">
                  <Input
                    v-model:value="creative.buttonTxt"
                    :placeholder="$t('marketing.promotionManager.addPromotion.placeholder.buttonTxt')"
                  />
                </FormItem>
              </Col>
              <Col :span="12">
                <FormItem :label="$t('marketing.promotionManager.addPromotion.copywriter')">
                  <Input
                    v-model:value="creative.copywriter"
                    :placeholder="$t('marketing.promotionManager.addPromotion.placeholder.copywriter')"
                  />
                </FormItem>
              </Col>
              <Col :span="12">
                <FormItem :label="$t('marketing.promotionManager.addPromotion.exposeUrl')">
                  <Input
                    v-model:value="creative.exposeUrl"
                    :placeholder="$t('marketing.promotionManager.addPromotion.placeholder.exposeUrl')"
                  />
                </FormItem>
              </Col>
              <Col :span="12">
                <FormItem :label="$t('marketing.promotionManager.addPromotion.exposeEndUrl')">
                  <Input
                    v-model:value="creative.exposeEndUrl"
                    :placeholder="$t('marketing.promotionManager.addPromotion.placeholder.exposeEndUrl')"
                  />
                </FormItem>
              </Col>
              <Col :span="12">
                <FormItem :label="$t('marketing.promotionManager.addPromotion.mDpaProductIds')">
                  <Input
                    v-model:value="creative.mDpaProductIds"
                    :placeholder="$t('marketing.promotionManager.addPromotion.placeholder.mDpaProductIds')"
                  />
                </FormItem>
              </Col>
              <Col :span="12">
                <FormItem :label="$t('marketing.promotionManager.addPromotion.demoGameId')">
                  <InputNumber
                    v-model:value="creative.demoGameId"
                    :min="0"
                    :precision="0"
                    :placeholder="$t('marketing.promotionManager.addPromotion.placeholder.demoGameId')"
                    class="w-full"
                  />
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Card>

        <Space class="mb-3">
          <Button @click="addCreative">{{ $t('marketing.promotionManager.addPromotion.addCreative') }}</Button>
          <Button type="primary" :loading="submitting" :disabled="!canSubmit" @click="handleConfirm">
            {{ $t('marketing.promotionManager.addPromotion.submit') }}
          </Button>
          <Tag class="text-xs">
            {{ $t('marketing.promotionManager.tips.selectedCount', { count: creativeList.length }) }}
          </Tag>
        </Space>
      </template>

      <!-- 任务进度（提交后展示） -->
      <Card v-if="taskId">
        <TaskProgressPanel :task-id="taskId" @task-completed="handleTaskCompleted" />
      </Card>
    </Space>
  </Page>
</template>

<style scoped lang="scss"></style>
