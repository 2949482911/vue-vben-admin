<script setup lang="ts">
import { Card, Divider, Button, Tooltip } from 'ant-design-vue';
import { computed } from 'vue';
import type { TitlePackageItem } from '#/api/models';
import type { AccountInfo } from '../../creation';

const { titlePackage, accountInfo } = defineProps({
  titlePackage:{
    type: Object,
    default: new Map<string, Array<TitlePackageItem>>()
  },
  // 账户列表
  accountInfo: {
    type: Array<AccountInfo>,
    default: () => ([])
  },
})

// 计算已选总数（用于展示 2/100）
const totalSelectedCount = computed(() => {
  if (titlePackage.titlePackageConfig.method === 'all') {
    return titlePackage.data.get("0")?.length || 0;
  }
});

// 按账户分配方式的回显
const accountSelectionMap = computed(() => {
  const method = titlePackage.titlePackageConfig?.method;
  const dataMap = titlePackage.data as Map<string, TitlePackageItem[]>;
  if (method !== 'account' || !dataMap) return {};
  const result: Record<string, { advertiserName: string; packages: TitlePackageItem[] }> = {};
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

// 单个删除（按账户）
const removePackageFromAccount = (accountId: string, index: number) => {
  // 1. 获取指定账户的数组
  const list = titlePackage.data.get(accountId);
  if (list) {
    list.splice(index, 1);
    // 3. 如果该账户下没有包了，直接删除该账户的 Key
    if (list.length === 0) {
      titlePackage.data.delete(accountId);
    } else {
      // 触发响应式更新
      titlePackage.data.set(accountId, [...list]);
    }
  }
}

// 单个删除（全部相同）
const removePackage = (index: number) => {
  // 1. 获取 Map 中的数组
  const list = titlePackage.data.get("0") || [];
  // 2. 执行删除
  list.splice(index, 1);
  // 3. 更新 Map（触发响应式）
  if (list.length === 0) {
    titlePackage.data.delete("0");
  } else {
    titlePackage.data.set("0", [...list]); 
  }
};

// 清空全部
const clearAllPackages = () => {
  titlePackage.titlePackageConfig.method = 'all'
  titlePackage.data.clear();
};

// 判断当前是否有标题包数据可以清空
const isClearDisabled = computed(() => {
  if (titlePackage.titlePackageConfig.method === 'all') {
    // 全部相同时，判断数组长度
    const allData = titlePackage.data.get("0");
    return !allData || allData.length === 0;
  } else {
    // 按账户分配时，判断 Map 是否有键值对
    return titlePackage.data.size === 0;
  }
});
</script>

<template>
  <div class="projectCard">
    <div class="title">标题包</div>
    <Divider type="horizontal" />
    <div class="infoTop">
      <div class="title">分配方式：
        <span v-if="titlePackage.titlePackageConfig.method === 'all'" style="color: #006be6;">
          {{ totalSelectedCount }}/100
        </span>
        <span v-else style="color: #006be6;">
          按账户分配
        </span>
      </div>
      <Button type="primary" danger :disabled="isClearDisabled" @click="clearAllPackages">清空</Button>
    </div>
    <Card class="infoBody">
      <div v-if="titlePackage.titlePackageConfig.method === 'all'">
        <div v-if="titlePackage.data.get('0')?.length > 0" class="package-list">
          <div v-for="(item, index) in titlePackage.data.get('0')" :key="item.id || index" class="package-item">
            <span class="package-name">{{ item.title }}</span>
            <span class="remove-icon" @click="removePackage(Number(index))">×</span>
          </div>
        </div>
        <div v-else class="empty-status">暂无数据</div>
      </div>
      <div v-else>
      <div v-if="Object.keys(accountSelectionMap).length > 0" class="account-group-list">
        <div v-for="(item, accountId) in accountSelectionMap" :key="accountId" class="account-section">
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
              <span class="package-name">{{ pkg.title }}</span>
              <span class="remove-icon" @click="removePackageFromAccount(accountId, pIndex)">×</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-status">暂无数据</div>
      </div>
    </Card>
    <Divider type="horizontal" />
  </div>
</template>

<style scoped lang="scss">
.projectCard{
  .title{
    font-size: 14px;
    font-weight: 600;
  }

  .infoTop{
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .empty-status {
    padding: 40px 0;
    color: #999;
    text-align: center;
  }

  .infoBody{
    height: 500px;
    margin: 10px 0 0;
    overflow: hidden auto;

    :deep(.ant-card-body) {
      height: 100%;
      padding: 12px;
      overflow-y: auto; /* 内容超出时显示垂直滚动条 */
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
        // background-color: #f8f9fa; // 浅灰色背景
        border-radius: 4px;
        transition: all 0.3s;
  
        &:hover {
          // background-color: #f0f0f0;
        }
  
        .package-name {
          font-size: 14px;
          // color: #333;
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

            &:hover { color: #ff4d4f; }
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

  .btnCla{
    display: flex;
    justify-content: center;
    // align-items: center;
    width: 100%;
  }
}
</style>
