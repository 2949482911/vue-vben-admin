<script lang="ts" setup>
import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { loadingPageApi } from '#/api';
import { TABLE_COMMON_COLUMNS } from '#/constants/locales';
import { trimObject } from '#/utils/trim';
import { useVbenModal, type VbenFormProps } from '@vben/common-ui';
import { Tag, RadioGroup, RadioButton, type RadioChangeEvent, message } from 'ant-design-vue';
import { ref } from 'vue';
import type { AccountInfo } from '../../creation';
import type { LandingPageData } from '#/api/models';
import type { VivoLandingPageData } from '../vivo';

const emit = defineEmits(['update:landingPageConfig']);

const { accountInfo } = defineProps({
  // 账户列表
  accountInfo: {
    type: Array<AccountInfo>,
    default: () => [],
  },
});

// 当前选中的账户 ID
const currentAccountId = ref<string>('');
// 落地页
const localLandingPage = ref<VivoLandingPageData>({
  landingPageConfig: {
    method: 'all',
  },
  data: new Map<string, Array<LandingPageData>>(),
});
// 内部维护一个临时变量，记录弹窗中所有的勾选对象
const tempSelectedRows = ref<LandingPageData[]>([]);

const formOptions: VbenFormProps = {
  schema: [
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          {
            label: 'vivo',
            value: 'vivo',
          },
        ],
        placeholder: '请选择',
      },
      fieldName: 'platform',
      label: '平台',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'name',
      label: '名称',
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
};

const gridOptions: VxeGridProps = {
  border: true,
  radioConfig: {
    highlight: true,
    trigger: 'row',
  },
  toolbarConfig: {
    zoom: true,
  },
  columns: [
    { type: 'radio', width: 50 },
    {
      field: 'name',
      title: '名称',
      width: 'auto',
    },
    {
      field: 'platform',
      title: '平台',
      width: 'auto',
    },
    {
      field: 'pageUrl',
      title: '详情页地址',
      width: 'auto',
      slots: { default: 'pageUrl' },
    },
    ...(TABLE_COMMON_COLUMNS as any[]).filter(
      (col) => col.type !== 'checkbox' && col.field !== 'options' && col.field !== 'left',
    ),
  ],
  height: '500px',
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, args) => {
        const params = trimObject(args);
        // 如果是按账户分配模式，注入当前账户 ID
        const accountParams =
          localLandingPage.value.landingPageConfig.method === 'account'
            ? { id: currentAccountId.value }
            : {};
        const res = await loadingPageApi.fetchGetLoadingPage({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...params,
          ...accountParams,
        });

        setTimeout(() => {
          const grid = gridApi.grid;
          if (grid && tempSelectedRows.value.length > 0) {
            const tableData = grid.getData();
            const targetRow = tableData.find((row) => row.id === tempSelectedRows?.value[0]?.id);
            if (targetRow) {
              grid.setRadioRow(targetRow);
            }
          }
        }, 100);

        return res;
      },
    },
  },
};

const gridEvents = {
  radioChange: () => updateTempRecords(),
};

// 抽取公共方法：获取当前 Grid 所有的勾选数据（含跨页和搜索结果）
function updateTempRecords() {
  const grid = gridApi.grid;
  if (!grid) return;

  const currentRows = grid.getRadioRecord();

  const allSelect = [currentRows];

  const uniqueMap = new Map();
  allSelect.forEach((item) => {
    if (item && item.id) {
      uniqueMap.set(item.id, item);
    }
  });

  tempSelectedRows.value = Array.from(uniqueMap.values());
}

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions, gridEvents });

async function changeMethod(e: RadioChangeEvent) {
  const value = e.target.value;
  tempSelectedRows.value = [];
  if (value === 'all') {
    currentAccountId.value = '';
    localLandingPage.value.data.clear();
  } else {
    currentAccountId.value = accountInfo[0]?.localAdvertiserId ?? '';
    const existing = localLandingPage.value.data.get(currentAccountId.value) || [];
    tempSelectedRows.value = [...existing];
  }
  const grid = gridApi.grid;
  if (grid) {
    await gridApi.grid.clearRadioRow();
  }
  await gridApi.query();
}

