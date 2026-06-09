<script setup lang="ts" name="Function">
import { Button, Space } from "ant-design-vue";
import MonitoringDrawer
  from "#/views/marketing/creation/components/monitoringLink/MonitoringDrawer.vue";
import { useVbenDrawer } from "@vben/common-ui";
import type { AccountInfo, MonitoringLinkConfigData } from "#/views/marketing/creation/creation";
import { ref, watch } from "vue";


// 账户列表
const { accountInfo, monitoringLink } = defineProps({
  accountInfo: {
    type: Array<AccountInfo>,
    default: () => []
  },
  monitoringLink: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(["update:monitoringLink", "save:createStrategyGroup", "gen:adList", "submit:createBatch"]);


// 本地监测链接数据
const localMonitoringLink = ref<MonitoringLinkConfigData>({
  config: { method: monitoringLink?.config?.method || "ALL" },
  linkType: monitoringLink?.linkType || "MANUAL",
  data: new Map()
});

// 监听父组件传入的 monitoringLink 变化，实现回显
watch(
  () => monitoringLink,
  (newMonitoringLink) => {
    if (newMonitoringLink && newMonitoringLink.data) {
      // 处理普通对象转换为 Map（复用策略组时 JSON 序列化后 Map 变成普通对象）
      const dataMap = newMonitoringLink.data instanceof Map
        ? newMonitoringLink.data
        : new Map(Object.entries(newMonitoringLink.data || {}));

      localMonitoringLink.value = {
        config: { ...newMonitoringLink.config },
        linkType: newMonitoringLink.linkType || "MANUAL",
        data: dataMap
      };
    }
  },
  { immediate: true, deep: true }
);

// 监测链接组
const [MonitoringDrawerModal, monitoringDrawerApi] = useVbenDrawer({
  connectedComponent: MonitoringDrawer
});

/**
 * 打开监测链接组
 */
function openMonitoringDrawer() {
  monitoringDrawerApi.setData({
    config: { method: localMonitoringLink.value.config.method },
    linkType: localMonitoringLink.value.linkType,
    data: new Map(localMonitoringLink.value.data)
  });
  monitoringDrawerApi.open();
}


/**
 * 策略组保存
 */
function createStrategyGroup() {
  emit("save:createStrategyGroup");
}

/**
 * 生成广告预览
 */
function genAdList() {
  emit("gen:adList");
}


/**
 * 提交审核
 */
function submitCreateBatch() {
  emit("submit:createBatch");
}

/**
 * 编辑监测链接配置
 * @param monitoringLink
 */
function updateMonitoringLink(monitoringLink: MonitoringLinkConfigData) {
  localMonitoringLink.value = {
    config: { ...monitoringLink.config },
    linkType: monitoringLink.linkType || "MANUAL",
    data: new Map(monitoringLink.data)
  };
  emit("update:monitoringLink", {
    config: { ...localMonitoringLink.value.config },
    linkType: localMonitoringLink.value.linkType,
    data: new Map(localMonitoringLink.value.data)
  });
}

</script>

<template>
  <div>
    <div class="flex justify-between">
      <Space>
        <Button type="primary" @click="openMonitoringDrawer">监测连接</Button>
      </Space>
      <Space>
        <Button type="primary" @click="createStrategyGroup">保存策略组</Button>
        <Button type="primary" @click="genAdList">生成广告预览</Button>
        <Button type="primary" @click="submitCreateBatch">提交审核</Button>
      </Space>
    </div>

    <!--    监测链接组-->
    <MonitoringDrawerModal
      :accountInfo="accountInfo"
      :monitoringLink="localMonitoringLink"
      @update:monitoringLink="updateMonitoringLink"
    />

  </div>
</template>

<style scoped lang="scss">

</style>
