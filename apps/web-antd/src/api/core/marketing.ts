import {BaseApi} from "#/api/core/baseapi";
import { customRequest } from '#/api/customRequest';
import type {
  AccountChildResponse,
  AdReportRequest,
  AdReportResponse,
  AdvertiserItem,
  AdvertiserPageRequest,
  AuthAdvertiserRequest,
  CreateDeveloperRequest, CreateProjectRequest, CreateSystemMetric,
  DeveloperPageRequest, ImportChildRequest, MetricItem, ProjectPageRequest,
  SystemMetricPageRequest, UpdateAdvertiserRequest, UpdateDeveloperRequest, UpdateMetric,
  UpdateProjectRequest,
  ReportTemplate,
  templateListType,
  delTemplate,
  CreateFolderParams,
  MaterialListParams,
  FileInfo,
  EditPaletteParams,
  DeveloperListResponse,
  AdvertiserDeveloperBindRequest,
  PageResult,
  AdvertiserCostDetailType,
  PageResponse,
  AppNameOptionsType,
  PlatformMatchRequest,
  AdCompanyOptionsType,
  GetTitlePackType,
  DelTitlePackType,
  TitlePackItem,
  GetTargetedPackageType,
  NewTargetedPackageType,
  GetCreationTaskType,
  GetLabelItemType,
  NewLabelItemType,
  EditLabelItemType,
  DelLabelItemType,
  AdInvestmentType,
  AdCreativeType,
  VirtualLocationType,
  VivoSubmitType,
  GetStrategyGropType,
  StrategyGropType,
  UpdateStrategyGropType
} from "#/api/models/marketing";
import {requestClient} from "#/api/request";
import type {BatchOptions} from "#/api/models/core";


/**
 * 开发者
 */
class DeveloperApi extends BaseApi {
  fetchDeveloperList(params: DeveloperPageRequest) {
    return requestClient.get<DeveloperListResponse>(this.getServiceUrl("list"), {params: params})
  }

  fetchCreateDeveloper(params: CreateDeveloperRequest) {
    return requestClient.post(this.getServiceUrl("create"), params)
  }

  fetchUpdateDeveloper(params: UpdateDeveloperRequest) {
    return requestClient.post(this.getServiceUrl("update"), params)
  }

  fetchBatchOptions(params: BatchOptions) {
    return requestClient.post(this.getServiceUrl("batch_options"), params)
  }
}

export const developerApi = new DeveloperApi("/platform/developer");


/**
 * 账户
 */
class AdvertiserApi extends BaseApi {

  /**
   * 获取授权链接
   * @param params
   */
  fetchAuthUrl(params: AuthAdvertiserRequest) {
    return requestClient.get(this.getServiceUrl("auth_url"), {params})
  }

  /**广告主List */
  fetchAdvertiserList(params: AdvertiserPageRequest) {
    return requestClient.get<PageResponse<AdvertiserItem>>(this.getServiceUrl("list"), {params})
  }

  /**华为商店新增接口 */
  fetchCreateAdvertiser(params: AdvertiserDeveloperBindRequest) {
    return requestClient.post(this.getServiceUrl("create"), params)
  }

  /**华为商店更新接口 */
  fetchUpdateAdvertiser(params: UpdateAdvertiserRequest) {
    return requestClient.post(this.getServiceUrl("update"), params)
  }

  fetchBatchOptions(params: BatchOptions) {
    return requestClient.post(this.getServiceUrl("batch_options"), params)
  }

  /**
   * 获取子账户
   * @param id
   */
  fetchAccountChild(id: string) {
    return requestClient.get<AccountChildResponse>(this.getServiceUrl("account_child"), {params: {id: id}})
  }

  /**
   * 导入子账户
   * @param data
   */
  fetchImportChild(data: ImportChildRequest) {
    return requestClient.post(this.getServiceUrl("import_child"), data)
  }

  /**账户消耗详情 */
  fetchAdvertiserCostDetail(data: AdvertiserCostDetailType) {
    return requestClient.post(this.getServiceUrl("advertiser_cost_detail"), data)
  }

  /**账户消耗详情-appName下拉 */
  fetchAdvertiserAppOptions(params: AppNameOptionsType) {
    return requestClient.get(this.getServiceUrl("app"), {params})
  }
  /**账户消耗详情-账户名字下拉 */
  fetchAdCompanyOptions(params: AdCompanyOptionsType) {
    return requestClient.get(this.getServiceUrl("advertiser_company"), {params})
  }
  /**广告主-获取下载模版 */
  fetchDownloadTemplate(params: AdCompanyOptionsType) {
    return requestClient.get(this.getServiceUrl("template"), {params})
  }
  /**广告主-导入Excel数据 */
  fetchImportData(data: FormData, platform: string) {
    // 拼接完整 URL
    // 直接使用 customRequest 发送，它会自动拼接 baseURL
    return customRequest.post(this.getServiceUrl("import"), data, {
      params: { platform },
      // 不需要手动设置 headers['Content-Type']，axios 会根据 data 类型自动设置
    });
  }
}