const [Modal, modalApi] = useVbenModal({
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = modalApi.getData();
      localLandingPage.value = {
        ...data,
        landingPageConfig: { ...data.landingPageConfig },
        // 通过 new Map(oldMap) 实现浅拷贝，Map 内部的键值对是新的，不会影响原 Map
        data: new Map(data.data),
      };
      if (localLandingPage.value.landingPageConfig.method === 'all') {
        currentAccountId.value = '';
        tempSelectedRows.value = localLandingPage.value.data.get('0') || [];
      } else {
        currentAccountId.value = accountInfo[0]?.localAdvertiserId ?? '';
        tempSelectedRows.value = localLandingPage.value.data.get(currentAccountId.value) || [];
      }

      // 触发第一次查询和回显
      setTimeout(() => {
        gridApi.query();
      }, 200);
    }
  },
  async onCancel() {
    await gridApi.grid.clearRadioRow();
    await modalApi.close();
  },
  async onConfirm() {
    const grid = gridApi.grid;
    if (!grid) return;

    // 确定时，确保最后停留的账户数据已同步
    const finalKey =
      localLandingPage.value.landingPageConfig.method === 'all' ? '0' : currentAccountId.value;
    if (finalKey) {
      if (tempSelectedRows.value.length > 0) {
        localLandingPage.value.data.set(finalKey, [...tempSelectedRows.value]);
      } else {
        localLandingPage.value.data.delete(finalKey);
      }
    }

    // 校验逻辑
    if (localLandingPage.value.landingPageConfig.method === 'account') {
      const unselected = accountInfo.filter(
        (acc) => !localLandingPage.value.data.get(acc.localAdvertiserId)?.length,
      );
      if (unselected.length > 0) {
        return message.warning(
          `请为账户 [${unselected.map((a) => a.advertiserName).join('、')}] 选择落地页`,
        );
      }
      localLandingPage.value.data.delete('0');
    }
    emit('update:landingPageConfig', { ...localLandingPage.value });
    await modalApi.close();
  },
});

/**账户点击/切换逻辑 */
const handleAccountClick = async (account: AccountInfo) => {
  const grid = gridApi.grid;
  if (!grid) return;
  // 1. 切换前：保存上一个账户的数据 (同样使用合并逻辑)
  if (currentAccountId.value && localLandingPage.value.landingPageConfig.method === 'account') {
    if (tempSelectedRows.value.length > 0) {
      localLandingPage.value.data.set(currentAccountId.value, [...tempSelectedRows.value]);
    } else {
      localLandingPage.value.data.delete(currentAccountId.value);
    }
  }
  // 2. 更新当前指向并查询回显
  currentAccountId.value = account.localAdvertiserId;

  // 3. 【关键】获取新账户的“存档”数据，并同步给临时变量
  const nextAccountData = localLandingPage.value.data.get(currentAccountId.value) || [];
  tempSelectedRows.value = [...nextAccountData];
  await gridApi.grid.clearRadioRow();
  await gridApi.query({});
};
</script>
<template>
  <Modal title="添加落地页" class="w-[80%]">
    <div class="mb-4">
      分配方式：
      <RadioGroup v-model:value="localLandingPage.landingPageConfig.method" @change="changeMethod">
        <RadioButton value="all">全部相同</RadioButton>
        <RadioButton value="account">按账户分配</RadioButton>
      </RadioGroup>
    </div>

    <div :class="localLandingPage.landingPageConfig.method === 'account' ? 'flex' : ''">
      <div
        v-if="localLandingPage.landingPageConfig.method === 'account'"
        class="w-[250px] flex-shrink-0 border-r pr-4 mr-4 overflow-y-auto max-h-[500px]"
      >
        <div
          v-for="item in accountInfo"
          :key="item.localAdvertiserId"
          :class="[
            'p-2 mb-2 cursor-pointer border rounded transition-all',
            // 基础状态判断
            localLandingPage.data.get(item.localAdvertiserId) ? 'has-packages' : 'no-packages',
            // 选中状态判断 (覆盖基础状态)
            currentAccountId === item.localAdvertiserId ? 'is-active' : '',
          ]"
          @click="handleAccountClick(item)"
        >
          <div class="flex justify-between items-center">
            <div class="text-sm font-medium">{{ item.advertiserName }}</div>
          </div>
          <div class="text-xs text-gray-400">ID: {{ item.localAdvertiserId }}</div>
        </div>
      </div>
      <div class="flex-1 overflow-hidden min-w-0">
        <Grid>
          <template #pageUrl="{ row }">
            {{ row.config.pageUrl }}
          </template>
          <template #status="{ row }">
            <Tag color="green" v-if="row.status === 1"> 启用 </Tag>
            <Tag v-else color="red">不启用</Tag>
          </template>
        </Grid>
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
/* 账户有选中数据时的状态（例如：蓝色文字或小圆点提示） */
.has-packages {
  background-color: #e6f4ff; /* 极浅蓝背景 */
  border-color: #91caff !important; /* 浅蓝色边框 */

  .text-sm {
    font-weight: bold;
    color: #1677ff; /* 蓝色文字 */
  }
}

/* 账户没有选中数据时的状态（置灰） */
.no-packages {
  background-color: #fafafa;
  border-color: #a2a2a2;
  border-style: dashed; /* 虚线 */
  opacity: 0.6;

  .text-sm {
    color: #272727;
  }
}

/* 当前正在操作的账户（优先级最高） */
.is-active {
  background-color: #bae0ff !important;
  border-color: #0958d9 !important;
  border-style: solid !important;
  opacity: 1 !important;

  .text-sm {
    color: #003eb3 !important;
  }
}
</style>
