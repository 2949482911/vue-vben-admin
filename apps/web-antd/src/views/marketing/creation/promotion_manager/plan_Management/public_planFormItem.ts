import type { VbenFormSchema } from '@vben/common-ui';
import {
  ADTYPE_SELECT,
  CONVERSION_SELECT,
  DAILYLIMIT_SELECT,
  DELETEFLAG_SELECT,
  ISTRAFFIC_SELECT,
  MEDIA_SELECT,
  PAUSESIGN_SELECT,
  PROJRCT_SELECT,
  PROMOTION_SELECT,
} from '../../vivo/projectEnum';

/**
 * 根据平台动态生成表单 Schema
 * @param platform 平台类型：'vivo' | 'oppo'
 */
export function getPlanFormSchema(platform: string): VbenFormSchema[] {
  // 1. 公共字段（vivo 和 oppo 都有的字段）
  const commonFields: VbenFormSchema[] = [
    {
      component: 'Input',
      componentProps: { allowClear: true, placeholder: '请输入' },
      fieldName: 'campaignName',
      label: '计划名称',
    },
  ];

  // 2. VIVO 独有或特有的字段
  if (platform === 'vivo') {
    return [
      ...commonFields,
      {
        component: 'Select',
        componentProps: {
          allowClear: true,
          placeholder: '请选择',
          options: PROJRCT_SELECT,
        },
        fieldName: 'adType',
        label: '推广目标',
      },
      {
        component: 'Select',
        componentProps: {
          allowClear: true,
          placeholder: '请选择',
          options: ADTYPE_SELECT,
        },
        fieldName: 'campaignType',
        label: '广告类型',
      },
      {
        component: 'Select',
        componentProps: {
          allowClear: true,
          placeholder: '请选择',
          options: [
            {
              label: '代表非活动广告',
              value: 0,
            },
          ],
        },
        fieldName: 'activityId',
        label: '活动ID',
      },
      {
        component: 'Select',
        componentProps: {
          allowClear: true,
          placeholder: '请选择',
          options: CONVERSION_SELECT,
        },
        fieldName: 'conversionMonitorType',
        label: '转化监测',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'dailyBudget',
        label: '计划日限额',
      },
      {
        component: 'Select',
        componentProps: {
          allowClear: true,
          placeholder: '请选择',
          options: DAILYLIMIT_SELECT,
        },
        fieldName: 'dailyBudgetState',
        label: '日限额状态',
      },
      {
        component: 'Select',
        componentProps: {
          allowClear: true,
          placeholder: '请选择',
          options: DELETEFLAG_SELECT,
        },
        fieldName: 'deleted',
        label: '删除标志',
      },
      {
        component: 'Select',
        componentProps: {
          allowClear: true,
          placeholder: '请选择',
          options: MEDIA_SELECT,
        },
        fieldName: 'mediaType',
        label: '媒体类型',
      },
      {
        component: 'Select',
        componentProps: {
          allowClear: true,
          placeholder: '请选择',
          options: ISTRAFFIC_SELECT,
        },
        fieldName: 'optimizeFlag',
        label: '是否使用流量优选',
      },
      {
        component: 'Select',
        componentProps: {
          allowClear: true,
          placeholder: '请选择',
          options: PAUSESIGN_SELECT,
        },
        fieldName: 'pauseState',
        label: '暂停标识',
      },
      {
        component: 'DatePicker',
        componentProps: {
          allowClear: true,
          placeholder: '请选择',
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD',
        },
        fieldName: 'pauseTime',
        label: '暂停操作时间',
      },
      {
        component: 'Select',
        componentProps: {
          allowClear: true,
          placeholder: '请选择',
          options: PROMOTION_SELECT,
        },
        fieldName: 'promotionType',
        label: '推广模式',
      },
    ];
  }

  // 3. OPPO 独有或特有的字段
  if (platform === 'oppo') {
    return [
      ...commonFields,
      {
        component: 'DatePicker',
        componentProps: {
          allowClear: true,
          placeholder: '请选择',
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD',
        },
        fieldName: 'campaignCreateTime',
        label: '计划创建时间',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'budgetLimit',
        label: '预算类型',
      },
      {
        component: 'DatePicker',
        componentProps: {
          allowClear: true,
          placeholder: '请选择',
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD',
        },
        fieldName: 'campaign_update_time',
        label: '计划更新时间',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'deleted',
        label: '投放开关',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'deliveryMode',
        label: '竞价策略',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'deliveryModeName',
        label: '竞价策略名称',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'pacingStatus',
        label: '匀速投放类型',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'showStatus',
        label: '前端展示状态',
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
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'status',
        label: '详细状态',
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
