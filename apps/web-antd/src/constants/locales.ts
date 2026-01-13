import {$t} from '@vben/locales';

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
 * 回传媒体
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
    label: `${$t('ocpx.platform.qwen')}`,
    value: 'qwen',
  },

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
  }
]
