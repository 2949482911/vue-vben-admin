<script lang="ts" setup>
import type { StrategyGropType } from "#/api/models";

import { useVbenModal, type VbenFormProps } from "@vben/common-ui";
import { $t } from "@vben/locales";

import { Button, message, Tag } from "ant-design-vue";

import { useVbenVxeGrid, type VxeGridProps } from "#/adapter/vxe-table";
import { projectApi, strategyGropApi } from "#/api/core";
import { Platform } from "#/constants/enums";
import { BatchOptionsType, PLATFORM, TABLE_COMMON_COLUMNS } from "#/constants/locales";
import { getPlatformColor, getPlatformLabel } from "#/constants/platform";
import { trimObject } from "#/utils/trim";
import { BYTEDANCE_STD } from "#/views/marketing/creation/bytedance_std/bytedance";
import { HUAWEI_STORE } from "#/views/marketing/creation/huawei_store/huawei_store";
import { OPPO_VERSION } from "#/views/marketing/creation/oppo/Oppo.types";
import { TENCENT } from "#/views/marketing/creation/tencent/tencent";

import { VIVO_VERSION } from "../vivo/vivo";
import CreateObjectRequestComp from "./createStrategyGroup.vue"; // 新增|修改弹窗


const props = defineProps<Props>();

// 定义要传递给父组件的事件
const emit = defineEmits(["update:reuse"]);

function getLasterVersion(platform: string, version: string): boolean {
  if (platform === Platform.VIVO) {
    return version !== VIVO_VERSION;
  } else if (platform === Platform.BYTEDANCE) {
    return version !== BYTEDANCE_STD;
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
    }
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
      field: "platform",
      title: `平台`,
      width: "auto",
      // 媒体列渲染成中文带色标签，映射取自 constants/platform
      slots: { default: "platform" }
    },
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
const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

function pageReload() {
  gridApi.reload();
}

const [Modal, modalApi] = useVbenModal({});

/**
 * 复用策略组
 * @param row
 */
function reuseStrategyGroup(row: StrategyGropType) {
  emit("update:reuse", row.configObj);
  modalApi.close();
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

function openCreateModal(row: StrategyGropType) {
  if (row.id) {
    createObjectApi.setData(row);
  } else {
    createObjectApi.setData({ projectId: props.projectId });
  }
  createObjectApi.open();
}
</script>
<template>
  <div>
    <Modal title="选择策略组" class="w-[73.2%]">
      <Grid>
        <template #platform="{ row }">
          <Tag :bordered="false" :color="getPlatformColor(row.platform)">
            {{ getPlatformLabel(row.platform) }}
          </Tag>
        </template>
        <template #status="{ row }">
          <div>
            {{
              getLasterVersion(row.platform, row.version) ? "版本已迭代，旧版本不可用" : "最新版本"
            }}
          </div>
</template>
        <template #action="{ row }">
          <Button
            type="link"
            @click="openCreateModal(row)"
            :disabled="getLasterVersion(row.platform, row.version)"
          >
            {{ $t("common.edit") }}
          </Button>
          <Button
            type="link"
            @click="reuseStrategyGroup(row)"
            :disabled="getLasterVersion(row.platform, row.version)"
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
    </Modal>
    <CreateObjectModal
      @page-reload="pageReload"
      :config="props.config"
      :project-id="props.projectId"
      :plaform="props.platform"
    />
  </div>
</template>

<style></style>
