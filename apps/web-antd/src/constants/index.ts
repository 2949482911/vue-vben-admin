import type {OrderItem} from "#/api/models";
import {PlatformEnum} from "#/constants/locales";
import {KUAISHOU_PAY_METHOD, ORDER_STATUS_MAP} from "#/constants/kuaishou";
import {$t} from "@vben/locales";
import {h} from "vue";
import {Tag} from "ant-design-vue";

export * from './kuaishou';
export * from './locales';


export function getOrderStatusTag(platform: string, status: number) {
  let orderStatusMap: Map<number, { label: string; value: number, color: string}>;
  if (platform === PlatformEnum.KUAISHOU) {
    orderStatusMap = ORDER_STATUS_MAP;
  }
  if (!orderStatusMap.has(status)) {
    return h(Tag, {color: 'red'},() => '未知');
  }
  const {label, _, color} = orderStatusMap.get(status);
  const labelName: string = $t(label);
  return h(Tag, {color: color},() => labelName);
}

export function getPayMethodTag(platform: string, payType: number) {
  let payMethodMap: Map<number, { label: string; value: number, color: string}>;
  if (platform === PlatformEnum.KUAISHOU) {
    payMethodMap = KUAISHOU_PAY_METHOD;
  }

  if (!payMethodMap.has(payType)) {
    return h(Tag, {color: 'red'},() => '未知')
  }
  const {label, _, color} = payMethodMap.get(payType);
  const labelName: string = $t(label);
  return h(Tag, {color: color},() => labelName);
}
