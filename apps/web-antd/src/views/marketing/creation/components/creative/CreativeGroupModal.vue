<script setup lang="ts" name="CreativeGroupModal">
// 创意组选择弹窗组件 - 供所有媒体公用

import {ref, computed, watch} from 'vue';
import {Button, RadioGroup, RadioButton, InputNumber, Switch, message} from 'ant-design-vue';
import {useVbenModal} from '@vben/common-ui';
import SelMaterial from '#/views/marketing/creation/selMaterial.vue';
import type {Material} from '#/views/marketing/creation/creation';
import {RuleMethod} from '#/views/marketing/creation/creation_enums';

const {formSchema} = defineProps({
  formSchema: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['submit']);

// 当前编辑的创意组列表
const creativeGroups = ref<Material[]>([]);
// 分配方式
const distributionMethod = ref<RuleMethod>(RuleMethod.ALL);
// 每个创意组配置：视频数、图片数
const groupVideoCount = ref<number>(5);
const groupImageCount = ref<number>(5);
// 自动生成封面
const autoGenerateCover = ref<boolean>(true);
// 视频同步主页
const videoSyncHomepage = ref<boolean>(false);
// 当前左侧选中的菜单项
const leftMenu = ref<string>('config');
// 当前编辑的创意组索引
const editingGroupIndex = ref<number>(0);

// 当前选中的素材类型
const activeTab = ref<'video' | 'image'>('video');

// 当前编辑的创意组（引用）
const currentGroup = computed(() => {
  return creativeGroups.value[editingGroupIndex.value] || {video: [], image: []};
});

// 左侧菜单项
const menuItems = computed(() => {
  const items: Array<{key: string; label: string}> = [];
  items.push({key: 'config', label: '素材分配方式'});
  items.push({key: 'group-config', label: '每个创意组配置'});
  items.push({key: 'cover', label: '自动生成封面'});
  items.push({key: 'sync', label: '视频同步主页'});
  creativeGroups.value.forEach((_, index) => {
    items.push({key: `group-${index}`, label: `创意组${String(index + 1).padStart(2, '0')}`});
  });
  return items;
});

const menuSections = computed(() => {
  const settings = menuItems.value.slice(0, 4);
  const groups = menuItems.value.slice(4);
  return {settings, groups};
});

const totalMaterials = computed(() => {
  let total = 0;
  creativeGroups.value.forEach(g => {
    total += (g.video?.length || 0) + (g.image?.length || 0);
  });
  return total;
});

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    for (let i = 0; i < creativeGroups.value.length; i++) {
      const group = creativeGroups.value[i];
      const videoLen = group.video?.length || 0;
      const imageLen = group.image?.length || 0;
      if (videoLen + imageLen === 0) {
        return message.warning(`创意组${String(i + 1).padStart(2, '0')} 未选择任何素材`);
      }
    }
    emit('submit', {
      groups: creativeGroups.value,
      method: distributionMethod.value,
      videoCount: groupVideoCount.value,
      imageCount: groupImageCount.value,
      autoGenerateCover: autoGenerateCover.value,
      videoSyncHomepage: videoSyncHomepage.value,
    });
    await modalApi.close();
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData();
      if (data) {
        creativeGroups.value = data.groups || [];
        if (creativeGroups.value.length === 0) {
          creativeGroups.value.push({
            image: [],
            video: [],
            isExpanded: false,
            active: '',
            brandName: '',
          });
        }
        distributionMethod.value = data.method || RuleMethod.ALL;
        groupVideoCount.value = data.videoCount || 5;
        groupImageCount.value = data.imageCount || 5;
        autoGenerateCover.value = data.autoGenerateCover ?? true;
        videoSyncHomepage.value = data.videoSyncHomepage || false;
        leftMenu.value = 'config';
        editingGroupIndex.value = 0;
        activeTab.value = 'video';
      }
    }
  },
});

