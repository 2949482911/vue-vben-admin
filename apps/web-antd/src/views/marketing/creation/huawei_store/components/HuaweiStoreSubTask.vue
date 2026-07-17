<script setup lang="ts" name="HuaweiStoreSubTask">
import {ref, watch} from 'vue';
import {Card, Divider, Descriptions, DescriptionsItem, Alert, Button, Space} from 'ant-design-vue';
import type {HuaWeiStoreAdgroupData} from "#/views/marketing/creation/huawei_store/huawei_store";
import {useVbenDrawer, useVbenModal} from '@vben/common-ui';
import HuaweiStoreSubTaskDrawer
  from "#/views/marketing/creation/huawei_store/components/HuaweiStoreSubTaskDrawer.vue";
import AudiencePackageModal
  from "#/views/marketing/creation/components/audience_package/AudiencePackageModal.vue";
import type {AccountInfo, AudienceConfigData} from "#/views/marketing/creation/creation";
import {Platform} from "#/constants/enums";
import AudiencePackageShow
  from "#/views/marketing/creation/components/audience_package/AudiencePackageShow.vue";

const emit = defineEmits(["update:adgroup", "update:audiencePackage"])

const {formFields, subTaskShowLabel, accountInfo, audience, adgroup, fieldLabelMap} = defineProps({
  formFields: {
    type: Array,
    default: () => []
  },
  subTaskShowLabel: {
    type: Object,
    default: () => {
    }
  },
  accountInfo: {
    type: Array<AccountInfo>,
    default: () => []
  },
  audience: {
    type: Object as () => AudienceConfigData | null,
    default: () => {
    }
  },
  adgroup: {
    type: Object as () => HuaWeiStoreAdgroupData | null,
    default: null
  },
  fieldLabelMap: { type: Object as () => Record<string, (value: any) => string>, default: () => ({}) },
});

//----------选择定向包-----------
const [AudiencePackage, audiencePackageModalApi] = useVbenModal({
  connectedComponent: AudiencePackageModal,
});

// 广告组编辑弹窗
const [AdgroupDrawerModule, drawerApi] = useVbenDrawer({
  connectedComponent: HuaweiStoreSubTaskDrawer,
  onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      const adgroup = drawerApi.getData();
      adgroupData.value = adgroup as HuaWeiStoreAdgroupData;
      emit("update:adgroup", adgroupData.value);
    }
  }
});


const adgroupData = ref<HuaWeiStoreAdgroupData>({
  conversionBehaviorId: "",
  conversionExcludeBehaviorId: "",
  subTaskFollowAppName: "",
  subTaskKey: "",
  subTaskKeyMatchType: "",
  subTaskName: "",
  subTaskPrice: 200,
  subTaskRtaId: "",
  subTaskUserGroupId: "",
  taskId: ""
});

// 监听父组件传入的 adgroup 数据变化，实现回显（复用策略组时）
watch(
  () => adgroup,
  (newAdgroup) => {
    if (newAdgroup) {
      adgroupData.value = { ...newAdgroup };
    }
  },
  { immediate: true, deep: true }
);


function openAdgroupDrawer() {
  drawerApi.setData(adgroupData.value);
  drawerApi.open();
}


// 定向包

function openAudiencePackage() {
  audiencePackageModalApi.setData(audience);
  audiencePackageModalApi.open();
}


/**
 * 更新定向包
 */
function updateAudiencePackage(audienceConfigData: AudienceConfigData) {
  emit("update:audiencePackage", audienceConfigData);
}

</script>

<template>
  <div class="huawei-store-subtask-container">
    <div class="subtask-cards-wrapper">
      <Card title="子任务" class="info-card">
        <div class="card-content">
          <Descriptions title="基本信息" v-if="adgroupData.subTaskName" :column="1" class="info-descriptions">
            <DescriptionsItem v-for="(label, key ) in subTaskShowLabel"
                              :key="key" :label="label">
              {{ fieldLabelMap[key] ? fieldLabelMap[key](adgroupData[key]) : adgroupData[key] }}
            </DescriptionsItem>
          </Descriptions>
          <Alert v-else type="error" message="请先填写子任务信息" class="empty-alert"></Alert>
        </div>
        <div class="card-footer">
          <Button primary danger @click="openAdgroupDrawer">
            {{ adgroupData.subTaskName ? '编辑子任务' : '添加子任务' }}
          </Button>
        </div>
      </Card>

      <Card title="定向包" class="info-card">
        <div class="card-content">
          <AudiencePackageShow :audience="audience" />
        </div>
        <div class="card-footer">
          <Button primary danger @click="openAudiencePackage">
            添加定向包
          </Button>
        </div>
      </Card>
    </div>

    <AdgroupDrawerModule :form-fields="formFields"></AdgroupDrawerModule>
    <AudiencePackage :account-info="accountInfo"
                     :platform="Platform.HUAWEI_STORE"
                     @update:orientation="updateAudiencePackage"
    ></AudiencePackage>
  </div>
</template>

<style scoped lang="scss">
.huawei-store-subtask-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.subtask-cards-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card {
  width: 100%;
  min-height: 300px; // 固定最小高度，防止内容被挤压
  
  // Card 样式优化
  &.ant-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: box-shadow 0.3s ease;
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }
  }
  
  .ant-card-head {
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    padding: 12px 16px;
    min-height: 57px; // Card 标题固定高度
  }
  
  .ant-card-body {
    padding: 16px;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
}

.card-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 16px;
  min-height: 150px; // 增大内容区域最小高度，确保有足够空间显示内容
}

.card-footer {
  display: flex;
  justify-content: center; // 居中对齐
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  margin-top: auto; // 自动推到底部
}

.info-descriptions {
  .ant-descriptions-item-label {
    font-weight: 500;
  }
}

.empty-alert {
  margin: 8px 0;
}
</style>
