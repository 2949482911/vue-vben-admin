<script setup lang="ts" name="StrategyGroupAssetCard">
import type { AssetCommonProps, StrategyAssetConfig } from './types';

import { computed, ref, watch } from 'vue';

import {
  FormItem,
  Radio,
  RadioGroup,
  Select,
  Space,
  Tag,
} from 'ant-design-vue';

import { strategyGropApi } from '#/api/core';
import { getLabelColor } from '#/views/marketing/account/label/constants';

import AssetCardShell from './AssetCardShell.vue';

const props = defineProps<AssetCommonProps>();
const config = defineModel<StrategyAssetConfig>('config', { required: true });

const strategyGroupOptions = ref<Array<{ label: string; value: string }>>([]);
const subType = computed(() =>
  props.platformMode === 'std' ? 'bytedance_std' : 'bytedance_unit',
);

async function loadStrategyGroups() {
  if (!props.projectId) {
    strategyGroupOptions.value = [];
    return;
  }
  try {
    const res: any = await strategyGropApi.fetchGetStrategyGrop({
      name: '',
      page: 1,
      pageSize: 1000,
      platform: props.platform,
      projectId: props.projectId,
      subType: subType.value,
    });
    strategyGroupOptions.value = (res?.items ?? []).map((item: any) => ({
      label: item.name,
      value: item.name,
    }));
    if (
      !strategyGroupOptions.value.some(
        (item) => item.value === config.value.strategyGroup,
      )
    ) {
      config.value.strategyGroup = strategyGroupOptions.value[0]?.value ?? '';
    }
  } catch {
    strategyGroupOptions.value = [];
  }
}

watch(
  () => [props.platform, props.platformMode, props.projectId],
  () => {
    void loadStrategyGroups();
  },
  { immediate: true },
);
</script>

<template>
  <AssetCardShell :asset="asset">
    <FormItem label="选择方式">
      <RadioGroup v-model:value="config.strategyMode">
        <Radio value="tag">按标签匹配</Radio>
        <Radio value="group">指定策略组</Radio>
      </RadioGroup>
    </FormItem>

    <FormItem v-if="config.strategyMode === 'group'" label="策略组">
      <Select
        v-model:value="config.strategyGroup"
        :options="strategyGroupOptions"
        option-filter-prop="label"
        placeholder="请选择策略组"
        show-search
      />
    </FormItem>

    <FormItem v-else label="匹配标签">
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

    <FormItem v-if="config.strategyMode === 'tag'" label="多个匹配时">
      <Select
        v-model:value="config.strategyRule"
        :options="[
          { label: '最新启用版本', value: 'latest' },
          { label: '随机', value: 'random' },
          { label: '使用次数最少', value: 'least-used' },
        ]"
      />
    </FormItem>
  </AssetCardShell>
</template>
