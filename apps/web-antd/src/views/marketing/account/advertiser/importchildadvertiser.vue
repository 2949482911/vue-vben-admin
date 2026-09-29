<script setup lang="ts" name="ImportChildAdvertiser">
import type { ProjectItem } from "./advertiser";

import type { VxeGridProps } from "#/adapter/vxe-table";
// 导入子账户：手动选择（查询子账户列表勾选）/ 手动导入（文本域粘贴账户ID）
import type { AccountChildResponse } from "#/api/models";

import { computed, nextTick, ref, watch } from "vue";

import { useVbenDrawer } from "@vben/common-ui";
import { $t } from "@vben/locales";

import {
  Checkbox,
  InputSearch,
  message,
  RadioButton,
  RadioGroup,
  Select,
  Textarea
} from "ant-design-vue";

import { useVbenVxeGrid } from "#/adapter/vxe-table";
import { advertiserApi } from "#/api/core";

const props = defineProps<{
  projectOptions: ProjectItem[];
  /** 媒体账户角色（归一化后的值，如 bm / mdm / unit），不是后端 roleType 原始码 */
  advertiserRole: string;
}>();
const emit = defineEmits(["pageReload"]);
/** 导入方式 */
const MODE_CHOOSE = "choose";
const MODE_IMPORT = "import";

/** 目标父账户ID，由父级 setData 注入 */
const parentId = ref("");
/** 当前导入方式 */
const mode = ref<string>(MODE_CHOOSE);
/**
 * 需要区分两种导入方式的媒体账户角色：腾讯的商务管家 / 客户主体 / 业务单元。
 * 注意用归一化后的 advertiserRole 判断：后端 roleType 存的是媒体原始角色码（如 "1"、"ACCOUNT_TYPE_BM"）
 */
const MODE_SWITCH_ROLES = ["bm", "mdm", "unit"];

/** 仅上述角色需要在「手动选择 / 手动导入」之间切换 */
const showModeSwitch = computed(() =>
  MODE_SWITCH_ROLES.includes(props.advertiserRole)
);

/** 所属项目下拉选项（父级传入的项目列表） */
const projectItemOptions = computed(() =>
  props.projectOptions.map((item) => ({
    label: item.name,
    value: item.id
  }))
);

/** 所属项目 */
const projectId = ref<string>();

/** 子账户全量数据 / 搜索过滤后的数据（接口一次性返回，分页在前端做） */
const allData = ref<AccountChildResponse[]>([]);
const filterData = ref<AccountChildResponse[]>([]);

/** 列表筛选条件 */
const keyword = ref("");
const onlyAddable = ref(false);

/** 手动导入的账户ID文本 */
const accountIdsText = ref("");

/** 尚未导入的子账户ID，表头全选时用来跨页补齐 */
const addableIds = computed(() =>
  allData.value.filter((item) => !item.exist).map((item) => item.advertiserId)
);
/** 是否点了表头全选 */
const isSelectAll = ref(false);

/** 前端分页参数 */
const pages = ref({
  currentPage: 1,
  pageSize: 100
});

const gridOptions: VxeGridProps<AccountChildResponse> = {
  border: true,
  // 高度由抽屉内的 flex 容器决定，表格在内部滚动
  height: "auto",
  checkboxConfig: {
    highlight: true,
    labelField: "advertiserId",
    // 已导入的子账户不允许再勾选
    checkMethod: ({ row }: { row: AccountChildResponse }) => !row.exist
  },
  columns: [
    { title: "序号", type: "checkbox", fixed: "left", width: 60 },
    {
      field: "advertiserId",
      title: `${$t("marketing.advertiser.columns.advertiserId")}`,
      width: "auto"
    },
    {
      field: "advertiserName",
      title: `${$t("marketing.advertiser.columns.advertiserName")}`,
      width: "auto"
    }
  ],
  data: [],
  keepSource: true,
  pagerConfig: {
    enabled: true,
    pageSize: pages.value.pageSize,
    pageSizes: [50, 100, 300, 500]
  },
  toolbarConfig: {}
};

/**
 * 按当前分页参数把数据切片后喂给表格
 * 接口一次性返回全量数据，分页在前端做，所以每次都要重新切片
 */
function updatePageData(dataArr: AccountChildResponse[]) {
  const { currentPage, pageSize } = pages.value;
  gridApi.setGridOptions({
    data: dataArr.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    pagerConfig: { currentPage, pageSize, total: dataArr.length }
  });
}

