<script setup lang="ts">
import { Card, Divider, Button, Tooltip, message } from 'ant-design-vue';
import { computed } from 'vue';
import type { LandingPageData, TitlePackageItem } from '#/api/models';
import type { AccountInfo } from '../../creation';
import { useVbenModal } from '@vben/common-ui';
import TitlePackagePopup from './titlePackagePopup.vue';
import type { VivoTitlePackageData } from '../vivo';

const emit = defineEmits(['update:titlePackageConfig']);

const { titlePackage, accountInfo, promotionName, landingPage } = defineProps({
  titlePackage: {
    type: Object,
    default: new Map<string, Array<TitlePackageItem>>(),
  },
  // 账户列表
  accountInfo: {
    type: Array<AccountInfo>,
    default: () => [],
  },
  //广告创意名称用来判断能不能添加标题包
  promotionName: {
    type: String,
    default: '',
  },
  landingPage: {
    type: Object,
    default: new Map<string, Array<LandingPageData>>(),
  },
});

//----------标题包-----------
const [TitlePackagePopupModule, titlePackagePopupModuleModalApi] = useVbenModal({
  connectedComponent: TitlePackagePopup,
});

function openTitlePackagePopupModule() {
  if (!promotionName) return message.warning('请先完善并保存“素材组”基本信息');
  titlePackagePopupModuleModalApi.setData(titlePackage);
  titlePackagePopupModuleModalApi.open();
}

function handleTitlePackageUpdate(data: VivoTitlePackageData) {
  emit('update:titlePackageConfig', data);
}

// 计算已选总数（用于展示 2/100）
function totalSelectedCount(method: string, num: number) {
  if (method === 'all') {
    return num || 0;
  }
}

/**
 * 按账户分配循环展示
 * @param configData 目标对象 (VivoTitlePackageData 或 VivoLandingPageData)
 * @param configData.config 目标方式 (titlePackageConfig 或 landingPageConfig)
 * @param configData.data (TitlePackageItem 或 LandingPageData)
 */
