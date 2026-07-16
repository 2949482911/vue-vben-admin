// DPA商品定向（当landing_type=DPA时投放目标参数）
export interface BytedanceDpaAudience {
  audience: DpaAudience;
  dpa_categories: Array<number>;
  dpa_product_target: Array<BytedanceDpaProductTarget>;
}


export interface DpaAudience {
  dpa_city: string;
  dpa_lbs: string;
  dpa_rta_switch: string;
  rta_id: number;
  dpa_rta_recommend_type: string;
}

export interface BytedanceDpaProductTarget {
  title: string;
  rule: string;
  type: string;
  value: string;
}


// 常规人群定向（其余情况均按下表传入)
export interface BytedanceSimpleAudience {
  audience_package_id: number;
  district: string;
  geolocation: Array<{
    radius: number;
    name: string;
    long: number;
    lat: number;
  }>;
  region_version: string;
  city: Array<number>;
  location_type: string;
  gender: string;
  age: Array<string>;
  retargeting_tags_include: Array<number>;
  retargeting_tags_exclude: Array<number>;
  interest_action_mode: string;
  action_days: number;
  action_categories: Array<number>;
  action_words: Array<number>;
  interest_categories: Array<number>;
  interest_words: Array<number>;
  aweme_fan_behaviors: Array<string>;
  aweme_fan_time_scope: string;
  aweme_fan_categories: Array<number>;
  aweme_fan_accounts: Array<number>;
  superior_popularity_type: string;
  flow_package: Array<number>;
  exclude_flow_package: Array<number>;
  platform: Array<string>;
  android_osv: string;
  ios_osv: string;
  harmony_osv: string;
  device_type: Array<string>;
  ac: Array<string>;
  carrier: Array<string>;
  carrier_region_optimize: string;
  hide_if_exists: string;
  hide_if_converted: string;
  converted_time_duration: string;
  filter_event: Array<string>;
  filter_aweme_abnormal_active: string;
  filter_aweme_fans_count: number;
  filter_own_aweme_fans: string;
  device_brand: Array<string>;
  launch_price: Array<number>;
  auto_extend_targets: Array<string>;
  dpa_city: string;
  dpa_lbs: string;
  dpa_rta_switch: string;
  rta_id: string;
  dpa_rta_recommend_type: string;

}



export interface BytedanceUblAudience {
  audience_package_id: string;
  district: string;
  geolocation: Array<{
    radius: number;
    name: string;
    long: number;
    lat: number;
  }>;

  region_recommend: string;
  age: Array<string>;
  retargeting_tags_include: Array<number>;
  retargeting_tags_exclude: Array<number>;
  hide_if_converted: string;
}




// 基础定向包
export interface BytedanceAudience {
  name: string;
  description: string;
  landing_type: string;
  marketing_goal: string;
  delivery_range: string;
  ad_type: string;
  retargeting_tags: Array<number>;
  retargeting_tags_exclude: Array<number>;
  gender: string;
  age: Array<string>;
  android_osv: string;
  ios_osv: string;
  harmony_osv: string;
  carrier: Array<string>;
  carrier_region_optimize: string;
  ac: Array<string>;
  device_brand: Array<string>;
  platform: Array<string>;
  auto_extend_targets: Array<string>;
  launch_price: Array<number>;
  interest_action_mode: string;
  action_days: number;
  action_categories: Array<number>;
  action_words: Array<number>;
  interest_categories: Array<number>;
  interest_words: Array<number>;
  district: string;
  region_version: string;
  city: Array<number>;
  location_type: string;
  superior_popularity_type: string;
  flow_package: Array<number>;
  exclude_flow_package: Array<number>;
  hide_if_converted: string;
  converted_time_duration: string;
  filter_event: Array<string>;
  device_type: Array<string>;
  geolocation: Array<{
    name: string;
    long: number;
    lat: number;
    radius: number;

  }>

  aweme_fans_numbers: Array<number>;
  filter_aweme_abnormal_active: number;
  filter_aweme_fans_count: number;
  filter_own_aweme_fans: number;
  aweme_fan_accounts: Array<number>;
  aweme_fan_categories: Array<number>;
  aweme_fan_behaviors: Array<string>;
  aweme_fan_time_scope: string;
  hide_if_exists: number;

}


// 定向包类型

/**
 *
 *
DPA商品目录
STORE 门店投放
AWEME 原生互动
SHOP 店铺直投
APP_ANDROID 应用下载-安卓
APP_IOS 应用下载-IOS
LIVE 直播间投放
QUICK_APP 快应用
MICRO_GAME 小游戏投放
 */

