<script setup lang="ts" name="CreativeGroupDrawer">
// 创意组编辑抽屉 - 供所有媒体公用

import {computed, nextTick, ref} from 'vue';
import {
  Anchor,
  AnchorLink,
  Button,
  Card,
  Collapse,
  CollapsePanel,
  Divider,
  InputNumber,
  message,
  RadioButton,
  RadioGroup,
  Space,
  Switch,
  TabPane,
  Tabs,
} from 'ant-design-vue';
import {useVbenDrawer, useVbenModal} from '@vben/common-ui';
import type {AccountInfo, Material, MaterialData} from '#/views/marketing/creation/creation';
import {RuleMethod} from '#/views/marketing/creation/creation_enums';
import MaterialSelector from '../material/MaterialSelector.vue';
import type {MaterialItem} from "#/api/models/assert";

/**
 * 素材选择组件
 */
const [MaterialSelectorModal, materialSelectorApi] = useVbenModal({
  connectedComponent: MaterialSelector
})

const emit = defineEmits(['update:material']);

/**
 *
 */
const {accountInfo} = defineProps({
  accountInfo: {
    type: Array<AccountInfo>,
    default: () => [],
  },
});


// 按账户分配的创意组数据 key=accountId
const accountCreativeGroups = ref<Map<string, Material[]>>(new Map());
// 当前选中的账户ID
const activeAccountId = ref<string>('');

// 获取当前账户的创意组列表
// const currentGroups = computed(() => {
//   if (distributionMethod.value === RuleMethod.ACCOUNT) {
//     return accountCreativeGroups.value.get(activeAccountId.value) || [];
//   }
//   return creativeGroups.value;
// });

// 初始化账户创意组数据（仅补充未存在的账户，不覆盖已有数据）
function initAccountGroups() {
  // 只在 Map 为空时才初始化，避免覆盖已有数据
  if (accountCreativeGroups.value.size === 0) {
    accountInfo.forEach(account => {
      const accountId = String(account.localAdvertiserId);
      if (!accountCreativeGroups.value.has(accountId)) {
        accountCreativeGroups.value.set(accountId, [{
          image: [],
          video: [],
          isExpanded: false,
          active: '',
          brandName: '',
        }]);
      }
    });
  }
  // 始终确保有默认选中账户
  if (accountInfo.length > 0 && !activeAccountId.value) {
    activeAccountId.value = String(accountInfo[0]?.localAdvertiserId);
  }
}

// 切换账户Tab
function onAccountTabChange(accountId: string) {
  activeAccountId.value = accountId;
  activeCollapseKeys.value = [0];
  activeTabs.value.clear();
  currentAnchor.value = ['group-0'];
}

// 获取账户名称
function getAccountName(account: AccountInfo): string {
  return `${account.advertiserName}(${account.localAdvertiserId})`;
}

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
// 当前选中的素材类型（每个创意组独立）
const activeTabs = ref<Map<number, 'video' | 'image'>>(new Map());
// 展开的创意组索引
const activeCollapseKeys = ref<number[]>([0]);
// 当前锚点
const currentAnchor = ref<string[]>(['group-0']);

// 当前正在添加素材的创意组索引
const currentMaterialGroupIndex = ref<number>(-1);
// 当前正在添加的素材类型
const currentMaterialType = ref<'video' | 'image'>('video');

// 获取当前创意组的活跃tab
function getActiveTab(index: number): 'video' | 'image' {
  return activeTabs.value.get(index) || 'video';
}

// 设置当前创意组的活跃tab
function setActiveTab(index: number, key: 'video' | 'image') {
  activeTabs.value.set(index, key);
}

/**
 * 全部素材个数
 */
const totalMaterials = computed(() => {
  let total = 0;
  const groups = distributionMethod.value === RuleMethod.ACCOUNT
    ? (accountCreativeGroups.value.get(activeAccountId.value) || [])
    : creativeGroups.value;
  groups.forEach(g => {
    total += (g.video?.length || 0) + (g.image?.length || 0);
  });
  return total;
});

