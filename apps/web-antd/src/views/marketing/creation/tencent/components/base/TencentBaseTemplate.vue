<script setup lang="ts" name="TencentBaseTemplate">
// 腾讯基础模板
import { Col, Row } from "ant-design-vue";

import TencentCampaign from "#/views/marketing/creation/tencent/components/TencentCampaign.vue";
import TencentAdgroup from "#/views/marketing/creation/tencent/components/TencentAdgroup.vue";
import CreativeGroupSelector
  from "#/views/marketing/creation/components/creative/CreativeGroupSelector.vue";
import TitleSelector from "#/views/marketing/creation/components/title/TitleSelector.vue";
import type {
  AudienceConfigData,
  MaterialData,
  TitlePackageConfigData
} from "#/views/marketing/creation/creation";
import type {
  TencentAdgroupData,
  TencentCampaignData,
  TencentCreation
} from "#/views/marketing/creation/tencent/tencent";
import {
  Marketing_carrier_type,
  Tencent_adx_realtime_type,
  Tencent_auto_derived_creative_method_type_list,
  Tencent_bid_mode,
  Tencent_bid_scene,
  Tencent_configured_status,
  Tencent_cost_constraint_scene,
  Tencent_creative_delivery_mode,
  Tencent_deep_conversion_type,
  Tencent_deep_conversion_worth_spec_goal,
  Tencent_display_scene,
  Tencent_dynamic_ad_type,
  Tencent_dynamic_creative_type,
  Tencent_ecom_pkam_switch,
  Tencent_exploration_strategy,
  Tencent_marketing_goal,
  Tencent_marketing_sub_goal,
  Tencent_marketing_target_type,
  Tencent_mobile_union,
  Tencent_pc_scene,
  Tencent_qbsearch_scene,
  Tencent_search_expand_targeting_switch,
  Tencent_short_play_pay_type,
  Tencent_site_set_validate_model,
  Tencent_smart_bid_type,
  Tencent_smart_coupon_mode,
  Tencent_smart_targeting_mode,
  Tencent_tencent_news,
  Tencent_wechat_search_scene,
  TencentOptimization_goal,
  Tencnet_site_set
} from "#/views/marketing/creation/tencent/tencent_enums";

const emit = defineEmits(["update:campaign", "update:adgroup",
  "update:audiencePackage", "update:updateMaterial", "update:titlePackage"]);


const { creationInfo } = defineProps({
  creationInfo: {
    type: Object as () => TencentCreation,
    default: () => {
      return {};
    }
  }
});


/**
 * update campaign
 */
function updateCampaign(campaign: TencentCampaignData) {
  emit("update:campaign", campaign);
}


/**
 * update adgroup
 */
function updateAdgroup(adgroup: TencentAdgroupData) {
  emit("update:adgroup", adgroup);
}


/**
 * 场景定向，ADX 程序化投放不可填写提交。
 */
