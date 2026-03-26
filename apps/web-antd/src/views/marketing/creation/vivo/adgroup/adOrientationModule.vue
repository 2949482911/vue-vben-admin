<script lang="ts" setup>
import {useVbenVxeGrid, type VxeGridProps} from '#/adapter/vxe-table';
import {advertiserApi, targetedPackageApi} from '#/api';
import {ACTIVE_PLATFORM} from '#/constants/locales';
import {trimObject} from '#/utils/trim';
import {useVbenModal, type VbenFormProps} from '@vben/common-ui';
import {RadioButton, RadioGroup, Tag, message} from 'ant-design-vue';
import {ref} from 'vue';
import type {VivoAudienceData} from "#/views/marketing/creation/vivo/vivo";
import type {TargetedPackageTypeItem} from "#/api/models";
import type {AccountInfo} from "#/views/marketing/creation/creation";
import type { RadioChangeEvent } from 'ant-design-vue';

const emit = defineEmits(['update:orientation']);

const formOptions: VbenFormProps = {
  schema: [
    {
      component: "Select",
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
      fieldName: 'name',
      label: '定向包名称',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        showSearch: true,
        placeholder: '请选择',
        api: async (params: any) => {
          return await advertiserApi.fetchAdvertiserList(params);
        },
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        params: {
          page: 1,
          pageSize: 10000,
        },
        valueField: 'advertiserId',
        labelField: 'advertiserName',
        resultField: 'items',
      },
      fieldName: 'platformAdvertiserId',
      label: '平台开发者',
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
    reserve: true, // 开启 VxeGrid 的保留勾选功能
    trigger: 'row',
  },
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
  columns: [
    {type: 'checkbox', width: 50},
    {field: 'id', title: '账户ID'},
    {
      field: 'name',
      title: '定向包名称',
    },
    {
      field: 'platformAdvertiserName',
      title: '广告主名称',
    },
    {
      field: 'platform',
      title: '平台',
    },
    {
      field: 'remark',
      title: '备注',
    }
  ],
  height: '500px',
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({page}, args) => {
        const params = trimObject(args);
        // 如果是按账户分配模式，注入当前账户 ID
        const accountParams = (localAudience.value.audienceConfig.method === 'account')
          // ? {}
          ? { platformAdvertiserId: currentAccountId.value } //测试功能中，后面正式放出来
          : {};

        return await targetedPackageApi.fetchGetTitleTargetedPackage({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...params,
          ...accountParams,
        });
      },
    },
  },
};
const [Grid, gridApi] = useVbenVxeGrid({formOptions, gridOptions});

const { accountInfo } = defineProps({
  // 账户列表
  accountInfo: {
    type: Array<AccountInfo>,
    default: () => ([])
  },
})

// 当前选中的账户 ID
const currentAccountId = ref<string>('');
// 定向包
const localAudience = ref<VivoAudienceData>({
  audienceConfig: {
    method: 'all'
  },
  data: new Map<string, Array<TargetedPackageTypeItem>>()
});

/**
 * 分配方式改变
 * @param value
 */
