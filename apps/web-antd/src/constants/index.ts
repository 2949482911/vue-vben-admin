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
  }else {
    orderStatusMap = new Map<number, {label: string; value: number; color: string}>();
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
  }else {
    payMethodMap = new Map<number, {label: string; value: number; color: string}>();
  }

  if (!payMethodMap.has(payType)) {
    return h(Tag, {color: 'red'},() => '未知')
  }
  const {label, _, color} = payMethodMap.get(payType);
  const labelName: string = $t(label);
  return h(Tag, {color: color},() => labelName);
}

export function getPlatformTag(platform: str) {
  let color;
  if (platform === PlatformEnum.KUAISHOU) {
    color = 'green';
  }
  if (platform === PlatformEnum.DOUYIN) {
    color = 'orange';
  }
  if (platform === PlatformEnum.Bilibili) {
    color = 'purple';
  }
  if (platform === PlatformEnum.RedNote) {
    color = 'red';
  }
  return h(Tag, {color: color},() => $t(`core.platform.${platform}`));
}