// 获取当前操作的创意组列表
function getCurrentGroups(): Material[] {
  if (distributionMethod.value === RuleMethod.ACCOUNT) {
    return accountCreativeGroups.value.get(activeAccountId.value) || [];
  }
  return creativeGroups.value;
}


/**
 * 切换分配方式时清空素材数据
 * - 切换到账户分配：清空全部复用数据，初始化账户数据
 * - 切换到全部复用/平均分配：清空账户数据，初始化创意组数据
 */
function allocationMethodChange() {
  activeTabs.value.clear();
  activeCollapseKeys.value = [0];
  currentAnchor.value = ['group-0'];

  if (distributionMethod.value === RuleMethod.ACCOUNT) {
    // 切换到账户分配：清空全部复用数据，初始化账户数据
    creativeGroups.value = [];
    accountCreativeGroups.value.clear();
    accountInfo.forEach(account => {
      const accountId = String(account.localAdvertiserId);
      accountCreativeGroups.value.set(accountId, [{
        image: [],
        video: [],
        isExpanded: false,
        active: '',
        brandName: '',
      }]);
    });
    if (accountInfo.length > 0) {
      activeAccountId.value = String(accountInfo[0]?.localAdvertiserId);
    }
  } else {
    // 切换到全部复用/平均分配：清空账户数据，初始化创意组数据
    accountCreativeGroups.value.clear();
    activeAccountId.value = '';
    if (creativeGroups.value.length === 0) {
      creativeGroups.value.push({
        image: [],
        video: [],
        isExpanded: false,
        active: '',
        brandName: '',
      });
    }
  }
}


// 抽屉
const [Drawer, drawerApi] = useVbenDrawer({
  closeOnClickModal: false,
  placement: 'right',
  class: 'creative-group-drawer w-[75vw]',
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData();
      if (data) {
        distributionMethod.value = data.method || RuleMethod.ALL;
        activeTabs.value.clear();
        currentAnchor.value = ['group-0'];

        // 根据分配方式初始化创意组数据
        if (data.method === RuleMethod.ACCOUNT && data.data instanceof Map) {
          // 按账户分配：从 data Map 中恢复各账户的创意组
          accountCreativeGroups.value.clear();
          data.data.forEach((groups, accountId) => {
            accountCreativeGroups.value.set(accountId, groups || []);
          });
          if (accountInfo.length > 0) {
            activeAccountId.value = String(accountInfo[0]?.localAdvertiserId);
          }
          // 全账户复用/平均分配：从 data 的 '0' key 恢复
        } else if (data.data instanceof Map) {
          creativeGroups.value = data.data.get('0') || [];
        } else if (data.groups) {
          // 兼容旧格式
          creativeGroups.value = data.groups;
        }

        // 确保至少有一个创意组
        if (creativeGroups.value.length === 0 && distributionMethod.value !== RuleMethod.ACCOUNT) {
          creativeGroups.value.push({
            image: [],
            video: [],
            isExpanded: false,
            active: '',
            brandName: '',
          });
        }

        // 初始化账户数据（补充未存在的账户）
        initAccountGroups();
      }
    }
  },
  async onConfirm() {
    const groupsToValidate = getCurrentGroups();
    for (let i = 0; i < groupsToValidate.length; i++) {
      const group = groupsToValidate[i];
      const videoLen = group?.video?.length || 0;
      const imageLen = group?.image?.length || 0;
      if (videoLen + imageLen === 0) {
        return message.warning(`创意组${String(i + 1).padStart(2, '0')} 未选择任何素材`);
      }
    }

    // 构建返回数据
    const result: MaterialData = {
      config: {
        method: distributionMethod.value,
      },
      data: new Map<string, Material[]>(),
    };

    if (distributionMethod.value === RuleMethod.ACCOUNT) {
      // 按账户分配: data 的 key 是账户ID
      accountCreativeGroups.value.forEach((groups, accountId) => {
        result.data.set(accountId, groups);
      });
    } else {
      // 全部相同/平均分配: data 的 key 是 0
      result.data.set('0', creativeGroups.value);
    }

    emit('update:material', result);
    await drawerApi.close();
  },
  onCancel() {
    drawerApi.close();
  },
});

