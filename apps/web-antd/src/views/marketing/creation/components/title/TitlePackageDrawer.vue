<script setup lang="ts">

import {useVbenDrawer} from '@vben/common-ui';
import {useVbenVxeGrid, type VxeGridProps} from '#/adapter/vxe-table';
import {titlePackApi, projectApi} from '#/api';
import {ref} from 'vue';
import {RuleMethod} from '#/views/marketing/creation/creation_enums';
import type {AccountInfo, TitlePackageConfigData} from '#/views/marketing/creation/creation';
import type {TitlePackageItem, GetTitlePackType} from '#/api/models';
import {trimObject} from '#/utils/trim';
import {RadioGroup, RadioButton, type RadioChangeEvent, Tag, message, Tabs, TabPane} from 'ant-design-vue';
import {ACTIVE_PLATFORM, TABLE_COMMON_COLUMNS} from '#/constants/locales';

const props = defineProps<{
  accountInfo: AccountInfo[];
  platform?: string;
}>();

const emit = defineEmits(['update:titlePackage']);

// 当前选中账户 ID
const currentAccountId = ref<string>('');
// 临时选中行（跨页）
const tempSelectedRows = ref<TitlePackageItem[]>([]);
// 分配方式
const distributionMethod = ref<RuleMethod>(RuleMethod.ALL);
// 本地标题包数据
const localTitlePackage = ref<TitlePackageConfigData>({
  config: {method: RuleMethod.ALL},
  data: new Map<string, TitlePackageItem[]>(),
});

// 账户创意组映射（按账户分配模式）
const accountTitlePackages = ref<Map<string, TitlePackageItem[]>>(new Map());

// Grid 表单配置
const formOptions = {
  schema: [
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: ACTIVE_PLATFORM,
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
      fieldName: 'title',
      label: '标题名字',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        showSearch: true,
        placeholder: '请选择',
        api: async (params: any) => {
          return await projectApi.fetchProjectList(params);
        },
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        params: {page: 1, pageSize: 1000},
        valueField: 'id',
        labelField: 'name',
        resultField: 'items',
      },
      fieldName: 'projectId',
      label: '产品',
    },
  ],
  showCollapseButton: false,
  submitOnEnter: false,
};

// Grid 配置
const gridOptions: VxeGridProps = {
  border: true,
  rowConfig: {keyField: 'id'},
  checkboxConfig: {highlight: true, reserve: true, trigger: 'row'},
  toolbarConfig: {custom: true, refresh: true, zoom: true},
  columns: [
    {field: 'title', title: '标题名称', width: 'auto'},
    {field: 'projectName', title: '绑定产品', width: 'auto'},
    {field: 'platform', title: '平台', width: 'auto'},
    ...(TABLE_COMMON_COLUMNS as any[]).filter((col: any) => col.field !== 'options'),
  ],
  height: '500px',
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({page}, args) => {
        const params = trimObject(args) as GetTitlePackType;
        // 按账户分配模式注入当前账户 ID
        if (distributionMethod.value === RuleMethod.ACCOUNT) {
          params.localAdvertiserId = currentAccountId.value;
        }
        const res = await titlePackApi.fetchGetTitlePack({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...params,
        });
        // 恢复勾选状态
        setTimeout(() => {
          const grid = gridApi.grid;
          if (grid && tempSelectedRows.value.length > 0) {
            const ids = tempSelectedRows.value.map(item => item.id);
            grid.setCheckboxRowKey(ids, true);
          }
        }, 100);
        return res;
      },
    },
  },
};

// Grid 事件
const gridEvents = {
  checkboxChange: () => updateTempRecords(),
  checkboxAll: () => updateTempRecords(),
};

const [Grid, gridApi] = useVbenVxeGrid({formOptions, gridOptions, gridEvents});

// 更新临时选中记录（跨页）
function updateTempRecords() {
  const grid = gridApi.grid;
  if (!grid) return;
  const reserveRows = grid.getCheckboxReserveRecords();
  const currentRows = grid.getCheckboxRecords();
  const allSelect = [...reserveRows, ...currentRows];
  const uniqueMap = new Map();
  allSelect.forEach(item => {
    if (item && item.id) {
      uniqueMap.set(item.id, item);
    }
  });
  tempSelectedRows.value = Array.from(uniqueMap.values());
}

// 分配方式切换
function allocationMethodChange(e: RadioChangeEvent) {
  tempSelectedRows.value = [];
  if (e.target.value === RuleMethod.ACCOUNT) {
    currentAccountId.value = String(props.accountInfo[0]?.localAdvertiserId) || '';
    const existing = accountTitlePackages.value.get(currentAccountId.value) || [];
    tempSelectedRows.value = [...existing];
  } else {
    currentAccountId.value = '';
    tempSelectedRows.value = localTitlePackage.value.data.get('0') || [];
  }
  gridApi.grid?.clearCheckboxRow();
  gridApi.grid?.clearCheckboxReserve();
  gridApi.query();
}

