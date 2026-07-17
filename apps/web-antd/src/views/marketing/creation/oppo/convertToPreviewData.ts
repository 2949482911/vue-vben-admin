import type {
  OppoCampaign,
  OppoCreation,
  OppoCreative,
  OppoTableData
} from "./Oppo.types";
import type {
  AccountInfo,
  Material,
  MonitoringLinkType,
} from "#/views/marketing/creation/creation";
import {
  getAudience,
  getLandingPage,
  getMaterial,
  getRuleInfoAdCount,
  getRuleInfoAdCountGroup,
  getRuleInfoCampaignCount,
  getTiltePackage,
  getDeepLink,
} from "#/views/marketing/creation/creation";
import { DistributionMode, Platform } from "#/constants/enums";
import type { TargetedPackageTypeItem, TitlePackageItem } from "#/api/models";
import { renderProjectTitle } from "#/utils/customName";
import type { AccountTabData } from "#/views/marketing/creation/components/preview_area/previewAreaData";

/**
 * 获取预览表格数据（OPPO）
 * 按照规则配置生成 OppoTableData[]
 */
export function getPreviewTableData(creationInfo: OppoCreation): OppoTableData[] {
  const adList: OppoTableData[] = [];

  creationInfo.accountInfo.forEach((account) => {
    const advertiserId = account.localAdvertiserId;

    const tableData: OppoTableData = {
      advertiserId,
      campaignList: [],
      getCampaignCount(): number {
        return this.campaignList.length;
      },
      getAdGroupCount(): number {
        let count = 0;
        this.campaignList.forEach((campaign) => {
          count += campaign.adgroupList.length;
        });
        return count;
      },
      getAdCount(): number {
        let count = 0;
        this.campaignList.forEach((campaign) => {
          campaign.adgroupList.forEach((adgroup) => {
            count += adgroup.promotionList.length;
          });
        });
        return count;
      },
    };

    // 获取各层级数量
    const campaignCount = getRuleInfoCampaignCount(
      Platform.OPPO,
      creationInfo,
      [advertiserId],
    );

    const adGroupCount = getRuleInfoAdCountGroup(
      Platform.OPPO,
      creationInfo,
      [advertiserId],
    );

    const adCount = getRuleInfoAdCount(
      Platform.OPPO,
      creationInfo,
      [advertiserId],
    );

    const creativeCount = creationInfo.ruleInfo.creativeCount || 1;

    // 遍历生成计划
    for (let campaignIdx = 0; campaignIdx < campaignCount; campaignIdx++) {
      const adgroupList: OppoCampaign["adgroupList"] = [];

      // 遍历生成广告组
      for (let adGroupIdx = 0; adGroupIdx < adGroupCount; adGroupIdx++) {
        // 获取定向包
        const audience: TargetedPackageTypeItem = getAudience(
          creationInfo.configData.audience.config.method,
          creationInfo.configData.audience.data,
          advertiserId,
          adGroupIdx,
        );

        const adgroupData = creationInfo.configData.adgroup;

        const adgroup: OppoCampaign["adgroupList"][number] = {
          getName(): string {
            return this.name;
          },
          adgroupId: "",
          audienceInfo: {
            targetedId: audience.mediaId || audience.id || "",
            targetedName: audience.name || "",
            targetedPackageTypeId: audience.id || "",
          },
          appPackageName: creationInfo.project.packageName,
          rpkDeepLink: adgroupData.deepUrl,
          webSiteUrl: adgroupData.pageUrl,
          h5Code: "",
          h5Type: null,
          productUrlType: adgroupData.extensionFlow,
          appletOriginId: adgroupData.appletId,
          appletPath: adgroupData.appletPath,
          industry1: "",
          industry2: "",
          advertiseQualificationId: "",
          wechatFollow: 0,
          startDate: adgroupData.beginTime,
          endDate: adgroupData.endTime,
          scheduleTime: adgroupData.timeSet,
          chargeType: adgroupData.billingType,
          cvType: String(adgroupData.ocpcType),
          price: Number(adgroupData.price) || 0,
          ocpxPrice: Number(adgroupData.ocpcPrice) || 0,
          name: renderProjectTitle(
            adgroupData.adGroupName,
            adGroupIdx,
            creationInfo.project.projectName,
          ),
          dailyBudget: creationInfo.configData.campaign.dayBudget,
          spentType: null,
          retrieveType: 0,
          ruleAudience: audience.name || "",
          channelId: adgroupData.channelPkgId,
          apkId: "",
          secondCvType: adgroupData.deepOcpcType,
          secondOcpxPrice: Number(adgroupData.deepOcpcPrice) || 0,
          conversionFilterCycle: 0,
          biddingStrategy: creationInfo.configData.campaign.deliveryMode,
          subpackageId: 0,
          builtInRpkDeepLink: adgroupData.deepUrl,
          promotionList: [],
        };

        // 遍历生成广告
        for (let adIdx = 0; adIdx < adCount; adIdx++) {
          // 获取素材
          const materialList: Material[] = getMaterial(
            creationInfo.configData.material.config.method,
            creationInfo.configData.material.data,
            advertiserId,
          );

          // 获取标题包
          const titlePackage: TitlePackageItem = getTiltePackage(
            creationInfo.configData.titlePackage.config.method,
            creationInfo.configData.titlePackage.data,
            advertiserId,
            adIdx,
          );

          // 获取落地页
          const landingPageItem = getLandingPage(
            creationInfo.configData.landingPage.config.method,
            creationInfo.configData.landingPage.data,
            advertiserId,
          );

          // 获取监测链接
          const monitoringLink = getMonitoringLink(
            creationInfo.configData.monitoringLink.config.method,
            creationInfo.configData.monitoringLink.data,
            advertiserId,
            adIdx,
          );

          // 获取 deepLink
          const deepLink = getDeepLink(
            creationInfo.configData.deepLinkList.deepLinkConfig.method,
            creationInfo.configData.deepLinkList.data,
            advertiserId,
          );

          const promotionData = creationInfo.configData.promotion;

          const promotion: OppoCampaign["adgroupList"][number]["promotionList"][number] = {
            getName(): string {
              return this.name;
            },
            adgroupId: "",
            name: renderProjectTitle(
              promotionData.adName,
              adIdx,
              creationInfo.project.projectName,
            ),
            deepLink,
            videoAttribution: 0,
            pageUrl: landingPageItem?.id || "",
            pageUrlName: landingPageItem?.name || "",
            h5Code: "",
            h5Type: 0,
            generalSwitch: 0,
            creativeList: [],
            viewMonitorUrl: monitoringLink.exposureLink || promotionData.exposeUrl,
            clickMonitorUrl: monitoringLink.clickLink || promotionData.clickUrl,
          };

          // 遍历生成创意
          for (let creativeIdx = 0; creativeIdx < creativeCount; creativeIdx++) {
            // 获取创意素材ID列表
            const materialIds = getMaterialIds(materialList, creativeIdx);

            const creative: OppoCreative = {
              placeType: promotionData.config.placeType,
              materialNormId: promotionData.config.materialNormId,
              virtualPositionId: promotionData.config.virtualPositionId,
              title: titlePackage.title || "",
              subTitle: "",
              pushSubTitle: "",
              imgsCode: "",
              videoCode: "",
              appName: creationInfo.project.projectName,
              strongReminder: promotionData.config.strongReminder,
              materialIdsList: materialIds,
            };

            promotion.creativeList.push(creative);
          }

          adgroup.promotionList.push(promotion);
        }

        adgroupList.push(adgroup);
      }

      const campaign: OppoCampaign = {
        getName(): string {
          return this.name;
        },
        campaignId: "",
        name: renderProjectTitle(
          creationInfo.configData.campaign.planName,
          campaignIdx,
          creationInfo.project.projectName,
        ),
        adType: creationInfo.configData.campaign.extensionType,
        mediaType: creationInfo.configData.campaign.extensionType,
        dailyBudget: creationInfo.configData.campaign.dayBudget,
        adgroupList,
      };

      tableData.campaignList.push(campaign);
    }

    adList.push(tableData);
  });

  return adList;
}

