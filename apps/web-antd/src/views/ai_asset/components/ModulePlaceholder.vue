<script lang="ts" setup name="AiAssetModulePlaceholder">
import { Page } from '@vben/common-ui';

import { Card, Tag } from 'ant-design-vue';

defineProps<{
  description: string;
  items: Array<{ desc: string; title: string }>;
  title: string;
}>();
</script>

<template>
  <Page auto-content-height>
    <div class="placeholder">
      <Card>
        <div class="placeholder__head">
          <div>
            <h2>{{ title }}</h2>
            <p>{{ description }}</p>
          </div>
          <Tag color="orange" :bordered="false">P1 接口接入中</Tag>
        </div>
        <div class="placeholder__grid">
          <Card
            v-for="item in items"
            :key="item.title"
            size="small"
            class="placeholder__item"
          >
            <b>{{ item.title }}</b>
            <p>{{ item.desc }}</p>
          </Card>
        </div>
      </Card>
    </div>
  </Page>
</template>

<style scoped lang="scss">
.placeholder {
  height: 100%;
  overflow-y: auto;
}

.placeholder__head {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;

  h2 {
    margin: 0;
    font-size: 17px;
    font-weight: 700;
  }

  p {
    margin: 4px 0 0;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }
}

.placeholder__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.placeholder__item {
  b {
    font-size: 13px;
  }

  p {
    margin: 4px 0 0;
    font-size: 12px;
    line-height: 1.6;
    color: hsl(var(--muted-foreground));
  }
}

@media (width <= 1080px) {
  .placeholder__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