const scene_spec = [
  // scene_spec 开关 场景定向，ADX 程序化投放不可填写提交。
  {
    component: "Switch",
    formItemClass: "w-[250px]",
    fieldName: "scene_spec_switch",
    label: "场景定向",
    defaultValue: false,
    componentProps: {
      checked: false
    }
  },

  {
    component: "Select",
    fieldName: "scene_spec_mobile_union",
    label: "移动联盟场景定向",
    componentProps: {
      options: Tencent_mobile_union
    },
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["scene_spec_switch"];
      },
      triggerFields: ["scene_spec_switch"]
    }
  },

  {
    component: "Select",
    fieldName: "scene_spec_exclude_mobile_union",
    label: "排除移动联盟流量场景",
    componentProps: {
      options: Tencent_mobile_union
    },
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["scene_spec_switch"];
      },
      triggerFields: ["scene_spec_switch"]
    }
  },


  {
    component: "Select",
    fieldName: "scene_spec_union_position_package",
    label: "定投联盟流量包列表",
    componentProps: {
      options: []
    },
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["scene_spec_switch"];
      },
      triggerFields: ["scene_spec_switch"]
    }
  },

  {
    component: "Select",
    fieldName: "scene_spec_exclude_union_position_package",
    label: "屏蔽联盟流量包列表",
    componentProps: {
      options: []
    },
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["scene_spec_switch"];
      },
      triggerFields: ["scene_spec_switch"]
    }
  },


  {
    component: "Select",
    fieldName: "scene_spec_tencent_news",
    label: "屏蔽联盟流量包列表",
    componentProps: {
      options: Tencent_tencent_news
    },
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["scene_spec_switch"];
      },
      triggerFields: ["scene_spec_switch"]
    }
  },

  {
    component: "Select",
    fieldName: "scene_spec_display_scene",
    label: "展示场景",
    componentProps: {
      options: Tencent_display_scene
    },
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["scene_spec_switch"];
      },
      triggerFields: ["scene_spec_switch"]
    }
  },


  {
    component: "Select",
    fieldName: "official_account_media_category",
    label: "公众号媒体类型",
    componentProps: {
      options: []
    },
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["scene_spec_switch"];
      },
      triggerFields: ["scene_spec_switch"]
    }
  },


  {
    component: "Select",
    fieldName: "mini_program_and_mini_game",
    label: "小程序小游戏流量类型",
    componentProps: {
      options: []
    },
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["scene_spec_switch"];
      },
      triggerFields: ["scene_spec_switch"]
    }
  },


  {
    component: "Select",
    fieldName: "pay_scene",
    label: "订单详情页消费场景",
    componentProps: {
      options: []
    },
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["scene_spec_switch"];
      },
      triggerFields: ["scene_spec_switch"]
    }
  },

  {
    component: "Select",
    fieldName: "wechat_position",
    label: "微信公众号与小程序定投",
    componentProps: {
      options: []
    },
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["scene_spec_switch"] && currentValue["site_set"] === "SITE_SET_WECHAT";
      },
      triggerFields: ["scene_spec_switch"]
    }
  },

  {
    component: "Select",
    fieldName: "mobile_union_category",
    label: "微信公众号与小程序定投",
    componentProps: {
      options: []
    },
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["scene_spec_switch"] && currentValue["site_set"] === "SITE_SET_MOBILE_UNION";
      },
      triggerFields: ["scene_spec_switch"]
    }
  },

  {
    component: "Select",
    fieldName: "qbsearch_scene",
    label: "QQ 浏览器、应用宝流量场景",
    componentProps: {
      options: Tencent_qbsearch_scene
    },
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["scene_spec_switch"];
      },
      triggerFields: ["scene_spec_switch"]
    }
  },

  {
    component: "Select",
    fieldName: "wechat_channels_scene",
    label: "微信视频号定投",
    componentProps: {
      options: []
    },
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["scene_spec_switch"];
      },
      triggerFields: ["scene_spec_switch"]
    }
  },

  {
    component: "Select",
    fieldName: "pc_scene",
    label: "PC 端定投",
    componentProps: {
      options: Tencent_pc_scene
    },
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["scene_spec_switch"];
      },
      triggerFields: ["scene_spec_switch"]
    }
  },


  {
    component: "Select",
    fieldName: "wechat_search_scene",
    label: "搜一搜流量场景",
    componentProps: {
      options: Tencent_wechat_search_scene
    },
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["scene_spec_switch"];
      },
      triggerFields: ["scene_spec_switch"]
    }
  }


];


/**
 * 营销载体详情
 */
const marketing_carrier_detail = [
  {
    component: "Input",
    fieldName: "marketing_carrier_id",
    label: "营销载体id",
    dependencies: {
      show: (currentValue: any) => {
        return (
          currentValue["marketing_carrier_type"] === "MARKETING_CARRIER_TYPE_APP_ANDROID" ||
          currentValue["marketing_carrier_type"] === "MARKETING_CARRIER_TYPE_APP_IOS" ||
          currentValue["marketing_carrier_type"] === "MARKETING_CARRIER_TYPE_WECHAT_MINI_GAME"
        );
      },
      triggerFields: ["marketing_carrier_detail_switch", "marketing_carrier_type"],
      rules: () => {
        return "required";
      }
    }
  },
  {
    component: "Input",
    fieldName: "marketing_carrier_name",
    label: "营销载体名称",
    dependencies: {
      show: (currentValue: any) => {
        return (
          currentValue["marketing_carrier_type"] === "MARKETING_CARRIER_TYPE_APP_ANDROID" ||
          currentValue["marketing_carrier_type"] === "MARKETING_CARRIER_TYPE_APP_IOS" ||
          currentValue["marketing_carrier_type"] === "MARKETING_CARRIER_TYPE_WECHAT_MINI_GAME"
        );
      },
      triggerFields: ["marketing_carrier_type"]
    }
  },
  {
    component: "Input",
    fieldName: "marketing_sub_carrier_id",
    label: "营销子载体ID",
    dependencies: {
      show: (currentValue: any) => {
        return (
          currentValue["marketing_carrier_type"] === "MARKETING_CARRIER_TYPE_APP_ANDROID" ||
          currentValue["marketing_carrier_type"] === "MARKETING_CARRIER_TYPE_APP_IOS" ||
          currentValue["marketing_carrier_type"] === "MARKETING_CARRIER_TYPE_WECHAT_MINI_GAME"
        );
      },
      triggerFields: ["marketing_carrier_type"]
    }
  }

];


