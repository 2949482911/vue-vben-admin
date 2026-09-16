<script setup lang="ts" name="DeliveryTaskRecommend">
// 投放推荐任务
// https://developer.huawei.com/consumer/cn/doc/promotion/bp-delivery-task-recommend-0000001337110797

import type {
  AudienceConfigData,
  MaterialData,
  TitlePackageConfigData
} from "#/views/marketing/creation/creation";
import type {
  HuaWeiStoreCampaignData,
} from "#/views/marketing/creation/huawei_store/huawei_store";

import CreativeGroupSelector
  from "#/views/marketing/creation/components/creative/CreativeGroupSelector.vue";
import TitleSelector from "#/views/marketing/creation/components/title/TitleSelector.vue";

import SubTask from "../HuaweiStoreSubTask.vue";
import Task from "../HuaweiStoreTask.vue";

const {creationInfo, fieldLabelMap} = defineProps({
  creationInfo: {
    type: Object,
    default: () => {
      return {}
    }
  },
  fieldLabelMap: { type: Object as () => Record<string, (value: any) => string>, default: () => ({}) },
})

const emit = defineEmits(["update:campaign", "update:adgroup",
  "update:audiencePackage", "update:updateMaterial", "update:titlePackage"])

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
  <div class="delivery-task-recommend-container">
    <div class="panes">
      <div class="pane">
        <Task
:form-fields="taskFormFields"
              :task-show-label="taskShowLabel"
              :campaign="creationInfo.configData?.campaign"
              :field-label-map="fieldLabelMap"
              @update:campaign="updateCampaign"
/>
      </div>
      <div class="pane">
        <SubTask
:form-fields="subTaskFormFields"
                 :sub-task-show-label="subTaskShowLabel"
                 :account-info="creationInfo.accountInfo"
                 :audience="creationInfo.configData?.audience"
                 :adgroup="creationInfo.configData?.adgroup"
                 :field-label-map="fieldLabelMap"
                 @update:adgroup="updateAdgroup"
                 @update:audience-package="updateAudiencePackage"
        />
      </div>

      <div class="pane">
        <CreativeGroupSelector
          :account-info="creationInfo.accountInfo"
          :material="creationInfo.configData?.material"
          @update:material="updateMaterial"
        />
      </div>

      <div class="pane">
        <TitleSelector
          :title-package="creationInfo.configData?.titlePackage"
          :account-info="creationInfo.accountInfo"
          @update:title-package="updateTitlePackage"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.delivery-task-recommend-container {
  width: 100%;
  height: 100%;
  min-height: 0;
}

/**
 * 配置列布局：grid 固定「4 列 + 1 行」，
 * 行高 = 工作台高度（外层给的是确定高度），因此列高恒定、不会被内容撑高；
 * 不再使用 Row/Col 的 stretch + 612px 魔法值，也不会因为列换行而外溢
 */
.panes {
  display: grid;
  grid-template-rows: minmax(0, 1fr);
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  height: 100%;
  min-height: 0;
}

.pane {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;

  // 列内容必须是工作台高度：既不能被内容撑高，也不能顶出去；
  // 卡片自身填满列、内容区滚动、列脚按钮固定可见
  > * {
    flex: 1;
    min-height: 0;
    max-height: 100%;
    overflow: hidden;
  }

  // 在列内直接加固卡片滚动契约，确保 :deep 能可靠命中当前模板渲染的卡片
  :deep(.ant-card) {
    display: flex !important;
    flex-direction: column !important;
    min-height: 0 !important;
    max-height: 100% !important;
    overflow: hidden !important;
  }

  :deep(.ant-card-head) {
    flex-shrink: 0 !important;
  }

  :deep(.ant-card-body) {
    display: flex !important;
    flex: 1 1 0% !important;
    flex-direction: column !important;
    min-height: 0 !important;
    overflow-y: auto !important;
  }

  :deep(.card-content) {
    flex: 1 1 0% !important;
    min-height: 0 !important;
    overflow-y: auto !important;
  }

  :deep(.card-footer) {
    flex-shrink: 0 !important;
  }
}
</style>
