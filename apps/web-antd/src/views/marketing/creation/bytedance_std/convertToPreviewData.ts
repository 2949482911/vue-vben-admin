import type { StdCreation, StdCreationData, StdProject, StdProjectMaterials } from "./bytedance";
import {
  type AccountInfo,
  type AwemeConfigData,
  getAudience,
  getLandingPage,
  getMaterial,
  getMonitoringLink,
  getRuleInfoCampaignCount,
  getTiltePackage,
  type Material
} from "#/views/marketing/creation/creation";
import type {
  AccountTabData
} from "#/views/marketing/creation/components/preview_area/previewAreaData";
import { Platform } from "#/constants/enums";
import { renderProjectTitle } from "#/utils/customName";
import type { TitlePackageItem } from "#/api/models";
import {
  getBudgetModeCampaignLabel,
  getCampaignOperationLabel,
  getDeliveryModeLabel,
  getExternalActionLabel,
  getLandingTypeLabel,
  getMarketingGoalLabel,
  getPricingLabel
} from "./enums";

/**
 * 获取抖音号ID —— 智擎版仅支持按项目(PER_PROJECT)/按账户(PER_ACCOUNT)分配
 * Map key：PER_PROJECT → '0'；PER_ACCOUNT → advertiserId
 */
function getAwemeId(
  awemeConfig: AwemeConfigData | undefined,
  advertiserId: string,
): string {
  if (!awemeConfig?.data) return '';
  const key = awemeConfig.config.method === 'PER_ACCOUNT' ? advertiserId : '0';
  return awemeConfig.data.get(key)?.[0]?.awemeId || '';
}

/**
 * 获取智擎版预览表格数据（单层：项目）
 */
