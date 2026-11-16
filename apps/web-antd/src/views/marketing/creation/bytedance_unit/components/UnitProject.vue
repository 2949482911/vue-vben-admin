<script setup lang="ts" name="UnitProjectForm">
import type { UnitProjectCreateRequest } from '../bytedance';

import type { AccountInfo } from '#/views/marketing/creation/creation';

import { ref } from 'vue';

import { Alert, Button, Card, Descriptions, DescriptionsItem } from 'ant-design-vue';

import UnitProjectDrawer from './UnitProjectDrawer.vue';

const props = defineProps<{
  accountInfo: AccountInfo[];
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
        <DescriptionsItem label="商品">
          <template v-if="props.project.selectedProduct">
            {{
              props.project.selectedProduct.name ||
              props.project.selectedProduct.title ||
              '已选商品'
            }}
            <span class="product-ids">
              （{{ props.project.related_product?.product_platform_id || '-'
              }}/{{ props.project.related_product?.product_id || '-' }}）
            </span>
          </template>
          <template v-else>
            {{ props.project.related_product?.product_platform_id || '-'
            }}/{{ props.project.related_product?.product_id || '-' }}
          </template>
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
      <Button danger type="primary" @click="openDrawer">填写项目配置</Button>
    </div>

    <UnitProjectDrawer
      ref="drawerRef"
      :account-info="props.accountInfo"
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
