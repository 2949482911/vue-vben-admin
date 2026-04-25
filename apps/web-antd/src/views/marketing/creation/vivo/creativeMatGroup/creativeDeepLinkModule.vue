<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';
import type { AccountInfo } from '../../creation';
import type { VivoDeepLinkData } from '../vivo';
import { ref, type PropType } from 'vue';
import { Input } from 'ant-design-vue';

const emit = defineEmits(['update:deepLink']);

const { accountInfo, deepLinkList } = defineProps({
  // 账户列表
  accountInfo: {
    type: Array<AccountInfo>,
    default: () => [],
  },
  deepLinkList: {
    type: Object as PropType<VivoDeepLinkData>,
    default: () => ({
      deepLinkConfig: { method: 'all' },
      data: new Map<string, string[]>(),
    }),
  },
});

// deepLink链接本地数据
const localdeepLinkList = ref<VivoDeepLinkData>({
  deepLinkConfig: {
    method: 'all',
  },
  data: new Map<string, Array<string>>(),
});
// 当前选中的账户 ID
const currentAccountId = ref<string>('');
const deepLinkStr = ref<string>('');

const [Modal, modalApi] = useVbenModal({
  async onOpenChange(isOpen) {
    if (isOpen) {
      const method = modalApi.getData() as unknown as string;
      localdeepLinkList.value.deepLinkConfig.method = method;

      // --- 核心修复：兼容处理父组件传来的 data ---
      const rawData = deepLinkList?.data;

      if (rawData) {
        // 如果已经是 Map，直接克隆
        if (rawData instanceof Map) {
          localdeepLinkList.value.data = new Map(rawData);
        } else {
          // 如果是普通对象 (Object)，转换回 Map
          localdeepLinkList.value.data = new Map(Object.entries(rawData));
        }
      } else {
        localdeepLinkList.value.data = new Map();
      }

      // 设置初始选中的账户
      currentAccountId.value = accountInfo[0]?.localAdvertiserId || '';

      // --- 回显逻辑 ---
      const targetKey = method === 'all' ? '0' : currentAccountId.value;
      const data = localdeepLinkList.value.data.get(targetKey);

      // 关键点：不仅要赋值给字符串，还要确保格式正确
      deepLinkStr.value = Array.isArray(data) && data.length > 0 ? String(data[0]) : '';
    }
  },
  async onConfirm() {
    // 点击确认前，确保当前输入框的内容已经同步到 Map
    saveCurrentInputToMap();
    emit('update:deepLink', localdeepLinkList.value);
    deepLinkStr.value = '';
    modalApi.close();
  },
  async onCancel() {
    deepLinkStr.value = '';
    modalApi.close();
  },
});

/**
 * 核心方法：将当前输入框的值保存到 Map 对应的 Key 中
 */
function saveCurrentInputToMap() {
  const method = localdeepLinkList.value.deepLinkConfig.method;
  const key = method === 'all' ? '0' : currentAccountId.value;

  if (key) {
    // 存储为数组格式 Array<String>
    localdeepLinkList.value.data.set(key, [deepLinkStr.value]);
  }
}

function handleAccountClick(account: AccountInfo) {
  // 1. 先保存上一个账户填写的链接
  saveCurrentInputToMap();

  // 2. 切换当前 ID
  currentAccountId.value = account.localAdvertiserId;

  // 3. 从 Map 中读取新账户已有的值并回显到输入框
  const existingData = localdeepLinkList.value.data.get(account.localAdvertiserId);
  deepLinkStr.value = existingData ? String(existingData[0]) : '';
}
</script>

<template>
  <Modal title="请填写deepLink链接" class="w-[40%]">
    <div :class="localdeepLinkList.deepLinkConfig.method === 'account' ? 'flex' : ''">
      <div
        v-if="localdeepLinkList.deepLinkConfig.method === 'account'"
        class="w-[250px] flex-shrink-0 border-r pr-4 mr-4 overflow-y-auto max-h-[500px]"
      >
        <div
          v-for="item in accountInfo"
          :key="item.localAdvertiserId"
          :class="[
            'p-2 mb-2 cursor-pointer border rounded transition-all',
            // 基础状态判断
            localdeepLinkList.data.get(item.localAdvertiserId)?.[0]
              ? 'has-packages'
              : 'no-packages',
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
      <div class="flex items-center">
        <div>deepLink链接：</div>
        <Input v-model:value="deepLinkStr" class="!w-[300px]" />
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
