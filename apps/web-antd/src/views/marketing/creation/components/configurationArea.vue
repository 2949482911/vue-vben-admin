<script setup lang="ts" name = "configurationArea">
import { ref, onMounted, computed, watch } from 'vue';
import { Select, Tooltip, Input, Button } from 'ant-design-vue';
import type { SelectValue } from 'ant-design-vue/es/select';
import { advertiserApi, projectApi } from '#/api';
import type { AdvertiserItem } from '#/api/models';
import { useVbenModal, type VbenFormProps } from '@vben/common-ui';
import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { trimObject } from '#/utils/trim';
// 策略组
import StrategyGroup from "#/views/marketing/creation/components/strategyGroup.vue";
import type { AccountInfo, Project, RuleConfiguration, RuleOptions } from "#/views/marketing/creation/creation";
const projectId = ref<SelectValue>('');
const productList = ref();
// 媒体账户显示文字 (String 格式方便绑定 Input)
const mediaAccountLabel = ref<string>('');
// 选中的ID数组方便回显
const selectedAccountIds = ref<string[]>([]);
// 定义一个变量存储完整的行对象
const selectedRowsData = ref<any[]>([]);
// 内部维护一个临时变量，记录弹窗中所有的勾选对象
const tempSelectedRows = ref<AdvertiserItem[]>([]);
const emit = defineEmits(['update:accountInfo', 'update:productInfo','update:ruleInfo', 'update:reuse']);


const { ruleInfo, configurationConfig, accountInfo, project, ruleConfiguration, ruleOptions } = defineProps({
  ruleInfo: {
    type: Object,
    default: () => {
      return {
        projectRuleKey: '',
        projectCount: 1,
        adGroupRuleKey: '',
        adGroupCount: 1,
        adRuleKey: '',
        adCount: 1,
        creativeRuleKey: '',
        creativeCount: 1,
      };
    },
  },

  // 配置区配置对象
  configurationConfig: {
    type: Object,
    default: () => {
      return {
        platform: '',
      }
    }
  },

  // 规则配置对象（从父组件传入）
  ruleConfiguration: {
    type: Object as () => RuleConfiguration,
    default: () => {
      return {
        project: {
          show: true,
          name: '项目',
          rules: '项目生成规则',
          countLabel: '每个账户指定项目数'
        },
        adGroup: {
          show: true,
          name: '广告组',
          rules: '广告组生成规则',
          countLabel: '每个项目指定广告组数'
        },
        ad: {
          show: true,
          name: '广告',
          rules: '广告生成规则',
          countLabel: '每个广告组指定广告数'
        },
        creative: {
          show: true,
          name: '创意',
          rules: '创意生成规则',
          countLabel: '每个广告指定创意数'
        }
      };
    }
  },

  // 规则选项集合（从父组件传入）
  ruleOptions: {
    type: Object as () => RuleOptions,
    default: () => {
      return {
        projectRules: [
          { title: '根据定向包生成', desc: '项目数量与定向包数量相等', key: 'targeting' },
          { title: '根据创意组生成', desc: '项目数量与创意组数量相等，项目中的广告都使用相同的素材', key: 'creative' },
          { title: '根据标题包生成', desc: '项目数量与标题包数量相等，项目中的广告都使用相同的标题包', key: 'title' },
          { title: '指定数量', desc: '手动指定每个账户的项目数量', key: 'custom' },
        ],
        adGroupRules: [
          { title: '根据定向包生成', desc: '广告组数量与定向包数量相等', key: 'targeting' },
          { title: '根据创意组生成', desc: '广告组数量与创意组数量相等', key: 'creative' },
          { title: '根据标题包生成', desc: '广告组数量与标题包数量相等', key: 'title' },
          { title: '指定数量', desc: '手动指定每个账户的广告组数量', key: 'custom' },
        ],
        adRules: [
          { title: '按创意组数', desc: '按创意组数生成广告，自动匹配标题包，标题包不足时循环使用', key: 'creative' },
          { title: '按标题包数', desc: '按标题包数生成广告，自动匹配创意数，创意数不足时循环使用', key: 'title' },
          { title: '指定数量', desc: '先指定广告数量，自动循环使用素材和标题，多退少补', key: 'custom' },
        ],
        creativeRules: [
          { title: '无', desc: '无规则', key: 'none' },
          { title: '根据创意组生成', desc: '创意数量与创意组数量相等', key: 'creative_group' },
          { title: '指定数量', desc: '手动指定每个账户的创意数量', key: 'custom' },
        ],
      };
    }
  },

  // 账户信息（复用策略组时传入）
  accountInfo: {
    type: Array<AccountInfo>,
    default: () => []
  },

  // 项目信息（复用策略组时传入）
  project: {
    type: Object as () => Project | null,
    default: null
  }

});