export function getPreviewTableData(
  creationInfo: StdCreation
): StdCreationData[] {
  const adList: StdCreationData[] = [];

  creationInfo.accountInfo.forEach((account) => {
    const advertiserId = account.localAdvertiserId;

    const tableData: StdCreationData = {
      advertiserId,
      projectList: [],
      getProjectCount(): number {
        return this.projectList.length;
      }
    };
    const projectCount = getRuleInfoCampaignCount(
      Platform.BYTEDANCE,
      creationInfo,
      [advertiserId]
    );

    const projectData = creationInfo.configData.project;

    for (let pIdx = 0; pIdx < projectCount; pIdx++) {
      // 获取素材
      const materialList: Material[] = getMaterial(
        creationInfo.configData.material.config.method,
        creationInfo.configData.material.data,
        advertiserId
      );

      const material = materialList[pIdx % materialList.length];
      const videoIds = (material?.video || []).map((v) => v.localMaterialId);
      const imageIds = (material?.image || []).map((i) => i.localMaterialId);

      // 获取标题包
      const titlePackage: TitlePackageItem = getTiltePackage(
        creationInfo.configData.titlePackage.config.method,
        creationInfo.configData.titlePackage.data,
        advertiserId,
        pIdx
      );

      // 获取落地页
      const landingPageItem = getLandingPage(
        creationInfo.configData.landingPage.config.method,
        creationInfo.configData.landingPage.data,
        advertiserId
      );

      // 监测练级
      const monitoringLink = getMonitoringLink(
        creationInfo.configData.monitoringLink.config.method,
        creationInfo.configData.monitoringLink.data,
        advertiserId,
        pIdx
      );
      // 构建 project_materials
      const materials: StdProjectMaterials = {
        local_video_material_list: videoIds,
        local_image_material_list: imageIds,
        video_material_list: (material?.video || []).map((v) => ({
          video_id: v.localMaterialId,
          video_cover_id: "",
          image_mode: "",
          video_template_type: "",
          video_task_ids: [],
          item_id: "",
          video_hp_visibility: "HIDE_VIDEO_ON_HP",
          guide_video_id: ""
        })),
        image_material_list: (material?.image || []).map((i) => ({
          image_mode: "",
          image_id: i.localMaterialId
        })),
        title_material_list: titlePackage?.title
          ? [{ title: titlePackage.title, word_list: [] }]
          : [],
        carousel_material_list: [],
        trial_play_material_list: [],
        instant_play_material_list: [],
        product_info: {
          titles: projectData.project_materials?.product_info?.titles || [],
          image_ids: projectData.project_materials?.product_info?.image_ids || [],
          selling_points: projectData.project_materials?.product_info?.selling_points || [],
          local_material_image_ids: projectData.project_materials?.product_info?.image_ids || []
        },
        anchor_related_type: projectData.project_materials?.anchor_related_type || "OFF",
        anchor_material_list: projectData.project_materials?.anchor_material_list || [],
        component_material_list: projectData.project_materials?.component_material_list || [],
        external_url_material_list: [landingPageItem.config?.pageUrl || ""],
        web_url_material_list: projectData.project_materials?.web_url_material_list || [],
        open_url: projectData.project_materials?.open_url || "",
        open_urls: projectData.project_materials?.open_urls || [],
        ulink: projectData.project_materials?.ulink || "",
        ulink_type: projectData.project_materials?.ulink_type || "",
        mini_program_info: projectData.project_materials?.mini_program_info || {
          app_id: "", start_path: "", params: "", url: "", urls: [], auto: []
        },
        playlet_series_url_list: projectData.project_materials?.playlet_series_url_list || [],
        original_video_title: "",
        dynamic_creative_switch: "",
        advanced_dc_settings: [],
        call_to_action_buttons: projectData.project_materials?.call_to_action_buttons || [],
        intelligent_generation: projectData.project_materials?.intelligent_generation || "OFF",
        params_type: "",
        external_url_field: "",
        external_url_params: "",
        open_url_type: "",
        open_url_field: "",
        open_url_params: ""
      };

      const audience = getAudience(
        creationInfo.configData.audience.config.method,
        creationInfo.configData.audience.data,
        advertiserId,
        pIdx
      );

      const project: StdProject = {
        aigc_dynamic_creative_switch: "",
        app_name: creationInfo.configData.project.app_name,
        app_promotion_type: projectData.app_promotion_type,
        asset_id: projectData.asset_id,
        asset_type: projectData.asset_type,
        audience_type: projectData.audience_type,
        auto_extend_traffic: projectData.auto_extend_traffic,
        aweme_id: getAwemeId(creationInfo.configData.awemeConfig, advertiserId),
        blue_flow_keyword_name: projectData.blue_flow_keyword_name,
        brand_info: projectData.brand_info,
        cpa_bid: projectData.cpa_bid,
        deep_bid_type: projectData.deep_bid_type,
        deep_cpabid: projectData.deep_cpabid,
        delivery_medium: projectData.delivery_medium,
        download_mode: projectData.download_mode,
        download_type: projectData.download_type,
        download_url: projectData.download_url,
        dpa_adtype: projectData.dpa_adtype,
        end_time: projectData.end_time,
        first_roi_goal: projectData.first_roi_goal,
        game_addiction_id: projectData.game_addiction_id,
        instance_id: projectData.instance_id,
        is_comment_disable: projectData.is_comment_disable,
        keywords: projectData.keywords,
        landing_page_stay_time: projectData.landing_page_stay_time,
        launch_type: projectData.launch_type,
        layer_roi_switch: projectData.layer_roi_switch,
        live_duration: projectData.live_duration,
        micro_app_instance_id: projectData.micro_app_instance_id,
        micro_promotion_type: projectData.micro_promotion_type,
        multi_asset_type: projectData.multi_asset_type,
        multi_delivery_medium: projectData.multi_delivery_medium,
        native_type: projectData.native_type,
        product_id: projectData.product_id,
        product_platform_id: projectData.product_platform_id,
        promotion_type: projectData.promotion_type,
        quick_app_id: projectData.quick_app_id,
        schedule_time: projectData.schedule_time,
        search_continue_delivery: projectData.search_continue_delivery,
        seven_roi_goal: projectData.seven_roi_goal,
        shop_platform: projectData.shop_platform,
        star_task_id_list: projectData.star_task_id_list,
        start_time: projectData.start_time,
        subscribe_url: projectData.subscribe_url,
        unique_product_id: projectData.unique_product_id,
        getName(): string {
          return this.name;
        },
        name: renderProjectTitle(
          projectData.name,
          pIdx,
          creationInfo.project.projectName
        ),
        operation: projectData.operation,
        landing_type: projectData.landing_type,
        marketing_goal: projectData.marketing_goal,
        ad_type: projectData.ad_type,
        delivery_type: projectData.delivery_type,
        delivery_mode: projectData.delivery_mode,
        external_action: projectData.external_action,
        deep_external_action: projectData.deep_external_action,
        bid_type: projectData.bid_type,
        budget_mode: projectData.budget_mode,
        budget: projectData.budget,
        bid: projectData.bid,
        pricing: projectData.pricing,
        roi_goal: projectData.roi_goal,
        schedule_type: projectData.schedule_type,
        project_materials: materials,
        // related_product: projectData.related_product,
        track_url_setting: {
          action_track_url: [monitoringLink.clickLink],
          active_track_url: [],
          send_type: "SERVER_SEND",
          track_url: [monitoringLink.exposureLink],
          track_url_group_id: 0,
          track_url_type: "",
          video_play_done_track_url: [],
          video_play_effective_track_url: [],
          video_play_first_track_url: []
        },
        audience: audience.mediaId
          ? { audience_package_id: audience.mediaId }
          : audience.config || {}
      };

      tableData.projectList.push(project);
    }

    adList.push(tableData);
  });

  return adList;
}