export const Bytedance_landing_type = [
  {
    label: '落地页',
    value: 'EXTERNAL'
  },
  {
    label: '文章投放',
    value: 'ARTICLE'
  },
  {
    label: '商品',
    value: 'GOODS'
  },
  {
    label: '店铺直投',
    value: 'SHOP'
  },
  {
    label: '应用下载-安卓',
    value: 'APP_ANDROID'
  },
  {
    label: '应用下载-IOS',
    value: 'APP_IOS'
  },
  {
    label: '直播间投放',
    value: 'LIVE'
  },
  {
    label: '快应用',
    value: 'QUICK_APP'
  },
  {
    label: '小游戏投放',
    value: 'MICRO_GAME'
  },
]



/**
 * 营销场景，允许值：VIDEO_AND_IMAGE 短视频/图片（默认值）， LIVE 直播
 */

export const Bytedance_marketing_goal = [
  {
    label: '短视频/图片',
    value: 'VIDEO_AND_IMAGE'
  },
  {
    label: '直播',
    value: 'LIVE'
  },
]



/**
 *
 * DEFAULT

默认

UNION

只投放到资讯联盟（穿山甲）

UNIVERSAL

通投智选
 *
 */
export const Bytedance_delivery_range = [
  {
    label: '默认',
    value: 'DEFAULT'
  },
  {
    label: '只投放到资讯联盟（穿山甲）',
    value: 'UNION'
  },
  {
    label: '通投智选',
    value: 'UNIVERSAL'
  },
]


/**
 * 单元类型，允许值：

ALL 所有单元（默认值）

SEARCH 搜索
// 搜索定向包仅支持落地页、应用、抖音号、直播间，不支持商品、电商店铺、快应用、小游戏
 */

export const Bytedance_ad_type = [
  {
    label: '所有单元（默认值）',
    value: 'ALL'
  },
  {
    label: '搜索',
    value: 'SEARCH'
  },
]



/**
 *
 * AGE_BETWEEN_18_23

18-23岁

AGE_BETWEEN_24_30

24-30岁

AGE_BETWEEN_31_40

31-40岁

AGE_BETWEEN_41_49

41-49岁

AGE_ABOVE_50

大于等于50岁
 */
export const Bytedance_age = [
  {
    label: '18-23岁',
    value: 'AGE_BETWEEN_18_23'
  },
  {
    label: '24-30岁',
    value: 'AGE_BETWEEN_24_30'
  },
  {
    label: '31-40岁',
    value: 'AGE_BETWEEN_31_40'
  },
  {
    label: '41-49岁',
    value: 'AGE_BETWEEN_41_49'
  },
  {
    label: '大于等于50岁',
    value: 'AGE_ABOVE_50'
  },


]


/**
 *
 *
 * 0.0

不限

2.0

Android 2.0

2.1

Android 2.1

2.2

Android 2.2

2.3

Android 2.3

3.0

Android 3.0

3.1

Android 3.1

3.2

Android 3.2

4.0

Android 4.0

4.1

Android 4.1

4.2

Android 4.2

4.3

Android 4.3

4.4

Android 4.4

4.5

Android 4.5

5.0

Android 5.0

5.1

Android 5.1

6.0

Android 6.0

7.0

Android 7.0

7.1

Android 7.1

8.0

Android 8.0

8.1

Android 8.1

9.0

Android 9.0

10.0

Android 10.0

10.1

Android 10.1

11.0

Android 11.0
 *
 *
 */
export const Bytedance_android_osv = [

  {
    label: '不限',
    value: '0.0'
  },
  {
    label: '2.0',
    value: '2.0'
  },
  {
    label: '2.1',
    value: '2.1'
  },
  {
    label: '2.2',
    value: '2.2'
  },
  {
    label: '2.3',
    value: '2.3'
  },
  {
    label: '3.0',
    value: '3.0'
  },
  {
    label: '3.1',
    value: '3.1'
  },
  {
    label: '3.2',
    value: '3.2'
  },
  {
    label: '4.0',
    value: '4.0'
  },
  {
    label: '4.1',
    value: '4.1'
  },
  {
    label: '4.2',
    value: '4.2'
  },
  {
    label: '4.3',
    value: '4.3'
  },
  {
    label: '4.4',
    value: '4.4'
  },
  {
    label: '4.5',
    value: '4.5'
  },
  {
    label: '5.0',
    value: '5.0'
  },
  {
    label: '5.1',
    value: '5.1'
  },
  {
    label: '6.0',
    value: '6.0'
  },
  {
    label: '7.0',
    value: '7.0'
  },
  {
    label: '7.1',
    value: '7.1'
  },
  {
    label: '8.0',
    value: '8.0'
  },
  {
    label: '8.1',
    value: '8.1'
  },
  {
    label: '9.0',
    value: '9.0'
  },
  {
    label: '10.0',
    value: '10.0'
  },
  {
    label: '10.1',
    value: '10.1'
  },
  {
    label: '11.0',
    value: '11.0'
  }
]



