<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';
import { onMounted, ref } from 'vue';
import { Button, TabPane, Tabs } from 'ant-design-vue';
import { CloseCircleFilled, CloseOutlined, DownOutlined, UpOutlined } from '@ant-design/icons-vue';
import selMaterial from './selMaterial.vue';
import type {
  AccountInfo,
  LocalMaterialData,
  Material,
  MaterialData,
} from '#/views/marketing/creation/creation';

const { accountInfo, imageMaxCount, videoMaxCount, distributionMode, material } = defineProps({
  imageMaxCount: { type: Number, default: 5 },
  videoMaxCount: { type: Number, default: 5 },
  distributionMode: { type: String, default: 'all' },
  accountInfo: {
    type: Array as () => AccountInfo[],
    default: () => [],
  },
  material: {
    type: Object,
    default: () => {
      return {
        config: {
          method: 'all',
        },
        data: new Map<string, Material>(),
      };
    },
  },
});

//临时变量
const cacheAllData = ref<Map<string, Material[]>>(new Map());
const cacheAccountData = ref<Map<string, Material[]>>(new Map());
// 本地变量
const localMaterialData = ref<MaterialData>({
  // 这个配置用不上
  config: {
    method: material.config.method,
  },
  data: new Map<string, Material[]>([
    [
      '0',
      [
        {
          image: [],
          video: [],
          active: 'video',
          isExpanded: true,
        },
      ],
    ],
  ]),
});
//---------按账户分配---------
const currentCreativeAccountId = ref<string>('0'); // 当前选中的账户ID

onMounted(() => {
  initAccounts();
});

defineExpose({
  initLocalMaterialData,
  getLocalMaterialData,
  setLocalMaterialData,
});

/**
 * 获取素材
 */
function getLocalMaterialData(): MaterialData {
  return localMaterialData.value;
}

/**
 * 设置素材
 */
function setLocalMaterialData(materialData: MaterialData) {
  const mode = materialData.config.method || 'all';
  const newMap = new Map();
  // 深拷贝数据
  materialData.data.forEach((v, k) => {
    newMap.set(k, JSON.parse(JSON.stringify(v)));
  });

  // 根据传入的模式，填充对应的缓存
  if (mode === 'all') {
    cacheAllData.value = newMap;
    // 同时也初始化一下另一个模式，防止切过去是空的
    cacheAccountData.value.clear();
  } else {
    cacheAccountData.value = newMap;
    cacheAllData.value.clear();
  }
  // 执行一次切换逻辑
  initLocalMaterialData(mode);
}

/**
 * 初始化素材变量
 */
function initLocalMaterialData(mode: string) {
  // 如果缓存里已经有数据了，就不要 clear，直接复用
  if (mode === 'all') {
    if (cacheAllData.value.size === 0) {
      // 只有第一次进入或真正需要重置时才初始化
      cacheAllData.value.set('0', [{ image: [], video: [], active: 'video', isExpanded: true }]);
    }
    // 切换当前显示引用
    localMaterialData.value.data = cacheAllData.value;
    currentCreativeAccountId.value = '0';
  } else {
    if (cacheAccountData.value.size === 0) {
      accountInfo.forEach((x) => {
        cacheAccountData.value.set(x.localAdvertiserId, [
          { image: [], video: [], active: 'video', isExpanded: true },
        ]);
      });
    }
    localMaterialData.value.data = cacheAccountData.value;
    currentCreativeAccountId.value = accountInfo[0]?.localAdvertiserId || '0';
  }
  localMaterialData.value.config.method = mode;
}

/**
 * 添加素材到本地素材对象内
 * @param materialType 素材类型
 * @param currentGroupIndex 当前创意组下标
 * @param materialList 素材列表
 */
async function addMaterial2LocalMaterialData(
  materialType: string,
  currentGroupIndex: number,
  materialList: Array<LocalMaterialData>,
) {
  let localMaterial: Array<Material> = [];
  if (distributionMode === 'all') {
    localMaterial = localMaterialData.value.data.get('0') || [];
  } else {
    localMaterial = localMaterialData.value.data.get(currentCreativeAccountId.value) || [];
  }
  let tempMaterial: Material = localMaterial[currentGroupIndex] || {
    image: [],
    video: [],
    active: materialType,
    isExpanded: true,
  };
  if (materialType === 'image') {
    tempMaterial.image.push(...materialList);
  } else {
    tempMaterial.video.push(...materialList);
  }
}

