export interface OpenApiServicePromise {
  freshRotRefund: boolean; // 新鲜度/腐烂退款
  brokenRefund: boolean; // 损坏退款
  allergyRefund: boolean; // 过敏退款
  crabRefund: boolean; // 螃蟹退款
  weightGuarantee: boolean; // 重量保证
}

export interface OpenApiTimeRange {
  startTime: string;
  endTime: string;
}

export interface OpenApiUnavailableTimeRule {
  weeks: number[];
  holidays: number[];
  timeRanges: OpenApiTimeRange[];
}

export interface CustomerInfo {
  customerInfoType: string;
  customerCertificateType: string[];
}

export interface ServiceRuleNewDTO {
  refundRule: string; // 退款规则
  theDayOfDeliverGoodsTime: number; // 发货当天的时间
  promiseDeliveryTime: number; // 承诺发货时间
  servicePromise: OpenApiServicePromise; // 服务承诺
  unavailableTimeRule: OpenApiUnavailableTimeRule; // 不可用时间规则
  certMerchantCode: string; // 认证商家代码
  deliveryMethod: string; // 发货方式
  certExpireType: number; // 认证过期类型
  certStartTime: number; // 认证开始时间
  certEndTime: number; // 认证结束时间
  certExpDays: number; // 认证有效期天数
  orderPurchaseLimitType: number; // 订单购买限制类型
  minOrderCount: number; // 最小订单数量
  maxOrderCount: number; // 最大订单数量
  customerInfo: CustomerInfo; // 客户信息
  priceProtectDays: number; // 价格保护天数
  deliveryTimeMode: string; // 发货时间模式
}


export interface CategoryPropValueParam {
  propValueId: string;
  propValue: string;
}

export interface DatetimeRangeParam {
  startTimeTimestamp: string;
  endTimeTimestamp: string;
}

export interface ItemPropValueParam {
  propId: number; // 属性ID
  radioPropValue: CategoryPropValueParam; // 单选属性值
  checkBoxPropValuesList: CategoryPropValueParam[]; // 多选属性值列表
  textPropValue: string; // 文本属性值
  datetimeTimestamp: number; // 日期时间时间戳
  dateRange: DatetimeRangeParam; // 日期范围
  sortNum: number; // 排序号
  imagePropValues: string[]; // 图片属性值列表
  propName: string; // 属性名称
  propAlias: string; // 属性别名
  inputType: number; // 输入类型
  propType: number; // 属性类型
  unitPropValueId: number; // 单位属性值ID
  unitPropValueName: string; // 单位属性值名称
}

export interface UserQualificationItemDTO {
  qualificationDataId: number; // 资质数据ID
  certification: string; // 认证信息
  qualificationFiles: string[]; // 资质文件列表
  validDateStart: string; // 有效期开始日期
  validDateEnd: string; // 有效期结束日期
  auditTime: string; // 审核时间
  relatedItemCount: number; // 关联商品数量
  remark: string; // 备注
  detailPageUrl: string; // 详情页URL
  qualificationMetaName: string; // 资质元数据名称
  qualificationMetaId: number; // 资质元数据ID
}

export interface MealDetailDTO {
  mealGroupDTOList: MealGroupDTO[];
  lowestPeopleNum: number;
  highestPeopleNum: number;
  remark: string;
}

export interface OpenapiSkuPropMeasureValueProto {
  type: string; // 类型
  value: string; // 值
  unitValueId: number; // 单位值ID
  unitValueName: string; // 单位值名称
}

export interface OpenapiSkuPropMeasureProto {
  templateId: string;
  value: OpenapiSkuPropMeasureValueProto[] // 值对象
}

export interface OpenApiAddSkuPropDTO {
  propName: string; // 属性名称
  propValueName: string; // 属性值名称
  imageUrl: string; // 图片URL
  isMainProp: number; // 是否主属性
  propValueGroupId: number; // 属性值组ID
  propVersion: number; // 属性版本
  propSortNum: number; // 属性排序号
  propValueSortNum: number; // 属性值排序号
  propValueRemarks: string; // 属性值备注
  measureInfo: OpenapiSkuPropMeasureProto; // 测量信息
}

export interface SkuCertificatePropParam {
  condition: string; // 条件
  purchasingChannels: string; // 购买渠道
  batteryEfficiency: string; // 电池效率
  mainBoard: string; // 主板
  batteryCondition: string; // 电池状况
  screenCondition: string; // 屏幕状况
  shellCollision: string; // 机身碰撞
  reportUrl: string; // 报告URL
  qualityInspectionNo: string; // 质量检验编号
  sn: string; // 序列号
  shellScratch: string; // 机身划痕
  shellPaint: string; // 机身喷漆
  deviceSystem: string; // 设备系统
}


export interface MealContentDTO {
  title: string;
  count: number;
  price: number;
}


export interface MealGroupDTO {
  title: string;
  mealContentDTOList: MealContentDTO[],
  fromNum: number;
  selectNum: number;
}

