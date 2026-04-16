import {$t} from '@vben/locales';
import {Platform} from "#/constants/enums";

export const TABLE_COMMON_COLUMNS = [
  {title: '序号', type: 'checkbox', fixed: 'left', width: 'auto',},
  {
    field: 'createUsername', title: `${$t('core.columns.createUsername')}`, width: 'auto',
  },
  {
    field: 'updateUsername', title: `${$t('core.columns.updateUsername')}`, width: 'auto',
  },
  {
    field: 'createTime',
    formatter: 'formatDateTime',
    title: `${$t('core.columns.createTime')}`,
    width: 'auto',

  },
  {
    field: 'updateTime',
    formatter: 'formatDateTime',
    title: `${$t('core.columns.updateTime')}`,
    width: 'auto',

  },
  {
    field: 'status',
    title: `${$t('core.columns.status')}`,
    slots: {default: 'status'},
    width: 'auto',

  },
  {
    field: 'options',
    title: `${$t('core.columns.options')}`,
    fixed: 'right',
    slots: {default: 'action'},
    width: 'auto',
  },
];

export const STATUS_SELECT = [
  {
    label: `${$t('common.enable')}`,
    value: 1,
  },
  {
    label: `${$t('common.disable')}`,
    value: 9,
  },
];
export const TASK_STATUS_SELECT = [
  {
    label: '待处理',
    value: 1,
  },
  {
    label: '处理中',
    value: 2,
  },
  {
    label: '处理完成',
    value: 3,
  },
  {
    label: '处理失败',
    value: 4,
  },
];
export const SEX_SELECT = [
  {
    label: `${$t('common.boy')}`,
    value: 1,
  },
  {
    label: `${$t('common.girl')}`,
    value: 2,
  },
];

export const DATA_SCOPE = [
  {
    label: `${$t('core.data_range_type.self')}`,
    value: 1,
  },
  {
    label: `${$t('core.data_range_type.user_scope')}`,
    value: 2,
  },
  {
    label: `${$t('core.data_range_type.dept_scope')}`,
    value: 3,
  },
  {
    label: `${$t('core.data_range_type.dept_user_scope')}`,
    value: 4,
  },
  {
    label: `${$t('core.data_range_type.all_scope')}`,
    value: 5,
  },
  {
    label: `${$t('core.data_range_type.belong_dept')}`,
    value: 6,
  },
  {
    label: `${$t('core.data_range_type.belong_dept_sub_dept')}`,
    value: 7,
  },
  {
    label: `${$t('core.data_range_type.main_scope')}`,
    value: 8,
  },
  {
    label: `${$t('core.data_range_type.self_main_scope')}`,
    value: 9,
  },
];

export const ROLE_TYPE_OPTIONS = [
  {
    label: `${$t('core.role_type.super_admin')}`,
    value: 1,
  },
  {
    label: `${$t('core.role_type.platform_admin')}`,
    value: 2,
  },
  {
    label: `${$t('core.role_type.platform_user')}`,
    value: 3,
  },
  {
    label: `${$t('core.role_type.main_admin')}`,
    value: 4,
  },
  {
    label: `${$t('core.role_type.main_user')}`,
    value: 5,
  },
];

export enum BatchOptionsType {
  Delete = 'delete',
  DISABLE = 'disable',
  Enable = 'enable',
}

/**
 * Ocpx平台
 */
export const PLATFORM = [
  {
    label: `${$t('ocpx.platform.vivo')}`,
    value: 'vivo',
  },
  {
    label: `${$t('ocpx.platform.huawei')}`,
    value: 'huawei',
  },
  {
    label: `${$t('ocpx.platform.oppo')}`,
    value: 'oppo',
  },
  {
    label: `${$t('ocpx.platform.jd')}`,
    value: 'jd',
  },
  {
    label: `${$t('ocpx.platform.bytedance')}`,
    value: 'bytedance',
  },
  {
    label: `${$t('ocpx.platform.honor')}`,
    value: 'honor',
  },
  {
    label: `${$t('ocpx.platform.baidu')}`,
    value: 'baidu',
  },
  {
    label: `${$t('ocpx.platform.kuaishou')}`,
    value: 'kuaishou',
  },
  {
    label: '华为商店',
    value: 'huawei_store',
  },
  {
    label: '努比亚',
    value: 'nubia',
  },
  {
    label: '广义新华为',
    value: 'gyx_huawei',
  },
  {
    label: '广义新oppo',
    value: 'gyx_oppo',
  },
  {
    label: '趣头条',
    value: 'qutoutiao',
  },
  {
    label: '广点通',
    value: 'tencent',
  },
  {
    label: 'oppo push',
    value: 'oppo_push',
  }
];

/**
 * 回传媒体
 */