/**
 * 深度优化
 * oCPA 深度优化内容，若此字段不传，或传空则视为无限制条件，ADX 程序化投放不可填写提交。
 */
const deep_conversion_spec = [
  // deep_conversion_spec 开关
  {
    component: "Switch",
    formItemClass: "w-[250px]",
    fieldName: "deep_conversion_spec_switch",
    label: "oCPA 深度优化配置",
    defaultValue: false,
    componentProps: {
      checked: false
    }
  },

  {
    component: "Select",
    fieldName: "deep_conversion_type",
    componentProps: {
      options: Tencent_deep_conversion_type
    },
    label: "oCPA 深度优化价值配置类型",
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["deep_conversion_spec_switch"];
      },
      triggerFields: ["deep_conversion_spec_switch"],
      rules: (currentValue: any) => {
        return currentValue["deep_conversion_spec_switch"] ? "required" : "";
      }
    }
  },


  // oCPA 优化转化行为配置
  {
    component: "Select",
    fieldName: "deep_conversion_behavior_spec_goal",
    componentProps: {
      options: TencentOptimization_goal
    },
    label: "优化转化行为目标",
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["deep_conversion_spec_switch"] && currentValue["deep_conversion_type"] === "DEEP_CONVERSION_BEHAVIOR";
      },
      triggerFields: ["deep_conversion_spec_switch", "deep_conversion_type"]
    }
  },


  {
    component: "Input",
    fieldName: "deep_conversion_behavior_spec_bid_amount",
    label: "深度优化行为的出价",
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["deep_conversion_spec_switch"] && currentValue["deep_conversion_type"] === "DEEP_CONVERSION_BEHAVIOR";
      },
      triggerFields: ["deep_conversion_spec_switch", "deep_conversion_type"]
    }
  },


  // oCPA 优化 ROI 配置
  {
    component: "Select",
    fieldName: "deep_conversion_worth_spec_goal",
    componentProps: {
      options: Tencent_deep_conversion_worth_spec_goal
    },
    label: "优化ROI目标",
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["deep_conversion_spec_switch"] && currentValue["deep_conversion_type"] === "DEEP_CONVERSION_WORTH";
      },
      triggerFields: ["deep_conversion_spec_switch", "deep_conversion_type"]
    }
  },

  {
    component: "Input",
    fieldName: "deep_conversion_worth_spec_expected_roi",
    label: "深度优化价值效果值",
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["deep_conversion_spec_switch"] && currentValue["deep_conversion_type"] === "DEEP_CONVERSION_WORTH";
      },
      triggerFields: ["deep_conversion_spec_switch", "deep_conversion_type"]
    }
  },

  // oCPC/oCPM 优化 ROI 配置
  {
    component: "Select",
    fieldName: "deep_conversion_worth_advanced_spec_goal",
    componentProps: {
      options: Tencent_deep_conversion_worth_spec_goal
    },
    label: "优化 ROI 目标",
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["deep_conversion_spec_switch"] && currentValue["deep_conversion_type"] === "DEEP_CONVERSION_WORTH_ADVANCED";
      },
      triggerFields: ["deep_conversion_spec_switch", "deep_conversion_type"]
    }
  },

  {
    component: "Input",
    fieldName: "deep_conversion_worth_advanced_spec_expected_roi",
    label: "深度优化价值效果值",
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["deep_conversion_spec_switch"] && currentValue["deep_conversion_type"] === "DEEP_CONVERSION_WORTH_ADVANCED";
      },
      triggerFields: ["deep_conversion_spec_switch", "deep_conversion_type"]
    }
  },

  // oCPX 深度辅助配置
  {
    component: "Select",
    fieldName: "deep_conversion_behavior_advanced_spec_goal",
    componentProps: {
      options: TencentOptimization_goal
    },
    label: "优化 ROI 目标",
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["deep_conversion_spec_switch"] && currentValue["deep_conversion_type"] === "DEEP_CONVERSION_BEHAVIOR_ADVANCED";
      },
      triggerFields: ["deep_conversion_spec_switch", "deep_conversion_type"]
    }
  },

  {
    component: "Input",
    fieldName: "deep_conversion_behavior_advanced_spec_bid_amount",
    label: "深度优化价值效果值",
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["deep_conversion_spec_switch"] && currentValue["deep_conversion_type"] === "DEEP_CONVERSION_BEHAVIOR_ADVANCED";
      },
      triggerFields: ["deep_conversion_spec_switch", "deep_conversion_type"]
    }
  }

];