/**
 * 0.0

不限

4.0

IOS 4.0

4.1

IOS 4.1

4.2

IOS 4.2

4.3

IOS 4.3

5.0

IOS 5.0

5.1

IOS 5.1

6.0

IOS 6.0

7.0

IOS 7.0

7.1

IOS 7.1

8.0

IOS 8.0

8.1

IOS 8.1

8.2

IOS 8.2

9.0

IOS 9.0

9.1

IOS 9.1

9.2

IOS 9.2

9.3

IOS 9.3

10.1

IOS 10.1

10.2

IOS 10.2

10.3

IOS 10.3

11.0

IOS 11.0

11.1

IOS 11.1

11.2

IOS 11.2

11.3

IOS 11.3

11.4

IOS 11.4

12.0

IOS 12.0

12.1

IOS 12.1

12.2

IOS 12.2

12.3

IOS 12.3

12.4

IOS 12.4

13.0

IOS 13.0

13.1

IOS 13.1

13.2

IOS 13.2

13.3

IOS 13.3

14.0

IOS 14.0
 */

export const Bytedance_ios_osv = [

  {
    label: '不限',
    value: '0.0'
  },
  {
    label: '4.0',
    value: '4.0'
  },
  {
    label: '4.1',
    value: '4.1'
  },

  {
    label: '4.2',
    value: '4.2'
  },
  {
    label: '4.3',
    value: '4.3'
  },
  {
    label: '5.0',
    value: '5.0'
  },
  {
    label: '5.1',
    value: '5.1'
  },
  {
    label: '6.0',
    value: '6.0'
  },
  {
    label: '7.0',
    value: '7.0'
  },
  {
    label: '7.1',
    value: '7.1'
  },
  {
    label: '8.0',
    value: '8.0'
  },
  {
    label: '8.1',
    value: '8.1'
  },
  {
    label: '8.2',
    value: '8.2'
  },
  {
    label: '9.0',
    value: '9.0'
  },
  {
    label: '9.1',
    value: '9.1'
  },
  {
    label: '9.2',
    value: '9.2'
  },
  {
    label: '9.3',
    value: '9.3'
  },
  {
    label: '10.1',
    value: '10.1'
  },
  {
    label: '10.2',
    value: '10.2'
  },
  {
    label: '10.3',
    value: '10.3'
  },
  {
    label: '11.0',
    value: '11.0'
  },
  {
    label: '11.1',
    value: '11.1'
  },
  {
    label: '11.2',
    value: '11.2'
  },
  {
    label: '11.3',
    value: '11.3'
  },
  {
    label: '11.4',
    value: '11.4'
  },
  {
    label: '12.0',
    value: '12.0'
  },
  {
    label: '12.1',
    value: '12.1'
  },
  {
    label: '12.2',
    value: '12.2'
  },
  {
    label: '12.3',
    value: '12.3'
  },
  {
    label: '12.4',
    value: '12.4'
  },
  {
    label: '13.0',
    value: '13.0'
  },
  {
    label: '13.1',
    value: '13.1'
  },
  {
    label: '13.2',
    value: '13.2'
  },
  {
    label: '13.3',
    value: '13.3'
  },
  {
    label: '14.0',
    value: '14.0'
  },
  {
    label: '14.0',
    value: '14.0'
  },

]




export const Bytedance_harmony_osv = [
    {
      label: '5.0',
      value: '5.0'
    }
]



/**
 * MOBILE

移动

UNICOM

联通

TELCOM

电信
 */
export const Bytedance_carrier = [
  {
    label: '移动',
    value: 'MOBILE'
  },
  {
    label: '联通',
    value: 'UNICOM'
  },
  {
    label: '电信',
    value: 'TELCOM'
  },
]



