<script lang="ts" setup>
import type { StrategyGropType } from "#/api/models";

import { onMounted, ref } from "vue";

import { useVbenDrawer, useVbenModal, type VbenFormProps } from "@vben/common-ui";
import { $t } from "@vben/locales";

import { Button, Dropdown, Menu, MenuItem, message, Space, Tag } from "ant-design-vue";

import { useVbenVxeGrid, type VxeGridProps } from "#/adapter/vxe-table";
import { projectApi, strategyGropApi } from "#/api/core";
import { Platform, SubType } from "#/constants/enums";
import { BatchOptionsType, getSubTypeLabel, PLATFORM, SUB_TYPE, TABLE_COMMON_COLUMNS } from "#/constants/locales";
import { getPlatformColor, getPlatformLabel } from "#/constants/platform";
import { trimObject } from "#/utils/trim";
import { getLabelColor } from "#/views/marketing/account/label/constants";
import { useAccountLabelOptions } from "#/views/marketing/account/label/useAccountLabelOptions";
import { BYTEDANCE_STD } from "#/views/marketing/creation/bytedance_std/bytedance";
import { BYTEDANCE_UNIT } from "#/views/marketing/creation/bytedance_unit/bytedance";
import { HUAWEI_STORE } from "#/views/marketing/creation/huawei_store/huawei_store";
import { OPPO_VERSION } from "#/views/marketing/creation/oppo/Oppo.types";
import { TENCENT } from "#/views/marketing/creation/tencent/tencent";

import { VIVO_VERSION } from "../../vivo/vivo";
import CreateObjectRequestComp from "../createStrategyGroup.vue"; // 新增|修改弹窗
import BatchLabelModal from "./BatchLabelModal.vue";


const props = defineProps<Props>();

// 定义要传递给父组件的事件
const emit = defineEmits(["update:reuse"]);

const { labelNamesOf, labelOptions, loadLabelOptions } = useAccountLabelOptions();

onMounted(() => {
  void loadLabelOptions();
});

function getLasterVersion(platform: string, version: string, subType?: string): boolean {
  if (platform === Platform.VIVO) {
    return version !== VIVO_VERSION;
  } else if (platform === Platform.BYTEDANCE) {
    // 巨量竞价与全域使用同一 platform，版本号按子类型区分
    return subType === SubType.BYTEDANCE_UNIT
      ? version !== BYTEDANCE_UNIT
      : version !== BYTEDANCE_STD;
  } else if (platform === Platform.OPPO) {
    return version !== OPPO_VERSION;
  } else if (platform === Platform.TENCENT) {
    return version !== TENCENT;
  } else if (platform !== Platform.HUAWEI_STORE) {
    return version !== HUAWEI_STORE;
  }
  return false;
}

// 组件 Props 类型定义
interface Props {
  projectId?: string;
  platform?: string;
  subType?: string;
  /** 是否展示子类型查询与列，默认不展示（单子类型媒体无需） */
  showSubType?: boolean;
  config?: Object;
}

const formOptions: VbenFormProps = {
  // 默认展开
  schema: [
    {
      component: "Input",
      fieldName: "name",
      label: "名称"
    },
    {
      component: "Select",
      componentProps: () => ({
        allowClear: true,
        optionFilterProp: "label",
        options: labelOptions.value,
        placeholder: "请选择策略组标签",
        showSearch: true
      }),
      fieldName: "labelId",
      label: "策略组标签"
    },
    {
      component: "ApiSelect",
      defaultValue: props.projectId,
      componentProps: {
        valueField: "id",
        labelField: "name",
        resultField: "items",
        api: async () => {
          return await projectApi.fetchProjectList({ page: 1, pageSize: 1000 });
        }
      },
      fieldName: "projectId",
      label: "项目"
    },
    {
      component: "Select",
      defaultValue: props.platform ?? "vivo",
      componentProps: {
        allowClear: true,
        options: PLATFORM,
        placeholder: `${$t("common.choice")}`,
        disabled: true
      },
      fieldName: "platform",
      label: "平台"
    },
    ...(props.showSubType
      ? [
          {
            component: "Select",
            defaultValue: props.subType,
            componentProps: {
              allowClear: true,
              options: SUB_TYPE,
              placeholder: `${$t("common.choice")}`
            },
            fieldName: "subType",
            label: "子类型"
          }
        ]
      : [])
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  // 按下回车时是否提交表单
  submitOnEnter: false
};
const modifiedColumns = (TABLE_COMMON_COLUMNS as any[]).map((col) => {
  if (col.field === "status") {
    return { ...col, width: 180 };
  }
  return col;
});

const gridOptions: VxeGridProps<StrategyGropType> = {
  border: true,
  height: "500px",
  toolbarConfig: {},
  data: [],
  columns: [
    {
      field: "name",
      title: `名称`,
      width: "auto"
    },
    {
      field: "labelIds",
      title: "策略组标签",
      width: 200,
      slots: { default: "labelIds" }
    },
    {
      field: "platform",
      title: `平台`,
      width: "auto",
      // 媒体列渲染成中文带色标签，映射取自 constants/platform
      slots: { default: "platform" }
    },
    ...(props.showSubType
      ? [
          {
            field: "subType",
            title: `子类型`,
            width: "auto",
            slots: { default: "subType" }
          }
        ]
      : []),
    {
      field: "projectName",
      title: `项目`,
      width: "auto"
    },
    ...modifiedColumns
  ],
  keepSource: true,
  proxyConfig: {
    ajax: {
      query: async ({ page }, args) => {
        const params = trimObject(args);
        return await strategyGropApi.fetchGetStrategyGrop({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...params
        });
      }
    }
  }
};
const selectedRows = ref<StrategyGropType[]>([]);

const gridEvents = {
  checkboxAll: ({ records }: { records: StrategyGropType[] }) => {
    selectedRows.value = records;
  },
  checkboxChange: ({ records }: { records: StrategyGropType[] }) => {
    selectedRows.value = records;
  },
  proxyQuery: () => {
    selectedRows.value = [];
  }
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions, gridEvents });