const gridEvents = {
  // 表头全选只覆盖当前页，这里记下标记，提交时把其余页的可新增账户一起带上
  checkboxAll: ({ checked }: { checked: boolean }) => {
    isSelectAll.value = checked;
    if (checked && addableIds.value.length === 0) {
      message.warning("无可新增数据");
    }
  },
  // 表头全选只触发 checkboxAll，因此勾选单行时取消全选标记即可
  checkboxChange: () => {
    isSelectAll.value = false;
  },
  pageChange({
    currentPage,
    pageSize
  }: {
    currentPage: number;
    pageSize: number;
  }) {
    pages.value.currentPage = currentPage;
    pages.value.pageSize = pageSize;
    updatePageData(filterData.value);
  }
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

/**
 * 两个面板用 v-show 切换，表格不会被卸载，切回来自然带回列表与勾选状态。
 * 但隐藏期间容器高度为 0，恢复显示后需要让表格重算一次尺寸
 */
watch(mode, (value) => {
  if (value === MODE_CHOOSE) {
    nextTick(() => gridApi.grid.recalculate());
  }
});

/** 按当前搜索词与「只展示可新增账户」重算列表数据 */
function applyFilter() {
  const word = keyword.value.trim();
  filterData.value = allData.value.filter((item) => {
    if (onlyAddable.value && item.exist) {
      return false;
    }
    return !word || item.advertiserName?.includes(word);
  });
  pages.value.currentPage = 1;
  updatePageData(filterData.value);
}

/** 收集本次要导入的账户ID */
function collectAdvertiserIds(): string[] {
  if (mode.value === MODE_IMPORT) {
    return strToArray(accountIdsText.value);
  }
  const ids = new Set(
    (gridApi.grid.getCheckboxRecords() as AccountChildResponse[]).map(
      (item) => item.advertiserId
    )
  );
  if (isSelectAll.value) {
    addableIds.value.forEach((id) => ids.add(id));
  }
  return [...ids];
}

async function handleConfirm() {
  const advertiserIds = collectAdvertiserIds();
  if (advertiserIds.length === 0) {
    message.warning(
      mode.value === MODE_IMPORT ? "请输入账户ID" : "请选择要导入的账户"
    );
    return;
  }
  // lock 期间抽屉内置遮罩、确认按钮 loading，并禁止关闭
  drawerApi.lock();
  try {
    await advertiserApi.fetchImportChild({
      id: parentId.value,
      advertiserIds,
      projectId: projectId.value
    });
    message.success("导入成功");
    emit("pageReload");
    await drawerApi.close();
  } finally {
    drawerApi.unlock();
  }
}

/** 打开时重新拉取子账户列表并清掉上一次的状态 */
async function init() {
  mode.value = MODE_CHOOSE;
  projectId.value = undefined;
  keyword.value = "";
  onlyAddable.value = false;
  accountIdsText.value = "";
  isSelectAll.value = false;
  pages.value.currentPage = 1;
  allData.value = [];
  filterData.value = [];
  updatePageData([]);

  gridApi.setLoading(true);
  try {
    allData.value = await advertiserApi.fetchAccountChild(parentId.value);
    filterData.value = [...allData.value];
    updatePageData(filterData.value);
  } finally {
    gridApi.setLoading(false);
  }
}

const [Drawer, drawerApi] = useVbenDrawer({
  class: "w-[760px]",
  closeOnPressEscape: false,
  onConfirm: handleConfirm,
  onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      return;
    }
    const data = drawerApi.getData() as undefined | { id: string };
    parentId.value = data?.id ?? "";
    void init();
  }
});

/** 逗号 / 空格 / 换行分隔的账户ID文本转数组 */
function strToArray(inputStr: string): string[] {
  if (!inputStr || inputStr.trim() === "") {
    return [];
  }
  return inputStr.split(/[, \n\t]+/).filter((item) => item.trim() !== "");
}
</script>

<template>
  <Drawer :title="$t('marketing.advertiser.importChild')">
    <div class="import-child">
      <!-- 导入方式：仅 BM 账户需要区分 -->
      <RadioGroup
        v-if="showModeSwitch"
        v-model:value="mode"
        button-style="solid"
        class="shrink-0"
      >
        <RadioButton :value="MODE_CHOOSE">手动选择</RadioButton>
        <RadioButton :value="MODE_IMPORT">手动导入</RadioButton>
      </RadioGroup>

      <!-- 手动选择：查询子账户列表后勾选 -->
      <div v-show="mode === MODE_CHOOSE" class="panel">
        <div class="panel-toolbar">
          <InputSearch
            v-model:value="keyword"
            placeholder="请输入账户名字搜索"
            style="width: 200px"
            @search="applyFilter"
          />
          <Checkbox v-model:checked="onlyAddable" @change="applyFilter">
            只展示可新增账户
          </Checkbox>
          <div class="project-field">
            <span>所属项目：</span>
            <Select
              v-model:value="projectId"
              :filter-option="
                (input, option) =>
                  option?.label?.toLowerCase().includes(input.toLowerCase())
              "
              :options="projectItemOptions"
              allow-clear
              placeholder="请选择项目"
              show-search
              style="width: 160px"
            />
          </div>
        </div>
        <div class="panel-body">
          <Grid />
        </div>
      </div>

      <!-- 手动导入：直接粘贴账户ID -->
      <div v-show="mode === MODE_IMPORT" class="panel">
        <div class="panel-hint">多个账户ID请用逗号、空格或换行分隔</div>
        <Textarea
          v-model:value="accountIdsText"
          placeholder="请输入以逗号分隔的账户ID"
          :rows="14"
        />
      </div>
    </div>
  </Drawer>
</template>

<style scoped lang="scss">
.import-child {
  display: flex;
  height: 100%;
  flex-direction: column;
  gap: 12px;
}

.panel {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: 8px;
}

.panel-toolbar {
  display: flex;
  flex: none;
  align-items: center;
  gap: 12px;
}

.panel-body {
  min-height: 0;
  flex: 1;
}

.panel-hint {
  flex: none;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.project-field {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  font-size: 13px;
}
</style>