//---------选择素材框---------
const [SelMaterialModule, modalApi] = useVbenModal({
  connectedComponent: selMaterial,
  async onOpenChange(isOpen) {
    if (!isOpen) {
      const { materialList, materialType, currentGroupIndex } = modalApi.getData();
      if (materialList) {
        localMaterialData.value.config.method = distributionMode;
        await addMaterial2LocalMaterialData(materialType, currentGroupIndex, materialList);
      }
    }
  },
});

/** 打开素材弹框 */
async function openModal(type: 'image' | 'video', groupIndex: number) {
  // 1. 确定账户 Key
  const key = distributionMode === 'account' ? String(currentCreativeAccountId.value) : '0';

  // 2. 获取当前账户下的所有创意组
  const groups = localMaterialData.value.data.get(key) || [];

  // 3. 找到当前正在操作的那一个创意组
  const targetGroup = groups[groupIndex];

  if (!targetGroup) return;

  // 4. 计算该组内已有的素材数量
  const currentCount = type === 'image' ? targetGroup.image.length : targetGroup.video.length;

  // 5. 计算剩余配额 (例如：5 - 4 = 1)
  const maxLimit = type === 'image' ? imageMaxCount : videoMaxCount;
  const remainingQuota = maxLimit - currentCount;

  modalApi.setData({
    type: type,
    groupIndex: groupIndex,
    remainingQuota: remainingQuota, // 关键：传给子组件的是还能选几个
  });

  modalApi.open();
}

/**添加创意组 */
const addGroup = () => {
  if (distributionMode === 'all') {
    const materialList: Material[] = localMaterialData.value.data.get('0') || [];
    materialList.push({
      image: [],
      video: [],
      active: 'video',
      isExpanded: true,
    });
    localMaterialData.value.data.set('0', materialList);
  } else {
    const materialList: Material[] =
      localMaterialData.value.data.get(currentCreativeAccountId.value) || [];
    materialList.push({
      image: [],
      video: [],
      active: 'video',
      isExpanded: true,
    });
    localMaterialData.value.data.set(currentCreativeAccountId.value, materialList);
  }
};

// 初始化账户数据
const initAccounts = () => {
  if (localMaterialData.value.config.method == 'account') {
    currentCreativeAccountId.value = accountInfo[0]?.localAdvertiserId || '0'; // 默认选中第一个
  }
};

/** 分配方式公用的单个清除组的方法 */
const removeGroup = (index: number) => {
  // 1. 获取当前正在编辑的账户 Key（全部相同模式为 "0"，按账户分配模式为具体的 ID）
  const key = distributionMode === 'account' ? String(currentCreativeAccountId.value) : '0';

  // 2. 获取当前数组引用
  const currentList = localMaterialData.value.data.get(key);

  if (currentList && currentList.length > 1) {
    // 3. 执行删除操作
    currentList.splice(index, 1);

    // 4. 【关键】重新赋值 Map 以触发 Vue 响应式更新
    // 如果不重新 set，Vue 可能检测不到 Map 内部数组长度的变化
    localMaterialData.value.data.set(key, [...currentList]);
  }
};

/**
 * 分配方式公用的单个素材删除方法
 * @param groupIndex 创意组在列表中的索引 (gIdx)
 * @param type 素材类型 'image' | 'video'
 * @param assetIndex 素材在对应数组中的索引 (imgIdx / vIdx)
 */
const removeAsset = (groupIndex: number, type: 'image' | 'video', assetIndex: number) => {
  // 1. 获取当前操作的账户 Key
  const key = distributionMode === 'account' ? String(currentCreativeAccountId.value) : '0';

  // 2. 获取该账户下的所有创意组数据
  const currentList = localMaterialData.value.data.get(key);

  if (!currentList || !currentList[groupIndex]) return;

  // 3. 定位到目标创意组 (即你打印出来的那个对象)
  const targetGroup = currentList[groupIndex];

  // 4. 执行删除操作
  if (type === 'image' && targetGroup.image) {
    targetGroup.image.splice(assetIndex, 1);
  } else if (type === 'video' && targetGroup.video) {
    targetGroup.video.splice(assetIndex, 1);
  }

  // 5. 重新 set 触发响应式更新
  localMaterialData.value.data.set(key, [...currentList]);
};

/**分配方式公用的清空方法 */
const clearAllAssets = () => {
  const key = distributionMode === 'account' ? String(currentCreativeAccountId.value) : '0';
  const initialGroup = [
    {
      image: [],
      video: [],
      active: 'video',
      isExpanded: true,
    },
  ];

  // 4. 更新 Map 数据（使用解构确保响应式）
  localMaterialData.value.data.set(key, initialGroup);
};