// 新增创意组
function addCreativeGroup() {
  const groups = getCurrentGroups();
  const newIndex = groups.length;
  groups.push({
    image: [],
    video: [],
    isExpanded: false,
    active: '',
    brandName: '',
  });
  activeCollapseKeys.value = [newIndex];
  activeTabs.value.clear();
  nextTick(() => {
    const el = document.getElementById(`group-${newIndex}`);
    if (el) {
      el.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
    currentAnchor.value = [`group-${newIndex}`];
  });
}

// 删除创意组
function removeCreativeGroup(index: number) {
  const groups = getCurrentGroups();
  if (groups.length <= 1) {
    return message.warning('至少保留一个创意组');
  }
  groups.splice(index, 1);
  activeCollapseKeys.value = activeCollapseKeys.value
    .map(k => (k > index ? k - 1 : k))
    .filter(k => k < groups.length);
  if (activeCollapseKeys.value.length === 0 && groups.length > 0) {
    activeCollapseKeys.value = [Math.min(index, groups.length - 1)];
  }
}

// 打开素材选择器
function openMaterialSelector(index: number, type: 'video' | 'image') {
  const groups = getCurrentGroups();
  const group = groups[index];
  if (!group) return;
  const maxCount = type === 'video' ? groupVideoCount.value : groupImageCount.value;
  const currentCount = type === 'video' ? (group.video?.length || 0) : (group.image?.length || 0);
  if (currentCount >= maxCount) {
    return message.warning(`${type === 'video' ? '视频' : '图片'}数量已达上限 ${maxCount} 个`);
  }
  currentMaterialGroupIndex.value = index;
  currentMaterialType.value = type;
  // 设置文件类型
  materialSelectorApi.setData({
    materialType: type,
    // 当前组的下标
    currentMaterialGroupIndex: index,
  });
  materialSelectorApi.open();
}

// 删除素材
function removeMaterial(groupIndex: number, matIndex: number, type: 'video' | 'image') {
  const groups = getCurrentGroups();
  const group = groups[groupIndex];
  if (!group) return;
  if (type === 'video') {
    group.video?.splice(matIndex, 1);
  } else {
    group.image?.splice(matIndex, 1);
  }
}

function shuffleGroup() {
  message.info('乱序功能待实现');
}

/**
 * 复制组
 * @param index
 */
function copyGroup(index: number) {
  const groups = getCurrentGroups();
  const current = groups[index];
  if (!current) return;
  const newGroup: Material = {
    video: current.video ? [...current.video] : [],
    image: current.image ? [...current.image] : [],
    isExpanded: false,
    active: '',
    brandName: '',
  };
  groups.push(newGroup);
  activeCollapseKeys.value = [groups.length - 1];
  nextTick(() => {
    const el = document.getElementById(`group-${groups.length - 1}`);
    if (el) {
      el.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
    currentAnchor.value = [`group-${groups.length - 1}`];
  });
}

/**
 * 锚点跳转
 * @param index
 * @param event
 */
function scrollToGroup(index: number, event: Event) {
  event.preventDefault();
  event.stopPropagation();
  const el = document.getElementById(`group-${index}`);
  if (el) {
    el.scrollIntoView({behavior: 'smooth', block: 'start'});
  }
  currentAnchor.value = [`group-${index}`];
}

// 获取素材卡片内容
function getMaterialCards(groupIndex: number, type: 'video' | 'image') {
  const groups = getCurrentGroups();
  const group = groups[groupIndex];
  if (!group) return [];
  const materials = type === 'video' ? (group.video || []) : (group.image || []);
  const maxCount = type === 'video' ? groupVideoCount.value : groupImageCount.value;
  const cards: Array<{ type: 'material' | 'empty'; index: number; mat?: any }> = [];

  materials.forEach((mat: any, index: number) => {
    cards.push({type: 'material', index, mat});
  });

  for (let i = materials.length; i < maxCount; i++) {
    cards.push({type: 'empty', index: i});
  }

  return cards;
}


/**
 * 更新素材 - 接收 MaterialSelector 的 emit，将素材绑定到创意组
 */
function updateMaterial(selectedMaterials: Array<MaterialItem>, creativeGroupIndex: number) {
  if (creativeGroupIndex < 0 || !selectedMaterials.length) return;

  // 将 MaterialItem 转换为 Material 素材格式
  const materials = selectedMaterials.map(item => ({
    name: item.name,
    url: item.fileUrl,
    localMaterialId: item.id,
  }));

  // 根据分配模式更新素材
  if (distributionMethod.value === RuleMethod.ACCOUNT) {
    // 按账户分配：更新当前账户的创意组素材
    const accountGroups = accountCreativeGroups.value.get(activeAccountId.value);
    if (accountGroups && accountGroups[creativeGroupIndex]) {
      const group = accountGroups[creativeGroupIndex];
      if (currentMaterialType.value === 'video' && group) {
        group.video = materials;
      } else {
        group.image = materials;
      }
    }
  } else {
    // 全账户复用/平均分配：key 为 '0'
    const groups = creativeGroups.value;
    if (groups[creativeGroupIndex]) {
      const group = groups[creativeGroupIndex];
      if (currentMaterialType.value === 'video' && group) {
        group.video = materials;
      } else {
        group.image = materials;
      }
    }
  }
}

</script>

<template>
  <Drawer title="创意素材设置" size="large">
    <Space direction="vertical" class="w-full">
      <!-- 创意素材设置 -->
      <Card title="创意素材设置">
        <Space direction="vertical" class="w-full">
          <div class="form-item">
            <span class="form-label">素材分配方式</span>
            <RadioGroup v-model:value="distributionMethod" @change="allocationMethodChange">
              <RadioButton :value="RuleMethod.ALL">全账户复用</RadioButton>
              <RadioButton :value="RuleMethod.AVG">平均分配</RadioButton>
              <RadioButton :value="RuleMethod.ACCOUNT">按账户分配</RadioButton>
            </RadioGroup>
          </div>
          <Divider/>
          <div class="form-item">
            <span class="form-label">每个创意组配置</span>
            <Space>
              <InputNumber v-model:value="groupVideoCount" :min="1" :max="20"/>
              <span>个视频</span>
              <InputNumber v-model:value="groupImageCount" :min="0" :max="20"/>
              <span>个图片</span>
            </Space>
          </div>
          <Divider/>
          <div class="form-item">
            <span class="form-label">自动生成封面</span>
            <Switch v-model:checked="autoGenerateCover"/>
          </div>
          <Divider/>
          <div class="form-item">
            <span class="form-label">视频同步主页</span>
            <Space direction="vertical" size="small">
              <RadioGroup v-model:value="videoSyncHomepage">
                <RadioButton :value="false">关闭</RadioButton>
                <RadioButton :value="true">开启</RadioButton>
              </RadioGroup>
              <span class="tip-text">仅当选择本地素材库时设置生效</span>
            </Space>
          </div>
        </Space>
      </Card>

      <!-- 按账户分配时的账户Tab -->
      <Card v-if="distributionMethod === RuleMethod.ACCOUNT" title="账户选择">
        <Tabs
          :active-key="activeAccountId"
          type="card"
          @change="onAccountTabChange"
        >
          <TabPane
            v-for="account in accountInfo"
            :key="String(account.localAdvertiserId)"
            :tab="getAccountName(account)"
          >
            <div class="collapse-header">
              <span class="collapse-title">创意组</span>
              <Button size="small" @click="addCreativeGroup">+添加创意组</Button>
            </div>
            <div class="creative-content">
              <div class="anchor-nav">
                <Anchor v-model:selected-key="currentAnchor" :target-offset="200" :affix="false"
                        class="creative-anchor">
                  <AnchorLink
                    v-for="(_, index) in accountCreativeGroups.get(activeAccountId) || []"
                    :key="`group-${index}`"
                    :href="`#group-${index}`"
                    :title="`创意组${String(index + 1).padStart(2, '0')}`"
                    @click="(e: Event) => scrollToGroup(index, e)"
                  />
                </Anchor>
              </div>
              <div class="collapse-content">
                <Collapse v-model:activeKey="activeCollapseKeys" class="w-full creative-collapse">
                  <CollapsePanel
                    v-for="(group, groupIndex) in (accountCreativeGroups.get(activeAccountId) || [])"
                    :key="groupIndex"
                    :id="`group-${groupIndex}`"
                    :header="`创意组${String(groupIndex + 1).padStart(2, '0')} (${(group.video?.length || 0) + (group.image?.length || 0)}个素材)`"
                  >
                    <template #extra>
                      <Space size="small">
                        <Button size="small" type="text" @click.stop="copyGroup(groupIndex)">复制
                        </Button>
                        <Button size="small" type="text" @click.stop="shuffleGroup">乱序
                        </Button>
                        <Button size="small" type="text" danger @click.stop="removeCreativeGroup(groupIndex)">删除
                        </Button>
                      </Space>
                    </template>

                    <Tabs
                      :activeKey="getActiveTab(groupIndex)"
                      @update:activeKey="(key) => setActiveTab(groupIndex, key as 'video' | 'image')"
                    >
                      <TabPane
                        :key="'video'"
                        :tab="`视频(${(group.video?.length || 0)}/${groupVideoCount})`"
                      >
                        <div class="tabs-actions">
                          <Button type="primary" size="small"
                                  @click="openMaterialSelector(groupIndex, 'video')">
                            + 添加素材
                          </Button>
                        </div>
                        <div class="material-grid">
                          <template v-for="card in getMaterialCards(groupIndex, 'video')"
                                    :key="card.index">
                            <div v-if="card.type === 'material'" class="material-card">
                              <div class="material-preview">
                                <video :src="card.mat.url" class="preview-thumb"/>
                                <div class="play-overlay">▶</div>
                              </div>
                              <div class="material-info">
                              <span class="material-name" :title="card.mat.name">{{
                                  card.mat.name
                                }}</span>
                              </div>
                              <div class="material-delete"
                                   @click="removeMaterial(groupIndex, card.index, 'video')">
                                ×
                              </div>
                            </div>
                            <div v-else-if="card.type === 'empty'" class="material-card empty-card"
                                 @click="openMaterialSelector(groupIndex, 'video')">
                              <div class="empty-icon">
                                <div class="icon-circle">
                                  <span class="icon-text">选择视频</span>
                                </div>
                              </div>
                            </div>
                          </template>
                        </div>
                      </TabPane>
                      <TabPane
                        :key="'image'"
                        :tab="`图片(${(group.image?.length || 0)}/${groupImageCount})`"
                      >
                        <div class="tabs-actions">
                          <Button type="primary" size="small"
                                  @click="openMaterialSelector(groupIndex, 'image')">
                            + 添加素材
                          </Button>
                        </div>
                        <div class="material-grid">
                          <template v-for="card in getMaterialCards(groupIndex, 'image')"
                                    :key="card.index">
                            <div v-if="card.type === 'material'" class="material-card">
                              <div class="material-preview">
                                <img :src="card.mat.url" :alt="card.mat.name"
                                     class="preview-thumb"/>
                              </div>
                              <div class="material-info">
                              <span class="material-name" :title="card.mat.name">{{
                                  card.mat.name
                                }}</span>
                              </div>
                              <div class="material-delete"
                                   @click="removeMaterial(groupIndex, card.index, 'image')">
                                ×
                              </div>
                            </div>
                            <div v-else-if="card.type === 'empty'" class="material-card empty-card"
                                 @click="openMaterialSelector(groupIndex, 'image')">
                              <div class="empty-icon">
                                <div class="icon-circle">
                                  <span class="icon-text">选择图片</span>
                                </div>
                              </div>
                            </div>
                          </template>
                        </div>
                      </TabPane>
                    </Tabs>
                  </CollapsePanel>
                </Collapse>
              </div>
            </div>
          </TabPane>
        </Tabs>
      </Card>

      <!-- 全账户复用/平均分配时的创意组列表 -->
      <Card v-else title="创意组">
        <div class="collapse-header">
          <span>{{ totalMaterials / 200 }}</span>
          <Button type="dashed" size="small" @click="addCreativeGroup">+ 添加创意组</Button>
        </div>

        <div class="creative-content">
          <!-- 左侧锚点导航 -->
          <div class="anchor-nav">
            <Anchor v-model:selected-key="currentAnchor" :target-offset="200" :affix="false"
                    class="creative-anchor">
              <AnchorLink
                v-for="(_, index) in creativeGroups"
                :key="`group-${index}`"
                :href="`#group-${index}`"
                :title="`创意组${String(index + 1).padStart(2, '0')}`"
                @click="(e: Event) => scrollToGroup(index, e)"
              />
            </Anchor>
          </div>

          <!-- 右侧内容区 -->
          <div class="collapse-content">
            <Collapse v-model:activeKey="activeCollapseKeys" class="w-full creative-collapse">
              <CollapsePanel
                v-for="(group, groupIndex) in creativeGroups"
                :key="groupIndex"
                :id="`group-${groupIndex}`"
                :header="`创意组${String(groupIndex + 1).padStart(2, '0')} (${(group.video?.length || 0) + (group.image?.length || 0)}个素材)`"
              >
                <template #extra>
                  <Space size="small">
                    <Button size="small" type="text" @click.stop="copyGroup(groupIndex)">复制
                    </Button>
                    <Button size="small" type="text"
                            @click.stop="shuffleGroup">乱序
                    </Button>
                    <Button size="small" type="text" danger
                            @click.stop="removeCreativeGroup(groupIndex)">删除
                    </Button>
                  </Space>
                </template>

                <Tabs
                  :activeKey="getActiveTab(groupIndex)"
                  @update:activeKey="(key) => setActiveTab(groupIndex, key as 'video' | 'image')"
                >
                  <TabPane
                    :key="'video'"
                    :tab="`视频(${(group.video?.length || 0)}/${groupVideoCount})`"
                  >
                    <div class="tabs-actions">
                      <Button type="primary" size="small"
                              @click="openMaterialSelector(groupIndex, 'video')">
                        + 添加素材
                      </Button>
                    </div>
                    <div class="material-grid">
                      <template v-for="card in getMaterialCards(groupIndex, 'video')"
                                :key="card.index">
                        <div v-if="card.type === 'material'" class="material-card">
                          <div class="material-preview">
                            <video :src="card.mat.url" class="preview-thumb"/>
                            <div class="play-overlay">▶</div>
                          </div>
                          <div class="material-info">
                          <span class="material-name" :title="card.mat.name">{{
                              card.mat.name
                            }}</span>
                          </div>
                          <div class="material-delete"
                               @click="removeMaterial(groupIndex, card.index, 'video')">
                            ×
                          </div>
                        </div>
                        <div v-else-if="card.type === 'empty'" class="material-card empty-card"
                             @click="openMaterialSelector(groupIndex, 'video')">
                          <div class="empty-icon">
                            <div class="icon-circle">
                              <span class="icon-text">选择视频</span>
                            </div>
                          </div>
                        </div>
                      </template>
                    </div>
                  </TabPane>
                  <TabPane
                    :key="'image'"
                    :tab="`图片(${(group.image?.length || 0)}/${groupImageCount})`"
                  >
                    <div class="tabs-actions">
                      <Button type="primary" size="small"
                              @click="openMaterialSelector(groupIndex, 'image')">
                        + 添加素材
                      </Button>
                    </div>
                    <div class="material-grid">
                      <template v-for="card in getMaterialCards(groupIndex, 'image')"
                                :key="card.index">
                        <div v-if="card.type === 'material'" class="material-card">
                          <div class="material-preview">
                            <img :src="card.mat.url" :alt="card.mat.name" class="preview-thumb"/>
                          </div>
                          <div class="material-info">
                          <span class="material-name" :title="card.mat.name">{{
                              card.mat.name
                            }}</span>
                          </div>
                          <div class="material-delete"
                               @click="removeMaterial(groupIndex, card.index, 'image')">
                            ×
                          </div>
                        </div>
                        <div v-else-if="card.type === 'empty'" class="material-card empty-card"
                             @click="openMaterialSelector(groupIndex, 'image')">
                          <div class="empty-icon">
                            <div class="icon-circle">
                              <span class="icon-text">选择图片</span>
                            </div>
                          </div>
                        </div>
                      </template>
                    </div>
                  </TabPane>
                </Tabs>
              </CollapsePanel>
            </Collapse>
          </div>
        </div>
      </Card>

    </Space>

    <!-- 素材选择器弹窗 -->
    <MaterialSelectorModal
      @update:material="updateMaterial"
    />
  </Drawer>
</template>

<style scoped lang="scss">
.creative-group-drawer {
  :deep(.ant-drawer-body) {
    padding: 16px;
  }
}

.form-item {
  display: flex;
  align-items: center;
  gap: 12px;

  .form-label {
    min-width: 100px;
    text-align: right;
  }

  .switch-label {
    font-size: 13px;
  }

  .tip-text {
    font-size: 12px;
  }
}

.collapse-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  .collapse-title {
    font-size: 14px;
    font-weight: 500;
  }
}

.creative-content {
  display: flex;
  gap: 12px;
  min-height: 0;

  .anchor-nav {
    flex-shrink: 0;
    width: 120px;

    :deep(.ant-anchor) {
      padding: 0;
    }

    :deep(.ant-anchor-link) {
      padding: 4px 0;
    }
  }

  .collapse-content {
    flex: 1;
    min-width: 0;
    max-height: calc(100vh - 300px);
    overflow-y: auto;
  }
}

.creative-collapse {
  :deep(.ant-collapse-header) {
    padding: 8px 16px;
  }

  :deep(.ant-collapse-content-box) {
    padding: 12px;
  }
}

.tabs-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.material-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 16px;

  .material-card {
    position: relative;
    border-radius: 6px;
    overflow: hidden;
    transition: all 0.2s;

    &:hover {
      .material-delete {
        display: block;
      }
    }

    .material-preview {
      position: relative;
      width: 100%;
      height: 180px;

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
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
      }
    }

    .material-info {
      padding: 8px;

      .material-name {
        font-size: 12px;
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
      border-radius: 50%;
      text-align: center;
      line-height: 20px;
      font-size: 14px;
      cursor: pointer;
      transition: background 0.2s;
    }

    &.empty-card {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 180px;
      cursor: pointer;

      .empty-icon {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;

        .icon-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid;
          display: flex;
          align-items: center;
          justify-content: center;

          .icon-text {
            font-size: 10px;
          }
        }
      }
    }
  }
}
</style>
