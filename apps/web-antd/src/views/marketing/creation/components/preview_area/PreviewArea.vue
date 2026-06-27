<script setup lang="ts" name="PreviewArea">
import { computed, onMounted, ref, watch } from "vue";
import { Card, Divider, TabPane, Tabs } from "ant-design-vue";
import { useVbenVxeGrid, type VxeGridProps } from "#/adapter/vxe-table";
import type {
  AccountTabData,
  PreviewColumn,
  LevelNames
} from "#/views/marketing/creation/components/preview_area/previewAreaData";

/**
 * 列配置接口
 * 支持多级嵌套表头
 */

const props = defineProps<{
  /** 按账户分组的表格数据 */
  tableData: AccountTabData[];
  /** 多级嵌套列配置 */
  tableColumns: PreviewColumn[];
  /** 是否显示空状态提示 */
  showEmpty?: boolean;
  /** 计划层级的合并字段列表（用于单元格合并） */
  campaignMergeFields?: string[];
  /** 广告组层级的合并字段列表（用于单元格合并） */
  adgroupMergeFields?: string[];
  /** 自定义层级名称配置 */
  levelNames?: LevelNames;
}>();

const emit = defineEmits<{
  (e: "cellEdit", row: any, field: string, value: any): void;
  (e: "rowClick", row: any): void;
  (e: "selectionChange", records: any[]): void;
  (e: "tabChange", accountId: string): void;
}>();

// 默认层级配置
const defaultLevelNames: LevelNames = {
  campaign: { show: true, labelName: "计划" },
  adgroup: { show: true, labelName: "子任务" },
  promotion: { show: true, labelName: "广告" }
};

// 实际使用的层级配置
const levelNamesConfig = computed(() => ({
  campaign: {
    show: props.levelNames?.campaign?.show ?? defaultLevelNames.campaign?.show ?? true,
    labelName: props.levelNames?.campaign?.labelName || defaultLevelNames.campaign?.labelName || "计划"
  },
  adgroup: {
    show: props.levelNames?.adgroup?.show ?? defaultLevelNames.adgroup?.show ?? true,
    labelName: props.levelNames?.adgroup?.labelName || defaultLevelNames.adgroup?.labelName || "子任务"
  },
  promotion: {
    show: props.levelNames?.promotion?.show ?? defaultLevelNames.promotion?.show ?? true,
    labelName: props.levelNames?.promotion?.labelName || defaultLevelNames.promotion?.labelName || "广告"
  }
}));

// 当前选中的账户 Tab
const activeAccountId = ref<string>("");

// 表格是否为空
const isEmpty = computed(() => !props.tableData || props.tableData.length === 0);

// 默认的合并字段配置
const defaultCampaignMergeFields = ["taskName", "budget", "startDate", "endDate"];
const defaultAdgroupMergeFields = ["subTaskName", "subTaskPrice", "conversionBehaviorId"];

// 当前账户的数据
const currentAccountData = computed(() => {
  if (!activeAccountId.value || isEmpty.value) return null;
  return props.tableData.find(item => item.advertiserId === activeAccountId.value);
});

// 实际使用的合并字段配置
const campaignMergeFields = computed(() => props.campaignMergeFields || defaultCampaignMergeFields);
const adgroupMergeFields = computed(() => props.adgroupMergeFields || defaultAdgroupMergeFields);

// 表格合并方法 - 实现三层嵌套数据的单元格合并
function handleSpanMethod({
                            row,
                            _rowIndex,
                            column,
                            visibleData
                          }: {
  row: any;
  _rowIndex: number;
  column: any;
  visibleData: any[];
}) {
  const field = column.field;

  // 没有字段名的列（如纯分组列）不合并
  if (!field) {
    return { rowspan: 1, colspan: 1 };
  }

  // 广告层级字段不合并
  if (!campaignMergeFields.value.includes(field) && !adgroupMergeFields.value.includes(field)) {
    return { rowspan: 1, colspan: 1 };
  }

  // 获取当前列对应的合并基准 ID
  let targetId = "";
  if (campaignMergeFields.value.includes(field) || column.type === "checkbox") {
    targetId = row.rowCampaignId;
  } else if (adgroupMergeFields.value.includes(field)) {
    targetId = row.rowGroupId;
  } else {
    return { rowspan: 1, colspan: 1 };
  }

  // 向上逻辑：隐藏重复单元格
  if (_rowIndex > 0) {
    const prevRow = visibleData[_rowIndex - 1];
    const prevTargetId =
      campaignMergeFields.value.includes(field) || column.type === "checkbox"
        ? prevRow?.rowCampaignId
        : prevRow?.rowGroupId;
    if (targetId === prevTargetId) {
      return { rowspan: 0, colspan: 0 };
    }
  }

  // 向下逻辑：计算合并行数
  let countRowspan = 1;
  for (let i = _rowIndex + 1; i < visibleData.length; i++) {
    const nextRow = visibleData[i];
    const nextTargetId =
      campaignMergeFields.value.includes(field) || column.type === "checkbox"
        ? nextRow?.rowCampaignId
        : nextRow?.rowGroupId;
    if (targetId === nextTargetId) {
      countRowspan++;
    } else {
      break;
    }
  }
  return { rowspan: countRowspan, colspan: 1 };
}

// 构建 grid options
const gridOptions: VxeGridProps = {
  border: true,
  height: "auto",
  columnConfig: {
    resizable: true
  },
  checkboxConfig: {
    highlight: true,
    trigger: "row"
  },
  showOverflow: false,
  showHeaderOverflow: false,
  spanMethod: handleSpanMethod,
  columns: props.tableColumns as any[],
  pagerConfig: {
    enabled: false
  }
};

