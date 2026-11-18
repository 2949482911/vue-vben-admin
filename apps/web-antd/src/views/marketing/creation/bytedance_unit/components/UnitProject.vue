<script setup lang="ts" name="UnitProjectForm">
import type { UnitProjectCreateRequest } from '../bytedance';

import { ref } from 'vue';

import { Alert, Button, Card, Descriptions, DescriptionsItem, Space } from 'ant-design-vue';

import UnitProjectDrawer from './UnitProjectDrawer.vue';

const props = defineProps<{
  project: UnitProjectCreateRequest;
}>();
const emit = defineEmits<{
  'update:project': [value: UnitProjectCreateRequest];
}>();

const drawerRef = ref<InstanceType<typeof UnitProjectDrawer>>();

function openDrawer() {
  drawerRef.value?.open();
}

function onProjectUpdated(project: UnitProjectCreateRequest) {
  emit('update:project', project);
}

function clearProject() {
  emit('update:project', {
    aigc_dynamic_creative_switch: 'ON',
    audience: { age: [], district: 'NONE', gender: 'NONE', platform: [] },
    budget: 0,
    delivery_product: 'ALBUM',
    end_time: '',
    going_global_switch: 'OFF',
    monetization_mode: 'IAP',
    name: '',
    schedule_time: '',
    schedule_type: 'SCHEDULE_FROM_NOW',
    source: '',
    start_time: '',
    uni_roi_goal: 0,
  });
}
</script>

<template>
  <Card title="全域项目" class="info-card">
    <div class="card-content">
      <Descriptions v-if="props.project.name" :column="1" size="small">
        <DescriptionsItem label="项目名称">
          {{ props.project.name }}
        </DescriptionsItem>
        <DescriptionsItem label="营销产品">
          {{ props.project.delivery_product || 'ALBUM' }}
        </DescriptionsItem>
        <DescriptionsItem label="预算">
          {{ props.project.budget ?? '-' }} 元
        </DescriptionsItem>
        <DescriptionsItem label="ROI 系数">
          {{ props.project.uni_roi_goal ?? '-' }}
        </DescriptionsItem>
        <DescriptionsItem label="变现模式">
          {{ props.project.monetization_mode || '-' }}
        </DescriptionsItem>
        <DescriptionsItem label="投放时间">
          {{ props.project.schedule_type === 'SCHEDULE_START_END'
            ? `${props.project.start_time || '-'} ~ ${props.project.end_time || '-'}`
            : '从今天开始' }}
        </DescriptionsItem>
      </Descriptions>
      <Alert
        v-else
        type="error"
        message="请先填写全域项目配置"
        class="empty-alert"
      />
    </div>
    <div class="card-footer">
      <Space :size="8">
        <Button
          v-if="props.project.name"
          danger
          type="link"
          @click="clearProject"
        >
          清空
        </Button>
        <Button danger type="primary" @click="openDrawer">
          {{ props.project.name ? '编辑' : '添加' }}
        </Button>
      </Space>
    </div>

    <UnitProjectDrawer
      ref="drawerRef"
      :project="props.project"
      @update:project="onProjectUpdated"
    />
  </Card>
</template>

<style scoped lang="scss">
.info-card {
  height: 100%;
}

.card-content {
  min-height: 120px;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  margin-top: 12px;
  border-top: 1px solid hsl(var(--border));
}

.empty-alert {
  margin-top: 12px;
}

.product-ids {
  color: hsl(var(--muted-foreground));
}
</style>
