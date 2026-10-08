import type { CreativeComponentState, CreativeMaterialImage } from "../types";

/**
 * 品牌形象组件（creative_components.brand）
 * 独立成一个模块：UI 见 BrandComponent.vue，这里放它与表单对接的部分（类型、默认值、表单元素）。
 */
import type { AccountInfo } from "#/views/marketing/creation/creation";

import { markRaw } from "vue";

import { RuleMethod } from "#/views/marketing/creation/creation_enums";

import BrandComponent from "./BrandComponent.vue";

/** 品牌形象组件的内容，对应 creative_components.brand[].value */
export interface TencentBrandValue {
  /** 品牌名称，对应 brand_name */
  brand_name: string;
  /**
   * 已选品牌图片的本地素材 id，提交时作为 brand[].materialIdsList
   * 由后端上传到腾讯并回填 brand_image_id，前端不直接传 brand_image_id
   */
  materialIdsList: string[];
  /** 已选图片的名称与地址，只用来在表单里回显缩略图 */
  materials?: CreativeMaterialImage[];
}

/** 默认状态：未开启、全部相同、没有配置 */
export function createBrandState(): CreativeComponentState<TencentBrandValue> {
  return { enabled: false, method: RuleMethod.ALL, data: {} };
}

/**
 * 品牌形象组件的表单元素
 * 一个字段承载整个组件（开关 / 分配方式 / 按账户的配置都在组件内部），模板里展开一行即可，
 * 抽屉也不用为它做平铺-还原。
 * @param getAccountInfo 账户列表的取值函数：账户是异步选择的，用函数拿保证面板里始终是最新列表
 */
export function brandField(getAccountInfo: () => AccountInfo[]) {
  return {
    component: markRaw(BrandComponent),
    fieldName: "brand_config",
    label: "",
    formItemClass: "w-full max-w-[860px]",
    defaultValue: createBrandState(),
    componentProps: () => ({ accountInfo: getAccountInfo() })
  };
}