/**
 * 创意增强
 *
 * 创意增强 MAX 偏好设置，非必选项，如不设置偏好，则将根据默认偏好全选方式生效。
 */
const auto_derived_creative_preference = [
  {
    component: "Switch",
    formItemClass: "w-[250px]",
    fieldName: "auto_derived_creative_enabled",
    label: "创意增强 MAX 偏好设置",
    defaultValue: false,
    componentProps: {
      checked: false
    }
  },


  // 创意增强 MAX 偏好设置列表
  {
    component: "Select",
    fieldName: "auto_derived_creative_method_type_list",
    label: "创意增强 MAX 偏好设置列表",
    componentProps: {
      options: Tencent_auto_derived_creative_method_type_list,
      mode: "multiple"
    },
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["auto_derived_creative_enabled"];
      },
      triggerFields: ["auto_derived_creative_enabled"]
    }
  }
];


/**
 * 产品外部 id 数据，当推广产品类型是以下类型的时候
 */
const marketing_asset_outer_spec = [
  {
    component: "Switch",
    formItemClass: "w-[250px]",
    fieldName: "marketing_asset_outer_spec_switch",
    label: "营销资产外部配置",
    defaultValue: false,
    componentProps: {
      checked: false
    }
  },


  {
    component: "Select",
    fieldName: "marketing_target_type",
    label: "营销目标类型",
    componentProps: {
      options: Tencent_marketing_target_type
    },
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["marketing_asset_outer_spec_switch"];
      },
      triggerFields: ["marketing_asset_outer_spec_switch"]
    }
  },

  {
    component: "Input",
    fieldName: "marketing_asset_outer_id",
    label: "营销资产外部ID",
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["marketing_asset_outer_spec_switch"];
      },
      triggerFields: ["marketing_asset_outer_spec_switch"]
    }
  },
  {
    component: "Input",
    fieldName: "marketing_asset_outer_name",
    label: "营销资产外部名称",
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["marketing_asset_outer_spec_switch"];
      },
      triggerFields: ["marketing_asset_outer_spec_switch"]
    }
  },
  {
    component: "Input",
    fieldName: "marketing_asset_outer_sub_id",
    label: "营销资产外部子ID",
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["marketing_asset_outer_spec_switch"];
      },
      triggerFields: ["marketing_asset_outer_spec_switch"]
    }
  }
];


/**
 *
 */
const mpa_spec = [
  {
    component: "Switch",
    formItemClass: "w-[250px]",
    fieldName: "mpa_spec_switch",
    label: "MPA配置",
    defaultValue: false,
    componentProps: {
      checked: false
    }
  },

  {
    component: "Select",
    fieldName: "mpa_recommend_method_ids",
    label: "推荐方式ID列表",
    componentProps: {
      options: [],
      mode: "multiple"
    },
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["mpa_spec_switch"];
      },
      triggerFields: ["mpa_spec_switch"]
    }
  },


  {
    component: "Input",
    fieldName: "mpa_product_series_id",
    label: "商品系列ID",
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["mpa_spec_switch"];
      },
      triggerFields: ["mpa_spec_switch"]
    }
  },

  {
    component: "Input",
    fieldName: "mpa_product_catalog_id",
    label: "商品库id",
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["mpa_spec_switch"];
      },
      triggerFields: ["mpa_spec_switch"]
    }
  }
];


/**
 * 动态内容营销属性，只有当动态营销类型 dynamic_ad_type 为动态内容营销时，才可以设置该字段
 *
 */
const dca_spec = [
  {
    component: "Select",
    fieldName: "recommend_method_ids",
    componentProps: {
      options: [
        {
          label: "95",
          value: "95"
        }
      ],
      mode: "multiple"
    },
    label: "动态营销类型",
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["dynamic_ad_type"] === "DYNAMIC_AD_TYPE_DYNAMIC_CONTENT";
      },
      triggerFields: ["dynamic_ad_type"]
    }
  },

  {
    component: "Input",
    fieldName: "set_id",
    label: "动态内容营销的素材集合",
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["dynamic_ad_type"] === "DYNAMIC_AD_TYPE_DYNAMIC_CONTENT";
      },
      triggerFields: ["dynamic_ad_type"]
    }
  }
];


