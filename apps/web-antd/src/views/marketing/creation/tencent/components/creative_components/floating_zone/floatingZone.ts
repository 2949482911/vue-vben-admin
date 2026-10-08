import type { CreativeComponentState, CreativeMaterialImage } from "../types";

/**
 * 浮层卡片组件（creative_components.floating_zone）
 * 独立成一个模块：UI 见 FloatingZoneComponent.vue，这里放它与表单对接的部分（类型、默认值、表单元素）。
 *
 * 版面包含视频号时，必须带浮层卡片或多卡轮播组件，创意才能在视频号版位正常播放。
 */
import type { AccountInfo } from "#/views/marketing/creation/creation";

import { markRaw } from "vue";

import { RuleMethod } from "#/views/marketing/creation/creation_enums";

import FloatingZoneComponent from "./FloatingZoneComponent.vue";

/** 默认浮层卡片类型：图文浮层 */
export const DEFAULT_FLOATING_ZONE_TYPE = "FLOATING_ZONE_TYPE_IMAGE_TEXT";
/** 默认浮层卡片外显类型 */
export const DEFAULT_FLOATING_ZONE_INFO_TYPE = "FLOATING_ZONE_INFO_DEFAULT";
/** 单图浮层：图片用 floating_zone_single_image_id（482*270），其余类型用 floating_zone_image_id（512*512） */
export const FLOATING_ZONE_SINGLE_IMAGE_TYPE =
  "FLOATING_ZONE_TYPE_SINGLE_IMAGE";

/** 浮层卡片组件的内容，对应 creative_components.floating_zone[].value */
export interface TencentFloatingZoneValue {
  /** 浮层卡片类型，对应 floating_zone_type */
  floating_zone_type: string;
  /** 浮层卡片外显类型，对应 floating_zone_info_type */
  floating_zone_info_type: string;
  /** 文案一，对应 floating_zone_name，最多 10 等宽字符 */
  floating_zone_name: string;
  /** 文案二，对应 floating_zone_desc，最多 14 等宽字符 */
  floating_zone_desc: string;
  /** 按钮文案，对应 floating_zone_button_text，最多 10 等宽字符 */
  floating_zone_button_text: string;
  /** 视频号基础态文案，对应 button_base_text，最多 10 字节 */
  button_base_text: string;
  /** 显示已下载人数及评分，对应 floating_zone_show_app_property_switch（仅应用下载类营销） */
  floating_zone_show_app_property_switch: boolean;
  /**
   * 已选浮层图片的本地素材 id，提交时作为 floating_zone[].materialIdsList
   * 由后端上传到腾讯并回填 *_image_id（按 floating_zone_type 决定填哪个字段），前端不直接传图片 id
   */
  materialIdsList: string[];
  /** 已选图片的名称与地址，只用来在表单里回显缩略图 */
  materials?: CreativeMaterialImage[];
}

/** 默认状态：未开启、全部相同、没有配置 */
export function createFloatingZoneState(): CreativeComponentState<TencentFloatingZoneValue> {
  return { enabled: false, method: RuleMethod.ALL, data: {} };
}

/**
 * 浮层卡片组件的表单元素
 * @param getAccountInfo 账户列表的取值函数：账户是异步选择的，用函数拿保证面板里始终是最新列表
 */
export function floatingZoneField(getAccountInfo: () => AccountInfo[]) {
  return {
    component: markRaw(FloatingZoneComponent),
    fieldName: "floating_zone_config",
    label: "",
    formItemClass: "w-full max-w-[860px]",
    defaultValue: createFloatingZoneState(),
    componentProps: () => ({ accountInfo: getAccountInfo() })
  };
}
