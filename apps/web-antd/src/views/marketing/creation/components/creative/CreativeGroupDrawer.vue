<script setup lang="ts" name="CreativeGroupDrawer">
// 创意组编辑抽屉 - 供所有媒体公用

import type {MaterialItem} from "#/api/models/assert";
import type {AccountInfo, LocalMaterialData, Material, MaterialData, RuleInfo} from '#/views/marketing/creation/creation';

import {computed, ref} from 'vue';

import {useVbenDrawer, useVbenModal} from '@vben/common-ui';

import {
  CopyOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Empty,
  InputNumber,
  List,
  ListItem,
  message,
  Radio,
  RadioButton,
  RadioGroup,
  Segmented,
  Space,
  Switch,
  TabPane,
  Tabs,
  Tag,
} from 'ant-design-vue';

import {getAverageGroupSlice} from '#/views/marketing/creation/creation';
import {RuleKey, RuleMethod} from '#/views/marketing/creation/creation_enums';

import MaterialSelector from '../material/MaterialSelector.vue';

/** 打开抽屉时传入的数据 */
interface CreativeGroupDrawerData {
  method?: RuleMethod;
  data?: Map<string, Material[]> | null | Record<string, Material[]>;
}

/**
 *
 */
const {accountInfo, ruleInfo} = defineProps({
  accountInfo: {
    type: Array<AccountInfo>,
    default: () => [],
  },
  ruleInfo: {
    type: Object as () => RuleInfo,
    default: null,
  },
});

const emit = defineEmits(['update:material']);

/**
 * 素材选择组件
 */
const [MaterialSelectorModal, materialSelectorApi] = useVbenModal({
  connectedComponent: MaterialSelector
})

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

