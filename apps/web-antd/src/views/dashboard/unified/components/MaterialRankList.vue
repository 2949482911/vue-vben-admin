<script setup lang="ts" name="MaterialRankList">
/**
 * 素材效果排行
 *
 * 展示消耗 Top N 的素材及其 CTR/CVR/ROI。前三名用主题色徽章，
 * 颜色与字号沿用 vben token / 标准档，不覆盖全局样式。
 */
import { Card, Empty, List, ListItem, Tag } from 'ant-design-vue';
import {
  FileImageOutlined,
  PictureOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons-vue';
import type { MaterialRankItem } from '#/api/models';

defineProps<{
  /** 素材排行数据 */
  data: MaterialRankItem[];
  /** 加载状态 */
  loading?: boolean;
}>();

function formatMoney(cents: number): string {
  return `¥${(cents / 100).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
  })}`;
}

/** ROI 语义色（沿用 antd 语义枚举） */
function roiColor(roi: number): string {
  if (roi >= 1.5) return 'green';
  if (roi >= 1) return 'blue';
  if (roi >= 0.5) return 'orange';
  return 'red';
}

/** 前三名徽章主题色 class */
function rankClass(index: number): string {
  return (
    ['rank-badge--gold', 'rank-badge--violet', 'rank-badge--cyan'][index] ??
    'rank-badge--plain'
  );
}
</script>

<template>
  <Card class="data-card" :loading="loading">
    <template #title>
      <span class="pt-ic pt-ic--violet"><PictureOutlined /></span>
      素材效果排行
    </template>

    <Empty v-if="data.length === 0 && !loading" description="暂无数据" />
    <List v-else :data-source="data" :split="false" size="small">
      <template #renderItem="{ item, index }">
        <ListItem class="material-item">
          <span class="rank-badge" :class="rankClass(index)">{{ index + 1 }}</span>

          <div class="material-thumb">
            <img
              v-if="item.thumbnailUrl"
              :alt="item.materialName"
              :src="item.thumbnailUrl"
            />
            <div v-else class="thumb-placeholder">
              <component
                :is="
                  item.materialType === 'video'
                    ? VideoCameraOutlined
                    : FileImageOutlined
                "
              />
            </div>
          </div>

          <div class="material-info">
            <div class="material-name" :title="item.materialName">
              {{ item.materialName }}
            </div>
            <div class="material-metrics">
              <span>消耗 {{ formatMoney(item.adMaterialCost) }}</span>
              <span>CTR {{ item.adMaterialCtr }}%</span>
              <span>CVR {{ item.adMaterialCvr }}%</span>
            </div>
          </div>

          <Tag :bordered="false" :color="roiColor(item.roi)" class="roi-tag">
            ROI {{ item.adMaterialRoi }}
          </Tag>
        </ListItem>
      </template>
    </List>
  </Card>
</template>

<style scoped lang="scss">
.data-card {
  height: 360px;

  :deep(.ant-card-body) {
    height: calc(100% - 57px);
    padding: 8px 16px;
    overflow-y: auto;
  }
}

/* 卡片标题前的主题色图标块 */
.pt-ic {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: 8px;
  color: #fff;
  background: hsl(258 84% 62%);
  border-radius: 8px;
  box-shadow: 0 3px 10px hsl(258 84% 62% / 32%);
}

.pt-ic--violet {
  background: linear-gradient(135deg, hsl(258 84% 62%), hsl(262 84% 70%));
}

.material-item {
  display: flex !important;
  gap: 12px;
  align-items: center;
  padding: 8px 0 !important;
  border-bottom: 1px solid hsl(var(--border)) !important;
}

/* 排名徽章：前三用强调色，其余中性 */
.rank-badge {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 8px;
}

.rank-badge--gold {
  color: #fff;
  background: linear-gradient(135deg, hsl(var(--warning)), hsl(35 92% 58%));
}

.rank-badge--violet {
  color: #fff;
  background: linear-gradient(135deg, hsl(258 84% 62%), hsl(262 84% 70%));
}

.rank-badge--cyan {
  color: #fff;
  background: linear-gradient(135deg, hsl(187 78% 38%), hsl(187 72% 50%));
}

.rank-badge--plain {
  color: hsl(var(--muted-foreground));
  background: hsl(var(--muted));
}

.material-thumb {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  overflow: hidden;
  background: hsl(var(--muted));
  border-radius: 8px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .thumb-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-size: 20px;
    color: hsl(var(--muted-foreground));
  }
}

.material-info {
  flex: 1;
  min-width: 0;

  .material-name {
    margin-bottom: 4px;
    overflow: hidden;
    font-size: 14px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .material-metrics {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }
}

.roi-tag {
  flex-shrink: 0;
  font-weight: 600;
}
</style>
