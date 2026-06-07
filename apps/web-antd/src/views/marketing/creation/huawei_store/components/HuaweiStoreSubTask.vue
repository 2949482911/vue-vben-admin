<script setup lang="ts" name="HuaweiStoreSubTask">
import {ref} from 'vue';
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

const {formFields, subTaskShowLabel, accountInfo, audience} = defineProps({
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
  }
});

//----------选择定向包-----------
const [AudiencePackage, audiencePackageModalApi] = useVbenModal({
  connectedComponent: AudiencePackageModal,
});

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


function openAdgroupDrawer() {
  drawerApi.open();
}


// 定向包

function openAudiencePackage() {
  audiencePackageModalApi.open();
}


/**
 * 更新定向包
 */
function updateAudiencePackage(audienceConfigData: AudienceConfigData) {
  emit("update:audiencePackage", audienceConfigData);
  console.log(audienceConfigData);
}

</script>

<template>
  <div>
    <Card title="子任务">
      <Divider type="horizontal"/>
      <Descriptions title="基本信息" v-if="adgroupData.subTaskName">
        <DescriptionsItem v-for="(label, key ) in subTaskShowLabel"
                          :key="key" :label="label" :span="5">
          {{ adgroupData[key] }}
        </DescriptionsItem>
      </Descriptions>
      <Alert v-else type="error" message="请先填写子任务信息"></Alert>
      <Divider type="horizontal"/>
      <Space align="center" class="w-full justify-center">
        <Button primary danger @click="openAdgroupDrawer">
          {{ adgroupData.subTaskName ? '编辑子任务' : '添加子任务' }}
        </Button>
      </Space>
    </Card>

    <Divider type="horizontal"/>

    <Card title="定向包">
      <AudiencePackageShow :audience="audience" />
      <Divider type="horizontal"/>
      <Space align="center" class="w-full justify-center">
        <Button primary danger @click="openAudiencePackage">
          添加定向包
        </Button>
      </Space>

    </Card>

    <AdgroupDrawerModule :form-fields="formFields"></AdgroupDrawerModule>
    <AudiencePackage :account-info="accountInfo"
                     :platform="Platform.HUAWEI_STORE"
                     @update:orientation="updateAudiencePackage"
    ></AudiencePackage>
  </div>
</template>

<style scoped lang="scss">

</style>
