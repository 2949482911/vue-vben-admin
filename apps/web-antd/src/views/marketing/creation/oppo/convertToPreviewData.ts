import type {
  OppoAdgroup,
  OppoCampaign,
  OppoCreation,
  OppoCreationData,
  OppoPromotion
} from "./Oppo.types";
import type {
  AccountInfo,
  Material,
  MonitoringLinkType
} from "#/views/marketing/creation/creation";
import {
  getAudience,
  getDeepLink,
  getLandingPage,
  getMaterial,
  getRuleInfoAdCount,
  getRuleInfoAdCountGroup,
  getRuleInfoCampaignCount,
  getTiltePackage
} from "#/views/marketing/creation/creation";
import { DistributionMode, Platform } from "#/constants/enums";
import type { TargetedPackageTypeItem, TitlePackageItem } from "#/api/models";
import { renderProjectTitle } from "#/utils/customName";
import type {
  AccountTabData
} from "#/views/marketing/creation/components/preview_area/previewAreaData";
import { getDeliveryModeLabel, getExtensionLabel } from "./projectEnum";
import type { PageViewItem } from "#/api/models/assert";

/**
 * 获取预览表格数据（OPPO）
 * 按照规则配置生成 OppoCreationData[]
 */
export function getPreviewTableData(creationInfo: OppoCreation): OppoCreationData[] {
  const adList: OppoCreationData[] = [];

  creationInfo.accountInfo.forEach((account) => {
    const advertiserId = account.localAdvertiserId;

    const tableData: OppoCreationData = {
      advertiserId,
      campaignList: [],
      getCampaignCount(): number {
        return this.campaignList.length;
      },
      getAdGroupCount(): number {
        let count = 0;
        this.campaignList.forEach((campaign) => {
          count += campaign.adGroupList.length;
        });
        return count;
      },
      getAdCount(): number {
        let count = 0;
        this.campaignList.forEach((campaign) => {
          campaign.adGroupList.forEach((adgroup) => {
            count += adgroup.promotionList.length;
          });
        });
        return count;
      }
    };

    // 获取各层级数量
    const campaignCount = getRuleInfoCampaignCount(
      Platform.OPPO,
      creationInfo,
      [advertiserId]
    );

    const adGroupCount = getRuleInfoAdCountGroup(
      Platform.OPPO,
      creationInfo,
      [advertiserId]
    );

    const adCount = getRuleInfoAdCount(
      Platform.OPPO,
      creationInfo,
      [advertiserId]
    );

    // 遍历生成计划
    for (let campaignIdx = 0; campaignIdx < campaignCount; campaignIdx++) {
      const adGroupList: OppoAdgroup[] = [];

      // 遍历生成广告组
      for (let adGroupIdx = 0; adGroupIdx < adGroupCount; adGroupIdx++) {
        // 获取定向包
        const audience: TargetedPackageTypeItem = getAudience(
          creationInfo.configData.audience.config.method,
          creationInfo.configData.audience.data,
          advertiserId,
          adGroupIdx
        );

        // 落地页
        const pageView: PageViewItem = getLandingPage(
          creationInfo.configData.landingPage.config.method,
          creationInfo.configData.landingPage.data,
          advertiserId,
        );

        const adgroupData = creationInfo.configData.adgroup;

        const adgroup: OppoAdgroup = {
          getName(): string {
            return this.adGroupName;
          },
          // OPPO 广告组字段
          planId: "",
          adGroupName: renderProjectTitle(
            adgroupData.adGroupName,
            adGroupIdx,
            creationInfo.project.projectName
          ),
          pageUrl: pageView.config["pageUrl"],
          extensionType: creationInfo.configData.campaign.extensionType,
          extensionFlow: adgroupData.extensionFlow,
          flowScene: adgroupData.flowScene,
          dayLimit: adgroupData.dayLimit,
          beginTime: adgroupData.beginTime,
          endTime: adgroupData.endTime,
          billingType: adgroupData.billingType,
          adSearchPremiumKwSaveDTOList: adgroupData.adSearchPremiumKwSaveDTOList || [],
          appId: creationInfo.project.appId,
          autoOpenFlag: adgroupData.autoOpenFlag,
          deepOcpcPrice: adgroupData.deepOcpcPrice,
          deepOcpcType: adgroupData.deepOcpcType,
          deepUrl: adgroupData.deepUrl,
          instantAppId: adgroupData.instantAppId,
          instantAppUrl: adgroupData.instantAppUrl,
          ocpcOptmType: adgroupData.ocpcOptmType,
          ocpcPrice: adgroupData.ocpcPrice,
          ocpcType: adgroupData.ocpcType,
          pageId: adgroupData.pageId,
          pageType: adgroupData.pageType,
          price: Number(adgroupData.price) * 100 || 0,
          smartExpandType: adgroupData.smartExpandType,
          // 媒体定向的ID
          targetId: audience.mediaId,
          timeLimit: adgroupData.timeLimit,
          timeSet: adgroupData.timeSet,
          linkDeskFlag: adgroupData.linkDeskFlag,
          appletType: adgroupData.appletType,
          kwOcpcPrice: adgroupData.kwOcpcPrice,
          kwDeepOcpcPrice: adgroupData.kwDeepOcpcPrice,
          kwTargetROI: adgroupData.kwTargetROI,
          channelPkgId: adgroupData.channelPkgId,
          defaultSecondStage: adgroupData.defaultSecondStage,
          targetROI: adgroupData.targetROI,
          adsDpaProductDTO: adgroupData.adsDpaProductDTO,
          advertiseType: adgroupData.advertiseType,
          pushAppPageType: adgroupData.pushAppPageType,
          ocpxOptimizeSwitch: adgroupData.ocpxOptimizeSwitch,
          ocpxOptimizeType: adgroupData.ocpxOptimizeType,
          extJson: adgroupData.extJson,
          appletId: adgroupData.appletId,
          appletPath: adgroupData.appletPath,
          marketingObjectiveDTO: adgroupData.marketingObjectiveDTO,
          promotionList: []
        };

        // 遍历生成广告
        for (let adIdx = 0; adIdx < adCount; adIdx++) {
          // 获取素材
          const materialList: Material[] = getMaterial(
            creationInfo.configData.material.config.method,
            creationInfo.configData.material.data,
            advertiserId
          );

          // 获取标题包
          const titlePackage: TitlePackageItem = getTiltePackage(
            creationInfo.configData.titlePackage.config.method,
            creationInfo.configData.titlePackage.data,
            advertiserId,
            adIdx
          );

          // 获取落地页
          const landingPageItem = getLandingPage(
            creationInfo.configData.landingPage.config.method,
            creationInfo.configData.landingPage.data,
            advertiserId
          );

          // 获取监测链接
          const monitoringLink = getMonitoringLink(
            creationInfo.configData.monitoringLink.config.method,
            creationInfo.configData.monitoringLink.data,
            advertiserId,
            adIdx
          );

          // 获取 deepLink
          const deepLink = getDeepLink(
            creationInfo.configData.deepLinkList.deepLinkConfig.method,
            creationInfo.configData.deepLinkList.data,
            advertiserId
          );

          //

          const promotionData = creationInfo.configData.promotion;


          // 素材ID
          const materialIdsList: Array<string> = [];
          materialList.forEach(x => {
            if (x.image) {
              materialIdsList.push(...x.image.map(img => img.localMaterialId));
            }
            if (x.video) {
              materialIdsList.push(...x.video.map(img => img.localMaterialId));
            }
          });

          const promotion: OppoPromotion = {
            materialIdsList: materialIdsList,
            getName(): string {
              return this.adName;
            },
            // OPPO 广告字段
            adGroupId: "",
            adName: renderProjectTitle(
              promotionData.adName,
              adIdx,
              creationInfo.project.projectName
            ),
            globalSpecId: promotionData.globalSpecId,
            adSource: promotionData.adSource,
            brandLogoImgId: promotionData.brandLogoImgId,
            brandName: titlePackage.title,
            buttonTxt: titlePackage.title,
            copywriter: titlePackage.title,
            copywriterId: promotionData.copywriterId,
            downloadUrl: promotionData.downloadUrl,
            dynamicCr: promotionData.dynamicCr,
            exposeUrl: monitoringLink.exposureLink,
            videoImgId: promotionData.videoImgId,
            imgMatIds: promotionData.imgMatIds,
            clickUrl: monitoringLink.clickLink,
            pageUrlName: landingPageItem?.name || "",
            deepLink
          };
          // 遍历生成创意
          adgroup.promotionList.push(promotion);
        }

        adGroupList.push(adgroup);
      }

      const campaign: OppoCampaign = {
        getName(): string {
          return "";
        },
        // OPPO 计划字段
        planName: renderProjectTitle(
          creationInfo.configData.campaign.planName,
          campaignIdx,
          creationInfo.project.projectName
        ),
        extensionType: creationInfo.configData.campaign.extensionType,
        dayLimit: creationInfo.configData.campaign.dayLimit,
        dayBudget: creationInfo.configData.campaign.dayBudget,
        deliveryMode: creationInfo.configData.campaign.deliveryMode,
        adGroupList
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
  adList: OppoCreationData[],
  accountInfo: AccountInfo[]
): AccountTabData[] {
  return adList.map((item) => {
    const account = accountInfo.find(
      (a) => a.localAdvertiserId === item.advertiserId
    );

    const flattenedRows = flattenData(item.campaignList);

    return {
      advertiserId: item.advertiserId,
      advertiserName: account?.advertiserName || "",
      campaignCount: item.getCampaignCount(),
      adgroupCount: item.getAdGroupCount(),
      promotionCount: item.getAdCount(),
      flattenedRows
    };
  });
}

/**
 * 将四层嵌套数据扁平化（计划 → 广告组 → 广告 → 创意）
 */
function flattenData(campaignList: OppoCampaign[]): any[] {
  const rows: any[] = [];
  campaignList.forEach((campaign, cIdx) => {
    campaign.adGroupList.forEach((adgroup, gIdx) => {
      adgroup.promotionList.forEach((promotion, pIdx) => {
        rows.push({
          // 合并标识ID
          rowCampaignId: `c_${cIdx}`,
          rowGroupId: `c_${cIdx}_g_${gIdx}`,
          rowPromoId: `c_${cIdx}_g_${gIdx}_p_${pIdx}`,

          // 计划层级字段
          campaignName: campaign.planName,
          campaignAdType: getExtensionLabel(campaign.extensionType),
          dayLimit: campaign.dayLimit,
          campaignBudget: campaign.dayBudget,
          deliveryMode: getDeliveryModeLabel(campaign.deliveryMode),

          // 广告组层级字段
          adgroupName: adgroup.adGroupName,
          groupPrice: adgroup.price,
          groupOcpxPrice: Number(adgroup.ocpcPrice) || 0,
          groupStartDate: adgroup.beginTime,
          groupEndDate: adgroup.endTime,
          // 广告层级字段
          promotionName: promotion.adName,
          pageUrl: adgroup.pageUrl,
          pageUrlName: promotion.pageUrlName || "",
          deepLink: promotion.deepLink || "",
          viewMonitorUrl: promotion.exposeUrl,
          clickMonitorUrl: promotion.clickUrl,
          // 创意层级字段
          displayMaterialInfo: `素材${promotion.materialIdsList.length}个`
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
  index: number
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
      ocpxTaskId: ""
    }
  );
}