// 表格事件
const gridEvents = {
  // @ts-ignore
  checkboxChange({ checked, row }: { checked: boolean; row: any }) {
    const $grid = gridApi.grid;
    if ($grid) {
      const records = $grid.getCheckboxRecords();
      emit("selectionChange", records);
    }
  }
};

// 初始化 Grid
const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions,
  gridEvents
});

// 切换账户 Tab
async function handleTabChange(accountId: string) {
  activeAccountId.value = accountId;
  gridApi.setLoading(true);

  setTimeout(() => {
    try {
      const currentData = props.tableData.find(item => item.advertiserId === accountId);
      if (currentData && currentData.flattenedRows) {
        gridApi.setGridOptions({
          data: currentData.flattenedRows
        });
      } else {
        gridApi.setGridOptions({ data: [] });
      }
      gridApi.grid?.clearCheckboxRow();
    } finally {
      gridApi.setLoading(false);
    }
  }, 100);

  emit("tabChange", accountId);
}

// 监听数据变化
watch(
  () => props.tableData,
  (newData) => {
    if (newData && newData.length > 0) {
      // 设置第一个账户为默认选中
      if (!activeAccountId.value) {
        activeAccountId.value = newData[0].advertiserId;
      }
      // 更新当前账户的数据
      handleTabChange(activeAccountId.value);
    } else {
      activeAccountId.value = "";
      gridApi.setGridOptions({ data: [] });
    }
  },
  { immediate: true, deep: true }
);

// 监听列配置变化
watch(
  () => props.tableColumns,
  (newColumns) => {
    if (newColumns && newColumns.length > 0) {
      gridApi.setGridOptions({
        columns: newColumns as any[]
      });
    }
  },
  { immediate: true, deep: true }
);

onMounted(() => {
  if (!props.tableData || props.tableData.length === 0) {
    gridApi.setGridOptions({ data: [] });
  }
});

/**
 * 生成/刷新表格数据
 */
function generateTable() {
  if (props.tableData && props.tableData.length > 0) {
    // @ts-ignore
    activeAccountId.value = props.tableData[0].advertiserId;
    handleTabChange(activeAccountId.value);
  }
}

/**
 * 清空表格
 */
function clearTable() {
  activeAccountId.value = "";
  gridApi.setGridOptions({ data: [] });
}

/**
 * 获取当前选中的行
 */
function getSelectedRecords(): any[] {
  const $grid = gridApi.grid;
  return $grid ? $grid.getCheckboxRecords() : [];
}

/**
 * 更新指定行的数据
 */
function updateCell(row: any | number, field: string, value: any) {
  const $grid = gridApi.grid;
  if (!$grid) return;

  if (typeof row === "number") {
    $grid.updateRow($grid.getRowByIndex(row), { [field]: value });
  } else {
    $grid.updateRow(row, { [field]: value });
  }

  emit("cellEdit", typeof row === "number" ? null : row, field, value);
}

/**
 * 获取当前激活的账户ID
 */
function getActiveAccountId(): string {
  return activeAccountId.value;
}

defineExpose({
  generateTable,
  clearTable,
  getSelectedRecords,
  updateCell,
  getActiveAccountId,
  handleTabChange
});
</script>

<template>
  <div class="preview-area">
    <!-- 空状态 -->
    <div v-if="showEmpty && isEmpty" class="empty-status">
      请先完成计划配置，再预览生成的广告计划~
    </div>

    <!-- 有数据时展示 -->
    <template v-else-if="!isEmpty">
      <!-- 使用 ant-vue 原生 Tabs 组件 -->
      <Tabs v-model:activeKey="activeAccountId" @change="handleTabChange">
        <TabPane v-for="item in tableData" :key="item.advertiserId">
          <template #tab>
            <div class="tab-content">
              <span class="tab-name">{{ item.advertiserName }}</span>
              <Divider type="vertical" />
              <span class="tab-id">ID: {{ item.advertiserId }}</span>
            </div>
          </template>
        </TabPane>
      </Tabs>

      <!-- 统计信息 -->
      <Card style="margin-top: 10px">
        <div class="statistics-bar">
          <span v-if="levelNamesConfig.campaign.show">{{ levelNamesConfig.campaign.labelName }}总数：<span class="stat-value">{{ currentAccountData?.campaignCount || 0
            }}</span></span>
          <Divider v-if="levelNamesConfig.campaign.show && levelNamesConfig.adgroup.show" type="vertical" />
          <span v-if="levelNamesConfig.adgroup.show">{{ levelNamesConfig.adgroup.labelName }}总数：<span class="stat-value">{{ currentAccountData?.adgroupCount || 0
            }}</span></span>
          <Divider v-if="levelNamesConfig.adgroup.show && levelNamesConfig.promotion.show" type="vertical" />
          <span v-if="levelNamesConfig.promotion.show">{{ levelNamesConfig.promotion.labelName }}总数：<span class="stat-value">{{ currentAccountData?.promotionCount || 0
            }}</span></span>
        </div>
      </Card>

      <!-- 数据表格 -->
      <Card style="margin-top: 10px">
        <Grid style="min-height: 60vh"></Grid>
      </Card>
    </template>
  </div>
</template>

<style scoped lang="scss">
.preview-area {
  width: 100%;
}

.empty-status {
  padding: 40px 0;
  color: #999;
  text-align: center;
}

.tab-content {
  display: flex;
  align-items: center;

  .tab-name {
    font-weight: 500;
  }

  .tab-id {
    color: #666;
    font-size: 12px;
  }
}

.statistics-bar {
  display: flex;
  align-items: center;

  .stat-value {
    color: #006be6;
    font-weight: 500;
  }
}
</style>