// 顶部展示文本：根据传入的规则配置动态生成
const displayDisplayText = computed(() => {
  const config = ruleConfiguration;
  const options = ruleOptions;

  let projectText = options.projectRules.find((r) => r.key === ruleInfo.projectRuleKey)?.title || '';
  if (ruleInfo.projectRuleKey === 'custom') projectText = `指定数量 ${ruleInfo.projectCount}`;

  let adGroupText = options.adGroupRules.find((r) => r.key === ruleInfo.adGroupRuleKey)?.title || '';
  if (ruleInfo.adGroupRuleKey === 'custom') adGroupText = `指定数量 ${ruleInfo.adGroupCount}`;

  let adText = config.ad.show ? (options.adRules.find((r) => r.key === ruleInfo.adRuleKey)?.title || '') : '';
  if (config.ad.show && ruleInfo.adRuleKey === 'custom') adText = `指定数量 ${ruleInfo.adCount}`;

  let creativeText = options.creativeRules.find((r) => r.key === ruleInfo.creativeRuleKey)?.title || '';
  if (ruleInfo.creativeRuleKey === 'custom') creativeText = `指定数量 ${ruleInfo.creativeCount}`;

  return { projectText, adText, adGroupText, creativeText };
});

const selectedProjectRule = ref('targeting');
const selectedAdGroupRule = ref('targeting');
const selectedAdRule = ref('creative');
const selectedCreativeRule = ref('creative_group');
const projectCount = ref(1);
const adGroupCount = ref(1);
const adCount = ref(1);
const creativeCount = ref(1);
onMounted(async() => {
  const res = await projectApi.fetchProjectList({ page: 1, pageSize: 1000 });
  productList.value = res.items;
});

// 监听父组件传入的 accountInfo 数据变化，实现回显（复用策略组时）
watch(
  () => accountInfo,
  (newAccountInfo) => {
    if (newAccountInfo && newAccountInfo.length > 0) {
      // 更新显示文字
      mediaAccountLabel.value = newAccountInfo.map((r: AccountInfo) => r.advertiserName).join('，');
      // 更新选中的 ID 数组
      selectedAccountIds.value = newAccountInfo.map((r: AccountInfo) => String(r.localAdvertiserId));
      // 更新选中的行数据
      selectedRowsData.value = newAccountInfo.map((r: AccountInfo) => ({
        id: r.localAdvertiserId,
        advertiserName: r.advertiserName,
      }));
      // 同步到临时变量
      tempSelectedRows.value = [...selectedRowsData.value];
    }
  },
  { immediate: true, deep: true }
);

// 监听父组件传入的 project 数据变化，实现回显（复用策略组时）
watch(
  () => project,
  (newProject) => {
    if (newProject && newProject.projectId) {
      projectId.value = newProject.projectId;
    }
  },
  { immediate: true, deep: true }
);