const checkAccountHasData = (accountId: string | number) => {
  const data = localMaterialData.value.data.get(String(accountId));
  if (!data) return false;
  // 只要有一个组里有图片或视频，就显示“有数据”状态
  return data.some((group) => group.image.length > 0 || group.video.length > 0);
};
</script>

<template>
  <div class="main-wrapper">
    <div class="page-title">创意制作</div>
    <div v-if="distributionMode === 'account'" class="account-scroll-container">
      <div class="account-list">
        <template v-for="(acc, index) in accountInfo" :key="acc.localAdvertiserId">
          <div
            class="account-item"
            :class="{
              'is-active': currentCreativeAccountId === acc.localAdvertiserId,
              'has-data': checkAccountHasData(acc.localAdvertiserId),
            }"
            @click="currentCreativeAccountId = acc.localAdvertiserId"
          >
            {{ acc.localAdvertiserId }}
          </div>
          <div v-if="index < accountInfo.length - 1" class="v-divider"></div>
        </template>
      </div>
    </div>

    <div class="creative-container">
      <div class="header-toolbar">
        <div>
          创意组数量：<span class="count-text"
            >{{ localMaterialData.data.get(currentCreativeAccountId)?.length || 0 }}/200</span
          >
        </div>
        <Button type="primary" danger @click="clearAllAssets">清空</Button>
      </div>

      <div
        v-for="(group, index) in localMaterialData.data.get(currentCreativeAccountId) || []"
        class="group-card"
      >
        <div class="group-header">
          <div class="header-left">
            <span class="group-title">{{ '创意组' + (index + 1) }}</span>
            <DownOutlined v-if="group.isExpanded" @click="group.isExpanded = !group.isExpanded" />
            <UpOutlined v-else @click="group.isExpanded = !group.isExpanded" />
          </div>
          <div class="header-right">
            <Button
              type="text"
              size="small"
              @click.stop="removeGroup(index)"
              v-if="(localMaterialData.data.get(currentCreativeAccountId)?.length || 0) > 1"
            >
              <CloseOutlined />
            </Button>
          </div>
        </div>

        <div v-show="group.isExpanded" class="group-content">
          <Tabs v-model:activeKey="group.active" class="custom-tabs">
            <TabPane key="video">
              <template #tab>
                <span>视频({{ group.video.length }}/{{ videoMaxCount }})</span>
              </template>

              <div class="asset-grid">
                <div
                  v-for="(v, vIdx) in group.video"
                  :key="v.localMaterialId"
                  class="asset-item uploaded"
                >
                  <div class="img-box">
                    <img :src="v.url" />
                    <div class="play-icon">▶</div>
                    <CloseCircleFilled
                      class="remove-btn"
                      @click="removeAsset(index, 'video', vIdx)"
                    />
                  </div>
                  <div class="item-footer">
                    <div class="truncate" :title="v.name">{{ v.name }}</div>
                  </div>
                </div>

                <div
                  class="asset-item placeholder"
                  @click="openModal('video', index)"
                  v-if="group.video.length < videoMaxCount"
                >
                  <div class="placeholder-content">
                    <div class="p-icon">+</div>
                    <div class="p-text">选择视频</div>
                  </div>
                </div>
              </div>
            </TabPane>

            <TabPane key="image">
              <template #tab>
                <span>图片({{ group.image.length }}/{{ imageMaxCount }})</span>
              </template>

              <div class="asset-grid">
                <div
                  v-for="(img, iIdx) in group.image"
                  :key="img.localMaterialId"
                  class="asset-item uploaded"
                >
                  <div class="img-box">
                    <img :src="img.url" />
                    <CloseCircleFilled
                      class="remove-btn"
                      @click="removeAsset(index, 'image', iIdx)"
                    />
                  </div>
                  <div class="item-footer">
                    <div class="truncate" :title="img.name">{{ img.name }}</div>
                  </div>
                </div>

                <div
                  class="asset-item placeholder"
                  @click="openModal('image', index)"
                  v-if="group.image.length < imageMaxCount"
                >
                  <div class="placeholder-content">
                    <div class="p-icon" style="color: #006be6">+</div>
                    <div class="p-text">选择图片</div>
                  </div>
                </div>
              </div>
            </TabPane>
          </Tabs>
        </div>
      </div>

      <div class="footer-action">
        <Button type="primary" @click="addGroup">添加创意组</Button>
      </div>
    </div>
    <SelMaterialModule />
  </div>
