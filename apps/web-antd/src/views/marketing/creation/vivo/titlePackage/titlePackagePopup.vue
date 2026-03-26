<script lang="ts" setup>
import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { projectApi, titlePackApi } from '#/api';
import { ACTIVE_PLATFORM, TABLE_COMMON_COLUMNS } from '#/constants/locales';
import { trimObject } from '#/utils/trim';
import { useVbenModal, type VbenFormProps } from '@vben/common-ui';
import { Tag, RadioGroup, RadioButton, type RadioChangeEvent, message } from 'ant-design-vue';
import { nextTick, ref } from 'vue';
import type { AccountInfo } from '../../creation';
import type { TitlePackageItem } from '#/api/models';
import type { VivoTitlePackageData } from '../vivo';

const emit = defineEmits(['update:titlePackageConfig']);

const { accountInfo } = defineProps({
  // 账户列表
  accountInfo: {
    type: Array<AccountInfo>,
    default: () => ([])
  },
})

const formOptions: VbenFormProps = {
  schema: [
    {
      component: "Select",
      componentProps: {
        allowClear: true,
        options:ACTIVE_PLATFORM,
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
        api: async (params:any) => {
          return await projectApi.fetchProjectList(params);
        },
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        params: {
          page: 1,
          pageSize: 1000,
        },
        valueField: 'id',
        labelField: 'name',
        resultField: 'items',
      },
      fieldName: 'projectId',
      label: '产品',
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
}

const gridOptions: VxeGridProps = {
  border: true,
  rowConfig: {
    keyField: 'id',
  },
  checkboxConfig: {
    highlight: true,
    reserve: true,
    trigger: 'row',
  },
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
  columns: [
    {
      field: 'title',
      title: '标题名称',
      width: 'auto',
    },
    {
      field: 'projectName',
      title: '绑定产品',
      width: 'auto',
    },
    {
      field: 'platform',
      title: '平台',
      width: 'auto',
    },
    ...(TABLE_COMMON_COLUMNS as any[]).filter(col => col.field !== 'options'),
  ],
  height: '500px',
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({page}, args) => {
        const params = trimObject(args);
        // 如果是按账户分配模式，注入当前账户 ID
        const accountParams = (localTitlePackage.value.titlePackageConfig.method === 'account')
        // ? {} 
        ? { platformAdvertiserId: currentAccountId.value } //测试功能中，后面正式放出来
        : {};
        return await titlePackApi.fetchGetTitlePack({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...params,
          ...accountParams,
        });
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

// 当前选中的账户 ID
const currentAccountId = ref<string >('');
// 标题包
const localTitlePackage = ref<VivoTitlePackageData>({
  titlePackageConfig: {
    method: 'all'
  },
  data: new Map<string, Array<TitlePackageItem>>()
});

async function changeMethod(e: RadioChangeEvent) {
  const value = e.target.value;
  if (value === 'all') {
    currentAccountId.value = "";
    localTitlePackage.value.data.clear();
  } else {
    currentAccountId.value = accountInfo[0]?.localAdvertiserId ?? '';
  }
  const grid = gridApi.grid;
  if (grid) {
    await gridApi.grid.clearCheckboxRow();
    await gridApi.grid.clearCheckboxReserve();
  }
  await gridApi.query();
}

// 标题包组件中的回显方法
const syncGridCheckbox = (records: TitlePackageItem[]) => {
  const grid = gridApi.grid;
  if (!grid) return;

  // 1. 先彻底清空（非常重要，防止上个账户的数据残留）
  grid.clearCheckboxRow();
  grid.clearCheckboxReserve();

  // 2. 提取 ID 数组
  const ids = records.map(item => item.id);

  // 3. 使用你验证成功的 setCheckboxRowKey 方式
  if (ids.length > 0) {
    // 稍微给一点延迟，确保表格数据渲染完成
    nextTick(() => {
       grid.setCheckboxRowKey(ids, true);
    });
  }
};

const [Modal,modalApi] = useVbenModal({
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = modalApi.getData();
      localTitlePackage.value = {
        ...data,
        titlePackageConfig: { ...data.titlePackageConfig },
        // 通过 new Map(oldMap) 实现浅拷贝，Map 内部的键值对是新的，不会影响原 Map
        data: new Map(data.data) 
      };
      // localTitlePackage.value = data as VivoTitlePackageData;
      if (localTitlePackage.value.titlePackageConfig.method === 'all') {
        const dataList:Array<TitlePackageItem> = localTitlePackage.value.data.get('0') || [];
        setTimeout(async()=>{
          await syncGridCheckbox(dataList);
        },2000)
      } else {
        currentAccountId.value = accountInfo[0]?.localAdvertiserId ?? '';
        const dataList: Array<TitlePackageItem> = localTitlePackage.value.data.get(currentAccountId.value) || [];
        setTimeout(async()=>{
          await syncGridCheckbox(dataList);
        },2000)
      }
    }
  },
  async onCancel() {
    await gridApi.grid.clearCheckboxRow();
    await modalApi.close();
  },
  async onConfirm() {
    const grid = gridApi.grid;
    if (!grid) return;

    // 1. 获取当前时刻全量选中的行（合并当前页 + 保留区）
    const reserveRows = grid.getCheckboxReserveRecords(); // 非当前页选中的数据
    const currentRows = grid.getCheckboxRecords();        // 当前页选中的数据
    const allSelected = [...reserveRows, ...currentRows];

    // 2. 通过 Map 进行 ID 去重，确保数据唯一
    const finalRows = Array.from(
      new Map(allSelected.map((item: TitlePackageItem) => [item.id, item])).values()
    );
    
    if(localTitlePackage.value.titlePackageConfig.method === 'all'){
      localTitlePackage.value.data.clear();
      localTitlePackage.value.data.set('0',finalRows)
    }else{
      if(currentAccountId.value){
        if (finalRows.length > 0) {
          // 更新 Map 中当前账户的数据
          localTitlePackage.value.data.set(currentAccountId.value, finalRows);
        } else {
          localTitlePackage.value.data.delete(currentAccountId.value);
        }
      }
      // 找出 accountInfo 列表中，在 Map 里没有对应数据的账户
      const missingAccounts = accountInfo.filter(acc => {
        const data = localTitlePackage.value.data.get(acc.localAdvertiserId);
        return !data || data.length === 0;
      });

      if (missingAccounts.length > 0) {
        const names = missingAccounts.map(a => a.advertiserName).join('、');
        message.warning(`请为账户 [${names}] 选择标题包`);
        return;
      }
      localTitlePackage.value.data.delete("0");
    }
    emit('update:titlePackageConfig', { ...localTitlePackage.value }); 
    grid.clearCheckboxRow();
    grid.clearCheckboxReserve();
    await modalApi.close();
  }
});

/**账户点击/切换逻辑 */
const handleAccountClick = async (account: AccountInfo) => {
  const grid = gridApi.grid;
  if (!grid) return;

  // 1. 切换前：保存上一个账户的数据 (同样使用合并逻辑)
  if (currentAccountId.value && localTitlePackage.value.titlePackageConfig.method === 'account') {
    const allSelected = [...grid.getCheckboxReserveRecords(), ...grid.getCheckboxRecords()];
    const finalRows = Array.from(new Map(allSelected.map(item => [item.id, item])).values());
    
    if (finalRows.length > 0) {
      localTitlePackage.value.data.set(currentAccountId.value, finalRows);
    } else {
      localTitlePackage.value.data.delete(currentAccountId.value);
    }
  }
  // 2. 更新当前指向并查询回显
  currentAccountId.value = account.localAdvertiserId;
  await gridApi.grid.clearCheckboxRow();
  await gridApi.grid.clearCheckboxReserve();
  const dataList: Array<TitlePackageItem> = localTitlePackage.value.data.get(currentAccountId.value) || [];
  await syncGridCheckbox(dataList); 
};



</script>
<template>
  <Modal title="添加标题包" class="w-[80%]">
    <div class="mb-4">分配方式：
      <RadioGroup v-model:value="localTitlePackage.titlePackageConfig.method" @change="changeMethod">
        <RadioButton value="all">全部相同</RadioButton>
        <RadioButton value="account">按账户分配</RadioButton>
      </RadioGroup>
    </div>

    <div :class="localTitlePackage.titlePackageConfig.method === 'account' ? 'flex' : ''">
      <div v-if="localTitlePackage.titlePackageConfig.method === 'account'" 
           class="w-[250px] flex-shrink-0 border-r pr-4 mr-4 overflow-y-auto max-h-[500px]">
        <div 
          v-for="(item) in accountInfo" 
          :key="item.localAdvertiserId"
          :class="[
            'p-2 mb-2 cursor-pointer border rounded transition-all',
            // 基础状态判断
            localTitlePackage.data.get(item.localAdvertiserId) ? 'has-packages' : 'no-packages',
            // 选中状态判断 (覆盖基础状态)
            currentAccountId === item.localAdvertiserId ? 'is-active' : ''
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
          <template #status="{row}">
              <Tag color="green" v-if="row.status === 1">
                启用
              </Tag>
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