export const BACKHAUL = [
  {
    label: `${$t('ocpx.platform.vivo')}`,
    value: 'vivo',
  },
  {
    label: `${$t('ocpx.platform.huawei')}`,
    value: 'huawei',
  },
  {
    label: `${$t('ocpx.platform.oppo')}`,
    value: 'oppo',
  },
  {
    label: `${$t('ocpx.platform.bytedance')}`,
    value: 'bytedance',
  },
  {
    label: `${$t('ocpx.platform.honor')}`,
    value: 'honor',
  },
  {
    label: `${$t('ocpx.platform.baidu')}`,
    value: 'baidu',
  },
  {
    label: `${$t('ocpx.platform.kuaishou')}`,
    value: 'kuaishou',
  },
  {
    label: '华为商店',
    value: 'huawei_store',
  },
  {
    label: '努比亚',
    value: 'nubia',
  },
  {
    label: '广义新华为',
    value: 'gyx_huawei',
  },
  {
    label: '广义新oppo',
    value: 'gyx_oppo',
  },
  {
    label: '趣头条',
    value: 'qutoutiao',
  },
  {
    label: '广点通',
    value: 'tencent',
  },
  {
    label: 'oppo push',
    value: 'oppo_push',
  },
  {
    label: '超级汇川',
    value: 'huichuan',
  }
];


/**
 * 授权账户媒体
 */
export const AUTH_ACCOUNT_PLATFORM = [
  {
    label: `${$t('ocpx.platform.vivo')}`,
    value: 'vivo',
  },
  {
    label: `${$t('ocpx.platform.tb')}`,
    value: 'tb',
  },
  // {
  //   label: '华为商店',
  //   value: 'huawei_store',
  // },
  {
    label: '华为Ads',
    value: 'huawei',
  },
];
export const DEVELOPER_AUTH_ACCOUNT_PLATFORM = [
  {
    label: `${$t('ocpx.platform.vivo')}`,
    value: 'vivo',
  },
  {
    label: `${$t('ocpx.platform.tb')}`,
    value: 'tb',
  },
  {
    label: '华为商店',
    value: 'huawei_store',
  },
  {
    label: '华为Ads',
    value: 'huawei',
  },
  {
    label: 'OPPO',
    value: 'oppo',
  },
];

/**
 * 转化媒体
 */
export const BEHAVIORA_PLATFORM = [
  {
    label: `${$t('ocpx.platform.jd')}`,
    value: 'jd',
  },
  {
    label: `${$t('ocpx.platform.jdkj')}`,
    value: 'jdkj',
  },
  {
    label: `${$t('ocpx.platform.kuake')}`,
    value: 'kuake',
  },
  {
    label: `${$t('ocpx.platform.alipay')}`,
    value: 'alipay',
  },
  {
    label: `${$t('ocpx.platform.xmly')}`,
    value: 'xmly',
  },
  {
    label: `${$t('ocpx.platform.kuaishou')}`,
    value: 'kuaishou',
  },
  {
    label: `${$t('ocpx.platform.netease')}`,
    value: 'netease',
  },
  {
    label: `${$t('ocpx.platform.jdgyx')}`,
    value: 'jdgyx',
  },
  {
    label: `${$t('ocpx.platform.tb')}`,
    value: 'tb',
  },
  {
    label: `${$t('ocpx.platform.rednote')}`,
    value: 'rednote',
  },
  {
    label: "淘宝联盟",
    value: 'tb_union',
  },
  {
    label: `${$t('ocpx.platform.karang')}`,
    value: 'karang',
  },

  {
    label: `${$t('ocpx.platform.qwen')}`,
    value: 'qwen',
  },
  {
    label: '穿山甲',
    value: 'csjp',
  },
  {
    label: '努比亚',
    value: 'nubia',
  },
  {
    label: '淘宝闪购',
    value: 'tb_shangou',
  },

  {
    label: `${$t('ocpx.platform.junbo')}`,
    value: 'junbo',
  },

  {
    label: `${$t('ocpx.platform.four4711')}`,
    value: '4711',
  },

  {
    label: `${$t('ocpx.platform.uu')}`,
    value: 'uu_union',
  },

  {
    label: `${$t('ocpx.platform.baidu_pack')}`,
    value: 'baidu_pack',
  },
  {
    label: `${$t('ocpx.platform.three_water')}`,
    value: Platform.THREE_WATER,
  },
  {
    label: `${$t('ocpx.platform.longyu')}`,
    value: 'long_yu'
  },
  {
    label: `${$t('ocpx.platform.inteyun')}`,
    value: Platform.INTEYUN,
  },
  {
    label: '抖音',
    value: 'douyin',
  },
  {
    label: '美团',
    value: 'meituan',
  },
  {
    label: '咸鱼',
    value: 'xianyu',
  },
  {
    label: `${$t('ocpx.platform.izjie')}`,
    value: 'izjie',
  },
  {
    label: `${$t('ocpx.platform.ruizhang')}`,
    value: 'ruizhang',
  },
  {
    label: '抖音独立端',
    value: 'dy_duliduan'
  },
  {
    label: '优酷',
    value: 'youku'
  },
  {
    label: '快赚客',
    value: 'kuaizuanke'
  },
  {
    label: '咸鱼大航海',
    value: 'xianyu_dhh'
  }

];

