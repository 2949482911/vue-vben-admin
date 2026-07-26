<script setup lang="ts" name="AwemeConfigDrawer">
import { computed, ref, watch } from 'vue';
import { Empty, message, Radio, RadioGroup, Select, Space, Table } from 'ant-design-vue';
import { useVbenDrawer } from '@vben/common-ui';
import { bytedanceAdvertisementApi } from '#/api/core/bytedance';
import type { BytedanceToolsAwemeAuthListList } from '#/api/models/bytedance';
import type { AccountInfo } from '#/views/marketing/creation/creation';
import type { AwemeConfigData, AwemeDistributionRule, AwemeMapping } from '#/views/marketing/creation/bytedance/bytedance';

const props = defineProps<{
  accountInfo: AccountInfo[];
}>();

const emit = defineEmits(['update:awemeConfig']);

/** 分配规则选项 */
const ruleOptions: Array<{ label: string; value: AwemeDistributionRule }> = [
  { label: '所有广告用一个抖音号', value: 'ALL_SAME' },
  { label: '每个账户选择一个抖音号', value: 'PER_ACCOUNT' },
  { label: '每个项目一个抖音号', value: 'PER_PROJECT' },
  { label: '每个广告一个抖音号', value: 'PER_AD' },
];

/** 当前编辑的规则 */
const localMethod = ref<AwemeDistributionRule>('ALL_SAME');

/** 单一选择模式（ALL_SAME / PER_PROJECT）的抖音号ID */
const singleAwemeId = ref<string | undefined>(undefined);

/** aweme_list 返回的抖音号列表 */
const awemeList = ref<Array<BytedanceToolsAwemeAuthListList>>([]);
const loadingAweme = ref(false);

/** 抖音号 Select options */
const awemeOptions = computed(() =>
  awemeList.value.map((a) => ({
    label: `${a.aweme_name} (${a.aweme_user_type === 'ENTERPRISE' ? '企业号' : '个人号'})`,
    value: a.aweme_id,
    awemeName: a.aweme_name,
  })),
);