export const advertiserApi = new AdvertiserApi("/platform/advertiser");


// 指标接口

class MetricApi extends BaseApi {

  fetchCreateSystemMetric(params: CreateSystemMetric) {
    return requestClient.post(this.getServiceUrl("create_system_metric"), params)
  }


  fetchCreateMetric(params: CreateSystemMetric) {
    return requestClient.post(this.getServiceUrl("create_metric"), params)
  }

  fetchUpdateMetric(params: UpdateMetric) {
    return requestClient.post(this.getServiceUrl("update"), params)
  }


  fetchSystemMetricList(params: SystemMetricPageRequest) {
    return requestClient.get<MetricItem>(this.getServiceUrl("system_metric_list"), {
      params
    })
  }


  /**
   * 获取查询指标列表
   */
  fetchMetric() {
    return requestClient.get<MetricItem>(this.getServiceUrl("query_metric"))
  }

  fetchBatchOptions(params: BatchOptions) {
    return requestClient.post(this.getServiceUrl("batch_options",), params)
  }

}

export const metricApi = new MetricApi("/platform/metric");


/**
 * report data
 */
class ReportApi extends BaseApi {
  fetchAdReport(params: AdReportRequest) {
    return requestClient.post<AdReportResponse>(this.getServiceUrl("adreport"), params)
  }

  /**广告效果数据-计划、广告、广告组、创意联动下拉 */
  fetchAdLinkage(params: PlatformMatchRequest) {
    return requestClient.post(this.getServiceUrl("stat_select"), params)
  }
}


export const reportApi = new ReportApi("/platform/report");


/**
 * project
 */


class ProjectApi extends BaseApi {
  fetchProjectList(params: ProjectPageRequest) {
    return requestClient.get<PageResult>(this.getServiceUrl("list"), {params})
  }

  fetchCreateProject(data: CreateProjectRequest) {
    return requestClient.post(this.getServiceUrl("create_project"), data)
  }

  fetchUpdateProject(data: UpdateProjectRequest) {
    return requestClient.post(this.getServiceUrl("update_project"), data)
  }

  fetchBatchOptions(params: BatchOptions) {
    return requestClient.post(this.getServiceUrl("batch_options"), params)
  }
}

export const projectApi = new ProjectApi("/platform/project");

/**
 * 报表保存模板
 */
class ReportTemplateApi extends BaseApi {
  fetchReportTemplate(params: ReportTemplate) {
    return requestClient.post(this.getServiceUrl("template_create"), params)
  }

  fetchGetTemplateList(params: templateListType) {
    return requestClient.get(this.getServiceUrl("template_list"), {params: params})
  }
  fetchDelTemplate(params: delTemplate) {
    return requestClient.post(this.getServiceUrl("template_batch_options"), params)
  }
}

export const reportTemplateApi = new ReportTemplateApi("/platform/report_configuration");

/**
 * 素材库
 */
class MaterialLibraryApi extends BaseApi {
  /**目录树*/
  fetchDirectoryTreeList() {
    return requestClient.get(this.getServiceUrl("tree"))
  }
  /**创建文件夹*/
  fetchCreateFile(params: CreateFolderParams) {
    return requestClient.post(this.getServiceUrl("create"), params)
  }
  /**编辑文件夹*/
  fetchUpdateFile(params: CreateFolderParams) {
    return requestClient.post(this.getServiceUrl("update"), params)
  }
}

export const materialLibraryApi = new MaterialLibraryApi("/platform/album");

/**
 * 素材库
 */
class UploadEditApi extends BaseApi {
  /**上传素材*/
  fetchUploadMaterials(params: FileInfo) {
    return requestClient.post(this.getServiceUrl("create"), params)
  }
  /**编辑素材*/
  fetchEditMaterials(params: EditPaletteParams) {
    return requestClient.post(this.getServiceUrl(""), params)
  }
  /**素材列表*/
  fetchMaterialList(params: MaterialListParams) {
    return requestClient.get(this.getServiceUrl("list"), {params})
  }
  /**删除素材*/
  fetchDelMaterials(params: BatchOptions) {
    return requestClient.post(this.getServiceUrl("batch_options"), params)
  }
}

export const uploadEditApi = new UploadEditApi("/platform/material");

/**
 * 素材库文件上传凭证
 */
class UploadCredentialsApi extends BaseApi {
  /**上传凭证*/
  fetchEvidence() {
    return requestClient.get(this.getServiceUrl("sts_token"))
  }
}

