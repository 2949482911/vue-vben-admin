import type { VbenFormSchema } from '@vben/common-ui';
import { COMPREHENSIVESEARCH_SELECT } from '../../vivo/projectEnum';

/**
 * 根据平台动态生成表单 Schema
 * @param platform 平台类型：'vivo' | 'oppo'
 */
export function getAdFormSchema(platform: string): VbenFormSchema[] {
  // 1. 公共字段（vivo 和 oppo 都有的字段）
  const commonFields: VbenFormSchema[] = [
    {
      component: 'Input',
      componentProps: { allowClear: true, placeholder: '请输入' },
      fieldName: 'promotionName',
      label: '广告名称',
    },
  ];

  // 2. VIVO 独有或特有的字段
  if (platform === 'vivo') {
    return [
      ...commonFields,
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'clickMonitorUrl',
        label: '点击监控地址',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'deepLink',
        label: 'deepLink链接',
      },
      {
        component: 'Select',
        componentProps: {
          allowClear: true,
          placeholder: '请选择',
          options: [
            {
              label: '关闭',
              value: 0,
            },
            {
              label: '开关',
              value: 1,
            },
          ],
        },
        fieldName: 'generalSwitch',
        label: '流量优选开关',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'h5Code',
        label: '详情页id编码',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'h5Type',
        label: '详情页类型',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'pageUrl',
        label: '详情页地址',
      },
      {
        component: 'Select',
        componentProps: {
          allowClear: true,
          placeholder: '请选择',
          options: COMPREHENSIVESEARCH_SELECT,
        },
        fieldName: 'placeType',
        label: '展现形式',
      },
      {
        component: 'Select',
        componentProps: {
          allowClear: true,
          placeholder: '请选择',
          options: [
            {
              label: '关闭',
              value: 0,
            },
            {
              label: '3秒播放归因',
              value: 3,
            },
          ],
        },
        fieldName: 'videoAttribution',
        label: '视频类型拓展归因',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'viewMonitorUrl',
        label: '曝光监控地址',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'virtualPositionId',
        label: '虚拟广告位id',
      },
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
        fieldName: 'cateName',
        label: '行业一级分类',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'creativeTypeName',
        label: '创意类型',
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
        fieldName: 'deepOcpcPrice',
        label: '深度转化出价',
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
        fieldName: 'deepOcpcTypeName',
        label: '深度转化类型名称',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'defaultSecondStage',
        label: '是否免一阶',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'deleted',
        label: '广告详细状态',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'dynamicPrice',
        label: '动态出价',
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
        fieldName: 'showStatusName',
        label: '简化的状态中文解释',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'status',
        label: '广告状态(按位或)',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'status2',
        label: '广告启停状态',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'subCateName',
        label: '行业二级分类',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'subShowStatusName',
        label: '广告详细状态中文解释',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'targetROI',
        label: '目标ROI系数',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'thirdCateName',
        label: '行业三级分类',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'vrType',
        label: '创意类型',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入',
        },
        fieldName: 'vrTypeName',
        label: '创意类型名称',
      },
    ];
  }

  // 默认返回公共字段
  return commonFields;
}
