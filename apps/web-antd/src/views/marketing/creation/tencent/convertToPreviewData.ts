import type {
  TencentCampaign,
  TencentCreationData
} from "#/views/marketing/creation/tencent/tencent";
import type { AccountInfo } from "#/views/marketing/creation/creation";
import type { AccountTabData } from "#/views/marketing/creation/components/preview_area/previewAreaData";
import {
  getMarketingGoalLabel,
  getMarketingSubGoalLabel,
  getOptimizationGoalLabel,
  getConfiguredStatusLabel,
  getCreativeDeliveryModeLabel,
  getDynamicCreativeTypeLabel,
} from "./tencent_enums";


/**
 * 将 getPreviewTableData 生成的数据转换为 PreviewArea 需要的格式
 */
export function convertToPreviewData(adList: TencentCreationData[], accountInfo: AccountInfo[]): AccountTabData[] {
  return adList.map(item => {
    // 找到账户名称
    const account = accountInfo.find(a => a.localAdvertiserId === item.advertiserId);

    // 扁平化两层嵌套数据（campaign 和 adgroup）
    const flattenedRows = flattenData(item.campaignList);

    return {
      advertiserId: item.advertiserId,
      advertiserName: account?.advertiserName || "",
      campaignCount: item.getCampaignCount(),
      adgroupCount: item.getAdGroupCount(),
      promotionCount: 0, // 腾讯没有广告层级
      flattenedRows: flattenedRows
    };
  });
}

/**
 * 将两层嵌套数据扁平化
 * 腾讯只有两个层级：campaign（计划）和 adgroup（广告组）
 */
function flattenData(campaignList: TencentCampaign[]): any[] {
  const rows: any[] = [];

  campaignList.forEach((campaign, cIdx) => {
    campaign.adGroupList.forEach((adgroup, gIdx) => {
      rows.push({
        // 合并标识ID
        rowCampaignId: `c_${cIdx}`,
        rowGroupId: `c_${cIdx}_g_${gIdx}`,

        // 计划层级字段
        campaignName: campaign.adgroup_name,
        marketingGoal: getMarketingGoalLabel(campaign.marketing_goal),
        marketingSubGoal: getMarketingSubGoalLabel(campaign.marketing_sub_goal),
        beginDate: campaign.begin_date,
        endDate: campaign.end_date,
        dailyBudget: campaign.daily_budget,
        bidAmount: campaign.bid_amount,
        optimizationGoal: getOptimizationGoalLabel(campaign.optimization_goal),
        configuredStatus: getConfiguredStatusLabel(campaign.configured_status),

        // 广告组层级字段
        adgroupName: adgroup.dynamic_creative_name,
        creativeTemplateId: adgroup.creative_template_id,
        deliveryMode: getCreativeDeliveryModeLabel(adgroup.delivery_mode),
        dynamicCreativeType: getDynamicCreativeTypeLabel(adgroup.dynamic_creative_type),
        impressionTrackingUrl: adgroup.impression_tracking_url,
        clickTrackingUrl: adgroup.click_tracking_url,

        // 创意组件详细信息（平铺展示）
        imageInfo: formatCreativeComponents(adgroup.creative_components, 'image'),
        videoInfo: formatCreativeComponents(adgroup.creative_components, 'video'),
        titleInfo: formatCreativeComponents(adgroup.creative_components, 'title')
      });
    });
  });

  return rows;
}

/**
 * 格式化创意组件信息为平铺文本
 * @param creativeComponents 创意组件数组
 * @param type 类型：image、video、title
 */
function formatCreativeComponents(
  creativeComponents: any[] | undefined,
  type: 'image' | 'video' | 'title'
): string {
  if (!creativeComponents || creativeComponents.length === 0) {
    return '';
  }

  const lines: string[] = [];

  creativeComponents.forEach((component, index) => {
    const items = component[type] || [];

    if (type === 'title') {
      // 标题：提取文本内容
      items.forEach((item: any) => {
        const text = item.value?.get?.('content') || '';
        if (text) {
          lines.push(text);
        }
      });
    } else {
      // 图片或视频：显示个数
      if (items.length > 0) {
        const typeName = type === 'image' ? '图片' : '视频';
        lines.push(`创意组${index + 1}：${typeName} ${items.length}个`);
      }
    }
  });

  return lines.join('\n');
}