// kuaishou item
export interface KuaishouItemDetail {
  platformItemId: string; // 平台ID
  relItemId: string; // 第三方ID
  platformCategoryId: string; // 商品所属类目id
  platformParentCategoryId: string; // 父级类目id
  platformRootCategoryId: string; // 根类目id
  title: string; // 标题
  details: string; // 描述
  imageUrls: string[]; // 商品图片URL（第一张默认为头图)
  detailImageUrls: string[]; // 图文详情图片
  serviceRule: ServiceRuleNewDTO; // 服务规则
  auditStatus: number; // 审核状态 0待审核 1审核待修改 2审核通过 3审核拒绝
  auditReason: string; // 审核原因
  platformCreatedTime: string; // 创建时间
  platformUpdateTime: string; // 更新时间
  onOfflineStatus: number; // 上下架状态
  itemPropValues: ItemPropValueParam[]; // 商品属性列表
  expressTemplateId: number; // 运费模板ID
  purchaseLimit: boolean; // 是否限购，true:支持限购，false:不支持限购
  limitCount: number; // 限购数量
  linkUrl: string; // 商品链接
  timeOfSale: string; // 商品开售时间，单位：分
  itemRemark: string; // 商品备注
  duplicationStatus: number; // 副本审核状态 0待审核 1审核待修改 2审核通过 3审核拒绝
  duplicationReason: string; // 副本审核原因
  multipleStock: boolean; // ture-货品库存模式；false-商品库存模式
  poiIds: number[]; // 门店ID
  whiteBaseImageUrl: string; // 商品白底图
  transparentImageUrl: string; // 商品透明图
  shortTitle: string; // 商品短标题
  sellingPoint: string; // 商品卖点
  instructions: string; // 使用说明
  contractPhone: boolean; // 是否是合约机商品
  offlineReason: string; // 下架原因
  itemQualification: UserQualificationItemDTO[]; // 商品关联资质数据
  shelfStatus: number; // 上架下架的状态
  shelfStatusUpdateReason: string; // 上架下架状态更新原因
  spuId: number; // 标品ID
}

// 快手sku
export interface KuaishouItemSku {
  platformSkuId: number; // skuID
  platformItemId: number; // 商品ID
  localAccountId: number;
  platformAccountId: number;
  relSkuId: number; // skuID
  skuStock: number; // 库存
  reserveStock: number; // sku预留库存
  imageUrl: string; // sku图片url
  skuSalePrice: number; // Sku 价格，单位为分。1 <= 数值 <=类目配置价格上限
  volume: number; // 已售件数，已废弃
  isValid: boolean; // 是否有效。0 无效 1 有效
  specification: string; // 规格
  skuNick: string; // sku编码，分仓商品必传，SKU编码仅支持中英文、数字以及特殊字符
  skuMarketPrice: number; // 商品划线价
  goodsId: string; // 货品Id，多仓商品支持字段
  goodsCode: string; // 外部货品编码
  gtinCode: string; // sku条形码
  packageCode: string; // 合约机套餐编码
  mealDetail: MealDetailDTO; // 套餐详情，商品类型为团购时，才可使用该字段，非必传
  skuProps: OpenApiAddSkuPropDTO[]; // 套餐详情，商品类型为团购时，才可使用该字段，非必传
  skuCertificate: SkuCertificatePropParam; // 质检参数
}

/**
 * 快手创建商品
 */

// 快手创建商品



export interface OpenApiAddSkuDTO {

}


export interface AddItemPropValue {

}

export interface ServiceRule {

}

export interface QualificationDataDTO {

}



// push item all params
export interface KuaiShouPushItem {
  title: string; // 商品名称
  relItemId: number; // 外部商品ID
  categoryId: number; // 类目ID
  imageUrls: string[]; // 图片URL列表
  skuList: OpenApiAddSkuDTO[]; // SKU信息列表
  purchaseLimit?: boolean; // 是否限购
  limitCount?: number; // 限购数量
  itemPropValues?: AddItemPropValue[]; // 商品属性值
  details: string; // 商品详情
  detailImageUrls: string[]; // 商品详情图URL列表
  stockPartner?: boolean; // 是否使用库存伙伴
  itemRemark?: string; // 商品备注
  serviceRule: ServiceRule; // 服务规则
  expressTemplateId: number; // 运费模板ID
  saleTimeFlag?: boolean; // 是否设置销售时间
  timeOfSale?: number; // 销售时间
  payWay?: number; // 支付方式
  multipleStock?: boolean; // 是否多库存
  poiIds?: number[]; // POI ID列表
  whiteBaseImageUrl?: string; // 白底图URL
  transparentImageUrl?: string; // 透明图URL
  shortTitle?: string; // 短标题
  sellingPoint?: string; // 卖点
  instructions?: string; // 指引
  saveShelfItemQualificationData?: QualificationDataDTO[]; // 资质数据
  offShoreMode?: number; // 海外模式
  spuId?: number; // SPU ID
  itemVideoId?: string; // 商品视频ID
}
