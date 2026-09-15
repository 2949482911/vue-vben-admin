import type { AccountTabData } from '#/views/marketing/creation/components/preview_area/previewAreaData';
import type { AccountInfo } from '#/views/marketing/creation/creation';
import type {
  VivoV2Ad,
  VivoV2Plan,
  VivoV2TableData,
} from '#/views/marketing/creation/vivo_v2/vivo_v2';

import {
  VIVO_V2_AD_H5_TYPE_OPTIONS,
  VIVO_V2_AD_TYPE_OPTIONS,
  VIVO_V2_CHARGE_TYPE_OPTIONS,
  VIVO_V2_SPENT_TYPE_OPTIONS,
} from '#/views/marketing/creation/vivo_v2/enums';
import { VIVO_V2_MONEY_RATE } from '#/views/marketing/creation/vivo_v2/vivo_v2';

/** 下拉选项（码值 -> 文案） */
type ValueOption = { label: string; value: number };

/**
 * 把码值按选项列表转换成中文文案，未匹配到返回 '-'
 */
function getOptionLabel(options: ValueOption[], value: null | number | undefined): string {
  if (value === null || value === undefined) {
    return '-';
  }
  return options.find((item) => item.value === value)?.label || '-';
}

/**
 * 金额（毫分）转「元」展示，-1 表示不限
 */
function formatMoney(amount: number): number {
  return amount === -1 ? -1 : amount / VIVO_V2_MONEY_RATE;
}

/**
 * 将 vivo2.0 的原始预览数据转换为 PreviewArea 组件需要的格式
 */
export function convertToPreviewData(
  tableData: VivoV2TableData[],
  accountInfo: AccountInfo[],
): AccountTabData[] {
  return tableData.map((item) => {
    // 找到账户名称
    const account = accountInfo.find((a) => a.localAdvertiserId === item.advertiserId);

    return {
      advertiserId: item.advertiserId,
      advertiserName: account?.advertiserName || '',
      campaignCount: item.getCampaignCount(),
      // vivo2.0 无广告组层级，数量固定为 0，预览区通过 levelNames 隐藏该层级统计
      adgroupCount: 0,
      promotionCount: item.getAdCount(),
      flattenedRows: flattenVivoV2Data(item.campaignList),
    };
  });
}

/**
 * 将两层嵌套数据扁平化
 * vivo2.0 只有两个层级：campaign（计划）-> ad（广告）
 */
function flattenVivoV2Data(campaignList: VivoV2Plan[]): any[] {
  const rows: any[] = [];
  let globalIndex = 0;

  campaignList.forEach((campaign, cIdx) => {
    campaign.adList.forEach((promo: VivoV2Ad, pIdx: number) => {
      const imageCount = promo.imgsCodeList?.length || 0;
      const videoCount = promo.videoList?.length || 0;

      rows.push({
        // 合并标识ID：无广告组层级，广告组ID与广告行一一对应
        rowCampaignId: `c_${cIdx}`,
        rowGroupId: `c_${cIdx}_p_${pIdx}`,
        rowPromoId: `c_${cIdx}_p_${pIdx}`,
        submitIndex: globalIndex,
        campaignIdx: cIdx,
        pIdx,

        // 计划层级字段
        campaignName: campaign.name,
        campaignAdType: getOptionLabel(VIVO_V2_AD_TYPE_OPTIONS, campaign.adType),
        campaignChargeType: getOptionLabel(VIVO_V2_CHARGE_TYPE_OPTIONS, campaign.chargeType),
        // 计划金额在预览数据中已按毫分存储，此处换算回「元」展示
        campaignPrice: formatMoney(campaign.price),
        campaignBudget: formatMoney(campaign.dailyBudget),
        campaignSpentType: getOptionLabel(VIVO_V2_SPENT_TYPE_OPTIONS, campaign.spentType),
        campaignDateRange:
          campaign.startDate && campaign.endDate
            ? `${campaign.startDate} ~ ${campaign.endDate}`
            : '-',
        campaignScheduleTime: campaign.scheduleTime || '-',

        // 广告层级字段
        promoName: promo.name,
        promotionContent: promo.promotionContent || '-',
        deepLink: promo.deepLink || '-',
        pageUrlName: promo.pageUrl || '-',
        h5TypeName: getOptionLabel(VIVO_V2_AD_H5_TYPE_OPTIONS, promo.h5Type),
        // 预览数据未带 avatarCode 字段，缺失时以 '-' 占位
        avatarCode: (promo as any).avatarCode || '-',
        imageCount,
        videoCount,
        adTitle: promo.title || '-',

        // 提交状态
        campaignState: (promo as any)?.state || '待提交',
        errorMsg: (promo as any)?.msg || '-',
      });

      globalIndex++;
    });
  });

  return rows;
}