/** 账户列表（去重） */
const accountList = computed(() => {
  const seen = new Set<string>();
  return props.accountInfo.filter((a) => {
    const key = a.localAdvertiserId;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
});

// ============ 表格映射行（PER_ACCOUNT / PER_AD） ============
interface MappingRow {
  targetId: string;
  targetName: string;
  selectedAwemeId: string | undefined;
}

const mappingRows = ref<MappingRow[]>([]);

function generateMappingRows(): MappingRow[] {
  const method = localMethod.value;
  if (method === 'ALL_SAME' || method === 'PER_PROJECT') {
    return [];
  }
  if (method === 'PER_ACCOUNT') {
    return accountList.value.map((acc) => ({
      targetId: acc.localAdvertiserId,
      targetName: acc.localAdvertiserName || acc.localAdvertiserId,
      selectedAwemeId: undefined,
    }));
  }
  // PER_AD
  return accountList.value.flatMap((acc) =>
    (acc.adGroupList || []).map((ag: any, agIdx: number) => ({
      targetId: `${acc.localAdvertiserId}-${agIdx}`,
      targetName: `${acc.localAdvertiserName || acc.localAdvertiserId} - 广告${agIdx + 1}`,
      selectedAwemeId: undefined,
    })),
  );
}

const tableColumns = [
  { title: '目标', dataIndex: 'targetName', key: 'targetName', width: '40%' },
  { title: '选择抖音号', key: 'awemeSelect', width: '60%' },
];

/** 快捷操作：统一选择 */
function applyToAll(awemeId: string | undefined) {
  mappingRows.value.forEach((row) => {
    row.selectedAwemeId = awemeId;
  });
}

function getAwemeName(awemeId: string | undefined): string {
  if (!awemeId) return '';
  return awemeList.value.find((a) => a.aweme_id === awemeId)?.aweme_name || '';
}

// ============ 抖音号列表拉取 ============
async function fetchAwemeList() {
  if (props.accountInfo.length === 0) {
    awemeList.value = [];
    return;
  }
  loadingAweme.value = true;
  try {
    const list = await bytedanceAdvertisementApi.fetchAewmeAuthList({
      advertiserId: props.accountInfo.map((a) => a.localAdvertiserId),
    });
    awemeList.value = (list || []).filter(
      (item) => item.auth_status === 'AUTHRIZED' && item.auth_type === 'AWEME_ACCOUNT',
    );
  } catch {
    message.warning('抖音号列表加载失败');
  } finally {
    loadingAweme.value = false;
  }
}

/** 恢复已有配置到编辑态 */
function restoreConfig(config: AwemeConfigData) {
  localMethod.value = config.config.method || 'ALL_SAME';

  if (localMethod.value === 'ALL_SAME' || localMethod.value === 'PER_PROJECT') {
    const items = config.data.get('0');
    singleAwemeId.value = items?.[0]?.awemeId || undefined;
  } else {
    const rows = generateMappingRows();
    rows.forEach((row) => {
      const items = config.data.get(row.targetId);
      if (items?.[0]) {
        row.selectedAwemeId = items[0].awemeId;
      }
    });
    mappingRows.value = rows;
  }
}

/** 规则切换时重建映射行 */
watch(localMethod, () => {
  singleAwemeId.value = undefined;
  mappingRows.value = generateMappingRows();
});

// ============ Drawer ============
const [Drawer, drawerApi] = useVbenDrawer({
  closeOnClickModal: false,
  class: 'w-[40vw]',
  closeOnPressEscape: true,
  onOpenChange: async (isOpen: boolean) => {
    if (isOpen) {
      await fetchAwemeList();
      const data: AwemeConfigData = drawerApi.getData() as AwemeConfigData;
      restoreConfig(data);
    }
  },
  onConfirm: () => {
    const method = localMethod.value;
    const resultData = new Map<string, AwemeMapping[]>();

    if (method === 'ALL_SAME' || method === 'PER_PROJECT') {
      if (!singleAwemeId.value) {
        message.warning('请选择一个抖音号');
        return;
      }
      resultData.set('0', [{ awemeId: singleAwemeId.value, awemeName: getAwemeName(singleAwemeId.value) }]);
    } else {
      const unselected = mappingRows.value.filter((r) => !r.selectedAwemeId);
      if (unselected.length > 0) {
        message.warning(`还有 ${unselected.length} 个未分配抖音号`);
        return;
      }
      mappingRows.value.forEach((row) => {
        resultData.set(row.targetId, [
          { awemeId: row.selectedAwemeId!, awemeName: getAwemeName(row.selectedAwemeId) },
        ]);
      });
    }

    emit('update:awemeConfig', {
      config: { method },
      data: resultData,
    });
    drawerApi.close();
  },
  onClosed() {
    drawerApi.close();
  },
  onCancel() {
    drawerApi.close();
  },
});
</script>

<template>
  <Drawer title="抖音号配置">
    <!-- 分配规则 -->
    <div class="mb-4">
      <span class="mr-3 text-sm font-medium text-gray-500">分配方式：</span>
      <RadioGroup v-model:value="localMethod">
        <div class="flex flex-col gap-1">
          <Radio v-for="opt in ruleOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </Radio>
        </div>
      </RadioGroup>
    </div>

    <!-- ALL_SAME / PER_PROJECT：单一选择器 -->
    <template v-if="localMethod === 'ALL_SAME' || localMethod === 'PER_PROJECT'">
      <div class="mb-2 text-sm text-gray-500">
        {{ localMethod === 'ALL_SAME' ? '所有广告' : '项目' }}将使用同一个抖音号：
      </div>
      <Select
        v-model:value="singleAwemeId"
        :options="awemeOptions"
        :loading="loadingAweme"
        placeholder="请选择抖音号"
        show-search
        option-filter-prop="label"
        class="w-full"
        allow-clear
      />
    </template>

    <!-- PER_ACCOUNT / PER_AD：表格映射 -->
    <template v-else>
      <!-- 快捷操作 -->
      <Space class="mb-3 w-full">
        <span class="text-sm text-gray-500">快捷操作：</span>
        <Select
          :options="awemeOptions"
          :loading="loadingAweme"
          placeholder="统一选择抖音号"
          show-search
          option-filter-prop="label"
          class="w-64"
          allow-clear
          @change="applyToAll"
        />
      </Space>

      <Table
        :columns="tableColumns"
        :data-source="mappingRows"
        :pagination="false"
        size="small"
        row-key="targetId"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'awemeSelect'">
            <Select
              v-model:value="record.selectedAwemeId"
              :options="awemeOptions"
              :loading="loadingAweme"
              placeholder="请选择抖音号"
              show-search
              option-filter-prop="label"
              class="w-full"
              allow-clear
            />
          </template>
        </template>
      </Table>
    </template>

    <template v-if="awemeList.length === 0 && !loadingAweme">
      <Empty description="暂无可用抖音号，请检查账户授权状态" class="mt-8" />
    </template>
  </Drawer>
</template>
