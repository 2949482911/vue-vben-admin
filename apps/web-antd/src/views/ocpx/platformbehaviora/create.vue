<script lang="ts" setup name="CreateNotice">
import type {BehavioraPlatformItem, CreateBehavioraPlatformRequest, OcpxPlatformMatch, PlatformCallbackBehaviorTypeItem, UpdateBehavioraPlatformRequest} from '#/api/models';

import {ref, h} from 'vue';

import {useVbenModal} from '@vben/common-ui';
import {$t} from '@vben/locales';

import {Card, Divider} from 'ant-design-vue';

import {useVbenForm} from '#/adapter/form';
import {behavioraPlatformApi, platformCallbackApi} from '#/api/core/ocpx';
import {Platform} from '#/constants/enums';
import {
  BEHAVIORA_PLATFORM,
  MatchFieldSelect,
  ModelSelect,
} from '#/constants/locales';

import MatchTable from './matchTable.vue';
import { trimObject } from '#/utils/trim';

const emit = defineEmits(['pageReload']);

// 匹配列表
const ocpxPlatformMatchList = ref<Array<OcpxPlatformMatch>>([]);
// edit request
const objectRequest = ref<BehavioraPlatformItem>({
  config: new Map(),
  createTime: "",
  createUsername: "",
  id: "",
  model: "",
  name: "",
  ocpxPlatformMatchList: [],
  platform: "",
  remark: "",
  simulate: 0,
  filterBehavior:[],
  simulateBehaviorType:"",
  status: 0,
  updateTime: "",
  updateUsername: "",
  type: 1,
  directLink: ''
});

const isUpdate = ref<Boolean>(false);
const matchModel = ref<string>('match');
const modalType = ref<string>('edit');
// 配置项
const platformConfigForm = new Map<string, Array<any>>();

// 京东配置
platformConfigForm.set(Platform.JD, [
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'secretKey',
    // 界面显示的label
    label: `secretKey`,
    rules: 'required',
  },
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'secret',
    // 界面显示的label
    label: `secret`,
    rules: 'required',
  },
]);

// 京东科技
platformConfigForm.set(Platform.JDKJ, [
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'code',
    // 界面显示的label
    label: `code`,
    rules: 'required',
  },

  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'account_id',
    // 界面显示的label
    label: `account_id`,
    rules: 'required',
  },
]);

// kuake
platformConfigForm.set(Platform.KUAKE, [
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'ch',
    // 界面显示的label
    label: `ch`,
    rules: 'required',
  },

  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'gateway',
    // 界面显示的label
    label: `gateway`,
    rules: 'required',
  },

  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'token',
    // 界面显示的label
    label: `token`,
  },

  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'act',
    // 界面显示的label
    label: `act`,
    defaultValue: "new",
    rules: 'required',
  },

  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'srcPlat',
    // 界面显示的label
    label: `srcPlat`,
    rules: 'required',
  },

  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'type',
    // 界面显示的label
    label: `type`,
    rules: 'required',
    defaultValue: 'click',
  },

  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    defaultValue: 'com.quark.browser',
    // 字段名
    fieldName: 'targetPkg',
    // 界面显示的label
    label: `targetPkg`,
    rules: 'required',
  },

  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'product',
    // 界面显示的label
    label: `product`,
  },
]);

// 支付宝
platformConfigForm.set(Platform.ALIPAY, [
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'requestFrom',
    // 界面显示的label
    label: `requestFrom`,
    rules: 'required',
  },
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'pid',
    // 界面显示的label
    label: `pid`,
    rules: 'required',
  },
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'partnerId',
    // 界面显示的label
    label: `partnerId`,
    rules: 'required',
  },
  {
    // 媒体配置表单
    component: 'Select',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
      options: [
        {
          value: 'click',
          label: 'click',
        },
        {
          value: 'expose',
          label: 'expose',
        }
      ]
    },
    // 字段名
    fieldName: 'action',
    // 界面显示的label
    label: `action`,
    rules: 'required',
  },
]);

platformConfigForm.set(Platform.XMLY, [
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'channel',
    // 界面显示的label
    label: `channel`,
    rules: 'required',
  },

  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'secretKey',
    // 界面显示的label
    label: `secretKey`,
    rules: 'required',
  },

  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'xima_agent',
    // 界面显示的label
    label: `xima_agent`,
    rules: 'required',
  },
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'rta_trace_id',
    // 界面显示的label
    label: `rta_trace_id`,
    rules: 'required',
  },
]);

