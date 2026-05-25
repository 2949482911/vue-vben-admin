<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Select, Tooltip, Input, Button } from 'ant-design-vue';
import type { SelectValue } from 'ant-design-vue/es/select';
import { advertiserApi, projectApi } from '#/api';
import type { AdvertiserItem } from '#/api/models';
import { useVbenModal, type VbenFormProps } from '@vben/common-ui';
import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { trimObject } from '#/utils/trim';
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

const { ruleInfo } = defineProps({
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
      };
    },
  },
});
// 顶部展示文本：依然绑定正式变量
const displayDisplayText = computed(() => {
  let projectText = projectRules.find((r) => r.key === ruleInfo.projectRuleKey)?.title || '';
  if (ruleInfo.projectRuleKey === 'custom') projectText = `指定数量 ${ruleInfo.projectCount}`;

  let adGroupText = projectRules.find((r) => r.key === ruleInfo.adGroupRuleKey)?.title || '';
  if (ruleInfo.adGroupRuleKey === 'custom') adGroupText = `指定数量 ${ruleInfo.adGroupCount}`;

  let adText = adRules.find((r) => r.key === ruleInfo.adRuleKey)?.title || '';
  if (ruleInfo.adRuleKey === 'custom') adText = `指定数量 ${ruleInfo.adCount}`;

  return { projectText, adText, adGroupText };
});
  // 1. 定义规则选项数据
const projectRules = [
  { title: '根据定向包生成', desc: '项目数量与定向包数量相等', key: 'targeting' },
  {
    title: '根据创意组生成',
    desc: '项目数量与创意组数量相等，项目中的广告都使用相同的素材',
    key: 'creative',
  },
  {
    title: '根据标题包生成',
    desc: '项目数量与标题包数量相等，项目中的广告都使用相同的标题包',
    key: 'title',
  },
  { title: '指定数量', desc: '手动指定每个账户的项目数量', key: 'custom' },
];

const adGroupRules = [
  { title: '根据定向包生成', desc: '广告组数量与定向包数量相等', key: 'targeting' },
  {
    title: '根据创意组生成',
    desc: '广告组数量与创意组数量相等',
    key: 'creative',
  },
  {
    title: '根据标题包生成',
    desc: '广告组数量与标题包数量相等',
    key: 'title',
  },
  { title: '指定数量', desc: '手动指定每个账户的广告组数量', key: 'custom' },
];

const adRules = [
  {
    title: '按创意组数',
    desc: '按创意组数生成广告，自动匹配标题包，标题包不足时循环使用',
    key: 'creative',
  },
  {
    title: '按标题包数',
    desc: '按标题包数生成广告，自动匹配创意数，创意数不足时循环使用',
    key: 'title',
  },
  // {title: '按创意组*标题包', desc: '基于创意组*标题包自动生成广告', key: 'mix'},
  { title: '指定数量', desc: '先指定广告数量，自动循环使用素材和标题，多退少补', key: 'custom' },
];
const selectedProjectRule = ref('targeting');
const selectedAdGroupRule = ref('targeting');
const selectedAdRule = ref('creative');
const projectCount = ref(1);
const adGroupCount = ref(1);
const adCount = ref(1);
onMounted(async() => {
  const res = await projectApi.fetchProjectList({ page: 1, pageSize: 1000 });
  productList.value = res.items;
});
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
          platform: 'vivo',
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
    ruleInfo.projectCount = projectCount.value;
    ruleInfo.adCount = adCount.value;
    ruleInfo.adGroupCount = adGroupCount.value;
    emit('update:ruleInfo', ruleInfo);
    await ruleModalApi.close();
  },
})
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
    });
  }
}
function mediaAccountClick() {
  modalApi.open();
}
function ruleConfigurationEvent() {
  ruleModalApi.open();
}
function reuseStrategyGroup() {

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
          <span class="label">项目：</span>
          <span class="value">{{ displayDisplayText.projectText }}</span>
          <span class="label ml-4">广告组：</span>
          <span class="value">{{ displayDisplayText.adGroupText }}</span>
          <span class="label ml-4">广告：</span>
          <span class="value">{{ displayDisplayText.adText }}</span>
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
        <div class="rule-section">
          <div class="label">项目生成规则</div>
          <div class="options-grid">
            <div
              v-for="item in projectRules"
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
          <div class="label">每个账户指定项目数</div>
          <Input v-model:value="projectCount" style="width: 200px" placeholder="请输入数量" />
        </div>

        <div class="rule-section">
          <div class="label">广告组生成规则</div>
          <div class="options-grid">
            <div
              v-for="item in adGroupRules"
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
          <div class="label">每个项目指定广告组数</div>
          <Input v-model:value="adGroupCount" style="width: 200px" placeholder="请输入数量" />
        </div>

        <div class="rule-section">
          <div class="label">广告生成规则</div>
          <div class="options-grid">
            <div
              v-for="item in adRules"
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

        <div v-if="selectedAdRule === 'custom'" class="input-row">
          <div class="label">每个项目指定广告数</div>
          <Input v-model:value="adCount" style="width: 200px" placeholder="请输入数量" />
        </div>
      </div>
    </RuleModal>
  </div>
</template>
<style lang="scss" scoped>
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
