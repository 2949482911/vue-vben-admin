import type {
  StdCreation,
  StdCreationData,
  StdProject,
  StdProjectMaterials,
} from './bytedance';
import type {
  AccountInfo,
  Material,
} from '#/views/marketing/creation/creation';
import {
  getAudience,
  getLandingPage,
  getMaterial,
  getRuleInfoCampaignCount,
  getTiltePackage,
} from '#/views/marketing/creation/creation';
import type {
  AccountTabData,
} from '#/views/marketing/creation/components/preview_area/previewAreaData';
import { Platform } from '#/constants/enums';
import { renderProjectTitle } from '#/utils/customName';
import type { TitlePackageItem } from '#/api/models';
import  {
  getBudgetModeCampaignLabel,
  getCampaignOperationLabel,
  getDeliveryModeLabel,
  getLandingTypeLabel,
  getMarketingGoalLabel,
  getPricingLabel,
} from './enums';

/**
 * 获取智擎版预览表格数据（单层：项目）
 */
export function getPreviewTableData(
  creationInfo: StdCreation,
): StdCreationData[] {
  const adList: StdCreationData[] = [];

  creationInfo.accountInfo.forEach((account) => {
    const advertiserId = account.localAdvertiserId;

    const tableData: StdCreationData = {
      advertiserId,
      projectList: [],
      getProjectCount(): number {
        return this.projectList.length;
      },
    };

    const projectCount = getRuleInfoCampaignCount(
      Platform.BYTEDANCE,
      creationInfo,
      [advertiserId],
    );

    const projectData = creationInfo.configData.project;

    for (let pIdx = 0; pIdx < projectCount; pIdx++) {
      // 获取素材
      const materialList: Material[] = getMaterial(
        creationInfo.configData.material.config.method,
        creationInfo.configData.material.data,
        advertiserId,
      );

      const material = materialList[pIdx % materialList.length];
      const videoIds = (material?.video || []).map((v) => v.localMaterialId);
      const imageIds = (material?.image || []).map((i) => i.localMaterialId);

      // 获取标题包
      const titlePackage: TitlePackageItem = getTiltePackage(
        creationInfo.configData.titlePackage.config.method,
        creationInfo.configData.titlePackage.data,
        advertiserId,
        pIdx,
      );

      // 获取落地页
      const landingPageItem = getLandingPage(
        creationInfo.configData.landingPage.config.method,
        creationInfo.configData.landingPage.data,
        advertiserId,
      );

      // 构建 project_materials
      const materials: StdProjectMaterials = {
        local_video_material_list: videoIds,
        local_image_material_list: imageIds,
        video_material_list: (material?.video || []).map((v) => ({
          video_id: v.localMaterialId,
          video_cover_id: '',
          image_mode: '',
          video_template_type: '',
          video_task_ids: [],
          item_id: '',
          video_hp_visibility: 'HIDE_VIDEO_ON_HP',
          guide_video_id: '',
        })),
        image_material_list: (material?.image || []).map((i) => ({
          image_mode: '',
          image_id: i.localMaterialId,
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
          local_material_image_ids: projectData.project_materials?.product_info?.image_ids || [],
        },
        anchor_related_type: projectData.project_materials?.anchor_related_type || 'OFF',
        anchor_material_list: projectData.project_materials?.anchor_material_list || [],
        component_material_list: projectData.project_materials?.component_material_list || [],
        external_url_material_list: [landingPageItem.config?.pageUrl || ''],
        web_url_material_list: projectData.project_materials?.web_url_material_list || [],
        open_url: projectData.project_materials?.open_url || '',
        open_urls: projectData.project_materials?.open_urls || [],
        ulink: projectData.project_materials?.ulink || '',
        ulink_type: projectData.project_materials?.ulink_type || '',
        mini_program_info: projectData.project_materials?.mini_program_info || {
          app_id: '', start_path: '', params: '', url: '', urls: [], auto: [],
        },
        playlet_series_url_list: projectData.project_materials?.playlet_series_url_list || [],
        original_video_title: '',
        dynamic_creative_switch: '',
        advanced_dc_settings: [],
        call_to_action_buttons: projectData.project_materials?.call_to_action_buttons || [],
        intelligent_generation: projectData.project_materials?.intelligent_generation || 'OFF',
        params_type: '',
        external_url_field: '',
        external_url_params: '',
        open_url_type: '',
        open_url_field: '',
        open_url_params: '',
      };

      const audience = getAudience(
        creationInfo.configData.audience.config.method,
        creationInfo.configData.audience.data,
        advertiserId,
        pIdx,
      );

      const project: StdProject = {
        getName(): string {
          return this.name;
        },
        name: renderProjectTitle(
          projectData.name,
          pIdx,
          creationInfo.project.projectName,
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
        related_product: projectData.related_product,
        track_url_setting: projectData.track_url_setting,
        audience: audience.mediaId
          ? { audience_package_id: audience.mediaId }
          : audience.config || {},
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
  accountInfo: AccountInfo[],
): AccountTabData[] {
  return adList.map((item) => {
    const account = accountInfo.find(
      (a) => a.localAdvertiserId === item.advertiserId,
    );

    const flattenedRows = flattenData(item.projectList);

    return {
      advertiserId: item.advertiserId,
      advertiserName: account?.advertiserName || '',
      campaignCount: item.getProjectCount(),
      adgroupCount: 0,
      promotionCount: 0,
      flattenedRows,
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
    const titleText = titleList.map((t) => t.title).join('; ');

    rows.push({
      rowProjectId: `p_${idx}`,

      // 项目信息
      projectName: project.name,
      marketingGoal: getMarketingGoalLabel(project.marketing_goal),
      landingType: getLandingTypeLabel(project.landing_type),
      deliveryMode: getDeliveryModeLabel(project.delivery_mode),
      optimizeGoal: project.external_action || '',
      deepOptimizeGoal: project.deep_external_action || '',
      roiGoal: project.roi_goal || '',
      projectBudget: project.budget,
      projectBid: project.bid,
      projectBudgetMode: getBudgetModeCampaignLabel(project.budget_mode),
      projectPricing: getPricingLabel(project.pricing),
      projectStatus: getCampaignOperationLabel(project.operation),

      // 商品
      productId: project.related_product?.product_id || '',

      // 素材信息
      displayMaterialInfo: `图片 ${imageCount}个, 视频 ${videoCount}个`,
      titleInfo: titleText,
    });
  });

  return rows;
}