const getAccountSelectionMap = (configData: any) => {
  const method = configData.config?.method;
  const dataMap = configData.data as Map<string, any[]>;

  if (method !== 'account' || !dataMap) return {};

  const result: Record<string, { advertiserName: string; packages: any[] }> = {};

  dataMap.forEach((packages, accountId) => {
    if (packages && packages.length > 0) {
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
};

// 落地页
const accountSelectionMapLandingPage = computed(() =>
  getAccountSelectionMap({
    config: landingPage.landingPageConfig,
    data: landingPage.data,
  }),
);

// 标题包
const accountSelectionMap = computed(() =>
  getAccountSelectionMap({
    config: titlePackage.titlePackageConfig,
    data: titlePackage.data,
  }),
);

/**
 * 单个删除（按账户）
 * @param targetObj 目标对象 (titlePackage 或 landingPage)
 * @param accountId 账户ID 或 '0'
 * @param index 数组索引
 */
const performRemove = (targetObj: any, accountId: string, index: number) => {
  const dataMap = targetObj.data;
  if (!dataMap) return;

  // 兼容 Map 和普通对象（防止报错）
  const list = dataMap instanceof Map ? dataMap.get(accountId) : dataMap[accountId];

  if (list && Array.isArray(list)) {
    list.splice(index, 1);

    if (list.length === 0) {
      dataMap instanceof Map ? dataMap.delete(accountId) : delete dataMap[accountId];
    } else {
      // 触发响应式：Map 需要 set，普通对象需要展开赋值
      if (dataMap instanceof Map) {
        dataMap.set(accountId, [...list]);
      } else {
        targetObj.data[accountId] = [...list];
      }
    }
  }
};

const removePackageFromAccount = (accountId: string, index: number, val: string) => {
  const target = val === 'titlePackage' ? titlePackage : landingPage;
  performRemove(target, accountId, index);
};

const removePackage = (index: number, type: string) => {
  removePackageFromAccount('0', index, type);
};

// 清空全部
const clearAllPackages = (val: string) => {
  if (val === 'titlePackage') {
    titlePackage.titlePackageConfig.method = 'all';
    titlePackage.data.clear();
  } else {
    landingPage.landingPageConfig.method = 'all';
    landingPage.data.clear();
  }
};

/**
 * 统一判断“清空”按钮是否禁用
 * @param type 'titlePackage' | 'landingPage'
 */
function isClearDisabled(type: string) {
  // 1. 获取目标对象及其配置
  const target = type === 'titlePackage' ? titlePackage : landingPage;
  const config = type === 'titlePackage' ? target.titlePackageConfig : target.landingPageConfig;
  const dataMap = target.data;

  // 2. 如果数据不存在，直接禁用
  if (!dataMap) return true;

  // 3. 根据分配方式进行判断
  if (config.method === 'all') {
    // 全部相同时，判断 Key 为 '0' 的数组是否有内容
    // 兼容 Map.get 和 Object['0']
    const allData = dataMap instanceof Map ? dataMap.get('0') : dataMap['0'];
    return !allData || allData.length === 0;
  } else {
    // 按账户分配时，判断 Map 尺寸或对象键数量
    const size = dataMap instanceof Map ? dataMap.size : Object.keys(dataMap).length;
    return size === 0;
  }
}
</script>

<template>
  <div class="projectCard">
    <div class="title">标题包</div>
    <Divider type="horizontal" />
    <div class="infoTop">
      <div class="title">
        分配方式：
        <span v-if="titlePackage.titlePackageConfig.method === 'all'" style="color: #006be6">
          {{
            totalSelectedCount(
              titlePackage.titlePackageConfig.method,
              titlePackage.data.get('0')?.length,
            )
          }}/100
        </span>
        <span v-else style="color: #006be6"> 按账户分配 </span>
      </div>
      <div>
        <Button
          style="margin: 0 10px 0 0"
          type="primary"
          size="small"
          @click="openTitlePackagePopupModule()"
          >添加标题包</Button
        >
        <Button
          type="primary"
          size="small"
          danger
          :disabled="isClearDisabled('titlePackage')"
          @click="clearAllPackages('titlePackage')"
          >清空</Button
        >
      </div>
    </div>
    <Card class="titleInfoBody">
      <div v-if="titlePackage.titlePackageConfig.method === 'all'">
        <div v-if="titlePackage.data.get('0')?.length > 0" class="package-list">
          <div
            v-for="(item, index) in titlePackage.data.get('0')"
            :key="item.id || index"
            class="package-item"
          >
            <span class="package-name">{{ item.title }}</span>
            <span class="remove-icon" @click="removePackage(Number(index), 'titlePackage')">×</span>
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
                <span class="package-name">{{ pkg.title }}</span>
                <span
                  class="remove-icon"
                  @click="removePackageFromAccount(accountId, pIndex, 'titlePackage')"
                  >×</span
                >
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-status">暂无数据</div>
      </div>
    </Card>
    <div class="infoTop" style="margin: 10px 0 0">
      <div class="title">
        落地页：
        <span v-if="landingPage.landingPageConfig.method === 'all'" style="color: #006be6">
          {{
            totalSelectedCount(
              landingPage.landingPageConfig.method,
              landingPage.data.get('0')?.length,
            )
          }}/100
        </span>
        <span v-else style="color: #006be6"> 按账户分配 </span>
      </div>
      <Button
        type="primary"
        size="small"
        danger
        :disabled="isClearDisabled('landingPage')"
        @click="clearAllPackages('landingPage')"
        >清空
      </Button>
    </div>
    <Card class="langingPageInfoBody"
      ><div v-if="landingPage.landingPageConfig.method === 'all'">
        <div v-if="landingPage.data.get('0')?.length > 0" class="package-list">
          <div
            v-for="(item, index) in landingPage.data.get('0')"
            :key="item.id || index"
            class="package-item"
          >
            <span class="package-name">{{ item.name }}</span>
            <span class="remove-icon" @click="removePackage(Number(index), 'landingPage')">×</span>
          </div>
        </div>
        <div v-else class="empty-status">暂无数据</div>
      </div>
      <div v-else>
        <div
          v-if="Object.keys(accountSelectionMapLandingPage).length > 0"
          class="account-group-list"
        >
          <div
            v-for="(item, accountId) in accountSelectionMapLandingPage"
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
                <span
                  class="remove-icon"
                  @click="removePackageFromAccount(accountId, pIndex, 'landingPage')"
                  >×</span
                >
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-status">暂无数据</div>
      </div></Card
    >
    <Divider type="horizontal" />
    <TitlePackagePopupModule
      :accountInfo="accountInfo"
      :titlePackage="titlePackage"
      @update:titlePackageConfig="handleTitlePackageUpdate"
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

  .titleInfoBody {
    height: 223px;
    margin: 10px 0 0;
    overflow: hidden auto;

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
        border-radius: 4px;
        transition: all 0.3s;

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
            color: #ff4d4f; // 悬浮变红
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

  .langingPageInfoBody {
    height: 230px;
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
        border-radius: 4px;
        transition: all 0.3s;

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
            color: #ff4d4f; // 悬浮变红
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