// 切换账户
function onAccountChange(value: number | string) {
  activeAccountId.value = String(value);
  activeTabs.value.clear();
  selectedGroupIndex.value = 0;
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
const activeTabs = ref<Map<number, 'image' | 'video'>>(new Map());
// 当前选中的创意组索引
const selectedGroupIndex = ref(0);
// 分配方式选项
const modeOptions = [
  {
    desc: '所有账户共用一组创意组，账户内计划/广告循环',
    label: '统一分配',
    value: RuleMethod.ALL,
  },
  {
    desc: '每个账户独立创意组，账户内计划/广告循环',
    label: '分账户分配',
    value: RuleMethod.ACCOUNT,
  },
  {
    desc: '创意组平均分给账户，账户使用自己分到的组',
    label: '平均分配',
    value: RuleMethod.AVG,
  },
];

// 当前正在添加素材的创意组索引
const currentMaterialGroupIndex = ref<number>(-1);
// 当前正在添加的素材类型
const currentMaterialType = ref<'image' | 'video'>('video');

// 获取当前创意组的活跃tab
function getActiveTab(index: number): 'image' | 'video' {
  return activeTabs.value.get(index) || 'video';
}

// 设置当前创意组的活跃tab
function setActiveTab(index: number, key: 'image' | 'video') {
  activeTabs.value.set(index, key);
}

// 平均分配：全局创意组按账户连续切分的结果
const averageAllocation = computed(() => {
  if (distributionMethod.value !== RuleMethod.AVG) {
    return [];
  }
  const accounts = accountInfo || [];
  return accounts.map((account, index) => {
    const groups = getAverageGroupSlice(
      creativeGroups.value,
      index,
      Math.max(1, accounts.length),
    );
    return {
      account,
      count: groups.length,
      label: groups
        .map((group) => {
          const groupIndex = creativeGroups.value.indexOf(group);
          return `创意组 ${String(groupIndex + 1).padStart(2, '0')}`;
        })
        .join('、'),
    };
  });
});

const accountOptions = computed(() =>
  (accountInfo || []).map((account, index) => {
    let count = 0;
    if (distributionMethod.value === RuleMethod.ACCOUNT) {
      count = accountCreativeGroups.value.get(String(account.localAdvertiserId))?.length || 0;
    } else if (distributionMethod.value === RuleMethod.AVG) {
      count = averageAllocation.value[index]?.count || 0;
    }
    return {
      label: `${account.advertiserName} · ${count} 组`,
      value: String(account.localAdvertiserId),
    };
  }),
);

const currentGroups = computed(() => getCurrentGroups());
const selectedGroup = computed(
  () => currentGroups.value[selectedGroupIndex.value] || null,
);

// 创意组分配预览（按账户内计划/广告连续循环）
const allocationPreview = computed(() => {
  const groups = getCurrentGroups();
  if (groups.length === 0) {
    return [];
  }
  return Array.from({length: 6}, (_, index) => {
    const group = groups[index % groups.length]!;
    const groupIndex = groups.indexOf(group);
    return {
      label: `计划 ${String(Math.floor(index / 2) + 1).padStart(2, '0')} · 广告 ${String((index % 2) + 1).padStart(2, '0')}`,
      groupName: group.brandName || `创意组 ${String(groupIndex + 1).padStart(2, '0')}`,
    };
  });
});

function groupLabel(index: number) {
  return `创意组 ${String(index + 1).padStart(2, '0')}`;
}

const selectedGroupTitle = computed(() => {
  if (!selectedGroup.value) {
    return '创意素材';
  }
  return selectedGroup.value.brandName
    ? `${groupLabel(selectedGroupIndex.value)} · ${selectedGroup.value.brandName}`
    : groupLabel(selectedGroupIndex.value);
});

function groupThumbnails(group: Material) {
  const videos = (group.video || []).map((item) => ({ ...item, type: 'video' as const }));
  const images = (group.image || []).map((item) => ({ ...item, type: 'image' as const }));
  return [...videos, ...images].slice(0, 3);
}

// 获取当前操作的创意组列表
function getCurrentGroups(): Material[] {
  if (distributionMethod.value === RuleMethod.ACCOUNT) {
    return accountCreativeGroups.value.get(activeAccountId.value) || [];
  }
  if (distributionMethod.value === RuleMethod.AVG) {
    const index = (accountInfo || []).findIndex(
      (account) =>
        String(account.localAdvertiserId) === String(activeAccountId.value),
    );
    return getAverageGroupSlice(
      creativeGroups.value,
      index >= 0 ? index : 0,
      Math.max(1, (accountInfo || []).length),
    );
  }
  return creativeGroups.value;
}


/**
 * 切换分配方式：切换视图但保留已编辑的素材池
 */
function allocationMethodChange() {
  activeTabs.value.clear();
  selectedGroupIndex.value = 0;

  if (distributionMethod.value === RuleMethod.ACCOUNT) {
    initAccountGroups();
    if (accountInfo.length > 0) {
      activeAccountId.value = String(accountInfo[0]?.localAdvertiserId);
    }
  } else if (distributionMethod.value === RuleMethod.AVG) {
    activeAccountId.value = String((accountInfo || [])[0]?.localAdvertiserId || '');
    if (creativeGroups.value.length === 0) {
      creativeGroups.value.push({
        image: [],
        video: [],
        isExpanded: false,
        active: '',
        brandName: '',
      });
    }
  } else {
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
const [Drawer, drawerApi] = useVbenDrawer<CreativeGroupDrawerData>({
  closeOnClickModal: false,
  placement: 'right',
  class: 'creative-group-drawer w-[75vw]',
  closeOnPressEscape: true,
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData();
      if (data) {
        distributionMethod.value = data.method || RuleMethod.ALL;
        activeTabs.value.clear();
        selectedGroupIndex.value = 0;
        if (distributionMethod.value === RuleMethod.AVG) {
          activeAccountId.value = String(accountInfo[0]?.localAdvertiserId || '');
        }

        // 兼容 Map 序列化为普通对象的情况（useVbenDrawer 内部 JSON 序列化会导致 Map → PlainObject）
        const dataMap = data.data instanceof Map
          ? data.data
          : (data.data && typeof data.data === 'object'
            ? new Map<string, Material[]>(Object.entries(data.data))
            : new Map<string, Material[]>());

        // 根据分配方式初始化创意组数据
        if (data.method === RuleMethod.ACCOUNT) {
          // 按账户分配：从 data Map 中恢复各账户的创意组
          accountCreativeGroups.value.clear();
          dataMap.forEach((groups, accountId) => {
            accountCreativeGroups.value.set(accountId, groups || []);
          });
          if (accountInfo.length > 0) {
            activeAccountId.value = String(accountInfo[0]?.localAdvertiserId);
          }
          // 全账户复用/平均分配：从 data 的 '0' key 恢复
        } else {
          creativeGroups.value = dataMap.get('0') || [];
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
    const groupsToValidate =
      distributionMethod.value === RuleMethod.AVG
        ? creativeGroups.value
        : getCurrentGroups();
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
  activeTabs.value.clear();
  selectedGroupIndex.value = newIndex;
}

// 删除创意组
function removeCreativeGroup(index: number) {
  const groups = getCurrentGroups();
  if (groups.length <= 1) {
    return message.warning('至少保留一个创意组');
  }
  groups.splice(index, 1);
  selectedGroupIndex.value = Math.min(index, Math.max(0, groups.length - 1));
}

// 打开素材选择器
function openMaterialSelector(index: number, type: 'image' | 'video') {
  const groups = getCurrentGroups();
  const group = groups[index];
  if (!group) return;
  const maxCount = type === 'video' ? groupVideoCount.value : groupImageCount.value;
  const currentCount = type === 'video' ? (group.video?.length || 0) : (group.image?.length || 0);
  if (currentCount >= maxCount) {
    return message.warning(`${type === 'video' ? '视频' : '图片'}数量已达上限 ${maxCount} 个`);
  }
  currentMaterialGroupIndex.value =
    distributionMethod.value === RuleMethod.AVG
      ? creativeGroups.value.indexOf(group)
      : index;
  currentMaterialType.value = type;

  // 当前组已选素材，传给 MaterialSelector 用于回显勾选状态
  const preSelectedMaterials = (type === 'video' ? group.video : group.image) || [];

  // 设置文件类型 + 预选素材
  materialSelectorApi.setData({
    materialType: type,
    // 当前组的下标
    currentMaterialGroupIndex: index,
    maxCount,
    preSelectedMaterials,
  });
  materialSelectorApi.open();
}

// 删除素材
function removeMaterial(groupIndex: number, matIndex: number, type: 'image' | 'video') {
  const groups = getCurrentGroups();
  const group = groups[groupIndex];
  if (!group) return;
  if (type === 'video') {
    group.video?.splice(matIndex, 1);
  } else {
    group.image?.splice(matIndex, 1);
  }
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
  selectedGroupIndex.value = groups.length - 1;
}

function getMaterialCards(groupIndex: number, type: 'image' | 'video') {
  const groups = getCurrentGroups();
  const group = groups[groupIndex];
  if (!group) return [];
  const materials = type === 'video' ? (group.video || []) : (group.image || []);
  const maxCount = type === 'video' ? groupVideoCount.value : groupImageCount.value;
  const cards: Array<{ type: 'empty' | 'material'; index: number; mat?: any }> = [];

  materials.forEach((mat: any, index: number) => {
    cards.push({type: 'material', index, mat});
  });

  for (let i = materials.length; i < maxCount; i++) {
    cards.push({type: 'empty', index: i});
  }

  return cards;
}


/**
 * 根据创意生成规则，将选中的素材自动分配到创意组中
 */
function applyCreativeRule(
  materials: Array<LocalMaterialData>,
  type: 'image' | 'video',
  groups: Material[],
) {
  const count = materials.length;
  if (count === 0) return;

  const creativeKey = ruleInfo?.creativeRuleKey;

  // 规则1: 根据创意组生成 — 素材数量等于创意组数量，每个组1个素材
  if (creativeKey === RuleKey.CREATIVE_GROUP) {
    groups.length = 0;
    for (let i = 0; i < count; i++) {
      const group: Material = {
        video: [],
        image: [],
        isExpanded: false,
        active: '',
        brandName: '',
      };
      if (type === 'video') {
        group.video = [materials[i]!];
      } else {
        group.image = [materials[i]!];
      }
      groups.push(group);
    }
    return;
  }

  // 规则2: 指定数量 — 按 creativeCount 分组分配
  const creativeCount = ruleInfo?.creativeCount;
  if (creativeCount && creativeCount > 0 && creativeKey !== RuleKey.CREATIVE_GROUP) {
    const groupSize = creativeCount;
    const groupCount = Math.ceil(count / groupSize);
    groups.length = 0;
    for (let g = 0; g < groupCount; g++) {
      const slice = materials.slice(g * groupSize, (g + 1) * groupSize);
      const group: Material = {
        video: [],
        image: [],
        isExpanded: false,
        active: '',
        brandName: '',
      };
      if (type === 'video') {
        group.video = slice;
      } else {
        group.image = slice;
      }
      groups.push(group);
    }
    return;
  }

  // 规则3: 无规则 — 保持用户手动操作（不在 updateMaterial 中处理）
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
    localMaterialId: item.id!,
  }));

  // 根据分配模式更新素材
  if (distributionMethod.value === RuleMethod.ACCOUNT) {
    // 按账户分配：更新当前账户的创意组素材
    const accountGroups = accountCreativeGroups.value.get(activeAccountId.value);
    if (!accountGroups) return;

    // 先检查是否需要应用创意规则
    const creativeKey = ruleInfo?.creativeRuleKey;
    if (creativeKey === RuleKey.CREATIVE_GROUP || (ruleInfo?.creativeCount && ruleInfo.creativeCount > 0 && creativeKey !== RuleKey.CREATIVE_GROUP)) {
      applyCreativeRule(materials, currentMaterialType.value, accountGroups);
    } else if (accountGroups[creativeGroupIndex]) {
      const group = accountGroups[creativeGroupIndex];
      if (currentMaterialType.value === 'video' && group) {
        group.video = materials;
      } else if (group) {
        group.image = materials;
      }
    }
  } else {
    // 全账户复用/平均分配
    // 先检查是否需要应用创意规则
    const creativeKey = ruleInfo?.creativeRuleKey;
    if (creativeKey === RuleKey.CREATIVE_GROUP || (ruleInfo?.creativeCount && ruleInfo.creativeCount > 0 && creativeKey !== RuleKey.CREATIVE_GROUP)) {
      applyCreativeRule(materials, currentMaterialType.value, creativeGroups.value);
    } else if (creativeGroups.value[creativeGroupIndex]) {
      const group = creativeGroups.value[creativeGroupIndex];
      if (currentMaterialType.value === 'video' && group) {
        group.video = materials;
      } else if (group) {
        group.image = materials;
      }
    }
  }
}

</script>

<template>
  <Drawer title="创意组素材" class="creative-group-drawer w-[75vw]">
    <div class="material-config">
      <div class="mode-block">
        <div class="mode-head">
          <span>分配方式</span>
          <span class="muted">创意组是分配单位；计划/广告数量按当前范围创意组数联动</span>
        </div>
        <RadioGroup v-model:value="distributionMethod" class="mode-grid" @change="allocationMethodChange">
          <Radio
            v-for="option in modeOptions"
            :key="option.value"
            :value="option.value"
            class="mode-card"
          >
            <span class="mode-name">{{ option.label }}</span>
            <span class="mode-desc">{{ option.desc }}</span>
          </Radio>
        </RadioGroup>
      </div>

      <div v-if="distributionMethod !== RuleMethod.ALL" class="account-strip">
        <span class="muted">媒体账户</span>
        <Segmented
          :options="accountOptions"
          :value="activeAccountId"
          @change="onAccountChange"
        />
        <Tag v-if="distributionMethod === RuleMethod.AVG" color="blue">创意组按账户均分</Tag>
      </div>

      <div class="work-grid">
        <Card class="group-panel">
          <template #title>
            <span>{{ distributionMethod === RuleMethod.AVG ? '账户分到的创意组' : '创意组' }}</span>
          </template>
          <template #extra>
            <Tag>{{ currentGroups.length }} 组</Tag>
          </template>

          <List
            :data-source="currentGroups"
            :split="false"
            size="small"
            class="group-list"
          >
            <template #renderItem="{ item, index }">
              <ListItem class="group-list-item">
                <Card
                  :class="{ active: index === selectedGroupIndex }"
                  class="group-card"
                  hoverable
                  size="small"
                  @click="selectedGroupIndex = index"
                >
                  <div class="group-card-head">
                    <span class="group-index">{{ index + 1 }}</span>
                    <span class="group-name">{{ groupLabel(index) }}</span>
                    <Tag>{{ (item.video?.length || 0) + (item.image?.length || 0) }} 素材</Tag>
                  </div>
                  <div class="group-meta">
                    视频 {{ item.video?.length || 0 }} · 图片 {{ item.image?.length || 0 }}
                  </div>
                  <div v-if="groupThumbnails(item).length > 0" class="thumb-stack">
                    <template v-for="asset in groupThumbnails(item)" :key="`${asset.type}-${asset.localMaterialId}`">
                      <img
                        v-if="asset.type === 'image' && asset.url"
                        :src="asset.url"
                        :alt="asset.name"
                        class="thumb"
                      />
                      <div v-else class="thumb video">
                        {{ asset.type === 'image' ? '图' : '▶' }}
                      </div>
                    </template>
                  </div>
                </Card>
              </ListItem>
            </template>
          </List>

          <Empty v-if="currentGroups.length === 0" description="暂无创意组" />
          <Button
            v-if="distributionMethod !== RuleMethod.AVG"
            block
            class="add-group"
            type="dashed"
            @click="addCreativeGroup"
          >
            <PlusOutlined />
            添加创意组
          </Button>
        </Card>

        <Card class="editor-panel">
          <template #title>
            <span>{{ selectedGroupTitle }}</span>
          </template>
          <template #extra>
            <Space v-if="selectedGroup && distributionMethod !== RuleMethod.AVG" :size="4">
              <Button size="small" type="text" @click="copyGroup(selectedGroupIndex)">
                <CopyOutlined />
                复制
              </Button>
              <Button
                danger
                size="small"
                type="text"
                @click="removeCreativeGroup(selectedGroupIndex)"
              >
                <DeleteOutlined />
                删除
              </Button>
            </Space>
          </template>

          <template v-if="selectedGroup">
            <Tabs
              :active-key="getActiveTab(selectedGroupIndex)"
              @update:active-key="(key) => setActiveTab(selectedGroupIndex, key as 'image' | 'video')"
            >
              <TabPane
                key="video"
                :tab="`视频素材 (${selectedGroup.video?.length || 0})`"
              >
                <div class="material-actions">
                  <Button size="small" type="primary" @click="openMaterialSelector(selectedGroupIndex, 'video')">
                    <PlusOutlined />
                    添加视频素材
                  </Button>
                </div>
                <div class="material-grid">
                  <template
                    v-for="card in getMaterialCards(selectedGroupIndex, 'video')"
                    :key="card.index"
                  >
                    <div v-if="card.type === 'material'" class="material-card">
                      <div class="material-preview">
                        <video :src="card.mat.url" class="preview-thumb"></video>
                        <div class="play-overlay">▶</div>
                      </div>
                      <div class="material-name" :title="card.mat.name">{{ card.mat.name }}</div>
                      <div class="material-delete" @click="removeMaterial(selectedGroupIndex, card.index, 'video')">
                        ×
                      </div>
                    </div>
                    <div
                      v-else-if="card.type === 'empty'"
                      class="material-card empty-card"
                      @click="openMaterialSelector(selectedGroupIndex, 'video')"
                    >
                      <span>选择视频</span>
                    </div>
                  </template>
                </div>
              </TabPane>
              <TabPane
                key="image"
                :tab="`图片素材 (${selectedGroup.image?.length || 0})`"
              >
                <div class="material-actions">
                  <Button size="small" type="primary" @click="openMaterialSelector(selectedGroupIndex, 'image')">
                    <PlusOutlined />
                    添加图片素材
                  </Button>
                </div>
                <div class="material-grid">
                  <template
                    v-for="card in getMaterialCards(selectedGroupIndex, 'image')"
                    :key="card.index"
                  >
                    <div v-if="card.type === 'material'" class="material-card">
                      <div class="material-preview">
                        <img :src="card.mat.url" :alt="card.mat.name" class="preview-thumb" />
                      </div>
                      <div class="material-name" :title="card.mat.name">{{ card.mat.name }}</div>
                      <div class="material-delete" @click="removeMaterial(selectedGroupIndex, card.index, 'image')">
                        ×
                      </div>
                    </div>
                    <div
                      v-else-if="card.type === 'empty'"
                      class="material-card empty-card"
                      @click="openMaterialSelector(selectedGroupIndex, 'image')"
                    >
                      <span>选择图片</span>
                    </div>
                  </template>
                </div>
              </TabPane>
            </Tabs>

            <div class="settings">
              <div class="setting-row">
                <span>每个创意组素材上限</span>
                <Space :size="6">
                  <InputNumber v-model:value="groupVideoCount" :max="20" :min="1" size="small" />
                  <span class="muted">视频</span>
                  <InputNumber v-model:value="groupImageCount" :max="20" :min="0" size="small" />
                  <span class="muted">图片</span>
                </Space>
              </div>
              <div class="setting-row">
                <span>自动生成封面</span>
                <Switch v-model:checked="autoGenerateCover" />
              </div>
              <div class="setting-row">
                <span>视频同步主页</span>
                <RadioGroup v-model:value="videoSyncHomepage" size="small">
                  <RadioButton :value="false">关闭</RadioButton>
                  <RadioButton :value="true">开启</RadioButton>
                </RadioGroup>
              </div>
            </div>
          </template>
          <Empty v-else description="请选择或添加创意组" />
        </Card>

        <div class="side-col">
          <Card title="分配预览" size="small">
            <List
              v-if="allocationPreview.length > 0"
              :data-source="allocationPreview"
              :split="false"
              size="small"
              class="preview-list"
            >
              <template #renderItem="{ item }">
                <ListItem class="preview-row">
                  <span>{{ item.label }}</span>
                  <Tag color="blue">{{ item.groupName }}</Tag>
                </ListItem>
              </template>
            </List>
            <Empty v-else description="选择创意组后展示分配预览" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
            <div class="tip-text">
              一个广告使用一个创意组；计划/广告按顺序连续循环。
            </div>
          </Card>

          <Card v-if="distributionMethod === RuleMethod.AVG" title="平均分配结果" size="small">
            <List :data-source="averageAllocation" size="small" :split="false">
              <template #renderItem="{ item }">
                <ListItem class="avg-row">
                  <div class="avg-main">
                    <div>{{ item.account.advertiserName }}</div>
                    <div class="muted">{{ item.label || '未分配' }}</div>
                  </div>
                  <Tag>{{ item.count }} 组</Tag>
                </ListItem>
              </template>
            </List>
          </Card>

          <Card title="生成数量" size="small">
            <div class="rule-line"><span>当前范围创意组</span><b>{{ currentGroups.length }} 组</b></div>
            <div class="rule-line"><span>计划规则=创意组</span><b>P = {{ currentGroups.length }} / 账户</b></div>
            <div class="rule-line"><span>广告规则=创意组</span><b>D = {{ currentGroups.length }} / 计划</b></div>
          </Card>
        </div>
      </div>
    </div>
    <MaterialSelectorModal @update:material="updateMaterial" />
  </Drawer>
</template>

<style scoped lang="scss">
.material-config {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.muted {
  color: hsl(var(--muted-foreground));
  font-size: 12px;
}

.mode-block {
  flex: none;
  padding-bottom: 12px;
  border-bottom: 1px solid hsl(var(--border));
}

.mode-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  color: hsl(var(--foreground));
  font-weight: 600;
}

.mode-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.mode-grid :deep(.ant-radio-wrapper) {
  align-items: flex-start;
  margin: 0;
  padding: 10px 12px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  transition: all 0.16s ease;
}

.mode-grid :deep(.ant-radio-wrapper:hover) {
  border-color: hsl(var(--primary) / 45%);
}

.mode-grid :deep(.ant-radio-wrapper-checked) {
  background: hsl(var(--primary) / 12%);
  border-color: hsl(var(--primary));
}

.mode-grid :deep(.ant-radio) {
  margin-top: 2px;
}

.mode-name {
  display: block;
  margin-bottom: 2px;
  font-weight: 600;
}

.mode-desc {
  display: block;
  color: hsl(var(--muted-foreground));
  font-size: 12px;
  line-height: 1.45;
}

.account-strip {
  display: flex;
  flex: none;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid hsl(var(--border));
}

.work-grid {
  display: grid;
  flex: 1;
  grid-template-columns: 240px minmax(0, 1fr) 280px;
  gap: 12px;
  min-height: 0;
  padding-top: 12px;
}

.group-panel,
.editor-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.group-panel :deep(.ant-card-body) {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  padding: 8px;
}

.group-panel :deep(.ant-card-head),
.editor-panel :deep(.ant-card-head) {
  min-height: 44px;
  padding: 0 12px;
  font-size: 13px;
}

.editor-panel :deep(.ant-card-body) {
  flex: 1;
  min-height: 0;
  padding: 8px 12px 12px;
  overflow-y: auto;
}

.group-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.group-list :deep(.ant-list-items) {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.group-list :deep(.ant-list-item) {
  padding: 0;
  border: 0;
}

.group-list-item {
  display: block;
}

.group-card {
  width: 100%;
  cursor: pointer;
  background: hsl(var(--card));
  border-color: hsl(var(--border));
}

.group-card.active {
  background: hsl(var(--primary) / 12%);
  border-color: hsl(var(--primary));
}

.group-card :deep(.ant-card-body) {
  padding: 9px;
}

.group-card-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.group-card-head .group-name {
  flex: 1;
  min-width: 0;
}

.group-card-head :deep(.ant-tag) {
  margin: 0;
}

.group-index {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 21px;
  height: 21px;
  color: hsl(var(--muted-foreground));
  font-size: 10px;
  font-weight: 600;
  background: hsl(var(--muted));
  border: 1px solid hsl(var(--border));
  border-radius: 5px;
}

.group-card.active .group-index {
  color: hsl(var(--primary));
  background: hsl(var(--card));
  border-color: hsl(var(--primary) / 30%);
}

.group-name {
  overflow: hidden;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.group-meta {
  margin-top: 3px;
  color: hsl(var(--muted-foreground));
  font-size: 11px;
}

.thumb-stack {
  display: flex;
  gap: 4px;
  margin-top: 6px;
}

.thumb {
  width: 26px;
  height: 26px;
  object-fit: cover;
  background: hsl(var(--muted));
  border: 1px solid hsl(var(--border));
  border-radius: 5px;
}

.thumb.video {
  display: flex;
  align-items: center;
  justify-content: center;
  color: hsl(var(--muted-foreground));
  font-size: 10px;
}

.add-group {
  flex: none;
  margin-top: 8px;
}

.group-panel :deep(.ant-empty) {
  margin: 12px 0;
}

.material-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

.material-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(94px, 1fr));
  gap: 8px;
}

.material-card {
  position: relative;
  overflow: hidden;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 7px;
}

.material-preview {
  position: relative;
  height: 74px;
  overflow: hidden;
  background: hsl(var(--muted));
}

.preview-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  background: rgb(15 23 42 / 32%);
}

.material-name {
  padding: 4px 6px;
  overflow: hidden;
  color: hsl(var(--foreground));
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.material-delete {
  position: absolute;
  top: 3px;
  right: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  background: rgb(15 23 42 / 55%);
  border-radius: 50%;
}

.empty-card {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 110px;
  color: hsl(var(--muted-foreground));
  font-size: 11px;
  cursor: pointer;
  background: hsl(var(--muted));
  border-style: dashed;
}

.empty-card:hover {
  border-color: hsl(var(--primary) / 45%);
}

.settings {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid hsl(var(--border));
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 6px 0;
  font-size: 12px;
}

.setting-row > span:first-child {
  font-weight: 500;
}

.side-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
  overflow-y: auto;
}

.side-col :deep(.ant-card-head) {
  min-height: 40px;
  padding: 0 10px;
  font-size: 12px;
}

.side-col :deep(.ant-card-body) {
  padding: 8px 10px;
}

.preview-list {
  max-height: 210px;
  overflow-y: auto;
}

.preview-list :deep(.ant-list-item) {
  padding: 0;
  border: 0;
}

.preview-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 5px 6px;
  margin-bottom: 4px;
  font-size: 11px;
  background: hsl(var(--muted));
  border-radius: 5px;
}

.preview-row :deep(.ant-tag) {
  max-width: 140px;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.avg-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px dashed hsl(var(--border));
}

.avg-row:last-child {
  border-bottom: 0;
}

.avg-main {
  min-width: 0;
  font-size: 12px;
}

.avg-main .muted {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rule-line {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 5px 0;
  color: hsl(var(--muted-foreground));
  font-size: 11px;
  border-bottom: 1px dashed hsl(var(--border));
}

.rule-line:last-child {
  border-bottom: 0;
}

.rule-line b {
  color: hsl(var(--foreground));
  font-weight: 600;
}

.tip-text {
  display: block;
  margin-top: 8px;
  color: hsl(var(--muted-foreground));
  font-size: 11px;
  line-height: 1.55;
}

@media (max-width: 1280px) {
  .work-grid {
    grid-template-columns: 220px minmax(0, 1fr) 260px;
  }
}

@media (max-width: 1050px) {
  .work-grid {
    grid-template-columns: 1fr;
  }

  .side-col {
    flex-direction: row;
    overflow-x: auto;
  }

  .side-col > * {
    flex: 1;
    min-width: 240px;
  }
}
</style>
