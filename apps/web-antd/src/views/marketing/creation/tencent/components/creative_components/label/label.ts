import type { CreativeComponentState } from "../types";

/**
 * 标签组件（creative_components.label）
 * 独立成一个模块：UI 见 LabelComponent.vue，这里放它与表单对接的部分（类型、默认值、表单元素）。
 */
import type { AccountInfo } from "#/views/marketing/creation/creation";

import { markRaw } from "vue";

import { RuleMethod } from "#/views/marketing/creation/creation_enums";

import LabelComponent from "./LabelComponent.vue";

/** 一条标签，对应 value.list 里的一项 */
export interface TencentLabelItem {
  /** 标签内容，对应 content，文本长度限制由创意形式决定 */
  content: string;
  /** 创意标签类型，对应 type，取值见 Tencent_label_type */
  type: string;
  /** 标签显示内容，对应 display_content，最长 100 字节 */
  display_content?: string;
}

/** 标签组件的内容，对应 creative_components.label[].value */
export interface TencentLabelValue {
  /** 标签列表，对应 value.list */
  list: TencentLabelItem[];
}

/** 默认状态：未开启、全部相同、没有配置 */
export function createLabelState(): CreativeComponentState<TencentLabelValue> {
  return { enabled: false, method: RuleMethod.ALL, data: {} };
}

/**
 * 标签组件的表单元素
 * @param getAccountInfo 账户列表的取值函数：账户是异步选择的，用函数拿保证面板里始终是最新列表
 */
export function labelField(getAccountInfo: () => AccountInfo[]) {
  return {
    component: markRaw(LabelComponent),
    fieldName: "label_config",
    label: "",
    formItemClass: "w-full max-w-[860px]",
    defaultValue: createLabelState(),
    componentProps: () => ({ accountInfo: getAccountInfo() })
  };
}
