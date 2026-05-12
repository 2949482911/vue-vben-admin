<script setup lang="ts">
import { trimObject } from '#/utils/trim';
import { useVbenForm } from '#/adapter/form';
import { useVbenDrawer, Page } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { ref, watch } from 'vue'; // 添加 watch 和 computed
import { message,type UploadFile } from 'ant-design-vue';
// import { upload_file } from '#/api/examples/upload';
import type {
  DspUpdateItem,
  PushCampaignItem
} from '#/api/models';
import {
  BatchOptionsType,
  PLATFORM,
  STATUS_SELECT,
  TABLE_COMMON_COLUMNS,
} from '#/constants/locales';
import { huaweiCampaignApi, honorCampaignApi, pushCampaignApi } from '#/api/core';
import {
  tagsNameOptions,
  silenceOptions,
  appUsageOptions,
  recentlyActiveOptions,
  userAppActiveStateOptions,
  similarAppUsageDurationOptions,
  similarAppUsageRatingOptions,
  ageGroupOptions,
  genderOptions,
  consumptionLevelOptions,
  phonePriceOptions,
  propertyStatusOptions,
  occupationsOptions,
  marriageOptions,
  childrenOptions,
  userClickReceiptOptions,
  userRandomBucketOptions,
  permanentRegionOptions
} from './utils'
import {TagsName} from './enums';
import {Input} from 'ant-design-vue';
interface selectOptions {
  label: string;
  value: string | number;
}
const title = ref<string>('');
const emit = defineEmits(['pageReload']);
const objectRequest = ref<DspUpdateItem>({});
const isUpdate = ref<Boolean>(false);
const TypeOptions = ref<selectOptions[]>()
const titleColor = ref('');
watch(isUpdate,(newVal) => {
  if(newVal) {
    title.value = "修改计划"
  } else {
    title.value = "新增计划"
  }
},{ deep: true, immediate: true });

const tagValueToCategoryMap: Record<string, string> = {};

function initTagValueMap() {
  silenceOptions.forEach(opt => tagValueToCategoryMap[opt.value] = TagsName.cUserSilenceDuration);
  appUsageOptions.forEach(opt => tagValueToCategoryMap[opt.value] = TagsName.cAppUsageWithin30dDev);
  recentlyActiveOptions.forEach(opt => tagValueToCategoryMap[opt.value] = TagsName.cRecentlyActive);
  userAppActiveStateOptions.forEach(opt => tagValueToCategoryMap[opt.value] = TagsName.cAppActiveState);
  similarAppUsageDurationOptions.forEach(opt => tagValueToCategoryMap[opt.value] = TagsName.cSimilarAppUsageDuration);
  similarAppUsageRatingOptions.forEach(opt => tagValueToCategoryMap[opt.value] = TagsName.cSimilarAppUsageRating);
  ageGroupOptions.forEach(opt => tagValueToCategoryMap[opt.value] = TagsName.cAgeGroup);
  genderOptions.forEach(opt => tagValueToCategoryMap[opt.value] = TagsName.cGender);
  consumptionLevelOptions.forEach(opt => tagValueToCategoryMap[opt.value] = TagsName.cConsumptionLevel);
  phonePriceOptions.forEach(opt => tagValueToCategoryMap[opt.value] = TagsName.cPhonePrice);
  propertyStatusOptions.forEach(opt => tagValueToCategoryMap[opt.value] = TagsName.cPropertyStatus);
  occupationsOptions.forEach(opt => tagValueToCategoryMap[opt.value] = TagsName.cOccupations);
  marriageOptions.forEach(opt => tagValueToCategoryMap[opt.value] = TagsName.cMarriage);
  childrenOptions.forEach(opt => tagValueToCategoryMap[opt.value] = TagsName.cChildren);
  userRandomBucketOptions.forEach(opt => tagValueToCategoryMap[opt.value] = TagsName.cRandomNum);
  userClickReceiptOptions.forEach(opt => tagValueToCategoryMap[opt.value] = TagsName.reportAttributionParameters);
  permanentRegionOptions.forEach(opt => tagValueToCategoryMap[opt.value] = TagsName.cPermanentRegion);
}