// 匹配下拉
export const ModelSelect = [
  {
    label: `${$t('ocpx.behavioraplatform.model.callback')}`,
    value: 'callback',
  },
  {
    label: `${$t('ocpx.behavioraplatform.model.match')}`,
    value: 'match',
  },
  {
    label: `${$t('ocpx.behavioraplatform.model.async')}`,
    value: 'async',
  },
];

export const MatchFieldSelect = [
  {
    label: `${$t('ocpx.behavioraplatform.matchField.requestId')}`,
    value: 'requestId',
  },
  {
    label: `${$t('ocpx.behavioraplatform.matchField.clickId')}`,
    value: 'clickId',
  },

  {
    label: `${$t('ocpx.behavioraplatform.matchField.campaignId')}`,
    value: 'campaignId',
  },

  {
    label: `${$t('ocpx.behavioraplatform.matchField.adgroupId')}`,
    value: 'adgroupId',
  },

  {
    label: `${$t('ocpx.behavioraplatform.matchField.promotionId')}`,
    value: 'promotionId',
  },

  {
    label: `${$t('ocpx.behavioraplatform.matchField.creativeId')}`,
    value: 'creativeId',
  },
];


/**
 * 激活报表媒体
 */
export const ACTIVE_PLATFORM = [
  {
    label: `${$t('ocpx.platform.vivo')}`,
    value: 'vivo',
  },
  {
    label: `${$t('ocpx.platform.oppo')}`,
    value: 'oppo',
  }
];


/**
 * 报表维度
 */
export const DIMS = [
  {
    label: `${$t('marketing.report.dims.hour')}`,
    value: 'hour',
  },
  {
    label: `${$t('marketing.report.dims.day')}`,
    value: 'day',
  },
  {
    label: `${$t('marketing.report.dims.week')}`,
    value: 'week',
  },
  {
    label: `${$t('marketing.report.dims.month')}`,
    value: 'month',
  },
  {
    label: `${$t('marketing.report.dims.quarter')}`,
    value: 'quarter',
  },
  {
    label: `${$t('marketing.report.dims.year')}`,
    value: 'year',
  },
  {
    label: `${$t('marketing.report.dims.advertiser')}`,
    value: 'platform_account_id',
  },
  {
    label: '创意维度',
    value: 'creative_id',
  },
  {
    label: '计划维度',
    value: 'campaign_id',
  },
  {
    label: '广告组维度',
    value: 'adgroup_id',
  },
  {
    label: '广告维度',
    value: 'promotion_id',
  },
  {
    label: '优化师维度',
    value: 'createdBy',
  },
  {
    label: '平台维度',
    value: 'platform',
  },
  {
    label: '标签维度',
    value: 'tagId',
  }
]

/**
 * 广告主新增弹框的平台下拉
 */
export const ADVERTISET_ADDED = [
  {
    label: `${$t('ocpx.platform.huawei_store')}`,
    value: 'huawei_store',
  },
  {
    label: `${$t('ocpx.platform.oppo')}`,
    value: 'oppo',
  }
  // {
  //   label: `${$t('ocpx.platform.huawei')}`,
  //   value: 'huawei',
  // }
]
// 账户消耗明细平台下拉数据
export const BALACE_DETAIL_PLATFORM = [
  {
    label: `${$t('ocpx.platform.huawei_store')}`,
    value: 'huawei_store',
  },
  {
    label: `${$t('ocpx.platform.huawei')}`,
    value: 'huawei',
  }
]

/**
 * 营销账户-账户消耗明细下拉
 */
export const CONSUMPTION_DETAIL_DIMENSION = [
  {
    label: '天',
    value: 'day',
  },
  {
    label: 'appId',
    value: 'appId',
  },
  {
    label: '开发者Id',
    value: 'developerId',
  },
  {
    label: '账户Id',
    value: 'platform_account_id',
  }
]

/**
 * 华为账户消耗明细维度
 */
export const CONSUMPTION_DETAIL_DIMENSION_HUAWEI = [
  {
    label: '天',
    value: 'day',
  },

  {
    label: '账户Id',
    value: 'platform_account_id',
  },
  {
    label: '账户类型',
    value: 'account_type',
  }
]
/**
 * 广点通配置类型
 */
export const BM_COFIG_TYPE = [
  {
    label: 'ANDROID',
    value: 'ANDROID',
  }
]
/**
 * 广点通-安卓应用ID
 */
export const ANDROID_APPLICATION_ID = [
  {
    label: '快手',
    value: '100228415',
  },

  {
    label: '快手极速版',
    value: '1107805332',
  }
]
/**
 * 广点通-IOS应用ID
 */
export const IOS_APPLICATION_ID = [
  {
    label: '快手',
    value: '440948110',
  },

  {
    label: '快手极速版',
    value: '1472502819',
  }
]
/**
 * 广点通-安卓用户行为设置ID
 */
export const ANDROID_USER_ACTION_SET_ID = [
  {
    label: '快手',
    value: '1220349983',
  },

  {
    label: '快手极速版',
    value: '1220350070',
  }
]
/**
 * 广点通-IOS用户行为设置ID
 */
export const IOS_USER_ACTION_SET_ID = []