function pageReload() {
  gridApi.reload();
}

const [Drawer, drawerApi] = useVbenDrawer({
  closeOnClickModal: false,
  closeOnPressEscape: true,
  class: 'w-[73.2%]',
});

/**
 * 复用策略组
 * @param row
 */
function reuseStrategyGroup(row: StrategyGropType) {
  emit("update:reuse", row.configObj);
  drawerApi.close();
}

async function deleteStrategyGroup(row: StrategyGropType) {
  const params = {
    type: BatchOptionsType.Delete,
    targetIds: [row.id] as string[],
    values: {}
  };
  await strategyGropApi.fetchBatchStrategyGrop(params);
  message.success("删除成功");
  pageReload();
}

/**
 * 创建弹窗
 */
const [CreateObjectModal, createObjectApi] = useVbenModal({
  connectedComponent: CreateObjectRequestComp,
  centered: true,
  modal: true
});

const [BatchLabelModalComp, batchLabelModalApi] = useVbenModal({
  connectedComponent: BatchLabelModal
});

function openBatchLabel() {
  const records = gridApi.grid.getCheckboxRecords() as StrategyGropType[];
  if (records.length === 0) {
    return message.warning("请选择需要修改标签的策略组！");
  }
  batchLabelModalApi.setData({
    targetIds: records.map((item) => String(item.id))
  });
  batchLabelModalApi.open();
}

function handleBatchLabelSuccess() {
  selectedRows.value = [];
  gridApi.grid.clearCheckboxRow();
  pageReload();
}

function openCreateModal(row: StrategyGropType) {
  if (row.id) {
    createObjectApi.setData(row);
  } else {
    createObjectApi.setData({ projectId: props.projectId, subType: props.subType });
  }
  createObjectApi.open();
}
</script>
<template>
  <div>
    <Drawer title="选择策略组">
      <div class="strategy-toolbar">
        <span class="strategy-selected">已选 {{ selectedRows.length }} 个</span>
        <Dropdown trigger="click" placement="bottomCenter">
          <Button
            type="primary"
            :disabled="selectedRows.length === 0"
          >
            批量操作
          </Button>
          <template #overlay>
            <Menu>
              <MenuItem @click="openBatchLabel">修改标签</MenuItem>
            </Menu>
          </template>
        </Dropdown>
      </div>
      <Grid>
        <template #labelIds="{ row }">
          <Space v-if="row.labelIds?.length" wrap :size="[4, 4]">
            <Tag
              v-for="name in (row.labelNames?.length ? row.labelNames : labelNamesOf(row.labelIds))"
              :key="name"
              :bordered="false"
              :color="getLabelColor(name)"
            >
              {{ name }}
            </Tag>
          </Space>
          <span v-else>-</span>
        </template>
        <template #platform="{ row }">
          <Tag :bordered="false" :color="getPlatformColor(row.platform)">
            {{ getPlatformLabel(row.platform) }}
          </Tag>
        </template>
        <template #subType="{ row }">
          {{ getSubTypeLabel(row.subType) }}
        </template>
        <template #status="{ row }">
          <div>
            {{
              getLasterVersion(row.platform, row.version, row.subType) ? "版本已迭代，旧版本不可用" : "最新版本"
            }}
          </div>
</template>
        <template #action="{ row }">
          <Button
            type="link"
            @click="openCreateModal(row)"
            :disabled="getLasterVersion(row.platform, row.version, row.subType)"
          >
            {{ $t("common.edit") }}
          </Button>
          <Button
            type="link"
            @click="reuseStrategyGroup(row)"
            :disabled="getLasterVersion(row.platform, row.version, row.subType)"
          >
            复用
          </Button>
          <Button type="link" danger @click="deleteStrategyGroup(row)">
            {{ $t("common.delete") }}
          </Button>
        </template>
        <!-- <template #toolbar-tools>
          <Button class="mr-2" type="primary" @click="() => openCreateModal()">
            {{ $t('common.create') }}
          </Button>
        </template> -->
      </Grid>
    </Drawer>
    <CreateObjectModal
      @page-reload="pageReload"
      :config="props.config"
      :project-id="props.projectId"
      :plaform="props.platform"
    />
    <BatchLabelModalComp @success="handleBatchLabelSuccess" />
  </div>
</template>

<style scoped>
.strategy-toolbar {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: flex-end;
  padding: 0 0 10px;
}

.strategy-selected {
  color: hsl(var(--muted-foreground));
  font-size: 12px;
}
</style>
