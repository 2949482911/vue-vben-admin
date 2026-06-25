<script setup lang="ts" name="TencentAudienceForm">
import { useVbenForm } from "@vben/common-ui";
import {
  App_install_status,
  Conversion_behavior_list,
  Device_price,
  Education, Excluded_day,
  Excluded_dimension,
  Excluded_os,
  Game_consumption_level,
  Gender,
  Location_types,
  Marital_status,
  Network_type,
  User_os,
  Wechat_ad_behavior_actions
} from "#/views/marketing/asset/audiencePackage/tencent/tencentTagData";
import AgeRangeInput from "./components/AgeRangeInput.vue";
import CustomLocationInput from "./components/CustomLocationInput.vue";
import { markRaw } from "vue";

// 提交表单数据
async function submitTencentConfig() {
  const values = await formApi.getValues();
  return {
    ...values,
    geo_location: {
      location_types: values["location_types"],
      regions: values["regions"],
      business_districts: values["business_districts"],
      geo_location_auto_audience: values["geo_location_auto_audience"],
      custom_locations: values["custom_locations"]
    },
    excluded_converted_audience: {
      excluded_dimension: values["excluded_dimension"],
      conversion_behavior_list: values["conversion_behavior_list"],
      excluded_day: values["excluded_day"]
    },
    device_brand_model: {
      included_list: values["included_list"],
      excluded_list: values["excluded_list"]
    },
    wechat_ad_behavior: {
      actions: values["actions"],
      excluded_actions: values["excluded_actions"],
      corp_id: values["corp_id"]
    }
  };
}

async function echoTencentConfig(data: any) {
  if (data.config) {
    await formApi.setValues(data.config);
  }
}

async function popUpCancel() {
  formApi.resetForm();
}

