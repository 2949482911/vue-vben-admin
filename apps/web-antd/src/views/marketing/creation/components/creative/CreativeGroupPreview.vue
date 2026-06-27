<script setup lang="ts" name="CreativeGroupPreview">
// 创意组预览组件 - 展示已选素材信息（通用组件）

import {computed} from 'vue';
import {Button, Space} from 'ant-design-vue';
import type {Material, MaterialData} from '#/views/marketing/creation/creation';
import {RuleMethod} from '#/views/marketing/creation/creation_enums';

const emit = defineEmits(['edit', 'clear']);

const {material, maxCount = 200} = defineProps<{
  material: MaterialData | null;
  maxCount?: number;
}>();

// 计算总素材数量
const totalCount = computed(() => {
  if (!material?.data) return 0;
  let total = 0;
  material.data.forEach(groups => {
    groups.forEach(g => {
      total += (g.video?.length || 0) + (g.image?.length || 0);
    });
  });
  return total;
});

// 获取分配方式标签
function getMethodLabel(): string {
  switch (material?.config?.method) {
    case RuleMethod.ALL:
      return '全账户复用';
    case RuleMethod.ACCOUNT:
      return '按账户分配';
    default:
      return '平均分配';
  }
}

// 获取创意组列表
const groupEntries = computed(() => {
  if (!material?.data) return [];
  const entries: Array<{ key: string; groups: Material[] }> = [];
  material.data.forEach((groups, key) => {
    entries.push({key, groups});
  });
  return entries;
});

// 判断是否为视频
function isVideo(fileName: string): boolean {
  const ext = fileName.split('.').pop()?.toLowerCase();
  return ['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext || '');
}

// 获取每个创意组中视频数量最多的那个作为显示
function getGroupMaterialCount(group: Material): number {
  return group.video?.length || group.image?.length || 0;
}
</script>

<template>
  <div v-if="totalCount > 0" class="creative-group-preview">
    <!-- 头部信息 -->
    <div class="preview-header">
      <div class="header-left">
        <Space align="center">
          <span class="header-title">创意素材</span>
          <span class="header-count">{{ totalCount }}/{{ maxCount }}</span>
        </Space>
      </div>
      <Button type="link" danger @click="emit('clear')">清空</Button>
    </div>

    <!-- 分配方式 -->
    <div class="distribution-info">
      <span class="distribution-label">分配方式：</span>
      <span class="distribution-value">{{ getMethodLabel() }}</span>
    </div>

    <!-- 创意组素材预览 -->
    <template v-for="entry in groupEntries" :key="entry.key">
      <div v-for="(group, index) in entry.groups" :key="`${entry.key}-${index}`" class="group-preview">
        <div class="group-header">
          <span class="group-name">创意组{{ String(index + 1).padStart(2, '0') }}</span>
          <span class="group-selected">
            已选：<span class="selected-count">{{ getGroupMaterialCount(group) }}个素材</span>
          </span>
        </div>
        <div class="group-materials">
          <div
            v-for="(mat, matIndex) in (group.video || group.image || []).slice(0, 8)"
            :key="matIndex"
            class="material-item"
          >
            <div class="material-thumb">
              <img :src="mat.url" :alt="mat.name" class="thumb-img"/>
              <div class="play-icon">
                <svg viewBox="0 0 1024 1024" width="24" height="24" fill="white">
                  <path
                    d="M358.4 249.6a38.4 38.4 0 0 1 57.6-32l390.4 224a38.4 38.4 0 0 1 0 64l-390.4 224a38.4 38.4 0 0 1-57.6-32v-448z"/>
                </svg>
              </div>
            </div>
          </div>
          <div
            v-if="(group.video || []).length > 8"
            class="material-more"
          >
            <span>+{{ (group.video || []).length - 8 }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.creative-group-preview {
  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;

      .header-title {
        font-size: 16px;
        font-weight: 600;
      }

      .header-count {
        font-size: 14px;
        font-weight: 500;
      }
    }
  }

  .distribution-info {
    margin-bottom: 12px;

    .distribution-label {
      font-weight: 500;
    }

    .distribution-value {
      font-weight: 500;
    }
  }

  .group-preview {
    margin-bottom: 16px;

    .group-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .group-name {
        font-weight: 500;
      }

      .selected-count {
        font-weight: 500;
      }
    }

    .group-materials {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 4px;

      .material-item {
        flex-shrink: 0;

        .material-thumb {
          position: relative;
          width: 72px;
          height: 96px;
          border-radius: 4px;
          overflow: hidden;

          .thumb-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .play-icon {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      }

      .material-more {
        flex-shrink: 0;
        width: 72px;
        height: 96px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 500;
      }
    }
  }

  .preview-footer {
    display: flex;
    justify-content: center;
    padding-top: 12px;
  }
}
</style>