</template>

<style scoped>
.main-wrapper {
  padding: 10px;
}

.page-title {
  margin-bottom: 10px;
  font-weight: 900;
  color: #333;
}

.creative-container {
  padding: 20px;
  border-radius: 4px;
}

.header-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.count-text {
  font-weight: bold;
  color: #006be6;
}

/* 创意组卡片 */
.group-card {
  margin-bottom: 15px;
  border: 1px solid #e8e8e8;
  border-radius: 2px;
}

.group-header {
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}

.group-title {
  margin: 0 10px 0 0;
  font-weight: 600;
}

/* Tabs 样式定制 */
.custom-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 15px;
}

.group-content {
  padding: 0 15px 15px;
}

/* 素材网格布局 */
.asset-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.asset-item {
  width: 150px;
  height: 200px;
  overflow: hidden;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.asset-item.uploaded {
  position: relative;
  overflow: visible; /* 允许按钮超出边界一点点，更美观 */
}

.remove-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  z-index: 10;
  font-size: 18px;
  line-height: 1;
  color: #bfbfbf;
  cursor: pointer;
  background: #fff;
  border-radius: 50%;
  transition: color 0.3s;
}

.remove-btn:hover {
  color: #ff4d4f; /* 悬浮时变红 */
}

/* 模拟图3的“选择其他”遮罩层 */
.hover-mask {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: rgb(0 0 0 / 40%);
  opacity: 0;
  transition: opacity 0.3s;
}

.img-box:hover .hover-mask {
  opacity: 1;
}

.reselect-text {
  padding: 2px 8px;
  font-size: 12px;
  color: #fff;
  background: #006be6;
  border-radius: 10px;
}

/* 上传占位样式 */
.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px dashed #d9d9d9;
  transition: all 0.3s;
}

.placeholder:hover {
  color: #006be6;
  border-color: #006be6;
}

.placeholder.disabled {
  color: #bfbfbf;
  cursor: not-allowed;
  background: #fafafa;
}

.p-icon {
  font-size: 28px;
  line-height: 1;
  text-align: center;
}

.p-text {
  margin-top: 4px;
  font-size: 12px;
}

/* 已上传素材样式 */
.uploaded .img-box {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 150px;
  background: #000;
}

.uploaded img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.play-icon {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  font-size: 20px;
  color: #fff;
  background: rgb(0 0 0 / 30%);
  border-radius: 50%;
}

.item-footer {
  padding: 6px;
  font-size: 11px;
  line-height: 1.2;
  color: #666;
}

.footer-action {
  margin-top: 20px;
}

/* 账户滚动区域 */
.account-scroll-container {
  width: 100%;
  padding: 10px 15px;
  margin-bottom: 12px;
  overflow-x: auto;
  border: 1px solid #dad9d9; /* 红色框 */
  border-radius: 4px;
}

.account-list {
  display: flex;
  align-items: center;
  white-space: nowrap;
}

/* 竖线 */
.v-divider {
  flex-shrink: 0;
  width: 1px;
  height: 14px;
  margin: 0 8px;
  background-color: #e8e8e8;
}

/* 隐藏滚动条样式（可选） */
.account-scroll-container::-webkit-scrollbar {
  height: 6px;
}

.account-scroll-container::-webkit-scrollbar-thumb {
  background: #cbcbcb;
  border-radius: 2px;
}

.account-item.no-data {
  opacity: 0.6;
}

/* 1. 基础样式：无数据时的置灰状态 */
.account-item {
  padding: 4px 12px;
  font-size: 13px;

  /* color: #bfbfbf; 默认置灰 */
  cursor: pointer;
  border-radius: 4px;
  opacity: 0.7;
  transition: all 0.2s;
}

/* 2. 有数据状态：文字变蓝，表示“已激活” */
.account-item.has-data {
  font-weight: bold;
  color: #006be6;
  opacity: 1;
}

/* 3. 悬浮效果：只有没被选中的时候才有 hover */
.account-item:hover {
  color: #006be6;
  opacity: 1;
}

/* 4. 选中状态：最高优先级，带背景色 */
.account-item.is-active {
  font-weight: 500;
  color: #fff !important; /* 强制白色文字覆盖蓝色 */
  background-color: #006be6;
  opacity: 1;
}
</style>