initTagValueMap();

const singleSelectTags = [
  TagsName.cUserSilenceDuration,
  TagsName.cAppActiveState,
  TagsName.cGender,
  TagsName.reportAttributionParameters
];


function buildTreeData(): { title: string; value: string; children?: { title: string; value: string }[] }[] {
  return tagsNameOptions.map(tagOpt => {
    const tagName = tagOpt.value as string;
    const isSingle = singleSelectTags.includes(tagName as TagsName);
    let children: { title: string; value: string }[] = [];
    
    switch(tagName) {
      case TagsName.cUserSilenceDuration:
        children = silenceOptions.map(opt => ({ title: opt.label, value: opt.value as string }));
        break;
      case TagsName.cAppUsageWithin30dDev:
        children = appUsageOptions.map(opt => ({ title: opt.label, value: opt.value as string }));
        break;
      case TagsName.cRecentlyActive:
        children = recentlyActiveOptions.map(opt => ({ title: opt.label, value: opt.value as string }));
        break;
      case TagsName.cAppActiveState:
        children = userAppActiveStateOptions.map(opt => ({ title: opt.label, value: opt.value as string }));
        break;
      case TagsName.cSimilarAppUsageDuration:
        children = similarAppUsageDurationOptions.map(opt => ({ title: opt.label, value: opt.value as string }));
        break;
      case TagsName.cSimilarAppUsageRating:
        children = similarAppUsageRatingOptions.map(opt => ({ title: opt.label, value: opt.value as string }));
        break;
      case TagsName.cAgeGroup:
        children = ageGroupOptions.map(opt => ({ title: opt.label, value: opt.value as string }));
        break;
      case TagsName.cGender:
        children = genderOptions.map(opt => ({ title: opt.label, value: opt.value as string }));
        break;
      case TagsName.cConsumptionLevel:
        children = consumptionLevelOptions.map(opt => ({ title: opt.label, value: opt.value as string }));
        break;
      case TagsName.cPhonePrice:
        children = phonePriceOptions.map(opt => ({ title: opt.label, value: opt.value as string }));
        break;
      case TagsName.cPropertyStatus:
        children = propertyStatusOptions.map(opt => ({ title: opt.label, value: opt.value as string }));
        break;
      case TagsName.cOccupations:
        children = occupationsOptions.map(opt => ({ title: opt.label, value: opt.value as string }));
        break;
      case TagsName.cMarriage:
        children = marriageOptions.map(opt => ({ title: opt.label, value: opt.value as string }));
        break;
      case TagsName.cChildren:
        children = childrenOptions.map(opt => ({ title: opt.label, value: opt.value as string }));
        break;
      case TagsName.cRandomNum:
        children = userRandomBucketOptions.map(opt => ({ title: opt.label, value: opt.value as string }));
        break;
      case TagsName.reportAttributionParameters:
        children = userClickReceiptOptions.map(opt => ({ title: opt.label, value: opt.value as string }));
        break;
      case TagsName.cPermanentRegion:
        children = permanentRegionOptions.map(opt => ({ title: opt.label, value: opt.value as string }));
        break;
    }
    return {
      title: isSingle ? `${tagOpt.label} (单选)` : tagOpt.label,
      value: tagName,
      children,
      selectable: false
    };
  });
}

