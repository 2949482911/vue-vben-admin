<script lang="ts" setup name="AccountManager">
import type { VbenFormProps } from "@vben/common-ui";

import type { VxeTableGridOptions } from "#/adapter/vxe-table";
import type { OrgItem, UserItem } from "#/api/models/users";

import { onMounted, reactive, ref } from "vue";

import { ColPage, Page, useVbenDrawer } from "@vben/common-ui";
import { Plus } from "@vben/icons";
import { $t } from "@vben/locales";

import { Avatar, Button, Card, message, Modal, Tag, Tree } from "ant-design-vue";

import { useVbenVxeGrid, VbenTableAction } from "#/adapter/vxe-table";
import { orgApi, userApi } from "#/api";
import {
  BatchOptionsType,
  SEX_SELECT,
  STATUS_SELECT, TABLE_COMMON_COLUMNS
} from "#/constants/locales";

import Create from "./create.vue";
import Detail from "./detail.vue";

/** 账户状态：1 启用 / 9 禁用（对应后端 Constant.ENABLE / Constant.IS_DISABLED，与 STATUS_SELECT 一致） */
const STATUS_ENABLE = 1;
const STATUS_DISABLE = 9;

const [CreateDrawer, createDrawerApi] = useVbenDrawer({
  connectedComponent: Create
});

const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  connectedComponent: Detail
});

const orgTreeData = ref<OrgItem[]>([]);

const props = reactive({
  leftCollapsedWidth: 5,
  leftCollapsible: true,
  leftMaxWidth: 20,
  leftMinWidth: 20,
  leftWidth: 20,
  resizable: true,
  rightWidth: 80,
  splitHandle: false,
  splitLine: false
});

const formOptions: VbenFormProps = {
  schema: [
    {
      component: "Input",
      fieldName: "nickname",
      label: `${$t("system.user.columns.nickname")}`
    },
    {
      component: "Input",
      fieldName: "authName",
      label: `${$t("system.user.columns.authName")}`
    },
    {
      component: "Input",
      fieldName: "phone",
      label: `${$t("system.user.columns.phone")}`
    },
    {
      component: "Select",
      componentProps: {
        allowClear: true,
        options: SEX_SELECT,
        placeholder: `${$t("common.choice")}`
      },
      fieldName: "sex",
      label: `${$t("system.user.columns.sex")}`
    },
    {
      component: "Select",
      componentProps: {
        allowClear: true,
        options: STATUS_SELECT,
        placeholder: `${$t("common.choice")}`
      },
      fieldName: "status",
      label: `${$t("core.columns.status")}`
    }
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  // 按下回车时是否提交表单
  submitOnEnter: true,
  compact: true,
  collapsed: true
};

/**
 * 状态开关二次确认：返回 false 会中止切换（CellSwitch 的 beforeChange）
 * @param newStatus 期望切换到的状态值
 * @param row 行数据
 */
async function onStatusChange(newStatus: number, row: UserItem) {
  const toEnable = newStatus === STATUS_ENABLE;
  try {
    await new Promise((resolve, reject) => {
      Modal.confirm({
        content: `${row.nickname} → ${toEnable ? $t("common.enabled") : $t("common.disabled")}`,
        onCancel: () => reject(new Error("已取消")),
        onOk: () => resolve(true),
        title: $t("ui.actionTitle.edit", [$t("core.columns.status")])
      });
    });
  } catch {
    return false;
  }
  await userApi.fetchBatchOptions({
    targetIds: [row.id],
    type: toEnable ? BatchOptionsType.Enable : BatchOptionsType.DISABLE,
    values: new Map<string, any>()
  });
  pageReload();
  return true;
}

async function onDelete(row: UserItem) {
  await userApi.fetchBatchOptions({
    targetIds: [row.id],
    type: BatchOptionsType.Delete,
    values: new Map<string, any>()
  });
  message.success($t("ui.actionMessage.deleteSuccess", [row.nickname]));
  pageReload();
}

function onCreate() {
  createDrawerApi.setData({}).open();
}

function onEdit(row: UserItem) {
  createDrawerApi.setData(row).open();
}

function onDetail(row: UserItem) {
  detailDrawerApi.setData(row).open();
}

const gridOptions: VxeTableGridOptions<UserItem> = {
  columns: [
    {
      // 头像 + 昵称 + 登录账户，合成一列做身份识别
      field: "nickname",
      slots: { default: "user" },
      title: `${$t("system.user.title")}`,
      minWidth: 150,
    },
    {
      field: "phone",
      title: `${$t("system.user.columns.phone")}`,
      width: 'auto'
    },
    {
      field: "email",
      title: `${$t("system.user.columns.email")}`,
      width: 'auto'
    },
    {
      field: "sex",
      slots: { default: "sex" },
      title: `${$t("system.user.columns.sex")}`,
      width: 'auto'
    },
    {
      field: "roleIds",
      slots: { default: "roleList" },
      title: `${$t("system.user.columns.roleIds")}`,
      width: 'auto'
    },
    {
      field: "orgName",
      title: `${$t("system.user.columns.orgId")}`,
      width: 'auto'
    },
    {
      // 启用/禁用，切换前二次确认，接口失败自动回滚
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: "CellSwitch",
        props: { checkedValue: STATUS_ENABLE, unCheckedValue: STATUS_DISABLE }
      },
      field: "status",
      title: `${$t("core.columns.status")}`,
      width: 'auto'
    },
    {
      // 最后登录时间 + 登录IP
      field: "lastTime",
      slots: { default: "lastLogin" },
      title: `${$t("system.user.columns.lastTime")}`,
      width: 'auto'
    },
    {
      field: "createTime",
      formatter: "formatDateTime",
      title: `${$t("core.columns.createTime")}`,
      minWidth: 170
    },
    ...TABLE_COMMON_COLUMNS as any
  ],
  proxyConfig: {
    autoLoad: true,
    ajax: {
      query: async ({ page }, args) => {
        return await userApi.fetchUserList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...args
        });
      }
    }
  },
  checkboxConfig: {
    highlight: true,
    labelField: "id",
    range: true
  },
  pagerConfig: {
    enabled: true
  },
  // height: "auto",
  toolbarConfig: {
    custom: true,
    export: false,
    refresh: true,
    search: true,
    zoom: true
  }
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

