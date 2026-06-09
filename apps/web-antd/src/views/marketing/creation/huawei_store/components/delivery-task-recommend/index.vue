<script setup lang="ts" name="DeliveryTaskRecommend">
// 投放推荐任务
// https://developer.huawei.com/consumer/cn/doc/promotion/bp-delivery-task-recommend-0000001337110797

import {Col, Row} from "ant-design-vue";
import Task from "../HuaweiStoreTask.vue";
import SubTask from "../HuaweiStoreSubTask.vue";
import type {
  HuaWeiStoreCampaignData,
} from "#/views/marketing/creation/huawei_store/huawei_store";
import type {
  AudienceConfigData,
  MaterialData,
  TitlePackageConfigData
} from "#/views/marketing/creation/creation";

import CreativeGroupSelector
  from "#/views/marketing/creation/components/creative/CreativeGroupSelector.vue";
import TitleSelector from "#/views/marketing/creation/components/title/TitleSelector.vue";

const emit = defineEmits(["update:campaign", "update:adgroup",
  "update:audiencePackage", "update:updateMaterial", "update:titlePackage"])

const {creationInfo} = defineProps({
  creationInfo: {
    type: Object,
    default: () => {
      return {}
    }
  },
})

// 任务表单字段
const taskFormFields = [
  {
    component: 'Input',
    fieldName: 'taskName',
    label: '任务名字',
    rules: 'required',
    formItemClass: 'items-baseline',
  },

  {
    component: 'Input',
    fieldName: 'budget',
    label: '预算',
    rules: 'required',
    formItemClass: 'items-baseline',
  },

  {
    component: 'Select',
    componentProps: {
      placeholder: '请选择',
      options: [
        {
          value: 'CPC',
          label: 'CPC',
        },
      ],
    },
    defaultValue: 'CPC',
    fieldName: 'pricingType',
    label: '计费类型',
    rules: 'required',
    formItemClass: 'items-baseline',
  },


  {
    component: 'Select',
    componentProps: {
      placeholder: '请选择',
      options: [
        {
          value: 0,
          label: '不针对安装情况进行过滤',
        },
        {
          value: 2,
          label: '仅投放已安装APP用户',
        },
      ],
    },
    defaultValue: 0,
    fieldName: 'isExcludeInstalledApp',
    label: '仅投安装用户',
    rules: 'required',
    formItemClass: 'items-baseline',
  },


  {
    component: 'DatePicker',
    fieldName: 'startDate',
    componentProps: {
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD',
    },
    label: '开始时间',
    rules: 'required',
    formItemClass: 'items-baseline',
  },

  {
    component: 'DatePicker',
    fieldName: 'endDate',
    componentProps: {
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD',
    },
    label: '结束时间',
    rules: 'required',
    formItemClass: 'items-baseline',
  },

  {
    component: 'Select',
    componentProps: {
      placeholder: '请选择',
      options: [
        {
          value: 'Monday',
          label: '周一',
        },
        {
          value: 'Tuesday',
          label: '周二',
        },
        {
          value: 'Wednesday',
          label: '周三',
        },
        {
          value: 'Thursday',
          label: '周四',
        },
        {
          value: 'Friday',
          label: '周五',
        },
        {
          value: 'Saturday',
          label: '周六',
        },
        {
          value: 'Sunday',
          label: '周日',
        },
      ],
    },
    fieldName: 'day',
    label: '投放时段',
    rules: 'required',
    formItemClass: 'items-baseline',
  },

  {
    component: 'TimePicker',
    fieldName: 'startHMs',
    label: '开始时段',
    rules: 'required',
    formItemClass: 'items-baseline',
  },

  {
    component: 'TimePicker',
    fieldName: 'endHMs',
    label: '结束时段',
    rules: 'required',
    formItemClass: 'items-baseline',
  },

  {
    component: 'Input',
    fieldName: 'regions',
    defaultValue: "CN",
    label: '投放区域',
    rules: 'required',
    formItemClass: 'items-baseline',
  },

  {
    component: 'Input',
    fieldName: 'isPositiveRegion',
    defaultValue: "Y",
    label: '投放区域',
    rules: 'required',
    formItemClass: 'items-baseline',
  },

  {
    component: 'Select',
    componentProps: {
      placeholder: '请选择',
      options: [
        {
          value: 3,
          label: '应用归因',
        },
        {
          value: 99,
          label: '多方式归因',
        },
      ],
    },
    defaultValue: 3,
    fieldName: 'attributionMode',
    label: '归因方式',
    rules: 'required',
    formItemClass: 'items-baseline',
  },
  {
    component: 'Select',
    componentProps: {
      placeholder: '请选择',
      options: [
        {
          value: 1,
          label: '竞价',
        },
        {
          value: 2,
          label: '合约',
        },
      ],
    },
    defaultValue: 1,
    fieldName: "buyMode",
    label: "采买模式",
    rules: 'required',
    formItemClass: 'items-baseline',
  },
  {
    component: 'Select',
    componentProps: {
      placeholder: '请选择',
      options: [
        {
          value: 1,
          label: '应用推广',
        }
      ],
    },
    defaultValue: 1,
    fieldName: "marketingGoal",
    label: "营销目标",
    rules: 'required',
    formItemClass: 'items-baseline',
  },
  {
    component: 'Select',
    componentProps: {
      placeholder: '请选择',
      options: [
        {
          value: 1,
          label: '应用市场推广网络',
        }
      ],
    },
    defaultValue: 1,
    fieldName: "adNetwork",
    label: "网络类型",
    rules: 'required',
    formItemClass: 'items-baseline',
  },
  {
    component: 'Select',
    componentProps: {
      placeholder: '请选择',
      options: [
        {
          value: 1,
          label: '应用市场推广',
        }
      ],
    },
    defaultValue: 1,
    fieldName: "type",
    label: "计划类型",
    rules: 'required',
    formItemClass: 'items-baseline',
  },
  {
    component: 'Input',
    defaultValue: 200,
    fieldName: "dailyBudget",
    label: "计划日预算",
    rules: 'required',
    formItemClass: 'items-baseline',
  }
]


