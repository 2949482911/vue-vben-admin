<script lang="ts" setup name="AccountDetail">
import type { DescriptionsItemType } from "@vben/common-ui";

import type { UserItem } from "#/api/models/users";

import { computed, h, ref } from "vue";

import { useVbenDrawer, VbenDescriptions } from "@vben/common-ui";
import { $t } from "@vben/locales";
import { formatDateTime } from "@vben/utils";

import { Tag } from "ant-design-vue";

import { SEX_SELECT } from "#/constants/locales";

/** 账户状态：1 启用 / 9 禁用 */
const STATUS_ENABLE = 1;

const detailData = ref<null | UserItem>(null);

const items = computed<DescriptionsItemType[]>(() => {
  const row = detailData.value;
  if (!row) {
    return [];
  }
  return [
    { label: $t("system.user.columns.nickname"), content: row.nickname || "-" },
    { label: $t("system.user.columns.authName"), content: row.authName || "-" },
    { label: $t("system.user.columns.phone"), content: row.phone || "-" },
    { label: $t("system.user.columns.qq"), content: row.qq || "-" },
    { label: $t("system.user.columns.email"), content: row.email || "-" },
    {
      label: $t("system.user.columns.sex"),
      content: SEX_SELECT.find((item) => item.value === row.sex)?.label ?? "-"
    },
    {
      label: $t("system.user.columns.roleIds"),
      content: () => {
        if (!row.roleList?.length) {
          return "-";
        }
        return h(
          "div",
          { class: "flex flex-wrap gap-1" },
          row.roleList.map((role) =>
            h(
              Tag,
              { color: "processing", key: role.id },
              { default: () => role.name }
            )
          )
        );
      }
    },
    { label: $t("system.user.columns.orgId"), content: row.orgName || "-" },
    {
      label: $t("core.columns.status"),
      content: () =>
        h(
          Tag,
          { color: row.status === STATUS_ENABLE ? "success" : "error" },
          {
            default: () =>
              row.status === STATUS_ENABLE
                ? $t("common.enabled")
                : $t("common.disabled")
          }
        )
    },
    { label: $t("system.user.columns.lastTime"), content: row.lastTime || "-" },
    { label: $t("system.user.columns.loginIp"), content: row.loginIp || "-" },
    {
      label: $t("system.user.columns.remark"),
      content: row.remark || "-",
      span: 2
    },
    {
      label: $t("core.columns.createUsername"),
      content: row.createUsername || "-"
    },
    {
      label: $t("core.columns.createTime"),
      content: formatDateTime(row.createTime)
    },
    {
      label: $t("core.columns.updateUsername"),
      content: row.updateUsername || "-"
    },
    {
      label: $t("core.columns.updateTime"),
      content: formatDateTime(row.updateTime)
    }
  ];
});

const [Drawer, drawerApi] = useVbenDrawer({
  class: "w-[45%]",
  footer: false,
  title: $t("common.detail"),
  onOpenChange(isOpen: boolean) {
    detailData.value = isOpen
      ? ((drawerApi.getData() as undefined | UserItem) ?? null)
      : null;
  }
});
</script>

<template>
  <Drawer>
    <VbenDescriptions bordered :column="2" :items="items" />
  </Drawer>
</template>