/**
 * 将预览数据转换为 PreviewArea 组件所需格式（单层：项目）
 */
export function convertToPreviewData(
  adList: StdCreationData[],
  accountInfo: AccountInfo[]
): AccountTabData[] {
  return adList.map((item) => {
    const account = accountInfo.find(
      (a) => a.localAdvertiserId === item.advertiserId
    );

    const flattenedRows = flattenData(item.projectList);

    return {
      advertiserId: item.advertiserId,
      advertiserName: account?.advertiserName || "",
      campaignCount: item.getProjectCount(),
      adgroupCount: 0,
      promotionCount: 0,
      flattenedRows
    };
  });
}

/**
 * 扁平化项目数据为表格行（智擎版只有项目一层）
 */
function flattenData(projectList: StdProject[]): any[] {
  const rows: any[] = [];

  projectList.forEach((project, idx) => {
    const materials = project.project_materials;
    const videoCount = materials.local_video_material_list?.length || 0;
    const imageCount = materials.local_image_material_list?.length || 0;
    const titleList = materials.title_material_list || [];
    const titleText = titleList.map((t) => t.title).join("; ");

    rows.push({
      rowProjectId: `p_${idx}`,

      // 项目信息
      projectName: project.name,
      marketingGoal: getMarketingGoalLabel(project.marketing_goal),
      landingType: getLandingTypeLabel(project.landing_type),
      deliveryMode: getDeliveryModeLabel(project.delivery_mode),
      optimizeGoal: getExternalActionLabel(project.external_action) || "",
      deepOptimizeGoal: getExternalActionLabel(project.deep_external_action) || "",
      roiGoal: project.roi_goal || "",
      projectBudget: project.budget,
      projectBid: project.bid,
      projectBudgetMode: getBudgetModeCampaignLabel(project.budget_mode),
      projectPricing: getPricingLabel(project.pricing),
      projectStatus: getCampaignOperationLabel(project.operation),

      // 商品
      // productId: project.related_product?.product_id || "",

      // 素材信息
      displayMaterialInfo: `图片 ${imageCount}个, 视频 ${videoCount}个`,
      titleInfo: titleText
    });
  });

  return rows;
}
