import type {
  VivoCampaign,
  VivoAdgroup,
  VivoPromotion
} from '#/views/marketing/creation/vivo/vivo';
import type { AccountInfo } from '#/views/marketing/creation/creation';
import type { AccountTabData } from '#/views/marketing/creation/components/preview_area/previewAreaData';
import { getMediaLabel, getAdTypeLabel } from './projectEnum';

/**
 * 将vivo的原始预览数据转换为PreviewArea组件需要的格式
 */
export function convertToPreviewData(
  tableData: any[],
  accountInfo: AccountInfo[]
): AccountTabData[] {
  return tableData.map(item => {
    // 找到账户名称
    const account = accountInfo.find(a => a.localAdvertiserId === item.advertiserId);

    // 扁平化三层嵌套数据（campaign, adgroup, promotion）
    const flattenedRows = flattenVivoData(item.campaignList);

    return {
      advertiserId: item.advertiserId,
      advertiserName: account?.advertiserName || '',
      campaignCount: item.getCampaignCount(),
      adgroupCount: item.getAdGroupCount(),
      promotionCount: item.getAdCount(),
      flattenedRows: flattenedRows
    };
  });
}

/**
 * 将三层嵌套数据扁平化
 * vivo有三个层级：campaign（计划）-> adgroup（广告组）-> promotion（广告）
 */
function flattenVivoData(campaignList: VivoCampaign[]): any[] {
  const rows: any[] = [];
  let globalIndex = 0;

  campaignList.forEach((campaign, cIdx) => {
    campaign.adgroupList.forEach((adgroup: VivoAdgroup, gIdx: number) => {
      adgroup.promotionList.forEach((promo: VivoPromotion, pIdx: number) => {
        // 汇总创意信息
        const creatives = promo.creativeList || [];
        const count = creatives.length;

        rows.push({
          // 合并标识ID
          rowCampaignId: `c_${cIdx}`,
          rowGroupId: `c_${cIdx}_g_${gIdx}`,
          rowPromoId: `c_${cIdx}_g_${gIdx}_p_${pIdx}`,
          submitIndex: globalIndex,
          campaignIdx: cIdx,
          adGroupIdx: gIdx,
          pIdx: pIdx,

          // 计划层级字段
          campaignName: campaign.name,
          campaignBudget: campaign.dailyBudget != -1 ? campaign.dailyBudget / 100000 : -1,
          campaignMediaType: getMediaLabel(campaign.mediaType),
          campaignAdType: getAdTypeLabel(campaign.adType),

          // 广告组层级字段
          groupName: adgroup.name,
          groupOcpxPrice: adgroup.ocpxPrice ? adgroup.ocpxPrice / 100000 : '-',
          groupDailyBudget: adgroup.dailyBudget != -1 ? adgroup.dailyBudget / 100000 : -1,

          // 广告层级字段
          promoName: promo.name,
          deepLink: promo.deepLink || '-',
          exposureLink: promo.viewMonitorUrl || '-',
          clickLink: promo.clickMonitorUrl || '-',
          pageUrlName: promo.pageUrlName || '-',

          // 创意汇总信息
          displayCreativeTitle: count > 0 ? `${creatives[0]?.title}（${count}个素材）` : '-',
          displayCreativeSubTitle: count > 0 ? `${creatives[0]?.subTitle}（${count}个素材）` : '-',
          displayCreativePushTitle: count > 0 ? `${creatives[0]?.pushSubTitle}（${count}个素材）` : '-',
          creativeCount: count,

          // 提交状态
          campaignState: promo?.state || '待提交',
          errorMsg: promo?.msg || '-'
        });

        globalIndex++;
      });
    });
  });

  return rows;
}