/**
 * 高价值范围探索，功能灰度开放中，如需使用可联系您的客户运营。ADX 程序化投放不可填写提交。
 */
const aoi_optimization_strategy = [
  {
    component: "Switch",
    formItemClass: "w-[250px]",
    fieldName: "aoi_optimization_strategy_switch",
    label: "AOI优化策略",
    defaultValue: false,
    componentProps: {
      checked: false
    }
  },

  {
    component: "Switch",
    formItemClass: "w-[250px]",
    fieldName: "aoi_optimization_strategy_enabled",
    label: "AOI优化策略是否启用",
    defaultValue: false,
    componentProps: {
      checked: false
    },
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["aoi_optimization_strategy_switch"];
      },
      triggerFields: ["aoi_optimization_strategy_switch"]
    }
  },

  {
    component: "Select",
    fieldName: "aoi_id_list",
    label: "AOI ID列表",
    componentProps: {
      options: [],
      mode: "multiple"
    },
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["aoi_optimization_strategy_switch"] && currentValue["aoi_optimization_strategy_enabled"];
      },
      triggerFields: ["aoi_optimization_strategy_switch", "aoi_optimization_strategy_enabled"]
    }
  }

];


/**
 * 云选相关参数，ADX 程序化投放不可填写提交。
 */
const cloud_union_spec = [
  // cloud_union_spec 开关
  {
    component: "Switch",
    formItemClass: "w-[250px]",
    fieldName: "cloud_union_spec_switch",
    label: "云选",
    defaultValue: false,
    componentProps: {
      checked: false
    }
  },

  {
    component: "Select",
    fieldName: "cloud_union_spec_roi_goal",
    componentProps: {
      options: Tencent_deep_conversion_worth_spec_goal
    },
    label: "动态营销-优化ROI目标",
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["cloud_union_spec_switch"];
      },
      triggerFields: ["cloud_union_spec_switch"],
      rules: (currentValue: any) => {
        return currentValue["cloud_union_spec_switch"] ? "required" : "";
      }
    }
  },

  {
    component: "Input",
    fieldName: "cloud_union_spec_expected_roi",
    label: "深度优化价值效果值",
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["cloud_union_spec_switch"];
      },
      triggerFields: ["cloud_union_spec_switch"],
      rules: (currentValue: any) => {
        return currentValue["cloud_union_spec_switch"] ? "required" : "";
      }
    }
  }
];

/**
 * 附加商品属性，ADX 程序化投放不可填写提交。
 */
const additional_product_spec = [
  {
    component: "Switch",
    formItemClass: "w-[250px]",
    fieldName: "additional_product_spec_switch",
    label: "附加产品配置",
    defaultValue: false,
    componentProps: {
      checked: false
    }
  },

  {
    component: "Input",
    fieldName: "additional_product_spec_product_catalog_id",
    label: "商品库id",
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["additional_product_spec_switch"];
      },
      triggerFields: ["additional_product_spec_switch"]
    }
  },

  {
    component: "Input",
    fieldName: "additional_product_spec_product_outer_id",
    label: "商品外部ID",
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["additional_product_spec_switch"];
      },
      triggerFields: ["additional_product_spec_switch"]
    }
  }

];


