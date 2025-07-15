import type {MediaItemDetailResponse} from "#/api/models";

/**
 * item
 */
export interface RedNoteItem {
  itemId: string;
  name: string;
  itemShortTitle: string;
  ename: string;
  brandId: number;
  categoryId: string;
  attributes: Array<{
    propertyId: string;
    name: string;
    value: string;
    valueId: string;
    valueList: Array<{
      valueId: string;
      value: string;
    }>
  }>;
  shippingTemplateId: string;
  shippingGrossWeight: number;
  variantIds: Array<string>;
  images: Array<string>;
  videoUrl: string;
  articleNo: string;
  imageDescriptions: Array<string>;
  transparentImage: string;
  description: string;
  faq: Array<{
    question: string;
    answer: string;
  }>;
  isChannel: boolean;
  deliveryMode: number;
  freeReturn: number;
  enableMultiWarehouse: boolean;
  createTime: string;
  updateTime: string;
  sizeTableImage: string;
  recommendSizeTableImage: string;
  modelTryOnSizeTableImage: string;
  enableMainSpecImage: boolean;
  mainSpecId: string;
  enableStepPresale: boolean;
}


export interface RedNoteItemSku {
  skuId: string;
  name: string;
  itemId: string;
  ipq: number;
  originalPrice: number;  // BigDecimal 转换为 number
  price: number;          // BigDecimal 转换为 number
  stock: number;
  logisticsPlanId: string;
  whcode: string;
  priceType: number;
  erpCode: string;
  variants: Array<{
    id: string;
    name: string;
    value: string;
    valueId: string;
  }>;
  deliveryTime: {
    time: string;
    type: string;
  };
  specImage: string;
  barcode: string;
  rowNumber: number;
  logisticsName: string;
  buyable: boolean;
  updateTime: Date;
  createTime: Date;
  isGift: boolean;
  deliveryFlag: number;
  unionItemDetails: Array<{
    id: string;
    name: string;
    scSkuCode: string;
    barcode: string;
    ipq: number;
    erpCode: string;
    ratio: number;
  }>;
}


/**
 * red note item detail response
 */
export interface RedNoteItemDetailResponse extends MediaItemDetailResponse<RedNoteItem, RedNoteItemSku> {}