/**
 * 将 getPreviewTableData 生成的数据转换为 PreviewArea 需要的格式
 */
export function convertToPreviewData(
  adList: OppoTableData[],
  accountInfo: AccountInfo[],
): AccountTabData[] {
  return adList.map((item) => {
    const account = accountInfo.find(
      (a) => a.localAdvertiserId === item.advertiserId,
    );

    const flattenedRows = flattenData(item.campaignList);

    return {
      advertiserId: item.advertiserId,
      advertiserName: account?.advertiserName || "",
      campaignCount: item.getCampaignCount(),
      adgroupCount: item.getAdGroupCount(),
      promotionCount: item.getAdCount(),
      flattenedRows,
    };
  });
}

/**
 * 将四层嵌套数据扁平化（计划 → 广告组 → 广告 → 创意）
 */
function flattenData(campaignList: OppoCampaign[]): any[] {
  const rows: any[] = [];

  campaignList.forEach((campaign, cIdx) => {
    campaign.adgroupList.forEach((adgroup, gIdx) => {
      adgroup.promotionList.forEach((promotion, pIdx) => {
        promotion.creativeList.forEach((creative, _crIdx) => {
          rows.push({
            // 合并标识ID
            rowCampaignId: `c_${cIdx}`,
            rowGroupId: `c_${cIdx}_g_${gIdx}`,
            rowPromoId: `c_${cIdx}_g_${gIdx}_p_${pIdx}`,

            // 计划层级字段
            campaignName: campaign.name,
            campaignAdType: campaign.adType,
            campaignMediaType: campaign.mediaType,
            campaignBudget: campaign.dailyBudget,

            // 广告组层级字段
            adgroupName: adgroup.name,
            groupPrice: adgroup.price,
            groupOcpxPrice: adgroup.ocpxPrice,
            groupStartDate: adgroup.startDate,
            groupEndDate: adgroup.endDate,

            // 广告层级字段
            promotionName: promotion.name,
            pageUrl: promotion.pageUrl,
            pageUrlName: promotion.pageUrlName,
            deepLink: promotion.deepLink,
            viewMonitorUrl: promotion.viewMonitorUrl,
            clickMonitorUrl: promotion.clickMonitorUrl,

            // 创意层级字段
            creativeTitle: creative.title,
            creativeAppName: creative.appName,
            displayMaterialIds: Array.isArray(creative.materialIdsList)
              ? creative.materialIdsList.join(', ')
              : '',
          });
        });
      });
    });
  });

  return rows;
}

/**
 * 获取监测链接
 */
function getMonitoringLink(
  method: string,
  data: Map<string, MonitoringLinkType[]>,
  advertiserId: string,
  index: number,
): MonitoringLinkType {
  let dataList: MonitoringLinkType[] = [];
  if (method === DistributionMode.all) {
    dataList = data.get("0") || [];
  } else {
    dataList = data.get(advertiserId) || [];
  }
  return (
    dataList[index % dataList.length] || {
      clickLink: "",
      exposureLink: "",
      monitorLink: "",
      linkModeType: "",
      allocateType: "",
      ocpxTaskId: "",
    }
  );
}

/**
 * 获取素材ID列表
 */
function getMaterialIds(
  materialList: Material[],
  index: number,
): string[] {
  if (!materialList || materialList.length === 0) {
    return [];
  }

  const material = materialList[index % materialList.length];
  if (!material) {
    return [];
  }

  return [...(material.image || []), ...(material.video || [])].map(
    (item) => item.localMaterialId,
  );
}
