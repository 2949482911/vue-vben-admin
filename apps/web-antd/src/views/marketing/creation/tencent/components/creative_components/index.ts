/**
 * 创意组件（腾讯 dynamic_creatives/add 的 creative_components）
 *
 * 每个组件独立成一个文件夹：<组件>/<Xxx>Component.vue 是 UI，<x>.ts 是它和表单对接的部分
 * （类型、默认值、表单元素），新增组件只需在这里补一行导出，模板里展开即可。
 */
import { h } from "vue";

export { actionButtonField, createActionButtonState } from "./action_button/actionButton";
export type { TencentActionButtonValue } from "./action_button/actionButton";
export { brandField, createBrandState } from "./brand/brand";
export type { TencentBrandValue } from "./brand/brand";
export {
  createFloatingZoneState,
  DEFAULT_FLOATING_ZONE_INFO_TYPE,
  DEFAULT_FLOATING_ZONE_TYPE,
  FLOATING_ZONE_SINGLE_IMAGE_TYPE,
  floatingZoneField
} from "./floating_zone/floatingZone";
export type { TencentFloatingZoneValue } from "./floating_zone/floatingZone";
export { createLabelState, labelField } from "./label/label";
export type { TencentLabelItem, TencentLabelValue } from "./label/label";
export { ALL_ACCOUNT_KEY } from "./types";
export type { CreativeComponentState, CreativeMaterialImage } from "./types";

/**
 * 表单里的横线分组
 * 用来把「创意组件」与广告自身字段隔开，写法与 vivo2.0 定向表单一致
 */
export function dividerField(fieldName: string, title: string) {
  return {
    component: "Divider",
    fieldName,
    label: "",
    renderComponentContent: () => ({
      default: () => h("span", title)
    })
  };
}