function handleMenuClick(key: string) {
  leftMenu.value = key;
  if (key.startsWith('group-')) {
    editingGroupIndex.value = parseInt(key.replace('group-', ''), 10);
  }
}

function addCreativeGroup() {
  creativeGroups.value.push({
    image: [],
    video: [],
    isExpanded: false,
    active: '',
    brandName: '',
  });
  editingGroupIndex.value = creativeGroups.value.length - 1;
  leftMenu.value = `group-${creativeGroups.value.length - 1}`;
}

function removeCreativeGroup() {
  if (creativeGroups.value.length <= 1) {
    return message.warning('至少保留一个创意组');
  }
  creativeGroups.value.splice(editingGroupIndex.value, 1);
  if (editingGroupIndex.value >= creativeGroups.value.length) {
    editingGroupIndex.value = creativeGroups.value.length - 1;
  }
  leftMenu.value = `group-${editingGroupIndex.value}`;
}

function addMaterialToGroup(type: 'video' | 'image') {
  const group = creativeGroups.value[editingGroupIndex.value];
  if (!group) return;
  const maxCount = type === 'video' ? groupVideoCount.value : groupImageCount.value;
  const currentCount = type === 'video' ? (group.video?.length || 0) : (group.image?.length || 0);
  if (currentCount >= maxCount) {
    return message.warning(`${type === 'video' ? '视频' : '图片'}数量已达上限 ${maxCount} 个`);
  }
  message.info('素材选择功能待实现');
}

function removeMaterial(index: number, type: 'video' | 'image') {
  const group = creativeGroups.value[editingGroupIndex.value];
  if (!group) return;
  if (type === 'video') {
    group.video?.splice(index, 1);
  } else {
    group.image?.splice(index, 1);
  }
}

function clearAll() {
  creativeGroups.value = [];
  addCreativeGroup();
}

function shuffle() {
  message.info('乱序功能待实现');
}

function copyGroup() {
  const current = creativeGroups.value[editingGroupIndex.value];
  if (!current) return;
  const newGroup: Material = {
    video: current.video ? [...current.video] : [],
    image: current.image ? [...current.image] : [],
    isExpanded: false,
    active: '',
    brandName: '',
  };
  creativeGroups.value.push(newGroup);
  editingGroupIndex.value = creativeGroups.value.length - 1;
  leftMenu.value = `group-${creativeGroups.value.length - 1}`;
}

defineExpose({
  open: modalApi.open,
  close: modalApi.close,
  setData: modalApi.setData,
  getData: modalApi.getData,
});
</script>