// 账户点击/切换
async function handleAccountClick(account: AccountInfo) {
  const grid = gridApi.grid;
  if (!grid) return;
  // 保存上一个账户的数据
  if (currentAccountId.value && distributionMethod.value === RuleMethod.ACCOUNT) {
    if (tempSelectedRows.value.length > 0) {
      accountTitlePackages.value.set(currentAccountId.value, [...tempSelectedRows.value]);
    } else {
      accountTitlePackages.value.delete(currentAccountId.value);
    }
  }
  // 更新当前指向
  currentAccountId.value = String(account.localAdvertiserId);
  // 恢复新账户的存档数据
  const nextData = accountTitlePackages.value.get(currentAccountId.value) || [];
  tempSelectedRows.value = [...nextData];
  await grid.clearCheckboxRow();
  await grid.clearCheckboxReserve();
  await gridApi.query({});
}

// 获取当前账户名称
function getAccountName(account: AccountInfo): string {
  return `${account.advertiserName}(${account.localAdvertiserId})`;
}

// 抽屉
const [Drawer, drawerApi] = useVbenDrawer({
  closeOnClickModal: false,
  size: 'large',
  class: 'w-[75vw]',
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = drawerApi.getData();
      if (data) {
        distributionMethod.value = data.config?.method || RuleMethod.ALL;
        tempSelectedRows.value = [];
        accountTitlePackages.value.clear();

        // 恢复数据
        if (data.data instanceof Map) {
          if (data.config?.method === RuleMethod.ACCOUNT) {
            // 按账户分配模式：恢复各账户标题包
            data.data.forEach((items: TitlePackageItem[], accountId: string) => {
              accountTitlePackages.value.set(accountId, items || []);
            });
            if (props.accountInfo.length > 0) {
              currentAccountId.value = String(props.accountInfo[0].localAdvertiserId);
              tempSelectedRows.value = accountTitlePackages.value.get(currentAccountId.value) || [];
            }
          } else {
            // 全账户复用模式：恢复 key='0' 的数据
            localTitlePackage.value.data.set('0', data.data.get('0') || []);
            tempSelectedRows.value = data.data.get('0') || [];
          }
        }
      }
      // 触发查询
      setTimeout(() => {
        gridApi.query();
      }, 200);
    }
  },
  async onConfirm() {
    // 保存最后停留账户的数据
    if (distributionMethod.value === RuleMethod.ACCOUNT) {
      if (currentAccountId.value) {
        if (tempSelectedRows.value.length > 0) {
          accountTitlePackages.value.set(currentAccountId.value, [...tempSelectedRows.value]);
        } else {
          accountTitlePackages.value.delete(currentAccountId.value);
        }
      }
      // 校验每个账户都有标题包
      const unselected = props.accountInfo.filter(
        acc => !accountTitlePackages.value.get(String(acc.localAdvertiserId))?.length,
      );
      if (unselected.length > 0) {
        return message.warning(`请为账户 [${unselected.map(a => a.advertiserName).join('、')}] 选择标题包`);
      }
    } else {
      // 全账户复用模式：保存 key='0'
      localTitlePackage.value.data.set('0', [...tempSelectedRows.value]);
    }

    // 构建返回数据
    const resultData = new Map<string, TitlePackageItem[]>();
    if (distributionMethod.value === RuleMethod.ACCOUNT) {
      accountTitlePackages.value.forEach((items, key) => {
        resultData.set(key, items);
      });
    } else {
      resultData.set('0', localTitlePackage.value.data.get('0') || []);
    }

    emit('update:titlePackage', {
      config: {method: distributionMethod.value},
      data: resultData,
    });
    await drawerApi.close();
  },
  onCancel() {
    drawerApi.close();
  },
});
</script>

<template>
  <Drawer title="选择标题包">
    <div class="mb-4">
      <span class="font-medium">分配方式：</span>
      <RadioGroup v-model:value="distributionMethod" @change="allocationMethodChange">
        <RadioButton :value="RuleMethod.ALL">全账户复用</RadioButton>
        <RadioButton :value="RuleMethod.ACCOUNT">按账户分配</RadioButton>
      </RadioGroup>
    </div>

    <!-- 按账户分配模式：Tabs 展示各账户 -->
    <Tabs v-if="distributionMethod === RuleMethod.ACCOUNT" v-model:activeKey="currentAccountId" @change="handleAccountClick">
      <TabPane v-for="account in accountInfo" :key="String(account.localAdvertiserId)" :tab="getAccountName(account)">
        <Grid>
          <template #status="{ row }">
            <Tag color="green" v-if="row.status === 1">启用</Tag>
            <Tag v-else color="red">不启用</Tag>
          </template>
        </Grid>
      </TabPane>
    </Tabs>

    <!-- 全账户复用模式：直接展示 Grid -->
    <div v-else>
      <Grid>
        <template #status="{ row }">
          <Tag color="green" v-if="row.status === 1">启用</Tag>
          <Tag v-else color="red">不启用</Tag>
        </template>
      </Grid>
    </div>
  </Drawer>
</template>

<style scoped lang="scss">
</style>
