import type {
  UnitCreation,
  UnitCreationData,
  UnitProject,
  UnitProjectCreateRequest,
  UnitVideoMaterial,
} from './bytedance';

import type {
  AccountTabData,
} from '#/views/marketing/creation/components/preview_area/previewAreaData';
import type {
  AccountInfo,
  Material,
} from '#/views/marketing/creation/creation';

import { CampaignRuleKey, Platform } from '#/constants/enums';
import { renderProjectTitle } from '#/utils/customName';
import { resolveAweme } from '#/views/marketing/creation/components/aweme/types';
import { resolveDpaProduct } from '#/views/marketing/creation/components/dpa_product/types';
import { resolveProductConfigItem } from '#/views/marketing/creation/components/product_config/types';
import {
  getAudience,
  getFlatTitleList,
  getLandingPage,
  getMaterial,
  getRuleInfoCampaignCount,
  getTitleCount,
} from '#/views/marketing/creation/creation';

/** 素材 ID 保持字符串，避免 19 位 ID 转 number 丢精度 */
function toLocalIds(values: string[] | undefined): string[] {
  return (values ?? [])
    .map((value) => String(value ?? '').trim())
    .filter((value) => value !== '' && value !== '0' && /^\d+$/.test(value));
}

/** 获取全域批投预览数据（单层：项目） */
export function getPreviewTableData(creationInfo: UnitCreation): UnitCreationData[] {
  const adList: UnitCreationData[] = [];
  const projectData = creationInfo.configData.project;
  let globalProjectIndex = 0;

  creationInfo.accountInfo.forEach((account, accountIdx) => {
    const advertiserId = account.localAdvertiserId;
    const tableData: UnitCreationData = {
      advertiserId,
      projectList: [],
      getProjectCount() {
        return this.projectList.length;
      },
    };

    const titlePackageConfig = creationInfo.configData.titlePackage;
    const projectCount =
      creationInfo.ruleInfo.projectRuleKey === CampaignRuleKey.title
        ? getTitleCount(
            titlePackageConfig.config.method,
            titlePackageConfig.data,
            [advertiserId],
          )
        : getRuleInfoCampaignCount(Platform.BYTEDANCE, creationInfo, [
            advertiserId,
          ]);
    const flatTitles = getFlatTitleList(
      titlePackageConfig.config.method,
      titlePackageConfig.data,
      advertiserId,
    );
    for (let pIdx = 0; pIdx < projectCount; pIdx++) {
      const materialList: Material[] = getMaterial(
        creationInfo.configData.material.config.method,
        creationInfo.configData.material.data,
        advertiserId,
        [
          { count: creationInfo.accountInfo.length, index: accountIdx },
          { count: projectCount, index: pIdx },
        ],
      );
      const material = materialList[pIdx % Math.max(1, materialList.length)];
      const videoIds = toLocalIds(
        (material?.video || []).map((item) => item.localMaterialId),
      );
      const imageIds = toLocalIds(
        (material?.image || []).map((item) => item.localMaterialId),
      );
      const videoMaterialList: UnitVideoMaterial[] =
        videoIds.length > 0 || imageIds.length > 0
          ? [
              {
                local_image_material_list: imageIds,
                local_video_material_list: videoIds,
              },
            ]
          : [];
      const title =
        flatTitles.length > 0 ? flatTitles[pIdx % flatTitles.length] : '';

      const landingPageItem = getLandingPage(
        creationInfo.configData.landingPage.config.method,
        creationInfo.configData.landingPage.data,
        advertiserId,
      );
      const iapUrl =
        landingPageItem?.config?.pageUrlIap ||
        landingPageItem?.config?.pageUrl ||
        '';
      const iaaUrl = landingPageItem?.config?.pageUrlIaa || '';
      const goingGlobalEnabled =
        projectData.monetization_mode === 'IAA_AND_IAP' &&
        projectData.going_global_switch === 'ON';
      const audienceItem = getAudience(
        creationInfo.configData.audience.config.method,
        creationInfo.configData.audience.data,
        advertiserId,
        pIdx,
      );
      const audienceConfig: Record<string, any> = {
        ...((audienceItem?.config as Record<string, any>) || {}),
      };
      delete audienceConfig.unitAudience;
      const productMapping = resolveProductConfigItem(
        creationInfo.configData.productConfig,
        {
          advertiserId,
          globalProjectIndex,
          projectIndex: pIdx,
        },
      );
      const productImageIds = toLocalIds(productMapping?.image_button);
      const dpaProduct = resolveDpaProduct(
        creationInfo.configData.dpaProductConfig,
        {
          advertiserId,
          globalProjectIndex,
          projectIndex: pIdx,
        },
      );
      const projectPayload: UnitProjectCreateRequest = { ...projectData };
      const project: UnitProject = {
        ...projectPayload,
        aigc_dynamic_creative_switch:
          projectData.aigc_dynamic_creative_switch || 'ON',
        audience:
          Object.keys(audienceConfig).length > 0
            ? audienceConfig
            : {
                ...(projectData.audience || {}),
                age: projectData.audience?.age || [],
                district: projectData.audience?.district || 'NONE',
                gender: projectData.audience?.gender || 'NONE',
                platform: projectData.audience?.platform || [],
              },
        aweme_id:
          resolveAweme(creationInfo.configData.awemeConfig, {
            advertiserId,
            globalProjectIndex,
            projectIndex: pIdx,
          })?.awemeId || '', 
        budget: Number(projectData.budget) || 0,
        call_to_action_buttons: productMapping?.action_buttons ?? [],
        delivery_product: projectData.delivery_product || 'ALBUM',
        end_time: projectData.end_time || '',
        getName(): string {
          return this.name;
        },
        going_global_budget: goingGlobalEnabled
          ? Number(projectData.going_global_budget) || 0
          : undefined,
        going_global_roi_goal: goingGlobalEnabled
          ? Number(projectData.going_global_roi_goal) || 0
          : undefined,
        going_global_switch:
          projectData.monetization_mode === 'IAA_AND_IAP'
            ? projectData.going_global_switch || 'OFF'
            : undefined,
        monetization_mode: projectData.monetization_mode || 'IAP',
        name: renderProjectTitle(
          projectData.name,
          pIdx,
          creationInfo.project.projectName,
        ),
        related_product: dpaProduct
          ? {
              product_id: String(dpaProduct.product_id),
              product_platform_id: String(dpaProduct.platform_id),
            }
          : undefined,
        playlet_series_url_info: [
          ...(iapUrl
            ? [
                {
                  playlet_series_url: iapUrl,
                  playlet_series_url_type: 'IAP',
                },
              ]
            : []),
          ...(projectData.monetization_mode === 'IAA_AND_IAP' && iaaUrl
            ? [
                {
                  playlet_series_url: iaaUrl,
                  playlet_series_url_type: 'IAA',
                },
              ]
            : []),
        ],
        product_info: {
          image_ids: [],
          local_images_ids: productImageIds,
          selling_points: productMapping?.selling_points ?? [],
          // 全域文档限制产品名称数组上限 1
          titles: (productMapping?.titles ?? []).slice(0, 1),
        },
        schedule_time: projectData.schedule_time || '',
        schedule_type: projectData.schedule_type || 'SCHEDULE_FROM_NOW',
        source: projectData.source || '',
        start_time: projectData.start_time || '',
        title_material_list: title ? [{ title }] : [],
        uni_roi_goal: Number(projectData.uni_roi_goal) || 0,
        video_material_list: videoMaterialList,
      };
      tableData.projectList.push(project);
      globalProjectIndex += 1;
    }
    adList.push(tableData);
  });

  return adList;
}