const taskShowLabel: Record<string, string> = {
  taskName: "任务名称",
  budget: "预算",
  startDate: "开始时间",
  endDate: "结束时间",
  regions: "投放区域(默认CN)",
  isPositiveRegion: "是否正向选择区域",
  attributionMode: "归因方式",
}


function updateCampaign(campaign: HuaWeiStoreCampaignData) {
  emit('update:campaign', campaign)
}


// 子任务表单数据
const subTaskFormFields = [
  {
    component: 'Input',
    fieldName: 'subTaskName',
    label: '子任务名称',
    rules: 'required',
    formItemClass: 'items-baseline',
  },

  {
    component: 'Input',
    fieldName: 'subTaskPrice',
    label: '出价',
    rules: 'required',
    formItemClass: 'items-baseline',
  },
]

const subTaskShowLabel: Record<string, string> = {
  subTaskName: "任务名称",
  subTaskPrice: "出价",
}

function updateAdgroup(campaign: HuaWeiStoreCampaignData) {
  emit('update:adgroup', campaign)
}

/**
 * 更新定向包数据
 * @param audienceConfigData
 */
function updateAudiencePackage(audienceConfigData: AudienceConfigData) {
  emit('update:audiencePackage', audienceConfigData)
}


/**
 * 更新素材
 */
function updateMaterial(materialData: MaterialData) {
  emit('update:updateMaterial', materialData)
}


/**
 * 编辑标题包
 * @param titlePackage 标题包
 */
function updateTitlePackage(titlePackage: TitlePackageConfigData) {
  emit('update:titlePackage', titlePackage)
}

</script>

<template>
  <div>
    <Row :gutter="16">
      <Col :span="6">
        <Task :form-fields="taskFormFields"
              :task-show-label="taskShowLabel"
              :campaign="creationInfo.configData?.campaign"
              @update:campaign="updateCampaign">

        </Task>
      </Col>
      <Col :span="6">
        <SubTask :form-fields="subTaskFormFields"
                 :sub-task-show-label="subTaskShowLabel"
                 :account-info="creationInfo.accountInfo"
                 :audience="creationInfo.configData?.audience"
                 :adgroup="creationInfo.configData?.adgroup"
                 @update:adgroup="updateAdgroup"
                 @update:audience-package="updateAudiencePackage"
        />
      </Col>

      <Col :span="6">
        <CreativeGroupSelector
          :account-info="creationInfo.accountInfo"
          :material="creationInfo.configData?.material"
          @update:material="updateMaterial"
        />
      </Col>

      <Col :span="6">
        <TitleSelector
          :title-package="creationInfo.configData?.titlePackage"
          :account-info="creationInfo.accountInfo"
          @update:title-package="updateTitlePackage"
        ></TitleSelector>
      </Col>
    </Row>
  </div>
</template>

<style scoped lang="scss">

</style>