const pageReload = () => {
  gridApi.reload();
};

/**
 * org 检索
 * @param selectedKeys 选中的节点ID
 * @param node 当前节点
 */
function handlerOrgPageList(selectedKeys: string[], { node }) {
  gridApi.reload({ orgId: node.id });
}

onMounted(() => {
  orgApi.fetchOrgTree().then((res) => {
    orgTreeData.value = res;
  });
});
</script>

<template>
  <ColPage v-bind="props">
    <template #left>
      <div
        :style="{ minWidth: '200px' }"
        class="border-border bg-card mr-2 rounded-[var(--radius)] border p-2"
      >
        <Tree
          :tree-data="orgTreeData"
          :field-names="{ title: 'name', key: 'id', children: 'children' }"
          @select="handlerOrgPageList"
        />
      </div>
    </template>
    <Card class="ml-2">
      <Page>
        <Grid>
          <!-- 用户：头像 + 昵称 + 登录账户 -->
          <template #user="{ row }">
            <div class="flex items-center gap-2">
              <Avatar :size="32" :src="row.avatar">
                {{ row.nickname?.slice(0, 1) }}
              </Avatar>
              <div class="min-w-0">
                <div class="truncate">{{ row.nickname || "-" }}</div>
                <div class="text-muted-foreground truncate text-xs">
                  {{ row.authName || "-" }}
                </div>
              </div>
            </div>
          </template>

          <template #sex="{ row }">
            <Tag v-if="row.sex === 1" color="blue">{{ $t("common.boy") }}</Tag>
            <Tag v-else-if="row.sex === 2" color="magenta">
              {{ $t("common.girl") }}
            </Tag>
            <span v-else class="text-muted-foreground">-</span>
          </template>

          <template #roleList="{ row }">
            <div
              v-if="row.roleList?.length"
              class="flex flex-wrap items-center justify-center gap-1"
            >
              <Tag v-for="role in row.roleList" :key="role.id" color="processing">
                {{ role.name }}
              </Tag>
            </div>
            <span v-else class="text-muted-foreground">-</span>
          </template>

          <template #lastLogin="{ row }">
            <div v-if="row.lastTime || row.loginIp">
              <div>{{ row.lastTime || "-" }}</div>
              <div class="text-muted-foreground text-xs">
                {{ row.loginIp || "-" }}
              </div>
            </div>
            <span v-else class="text-muted-foreground">-</span>
          </template>

          <template #action="{ row }">
            <VbenTableAction
              :actions="[
                {
                  text: $t('common.detail'),
                  icon: 'lucide:eye',
                  onClick: () => onDetail(row)
                },
                {
                  text: $t('common.edit'),
                  icon: 'lucide:edit',
                  onClick: () => onEdit(row)
                }
              ]"
              :dropdown-actions="[
                {
                  text: $t('common.delete'),
                  icon: 'lucide:trash-2',
                  danger: true,
                  popConfirm: {
                    title: $t('ui.actionMessage.deleteConfirm', [row.nickname]),
                    confirm: () => onDelete(row)
                  }
                }
              ]"
              align="center"
            />
          </template>

          <template #toolbar-tools>
            <Button type="primary" @click="onCreate">
              <Plus class="size-5" />
              {{ $t("ui.actionTitle.create", [$t("system.user.title")]) }}
            </Button>
          </template>
        </Grid>
      </Page>
    </Card>
    <CreateDrawer @page-reload="pageReload" />
    <DetailDrawer />
  </ColPage>
</template>
