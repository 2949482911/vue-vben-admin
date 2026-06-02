import type { VbenFormSchema } from '@vben/common-ui';
import {
  BILLINGTYPE_SELECT,
  COMMODITYURL_SELECT,
  DELIVER_SELECT,
  PHASETWOGOAL_SELECT,
  PROMOTIONLINK_SELECT,
  VXFOLLOW_SELECT,
} from '../../vivo/projectEnum';

/**
 * 根据平台动态生成表单 Schema
 * @param platform 平台类型：'vivo' | 'oppo'
 */
export function getAdgroupFormSchema(platform: string): VbenFormSchema[] {
  // 1. 公共字段（vivo 和 oppo 都有的字段）
  const commonFields: VbenFormSchema[] = [
    {
      component: 'Input',
      componentProps: { allowClear: true, placeholder: '请输入' },
      fieldName: 'adgroupName',
      label: '广告组名称',
    },
    {
      component: 'DatePicker',
      componentProps: {
        allowClear: true,
        placeholder: '请选择',
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
      },
      fieldName: 'adgroupCreateTime',
      label: '广告组创建时间',
    },
  ];

  // 2. VIVO 独有或特有的字段
  if (platform === 'vivo') {
    return [
      ...commonFields,
      {
        component: 'Input',
        componentProps: { allowClear: true, placeholder: '请输入' },
        fieldName: 'apkId',
        label: '渠道包id（子包id）',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'rpkDeepLink',
        label: '快应用deepLink地址',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'webSiteUrl',
        label: '推广链接',
      },
      {
        component: 'Select',
        componentProps: {
          options: PROMOTIONLINK_SELECT,
        },
        fieldName: 'h5Type',
        label: '推广链接类型',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'h5Code',
        label: '推广链接编码',
      },
      {
        component: 'Select',
        componentProps: {
          allowClear: true,
          placeholder: '请选择',
          options: COMMODITYURL_SELECT,
        },
        fieldName: 'productUrlType',
        label: '商品URL类型',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'industry1',
        label: '一级行业分类id',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'industry2',
        label: '二级行业分类id',
      },
      {
        component: 'Select',
        componentProps: {
          allowClear: true,
          placeholder: '请选择',
          options: [],
        },
        fieldName: 'advertiseQualificationId',
        label: '广告投放资质ID',
      },
      {
        component: 'Select',
        componentProps: {
          allowClear: true,
          placeholder: '请选择',
          options: VXFOLLOW_SELECT,
        },
        fieldName: 'wechatFollow',
        label: '是否微信一键关注',
      },
      {
        component: 'DatePicker',
        componentProps: {
          allowClear: true,
          placeholder: '请选择',
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD',
        },
        fieldName: 'endDate',
        label: '投放开始日期',
      },
      {
        component: 'DatePicker',
        componentProps: {
          allowClear: true,
          placeholder: '请选择',
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD',
        },
        fieldName: 'startDate',
        label: '投放结束日期',
      },
      {
        component: 'Select',
        componentProps: {
          allowClear: true,
          placeholder: '请选择',
          options: BILLINGTYPE_SELECT,
        },
        fieldName: 'chargeType',
        label: '计费类型',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'price',
        label: '一阶段出价',
      },
      {
        component: 'Select',
        componentProps: {
          allowClear: true,
          placeholder: '请选择',
          options: PHASETWOGOAL_SELECT,
        },
        fieldName: 'cvType',
        label: '转化目标',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'ocpxPrice',
        label: '转化出价',
      },
      {
        component: 'Select',
        componentProps: {
          allowClear: true,
          placeholder: '请选择',
          options: PHASETWOGOAL_SELECT,
        },
        fieldName: 'secondCvType',
        label: '深度优化转化目标',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'secondOcpxPrice',
        label: '深度优化出价',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'dailyBudget',
        label: '日预算',
      },
      {
        component: 'Select',
        componentProps: {
          allowClear: true,
          placeholder: '请选择',
          options: DELIVER_SELECT,
        },
        fieldName: 'spentType',
        label: '投放状态',
      },
      // {
      //   component: 'DefaultSlot',
      //   fieldName: 'scheduleTime',
      //   label: '广告投放时段',
      // },
    ];
  }

  // 3. OPPO 独有或特有的字段
  if (platform === 'oppo') {
    return [
      ...commonFields,
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'adServingType',
        label: '投放模式',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'advertiseType',
        label: '广告类型',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'advertiseTypeName',
        label: '广告类型名称',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'appletId',
        label: '小程序ID',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'appletPath',
        label: '小程序Path',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'appletType',
        label: '小程序类型',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'auditDesc',
        label: '审核原因',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'auditStatus',
        label: '审核状态',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'dayBudget',
        label: '计划日预算',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'deepOcpcTypeName',
        label: '深度转化类型名称',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'deepOcpcType',
        label: '深度转化类型',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'deepOcpcPrice',
        label: '深度转化出价',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'deepUrl',
        label: '直达链接',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'defaultSecondStage',
        label: '是否开启免一阶',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'deleteFlag',
        label: '删除状态',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'deleted',
        label: '广告组详细状态',
      },
      {
        component: 'DatePicker',
        componentProps: {
          allowClear: true,
          placeholder: '请选择',
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD',
        },
        fieldName: 'endDate',
        label: '推广截止时间',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'extensionFlow',
        label: '推广流量',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'extensionFlowName',
        label: '推广流量名称',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'extensionType',
        label: '推广目标',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'extensionTypeName',
        label: '推广目标名称',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'flowScene',
        label: '流量场景',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'flowSceneName',
        label: '流量场景名称',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'gainQuantityBudget',
        label: '一键起量预算',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'gainQuantityCycles',
        label: '一键起量次数',
      },
      {
        component: 'DatePicker',
        componentProps: {
          allowClear: true,
          placeholder: '请选择',
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD',
        },
        fieldName: 'gainQuantityDate',
        label: '一键起量日期',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'gainQuantityStatus',
        label: '一键起量状态',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'gainQuantityStatusName',
        label: '一键起量状态名称',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'globalSpecId',
        label: '创意规格',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'globalSpecName',
        label: '创意规格名称',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'ocpcPrice',
        label: '转化出价',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'ocpcState',
        label: 'ocpc转化阶段',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'ocpcType',
        label: '转化类型',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'ocpcTypeName',
        label: '转化类型名称',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'price',
        label: '基础出价',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'pushAppPageType',
        label: '应用内页的类型',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'showStatusName',
        label: '前端展示状态描述',
      },
      {
        component: 'DatePicker',
        componentProps: {
          allowClear: true,
          placeholder: '请选择',
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD',
        },
        fieldName: 'startDate',
        label: '开始日期',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'status2',
        label: '开关状态',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'statusName',
        label: '详细状态描述',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'subShowStatusName',
        label: '详细状态描述',
      },
    ];
  }

  // 默认返回公共字段
  return commonFields;
}
