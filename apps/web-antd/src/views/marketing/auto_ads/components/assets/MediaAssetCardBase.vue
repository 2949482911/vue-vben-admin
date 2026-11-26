<script setup lang="ts" name="MediaAssetCardBase">
import type { AssetCommonProps, MediaAssetConfig } from './types';

import {
  Col,
  FormItem,
  InputNumber,
  Radio,
  RadioGroup,
  Row,
  Select,
  Space,
  Tag,
  Typography,
} from 'ant-design-vue';

import { getLabelColor } from '#/views/marketing/account/label/constants';

import { MEDIA_ASSET_DEFINITIONS } from '../../data';
import AssetCardShell from './AssetCardShell.vue';

const props = defineProps<AssetCommonProps>();
const config = defineModel<MediaAssetConfig>('config', { required: true });

const assetDefinition = MEDIA_ASSET_DEFINITIONS.find(
  (item) => item.key === props.asset.code,
);
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
        v-model:value="config.manual"
        mode="multiple"
        :options="assetDefinition?.options ?? []"
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

      <Row v-if="asset.code === 'aweme'" :gutter="[24, 16]">
        <Col :span="12">
          <FormItem label="随机个数">
            <InputNumber
              v-model:value="config.randomCount"
              class="!w-full"
              :min="1"
            />
          </FormItem>
        </Col>
        <Col :span="12">
          <FormItem label="授权到期时间">
            <Select
              v-model:value="config.expire"
              :options="[
                { label: '不限', value: 'all' },
                { label: '近 30 天', value: '30' },
                { label: '近 90 天', value: '90' },
              ]"
            />
          </FormItem>
        </Col>
      </Row>
      <Typography.Text v-else type="secondary" class="text-xs">
        标签精准匹配，无额外条件。
      </Typography.Text>
    </template>

    <Typography.Text type="secondary" class="mt-3 block text-xs">
      {{ assetDefinition?.hint }}
    </Typography.Text>
  </AssetCardShell>
</template>
