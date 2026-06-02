<script setup lang="ts" name="AdvertisingGroupModule">
import { Button, Card, Divider, message, Tooltip } from 'ant-design-vue';
import { useVbenDrawer } from '@vben/common-ui';
import {
  BILLINGTYPE_SELECT,
  FLOW_SELECT,
  TIME_LIMIT_SELECT,
  EXTENSION_SELECT,
  FLOWSCENE_SELECT,
  DAY_LIMIT_SELECT,
  DEEP_CV_SELECT
} from '../../projectEnum';
import { computed, ref } from 'vue';
import type {
  QualificationValue,
  OppoAdgroupData,
  ChannelPackageValue,
} from '../../Oppo.types';
import AdGroupDrawer from './adGroupDrawer.vue';
import type { TargetedPackageTypeItem } from '#/api/models';
import type { AccountInfo } from '../../../creation';

const { campaign, orientation, accountInfo } = defineProps(
  {
    // 接收来自 index 的项目基本信息
    campaign: { 
      type: Object,
      default: () => ({}),
    },
    // 定向包
    orientation: {
      type: Object,
      default: new Map<string, Array<TargetedPackageTypeItem>>(),
    },
    // 账户列表
    accountInfo: {
      type: Array<AccountInfo>,
      default: () => [],
    },
    advertiserQualification: {
      type: Object,
      default: new Map<string, QualificationValue>(),
    },
    channelPackage: {
      type: Object,
      default: new Map<string, ChannelPackageValue>(),
    },
  },
);

const emit = defineEmits([
  'update:adGroupConfig',
  'update:adQualification',
  'update:channelPackage',
]);

const adGroupData = ref<OppoAdgroupData>({});
const localAdvertiserQualification = ref<Map<string, QualificationValue>>(new Map());
const localChannelPackage = ref<Map<string, ChannelPackageValue>>(new Map());

// 按账户分配方式的回显
const accountSelectionMap = computed(() => {
  const method = orientation.audienceConfig?.method;
  const dataMap = orientation.data as Map<string, TargetedPackageTypeItem[]>;
  if (method !== 'account' || !dataMap) return {};
  const result: Record<string, { advertiserName: string; packages: TargetedPackageTypeItem[] }> =
    {};
  dataMap.forEach((packages, accountId) => {
    if (packages && packages.length > 0) {
      // 寻找与当前 accountId 匹配的那一个账户信息
      const currentAccount = accountInfo.find(
        (item) => String(item.localAdvertiserId) === String(accountId),
      );

      result[accountId] = {
        advertiserName: currentAccount?.advertiserName ?? '未知账户',
        packages: packages,
      };
    }
  });
  return result;
});

//----------添加广告组信息-----------
const [AdGroupDrawerModule, drawerApi] = useVbenDrawer({
  connectedComponent: AdGroupDrawer,
  onOpenChange(isOpen) {
    if (!isOpen) {
      const { finalParams } = drawerApi.getData();
      console.log('finalParams',finalParams)
      if (finalParams && finalParams._isConfirmed) {
        if (finalParams) {
          adGroupData.value = finalParams as OppoAdgroupData;
          emit('update:adGroupConfig', adGroupData.value);
          if (localAdvertiserQualification && localAdvertiserQualification.size > 0) {
            emit('update:adQualification', localAdvertiserQualification);
          }
          if (localChannelPackage && localChannelPackage.size > 0) {
            emit('update:channelPackage', localChannelPackage);
          }
          drawerApi.setData(null);
        }
      }
    }
  },
});

// 单个删除（全部相同）
const removePackage = (index: number) => {
  // 1. 获取 Map 中的数组
  const list = orientation.data.get('0') || [];
  // 2. 执行删除
  list.splice(index, 1);
  // 3. 更新 Map（触发响应式）
  if (list.length === 0) {
    orientation.data.delete('0');
  } else {
    orientation.data.set('0', [...list]);
  }
};

// 单个删除（按账户）
const removePackageFromAccount = (accountId: string, index: number) => {
  // 1. 获取指定账户的数组
  const list = orientation.data.get(accountId);
  if (list) {
    list.splice(index, 1);
    // 3. 如果该账户下没有包了，直接删除该账户的 Key
    if (list.length === 0) {
      orientation.data.delete(accountId);
    } else {
      // 触发响应式更新
      orientation.data.set(accountId, [...list]);
    }
  }
};

// 清空全部
const clearAllPackages = () => {
  orientation.audienceConfig.method = 'all';
  orientation.data.clear();
};

