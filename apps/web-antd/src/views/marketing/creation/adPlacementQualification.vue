<script lang="ts" setup>
import {useVbenVxeGrid, type VxeGridProps} from '#/adapter/vxe-table';
import {adInvestmentApi} from '#/api';
import {useVbenModal} from '@vben/common-ui';
import {ref,nextTick} from 'vue';
import type {AccountInfo} from "#/views/marketing/creation/creation";
import type { AdvertisingQualificationType } from './vivo/projectEnum';
import type { QualificationValue } from './vivo/vivo';
import { message } from 'ant-design-vue';

// 当前选中的账户 ID
const currentAccountId = ref<string>('');
const localAdvertiserQualification = ref<Map<string, QualificationValue>>(new Map());
const { accountInfo, advertiserQualification } = defineProps({
  // 账户列表
  accountInfo: {
    type: Array<AccountInfo>,
    default: () => ([])
  },
  advertiserQualification:{
    type: Object,
    default: new Map<string, QualificationValue>()
  }
})

const gridOptions: VxeGridProps = {
  border: true,
  radioConfig: {
    highlight: true,
    trigger: 'row'
  },
  columns: [
    {type: 'radio', width: 50},
    {field: 'advertiseQualificationId', title: '投放资质ID'},
    {
      field: 'appCnName',
      title: '投放资质名称',
    }
  ],
  height: '500px',
  pagerConfig: {
    enabled: false
  },
  proxyConfig: {
    ajax: {
      query: async () => {
        return await adInvestmentApi.fetchGetAdInvestment({
          advertiserId:[currentAccountId.value]
        });
      },
    },
  },
};

const gridEvents = {
  radioChange(newValue:any){
    if (currentAccountId.value) {
      // 更新 Map
      localAdvertiserQualification.value.set(currentAccountId.value, {
        qualificationId: newValue.row.advertiseQualificationId,
        qualificationName: newValue.row.appCnName
      });
    }
  }
}
const [Grid, gridApi] = useVbenVxeGrid({ gridOptions, gridEvents });

const [Modal, modalApi] = useVbenModal({
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      if(accountInfo.length>0){
        await initSelection(advertiserQualification);
        await nextTick();
        await handleAccountClick(accountInfo[0]!);
      }
    }
  },
  async onCancel() {
    localAdvertiserQualification.value = new Map()
    await modalApi.close();
  },
  async onConfirm() {
    // 检查 Map 中是否每个 ID 都有对应的记录
    const unselectedAccounts = accountInfo.filter(acc => {
      const data = localAdvertiserQualification.value.get(acc.localAdvertiserId);
      // 判断逻辑：如果没有数据，或者数据里没有选中的资质 ID
      return !data || !data.qualificationId;
    });

    //如果存在未选择的账户，进行拦截
    if (unselectedAccounts.length > 0) {
      const names = unselectedAccounts.map(acc => acc.advertiserName).join('、');
      message.warning(`请为账户 [${names}] 选择广告投放资质`);
      return; 
    }
    //校验通过，提交数据并关闭
    await modalApi.setData(localAdvertiserQualification.value);
    await modalApi.close();
  }
});

/** 初始回显逻辑 - 直接接收对象结构 */
async function initSelection(existingData: Record<string, QualificationValue> | Map<string, QualificationValue>) {
  // 1. 创建新的 Map 实例
  const newMap = new Map<string, QualificationValue>();
  // 2. 传进来的是 Map (父组件传的是 Proxy 包装后的 Map)
  if (existingData instanceof Map) {
    existingData.forEach((value, key) => {
      newMap.set(key, value);
    });
  } 
  // 4. 赋值给响应式变量
  localAdvertiserQualification.value = newMap;
}

/**账户点击/切换逻辑 */
const handleAccountClick = async (account: AccountInfo) => {
  
  currentAccountId.value = account.localAdvertiserId;
  const $grid = gridApi.grid;
  if (!$grid) return;
  // 1. 刷新数据
  await gridApi.reload();
  
  // 获取已选的对象
  const savedData = localAdvertiserQualification.value.get(account.localAdvertiserId);

  await nextTick();
  if (savedData) {
    const tableData = $grid.getData();
    
    const targetRow = tableData?.find((row: AdvertisingQualificationType) => row.advertiseQualificationId === savedData.qualificationId);
    if (targetRow) {
      $grid.setRadioRow(targetRow);
    }
  } else {
    await gridApi.grid?.clearRadioRow();
  }
  
};

</script>
<template>
  <div>
    <Modal title="选择广告投放资质ID" class="w-[50%]">
      <div class='flex'>
        <div class="w-[250px] flex-shrink-0 border-r pr-4 mr-4 overflow-y-auto max-h-[500px]">
          <div
            v-for="(item) in accountInfo"
            :key="item.localAdvertiserId"
            :class="[
              'p-2 mb-2 cursor-pointer border rounded transition-all',
              // 逻辑：如果 Map 里有这个账户的 Key，说明已选，走高亮/普通样式；否则置灰
              localAdvertiserQualification.has(item.localAdvertiserId) ? 'has-packages' : 'no-packages',
              // 当前选中操作的账户
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
          <Grid></Grid>
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