// 监听父组件传入的 ruleInfo 数据变化，实现回显（复用策略组时）
watch(
  () => ruleInfo,
  (newRuleInfo) => {
    if (newRuleInfo) {
      selectedProjectRule.value = newRuleInfo.projectRuleKey || 'targeting';
      selectedAdGroupRule.value = newRuleInfo.adGroupRuleKey || 'targeting';
      selectedAdRule.value = newRuleInfo.adRuleKey || 'creative';
      selectedCreativeRule.value = newRuleInfo.creativeRuleKey || 'creative_group';
      projectCount.value = newRuleInfo.projectCount || 1;
      adGroupCount.value = newRuleInfo.adGroupCount || 1;
      adCount.value = newRuleInfo.adCount || 1;
      creativeCount.value = newRuleInfo.creativeCount || 1;
    }
  },
  { immediate: true, deep: true }
);
const gridOptions: VxeGridProps<AdvertiserItem> = {
  border: true,
  checkboxConfig: {
    highlight: true,
    // labelField: 'id',
    reserve: true,
    checkRowKeys: selectedAccountIds.value,
    trigger: 'row',
  },
  rowConfig: {
    keyField: 'id',
  },
  height: 'auto',
  columns: [
    { type: 'checkbox', width: 50 },
    { title: '序号', type: 'seq', width: 50 },
    { field: 'id', title: '账户ID' },
    { field: 'advertiserName', title: '账户名称' },
    { field: 'companyName', title: '主体名称' },
  ],
  exportConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, args) => {
        const params = trimObject(args);
        const res = await advertiserApi.fetchAdvertiserList({
          page: page.currentPage,
          pageSize: page.pageSize,
          platform: configurationConfig.platform,
          putStatue: 1,
          ...params,
        });
        setTimeout(() => {
          const grid = gridApi.grid;
          if (grid) {
            // 【重要】这里应该用 tempSelectedRows 的 ID，因为它是弹窗内操作的最实时状态
            const idsToCheck = tempSelectedRows.value.map((item) => item.id);
            if (idsToCheck.length > 0) {
              grid.setCheckboxRowKey(idsToCheck, true);
            }
          }
        }, 50);
        return res;
      },
    },
  },
};
//媒体账户选择弹框
const [Modal, modalApi] = useVbenModal({
  closeOnPressEscape: true,
  contentClass: 'modalStyle',
  onConfirm: async () => {
    // 【关键】只有点击确定时，才把临时变量同步到页面显示的变量中
    const finalRows = tempSelectedRows.value;
    selectedRowsData.value = [...finalRows]; // 补充这一行

    // 更新外层显示文字
    mediaAccountLabel.value = finalRows.map((r) => r.advertiserName).join('，');
    // 更新外层选中的 ID 数组
    selectedAccountIds.value = finalRows.map((r) => r.id);

    // 构造发送给后端或父组件的数据
    const uniqueAccountInfo = finalRows.map((row: AdvertiserItem) => ({
      localAdvertiserId: row.id,
      advertiserName: row.advertiserName,
    }));

    emit('update:accountInfo', uniqueAccountInfo);
    await modalApi.close();
  }
});
// 规则配置弹窗
const [RuleModal, ruleModalApi] = useVbenModal({
  contentClass: 'rule-modal-content',
  async onConfirm() {
    ruleInfo.projectRuleKey = selectedProjectRule.value;
    ruleInfo.adGroupRuleKey = selectedAdGroupRule.value;
    ruleInfo.adRuleKey = selectedAdRule.value;
    ruleInfo.creativeRuleKey = selectedCreativeRule.value;
    ruleInfo.projectCount = projectCount.value;
    ruleInfo.adCount = adCount.value;
    ruleInfo.adGroupCount = adGroupCount.value;
    ruleInfo.creativeCount = creativeCount.value;
    emit('update:ruleInfo', ruleInfo);
    await ruleModalApi.close();
  },
})


// 策略组配置弹窗
const [StrategyGroupModal, strategyGroupModalApi] = useVbenModal({
  connectedComponent: StrategyGroup,
})


// 弹出策略组的对象
function updateStrategyReuse(configObj: any) {
  emit('update:reuse', configObj);
  strategyGroupModalApi.close();
}



const formOptions: VbenFormProps = {
  schema: [
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入账户ID',
      },
      fieldName: 'id',
      label: '账户ID',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入账户名称',
      },
      fieldName: 'advertiserName',
      label: '账户名称',
    },
  ],
  submitOnEnter: false,
};