/**
 * HONOR

荣耀

APPLE

苹果

HUAWEI

华为

XIAOMI

小米

SAMSUNG

三星

OPPO

OPPO

VIVO

VIVO

MEIZU

魅族

GIONEE

金立

COOLPAD

酷派

LENOVO

联想

LETV

乐视

ZTE

中兴

CHINAMOBILE

中国移动

HTC

HTC

PEPPER

小辣椒

NUBIA

努比亚

HISENSE

海信

QIKU

奇酷

TCL

TCL

SONY

索尼

SMARTISAN

锤子手机

360

360手机

ONEPLUS

一加手机

LG

LG

MOTO

摩托罗拉

NOKIA

诺基亚

GOOGLE

谷歌
 */
export const Bytedance_device_brand = [

  {
    label: '荣耀',
    value: 'HONOR'
  },
  {
    label: '苹果',
    value: 'APPLE'
  },
  {
    label: '华为',
    value: 'HUAWEI'
  },
  {
    label: '小米',
    value: 'XIAOMI'
  },
  {
    label: '三星',
    value: 'SAMSUNG'
  },
  {
    label: 'OPPO',
    value: 'OPPO'
  },
  {
    label: 'VIVO',
    value: 'VIVO'
  },
  {
    label: '魅族',
    value: 'MEIZU'
  },
  {
    label: '金立',
    value: 'GIONEE'
  },
  {
    label: '酷派',
    value: 'COOLPAD'
  },
  {
    label: '联想',
    value: 'LENOVO'
  },
  {
    label: '乐视',
    value: 'LETV'
  },
  {
    label: '中兴',
    value: 'ZTE'
  },
  {
    label: '中国移动',
    value: 'CHINAMOBILE'
  },
  {
    label: 'HTC',
    value: 'HTC'
  },
  {
    label: 'PEPPER',
    value: 'PEPPER'
  },
  {
    label: '努辣椒',
    value: 'NUBIA'
  },
  {
    label: '海信',
    value: 'HISENSE'
  },
  {
    label: '奇酷',
    value: 'QIKU'
  },
  {
    label: 'TCL',
    value: 'TCL'
  },
  {
    label: '索尼',
    value: 'SONY'
  },
  {
    label: '锤子手机',
    value: 'SMARTISAN'
  },
  {
    label: '360',
    value: '360'
  },
  {
    label: '360手机',
    value: '360'
  },
  {
    label: '一加手机',
    value: 'ONEPLUS'
  },
  {
    label: 'LG',
    value: 'LG'
  },
  {
    label: 'MOTO',
    value: 'MOTO'
  },
  {
    label: '诺基亚',
    value: 'NOKIA'
  },
  {
    label: '谷歌',
    value: 'GOOGLE'
  },
]



/**
 * REGION（地域）、GENDER（性别）、AGE（年龄）、CUSTOM_AUDIENCE（自定义人群）
 */
export const Bytedance_auto_extend_targets = [
  {
    label: '地域',
    value: 'REGION'
  },
  {
    label: '性别',
    value: 'GENDER'
  },
  {
    label: '年龄',
    value: 'AGE'
  },
  {
    label: '自定义人群',
    value: 'CUSTOM_AUDIENCE'
  },

]


/**
 * UNLIMITED（不限）、CUSTOM（自定义）、RECOMMEND（系统推荐）
 */
export const Bytedance_interest_action_mode = [
  {
    label: '不限',
    value: 'UNLIMITED'
  },
  {
    label: '自定义',
    value: 'CUSTOM'
  },
  {
    label: '系统推荐',
    value: 'RECOMMEND'
  },
]



/**
 * 行为天数,当interest_action_mode传CUSTOM时有效
允许值：7、 15、30、60、90、180、365
 */
export const Bytedance_action_days = [
  {
    label: '7天',
    value: '7'
  },
  {
    label: '15天',
    value: '15'
  },
  {
    label: '30天',
    value: '30'
  },
  {
    label: '60天',
    value: '60'
  },
  {
    label: '90天',
    value: '90'
  },
  {
    label: '180天',
    value: '180'
  },
  {
    label: '365天',
    value: '365'
  },

]


/**
 * HOME

居住在该地区的用户

TRAVEL

到该地区旅行的用户

ALL

该地区内的所有用户

CURRENT

正在该地区的用户
 */
export const Bytedance_location_type = [
  {
    label: '居住在该地区的用户',
    value: 'HOME'
  },
  {
    label: '到该地区旅行的用户',
    value: 'TRAVEL'
  },
  {
    label: '该地区内的所有用户',
    value: 'ALL'
  },
  {
    label: '正在该地区的用户',
    value: 'CURRENT'
  },
]


