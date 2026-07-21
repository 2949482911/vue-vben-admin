import type {
  BytedanceCampaign,
  BytedanceCreation,
  BytedanceCreationData,
  BytedancePromotion,
  BytedancePromotion_promotion_materials
} from "./bytedance";
import type { AccountInfo, Material } from "#/views/marketing/creation/creation";
import {
  getMaterial,
  getRuleInfoAdCountGroup,
  getRuleInfoCampaignCount,
  getTiltePackage
} from "#/views/marketing/creation/creation";
import { Platform } from "#/constants/enums";
import type { TitlePackageItem } from "#/api/models";
import { renderProjectTitle } from "#/utils/customName";
import type {
  AccountTabData
} from "#/views/marketing/creation/components/preview_area/previewAreaData";
import {
  getBudgetModeCampaignLabel,
  getBudgetModePromotionLabel,
  getCampaignOperationLabel,
  getDeliveryModeLabel,
  getLandingTypeLabel,
  getMarketingGoalLabel,
  getPricingLabel
} from "./enums";

/**
 * 获取预览表格数据（巨量引擎）
 * 按照规则配置生成 BytedanceCreationData[]
 */
export function getPreviewTableData(
  creationInfo: BytedanceCreation
): BytedanceCreationData[] {
  const adList: BytedanceCreationData[] = [];

  creationInfo.accountInfo.forEach((account) => {
    const advertiserId = account.localAdvertiserId;

    const tableData: BytedanceCreationData = {
      advertiserId,
      campaignList: [],
      getCampaignCount(): number {
        return this.campaignList.length;
      },
      // 巨量引擎没有广告组层级，广告数即为 promotion 数量
      getAdGroupCount(): number {
        let count = 0;
        this.campaignList.forEach((campaign) => {
          count += campaign.promotionList.length;
        });
        return count;
      },
      // 素材总数
      getAdCount(): number {
        let count = 0;
        this.campaignList.forEach((campaign) => {
          campaign.promotionList.forEach((promotion) => {
            const materials = promotion.promotion_materials;
            count += (materials.local_video_material_list?.length || 0) +
              (materials.local_image_material_list?.length || 0);
          });
        });
        return count;
      }
    };

    const campaignCount = getRuleInfoCampaignCount(
      Platform.BYTEDANCE,
      creationInfo,
      [advertiserId]
    );

    // 巨量引擎中 adGroupRuleKey 控制广告（promotion）数量
    const promotionCount = getRuleInfoAdCountGroup(
      Platform.BYTEDANCE,
      creationInfo,
      [advertiserId]
    );

    const campaignData = creationInfo.configData.campaign;
    const promotionData = creationInfo.configData.promotion;

    // 遍历生成项目
    for (let campaignIdx = 0; campaignIdx < campaignCount; campaignIdx++) {
      const promotionList: BytedancePromotion[] = [];

      // 遍历生成广告
      for (let pIdx = 0; pIdx < promotionCount; pIdx++) {
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
          pIdx
        );

        const material = materialList[pIdx % materialList.length];
        const videoIds = (material?.video || []).map((v) => v.localMaterialId);
        const imageIds = (material?.image || []).map((i) => i.localMaterialId);

        // 构建 promotion_materials 素材信息
        const promotionMaterials: BytedancePromotion_promotion_materials = {
          local_video_material_list: videoIds,
          local_image_material_list: imageIds,
          video_material_list: (material?.video || []).map((v) => ({
            video_id: v.localMaterialId,
            video_cover_id: "",
            image_mode: "",
            video_template_type: "",
            video_task_ids: [],
            item_id: "",
            video_hp_visibility: "",
            guide_video_id: ""
          })),
          image_material_list: (material?.image || []).map((i) => ({
            image_mode: "",
            images: [{ image_id: i.localMaterialId, template_id: 0, template_data_list: [] }]
          })),
          title_material_list: titlePackage?.title
            ? [{ title: titlePackage.title, word_list: [] }]
            : [],
          params_type: promotionData.promotion_materials?.params_type || "",
          external_url_field: promotionData.promotion_materials?.external_url_field || "",
          external_url_params: promotionData.promotion_materials?.external_url_params || "",
          open_url_type: promotionData.promotion_materials?.open_url_type || "",
          open_url_field: promotionData.promotion_materials?.open_url_field || "",
          open_url_params: promotionData.promotion_materials?.open_url_params || "",
          product_info: {
            product_name_type: promotionData.promotion_materials?.product_info?.product_name_type || "",
            product_image_type: promotionData.promotion_materials?.product_info?.product_image_type || "",
            product_selling_point_type: promotionData.promotion_materials?.product_info?.product_selling_point_type || "",
            product_name_fields: promotionData.promotion_materials?.product_info?.product_name_fields || [],
            product_image_fields: promotionData.promotion_materials?.product_info?.product_image_fields || [],
            product_selling_point_fields: promotionData.promotion_materials?.product_info?.product_selling_point_fields || [],
            titles: promotionData.promotion_materials?.product_info?.titles || [],
            image_ids: promotionData.promotion_materials?.product_info.image_ids || [],
            selling_points: promotionData.promotion_materials?.product_info?.selling_points || []
          },
          original_video_title: "",
          playlet_series_url_list: [],
          decoration_material: { activity_id: "", image_mode: "" },
          anchor_material_list: [],
          component_material_list: [],
          external_url_material_list: [],
          mini_program_info: {
            app_id: "",
            auto: [],
            params: "",
            start_path: "",
            url: "",
            urls: []
          },
          open_url: "",
          open_urls: [],
          ulink: "",
          ulink_type: "",
          web_url_material_list: [],
          blue_flow_material_recommend: "",
          carousel_material_list: [],
          trial_play_material_list: [],
          instant_play_material_list: [],
          dynamic_creative_switch: "",
          advanced_dc_settings: [],
          call_to_action_buttons: [],
          intelligent_generation: "",
          plant_grass_search_word_material: []
        };

        const promotion: BytedancePromotion = {
          getName(): string {
            return this.name;
          },
          project_id: "",
          name: renderProjectTitle(
            promotionData.name,
            pIdx,
            creationInfo.project.projectName
          ),
          operation: promotionData.operation,
          promotion_materials: promotionMaterials,
          materials_type: promotionData.materials_type,
          promotion_related_product: promotionData.promotion_related_product,
          native_setting: promotionData.native_setting,
          source: promotionData.source,
          is_comment_disable: promotionData.is_comment_disable,
          ad_download_status: promotionData.ad_download_status,
          brand_info: promotionData.brand_info,
          budget_mode: promotionData.budget_mode,
          budget: promotionData.budget,
          bid: promotionData.bid,
          cpa_bid: promotionData.cpa_bid,
          deep_cpabid: promotionData.deep_cpabid,
          roi_goal: promotionData.roi_goal,
          first_roi_goal: promotionData.first_roi_goal,
          union_bid_ratio: promotionData.union_bid_ratio,
          shop_multi_roi_goals: promotionData.shop_multi_roi_goals,
          sevend_retention: promotionData.sevend_retention,
          auto_extend_traffic: promotionData.auto_extend_traffic,
          keywords: promotionData.keywords
        };

        promotionList.push(promotion);
      }

      const campaign: BytedanceCampaign = {
        getName(): string {
          return this.name;
        },
        operation: campaignData.operation,
        delivery_mode: campaignData.delivery_mode,
        landing_type: campaignData.landing_type,
        app_promotion_type: campaignData.app_promotion_type,
        marketing_goal: campaignData.marketing_goal,
        ad_type: campaignData.ad_type,
        delivery_type: campaignData.delivery_type,
        name: renderProjectTitle(
          campaignData.name,
          campaignIdx,
          creationInfo.project.projectName
        ),
        budget_group_id: campaignData.budget_group_id,
        aigc_dynamic_creative_switch: campaignData.aigc_dynamic_creative_switch,
        star_task_id: campaignData.star_task_id,
        star_auto_material_addition_switch: campaignData.star_auto_material_addition_switch,
        star_auto_delivery_switch: campaignData.star_auto_delivery_switch,
        keywords: campaignData.keywords,
        auto_extend_traffic: campaignData.auto_extend_traffic,
        related_product: campaignData.related_product,
        download_url: campaignData.download_url,
        app_name: campaignData.app_name,
        download_type: campaignData.download_type,
        download_mode: campaignData.download_mode,
        quick_app_id: campaignData.quick_app_id,
        launch_type: campaignData.launch_type,
        promotion_type: campaignData.promotion_type,
        open_url_type: campaignData.open_url_type,
        open_url_params: campaignData.open_url_params,
        open_url_field: campaignData.open_url_field,
        open_url: campaignData.open_url,
        ulink_url_type: campaignData.ulink_url_type,
        ulink_url: campaignData.ulink_url,
        subscribe_url: campaignData.subscribe_url,
        asset_type: campaignData.asset_type,
        multi_asset_type: campaignData.multi_asset_type,
        micro_promotion_type: campaignData.micro_promotion_type,
        dpa_adtype: campaignData.dpa_adtype,
        micro_app_instance_id: campaignData.micro_app_instance_id,
        native_setting: campaignData.native_setting,
        optimize_goal: campaignData.optimize_goal,
        value_optimized_type: campaignData.value_optimized_type,
        landing_page_stay_time: campaignData.landing_page_stay_time,
        yuntu_5a_brand_id: campaignData.yuntu_5a_brand_id,
        yuntu_5a_brand_main_industry_id: campaignData.yuntu_5a_brand_main_industry_id,
        delivery_range: campaignData.delivery_range,
        audience: campaignData.audience,
        delivery_setting: campaignData.delivery_setting,
        track_url_setting: campaignData.track_url_setting,
        promotionList
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
  adList: BytedanceCreationData[],
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
 * 扁平化（项目 → 广告），巨量引擎为两层嵌套
 */
function flattenData(campaignList: BytedanceCampaign[]): any[] {
  const rows: any[] = [];

  campaignList.forEach((campaign, cIdx) => {
    campaign.promotionList.forEach((promotion, pIdx) => {
      const materials = promotion.promotion_materials;
      const videoCount = materials.local_video_material_list?.length || 0;
      const imageCount = materials.local_image_material_list?.length || 0;
      const titleList = materials.title_material_list || [];
      const titleText = titleList.map((t) => t.title).join("; ");

      rows.push({
        // 合并标识ID
        rowCampaignId: `c_${cIdx}`,
        rowGroupId: `c_${cIdx}_p_${pIdx}`,

        // 项目层级字段
        campaignName: campaign.name,
        marketingGoal: getMarketingGoalLabel(campaign.marketing_goal),
        landingType: getLandingTypeLabel(campaign.landing_type),
        deliveryMode: getDeliveryModeLabel(campaign.delivery_mode),
        campaignBudget: campaign.delivery_setting?.budget,
        campaignBid: campaign.delivery_setting?.bid,
        campaignBudgetMode: getBudgetModeCampaignLabel(campaign.delivery_setting?.budget_mode),
        campaignPricing: getPricingLabel(campaign.delivery_setting?.pricing),
        campaignStatus: getCampaignOperationLabel(campaign.operation),

        // 广告层级字段
        promotionName: promotion.name,
        promotionBudget: promotion.budget,
        promotionBid: promotion.bid,
        promotionBudgetMode: getBudgetModePromotionLabel(promotion.budget_mode),
        promotionStatus: getCampaignOperationLabel(promotion.operation),

        // 素材信息
        displayMaterialInfo: `图片 ${imageCount}个, 视频 ${videoCount}个`,
        titleInfo: titleText
      });
    });
  });
  return rows;
}