// 快手
platformConfigForm.set(Platform.KUAISHOU, [
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'adid',
    // 界面显示的label
    label: `adid`,
    rules: 'required',
  },
  {
    component: 'Switch',
    defaultValue: false,
    componentProps: {
      placeholder: `${$t('common.input')}`,
      class: 'w-10',
    },
    fieldName: 'replayClickEnabled',
    label: `模拟上报`
  }
]);

// 网易
platformConfigForm.set(Platform.NETEASE, [
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'did',
    // 界面显示的label
    label: `did`,
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'aid',
    label: `aid`,
    rules: 'required',
  },
])

// 京东广义新
platformConfigForm.set(Platform.JD_GYX, [
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'test',
    // 界面显示的label
    label: `test`,
    rules: 'required',
  },
])

// 淘宝
platformConfigForm.set(Platform.TB, [
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'appKey',
    // 界面显示的label
    label: `appKey`,
    rules: 'required',
  },
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'appSecret',
    // 界面显示的label
    label: `appSecret`,
    rules: 'required',
  },
])

// 淘宝联盟
platformConfigForm.set(Platform.TB_UNION, [
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'channel',
    // 界面显示的label
    label: `channel`,
    rules: 'required',
  },
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'taskId',
    // 界面显示的label
    label: `taskId`,
    rules: 'required',
  },
  {
    // 组件需要在 #/adapter.ts内注册，并加上类型
    component: 'Select',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
      options: [
        {
          label: "曝光",
          value: 1,
        },
        {
          label: "点击",
          value: 2,
        },
      ],
    },
    defaultValue: 2,
    // 字段名
    fieldName: 'action',
    // 界面显示的label
    label: "行为类型",
    rules: 'required'
  },
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'tbkId',
    // 界面显示的label
    label: `tbkId1`,
    rules: 'required',
    suffix: () =>
      h('div', {class: 'flex gap-2'}, [
        h('span', {
          class: 'bg-white text-black border border-gray-300 rounded px-3 py-1 cursor-pointer hover:bg-gray-100',
          onClick: batchAddSchema
        }, '+'),
        h('span', {
          class: 'bg-white text-black border border-gray-300 rounded px-3 py-1 cursor-pointer hover:bg-gray-100',
          onClick: batchDeleteSchema
        }, '-')
      ])
  },
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'appKey',
    // 界面显示的label
    label: `appKey`
  },
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'appSecret',
    // 界面显示的label
    label: `appSecret`
  },
])

// 穿山甲
platformConfigForm.set(Platform.CSJP, [
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'appId',
    // 界面显示的label
    label: 'appId',
    rules: 'required',
  },
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'appSecret',
    // 界面显示的label
    label: 'appSecret',
    rules: 'required',
  },
  {
    // 媒体配置表单
    component: 'Select',
    // 对应组件的参数
    componentProps: {
      placeholder: '请选择',
      options: [
        {
          value: 1,
          label: '商品分销订单',
        },
        {
          value: 2,
          label: '直播间分销订单',
        },
        {
          value: 3,
          label: '活动类型订单',
        }
      ]
    },
    defaultValue: 2,
    // 字段名
    fieldName: 'order_type',
    // 界面显示的label
    label: '订单类型',
  },
  {
    // 媒体配置表单
    component: 'Select',
    // 对应组件的参数
    componentProps: {
      placeholder: '请选择',
      options: [
        {
          value: 'pay',
          label: '按照支付时间查询特定时间范围内的订单',
        },
        {
          value: 'update',
          label: '按照订单更新时间查询特定时间范围内的订单',
        }
      ]
    },
    defaultValue: 'pay',
    // 字段名
    fieldName: 'time_type',
    // 界面显示的label
    label: 'time_type',
    rules: 'required',
  },
])