defineExpose({
  submitTencentConfig,
  echoTencentConfig,
  popUpCancel
});

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      class: "w-full"
    }
    // labelClass: 'w-2/6',
  },
  layout: "horizontal",
  schema: [
    // ========== 地理位置定向 ==========
    {
      component: "Select",
      fieldName: "geo_location_select",
      componentProps: {
        options: [
          { label: "不限", value: "no" },
          { label: "自定义", value: "customer" }
        ]
      },
      label: "地理位置定向",
      defaultValue: "no"
    },
    {
      component: "Select",
      fieldName: "location_types",
      componentProps: {
        options: Location_types,
        mode: "multiple"
      },
      label: "地点类型",
      defaultValue: [""],
      rules: "required",
      dependencies: {
        show: async () => {
          const data = await formApi.getValues();
          return data["geo_location_select"] === "customer";
        },
        triggerFields: ["geo_location_select"],
      }
    },
    {
      component: "Select",
      fieldName: "regions",
      componentProps: {
        options: [], // 需要通过 targeting_tags/get 接口获取
        mode: "multiple",
        filterOption: true,
        showSearch: true
      },
      label: "省市区县",
      defaultValue: [],
      dependencies: {
        show: async () => {
          const data = await formApi.getValues();
          return data["geo_location_select"] === "customer";
        },
        triggerFields: ["geo_location_select"]
      }
    },
    {
      component: "Select",
      fieldName: "business_districts",
      componentProps: {
        options: [], // 需要通过 targeting_tags/get 接口获取
        mode: "multiple",
        filterOption: true,
        showSearch: true
      },
      label: "商圈",
      defaultValue: [],
      dependencies: {
        show: async () => {
          const data = await formApi.getValues();
          return data["geo_location_select"] === "customer";
        },
        triggerFields: ["geo_location_select"]
      }
    },
    {
      component: markRaw(CustomLocationInput),
      fieldName: "custom_locations",
      label: "自定义地理位置",
      defaultValue: [],
      dependencies: {
        show: async () => {
          const data = await formApi.getValues();
          return data["geo_location_select"] === "customer";
        },
        triggerFields: ["geo_location_select"]
      }
    },
    {
      component: "Switch",
      fieldName: "geo_location_auto_audience",
      label: "地域优选",
      defaultValue: false,
      dependencies: {
        show: async () => {
          const data = await formApi.getValues();
          return data["geo_location_select"] === "customer";
        },
        triggerFields: ["geo_location_select"]
      }
    },

    // ========== 用户属性定向 ==========
    {
      component: "Select",
      fieldName: "gender",
      componentProps: {
        options: Gender,
        mode: "multiple"
      },
      label: "性别",
      defaultValue: []
    },
    {
      component: markRaw(AgeRangeInput),
      fieldName: "age",
      label: "年龄范围",
      defaultValue: []
    },
    {
      component: "Select",
      fieldName: "education",
      componentProps: {
        options: Education,
        mode: "multiple"
      },
      label: "学历",
      defaultValue: []
    },
    {
      component: "Select",
      fieldName: "marital_status",
      componentProps: {
        options: Marital_status,
        mode: "multiple"
      },
      label: "婚恋状态",
      defaultValue: []
    },

    // 排除已转化人群行为定向，排除已转化用户定向范围
    {
      component: "Select",
      fieldName: "excluded_dimension",
      componentProps: {
        mode: "multiple",
        options: Excluded_dimension
      },
      label: "排除已转化人群",
      defaultValue: []
    },

    {
      component: "Select",
      fieldName: "conversion_behavior_list",
      componentProps: {
        mode: "multiple",
        options: Conversion_behavior_list,
        max: 2
      },
      label: "转化行为",
      defaultValue: []
    },

    {
      component: "Select",
      fieldName: "excluded_day",
      componentProps: {
        mode: "multiple",
        options: Excluded_day,
        max: 2
      },
      label: "转化行为",
      defaultValue: []
    },


    // ========== 应用安装定向 ==========
    {
      component: "Select",
      fieldName: "app_install_status",
      componentProps: {
        options: App_install_status,
        mode: "multiple"
      },
      label: "应用安装",
      defaultValue: []
    },

    // ========== 人群定向 ==========
    {
      component: "Select",
      fieldName: "custom_audience",
      componentProps: {
        options: [], // 需要通过创建人群接口获取
        mode: "multiple",
        filterOption: true,
        showSearch: true
      },
      label: "定向用户群",
      defaultValue: []
    },
    {
      component: "Select",
      fieldName: "excluded_custom_audience",
      componentProps: {
        options: [], // 需要通过创建人群接口获取
        mode: "multiple",
        filterOption: true,
        showSearch: true
      },
      label: "排除用户群",
      defaultValue: []
    },
    // ========== 设备品牌型号定向，该功能即将下线，仅部分行业灰度开放，如有问题可联系您的客户运 ==========
    {
      component: "Select",
      fieldName: "included_list",
      componentProps: {
        options: [], // 需要通过接口获取
        mode: "multiple",
        filterOption: true,
        showSearch: true
      },
      label: "设备品牌型号",
      defaultValue: []
    },
    {
      component: "Select",
      fieldName: "excluded_list",
      componentProps: {
        options: [], // 需要通过接口获取
        mode: "multiple",
        filterOption: true,
        showSearch: true
      },
      label: "排除设备品牌型号",
      defaultValue: []
    },
    {
      component: "Select",
      fieldName: "user_os",
      componentProps: {
        options: User_os,
        mode: "multiple"
      },
      label: "操作系统",
      defaultValue: []
    },

    {
      component: "Select",
      fieldName: "network_type",
      componentProps: {
        options: Network_type,
        mode: "multiple"
      },
      label: "联网方式",
      defaultValue: []
    },
    {
      component: "Select",
      fieldName: "device_price",
      componentProps: {
        options: Device_price,
        mode: "multiple"
      },
      label: "设备价格",
      defaultValue: []
    },

    // ========== 微信营销行为定向 ==========
    {
      component: "Select",
      fieldName: "actions",
      componentProps: {
        options: Wechat_ad_behavior_actions,
        mode: "multiple"
      },
      label: "微信再营销类型",
      defaultValue: []
    },
    {
      component: "Select",
      fieldName: "excluded_actions",
      componentProps: {
        options: Wechat_ad_behavior_actions,
        mode: "multiple"
      },
      label: "微信排除再营销类型",
      defaultValue: []
    },
    {
      component: "Input",
      fieldName: "corp_id",
      componentProps: {
        placeholder: "企业微信ID（选择已添加过企业微信时必填）"
      },
      label: "企业微信ID",
      defaultValue: ""
    },

    // ========== 游戏消费能力 ==========
    {
      component: "Select",
      fieldName: "game_consumption_level",
      componentProps: {
        options: Game_consumption_level,
        mode: "multiple"
      },
      label: "游戏消费能力",
      defaultValue: []
    },
    {
      component: "Select",
      fieldName: "excluded_os",
      componentProps: {
        options: Excluded_os,
        mode: "multiple"
      },
      label: "排除操作系统",
      defaultValue: []
    }
  ]
});
</script>

<template>
  <div>
    <Form>
    </Form>
  </div>
</template>

<style scoped lang="scss">
</style>