// 计划表单字段
const campaignFormFields = [
  {
    component: "AdNameGen",
    fieldName: "adgroup_name",
    label: "名字",
    rules: "required"
  },
  {
    component: "Select",
    fieldName: "marketing_goal",
    componentProps: {
      options: Tencent_marketing_goal
    },
    label: "营销目的",
    rules: "required"
  },
  {
    component: "Select",
    fieldName: "marketing_sub_goal",
    componentProps: {
      options: Tencent_marketing_sub_goal
    },
    label: "二级营销目的"
  },

  {
    component: "Select",
    fieldName: "marketing_carrier_type",
    componentProps: {
      options: Marketing_carrier_type
    },
    label: "营销载体",
    rules: "required"
  },

  // 营销载体详情
  ...marketing_carrier_detail,


  {
    component: "DatePicker",
    fieldName: "begin_date",
    componentProps: {
      format: "YYYY-MM-DD",
      valueFormat: "YYYY-MM-DD"
    },
    label: "开始投放日期",
    rules: "required"
  },
  {
    component: "DatePicker",
    fieldName: "end_date",
    componentProps: {
      format: "YYYY-MM-DD",
      valueFormat: "YYYY-MM-DD"
    },
    label: "结束投放日期",
    rules: "required"
  },

  {
    component: "Input",
    fieldName: "bid_amount",
    label: "出价",
    rules: "required",
    formItemClass: "items-baseline"
  },
  {
    component: "Select",
    fieldName: "optimization_goal",
    componentProps: {
      options: TencentOptimization_goal
    },
    label: "优化目标",
    rules: "required"
  },

  {
    component: "Input",
    fieldName: "time_series",
    componentProps: {},
    label: "投放时间段",
    rules: "required"
  },

  {
    component: "Switch",
    fieldName: "automatic_site_enabled",
    formItemClass: "w-[250px]",
    componentProps: {
      checked: false
    },
    defaultValue: false,
    label: "智能版位"
  },

  {
    component: "Select",
    fieldName: "site_set",
    componentProps: {
      options: Tencnet_site_set,
      mode: "multiple"
    },
    label: "投放版位集合",
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["automatic_site_enabled"];
      },
      triggerFields: ["automatic_site_enabled"]
    }
  },

  {
    component: "Select",
    fieldName: "exploration_strategy",
    componentProps: {
      options: Tencent_exploration_strategy
    },
    label: "自动版位探索策略",
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["automatic_site_enabled"] === true;
      },
      triggerFields: ["automatic_site_enabled"]
    }
  },

  {
    component: "Select",
    fieldName: "priority_site_set",
    componentProps: {
      options: []
    },
    label: "优先版位集合",
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["exploration_strategy"] === "STEADY_EXPLORATION";
      },
      triggerFields: ["exploration_strategy"],
      rules: (currentValue: any) => {
        return currentValue["exploration_strategy"] === "STEADY_EXPLORATION" ? "required" : "";
      }
    }
  },

  {
    component: "Input",
    fieldName: "daily_budget",
    label: "日预算",
    rules: "required"
  },


  // 营销载体
  ...scene_spec,

  {
    component: "Select",
    label: "用户行为数据源",
    fieldName: "user_action_sets",
    componentProps: {
      options: []
    }
  },


  ...deep_conversion_spec,


  // 一键起量开关定义
  {
    component: "Switch",
    formItemClass: "w-[250px]",
    fieldName: "auto_acquisition_enabled",
    label: "键起量开关",
    defaultValue: false,
    componentProps: {
      checked: false
    }
  },

  {
    component: "Input",
    fieldName: "auto_acquisition_budget",
    label: "一键起量预算",
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["auto_acquisition_enabled"];
      },
      triggerFields: ["auto_acquisition_enabled"],
      rules: (currentValue: any) => {
        return currentValue["auto_acquisition_enabled"] ? "required" : "";
      }
    }
  },

  // 出价类型
  {
    component: "Select",
    fieldName: "smart_bid_type",
    label: "出价类型",
    componentProps: {
      options: Tencent_smart_bid_type
    }
  },

  {
    component: "Input",
    fieldName: "smart_cost_cap",
    label: "自动出价",
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["smart_bid_type"] === "SMART_BID_TYPE_SYSTEMATIC";
      },
      triggerFields: ["smart_bid_type"]
    }
  },

  ...auto_derived_creative_preference,

  // 搜索定向拓展开关，
  {
    component: "Select",
    fieldName: "search_expand_targeting_switch",
    label: "搜索定向拓展开关",
    componentProps: {
      options: Tencent_search_expand_targeting_switch
    }
  },

  {
    component: "Switch",
    formItemClass: "w-[250px]",
    fieldName: "auto_derived_landing_page_switch",
    label: "是否开启自动衍生落地页开关",
    defaultValue: false,
    componentProps: {
      checked: false
    }
  },

  {
    component: "Select",
    fieldName: "bid_scene",
    label: "出价场景",
    componentProps: {
      options: Tencent_bid_scene
    }
  },

  {
    component: "Select",
    fieldName: "configured_status",
    label: "状态",
    componentProps: {
      options: Tencent_configured_status
    },
    defaultValue: "AD_STATUS_SUSPEND"
  },

  // marketing_asset_outer_spec 开关
  ...marketing_asset_outer_spec,

  {
    component: "Select",
    fieldName: "poi_list",
    label: "门店 id 列表",
    componentProps: {
      options: [],
      mode: "multiple"
    }
  },


  {
    component: "Select",
    fieldName: "ecom_pkam_switch",
    label: "一方人群跑量加强开关状态",
    componentProps: {
      options: Tencent_ecom_pkam_switch
    }
  },


  {
    component: "Select",
    fieldName: "forward_link_assist",
    label: "一方人群跑量加强开关状态",
    componentProps: {
      options: TencentOptimization_goal
    }
  },


  // mpa_spec 开关

  ...mpa_spec,

  // 成本控制
  {
    component: "Select",
    fieldName: "cost_constraint_scene",
    label: "一方人群跑量加强开关状态",
    componentProps: {
      options: Tencent_cost_constraint_scene
    }
  },

  {
    component: "Input",
    fieldName: "custom_cost_cap",
    label: "用户输入的成本上限"
  },


  //动态营销类型
  {
    component: "Select",
    fieldName: "short_play_pay_type",
    label: "售卖方式类型",
    componentProps: {
      options: Tencent_short_play_pay_type
    }
  },


  {
    component: "Select",
    fieldName: "sell_strategy_id",
    label: "售卖方式类型",
    componentProps: {
      options: []
    },
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["short_play_pay_type"] === "SHORT_PLAY_PAY_TYPE_CHARGE_PLAY";
      },
      triggerFields: ["short_play_pay_type"]
    }
  },

  {
    component: "Select",
    fieldName: "dynamic_ad_type",
    componentProps: {
      options: Tencent_dynamic_ad_type
    },
    label: "动态营销类型"
  },

  ...dca_spec,


  // aoi_optimization_strategy 开关
  ...aoi_optimization_strategy,
  // 云选
  ...cloud_union_spec,


  // additional_product_spec 开关
  ...additional_product_spec,


  {
    component: "Switch",
    formItemClass: "w-[250px]",
    fieldName: "live_recommend_strategy_enabled",
    label: "直播种草人群探索",
    defaultValue: false,
    componentProps: {
      checked: false
    }
  },

  {
    component: "Input",
    fieldName: "custom_cost_roi_cap",
    label: "控制成本的期望 ROI"
  },

  {
    component: "Switch",
    formItemClass: "w-[250px]",
    fieldName: "search_expansion_switch",
    label: "搜索扩量",
    defaultValue: false,
    componentProps: {
      checked: false
    }
  },

  {
    component: "Select",
    fieldName: "adx_realtime_type",
    label: "ADX 程序化投放素材实时回复类型",
    componentProps: {
      options: Tencent_adx_realtime_type
    }
  },

  {
    component: "Switch",
    formItemClass: "w-[250px]",
    fieldName: "enable_steady_exploration",
    label: "搜索扩量",
    defaultValue: false,
    componentProps: {
      checked: false
    }
  },

  {
    component: "Select",
    fieldName: "smart_targeting_mode",
    label: "营销智能定向功能",
    componentProps: {
      options: Tencent_smart_targeting_mode
    }
  },

  {
    component: "Select",
    fieldName: "smart_coupon_mode",
    label: "小店智券开关",
    componentProps: {
      options: Tencent_smart_coupon_mode
    }
  }
];


