<script setup lang="ts" name="AdvertisingGroupModule">
import {Button, Card, Divider, Tooltip} from 'ant-design-vue';
import {useVbenDrawer} from '@vben/common-ui';
import {
  BILLINGTYPE_SELECT,
  DELIVER_SELECT,
  PHASETWOGOAL_SELECT,
  PROMOTIONLINK_SELECT,
  VXFOLLOW_SELECT,
  type AdvertisingQualificationType
} from '../projectEnum';
import {computed, ref, watch} from 'vue';
import {adInvestmentApi} from '#/api';
import type {VivoAdgroupData} from "#/views/marketing/creation/vivo/vivo";
import AdGroupDrawer from "./adGroupDrawer.vue";
import type { TargetedPackageTypeItem } from '#/api/models';
import type { AccountInfo } from '../../creation';

const {campaign, orientation, accountInfo} = defineProps({
  // 接收来自 index 的项目基本信息
  campaign: {
    type: Object,
    default: () => ({})
  },
  // 定向包
  orientation:{
    type: Object,
    default: new Map<string, Array<TargetedPackageTypeItem>>()
  },
  // 账户列表
  accountInfo: {
    type: Array<AccountInfo>,
    default: () => ([])
  },
});

const emit = defineEmits(['update:adGroupConfig']);

const adGroupData = ref<VivoAdgroupData>({
  advertiseQualificationId: "",
  apkId: 0,
  appPackageName: "",
  appletOriginId: "",
  appletPath: "",
  biddingStrategy: 0,
  builtInRpkDeepLink: "",
  campaignId: 0,
  channelId: 0,
  chargeType: null,
  conversionFilterCycle: 0,
  cvType: "",
  dailyBudget: "",
  endDate: "",
  h5Code: "",
  h5Type: null,
  industry1: "",
  industry2: "",
  name: "",
  ocpxPrice: "",
  price: "",
  productUrlType: 0,
  retrieveType: 0,
  rpkDeepLink: "",
  ruleAudience: "",
  scheduleTime: "",
  secondCvType: 0,
  secondOcpxPrice: 0,
  spentType: null,
  startDate: "",
  subpackageId: 0,
  webSiteUrl: "",
  wechatFollow: 0

});
//广告资质的下拉
const adInvestmentOption = ref()
async function adInvestmentEvent() {
  const res = await adInvestmentApi.fetchGetAdInvestment({
    advertiserId: accountInfo.map(item => item.localAdvertiserId),
  });
  adInvestmentOption.value = res.map((item:AdvertisingQualificationType) => ({ label: item.appCnName, value: item.advertiseQualificationId }));
}

// 监听广告组数据，当有数据时触发资质下拉接口
watch(
  () => adGroupData.value.name, // 或者监听整个 adGroupData
  (newVal) => {
    if (newVal) {
      adInvestmentEvent();
    }
  }
);

// 按账户分配方式的回显
const accountSelectionMap = computed(() => {
  const method = orientation.audienceConfig?.method;
  const dataMap = orientation.data as Map<string, TargetedPackageTypeItem[]>;
  if (method !== 'account' || !dataMap) return {};
  const result: Record<string, { advertiserName: string; packages: TargetedPackageTypeItem[] }> = {};
  dataMap.forEach((packages, accountId) => {
    if (packages && packages.length > 0) {
      // 寻找与当前 accountId 匹配的那一个账户信息
      const currentAccount = accountInfo.find(item => String(item.localAdvertiserId) === String(accountId));
      
      result[accountId] = {
        advertiserName: currentAccount?.advertiserName ?? '未知账户',
        packages: packages
      };
    }
  });
  return result;
});

// onMounted(() => {
//   adInvestmentEvent();
// });

//----------添加广告组信息-----------
const [AdGroupDrawerModule, drawerApi] = useVbenDrawer({
  connectedComponent: AdGroupDrawer,
  onOpenChange(isOpen) {
    if (!isOpen) {
      const data = drawerApi.getData();
      if (data && data._isConfirmed) {
        if (data) {
          adGroupData.value = data as VivoAdgroupData;
          emit('update:adGroupConfig', adGroupData.value);
          drawerApi.setData(null);
        }
      }
    }
  }
});

