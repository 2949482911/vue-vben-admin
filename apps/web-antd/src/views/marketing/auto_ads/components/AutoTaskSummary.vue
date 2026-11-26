<script setup lang="ts" name="AutoTaskSummary">
import type { AutoTaskStats } from '../types';

import {
  AppstoreOutlined,
  FileTextOutlined,
  PauseCircleOutlined,
  PlusOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Col,
  Flex,
  Row,
  Statistic,
  Tag,
  Typography,
} from 'ant-design-vue';

const props = defineProps<{ stats: AutoTaskStats }>();
const emit = defineEmits<{ create: [] }>();

const kpis = [
  {
    color: 'blue',
    hint: () => '全部自动任务',
    icon: AppstoreOutlined,
    key: 'total',
    label: '任务总数',
    suffix: '个',
    value: (stats: AutoTaskStats) => stats.totalCount,
  },
  {
    color: 'green',
    hint: () => '正在按计划调度',
    icon: ThunderboltOutlined,
    key: 'enabled',
    label: '启用中',
    suffix: '个',
    value: (stats: AutoTaskStats) => stats.enabledCount,
  },
  {
    color: 'orange',
    hint: () => '人工暂停',
    icon: PauseCircleOutlined,
    key: 'paused',
    label: '已暂停',
    suffix: '个',
    value: (stats: AutoTaskStats) => stats.pausedCount,
  },
  {
    color: 'default',
    hint: () => '待启用',
    icon: FileTextOutlined,
    key: 'draft',
    label: '草稿',
    suffix: '个',
    value: (stats: AutoTaskStats) => stats.draftCount,
  },
];
</script>

<template>
  <Card :bordered="false" class="shrink-0">
    <Flex align="center" justify="space-between" :gap="16" wrap="wrap">
      <div>
        <Typography.Title :level="4" class="!mb-1">
          自动任务
        </Typography.Title>
        <Typography.Text type="secondary">
          按全局标签池匹配账户、素材、策略组和媒体资产，计划卡审批后自动下发。
        </Typography.Text>
      </div>
      <Button type="primary" @click="emit('create')">
        <template #icon><PlusOutlined /></template>
        新建自动任务
      </Button>
    </Flex>

    <Row :gutter="[16, 16]" class="mt-4">
      <Col
        v-for="kpi in kpis"
        :key="kpi.key"
        :lg="6"
        :md="12"
        :sm="12"
        :xs="24"
      >
        <Flex align="flex-start" justify="space-between" :gap="12">
          <Statistic
            :suffix="kpi.suffix"
            :title="kpi.label"
            :value="kpi.value(props.stats)"
          />
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
          >
            <component :is="kpi.icon" />
          </div>
        </Flex>
        <Tag :bordered="false" :color="kpi.color" class="mt-3">
          {{ kpi.hint() }}
        </Tag>
      </Col>
    </Row>
  </Card>
</template>