async function changeMethod(e: RadioChangeEvent) {
  const value = e.target.value;
  if (value === 'all') {
    currentAccountId.value = "";
    localAudience.value.data.clear();
    // localAudience.value.data = new Map<string, Array<TargetedPackageTypeItem>>();
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

// 定向包组件中的回显方法
async function syncGridCheckbox(records: Array<TargetedPackageTypeItem>) {
  const grid = gridApi.grid;
  if (!grid) return;

  await grid.clearCheckboxRow();
  await grid.clearCheckboxReserve();
  // 提取 ID 数组
  const ids = records.map(item => item.id);
  if (ids.length > 0) {
    await grid.setCheckboxRowKey(ids, true);
  }
}

const [Modal, modalApi] = useVbenModal({
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = modalApi.getData();
      localAudience.value = {
        ...data,
        audienceConfig: { ...data.audienceConfig },
        // 通过 new Map(oldMap) 实现浅拷贝，Map 内部的键值对是新的，不会影响原 Map
        data: new Map(data.data) 
      };
      // localAudience.value = data as VivoAudienceData;
      if (localAudience.value.audienceConfig.method == "all") {
        const dataList: Array<TargetedPackageTypeItem> = localAudience.value.data.get("0") || [];
        setTimeout(async()=>{
          await syncGridCheckbox(dataList);
        },2000)
      } else {
        currentAccountId.value = accountInfo[0]?.localAdvertiserId ?? '';
        const dataList: Array<TargetedPackageTypeItem> = localAudience.value.data.get(currentAccountId.value) || [];
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
    const finalRows: Array<TargetedPackageTypeItem> = Array.from(
      new Map(allSelected.map((item: TargetedPackageTypeItem) => [item.id, item])).values()
    );

    if (localAudience.value.audienceConfig.method === 'all') {
      // --- 模式：全部相同 ---
      // 清空整个 Map，确保只保留 key 为 "0" 的数据
      localAudience.value.data.clear();
      // 直接将全量选中的数据存入 key 为 "0" 的位置
      localAudience.value.data.set("0", finalRows);
    } else {
      // --- 模式：按账户分配 ---
      // A. 首先：必须同步“最后停留的那个账户”的勾选状态到 map 中
      if (currentAccountId.value) {
        if (finalRows.length > 0) {
          // 更新 Map 中当前账户的数据
          localAudience.value.data.set(currentAccountId.value, finalRows);
        } else {
          localAudience.value.data.delete(currentAccountId.value);
        }
      }
      // 找出所有在 accountInfo 中存在，但在 localAudience.data 中没有数据的账户
      const unselectedAccounts = accountInfo.filter(acc => {
        const data = localAudience.value.data.get(acc.localAdvertiserId);
        return !data || data.length === 0;
      });

      if (unselectedAccounts.length > 0) {
        // 提示用户哪些账户没选
        const names = unselectedAccounts.map(a => a.advertiserName).join('、');
        message.warning(`请为账户 [${names}] 选择定向包`);
        return;
      }
      //清理掉可能存在的 "0" 键（防止从全部相同切换过来后残留冗余数据）
      localAudience.value.data.delete("0");
    }
    emit('update:orientation', {...localAudience.value});
    await grid.clearCheckboxRow();
    await grid.clearCheckboxReserve();
    await modalApi.close();
  }
});

/**账户点击/切换逻辑 */
const handleAccountClick = async (account: AccountInfo) => {
  const grid = gridApi.grid;
  if (!grid) return;
  // 1. 切换前：保存上一个账户的数据 (同样使用合并逻辑)
  if (currentAccountId.value && localAudience.value.audienceConfig.method === 'account') {
    const allSelected = [...grid.getCheckboxReserveRecords(), ...grid.getCheckboxRecords()];
    const finalRows: Array<TargetedPackageTypeItem> = Array.from(new Map(allSelected.map(item => [item.id, item])).values());
    if (finalRows.length > 0) {
      localAudience.value.data.set(currentAccountId.value, finalRows);
    } else {
      localAudience.value.data.delete(currentAccountId.value);
    }
  }
  // 2. 更新当前指向并查询回显
  currentAccountId.value = account.localAdvertiserId;
  await gridApi.grid.clearCheckboxRow();
  await gridApi.grid.clearCheckboxReserve();
  const dataList: Array<TargetedPackageTypeItem> = localAudience.value.data.get(currentAccountId.value) || [];
  await syncGridCheckbox(dataList)
};

</script>
<template>
  <div>
    <Modal title="选择定向包" class="w-[80%]">
      <div class="mb-4">分配方式：
        <RadioGroup v-model:value="localAudience.audienceConfig.method" @change="changeMethod">
          <RadioButton value="all">全部相同</RadioButton>
          <RadioButton value="account">按账户分配</RadioButton>
        </RadioGroup>
      </div>

      <div :class="localAudience.audienceConfig.method === 'account' ? 'flex' : ''">
        <div v-if="localAudience.audienceConfig.method === 'account'"
             class="w-[250px] flex-shrink-0 border-r pr-4 mr-4 overflow-y-auto max-h-[500px]">
          <div
            v-for="(item) in accountInfo"
            :key="item.localAdvertiserId"
            :class="[
              'p-2 mb-2 cursor-pointer border rounded transition-all',
              // 基础状态判断
              localAudience.data.get(item.localAdvertiserId) ? 'has-packages' : 'no-packages',
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
  </div>
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