// 显示标签名字
const campaignShowLabel: Record<string, string> = {
  adgroup_name: "营销单元名字",
  marketing_goal: "营销目标",
  begin_date: "开始时间",
  end_date: "结束时间",
  daily_budget: "日预算",
  bid_mode: "出价方式"
};


// 广告字段 程序化创意信息，（备注：程序化 adx 投放无需提交入参）

const program_creative_info = [
  {
    component: "Switch",
    formItemClass: "w-[250px]",
    fieldName: "program_creative_info_switch",
    label: "程序创意信息",
    defaultValue: false,
    componentProps: {
      checked: false
    }
  },

  {
    component: "Input",
    fieldName: "material_derive_id",
    label: "素材衍生ID",
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["program_creative_info_switch"];
      },
      triggerFields: ["program_creative_info_switch"]
    }
  },

  {
    component: "Select",
    fieldName: "bid_mode",
    label: "出价方式",
    componentProps: {
      options: Tencent_bid_mode
    },
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["program_creative_info_switch"];
      },
      triggerFields: ["program_creative_info_switch"]
    }
  },

  {
    component: "Input",
    fieldName: "derive_version",
    label: "衍生版本",
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["program_creative_info_switch"];
      },
      triggerFields: ["program_creative_info_switch"]
    }
  },

  {
    component: "Select",
    fieldName: "original_material_id_list",
    label: "原始素材ID列表",
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["program_creative_info_switch"];
      },
      triggerFields: ["program_creative_info_switch"]
    }
  },

  {
    component: "Select",
    fieldName: "original_adcreative_template_id_list",
    label: "原始创意模板ID列表",
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["program_creative_info_switch"];
      },
      triggerFields: ["program_creative_info_switch"]
    }
  },


  {
    component: "Input",
    fieldName: "original_cover_image_id",
    label: "原始封面图片ID",
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["program_creative_info_switch"];
      },
      triggerFields: ["program_creative_info_switch"]
    }
  },

  {
    component: "Select",
    fieldName: "derive_data_list",
    label: "衍生信息列表",
    dependencies: {
      show: (currentValue: any) => {
        return currentValue["program_creative_info_switch"];
      },
      triggerFields: ["program_creative_info_switch"]
    }
  }
];

