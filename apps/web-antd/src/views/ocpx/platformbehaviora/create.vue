<script lang="ts" setup name="CreateNotice">
import type {
  BehavioraPlatformItem,
  CreateBehavioraPlatformRequest, OcpxPlatformMatch, PlatformCallbackBehaviorTypeItem,
  UpdateBehavioraPlatformRequest
} from '#/api/models';

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
import {trimObject} from '#/utils/trim';

const emit = defineEmits(['pageReload']);
// 创建表格
const matchTableRef = ref<any>();

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
  simulate: false,
  filterBehavior: [],
  status: 0,
  updateTime: "",
  updateUsername: "",
  type: 1,
  directLink: ''
});

const isUpdate = ref<Boolean>(false);
const matchModel = ref<string>('callback');

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
    const lastIndex = tbkIndexes[tbkIndexes.length - 1].index;
    const newSchema = [...schema];
    newSchema.splice(lastIndex, 1);

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

    // 5️⃣ 提交
    await (isUpdate.value
      ? behavioraPlatformApi.fetchUpdateBehavioraPlatform(baseForm as UpdateBehavioraPlatformRequest)
      : behavioraPlatformApi.fetchCreateBehavioraPlatform(baseForm as CreateBehavioraPlatformRequest));
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
          configFormApi.setState((_) => {
            return {
              schema: platformConfigForm.get(value),
            };
          });
          formApi.setValues({
            filterBehavior: []
          });
          // 平台切换成淘宝联盟时需要更新行为类型默认值
          if (value === "tb_union") {
            configFormApi.setValues({
              action: 2
            });
          }
          if (value != "tb" && value != "jd") {
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
          return data["platform"] === Platform.KUAKE || data["platform"] === Platform.QWEN;
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
      defaultValue: 'callback',
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
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: [
          {
            label: `${$t('common.yes')}`,
            value: "true",
          },
          {
            label: `${$t('common.no')}`,
            value: "false",
          }
        ],
      },
      // 字段名
      fieldName: 'simulate',
      // 界面显示的label
      label: `${$t('ocpx.behavioraplatform.columns.simulate')}`,
      rules: 'required',
      defaultValue: "false",
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
        mode: "multiple",
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
          return data["platform"] !== Platform.JD && data["platform"] !== Platform.TB;
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


function trimFormValue(obj: Record<string, any>) {
  const result: Record<string, any> = {};
  Object.keys(obj || {}).forEach((key) => {
    const val = obj[key];
    result[key] =
      typeof val === 'string' ? val.trim() : val;
  });
  return result;
}

const [Modal, modalApi] = useVbenModal({
  fullscreen: true,
  fullscreenButton: false,
  async onCancel() {
    await formApi.resetForm();
    await configFormApi.resetForm();
    ocpxPlatformMatchList.value = [];
    isUpdate.value = false;
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
    emit('pageReload');
    await modalApi.close();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      objectRequest.value = modalApi.getData<Record<string, any>>();
      if (objectRequest.value.id) {
        isUpdate.value = true;
        handleSetFormValue(objectRequest.value);
        ocpxPlatformMatchList.value = objectRequest.value.ocpxPlatformMatchList;
        matchModel.value = objectRequest.value.model;
      } else {
        isUpdate.value = false;
      }
    }
  },
});

function handleSetFormValue(row: BehavioraPlatformItem) {
  formApi.setValues(row);
  // 先获取原有平台配置schema
  let schema = platformConfigForm.get(row.platform) ?? [];
  // 如果是淘宝联盟并且有tbkId数组
  if (row.platform === "tb_union" && Array.isArray(row.config?.tbkIdList)) {
    const tbkArray: string[] = row.config.tbkIdList;
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
    const values: Record<string, any> = {...row.config};
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
    configFormApi.setValues(row.config);
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
        :match-data-list="ocpxPlatformMatchList"
      />
    </Card>
  </Modal>
</template>