// 计算已选总数（用于展示 2/100）
const totalSelectedCount = computed(() => {
  if (orientation.audienceConfig.method === 'all') {
    return orientation.data.get('0')?.length || 0;
  }
});

// 判断当前是否有数据可以清空
const isClearDisabled = computed(() => {
  if (orientation.audienceConfig.method === 'all') {
    // 全部相同时，判断数组长度
    const allData = orientation.data.get('0');
    return !allData || allData.length === 0;
  } else {
    // 按账户分配时，判断 Map 是否有键值对
    return orientation.data.size === 0;
  }
});

const labelMap: Partial<Record<keyof OppoAdgroupData, string>> = {
  adGroupName: '广告组名称',
  pageUrl: '广告h5落地页链接',
  extensionType: '标的物类型',
  extensionFlow: '推广流量',
  flowScene: '流量场景',
  dayLimit: '推广日限制',
  beginTime: '推广开始时间',
  endTime: '推广结束时间',
  billingType: '计费方式',
  deepOcpcPrice: '深度ocpc转化出价',
  deepOcpcType: '深度ocpc转换类型',
  deepUrl: '直达链接',
  instantAppId: '快应用id',
  instantAppUrl: '快应用落地链接',
  ocpcOptmType: '出价类型',
  ocpcPrice: '转化出价',
  ocpcType: '转化类型',
  price: '基础出价',
  timeLimit: '推广时段限制'
};

// 将 enumMap 定义为计算属性
const enumMap = computed<Partial<Record<keyof OppoAdgroupData, any[]>>>(() => ({
  extensionType: EXTENSION_SELECT,
  dayLimit: DAY_LIMIT_SELECT,
  extensionFlow: FLOW_SELECT,
  flowScene: FLOWSCENE_SELECT,
  timeLimit: TIME_LIMIT_SELECT,
  billingType: BILLINGTYPE_SELECT,
  ocpcType: DEEP_CV_SELECT
}));

const formatDisplayValue = (key: keyof OppoAdgroupData, value: any) => {
  if (value === null || value === undefined || value === '') return '-';

  if (['price', 'ocpcPrice', 'dailyBudget', 'secondOcpxPrice'].includes(key)) {
    return `${value} 元`;
  }

  const currentEnumMap = enumMap.value;

  if (currentEnumMap && key in currentEnumMap) {
    const options = currentEnumMap[key];
    if (Array.isArray(options) && options.length > 0) {
      // 强转 String 比较，防止后端返回数字 ID 与前端字符串 ID 匹配失败
      const target = options.find((item: any) => String(item.value) === String(value));
      return target ? target.label : value;
    }
  }

  return value;
};

function newAdGroup() {
  const isConfigValid = !campaign.planName;
  if (isConfigValid) return message.warning('请先完善并保存“项目”基本信息');

  drawerApi.setData({
    adGroupData: adGroupData.value,
    // localAdQualification: localAdvertiserQualification.value,
    // localChannelPackage: localChannelPackage.value,
  });
  drawerApi.open();
}

defineExpose({ setLocalAdGroupData });

//如果项目的推广目标变更，那广告组的所有需要全部清空
function setLocalAdGroupData(
  localAdGroupData: OppoAdgroupData,
  advertiserQualification: Map<string, QualificationValue>,
  channelPackage: Map<string, ChannelPackageValue>,
) {
  adGroupData.value = localAdGroupData;
  localAdvertiserQualification.value = advertiserQualification;
  localChannelPackage.value = channelPackage;
}
</script>

