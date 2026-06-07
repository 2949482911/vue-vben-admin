<script setup lang="ts" name="AudiencePackageShow">
// 展示定向包信息
import {List, ListItem, Card, Alert} from 'ant-design-vue';
import type {AudienceConfigData} from '#/views/marketing/creation/creation';
import {RuleMethod} from "#/views/marketing/creation/creation_enums";
import {computed} from 'vue';

const {audience} = defineProps({
  audience: {
    type: Object as () => AudienceConfigData | null,
    default: null
  }
})

// 将 Map 转换为数组供 v-for 遍历
const audienceEntries = computed(() => {
  if (!audience?.data || !(audience.data instanceof Map)) return [];
  return Array.from(audience.data.entries());
});

// 获取分配方式对应的标签
function getMethodLabel(method: string): string {
  return method === RuleMethod.ALL ? '全部相同' : '按账户分配'
}
</script>

<template>
  <div class="audience-package-show">
    <template v-if="audienceEntries.length > 0">
      <Card
        v-for="[accountKey, packageList] in audienceEntries"
        :key="accountKey"
        :title="audience?.config?.method === RuleMethod.ALL ? '定向包' : `账户 ${accountKey} 的定向包`"
      >
        <template #extra>
          <span class="method-tag">分配方式: {{
              getMethodLabel(audience?.config?.method || '')
            }}</span>
        </template>
        <List size="small" bordered>
          <ListItem v-for="pkg in packageList" :key="pkg.id">
            <div class="package-info">
              <span class="package-name">{{ pkg.name }}</span>
            </div>
          </ListItem>
        </List>
      </Card>
    </template>
    <Alert v-else type="error" message="请选择定向包"></Alert>
  </div>
</template>

<style scoped lang="scss">
.audience-package-show {
  .method-tag {
    color: #666;
    font-size: 12px;
  }

  .package-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .package-name {
      font-weight: 500;
    }

    .package-id {
      color: #999;
      font-size: 12px;
    }
  }

  .empty-tip {
    color: #999;
    text-align: center;
    padding: 20px;
  }
}
</style>