const gridEvents = {
  checkboxChange: () => updateTempRecords(),
  checkboxAll: () => updateTempRecords(),
};
// 抽取公共方法：获取当前 Grid 所有的勾选数据（含跨页和搜索结果）
function updateTempRecords() {
  const grid = gridApi.grid;
  if (!grid) return;

  const reserveRows = grid.getCheckboxReserveRecords();
  const currentRows = grid.getCheckboxRecords();

  // 合并
  const allSelected = [...reserveRows, ...currentRows];

  // 去重
  const uniqueMap = new Map();
  allSelected.forEach((item) => {
    if (item && item.id) {
      uniqueMap.set(item.id, item);
    }
  });

  tempSelectedRows.value = Array.from(uniqueMap.values());
}

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions, gridEvents });
function handleProjectChange(val: SelectValue) {
  const selectedProject = productList.value?.find((item: any) => String(item.id) === String(val));
  if (selectedProject) {
    emit('update:productInfo', {
      projectId: selectedProject.id,
      projectName: selectedProject.name,
      icon: selectedProject.icon,
      packageName: selectedProject.packageName,
      appId: selectedProject.appId,
    });
  }
}
function mediaAccountClick() {
  modalApi.open();
}
function ruleConfigurationEvent() {
  ruleModalApi.open();
}

// open 策略组
function reuseStrategyGroup() {
  strategyGroupModalApi.open();
}
</script>
<template>
  <div class="header-configuration">
    <h2 class="header-configuration-title">配置区</h2>
    <div class="header-configuration-content">
      <div class="header-configuration-content-left">
        <div class="project">
          项目
          <Select
            v-model:value="projectId"
            style="width: 120px"
            @change="handleProjectChange">
            <Select.Option
              v-for="item in productList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >{{ item.name }}
            </Select.Option>
          </Select>
        </div>
        <div class="media-account">
          媒体账户
          <Tooltip placement="top">
            <template #title v-if="mediaAccountLabel">
              {{ mediaAccountLabel }}
            </template>
            <Input
              class="inp"
              :value="mediaAccountLabel"
              readonly
              placeholder="请选择"
              style="width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap"
              @click="mediaAccountClick()"
            />
          </Tooltip>
        </div>
      </div>
      <div class="header-configuration-content-right">
        <div class="info-tag">
          <span class="label">{{ ruleConfiguration.project.name }}：</span>
          <span class="value">{{ displayDisplayText.projectText }}</span>
          <span class="label ml-4">{{ ruleConfiguration.adGroup.name }}：</span>
          <span class="value">{{ displayDisplayText.adGroupText }}</span>
          <span v-if="ruleConfiguration.ad.show" class="label ml-4">{{ ruleConfiguration.ad.name }}：</span>
          <span v-if="ruleConfiguration.ad.show" class="value">{{ displayDisplayText.adText }}</span>
          <span class="label ml-4">{{ ruleConfiguration.creative.name }}：</span>
          <span class="value">{{ displayDisplayText.creativeText }}</span>
        </div>
        <Button type="primary" @click="ruleConfigurationEvent">规则配置</Button>
        <Button type="primary" class="ml-5" @click="reuseStrategyGroup">复用策略组</Button>
      </div>
    </div>
    <Modal class="w-[80%] h-[80vh]" title="选择媒体账户">
      <Grid />
    </Modal>
    <!-- 规则匹配弹窗 -->
    <RuleModal class="w-[900px]" title="规则配置">
      <div class="rule-container">
        <!-- 项目生成规则 -->
        <div class="rule-section">
          <div class="label">{{ ruleConfiguration.project.rules }}</div>
          <div class="options-grid">
            <div
              v-for="item in ruleOptions.projectRules"
              :key="item.key"
              class="option-card"
              :class="{ active: selectedProjectRule === item.key }"
              @click="selectedProjectRule = item.key"
            >
              <div class="option-title">{{ item.title }}</div>
              <div class="option-desc">{{ item.desc }}</div>
            </div>
          </div>
        </div>

        <div v-if="selectedProjectRule === 'custom'" class="input-row">
          <div class="label">{{ ruleConfiguration.project.countLabel }}</div>
          <Input v-model:value="projectCount" style="width: 200px" placeholder="请输入数量" />
        </div>

        <!-- 广告组生成规则 -->
        <div class="rule-section">
          <div class="label">{{ ruleConfiguration.adGroup.rules }}</div>
          <div class="options-grid">
            <div
              v-for="item in ruleOptions.adGroupRules"
              :key="item.key"
              class="option-card"
              :class="{ active: selectedAdGroupRule === item.key }"
              @click="selectedAdGroupRule = item.key"
            >
              <div class="option-title">{{ item.title }}</div>
              <div class="option-desc">{{ item.desc }}</div>
            </div>
          </div>
        </div>

        <div v-if="selectedAdGroupRule === 'custom'" class="input-row">
          <div class="label">{{ ruleConfiguration.adGroup.countLabel }}</div>
          <Input v-model:value="adGroupCount" style="width: 200px" placeholder="请输入数量" />
        </div>

        <!-- 广告生成规则（根据配置决定是否显示） -->
        <div v-if="ruleConfiguration.ad.show" class="rule-section">
          <div class="label">{{ ruleConfiguration.ad.rules }}</div>
          <div class="options-grid">
            <div
              v-for="item in ruleOptions.adRules"
              :key="item.key"
              class="option-card"
              :class="{ active: selectedAdRule === item.key }"
              @click="selectedAdRule = item.key"
            >
              <div class="option-title">{{ item.title }}</div>
              <div class="option-desc">{{ item.desc }}</div>
            </div>
          </div>
        </div>

        <div v-if="ruleConfiguration.ad.show && selectedAdRule === 'custom'" class="input-row">
          <div class="label">{{ ruleConfiguration.ad.countLabel }}</div>
          <Input v-model:value="adCount" style="width: 200px" placeholder="请输入数量" />
        </div>

        <!-- 创意生成规则 -->
        <div class="rule-section">
          <div class="label">{{ ruleConfiguration.creative.rules }}</div>
          <div class="options-grid">
            <div
              v-for="item in ruleOptions.creativeRules"
              :key="item.key"
              class="option-card"
              :class="{ active: selectedCreativeRule === item.key }"
              @click="selectedCreativeRule = item.key"
            >
              <div class="option-title">{{ item.title }}</div>
              <div class="option-desc">{{ item.desc }}</div>
            </div>
          </div>
        </div>

        <div v-if="selectedCreativeRule === 'custom'" class="input-row">
          <div class="label">{{ ruleConfiguration.creative.countLabel }}</div>
          <Input v-model:value="creativeCount" style="width: 200px" placeholder="请输入数量" />
        </div>
      </div>
    </RuleModal>

    <StrategyGroupModal @update:reuse="updateStrategyReuse" :platform="configurationConfig.platform"/>
  </div>