// 努比亚
platformConfigForm.set(Platform.NBY, [
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'test',
    // 界面显示的label
    label: `test`,
    rules: 'required',
  },
])
// 咸鱼大航海
platformConfigForm.set(Platform.XIANYU_DHH, [
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'taskId',
    // 界面显示的label
    label: `taskId`,
    rules: 'required',
  },
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'app',
    // 界面显示的label
    label: `app`,
    rules: 'required',
  },
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'channel',
    // 界面显示的label
    label: `channel`,
    rules: 'required',
  },
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'advertisingSpaceId',
    // 界面显示的label
    label: `advertisingSpaceId`,
    rules: 'required',
  },
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'adAgent',
    // 界面显示的label
    label: `adAgent`,
    rules: 'required',
  },
  {
    // 媒体配置表单
    component: 'Select',
    // 对应组件的参数
    componentProps: {
      placeholder: '请选择',
      options: [
        {
          value: 1,
          label: '启用',
        },
        {
          value: 9,
          label: '禁止',
        }
      ]
    },
    // 字段名
    fieldName: 'specialCallback',
    // 界面显示的label
    label: '特殊回传',
  },
])
// soul
platformConfigForm.set(Platform.SOUL, [
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'ver',
    // 界面显示的label
    label: `ver`,
    rules: 'required',
  },
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'code',
    // 界面显示的label
    label: `code`,
    rules: 'required',
  }
])

//增加tbkId输入框
function batchAddSchema() {
  configFormApi.setState((prev) => {
    const schema = prev?.schema ?? [];

    // 找出已有 tbkId 的数量
    const tbkCount = schema.filter(item =>
      item.fieldName?.startsWith('tbkId')
    ).length;

    const newIndex = tbkCount + 1;

    return {
      schema: [
        ...schema,
        {
          component: 'Input',
          componentProps: {
            placeholder: `请输入 tbkId${newIndex}`,
          },
          fieldName: `tbkId${newIndex}`, // 字段名 tbkId1, tbkId2, ...
          label: `tbkId${newIndex}`,      // 显示顺序也对应
          rules: 'required',
          suffix: () =>
            h('div', {class: 'flex gap-2'}, [
              h('span', {
                class: 'bg-white text-black border border-gray-300 rounded px-3 py-1 cursor-pointer hover:bg-gray-100',
                onClick: batchAddSchema
              }, '+'),
              h('span', {
                class: 'bg-white text-black border border-gray-300 rounded px-3 py-1 cursor-pointer hover:bg-gray-100',
                onClick: batchDeleteSchema
              }, '-')
            ])
        },
      ],
    };
  });
}

//删除tbkId输入框
function batchDeleteSchema() {
  configFormApi.setState((prev) => {
    const schema = prev?.schema ?? [];

    // 找出所有 tbkId 索引
    const tbkIndexes = schema
      .map((item, index) => ({item, index}))
      .filter(({item}) => item.fieldName?.startsWith('tbkId'));

    // 至少保留 tbkId1
    if (tbkIndexes.length <= 1) return {schema};

    // 删除最后一个 tbkId
    const last = tbkIndexes.at(-1);
    if (!last) return { schema };
    const newSchema = [...schema];
    newSchema.splice(last.index, 1);

    return {schema: newSchema};
  });
}

// 小红书
platformConfigForm.set(Platform.REDNOTE, [
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'xhs_channel',
    // 界面显示的label
    label: `xhs_channel`,
    rules: 'required',
  },
])

// 聚创
platformConfigForm.set(Platform.KARANG, [
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'pid',
    // 界面显示的label
    label: `pid`,
    rules: 'required',
  },
])

//千问
platformConfigForm.set(Platform.QWEN, [
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'ch',
    // 界面显示的label
    label: `ch`,
    rules: 'required',
  },
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'gateway',
    // 界面显示的label
    label: `gateway`,
    rules: 'required',
  },
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'act',
    // 界面显示的label
    label: `act`,
    rules: 'required',
  },
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'srcPlat',
    // 界面显示的label
    label: `srcPlat`,
    rules: 'required',
  }, {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'targetPkg',
    // 界面显示的label
    label: `targetPkg`,
    rules: 'required',
  }, {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'type',
    // 界面显示的label
    label: `type`,
    rules: 'required',
  },{
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'product',
    // 界面显示的label
    label: `product`,
  },
])

//淘宝闪购
platformConfigForm.set(Platform.TBSG, [
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'medium_source',
    label: 'medium_source',
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'delivery_type',
    label: 'delivery_type',
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'ascribe_type',
    label: `ascribe_type`,
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'demander_type',
    label: `demander_type`,
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'biz_type',
    label: `biz_type`,
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'restore_id',
    label: `restore_id`,
    rules: 'required',
  },
])