/**
 * NONE

不限

GAME

游戏优质媒体
 */

export const Bytedance_superior_popularity_type = [
  {
    label: '不限',
    value: 'NONE'
  },
  {
    label: '游戏优质媒体',
    value: 'GAME'
  },
]



/**
 * NO_EXCLUDE

不过滤

PROJECT

项目

AD

单元

ADVERTISER

投放账户

APP

APP

CUSTOMER

公司账户

ORGANIZATION

巨量引擎工作台账户

GLOBAL_APP

全渠道应用
 */
export const Bytedance_hide_if_converted  = [
  {
    label: '不过滤',
    value: 'NO_EXCLUDE'
  },
  {
    label: '项目',
    value: 'PROJECT'
  },
  {
    label: '单元',
    value: 'AD'
  },
  {
    label: '投放账户',
    value: 'ADVERTISER'
  },
  {
    label: 'APP',
    value: 'APP'
  },
  {
    label: '公司账户',
    value: 'CUSTOMER'
  },
  {
    label: '巨量引擎工作台账户',
    value: 'ORGANIZATION'
  },
  {
    label: '全渠道应用',
    value: 'GLOBAL_APP'
  },

]



/**
 * NONE

不限

TODAY

当天



SEVEN_DAY

7天



ONE_MONTH

1个月

THREE_MONTH

3个月

SIX_MONTH

6个月

TWELVE_MONTH

12个月
 */
export const Bytedance_converted_time_duration = [
  {
    label: '不限',
    value: 'NONE'
  },
  {
    label: '当天',
    value: 'TODAY'
  },
  {
    label: '7天',
    value: 'SEVEN_DAY'
  },
  {
    label: '1个月',
    value: 'ONE_MONTH'
  },
  {
    label: '3个月',
    value: 'THREE_MONTH'
  },
  {
    label: '6个月',
    value: 'SIX_MONTH'
  },
  {
    label: '12个月',
    value: 'TWELVE_MONTH'
  },
]



/**
 * 优化目标：
AD_CONVERT_EXTERNAL_ACTION (新增）
激活：AD_CONVERT_TYPE_ACTIVE
注册：AD_CONVERT_TYPE_ACTIVE_REGISTER
付费：AD_CONVERT_TYPE_PAY
 */
export const Bytedance_filter_event = [
  {
    label: '激活',
    value: 'AD_CONVERT_TYPE_ACTIVE'
  },
  {
    label: '注册',
    value: 'AD_CONVERT_TYPE_ACTIVE_REGISTER'
  },
  {
    label: '付费',
    value: 'AD_CONVERT_TYPE_PAY'
  },
  {
    label: '优化目标',
    value: 'AD_CONVERT_EXTERNAL_ACTION'
  },
]



/**
 * "MOBILE", "PAD"
 */
export const Bytedance_device_type = [
  {
    label: '移动端',
    value: 'MOBILE'
  },
  {
    label: '平板端',
    value: 'PAD'
  },
]



/**
 * FOLLOWED_USER

已关注用户

COMMENTED_USER

视频互动-已评论用户

LIKED_USER

视频互动-已点赞用户

SHARED_USER

视频互动-已分享用户

LIVE_WATCH

直播互动-观看

LIVE_EFFECTIVE_WATCH

直播互动-有效观看

LIVE_COMMENT

直播互动-直播评论

LIVE_EXCEPTIONAL

直播互动-打赏

LIVE_GOODS_CLICK

直播互动-商品点击

LIVE_GOODS_ORDER

直播互动-商品下单

GOODS_CARTS_CLICK

商品互动-购物车点击

GOODS_CARTS_ORDER

商品互动-购物车下单
 */
export const Bytedance_aweme_fan_behaviors = [
  {
    label: '已关注用户',
    value: 'FOLLOWED_USER'
  },
  {
    label: '视频互动-已评论用户',
    value: 'COMMENTED_USER'
  },
  {
    label: '视频互动-已点赞用户',
    value: 'LIKED_USER'
  },
  {
    label: '视频互动-已分享用户',
    value: 'SHARED_USER'
  },
  {
    label: '直播互动-观看',
    value: 'LIVE_WATCH'
  },
  {
    label: '直播互动-有效观看',
    value: 'LIVE_EFFECTIVE_WATCH'
  },
  {
    label: '直播互动-直播评论',
    value: 'LIVE_COMMENT'
  },
  {
    label: '直播互动-打赏',
    value: 'LIVE_EXCEPTIONAL'
  },
  {
    label: '直播互动-商品点击',
    value: 'LIVE_GOODS_CLICK'
  },
  {
    label: '直播互动-商品下单',
    value: 'LIVE_GOODS_ORDER'
  },
  {
    label: '商品互动-购物车点击',
    value: 'GOODS_CARTS_CLICK'
  },
  {
    label: '商品互动-购物车下单',
    value: 'GOODS_CARTS_ORDER'
  },

]