</template>
<style lang="scss">
.header-configuration {
  &-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 10px;
  }
  &-content {
    display: flex;
    justify-content: space-between;
    &-left {
      display: flex;
      .media-account {
        margin-left: 10px;
      }
    }
    &-right {
      display: flex;
      align-items: center;
      .info-tag {
        display: flex;
        align-items: center;
        padding: 4px 12px;
        font-size: 13px;
        border: 1px solid #006be6;
        border-radius: 4px;
        margin-right: 10px;

        .label {
          // color: #666;
        }

        .value {
          font-weight: 500;
          color: #006be6;
        }

        .ml-4 {
          margin-left: 16px;
        }
      }
    }
  }
}
.rule-container {
  padding: 10px;

  .rule-section {
    display: flex;
    margin-bottom: 20px;

    .label {
      flex-shrink: 0;
      width: 100px;
      padding-top: 10px;
      font-size: 14px;
      // color: #666;
    }

    .options-grid {
      display: flex;
      flex: 1;
      gap: 12px;
    }
  }

  .option-card {
    flex: 1;
    padding: 12px;
    cursor: pointer;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    transition: all 0.3s;

    &:hover {
      border-color: #006be6;
    }

    &.active {
      // background-color: #f6ffed;
      border-color: #006be6;

      .option-title {
        color: #006be6;
      }
    }

    .option-title {
      margin-bottom: 4px;
      font-size: 15px;
      font-weight: 600;
      // color: #333;
    }

    .option-desc {
      font-size: 12px;
      line-height: 1.4;
      color: #999;
    }
  }

  .input-row {
    display: flex;
    align-items: center;
    margin: -10px 0 20px 100px; // 对齐上方的 options-grid

    .label {
      margin-right: 12px;
      font-size: 13px;
    }
  }
}
</style>
