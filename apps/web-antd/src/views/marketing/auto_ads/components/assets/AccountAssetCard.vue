<script setup lang="ts" name="AccountAssetCard">
import type { AccountAssetConfig, AssetCommonProps } from './types';

import { ref, watch } from 'vue';

import {
  Alert,
  Col,
  FormItem,
  InputNumber,
  Radio,
  RadioGroup,
  Row,
  Select,
  Space,
  Tag,
} from 'ant-design-vue';

import { advertiserApi } from '#/api/core';
import { getLabelColor } from '#/views/marketing/account/label/constants';

import { ACCOUNT_STRATEGY_OPTIONS } from '../../data';
import AssetCardShell from './AssetCardShell.vue';

const props = defineProps<AssetCommonProps>();
const config = defineModel<AccountAssetConfig>('config', { required: true });

const accountOptions = ref<Array<{ label: string; value: string }>>([]);

const ACCOUNT_AGE_OPTIONS = [
  { label: '近 30 天', value: '30' },
  { label: '近 90 天', value: '90' },
  { label: '不限', value: 'all' },
];

const ACCOUNT_STATUS_OPTIONS = [
  { label: '启用且投放中', value: 'enabled' },
  { label: '全部启用账户', value: 'all' },
];

async function loadAccounts() {
  try {
    const res: any = await advertiserApi.fetchAdvertiserList({
      page: 1,
      pageSize: 200,
      platform: props.platform,
      projectId: props.projectId || undefined,
      putStatue: 1,
    } as any);
    accountOptions.value = (res?.items ?? []).map((item: any) => ({
      label: item.advertiserName,
      value: String(item.id),
    }));
    const allowed = new Set(accountOptions.value.map((item) => item.value));
    config.value.accountSelected = config.value.accountSelected.filter((id) =>
      allowed.has(id),
    );
  } catch {
    accountOptions.value = [];
  }
}

watch(
  () => [props.platform, props.projectId],
  () => {
    void loadAccounts();
  },
  { immediate: true },
);
</script>

<template>
  <AssetCardShell :asset="asset">
    <FormItem label="账户选择">
      <RadioGroup v-model:value="config.accountMode">
        <Radio value="auto">自动匹配</Radio>
        <Radio value="manual">手动选择</Radio>
      </RadioGroup>
    </FormItem>

    <template v-if="config.accountMode === 'manual'">
      <FormItem label="选择账户">
        <Select
          v-model:value="config.accountSelected"
          mode="multiple"
          :options="accountOptions"
          option-filter-prop="label"
          placeholder="请选择账户"
          show-search
        />
      </FormItem>
    </template>

    <template v-else>
      <Row :gutter="[24, 16]">
        <Col :span="12">
          <FormItem label="账户状态">
            <Select
              v-model:value="config.accountStatus"
              :options="ACCOUNT_STATUS_OPTIONS"
            />
          </FormItem>
        </Col>
        <Col :span="12">
          <FormItem label="余额下限（元）">
            <InputNumber
              v-model:value="config.accountMinBalance"
              class="!w-full"
              :min="0"
            />
          </FormItem>
        </Col>
        <Col :span="12">
          <FormItem label="创建时间">
            <Select
              v-model:value="config.accountAge"
              :options="ACCOUNT_AGE_OPTIONS"
            />
          </FormItem>
        </Col>
        <Col :span="12">
          <FormItem label="选取策略">
            <Select
              v-model:value="config.accountStrategy"
              :options="ACCOUNT_STRATEGY_OPTIONS"
            />
          </FormItem>
        </Col>
        <Col :span="12">
          <FormItem label="最多账户数">
            <InputNumber
              v-model:value="config.accountLimit"
              class="!w-full"
              :max="200"
              :min="1"
            />
          </FormItem>
        </Col>
      </Row>
      <FormItem label="匹配标签">
        <Space wrap>
          <Tag
            v-for="tag in tagNames"
            :key="tag"
            :color="getLabelColor(tag)"
            :bordered="false"
          >
            {{ tag }}
          </Tag>
        </Space>
      </FormItem>
      <Alert
        type="info"
        show-icon
        message="自动匹配只读取账户、余额和标签数据，最终以计划卡预检结果为准。"
      />
    </template>
  </AssetCardShell>
</template>