const treeData = ref(buildTreeData());
// 获取图片id
async function getImageId(file: File, fileName: string) {
  const formData = new FormData();
  formData.append('file', file); 
  const imageId = await pushCampaignApi.fetchImageId(formData);
  formApi.setFieldValue(fileName, imageId)
}
function loadTypeOptions(targetType:number) {
  if(targetType === 1) {
    TypeOptions.value = 
    [
      {
        label: '标签',
        value: 0,
      },
      {
        label: 'OAID',
        value: 5,
      }
    ]
  } else {
    TypeOptions.value = 
    [
      {
        label: '标签',
        value: 0,
      },
      {
        label: 'Token',
        value: 2,
      },
      {
        label: 'OAID',
        value: 5,
      }
    ]
  }
}
const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  handleSubmit: async (formVal: Record<string, any>) => {
    const params = trimObject(formVal);
    const startTime = new Date(params.start).getTime();
    const endTime = new Date(params.end).getTime();
    const addRequest = {
      name: params.name,
      requestId: params.requestId,
      targetType: params.targetType,
      audience: {
        type: params.type,
        tagSet: (() => {
          const tagValues = typeof params.tagTreeValue === 'string' 
            ? [params.tagTreeValue] 
            : params.tagTreeValue || [];
          
          const tagSetMap: Record<string, string[]> = {};
          for (const value of tagValues) {
            const categoryName = tagValueToCategoryMap[value];
            if (categoryName) {
              if (!tagSetMap[categoryName]) {
                tagSetMap[categoryName] = [];
              }
              if (singleSelectTags.includes(categoryName)) {
                if (tagSetMap[categoryName].length === 0) {
                  tagSetMap[categoryName] = [value];
                }
              } else {
                tagSetMap[categoryName].push(value);
              }
            }
          }
          
          return Object.entries(tagSetMap).map(([name, tags]) => ({ name, tags }));
        })()
      },
      plan:{
        time:[
          {
            start: startTime,
            end: endTime
          }
        ],
        noDisturbEnable: params.noDisturbEnable === true ? 1 : 0,
      },
      material: {
        title: params.title,
        body: params.body,
        summary: params.summary,
        imageUrl: params.imageUrl,
        imageId: params.imageId,
        actionType: params.actionType,
        intent: params.intent,
        action: params.action,
        data: params.data,
        button: {
          name: params.btnName,
          actionType: params.btnActionType,
          intentType: params.intentType,
          intent: params.btnIntent
        }
      },
      materialStyle: {
        advancedStyle:{
          color: titleColor.value ? titleColor.value : '#0a59f7',
          backgroundImageId: params.backgroundImageId,
          transparentBackgroundImageId: params.transparentBackgroundImageId,
          colorMode: params.colorMode,
          bigImageId: params.bigImageId,
        },
        smallIcon: {
          type: params.smallIconType,
          imageId: params.smallImageId,
          iconPath: params.iconPath,
          iconUrl: params.iconUrl
        },
        displayMode: params.displayMode,
        foldType: params.foldType,
      },
      options: {
        conversionReportFlag: params.conversionReportFlag,
        biTag: params.biTag,
        rtaMode: params.rtaMode,
        preinstallVoucher: params.preinstallVoucher,
        commonVoucher: params.commonVoucher,
        appVoucher: params.appVoucher
      },
      sendNum: params.sendNum,
      targetClientId: params.targetClientId,
      rtaCfgId: params.rtaCfgId,
      isTestCampaign: params.isTestCampaign,
      conversionReportId: params.conversionReportId,
      sendTiming: params.sendTiming,
      eventNames: params.eventNames,
      appGroupId: params.appGroupId,
      excludeOneself: params.excludeOneself,
      fullSend: params.fullSend,
      excludeFistActiveAudience: params.excludeFistActiveAudience
    }
    if(isUpdate.value) {
      // 调用修改接口
      // await huaweiCampaignApi.fetchCreateCampaign(params as DspUpdateItem);
      message.success('修改成功');
    } else {
      // 调用新增接口
      if(modalType.value === 'huawei') {  
        await huaweiCampaignApi.fetchCreateCampaign(addRequest as PushCampaignItem);
      } else if(modalType.value === 'honor') {
        await honorCampaignApi.fetchCreateCampaign(addRequest as PushCampaignItem);
      }
      message.success('新增成功');
     }
     emit('pageReload');
  },
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      fieldName: 'requstId',
      dependencies: {
        show: false,
        triggerFields: ['*'],
      },
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      rules: 'required',
      fieldName: 'name',
      label: `${$t('adx.dsp.columns.name')}`
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: `${$t('common.choice')}`,
        options: [
          {
            label: '促活促转化用户',
            value: 0,
          },
          {
            label: '安装促激活用户',
            value: 1,
          }
        ],
        allowClear: true,
      },
      defaultValue: 0,
      fieldName: 'targetType',
      label: `推广目标`
    },
    
    {
      component: 'Select',
      componentProps: {
        options: TypeOptions,
        placeholder: `${$t('common.input')}`,
      },
      dependencies: {
        triggerFields: ['targetType'],
        if: (val) => {
          loadTypeOptions(val.targetType)
          return true
        },
      },
      rules: 'required',
      fieldName: 'type',
      label: `受众群组`
    },
    {
      component: 'TreeSelect',
      componentProps: {
        treeData,
        placeholder: `${$t('common.input')}`,
        allowClear: true,
        showSearch: true,
        treeCheckable: true,
        treeDefaultExpandAll: true,
      },
      dependencies: {
        triggerFields: ['type'],
        show: (val) => { 
          return val.type === 0
        }
      },
      rules: 'required',
      fieldName: 'tagTreeValue',
      label: `标签选择`
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: `${$t('common.input')}`,
        min: 5000,
        max: 2000000000
      },
      dependencies: {
        triggerFields: ['type'],
        show: (val) => { 
          if(val.type !== 2) {
            return true
          }
          return false
        }
      },
      fieldName: 'sendNum',
      label: `发送人数`
    },
    {
      component: 'Switch',
      defaultValue: true,
      componentProps: {
        placeholder: `${$t('common.input')}`,
        class: 'w-10',
      },
      fieldName: 'noDisturbEnable',
      label: `夜间免打扰`
    },
    {
      component: 'DatePicker',
      fieldName: 'start',
      label: '投放开始时间',
      dependencies: {
        triggerFields: ['type','noDisturbEnable'],
        show: (val) => { 
          if(val.type === 2 || val.type === 0) {
            return true
          }
          return false
        }
      },
      componentProps: {
        format: 'YYYY-MM-DD HH:mm',
        valueFormat: 'YYYY-MM-DDTHH:mm',
        showTime: true,
      },
      rules: 'required',
    },
    {
      component: 'DatePicker',
      fieldName: 'end',
      label: '投放结束时间',
      dependencies: {
        triggerFields: ['type','noDisturbEnable'],
        show: (val) => { 
          if(val.type === 2 || val.type === 0) {
            return true
          }
          return false
        }
      },
      componentProps: {
        format: 'YYYY-MM-DD HH:mm',
        valueFormat: 'YYYY-MM-DDTHH:mm',
        showTime: true,
      },
      rules: 'required',
    },

    {
      component: 'Input',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      dependencies: {
        rules: (values) => {
          if(values.type === 0) {
            return 'required'
          }
          return ''
        },
        triggerFields: ['type'],
      },
      fieldName: 'title',
      label: `通知标题`
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      fieldName: 'body',
      label: `通知内容`
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      fieldName: 'summary',
      label: '消息摘要'
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      dependencies: {
        show: (values) => {
          return values.type === 2 || values.type === 5;
        },
        triggerFields: ['type'],
      },
      fieldName: 'imageUrl',
      label: '配图URL'
    },
    {
      component: 'Upload',
      componentProps: {
        accept: '.png,.jpg,.jpeg',
        placeholder: `请上传`,
        disabled: false,
        maxCount: 1,
        // 单位：MB
        maxSize: 2,
        multiple: false,
        showUploadList: true,
        listType: 'picture-card',
        draggable: true, // 启用拖拽排序
        handleChange: ({ file }: { file: UploadFile }) => {
          console.log('file', file);
        },
        customRequest: async (option) => {
          await getImageId(option.file as File, 'imageId')
        },
      },
      dependencies: {
        show: (values) => {
          return values.type === 0;
        },
        triggerFields: ['type'],
      },
      fieldName: 'imageId',
      label: '配图'
    },
    {
      component: 'Select',
      fieldName: 'actionType',
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: [
          {
            label: 'intentUri',
            value: 0,
          },
          {
            label: 'action',
            value: 1,
          },
          {
            label: '应用首页',
            value: 2,
          },
        ],
      },
      label:'跳转'
    },
    {
      component: 'Input',
      fieldName: 'intent',
      rules: 'required',
      dependencies: {
        rules: (val) => {
          if(val.actionType === 0) {
            return 'required'
          }
          return ''
        },
        triggerFields: ['actionType'],
      },
      label: '自定义页面',
    },
    {
      component: 'Input',
      fieldName: 'action',
      dependencies: {
        triggerFields: ['actionType'],
        rules: (val) => {
            if(val.actionType === 1) {
              return 'required'
            }
            return ''
          },
        },
      label: 'action',
    },
    {
      component: 'Input',
      fieldName: 'data',
      label: '自定义信息',
    },
    {
      component: 'Input',
      fieldName: 'btnName',
      label: '按钮名称',
    },
    {
      component: 'Select',
      defaultValue: 0,
      componentProps: {
        options: [
          {
            label: '打开应用首页',
            value: 0,
          },
          {
            label: '打开应用自定义页面',
            value: 1,
          },
          {
            label: '打开指定的网页',
            value: 2,
          },
        ],
      },
      fieldName: 'btnActionType',
      label: '按钮动作类型',
    },
    {
      component: 'Select',
      defaultValue: 0,
      componentProps: {
        options: [
          {
            label: '通过 intent 打开应用自定义页面',
            value: 0,
          },
          {
            label: '通过 action 打开应用自定义页面',
            value: 1,
          }
        ],
      },
      dependencies:{
        triggerFields: ['btnActionType'],
        rules: (value) => {
          if (value.btnActionType === 1) {
            return 'required';
          }
          return '';
        }
      },
      fieldName: 'intentType',
      label: '打开页面方式',
    },
    {
      component: 'Input',
      label: '自定义页面名称',
      fieldName: 'btnIntent',
      dependencies: {
        show: false,
        if:async (value) => {
          const formVal = await formApi.getValues();
          if(value.btnActionType === 1) {
            formApi.setFieldValue('btnIntent', formVal.intentType)
          } else if(value.btnActionType === 2) {
            formApi.setFieldValue('btnIntent', formVal.intent)

          }
          return true
        },
        triggerFields: ['btnActionType'],
      },
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: [
          {
            label: '是',
            value: 1,
          },
          {
            label: '否',
            value: 0,
          },
        ],
      },
       fieldName: 'isUseColor',
       label: '通知标题使用颜色'
    },
    {
      component: 'Default' as any,
      fieldName:'color',
      dependencies: {
        show: (val) => {
          return (val.transparentBackgroundImageId || val.backgroundImageId) && val.isUseColor
        },
        triggerFields: ['backgroundImageId','transparentBackgroundImageId','isUseColor'],
      },
      label: `通知标题颜色`
    },
    {
      component: 'Upload',
      componentProps: {
        accept: '.png,.jpg,.jpeg',
        placeholder: `请上传`,
        disabled: false,
        maxCount: 1,
        maxSize: 2,
        multiple: false,
        showUploadList: true,
        listType: 'picture-card',
        draggable: true, // 启用拖拽排序
        handleChange: ({ file }: { file: UploadFile }) => {
          console.log('file', file);
        },
        customRequest: async (option) => {
          await getImageId(option.file as File, 'backgroundImageId')
        },
      },
      fieldName: 'backgroundImageId',
      label: '背景图片'
    },
    {
      component: 'Upload',
      componentProps: {
        accept: '.png,.jpg,.jpeg',
        placeholder: `请上传`,
        disabled: false,
        maxCount: 1,
        // 单位：MB
        maxSize: 2,
        multiple: false,
        showUploadList: true,
        listType: 'picture-card',
        draggable: true, // 启用拖拽排序
        handleChange: ({ file }: { file: UploadFile }) => {
          console.log('file', file);
        },
        customRequest: async (option) => {
          await getImageId(option.file as File, 'transparentBackgroundImageId')
        },
      },
      dependencies:{
        show: (val) => {
          return !val.backgroundImageId
        },
        if:async (value) => {
          if(value.backgroundImageId) {
            await formApi.setFieldValue('transparentBackgroundImageId', value.backgroundImageId)
          }
          return true
        },
        triggerFields:['backgroundImageId']
      },
      fieldName: 'transparentBackgroundImageId',
      label: '透明底图'
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: [
          {
            label: '跟随',
            value: 1,
          },
          {
            label: '不跟随',
            value: 0,
          }
        ],
      },
      fieldName: 'colorMode',
      label: '内容颜色随标题改变'
    },
    {
      component: 'Upload',
      componentProps: {
        accept: '.png,.jpg,.jpeg',
        placeholder: `请上传`,
        disabled: false,
        maxCount: 1,
        // 单位：MB
        maxSize: 2,
        multiple: false,
        showUploadList: true,
        listType: 'picture-card',
        draggable: true, // 启用拖拽排序
        handleChange: ({ file }: { file: UploadFile }) => {
          console.log('file', file);
        },
        customRequest: async (option) => {
          await getImageId(option.file as File, 'bigImageId')
        },
      },
      fieldName: 'bigImageId',
      label: '大图'
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: [
          {
            label: '默认图标',
            value: 0,
          },
          {
            label: '系统模板图',
            value: 1,
          },
          {
            label: '使用 App 内图标',
            value: 2,
          },
          {
            label: '千人千面 icon 图标',
            value: 3
          }
        ],
      },
      defaultValue: 0,
      fieldName: 'smallIconType',
      label: '小图标类型'
    },
    {
      component: 'Upload',
      componentProps: {
        accept: '.png,.jpg,.jpeg',
        placeholder: `请上传`,
        disabled: false,
        maxCount: 1,
        // 单位：MB
        maxSize: 2,
        multiple: false,
        showUploadList: true,
        listType: 'picture-card',
        draggable: true, // 启用拖拽排序
        handleChange: ({ file }: { file: UploadFile }) => {
          console.log('file', file);
        },
        customRequest: async (option) => {
          await getImageId(option.file as File, 'smallImageId')
        },
      },
      dependencies: {
        show: (val) => {
          return val.smallIconType === 1
        },
        triggerFields: ['smallIconType'],
      },
      fieldName: 'smallImageId',
      label: '图片'
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      dependencies: {
        show: (val) => {
          return val.smallIconType === 2
        },
        triggerFields: ['smallIconType'],
      },
      fieldName: 'iconPath',
      label: '图标路径'
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      dependencies: {
        show: (val) => {
          return val.smallIconType === 3
        },
        triggerFields: ['smallIconType'],
      },
      fieldName: 'iconUrl',
      label: '图标地址'
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: [
          {
            label: '送达时展示',
            value: 0,
          },
          {
            label: '亮屏时展示',
            value: 1,
          },
          {
            label: '下拉通知栏时展示',
            value: 3,
          }
        ]
      },
      defaultValue: 0,
      fieldName: 'displayMode',
      label: '通知栏消息时机'
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: [
          {
            label: '折叠',
            value: 0,
          },
          {
            label: '不折叠',
            value: 1,
          }
        ]
      },
      defaultValue: 0,
      fieldName: 'foldType',
      label: '消息折叠类型'
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: [
          {
            label: '接收',
            value: 0,
          },
          {
            label: '不接收',
            value: 1,
          }
        ]
      },
      defaultValue: 0,
      fieldName: 'conversionReportFlag',
      label: '接收点击回执'
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      fieldName: 'biTag',
      label: `自定义参数`
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: [
          {
            label: '不使用',
            value: 0,
          },
          {
            label: '使用',
            value: 1,
          }
        ]
      },
      dependencies: {
        show: (val) => {
          return val.type === 0
        },
        triggerFields: ['type'],
      },
      defaultValue: 0,
      fieldName: 'rtaMode',
      label: `使用RTA`
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: [
          {
            label: '不使用',
            value: 0,
          },
          {
            label: '使用',
            value: 1,
          }
        ]
      },
      dependencies: {
        show: (val) => {
          return val.type === 0 || val.type === 5
        },
        triggerFields: ['type'],
      },
      defaultValue: 0,
      fieldName: 'preinstallVoucher',
      label: `预装代金券`
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: [
          {
            label: '不使用',
            value: 0,
          },
          {
            label: '使用',
            value: 1,
          }
        ]
      },
      defaultValue: 1,
      fieldName: 'commonVoucher',
      label: `通用代金券`
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: [
          {
            label: '不使用',
            value: 0,
          },
          {
            label: '使用',
            value: 1,
          }
        ]
      },
      defaultValue: 1,
      fieldName: 'appVoucher',
      label: `App通用代金券`
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      fieldName: 'targetClientId',
      label: `目标客户`
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      dependencies: {
        triggerFields: ['type','rtaMode'],
        show: (val) => { 
          return val.type === 0 && val.rtaMode === 1
        },
      },
      fieldName: 'rtaCfgId',
      label: `RTA策略`
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: [
          {
            label: '测试计划',
            value: 1,
          },
          {
            label: '正式计划',
            value: 0,
          }
        ],
      },
      defaultValue: 0,
      fieldName: 'isTestCampaign',
      label: `增长类型`
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      dependencies: {
        triggerFields: ['conversionReportFlag'],
        show: (val) => { 
          if(val.conversionReportFlag === 0) {
            return true
          }
          return false
        }
      },
      fieldName: 'conversionReportId',
      label: `标记ID`
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: [
          {
            label: '直接发送',
            value: 1,
          },
          {
            label: '随场景发送',
            value: 0,
          }
        ],
      },
      dependencies: {
        triggerFields: ['type'],
        show: (val) => { 
          if(val.type === 5|| val.type === 0) {
            return true
          }
          return false
        }
      },
      defaultValue: 0,
      fieldName: 'sendTiming',
      label: `发送时机`
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      dependencies: {
        triggerFields: ['sendTiming','type'],
        rules: (val) => {
          if(val.sendTiming === 1 && val.type === 0) {
            return 'required'
          }
          return ''
        }
      },
      fieldName: 'eventNames',
      label: `事件列表名称`
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      fieldName: 'appGroupId',
      label: `应用组ID`
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: [
          {
            label: '排除自己',
            value: 1,
          },
          {
            label: '不排除自己',
            value: 0,
          }
        ],
      },
      fieldName: 'excludeOneself',
      label: `排除本应用`
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: [
          {
            label: '发送',
            value: true,
          },
          {
            label: '不发送',
            value: false,
          }
        ],
      },
      dependencies: {
        triggerFields: ['type','sendTiming'],
        show: (val) => { 
          if(val.type === 5 && val.sendTiming === 1) {
            return true
          }
          return false
        }
      },
      defaultValue: false,
      fieldName: 'fullSend',
      label: `全量发送`
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: [
          {
            label: '排除',
            value: true,
          },
          {
            label: '不排除',
            value: false,
          }
        ],
      },
      dependencies: {
        triggerFields: ['type','sendTiming'],
        show: (val) => { 
          if(val.type === 5 && val.sendTiming === 1) {
            return true
          }
          return false
        }
      },
      defaultValue: false,
      fieldName: 'excludeFistActiveAudience',
      label: `当日已活跃人群`
    },
  ],
});
const modalType = ref<string>('huawei')
const [Drawer, drawerApi] = useVbenDrawer({
  closeOnPressEscape: false,
  // 当抽屉打开状态改变时触发
  async onOpenChange(isOpen) {
    if (!isOpen) {
      await drawerApi.close();
    } else {
      const data = await drawerApi.getData();
      if(data.id) {
        objectRequest.value = data as DspUpdateItem;
        formApi.setValues(objectRequest.value);
        isUpdate.value = !!objectRequest.value.id;          
      } else {
        modalType.value = data.type;
      }
    }
  },
  async onConfirm() {
    const result = await formApi.validate();
    if(!result.valid) return;
    await formApi.submitForm();
    isUpdate.value = false;
    emit('pageReload');
    modalType.value = 'huawei';
    await drawerApi.close();
  },
});

</script>
<template> 
  <div>
    <Page auto-content-height>
      <Drawer class="w-[50%]" :title="title">
        <Form>
          <template #color>
            <Input type="color" v-model:value="titleColor" class="!w-20"/>
          </template>
        </Form>
      </Drawer>
    </Page>
  </div>
</template>

<style lang="scss" scoped>
</style>