/** 统计视频素材内挂载的本地素材数量 */
function countVideoMaterialLocalIds(
  project: UnitProject,
  field: 'local_image_material_list' | 'local_video_material_list',
): number {
  return (project.video_material_list ?? []).reduce(
    (total, item) => total + (item[field]?.length ?? 0),
    0,
  );
}

/** 预览区表格数据（单层：项目） */
export function convertToPreviewData(
  adList: UnitCreationData[],
  accountInfo: AccountInfo[],
): AccountTabData[] {
  return adList.map((item) => {
    const account = accountInfo.find(
      (row) => row.localAdvertiserId === item.advertiserId,
    );
    return {
      adgroupCount: 0,
      advertiserId: item.advertiserId,
      advertiserName: account?.advertiserName || '',
      campaignCount: item.getProjectCount(),
      flattenedRows: item.projectList.map((project, index) => {
        const imageCount =
          countVideoMaterialLocalIds(project, 'local_image_material_list') +
          (project.product_info?.local_images_ids?.length ?? 0) +
          (project.product_info?.image_ids?.length ?? 0);
        const videoCount = countVideoMaterialLocalIds(
          project,
          'local_video_material_list',
        );
        return {
          budget: project.budget,
          deliveryProduct: project.delivery_product,
          materialInfo: `图片 ${imageCount}个, 视频 ${videoCount}个`,
          monetizationMode: project.monetization_mode,
          projectName: project.name,
          roiGoal: project.uni_roi_goal,
          rowProjectId: `p_${index}`,
          scheduleType: project.schedule_type,
          titleInfo: (project.title_material_list ?? [])
            .map((t) => t.title)
            .join('; '),
        };
      }),
      promotionCount: 0,
    };
  });
}