<template>
  <Modal title="创意素材设置" class="creative-modal" :width="1200">
    <div class="creative-modal-content">
      <!-- 左侧菜单 -->
      <div class="modal-sidebar">
        <div class="sidebar-section">
          <div class="section-title">创意素材设置</div>
          <div
            v-for="item in menuSections.settings"
            :key="item.key"
            class="menu-item"
            :class="{ active: leftMenu === item.key }"
            @click="handleMenuClick(item.key)"
          >
            <span class="menu-dot" :class="{ green: leftMenu === item.key }"></span>
            <span class="menu-label">{{ item.label }}</span>
          </div>
        </div>
        <div class="sidebar-section">
          <div class="section-title">创意制作</div>
          <div
            v-for="item in menuSections.groups"
            :key="item.key"
            class="menu-item"
            :class="{ active: leftMenu === item.key }"
            @click="handleMenuClick(item.key)"
          >
            <span class="menu-dot" :class="{ green: leftMenu === item.key }"></span>
            <span class="menu-label">{{ item.label }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧内容 -->
      <div class="modal-main">
        <!-- 素材分配方式 -->
        <div v-if="leftMenu === 'config'" class="content-panel">
          <h3 class="panel-title">创意素材设置</h3>
          <div class="form-card">
            <div class="form-row">
              <label class="form-label">素材分配方式</label>
              <RadioGroup v-model:value="distributionMethod" class="method-radio">
                <RadioButton :value="RuleMethod.ALL">
                  <div class="radio-content">
                    <div class="radio-title">全账户复用</div>
                    <div class="radio-desc">所有账户都使用一样的素材</div>
                  </div>
                </RadioButton>
                <RadioButton :value="RuleMethod.ACCOUNT">
                  <div class="radio-content">
                    <div class="radio-title">平均分配</div>
                    <div class="radio-desc">素材平均分配到每个账户中</div>
                  </div>
                </RadioButton>
                <RadioButton value="individual">
                  <div class="radio-content">
                    <div class="radio-title">按账户分配</div>
                    <div class="radio-desc">每个账户单独选择素材</div>
                  </div>
                </RadioButton>
              </RadioGroup>
            </div>

            <div class="form-row">
              <label class="form-label">每个创意组配置</label>
              <div class="input-group">
                <InputNumber v-model:value="groupVideoCount" :min="1" :max="20" class="input-num" />
                <span class="unit">个视频</span>
                <InputNumber v-model:value="groupImageCount" :min="0" :max="20" class="input-num" />
                <span class="unit">个图片</span>
              </div>
            </div>

            <div class="form-row">
              <label class="form-label">自动生成封面</label>
              <Switch v-model:checked="autoGenerateCover" />
            </div>

            <div class="form-row">
              <label class="form-label">视频同步主页</label>
              <div class="sync-wrapper">
                <RadioGroup v-model:value="videoSyncHomepage">
                  <RadioButton :value="false">关闭</RadioButton>
                  <RadioButton :value="true">开启</RadioButton>
                </RadioGroup>
                <span class="sync-tip">仅当选择本地素材库时设置生效</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 每个创意组配置 -->
        <div v-else-if="leftMenu === 'group-config'" class="content-panel">
          <h3 class="panel-title">每个创意组配置</h3>
          <div class="form-card">
            <div class="config-item">
              <span class="config-label">视频数量：</span>
              <InputNumber v-model:value="groupVideoCount" :min="1" :max="20" />
            </div>
            <div class="config-item">
              <span class="config-label">图片数量：</span>
              <InputNumber v-model:value="groupImageCount" :min="0" :max="20" />
            </div>
          </div>
        </div>

        <!-- 自动生成封面 -->
        <div v-else-if="leftMenu === 'cover'" class="content-panel">
          <h3 class="panel-title">自动生成封面</h3>
          <div class="form-card">
            <Switch v-model:checked="autoGenerateCover" />
            <span class="switch-label">开启后将自动为视频生成封面图</span>
          </div>
        </div>

        <!-- 视频同步主页 -->
        <div v-else-if="leftMenu === 'sync'" class="content-panel">
          <h3 class="panel-title">视频同步主页</h3>
          <div class="form-card">
            <RadioGroup v-model:value="videoSyncHomepage">
              <RadioButton :value="false">关闭</RadioButton>
              <RadioButton :value="true">开启</RadioButton>
            </RadioGroup>
            <p class="tip">仅当选择本地素材库时设置生效</p>
          </div>
        </div>

        <!-- 创意制作 - 创意组编辑 -->
        <template v-else-if="leftMenu.startsWith('group-')">
          <div class="content-panel">
            <div class="stats-bar">
              <span class="stats-title">创意组数量：<span class="stats-count">{{ totalMaterials }}/200</span></span>
              <div class="stats-actions">
                <Button type="link" class="action-btn" @click="shuffle">乱序</Button>
                <Button type="link" class="action-btn" @click="clearAll">清空</Button>
                <Button type="link" class="action-btn" @click="addCreativeGroup">
                  + 批量添加素材
                </Button>
              </div>
            </div>

            <div class="group-panel">
              <div class="group-header">
                <span class="group-title">创意组{{ String(editingGroupIndex + 1).padStart(2, '0') }}</span>
                <div class="group-actions">
                  <Button size="small" type="link" @click="copyGroup">复制</Button>
                  <Button size="small" type="link" @click="shuffle">乱序</Button>
                  <Button size="small" type="link" danger @click="removeCreativeGroup">×</Button>
                </div>
              </div>

              <div class="group-tabs">
                <div
                  class="tab-item"
                  :class="{ active: activeTab === 'video' }"
                  @click="activeTab = 'video'"
                >
                  视频({{ currentGroup.video?.length || 0 }}/{{ groupVideoCount }})
                </div>
                <div
                  class="tab-item"
                  :class="{ active: activeTab === 'image' }"
                  @click="activeTab = 'image'"
                >
                  图片({{ currentGroup.image?.length || 0 }}/{{ groupImageCount }})
                </div>
                <Button size="small" class="add-material-btn" @click="addMaterialToGroup(activeTab)">
                  + 添加素材
                </Button>
              </div>

              <div class="material-grid">
                <template v-if="activeTab === 'video'">
                  <div
                    v-for="(mat, index) in currentGroup.video || []"
                    :key="index"
                    class="material-card"
                  >
                    <div class="material-preview">
                      <video :src="mat.url" class="preview-thumb" />
                      <div class="play-overlay">▶</div>
                    </div>
                    <div class="material-info">
                      <span class="material-name" :title="mat.name">{{ mat.name }}</span>
                    </div>
                    <div class="material-delete" @click="removeMaterial(index, 'video')">
                      ×
                    </div>
                  </div>
                  <div class="material-card add-card" @click="addMaterialToGroup('video')">
                    <div class="add-icon">+</div>
                    <span>添加素材</span>
                  </div>
                </template>

                <template v-else>
                  <div
                    v-for="(mat, index) in currentGroup.image || []"
                    :key="index"
                    class="material-card"
                  >
                    <div class="material-preview">
                      <img :src="mat.url" :alt="mat.name" class="preview-thumb" />
                    </div>
                    <div class="material-info">
                      <span class="material-name" :title="mat.name">{{ mat.name }}</span>
                    </div>
                    <div class="material-delete" @click="removeMaterial(index, 'image')">
                      ×
                    </div>
                  </div>
                  <div class="material-card add-card" @click="addMaterialToGroup('image')">
                    <div class="add-icon">+</div>
                    <span>添加素材</span>
                  </div>
                </template>
              </div>

              <Button class="add-group-btn" type="primary" @click="addCreativeGroup">
                + 添加创意组
              </Button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </Modal>

  <SelMaterial />
</template>

<style scoped lang="scss">
.creative-modal-content {
  display: flex;
  height: calc(100vh - 200px);
  overflow: hidden;

  .modal-sidebar {
    width: 200px;
    border-right: 1px solid #e8e8e8;
    overflow-y: auto;
    padding: 16px 0;

    .sidebar-section {
      margin-bottom: 16px;

      .section-title {
        font-size: 13px;
        font-weight: 600;
        color: #333;
        padding: 0 16px 8px;
      }

      .menu-item {
        display: flex;
        align-items: center;
        padding: 8px 16px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: #f5f5f5;
        }

        &.active {
          background: #e6f4ff;

          .menu-label {
            color: #1677ff;
            font-weight: 500;
          }
        }

        .menu-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #d9d9d9;
          margin-right: 8px;
          flex-shrink: 0;

          &.green {
            background: #52c41a;
          }
        }

        .menu-label {
          font-size: 13px;
          color: #666;
        }
      }
    }
  }

  .modal-main {
    flex: 1;
    overflow-y: auto;
    padding: 16px 24px;
    background: #f5f5f5;

    .content-panel {
      .panel-title {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 16px;
      }

      .form-card {
        background: white;
        border-radius: 8px;
        padding: 20px 24px;
        margin-bottom: 16px;

        .form-row {
          display: flex;
          align-items: center;
          margin-bottom: 16px;

          &:last-child {
            margin-bottom: 0;
          }

          .form-label {
            width: 120px;
            font-size: 14px;
            color: #333;
            flex-shrink: 0;
          }

          .method-radio {
            display: flex;
            gap: 12px;

            :deep(.ant-radio-button-wrapper) {
              padding: 12px 16px;
              border-radius: 8px;

              &.ant-radio-button-wrapper-checked {
                background: #52c41a;
                border-color: #52c41a;
                color: white;
              }

              .radio-content {
                .radio-title {
                  font-weight: 500;
                }

                .radio-desc {
                  font-size: 12px;
                  opacity: 0.7;
                }
              }
            }
          }

          .input-group {
            display: flex;
            align-items: center;
            gap: 8px;

            .input-num {
              width: 80px;
            }

            .unit {
              color: #666;
            }
          }

          .sync-wrapper {
            display: flex;
            flex-direction: column;
            gap: 4px;

            .sync-tip {
              font-size: 12px;
              color: #faad14;
            }
          }
        }

        .config-item {
          display: flex;
          align-items: center;
          margin-bottom: 12px;

          .config-label {
            width: 100px;
            color: #666;
          }
        }

        .switch-label {
          margin-left: 12px;
          color: #666;
        }

        .tip {
          font-size: 12px;
          color: #faad14;
          margin-top: 8px;
        }
      }

      .stats-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .stats-title {
          font-size: 14px;
          color: #333;

          .stats-count {
            color: #52c41a;
            font-weight: 600;
          }
        }

        .stats-actions {
          display: flex;
          gap: 8px;

          .action-btn {
            color: #52c41a;
          }
        }
      }

      .group-panel {
        background: white;
        border-radius: 8px;
        padding: 16px 20px;
        margin-bottom: 16px;

        .group-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          border-bottom: 1px solid #f0f0f0;

          .group-title {
            font-size: 14px;
            font-weight: 500;
          }

          .group-actions {
            display: flex;
            gap: 8px;
          }
        }

        .group-tabs {
          display: flex;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;

          .tab-item {
            padding: 8px 16px;
            cursor: pointer;
            font-size: 13px;
            color: #666;
            border-bottom: 2px solid transparent;

            &.active {
              color: #52c41a;
              border-bottom-color: #52c41a;
              font-weight: 500;
            }
          }

          .add-material-btn {
            margin-left: auto;
            color: #52c41a;
            border-color: #52c41a;
          }
        }

        .material-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 12px;
          padding: 16px 0;

          .material-card {
            position: relative;
            border: 1px solid #e8e8e8;
            border-radius: 8px;
            overflow: hidden;
            transition: all 0.2s;

            &:hover {
              border-color: #52c41a;
              box-shadow: 0 2px 8px rgba(82, 196, 26, 0.15);

              .material-delete {
                display: block;
              }
            }

            .material-preview {
              position: relative;
              width: 100%;
              height: 180px;
              background: #f5f5f5;

              .preview-thumb {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }

              .play-overlay {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 36px;
                height: 36px;
                background: rgba(0, 0, 0, 0.6);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 14px;
              }
            }

            .material-info {
              padding: 8px;

              .material-name {
                font-size: 12px;
                color: #333;
                display: block;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
            }

            .material-delete {
              display: none;
              position: absolute;
              top: 4px;
              right: 4px;
              width: 20px;
              height: 20px;
              background: rgba(0, 0, 0, 0.5);
              border-radius: 50%;
              color: white;
              text-align: center;
              line-height: 20px;
              font-size: 12px;
              cursor: pointer;
            }

            &.add-card {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 180px;
              cursor: pointer;
              border: 1px dashed #d9d9d9;
              background: #fafafa;

              &:hover {
                border-color: #52c41a;
                color: #52c41a;
                background: #f6ffed;
              }

              .add-icon {
                font-size: 24px;
                color: #999;
              }

              span {
                font-size: 12px;
                color: #999;
                margin-top: 8px;
              }
            }
          }
        }

        .add-group-btn {
          background: #52c41a;
          border-color: #52c41a;
        }
      }
    }
  }
}
</style>
