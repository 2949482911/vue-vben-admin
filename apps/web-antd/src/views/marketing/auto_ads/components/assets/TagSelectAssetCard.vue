<script setup lang="ts" name="TagSelectAssetCard">
import type { TagAssetConfig } from './types';

import type { AutoProxySupportedAsset } from '#/api/models/auto_proxy_ads';

import {
  FormItem,
  Radio,
  RadioGroup,
  Select,
  Space,
  Tag,
  Typography,
} from 'ant-design-vue';

import { getLabelColor } from '#/views/marketing/account/label/constants';

import AssetCardShell from './AssetCardShell.vue';

defineProps<{
  asset: AutoProxySupportedAsset;
  loading?: boolean;
  options: Array<{ label: string; value: string }>;
  tagNames: string[];
}>();
const config = defineModel<TagAssetConfig>('config', { required: true });
</script>

<template>
  <AssetCardShell :asset="asset">
    <FormItem label="选择方式">
      <RadioGroup v-model:value="config.mode">
        <Radio value="manual">手动选择</Radio>
        <Radio value="tag">标签匹配</Radio>
      </RadioGroup>
    </FormItem>

    <FormItem v-if="config.mode === 'manual'" label="选择资产">
      <Select
        v-model:value="config.selected"
        :loading="loading"
        :options="options"
        mode="multiple"
        option-filter-prop="label"
        placeholder="请选择资产"
        show-search
      />
    </FormItem>

    <template v-else>
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
      <Typography.Text type="secondary" class="text-xs">
        标签精准匹配，无额外条件。
      </Typography.Text>
    </template>
  </AssetCardShell>
</template>
