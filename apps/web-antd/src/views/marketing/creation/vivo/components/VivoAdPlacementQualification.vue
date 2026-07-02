<script setup lang="ts" name="VivoAdPlacementQualification">
// 投放资质选择组件
// 外部：Input 展示已选资质（、号分隔），点击打开 Drawer
// Drawer内：Tab页切换账户，每页用 vxe-grid 展示资质列表（单选）
import { computed, nextTick, ref, watch } from "vue";
import { Input, message, TabPane, Tabs } from "ant-design-vue";
import type { VxeGridProps } from "#/adapter/vxe-table";
import { useVbenVxeGrid } from "#/adapter/vxe-table";
import { useVbenDrawer } from "@vben/common-ui";
import { adInvestmentApi } from "#/api";
import type { AccountInfo } from "#/views/marketing/creation/creation";
import type {
  AdvertisingQualificationType,
  QualificationValue
} from "#/views/marketing/creation/vivo/vivo";

interface Props {
  /** 账户列表 */
  accountInfo?: AccountInfo[];
  /** v-model 值（兼容表单初始空字符串） */
  modelValue?: Map<string, QualificationValue> | string;

  /**
   * 配置区内的 配置的资质对象
   */
  // advertiserQualification: Map<string, QualificationValue>;
}

const props = withDefaults(defineProps<Props>(), {
  accountInfo: () => [],
  modelValue: () => new Map()
});

const emit = defineEmits<{
  "update:modelValue": [val: Map<string, QualificationValue>];
  "updateQualificationValue": [val: Map<string, QualificationValue>];
}>();

/** 将外部值（可能是空字符串/null/undefined/Map）统一规范化为 Map */
function normalizeMap(val?: Map<string, QualificationValue> | string): Map<string, QualificationValue> {
  if (val instanceof Map) return val;
  return new Map();
}

/** 内部统一的 Map 引用，始终为 Map 类型 */
const innerMap = computed<Map<string, QualificationValue>>({
  get: () => normalizeMap(props.modelValue as Map<string, QualificationValue> | string),
  set: (val) => {
    emit("update:modelValue", val);
    emit("updateQualificationValue", val);
  }
});

// ========== 外部 Input 展示 ==========
/** Input 展示文本：将已选资质按账户拼接 */
const displayText = computed(() => {
  const m = innerMap.value;
  if (m.size === 0) return "";
  return Array.from(m.values())
    .map((v) => v.qualificationName)
    .filter(Boolean)
    .join("、");
});

// 监听外部 modelValue 变化，确保显示实时同步
watch(
  () => props.modelValue,
  () => {
    // innerMap computed 会自动跟踪 props.modelValue 变化
    // 这里做一次强制刷新标记
  },
  { deep: true }
);

// ========== Drawer 内部数据 ==========
/** 抽屉内临时保存的本地资质 Map（确认后才同步到 innerMap） */
const localQualificationMap = ref<Map<string, QualificationValue>>(new Map());
/** 当前选中的账户 Tab */
const activeTabKey = ref<string>("");

// ========== vxe-grid 表格 ==========
/** 数据加载后需要恢复的已选行（用于 grid 就绪后回填选中状态） */
const pendingRestoreAccount = ref<string>("");

const gridOptions: VxeGridProps = {
  border: true,
  height: "500px",
  pagerConfig: { enabled: false },
  radioConfig: { highlight: true, trigger: "row" },
  columns: [
    { type: "radio", width: 50 },
    { field: "advertiseQualificationId", title: "投放资质ID", width: 160 },
    { field: "appCnName", title: "投放资质名称", minWidth: 160 },
    { field: "productName", title: "产品名称", minWidth: 140 },
    { field: "industry1Name", title: "行业", minWidth: 120 }
  ],
  proxyConfig: {
    autoLoad: true,
    ajax: {
      query: async () => {
        if (!activeTabKey.value) return { result: [] };
        const res = await adInvestmentApi.fetchGetAdInvestment({
          advertiserId: [activeTabKey.value],
        });
        return res;
      },
      querySuccess: async() => {
        await nextTick(() => restoreRadioRow());
      }
    }
  }
};

const gridEvents = {
  radioChange({ row }: { row: AdvertisingQualificationType }) {
    if (activeTabKey.value) {
      localQualificationMap.value.set(activeTabKey.value, {
        qualificationId: row.advertiseQualificationId,
        qualificationName: row.appCnName,
      });
    }
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions, gridEvents });

/** 将当前 activeTabKey 对应的已选行在表格中高亮 */
async function restoreRadioRow() {
  const $grid = gridApi.grid;
  if (!$grid) return;
  const accountId = activeTabKey.value;
  const saved = localQualificationMap.value.get(accountId);
  if (!saved) {
    $grid.clearRadioRow();
    return;
  }
  const tableData = $grid.getData() as AdvertisingQualificationType[] | undefined;
  const targetRow = tableData?.find(
    (row) => row.advertiseQualificationId === saved.qualificationId
  );
  if (targetRow) {
    $grid.setRadioRow(targetRow);
  } else {
    $grid.clearRadioRow();
  }
  pendingRestoreAccount.value = "";
}

// ========== Drawer ==========
const [Drawer, drawerApi] = useVbenDrawer({
  placement: "right",
  class: "w-[55vw]",
  closeOnPressEscape: true,
  async onOpenChange(isOpen) {
    if (isOpen) {
      // 从 innerMap 深拷贝到本地 Map
      localQualificationMap.value = new Map(innerMap.value);
      // 默认选中第一个账户（grid 会自动通过 proxy 加载数据）
      if (props.accountInfo.length > 0) {
        activeTabKey.value = props.accountInfo[0]!.localAdvertiserId;
      }
    }
  },
  async onConfirm() {
    // 校验所有账户都已选择资质
    const unselected = props.accountInfo.filter(
      (acc) => !localQualificationMap.value.has(acc.localAdvertiserId)
    );
    if (unselected.length > 0) {
      const names = unselected.map((a) => a.advertiserName).join("、");
      message.warning(`请为账户 [${names}] 选择投放资质`);
      return;
    }
    // 同步到 innerMap（触发 emit）
    innerMap.value = new Map(localQualificationMap.value);
    await drawerApi.close();
  },
  onCancel() {
    drawerApi.close();
  }
});

// ========== 监听 activeTabKey 变化：标记需要恢复的行 ==========
watch(activeTabKey, (newKey) => {
  if (newKey) {
    pendingRestoreAccount.value = newKey;
  }
});

/** 点击外部 Input 打开 Drawer */
function openDrawer() {
  drawerApi.open();
}
</script>

<template>
  <div class="ad-placement-qualification">
    <!-- 外部展示：只读 Input，点击弹出抽屉 -->
    <Input
      :value="displayText"
      placeholder="请选择投放资质"
      readonly
      @click="openDrawer"
    />

    <!-- 投放资质选择抽屉 -->
    <Drawer title="选择投放资质">
      <Tabs v-model:activeKey="activeTabKey" type="card">
        <TabPane
          v-for="account in accountInfo"
          :key="account.localAdvertiserId"
          :tab="`${account.advertiserName}(${account.localAdvertiserId})`"
        >
          <div v-if="activeTabKey === account.localAdvertiserId" class="mt-4">
            <Grid />
          </div>
        </TabPane>
      </Tabs>
    </Drawer>
  </div>
</template>

<style scoped lang="scss">
.ad-placement-qualification {
  width: 100%;

  :deep(.ant-input) {
    cursor: pointer;
  }
}
</style>