<template>
  <div>
    <div class="projectCard">
      <div class="title">广告组</div>
      <Divider type="horizontal" />
      <div class="infoTop">
        <div class="title">基本信息：</div>
        <Button
          v-if="adGroupData.adGroupName"
          type="link"
          size="small"
          @click="newAdGroup"
          class="edit-btn"
        >
          <span class="edit-icon">✎</span> 编辑
        </Button>
        <Button v-else type="primary" size="small" @click="newAdGroup">新增</Button>
      </div>
      <Card class="adInfoBody">
        <div v-if="adGroupData.adGroupName" class="data-list">
          <div v-for="(label, key) in labelMap" :key="key" class="data-item">
            <template v-if="adGroupData[key as keyof OppoAdgroupData]">
              <span class="item-label">{{ label }}：</span>
              <span class="item-value" :title="formatDisplayValue(key, adGroupData[key])">
                {{ formatDisplayValue(key, adGroupData[key]) }}
              </span>
            </template>
          </div>
        </div>
        <div v-else class="empty-status">暂无数据，请点击新增按钮添加</div>
      </Card>
      <div class="infoTop" style="margin: 10px 0 0">
        <div class="title">
          定向包：
          <span v-if="orientation.audienceConfig.method === 'all'" style="color: #006be6">
            {{ totalSelectedCount }}/100
          </span>
          <span v-else style="color: #006be6"> 按账户分配 </span>
        </div>
        <Button
          :disabled="isClearDisabled"
          type="primary"
          size="small"
          danger
          @click="clearAllPackages"
          >清空
        </Button>
      </div>
      <Card class="targetedInfoBody">
        <div v-if="orientation.audienceConfig.method === 'all'">
          <div v-if="orientation.data.get('0')?.length > 0" class="package-list">
            <div
              v-for="(item, index) in orientation.data.get('0')"
              :key="item.id || index"
              class="package-item"
            >
              <span class="package-name">{{ item.name }}</span>
              <span class="remove-icon" @click="removePackage(Number(index))">×</span>
            </div>
          </div>
          <div v-else class="empty-status">暂无数据</div>
        </div>
        <div v-else>
          <div v-if="Object.keys(accountSelectionMap).length > 0" class="account-group-list">
            <div
              v-for="(item, accountId) in accountSelectionMap"
              :key="accountId"
              class="account-section"
            >
              <div v-if="item.packages && item.packages.length > 0" class="account-header">
                <Tooltip placement="topLeft">
                  <template #title> {{ item.advertiserName }} (ID: {{ accountId }}) </template>

                  <div class="header-content">
                    {{ item.advertiserName }}
                    <span class="account-id">({{ accountId }})</span>
                  </div>
                </Tooltip>
              </div>
              <div class="package-list">
                <div v-for="(pkg, pIndex) in item.packages" :key="pkg.id" class="package-item">
                  <span class="package-name">{{ pkg.name }}</span>
                  <span class="remove-icon" @click="removePackageFromAccount(accountId, pIndex)"
                    >×</span
                  >
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-status">暂无数据</div>
        </div>
      </Card>
    </div>
    <AdGroupDrawerModule
      :campaign="campaign"
      :accountInfo="accountInfo"
    />
  </div>
</template>

<style scoped lang="scss">
.projectCard {
  .title {
    font-size: 14px;
    font-weight: 600;
  }

  .infoTop {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .empty-status {
    padding: 40px 0;
    color: #999;
    text-align: center;
  }

  .adInfoBody {
    height: 223px;
    margin: 10px 0 0;
    overflow: hidden auto;

    :deep(.ant-card-body) {
      padding: 12px;
    }

    .data-list {
      display: flex;
      flex-direction: column;

      .data-item {
        display: flex;
        align-items: center;
        font-size: 14px;
        transition: background-color 0.3s;

        &:hover {
          cursor: pointer;
          // background-color: #f5f5f5;
        }

        .item-label {
          flex-shrink: 0;
        }

        .item-value {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }

  .targetedInfoBody {
    height: 235px;
    margin: 10px 0 0;
    overflow: hidden;

    :deep(.ant-card-body) {
      height: 100%;
      padding: 12px;
      overflow-y: auto;
    }

    .package-list {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .package-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        border: 1px solid #e4e4e4;
        // background-color: #f8f9fa;
        border-radius: 4px;
        transition: all 0.3s;

        &:hover {
          // background-color: #f0f0f0;
        }

        .package-name {
          font-size: 14px;
        }

        .remove-icon {
          padding: 0 4px;
          font-size: 18px;
          line-height: 1;
          color: #999;
          cursor: pointer;

          &:hover {
            color: #ff4d4f;
          }
        }
      }
    }

    .account-section {
      margin-bottom: 16px;

      .account-header {
        width: 100%;
        margin-bottom: 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 13px;
        font-weight: bold;
        color: #333;
        white-space: nowrap;
      }

      .package-group {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .package-tag {
          display: flex;
          align-items: center;
          padding: 4px 12px;
          background-color: #f5f5f5;
          border-radius: 4px;

          .package-name {
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 14px;
            white-space: nowrap;
          }

          .remove-icon {
            margin-left: 8px;
            color: #ccc;
            cursor: pointer;

            &:hover {
              color: #ff4d4f;
            }
          }
        }
      }
    }

    .empty-status {
      padding: 40px 0;
      color: #999;
      text-align: center;
    }
  }

  .btnCla {
    display: flex;
    justify-content: center;
    width: 100%;
  }
}
</style>
