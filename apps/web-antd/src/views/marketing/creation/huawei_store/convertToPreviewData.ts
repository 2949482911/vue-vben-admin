import type {
  HuaWeiStoreCreationData,
  HuaWeiStoreTask
} from "#/views/marketing/creation/huawei_store/huawei_store";
import type { AccountInfo } from "#/views/marketing/creation/creation";
import type { AccountTabData } from "#/views/marketing/creation/components/preview_area/previewAreaData";


/**
 * 将 getPreviewTableData 生成的数据转换为 PreviewArea 需要的格式
 */
export function convertToPreviewData(adList: HuaWeiStoreCreationData[], accountInfo: AccountInfo[]): AccountTabData[] {
  return adList.map(item => {
    // 找到账户名称
    const account = accountInfo.find(a => a.localAdvertiserId === item.advertiserId);

    // 扁平化三层嵌套数据
    const flattenedRows = flattenData(item.campaignList);

    return {
      advertiserId: item.advertiserId,
      advertiserName: account?.advertiserName || "",
      campaignCount: item.getCampaignCount(),
      adgroupCount: item.getAdGroupCount(),
      promotionCount: item.getAdCount(),
      flattenedRows: flattenedRows
    };
  });
}

/**
 * 将三层嵌套数据扁平化
 */
function flattenData(campaignList: HuaWeiStoreTask[]): any[] {
  const rows: any[] = [];

  campaignList.forEach((campaign, cIdx) => {
    campaign.adGroupList.forEach((adgroup, gIdx) => {
      adgroup.promotionList.forEach((promotion, _) => {
        rows.push({
          // 合并标识ID
          rowCampaignId: `c_${cIdx}`,
          rowGroupId: `c_${cIdx}_g_${gIdx}`,

          // 任务层级字段
          taskName: campaign.taskName,
          budget: campaign.budget,
          startDate: campaign.startDate,
          endDate: campaign.endDate,

          // 子任务层级字段
          subTaskName: adgroup.subTaskName,
          subTaskPrice: adgroup.subTaskPrice,

          // 广告层级字段
          contentTitle: promotion.contentTitle,
          slogan: promotion.slogan,
          deepLinkUrl: promotion.deepLinkUrl,
          clickMonitorUrl: promotion.clickMonitorUrl,
          viewMonitorUrl: promotion.viewMonitorUrl
        });
      });
    });
  });

  return rows;
}
