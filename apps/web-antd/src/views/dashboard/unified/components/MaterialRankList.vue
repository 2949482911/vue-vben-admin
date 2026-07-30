<script setup lang="ts" name="MaterialRankList">
/**
 * 素材效果排行
 *
 * 展示消耗 Top N 的素材及其 CTR/CVR/ROI
 */
import { Card, List, ListItem, Tag, Empty } from 'ant-design-vue';
import { VideoCameraOutlined, FileImageOutlined } from '@ant-design/icons-vue';
import type { MaterialRankItem } from '#/api/models';

defineProps<{
  /** 素材排行数据 */
  data: MaterialRankItem[];
  /** 加载状态 */
  loading?: boolean;
}>();

// 格式化金额
function formatMoney(cents: number): string {
  return `¥${(cents / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`;
}

// ROI 颜色
function roiColor(roi: number): string {
  if (roi >= 1.5) return 'green';
  if (roi >= 1) return 'blue';
  if (roi >= 0.5) return 'orange';
  return 'red';
}
</script>

<template>
  <Card title="素材效果排行" class="data-card" :loading="loading">
    <Empty v-if="data.length === 0 && !loading" description="暂无数据" />
    <List v-else :data-source="data" size="small" :split="false">
      <template #renderItem="{ item, index }">
        <ListItem class="material-item">
          <!-- 排名 -->
          <span class="rank-badge">{{ index + 1 }}</span>

          <!-- 缩略图 -->
          <div class="material-thumb">
            <img
              v-if="item.thumbnailUrl"
              :src="item.thumbnailUrl"
              :alt="item.materialName"
            />
            <div v-else class="thumb-placeholder">
              <component
                :is="item.materialType === 'video'
                  ? VideoCameraOutlined
                  : FileImageOutlined"
              />
            </div>
          </div>

          <!-- 信息 -->
          <div class="material-info">
            <div class="material-name" :title="item.materialName">
              {{ item.materialName }}
            </div>
            <div class="material-metrics">
              <span>消耗 {{ formatMoney(item.spend) }}</span>
              <span>CTR {{ item.ctr.toFixed(1) }}%</span>
              <span>CVR {{ item.cvr.toFixed(1) }}%</span>
            </div>
          </div>

          <!-- ROI -->
          <Tag :color="roiColor(item.roi)" :bordered="false" class="roi-tag">
            ROI {{ item.roi.toFixed(2) }}
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

.material-item {
  display: flex !important;
  align-items: center;
  gap: 12px;
  padding: 8px 0 !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04) !important;
}

.rank-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.65);
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.material-thumb {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.04);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .thumb-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(0, 0, 0, 0.25);
    font-size: 20px;
  }
}

.material-info {
  flex: 1;
  min-width: 0;

  .material-name {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.85);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 4px;
  }

  .material-metrics {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
  }
}

.roi-tag {
  flex-shrink: 0;
  font-weight: 600;
}
</style>
