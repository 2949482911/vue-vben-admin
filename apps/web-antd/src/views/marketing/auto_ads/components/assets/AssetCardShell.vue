<script setup lang="ts" name="AssetCardShell">
import type { AutoProxySupportedAsset } from '#/api/models/auto_proxy_ads';

import { Card, Space, Tag, Typography } from 'ant-design-vue';

defineProps<{ asset: AutoProxySupportedAsset }>();
</script>

<template>
  <Card class="auto-task-card">
    <template #title>
      <Space :size="6">
        <span>{{ asset.label }}</span>
        <Tag
          :bordered="false"
          :color="asset.required ? 'blue' : 'default'"
          size="small"
        >
          {{ asset.required ? '必填' : '可选' }}
        </Tag>
      </Space>
    </template>
    <template #extra>
      <Typography.Text type="secondary" class="text-xs">
        {{ asset.matchRule }}
      </Typography.Text>
    </template>
    <slot></slot>
  </Card>
</template>