// 俊波
platformConfigForm.set(Platform.JUNBO, [
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'meta',
    // 界面显示的label
    label: `meta`,
    rules: 'required',
  },
])


platformConfigForm.set(Platform.FOUR711, [
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'sid',
    // 界面显示的label
    label: `sid`,
    rules: 'required',
  },
])


// uu 互联
platformConfigForm.set(Platform.UU, [
  {
    component: 'Select',
    componentProps: {
      placeholder: `${$t('common.input')}`,
      options: [
        {
          "value": 5,
          "label": `${$t('core.expose')}`
        },
        {
          "value": 6,
          "label": `${$t('core.click')}`
        }
      ]
    },
    fieldName: 'reportType',
    label: `reportType`,
    rules: 'required',
  },

  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'dispatchCenterld',
    label: `dispatchCenterld`,
    rules: 'required',
  },
])


// 因特yun
platformConfigForm.set(Platform.INTEYUN, [
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'adId',
    label: `adId`,
    rules: 'required',
  },

  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'channelId',
    label: `channelId`,
    rules: 'required',
  },

  {
    component: 'Select',
    componentProps: {
      placeholder: `${$t('common.input')}`,
      options: [
        {
          "value": 'async',
          "label": 'async'
        },
        {
          "value": 'sync',
          "label": 'sync'
        }
      ]
    },
    fieldName: 'type',
    label: `type`,
    rules: 'required',
  },
])

// 百度网盘
platformConfigForm.set(Platform.BAIDU_PACK, [
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'adId',
    label: `adId`,
    rules: 'required',
  },

  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'channelId',
    label: `channelId`,
    rules: 'required',
  },
])

//抖音
platformConfigForm.set(Platform.DOUYIN, [
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'app',
    label: 'app',
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'access_key',
    label: 'access_key',
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'secret_key',
    label: `secret_key`,
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'strategy_ids',
    label: `strategy_ids`,
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'adLink',
    label: `adLink`,
    rules: 'required',
  }
])
//美团
platformConfigForm.set(Platform.MEITUAN, [
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'source',
    label: 'source',
    rules: 'required',
  },

])
//咸鱼
platformConfigForm.set(Platform.XIANYU, [
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'action',
    label: 'action',
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'campaignId',
    label: 'campaignId',
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'refer_code',
    label: 'refer_code',
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'channel',
    label: 'channel',
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'agent_channel',
    label: 'agent_channel',
    defaultValue: ''
  },

])

//

platformConfigForm.set(Platform.IZJIE, [
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'ckey',
    label: `ckey`,
    rules: 'required',
  }
])

platformConfigForm.set(Platform.RUIZHANG, [
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'channel_id',
    label: `channel_id`,
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'ch',
    label: `ch`,
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'customer_id',
    label: `customer_id`,
    rules: 'required',
  }
])


platformConfigForm.set(Platform.THREE_WATER, [
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'gateway',
    label: `gateway`,
    rules: 'required',
  }
])
// 抖音独立端
platformConfigForm.set(Platform.DY_DULIDUAN, [
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'reportType',
    label: 'reportType',
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'actionType',
    label: 'actionType',
    rules: 'required',
  },
  {
    component: 'Input',
    defaultValue: 'qutoutiao',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'srcPlat',
    label: 'srcPlat',
    rules: 'required',
  },
  {
    component: 'Input',
    defaultValue: 'chengfeng',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'ad_platform',
    label: 'ad_platform',
    rules: 'required',
  },
  {
    component: 'Input',
    defaultValue: 'ios',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'app_platform',
    label: 'app_platform',
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'surl_token',
    label: 'surl_token',
    rules: 'required',
  }
])
// 优酷
platformConfigForm.set(Platform.YOUKU, [
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'appKey',
    label: 'appKey',
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'mediaId',
    label: 'mediaId',
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'youkuBizType',
    label: 'youkuBizType',
  }
])
// 快赚客
platformConfigForm.set(Platform.KUAIZUANKE, [
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'appKey',
    label: 'appKey',
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'signSecret',
    label: 'signSecret',
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'accessToken',
    label: 'accessToken',
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'pid',
    label: 'pid',
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'appId',
    label: 'appId',
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'appSecret',
    label: 'appSecret',
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'refreshToken',
    label: 'refreshToken',
    rules: 'required',
  },
])
// 淘宝闪购
platformConfigForm.set(Platform.TB_SHANGOU_ET, [
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'medium_source',
    label: 'medium_source',
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'delivery_type',
    label: 'delivery_type',
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'ascribe_type',
    label: 'ascribe_type',
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'demander_type',
    label: 'demander_type',
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'biz_type',
    label: 'biz_type',
    rules: 'required',
  }
])

