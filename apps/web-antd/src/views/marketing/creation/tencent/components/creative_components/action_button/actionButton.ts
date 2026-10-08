import type { CreativeComponentState } from "../types";

/**
 * 行动按钮组件（creative_components.action_button）
 * 独立成一个模块：UI 见 ActionButtonComponent.vue，这里放它与表单对接的部分（类型、默认值、表单元素）。
 */
import type { AccountInfo } from "#/views/marketing/creation/creation";

import { markRaw } from "vue";

import { RuleMethod } from "#/views/marketing/creation/creation_enums";

import ActionButtonComponent from "./ActionButtonComponent.vue";

/** 行动按钮组件的内容，对应 creative_components.action_button[].value */
export interface TencentActionButtonValue {
  /** 按钮文案，对应 button_text，最长 100 字节 */
  button_text?: string;
  /**
   * 小程序按钮文案，对应 mini_program_button_text，最长 100 字节
   * 落地页为微信小程序时用这个（本模板的落地页就是微信小程序）
   */
  mini_program_button_text?: string;
  /**
   * 落地页内容结构，对应 jump_info
   * 是单独的 jump_info 结构（与 creative_components.main_jump_info 同源），本次不做配置，留空即可
   */
  jump_info?: Record<string, any>;
}

/** 默认状态：未开启、全部相同、没有配置 */
export function createActionButtonState(): CreativeComponentState<TencentActionButtonValue> {
  return { enabled: false, method: RuleMethod.ALL, data: {} };
}

/**
 * 行动按钮组件的表单元素
 * @param getAccountInfo 账户列表的取值函数：账户是异步选择的，用函数拿保证面板里始终是最新列表
 */
export function actionButtonField(getAccountInfo: () => AccountInfo[]) {
  return {
    component: markRaw(ActionButtonComponent),
    fieldName: "action_button_config",
    label: "",
    formItemClass: "w-full max-w-[860px]",
    defaultValue: createActionButtonState(),
    componentProps: () => ({ accountInfo: getAccountInfo() })
  };
}