/**
 *
 * FIFTEEN_DAYS 15天、THIRTY_DAYS 30天、SIXTY_DAYS 60天，默认时间范围为15天
 */
export const Bytedance_aweme_fan_time_scope = [
  {
    label: '15天',
    value: 'FIFTEEN_DAYS'
  },
  {
    label: '30天',
    value: 'THIRTY_DAYS'
  },
  {
    label: '60天',
    value: 'SIXTY_DAYS'
  },
]



/**
 * 0表示不限，1表示过滤，2表示定向
 */
export const Bytedance_hide_if_exists = [
  {
    label: '不限',
    value: 0
  },
  {
    label: '过滤',
    value: 1
  },
  {
    label: '定向',
    value: 2
  },
]

/**
 * 性别
 * NONE 不限、GENDER_FEMALE 女性、GENDER_MALE 男性
 */
export const Bytedance_gender = [
  {
    label: '不限',
    value: 'NONE'
  },
  {
    label: '女性',
    value: 'GENDER_FEMALE'
  },
  {
    label: '男性',
    value: 'GENDER_MALE'
  },
]

/**
 * 网络类型（连接方式）
 * WIFI、2G、3G、4G、5G
 */
export const Bytedance_ac = [
  {
    label: "unknown",
    value: "unknown"
  },
  {
    label: 'WIFI',
    value: 'WIFI'
  },
  {
    label: '2G',
    value: '2G'
  },
  {
    label: '3G',
    value: '3G'
  },
  {
    label: '4G',
    value: '4G'
  },
  {
    label: '5G',
    value: '5G'
  },
]

/**
 * 操作系统平台
 * ANDROID、IOS、HARMONY
 */
export const Bytedance_platform = [
  {
    label: 'Android',
    value: 'ANDROID'
  },
  {
    label: 'iOS',
    value: 'IOS'
  },
  {
    label: 'Harmony',
    value: 'HARMONY'
  },
]

/**
 * 地域类型
 * REGION 省市、BUSINESS_DISTRICT 商圈、NONE 不限
 */
export const Bytedance_district = [
  {
    label: '不限',
    value: 'NONE'
  },
  {
    label: '省市',
    value: 'REGION'
  },
  {
    label: '商圈',
    value: 'BUSINESS_DISTRICT'
  },
]

/**
 * 地域版本
 * OLD 旧版地域、NEW 新版地域
 */
export const Bytedance_region_version = [
  {
    label: '旧版地域',
    value: 'OLD'
  },
  {
    label: '新版地域',
    value: 'NEW'
  },
]

/**
 * 运营商区域优选
 * ON 开启、OFF 关闭
 */
export const Bytedance_carrier_region_optimize = [
  {
    label: '关闭',
    value: 'OFF'
  },
  {
    label: '开启',
    value: 'ON'
  },
]

/**
 * 过滤抖音异常活跃用户
 * 0 不过滤、1 过滤
 */
export const Bytedance_filter_aweme_abnormal_active = [
  {
    label: '不过滤',
    value: 0
  },
  {
    label: '过滤',
    value: 1
  },
]

/**
 * 过滤自己的抖音粉丝
 * 0 不过滤、1 过滤
 */
export const Bytedance_filter_own_aweme_fans = [
  {
    label: '不过滤',
    value: 0
  },
  {
    label: '过滤',
    value: 1
  },
]

/**
 * 设备价格（上市价格）
 * 0-1500、1500-2500、2500-3500、3500-4500、4500+
 */
export const Bytedance_launch_price = [
  {
    label: '0-1500元',
    value: "[0,1500]"
  },
  {
    label: '1500-2500元',
    value: "[1500,2500]"
  },
  {
    label: '2500-3500元',
    value: "[2500,3500]"
  },
  {
    label: '3500-4500元',
    value: "[3500,4500]"
  },
  {
    label: '4500元以上',
    value: "[4500,]"
  },
  {
    label: "11000以上",
    value: "[11000]"
  }
]