// 龙鱼
platformConfigForm.set(Platform.LONGYU, [
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'hhChannel',
    label: 'hhChannel',
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'hhPkg',
    label: 'hhPkg',
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'chainCode',
    label: 'chainCode',
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'adid',
    label: 'adid',
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'eventType',
    label: 'eventType',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'channel',
    label: 'channel',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    fieldName: 'source',
    label: 'source',
  }
])

// 唯品会配置
platformConfigForm.set(Platform.VPH, [
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'appKey',
    // 界面显示的label
    label: `appKey`,
    rules: 'required',
  },
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'appSecret',
    // 界面显示的label
    label: `appSecret`,
    rules: 'required',
  },
]);
// 菜鸟配置
platformConfigForm.set(Platform.CAINIAO, [
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'cn_biz',
    // 界面显示的label
    label: `cn_biz`,
    rules: 'required',
  },
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'channel',
    // 界面显示的label
    label: `channel`,
    rules: 'required',
  },
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'strategyId',
    // 界面显示的label
    label: `strategyId`,
    rules: 'required',
  },
]);
// 南京字节配置
platformConfigForm.set(Platform.NJ_BYTEDANCE, [
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'pname',
    // 界面显示的label
    label: `pname`,
    rules: 'required',
  }
]);
// 百度网盘配置
platformConfigForm.set(Platform.BAIDU_BOX, [
  {
    // 媒体配置表单
    component: 'Input',
    defaultValue: 0,
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'account_type',
    // 界面显示的label
    label: `account_type`,
    rules: 'required',
  },
  {
    // 媒体配置表单
    component: 'Input',
    defaultValue: 1,
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'schema_type',
    // 界面显示的label
    label: `schema_type`,
    rules: 'required',
  },
  {
    // 媒体配置表单
    component: 'Input',
    defaultValue: 'xinghuoliaoyuan',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'channel',
    // 界面显示的label
    label: `channel`,
    rules: 'required',
  },
  {
    // 媒体配置表单
    component: 'Input',
    defaultValue: 6,
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'flow_type',
    // 界面显示的label
    label: `flow_type`,
    rules: 'required',
  },
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'package_id',
    // 界面显示的label
    label: `package_id`,
    rules: 'required',
  },
  {
    // 媒体配置表单
    component: 'Input',
    defaultValue: 'wangpan',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'app_name',
    // 界面显示的label
    label: `app_name`,
    rules: 'required',
  },
  {
    // 媒体配置表单
    component: 'Input',
    defaultValue: 'baiduwangpan_hh_lahuo_xinghuoliaoyuan',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'account_id',
    // 界面显示的label
    label: `account_id`,
    rules: 'required',
  },
  {
    // 媒体配置表单
    component: 'Input',
    defaultValue: 'android',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'app_type',
    // 界面显示的label
    label: `app_type`,
    rules: 'required',
  },
  {
    // 媒体配置表单
    component: 'Input',
    defaultValue: 'invoke',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'conv_type',
    // 界面显示的label
    label: `conv_type`,
    rules: 'required',
  },
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'ug_sign',
    // 界面显示的label
    label: `ug_sign`,
    rules: 'required',
  },
  {
    // 媒体配置表单
    component: 'Input',
    defaultValue: 1,
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'common_cpa',
    // 界面显示的label
    label: `common_cpa`,
    rules: 'required',
  },
]);


platformConfigForm.set(Platform.SOUL_DSP, [
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'channel_name',
    // 界面显示的label
    label: `channel_name`,
    rules: 'required',
  },
  {
    // 媒体配置表单
    component: 'Input',
    // 对应组件的参数
    componentProps: {
      placeholder: `${$t('common.input')}`,
    },
    // 字段名
    fieldName: 'subsource',
    // 界面显示的label
    label: `subsource`,
    rules: 'required',
  },
]);
const [ConfigForm, configFormApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  schema: platformConfigForm.get(Platform.JD),
});

