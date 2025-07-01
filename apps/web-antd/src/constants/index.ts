import {PlatformEnum} from "#/constants/locales";
import {KUAISHOU_PAY_METHOD, ORDER_STATUS_MAP} from "#/constants/kuaishou";
import {$t} from "@vben/locales";
import {h} from "vue";
import {Tag} from "ant-design-vue";
import {ConstantTypeEnum} from "@vben/constants";
import {
  BILIBILI_ORDER_STATUS_MAP,
  BILIBILI_ORDER_TYPE,
  BILIBILI_PAY_METHOD_MAP
} from "#/constants/bilibili";

export * from './kuaishou';
export * from './locales';
export * from './bilibili';


/**
 * order type
 * @param platform
 * @param order_type
 */
export function getOrderType(platform: string, order_type: number) {
  let orderTypeMap: Map<number, { label: string; value: number, color: string }>;
  if (platform === PlatformEnum.KUAISHOU) {
    orderTypeMap = new Map<number, { label: string; value: number; color: string }>();
  } else if (platform === PlatformEnum.Bilibili) {
    orderTypeMap = BILIBILI_ORDER_TYPE;
  } else {
    orderTypeMap = new Map<number, { label: string; value: number; color: string }>();
  }

  if (!orderTypeMap.has(order_type)) {
    return h(Tag, {color: 'red'}, () => '未知')
  }
  const {label, _, color} = orderTypeMap.get(order_type);
  const labelName: string = $t(label);
  return h(Tag, {color: color}, () => labelName);
}

/**
 * 订单状态
 * @param platform
 * @param status
 */
export function getOrderStatusTag(platform: string, status: number) {
  let orderStatusMap: Map<number, { label: string; value: number, color: string }>;
  if (platform === PlatformEnum.KUAISHOU) {
    orderStatusMap = ORDER_STATUS_MAP;
  } else if (platform === PlatformEnum.Bilibili) {
    orderStatusMap = BILIBILI_ORDER_STATUS_MAP;
  } else {
    orderStatusMap = new Map<number, { label: string; value: number; color: string }>();
  }
  if (!orderStatusMap.has(status)) {
    return h(Tag, {color: 'red'}, () => '未知');
  }
  const {label, _, color} = orderStatusMap.get(status);
  const labelName: string = $t(label);
  return h(Tag, {color: color}, () => labelName);
}


/**
 * pay method
 * @param platform
 * @param payType
 */
export function getPayMethodTag(platform: string, payType: number) {
  let payMethodMap: Map<number, { label: string; value: number, color: string }>;
  if (platform === PlatformEnum.KUAISHOU) {
    payMethodMap = KUAISHOU_PAY_METHOD;
  } else if (platform === PlatformEnum.Bilibili) {
    payMethodMap = BILIBILI_PAY_METHOD_MAP;
  } else {
    payMethodMap = new Map<number, { label: string; value: number; color: string }>();
  }

  if (!payMethodMap.has(payType)) {
    return h(Tag, {color: 'red'}, () => '未知')
  }
  const {label, _, color} = payMethodMap.get(payType);
  const labelName: string = $t(label);
  return h(Tag, {color: color}, () => labelName);
}

/**
 * platform
 * @param platform
 */
export function getPlatformTag(platform: string) {
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
  return h(Tag, {color: color}, () => $t(`core.platform.${platform}`));
}


/**
 * 退货单类型
 * @param platform
 * @param returnType
 */
export function getReturnType(platform: string, returnType: number) {
  let color = 'red';
  let text = '未知';
  if (platform === PlatformEnum.Bilibili) {
    switch (returnType) {
      case ConstantTypeEnum.COMMON_ZERO: {
        color = "red";
        text = "无需退款"
        break;
      }
      case ConstantTypeEnum.COMMON_ONE: {
        color = "green";
        text = "原路退款"
        break;
      }
      case ConstantTypeEnum.COMMON_TWO: {
        color = "orange";
        text = "线下退款"
        break;
      }
    }
  }
  return h(Tag, {color: color}, () => $t(text));
}

/**
 * 推广方式
 * @param platform
 * @param handlingWay 退款方式
 */
export function getHandlerType(platform: string, handlingWay: number) {
  let color = 'red';
  let text = '未知';

  if (platform === PlatformEnum.Bilibili) {
    switch (handlingWay) {
      case ConstantTypeEnum.COMMON_ONE: {
        color = "red";
        text = "仅退款"
        break;
      }
      case ConstantTypeEnum.COMMON_TWO: {
        color = "green";
        text = "退货退"
        break;
      }
      case ConstantTypeEnum.COMMON_THREE: {
        color = "orange";
        text = "换货"
        break;
      }
    }
  }
  return h(Tag, {color: color}, () => $t(text));
}


/**
 * 退货单状态
 * @param platform
 * @param returnStatus 退款方式
 */
export function getReturnStatus(platform: string, returnStatus: number) {
  let color = 'red';
  let text = '未知';

  if (platform === PlatformEnum.Bilibili) {
    switch (returnStatus) {
      case ConstantTypeEnum.COMMON_ZERO: {
        color = "blue";
        text = "无退款"
        break;
      }
      case ConstantTypeEnum.COMMON_ONE: {
        color = "red";
        text = "仅退款"
        break;
      }
      case ConstantTypeEnum.COMMON_TWO: {
        color = "green";
        text = "退货退"
        break;
      }
      case ConstantTypeEnum.COMMON_THREE: {
        color = "orange";
        text = "换货"
        break;
      }
      case ConstantTypeEnum.COMMON_FOUR: {
        color = "purple";
        text = "退款失败"
        break;
      }
    }
  }
  return h(Tag, {color: color}, () => $t(text));
}


/**
 * 获取协商状态
 * @param platform
 * @param negotiateStatus
 */
export function getNegotiateStatus(platform: string, negotiateStatus: number) {
  let color = 'red';
  let text = '未知';
  if (platform === PlatformEnum.Bilibili) {
    switch (negotiateStatus) {
      case ConstantTypeEnum.COMMON_ONE: {
        color = "blue";
        text = "申请退款"
        break;
      }
      case ConstantTypeEnum.COMMON_TWO: {
        color = "green";
        text = "取消退款申请"
        break;
      }
      case ConstantTypeEnum.COMMON_THREE: {
        color = "orange";
        text = "拒绝退款申请"
        break;
      }
      case 11: {
        color = "red";
        text = "申请退货退款"
        break;
      }
      case 12: {
        color = "purple";
        text = "取消退货退款申请"
        break;
      }
      case 13: {
        color = "red";
        text = "拒绝退货退款申请"
        break;
      }
      case 14: {
        color = "green";
        text = "待用户提交物流"
        break;
      }
      case 15: {
        color = "orange";
        text = "待商家确认收货"
        break;
      }
      case 21: {
        color = "red";
        text = "申请换货"
        break;
      }
      case 22: {
        color = "purple";
        text = "取消换货申请"
        break;
      }
      case 23: {
        color = "red";
        text = "拒绝换货申请";
        break;
      }
      case 24: {
        color = "green";
        text = "换货待商家发货"
        break;
      }
      case 25: {
        color = "orange";
        text = "换货发货"
        break;
      }
      case 60: {
        color = "red";
        text = "售后完成"
        break;
      }
      case 61: {
        color = "red";
        text = "售后终止"
        break;
      }
    }
  }
  return h(Tag, {color: color}, () => $t(text));
}