// 单个删除（全部相同）
const removePackage = (index: number) => {
  // 1. 获取 Map 中的数组
  const list = orientation.data.get("0") || [];
  // 2. 执行删除
  list.splice(index, 1);
  // 3. 更新 Map（触发响应式）
  if (list.length === 0) {
    orientation.data.delete("0");
  } else {
    orientation.data.set("0", [...list]); 
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
  orientation.audienceConfig.method = 'all'
  orientation.data.clear();
};

// 计算已选总数（用于展示 2/100）
const totalSelectedCount = computed(() => {
  if (orientation.audienceConfig.method === 'all') {
    return orientation.data.get("0")?.length || 0;
  }
});

// 判断当前是否有数据可以清空
const isClearDisabled = computed(() => {
  if (orientation.audienceConfig.method === 'all') {
    // 全部相同时，判断数组长度
    const allData = orientation.data.get("0");
    return !allData || allData.length === 0;
  } else {
    // 按账户分配时，判断 Map 是否有键值对
    return orientation.data.size === 0;
  }
});

const labelMap: Partial<Record<keyof VivoAdgroupData, string>> = {
  // appPackageName: '应用包名',
  name: '广告组名称',
  rpkDeepLink: '快应用deepLink地址',
  webSiteUrl: '推广链接',
  h5Code: '推广链接编码',
  h5Type: '推广链接类型',
  advertiseQualificationId: '广告投放资质ID',
  productUrlType: '商品URL类型',
  appletOriginId: '小程序id',
  appletPath: '小程序页面路径',
  chargeType: '计费类型',
  cvType: '二阶段目标',
  price: '一阶段出价',
  ocpxPrice: '二阶段出价',
  industry1: '一级行业分类id',
  industry2: '二级行业分类id',
  dailyBudget: '日预算',
  spentType: '投放状态',
  startDate: '开始日期',
  endDate: '结束日期',
  wechatFollow: '微信关注'
};

// 将 enumMap 定义为计算属性
const enumMap = computed<Partial<Record<keyof VivoAdgroupData, any[]>>>(() => ({
  chargeType: BILLINGTYPE_SELECT,
  cvType: PHASETWOGOAL_SELECT,
  spentType: DELIVER_SELECT,
  wechatFollow: VXFOLLOW_SELECT,
  h5Type: PROMOTIONLINK_SELECT,
  // 确保这里返回的是数组
  advertiseQualificationId: Array.isArray(adInvestmentOption.value) ? adInvestmentOption.value : [],
}));

const formatDisplayValue = (key: keyof VivoAdgroupData, value: any) => {
  if (value === null || value === undefined || value === '') return '-';

  if (['price', 'ocpxPrice', 'dailyBudget'].includes(key)) {
    return `${value} 毫分`;
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
  // const isConfigValid = !campaign.name;
  // if (isConfigValid) return message.warning('请先完善并保存“项目”基本信息');
  drawerApi.setData(adGroupData.value);
  drawerApi.open()
}

defineExpose({setLocalAdGroupData})

function setLocalAdGroupData(localAdGroupData: VivoAdgroupData) {
  adGroupData.value = localAdGroupData;
}
</script>

<template>
  <div>
    <div class="projectCard">
      <div class="title">广告组</div>
      <Divider type="horizontal"/>
      <div class="infoTop">
        <div class="title">基本信息：</div>
        <Button v-if="adGroupData.name" type="link" size="small" @click="newAdGroup" class="edit-btn">
          <span class="edit-icon">✎</span> 编辑
        </Button>
        <Button v-else type="primary" size="small" @click="newAdGroup">新增</Button>
      </div>
      <Card class="adInfoBody">
        <div v-if="adGroupData.name" class="data-list">
          <div v-for="(label, key) in labelMap" :key="key" class="data-item">
            <template v-if="adGroupData[key as keyof VivoAdgroupData]">
              <span class="item-label">{{ label }}：</span>
              <span class="item-value" :title="formatDisplayValue(key, adGroupData[key])">
                {{ formatDisplayValue(key, adGroupData[key]) }}
              </span>
            </template>
          </div>
        </div>
        <div v-else class="empty-status">
          暂无数据，请点击新增按钮添加
        </div>
      </Card>
      <div class="infoTop" style="margin: 10px 0 0;">
        <div class="title">定向包：
          <span v-if="orientation.audienceConfig.method === 'all'" style="color: #006be6;">
            {{ totalSelectedCount }}/100
          </span>
          <span v-else style="color: #006be6;">
            按账户分配
          </span>
        </div>
        <Button :disabled="isClearDisabled" type="primary" danger @click="clearAllPackages">清空
        </Button>
      </div>
      <Card class="targetedInfoBody">
        <div v-if="orientation.audienceConfig.method === 'all'">
          <div v-if="orientation.data.get('0')?.length > 0" class="package-list">
            <div v-for="(item, index) in orientation.data.get('0')" :key="item.id || index"
                 class="package-item">
              <span class="package-name">{{ item.name }}</span>
              <span class="remove-icon" @click="removePackage(Number(index))">×</span>
            </div>
          </div>
          <div v-else class="empty-status">暂无数据</div>
        </div>
        <div v-else>
          <div v-if="Object.keys(accountSelectionMap).length > 0" class="account-group-list">
            <div v-for="(item, accountId) in accountSelectionMap" :key="accountId"
                 class="account-section">
              <div v-if="item.packages && item.packages.length > 0" class="account-header">
                <Tooltip placement="topLeft">
                  <template #title>
                    {{ item.advertiserName }} (ID: {{ accountId }})
                  </template>

                  <div class="header-content">
                    {{ item.advertiserName }}
                    <span class="account-id">({{ accountId }})</span>
                  </div>
                </Tooltip>
              </div>
              <div class="package-list">
                <div v-for="(pkg, pIndex) in item.packages" :key="pkg.id" class="package-item">
                  <span class="package-name">{{ pkg.name }}</span>
                  <span class="remove-icon"
                    @click="removePackageFromAccount(accountId, pIndex)">×</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-status">暂无数据</div>
        </div>
      </Card>
    </div>
    <AdGroupDrawerModule :campaign="campaign" :accountInfo="accountInfo"/>
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
          background-color: #f5f5f5;
        }

        .item-label {
          flex-shrink: 0;
          color: #666;
        }

        .item-value {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #333;
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
        background-color: #f8f9fa;
        border-radius: 4px;
        transition: all 0.3s;

        &:hover {
          background-color: #f0f0f0;
        }

        .package-name {
          font-size: 14px;
          color: #333;
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