// 广告表单字段
const adgroupFormFields = [
  {
    component: "AdNameGen",
    fieldName: "dynamic_creative_name",
    label: "动态创意名称",
    rules: "required"
  },
  {
    component: "Input",
    fieldName: "creative_template_id",
    label: "创意模板ID"
  },
  {
    component: "Select",
    fieldName: "delivery_mode",
    label: "投放模式",
    componentProps: {
      options: Tencent_creative_delivery_mode
    }
  },
  {
    component: "Select",
    fieldName: "dynamic_creative_type",
    label: "动态创意类型",
    componentProps: {
      options: Tencent_dynamic_creative_type
    }
  },
  {
    component: "Switch",
    formItemClass: "w-[250px]",
    fieldName: "auto_derived_program_creative_switch",
    label: "自动衍生程序创意开关",
    defaultValue: false,
    componentProps: {
      checked: false
    }
  },
  {
    component: "Select",
    fieldName: "configured_status",
    label: "状态",
    componentProps: {
      options: Tencent_configured_status
    },
    defaultValue: "AD_STATUS_SUSPEND"
  },
  {
    component: "Select",
    fieldName: "site_set_validate_model",
    label: "版位验证模型",
    componentProps: {
      options: Tencent_site_set_validate_model
    }
  },

  // 程序化创意信息，（备注：程序化 adx 投放无需提交入参）
  ...program_creative_info

];


// 广告显示标签名字
const adgroupShowLabel: Record<string, string> = {
  dynamic_creative_name: "动态创意名称",
  creative_template_id: "创意模板ID",
  delivery_mode: "投放模式",
  dynamic_creative_type: "动态创意类型",
  configured_status: "状态"
};


//


/**
 * 更新素材
 */
function updateMaterial(materialData: MaterialData) {
  emit("update:updateMaterial", materialData);
}


/**
 * 编辑标题包
 * @param titlePackage 标题包
 */
function updateTitlePackage(titlePackage: TitlePackageConfigData) {
  emit("update:titlePackage", titlePackage);
}


/**
 * 编辑定向包
 */
function updateAudiencePackage(audienceConfigData: AudienceConfigData) {
  emit("update:audiencePackage", audienceConfigData);
}


</script>

<template>
  <div class="tencent-base-template">
    <Row :gutter="16" class="equal-height-row">
      <Col :span="6" class="equal-height-col">
        <TencentCampaign
          :form-fields="campaignFormFields"
          :campaign-show-label="campaignShowLabel"
          :campaign="creationInfo?.configData.campaign"
          :audience="creationInfo?.configData.audience"
          :account-info="creationInfo.accountInfo"
          @update:campaign="updateCampaign"
          @update:audience-package="updateAudiencePackage"
        ></TencentCampaign>
      </Col>

      <Col :span="6" class="equal-height-col">
        <TencentAdgroup
          :form-fields="adgroupFormFields"
          :adgroup-show-label="adgroupShowLabel"
          :adgroup="creationInfo?.configData.adgroup"
          @update:adgroup="updateAdgroup"
        ></TencentAdgroup>
      </Col>

      <Col :span="6" class="equal-height-col">
        <CreativeGroupSelector
          :account-info="creationInfo.accountInfo"
          :material="creationInfo.configData.material"
          @update:material="updateMaterial"
        />
      </Col>

      <Col :span="6" class="equal-height-col">
        <TitleSelector
          :title-package="creationInfo.configData.titlePackage"
          :account-info="creationInfo.accountInfo"
          @update:title-package="updateTitlePackage"
        ></TitleSelector>
      </Col>

    </Row>
  </div>
</template>

<style scoped lang="scss">
.tencent-base-template {
  width: 100%;
}

// 让所有列高度一致，但不强制扩容
.equal-height-row {
  display: flex;
  align-items: stretch;
}

.equal-height-col {
  display: flex;

  // 让内部组件高度自适应父容器（匹配最高的列）
  > * {
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
}
</style>