//过滤事件的下拉
const filterModelSelect = ref<PlatformCallbackBehaviorTypeItem[]>([])

async function filterModel(value: string) {
  filterModelSelect.value = await platformCallbackApi.fetchPlatformCallbackBehaviorTypeItem(value)
}

const matchTableRef = ref<InstanceType<typeof MatchTable>>()

/**回传事件的下拉 */
const behaviorTypeList = ref<Array<PlatformCallbackBehaviorTypeItem>>([]);


async function updateBehaviorTypeList(platform: string) {
  if (!platform) return;
  try {
    const list = await platformCallbackApi.fetchPlatformCallbackBehaviorTypeItem(platform);
    behaviorTypeList.value = list || [];
  } catch (error) {
    console.error('获取行为类型失败', error);
    behaviorTypeList.value = [];
  }
}

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  handleSubmit: async (formVal: Record<string, any>) => {
    // 1️⃣ trim 主表单
    const baseForm = trimObject(formVal);

    // 2️⃣ trim config 表单（关键）
    const rawConfig = await configFormApi.getValues();
    if(baseForm.platform === 'kuaishou') {
      rawConfig.replayClickEnabled = rawConfig.replayClickEnabled ? 1 : 9;
    }
    const config = trimObject(rawConfig);

    // 3️⃣ 淘宝联盟特殊处理
    if (baseForm.platform === 'tb_union') {
      const tbkIdArray = Object.keys(config)
        .filter(k => k.startsWith('tbkId'))
        .sort((a, b) => Number(a.replace('tbkId', '')) - Number(b.replace('tbkId', '')))
        .map(k => config[k])
        .filter(v => v);

      config.tbkIdList = tbkIdArray;

      Object.keys(config)
        .filter(k => k.startsWith('tbkId') && k !== 'tbkIdList')
        .forEach(k => delete config[k]);
    }

    // 4️⃣ 合并
    baseForm.config = config;

    baseForm.simulate = Boolean(baseForm.simulate);

    if(baseForm.platform === 'jd' || baseForm.platform === 'vph'){
      const matchList = matchTableRef.value?.getSubmitData() ?? []
      baseForm.ocpxPlatformMatches = matchList
    }
    if(isUpdate.value ) {
      if(modalType.value === 'edit') {
        await  behavioraPlatformApi.fetchUpdateBehavioraPlatform(baseForm as UpdateBehavioraPlatformRequest);
      } else if(modalType.value === 'copy'){
        baseForm.id = undefined
        await behavioraPlatformApi.fetchCreateBehavioraPlatform(baseForm as CreateBehavioraPlatformRequest);
      }
    }  else {
      behavioraPlatformApi.fetchCreateBehavioraPlatform(baseForm as CreateBehavioraPlatformRequest);
    }
  },
  schema: [
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      // 字段名
      fieldName: 'id',
      // 界面显示的label
      dependencies: {
        show: false,
        triggerFields: ['*'],
      },
    },
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Select',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: BEHAVIORA_PLATFORM,
        onSelect: async (value: string) => {
          const schema = platformConfigForm.get(value) ?? [];
          // 1️⃣ 切 schema
          configFormApi.setState({ schema });
          // 2️⃣ 收集 schema 里的 defaultValue
          const defaultValues: Record<string, any> = {};
          schema.forEach((item) => {
            if (item.fieldName && item.defaultValue !== undefined) {
              defaultValues[item.fieldName] = item.defaultValue;
            }
          });

          // 3️⃣ 主动写入默认值（关键）
          if (Object.keys(defaultValues).length) {
            configFormApi.setValues(defaultValues);
          }
          formApi.setValues({filterBehavior: []});
          // 平台切换成淘宝联盟时需要更新行为类型默认值
          if (value === "tb_union") {
            configFormApi.setValues({action: 2});
          }
          if (value === "jd" || value === "vph") {
            formApi.setValues({
              model: 'match'
            });
            matchModel.value = 'match'
          }else{
            formApi.setValues({
              model: 'callback',
            });
            matchModel.value = 'callback'
          }
          if(value != "tb" && value != "jd" && value != "csjp"){
            filterModel(value)
          }
        },
      },
      defaultValue: Platform.JD,
      // 字段名
      fieldName: 'platform',
      // 界面显示的label
      label: `${$t('ocpx.behavioraplatform.columns.platform')}`,
      rules: 'required',
    },

    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      // 字段名
      fieldName: 'name',
      // 界面显示的label
      label: `${$t('ocpx.behavioraplatform.columns.name')}`,
      rules: 'required',
    },

    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Select',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: [
          {
            label: `${$t('ocpx.behavioraplatform.type.callback')}`,
            value: 1,
          },
          {
            label: `${$t('ocpx.behavioraplatform.type.direct_link')}`,
            value: 2,
          },
        ],
      },
      defaultValue: 1,
      // 字段名
      fieldName: 'type',
      // 界面显示的label
      label: `${$t('ocpx.behavioraplatform.columns.type')}`,
      rules: 'required',
      dependencies: {
        show: async () => {
          const data = await formApi.getValues();
          return data["platform"] === Platform.KUAKE || data["platform"] === Platform.QWEN || data["platform"] === Platform.DY_DULIDUAN || data["platform"] === Platform.YOUKU;
        },
        triggerFields: ["platform"]
      }
    },

    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Select',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: ModelSelect,
        onChange(value: string) {
          matchModel.value = value;
        },
      },
      defaultValue: 'match',
      // 字段名
      fieldName: 'model',
      // 界面显示的label
      label: `${$t('ocpx.behavioraplatform.columns.model')}`,
      rules: 'required',
    },

    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Select',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: MatchFieldSelect,
      },
      // 字段名
      fieldName: 'matchField',
      // 界面显示的label
      label: `${$t('ocpx.behavioraplatform.columns.matchField')}`,
      rules: 'required',
      defaultValue: 'requestId',
      dependencies: {
        show: async () => {
          const data = await formApi.getValues();
          return data["model"] != 'async';
        },
        triggerFields: ["model"]
      }
    },

    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Select',
      //因为后端定义的是bool值但是我这边前端掉换成0和1，select绑定bool值会有警告
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: [
          {
            label: `${$t('common.yes')}`,
            value: 1,
          },
          {
            label: `${$t('common.no')}`,
            value: 0,
          }
        ],
      },
      // 字段名
      fieldName: 'simulate',
      // 界面显示的label
      label: `${$t('ocpx.behavioraplatform.columns.simulate')}`,
      rules: 'required',
      defaultValue: 0,
      dependencies: {
        show: async () => {
          const data = await formApi.getValues();
          return data["model"] != 'async';
        },
        triggerFields: ["model"]
      }
    },
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Select',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.select')}`,
        options: behaviorTypeList,
      },
      // 字段名
      fieldName: 'simulateBehaviorType',
      // 界面显示的label
      label: `${$t('ocpx.platformcallback.columns.behaviorType')}`,
      rules: 'required',
      dependencies: {show: (values) => {
          const isSimulate = values.simulate === 1;
          const isValidPlatform = !['tb', 'jd', 'csjp'].includes(values.platform);
          return isSimulate && isValidPlatform;
        },
        triggerFields: ['simulate','platform'],
        // 联动触发：当依赖项变化时，自动决定是否加载下拉列表
        trigger: async (values) => {
          const isValidPlatform = !['tb', 'jd', 'csjp'].includes(values.platform);
          if (values.simulate === 1 && values.platform && isValidPlatform) {
            await updateBehaviorTypeList(values.platform);
            formApi.setFieldValue('simulateBehaviorType', undefined);
          } else {
            behaviorTypeList.value = [];
            // 可选：隐藏时清空已选值，防止提交非法数据
            formApi.setFieldValue('simulateBehaviorType', undefined);
          }
        },
      },
    },
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Select',
      // 对应组件的参数
      componentProps: {
        mode:"multiple",
        placeholder: `${$t('common.input')}`,
        options: filterModelSelect,
      },
      // 字段名
      fieldName: 'filterBehavior',
      // 界面显示的label
      label: '过滤事件',
      dependencies: {
        show: async () => {
          const data = await formApi.getValues();
          return data["platform"] !== Platform.JD && data["platform"] !== Platform.TB && data["platform"] !== Platform.CSJP;
        },
        triggerFields: ["platform"]
      },
    },
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Textarea',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      // 字段名
      fieldName: 'remark',
      // 界面显示的label
      label: `${$t('ocpx.behavioraplatform.columns.remark')}`,
    },
  ],
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
});

const [Modal, modalApi] = useVbenModal({
  fullscreen: true,
  fullscreenButton: false,
  async onCancel() {
    await formApi.resetForm();
    await configFormApi.resetForm();
    ocpxPlatformMatchList.value = [];
    isUpdate.value = false;
    modalType.value = 'edit';
    await modalApi.close();
  },
  async onConfirm() {
    const result = await formApi.validate();
    const configFormResult = await configFormApi.validate();
    if (!result.valid || !configFormResult.valid) {
      return;
    }
    await formApi.submitForm();
    await configFormApi.resetForm();
    isUpdate.value = false;
    modalType.value = 'edit';
    emit('pageReload');
    await modalApi.close();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = modalApi.getData();
      objectRequest.value = data.row as BehavioraPlatformItem;
      modalType.value = data.type;
      if (objectRequest.value?.id) {
        isUpdate.value = true;
        handleSetFormValue(objectRequest.value);
        ocpxPlatformMatchList.value = objectRequest.value.ocpxPlatformMatchList;
        matchModel.value = objectRequest.value.model;
      } else {
        ocpxPlatformMatchList.value = [];
        isUpdate.value = false;
      }
    }
  },
});

async function handleSetFormValue(row: BehavioraPlatformItem) {
  //因为后端定义的是bool值但是我这边前端掉换成0和1，select绑定bool值会有警告
  formApi.setValues({
    ...row,
    simulate: row.simulate ? 1 : 0, // 关键这一行
  });

  await filterModel(row.platform);

  // 统一：Map -> 普通对象
  const configObj = row.config instanceof Map
    ? Object.fromEntries(row.config.entries())
    : row.config;
  if(row.platform === 'kuaishou') {
    if(configObj.replayClickEnabled === 1) {
      configObj.replayClickEnabled = true;
    } else {
      configObj.replayClickEnabled = false;
    }
  }
  // 先获取原有平台配置schema
  let schema = platformConfigForm.get(row.platform) ?? [];
  // 如果是淘宝联盟并且有tbkId数组
  if (row.platform === 'tb_union' && Array.isArray(configObj.tbkIdList)) {
    const tbkArray: string[] = configObj.tbkIdList;
    // 生成 tbkId schema
    const tbkSchema = tbkArray.map((val, idx) => ({
      component: 'Input',
      componentProps: {
        placeholder: `请输入 tbkId${idx + 1}`,
      },
      fieldName: `tbkId${idx + 1}`,
      label: `tbkId${idx + 1}`,
      rules: 'required',
      defaultValue: val,
      suffix: () =>
        h('div', {class: 'flex gap-2'}, [
          h('span', {
            class: 'bg-white text-black border border-gray-300 rounded px-3 py-1 cursor-pointer hover:bg-gray-100',
            onClick: batchAddSchema
          }, '+'),
          h('span', {
            class: 'bg-white text-black border border-gray-300 rounded px-3 py-1 cursor-pointer hover:bg-gray-100',
            onClick: batchDeleteSchema
          }, '-')
        ])
    }));
    // 替换掉原本tbkId的schema
    schema = schema.filter(item => !item.fieldName?.startsWith('tbkId'));
    schema = [...schema, ...tbkSchema];
    // 设置schema
    configFormApi.setState({schema});

    // 设置values
    const values: Record<string, any> = {...configObj};
    tbkArray.forEach((val, idx) => {
      values[`tbkId${idx + 1}`] = val;
    });
    configFormApi.setValues(values);
  } else {
    configFormApi.setState((_) => {
      return {
        schema: platformConfigForm.get(row.platform),
      };
    });
    configFormApi.setValues(configObj);
  }
}

const title: string = objectRequest.value.id
  ? `${$t('common.edit')}`
  : `${$t('common.create')}`;
</script>
<template>
  <Modal :title="title">
    <Divider>{{ $t('core.baseInfo') }}</Divider>

    <Card :bordered="false">
      <Form/>
    </Card>

    <Divider>{{ $t('core.configuration') }}</Divider>
    <Card :bordered="false">
      <ConfigForm/>
    </Card>

    <Card :bordered="false" v-if="matchModel === 'match'">
      <MatchTable
        ref="matchTableRef"
        :match-data-list="ocpxPlatformMatchList||[]"
      />
    </Card>
  </Modal>
</template>