export const uploadCredentialsApi = new UploadCredentialsApi("/platform/aliyun");

/**
 * 营销-资产-标题包
 */
class TitlePackApi extends BaseApi {
  /**标题包查询*/
  fetchGetTitlePack(params:GetTitlePackType) {
    return requestClient.get(this.getServiceUrl("list"),{params})
  }

  /**标题包删除*/
  fetchDelTitlePack(params:DelTitlePackType) {
    return requestClient.post(this.getServiceUrl("batch_options"),params)
  }

  /**标题包新建*/
  fetchNewTitlePack(params:TitlePackItem) {
    return requestClient.post(this.getServiceUrl("create"),params)
  }
}

export const titlePackApi = new TitlePackApi("/platform/titlePackage");


/**
 * 营销-资产-定向包
 */
class TargetedPackageApi extends BaseApi {
  /**定向包查询*/
  fetchGetTitleTargetedPackage(params:GetTargetedPackageType) {
    return requestClient.get(this.getServiceUrl("list"),{params})
  }

  /**定向包删除*/
  fetchDelTargetedPackage(params:DelTitlePackType) {
    return requestClient.post(this.getServiceUrl("batch_options"),params)
  }

  /**定向包新建*/
  fetchNewTargetedPackage(params:NewTargetedPackageType) {
    return requestClient.post(this.getServiceUrl("create"),params)
  }

  /**定向包修改*/
  fetchModifyTargetedPackage(params:NewTargetedPackageType) {
    return requestClient.post(this.getServiceUrl("update"),params)
  }
}

export const targetedPackageApi = new TargetedPackageApi("/platform/audience_package");

/**
 * 创编任务
 */
class CreationTaskApi extends BaseApi {
  /**任务列表查询*/
  fetchGetCreationTaskList(params:GetCreationTaskType) {
    return requestClient.get(this.getServiceUrl("list"),{params})
  }

  /**批投提交审核*/
  fetchVivoSubmitReview(params:VivoSubmitType) {
    return requestClient.post(this.getServiceUrl("create"),params)
  }

  /**批投提交审核*/
  fetchVivoSubmitResult(params:{id:string}) {
    return requestClient.get(this.getServiceUrl("create_result"),{params})
  }
  
}

export const creationTaskApi = new CreationTaskApi("/platform/advertisement_batch_create");

/**
 * 账户标签
 */
class AccountLabelApi extends BaseApi {
  /**标签列表查询*/
  fetchGetAccountLabelList(params:GetLabelItemType) {
    return requestClient.get(this.getServiceUrl("list"),{params})
  }
  /**标签列表删除*/
  fetchBatchOptions(params:DelLabelItemType) {
    return requestClient.post(this.getServiceUrl("batch_options"),params)
  }

  /**标签列表新建*/
  fetchNewAccountLabel(params:NewLabelItemType) {
    return requestClient.post(this.getServiceUrl("create"),params)
  }

  /**标签列表修改*/
  fetchModifyAccountLabel(params:EditLabelItemType) {
    return requestClient.post(this.getServiceUrl("update"),params)
  }
}

export const accountLabelApi = new AccountLabelApi("/platform/advertiser_tag");

/**
 * 营销-创编-Vivo营销-广告主-广告投放资质ID
 */
class AdInvestmentApi extends BaseApi {
  /**广告投放资质ID下拉*/
  fetchGetAdInvestment(params:AdInvestmentType) {
    return requestClient.post(this.getServiceUrl("qualification"),params)
  }
  /**广告创意类型下拉*/
  fetchCreativeType(params:AdCreativeType) {
    return requestClient.post(this.getServiceUrl("position_creative_type"),params)
  }
  /**投放虚拟位置下拉*/
  fetchVirtualLocation(params:VirtualLocationType) {
    return requestClient.post(this.getServiceUrl("virtual_position"),params)
  }
}

export const adInvestmentApi = new AdInvestmentApi("/platform/vivo_advertisement");
/**
 * 营销-创编-Vivo营销-策略组
 */
class StrategyGropApi extends BaseApi {
  fetchNewStrategyGrop(params:StrategyGropType) {
    return requestClient.post(this.getServiceUrl("create"),params)
  }
  fetchBatchStrategyGrop(params:delTemplate) {
    return requestClient.post(this.getServiceUrl("batch_options"),params)
  }
  fetchUpdateStrategyGrop(params:UpdateStrategyGropType) {
    return requestClient.post(this.getServiceUrl("update"),params)
  }
  fetchGetStrategyGrop(params:GetStrategyGropType) {
    return requestClient.get(this.getServiceUrl("list"),{params})
  }
}

export const strategyGropApi = new StrategyGropApi("/platform/advertisement_batch/strategy/group");

