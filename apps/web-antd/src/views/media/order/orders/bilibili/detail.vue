<script setup lang="ts" name="BilibiliOrderDetail">
import {useVbenModal} from '@vben/common-ui';
import {h, ref} from "vue";
import {$t} from "@vben/locales";
import {Card, Descriptions, Divider, Spin, Tag} from "ant-design-vue";
import type {OrderDetailRequest} from "#/api/models";
import {orderApi} from "#/api/media";
import type {BilibiliOrderDetail, BilibiliOrderSku} from "#/api/models/media/bilibili/orders";
import {useVbenVxeGrid, type VxeGridProps} from "#/adapter/vxe-table";
import {ConstantTypeEnum} from "@vben/constants";
import {getOrderStatusTag, getOrderType, getPayMethodTag, PlatformEnum} from "#/constants";
import {formatDateTime} from "@vben/utils";


const title: string = `${$t('action.info')}`;

const orderDetailRequest = ref<OrderDetailRequest>();
const orderDetail = ref<BilibiliOrderDetail>();
const spinning = ref<Boolean>(false);

function isComment(is_comment: number) {
  if (is_comment === 1) {
    return h(Tag, {color: 'green'}, () => $t('common.yes'))
  } else {
    return h(Tag, {color: 'red'}, () => $t('common.no'))
  }
}


function goodsType(goods_type: number) {
  let color: string;
  let label: string;
  switch (goods_type) {
    case ConstantTypeEnum.COMMON_ZERO:
      color = 'green';
      label = $t('media.order.bilibili.goods_type.one');
      break;
    case ConstantTypeEnum.COMMON_ONE:
      color = 'blue';
      label = $t('media.order.bilibili.goods_type.two');
      break;
    case ConstantTypeEnum.COMMON_TWO:
      color = 'red';
      label = $t('media.order.bilibili.goods_type.three');
      break;
    case ConstantTypeEnum.COMMON_THREE:
      color = 'orange';
      label = $t('media.order.bilibili.goods_type.three');
      break;
    case ConstantTypeEnum.COMMON_FOUR:
      color = 'purple';
      label = $t('media.order.bilibili.goods_type.four');
      break;
  }
  return h(Tag, {color: color}, () => label);
}


function orderType(order_type: number) {
  let color: string;
  let label: string;
  switch (order_type) {
    case ConstantTypeEnum.COMMON_ZERO:
      color = 'green';
      label = '现货订单';
      break;
    case ConstantTypeEnum.COMMON_ONE:
      color = 'blue';
      label = '全款预售订单';
      break;
    case ConstantTypeEnum.COMMON_TWO:
      color = 'red';
      label = '定金预售订单';
      break;
    case ConstantTypeEnum.COMMON_THREE:
      color = 'orange';
      label = '惊喜赏发货订单';
      break;
    case ConstantTypeEnum.COMMON_FOUR:
      color = 'purple';
      label = '惊喜赏抽赏订单';
      break;
    case 5:
      color = 'yellow';
      label = '游戏点卡订单';
      break;
    case 6:
      color = 'blue';
      label = '虚拟订单';
      break;
  }
  return h(Tag, {color: color}, () => label);
}


function shopFlag(shop_flag: number) {
  let color: string;
  let label: string;
  switch (shop_flag) {
    case ConstantTypeEnum.COMMON_ONE:
      color = '';
      label = '灰色';
      break;
    case ConstantTypeEnum.COMMON_TWO:
      color = 'red';
      label = '红色';
      break;
    case ConstantTypeEnum.COMMON_THREE:
      color = 'orange';
      label = '橘色';
      break;
    case ConstantTypeEnum.COMMON_FOUR:
      color = 'green';
      label = '绿色';
      break;
    case 5:
      color = 'blue';
      label = '蓝色';
      break;
    case 6:
      color = 'purple';
      label = '紫色';
      break;
  }
  return h(Tag, {color: color}, () => label);
}

function confirmStatus(confirm_status: number) {
  let color: string;
  let label: string;
  switch (confirm_status) {
    case ConstantTypeEnum.COMMON_ZERO:
      color = 'green';
      label = '待审核';
      break;
    case ConstantTypeEnum.COMMON_ONE:
      color = 'blue';
      label = '审核通过';
      break;
    case ConstantTypeEnum.COMMON_TWO:
      color = 'red';
      label = '审核拒绝(含超时未审核)';
      break;
  }
  return h(Tag, {color: color}, () => label);
}

/**
 * 收货类型
 * @param receiveType
 */
function receiveType(receiveType: number) {
  let color: string;
  let label: string;
  switch (receiveType) {
    case ConstantTypeEnum.COMMON_ONE:
      color = 'red';
      label = '邮寄';
      break;
    case ConstantTypeEnum.COMMON_TWO:
      color = 'blue';
      label = '自提';
      break;
  }
  return h(Tag, {color: color}, () => label);
}

const gridOptions: VxeGridProps<BilibiliOrderSku> = {
  border: true,
  columns: [
    {title: "序号", type: "seq", width: 50, type: "checkbox", width: 100},
    {
      field: "order_id",
      title: `${$t("media.order.bilibili.sku_columns.order_id")}`,
      width: "auto",
    },
    {
      field: "parent_order_id",
      title: `${$t("media.order.bilibili.sku_columns.parent_order_id")}`,
      width: "auto",

    },
    {
      field: "sku_id",
      title: `${$t("media.order.bilibili.sku_columns.sku_id")}`,
      width: "auto",

    },
    {
      field: "cate_id",
      title: `${$t("media.order.bilibili.sku_columns.cate_id")}`,
      width: "auto",

    },
    {
      field: "goods_price",
      title: `${$t("media.order.bilibili.sku_columns.goods_price")}`,
      width: "auto",

    },
    {
      field: "order_level",
      title: `${$t("media.order.bilibili.sku_columns.order_level")}`,
      width: "auto",

    },
    {
      field: "order_type",
      title: `${$t("media.order.bilibili.sku_columns.order_type")}`,
      width: "auto",
      slots: {default: 'order_type'}
    },
    {
      field: "order_status",
      title: `${$t("media.order.bilibili.sku_columns.order_status")}`,
      width: "auto",
      slots: {default: 'order_status'}
    },
    {
      field: "pay_time",
      title: `${$t("media.order.bilibili.sku_columns.pay_time")}`,
      width: "auto",
      formatter: 'formatDateTime',

    },
    {
      field: "finish_time",
      title: `${$t("media.order.bilibili.sku_columns.finish_time")}`,
      width: "auto",
      formatter: 'formatDateTime',

    },
    {
      field: "update_time",
      title: `${$t("media.order.bilibili.sku_columns.update_time")}`,
      width: "auto",
      formatter: 'formatDateTime',

    },
    {
      field: "cancel_reason",
      title: `${$t("media.order.bilibili.sku_columns.cancel_reason")}`,
      width: "auto",

    },
    {
      field: "author_id",
      title: `${$t("media.order.bilibili.sku_columns.author_id")}`,
      width: "auto",

    },
    {
      field: "author_name",
      title: `${$t("media.order.bilibili.sku_columns.author_name")}`,
      width: "auto",

    }, {
      field: "promotion_amount",
      title: `${$t("media.order.bilibili.sku_columns.promotion_amount")}`,
      width: "auto",

    }, {
      field: "exp_ship_time",
      title: `${$t("media.order.bilibili.sku_columns.exp_ship_time")}`,
      width: "auto",
      formatter: 'formatDateTime',

    }, {
      field: "goods_type",
      title: `${$t("media.order.bilibili.sku_columns.goods_type")}`,
      width: "auto",
      slots: {default: 'goods_type'},
    }, {
      field: "product_id",
      title: `${$t("media.order.bilibili.sku_columns.product_id")}`,
      width: "auto",

    }, {
      field: "origin_amount",
      title: `${$t("media.order.bilibili.sku_columns.origin_amount")}`,
      width: "auto",

    }, {
      field: "item_num",
      title: `${$t("media.order.bilibili.sku_columns.item_num")}`,
      width: "auto",

    }, {
      field: "sum_amount",
      title: `${$t("media.order.bilibili.sku_columns.sum_amount")}`,
      width: "auto",

    }, {
      field: "product_pic",
      title: `${$t("media.order.bilibili.sku_columns.product_pic")}`,
      width: "auto",

    }, {
      field: "is_comment",
      title: `${$t("media.order.bilibili.sku_columns.is_comment")}`,
      width: "auto",
      slots: {default: 'is_comment'},
    },
    {
      field: "product_id_str",
      title: `${$t("media.order.bilibili.sku_columns.product_id_str")}`,
      width: "auto",

    },
    {
      field: "product_name",
      title: `${$t("media.order.bilibili.sku_columns.product_name")}`,
      width: "auto",

    }, {
      field: "post_amount",
      title: `${$t("media.order.bilibili.sku_columns.post_amount")}`,
      width: "auto",

    }, {
      field: "after_sale_info",
      title: `${$t("media.order.bilibili.sku_columns.after_sale_info")}`,
      width: "auto",

    }, {
      field: "relation_order",
      title: `${$t("media.order.bilibili.sku_columns.relation_order")}`,
      width: "auto",

    }, {
      field: "receive_type",
      title: `${$t("media.order.bilibili.sku_columns.receive_type")}`,
      width: "auto",
      slots: {default: 'receive_type'}
    }, {
      field: "account_list",
      title: `${$t("media.order.bilibili.sku_columns.account_list")}`,
      width: "auto",

    }, {
      field: "tax_amount",
      title: `${$t("media.order.bilibili.sku_columns.tax_amount")}`,
      width: "auto",

    }, {
      field: "order_phase_list",
      title: `${$t("media.order.bilibili.sku_columns.order_phase_list")}`,
      width: "auto",

    }, {
      field: "shop_code",
      title: `${$t("media.order.bilibili.sku_columns.shop_code")}`,
      width: "auto",
    },
  ],
  pagerConfig: {
    enabled: false
  },
  height: 'auto',
  data: [],
  sortConfig: {
    multiple: true
  },
  pagerConfig: {
    enabled: false,
  },
  scrollY: {
    enabled: true,
    gt: 0,
  },
  proxyConfig: {
    enabled: false,
    autoLoad: false
  },
  showOverflow: true,
};
const [Grid, gridApi] = useVbenVxeGrid({gridOptions});


const [Modal, modalApi] = useVbenModal({
  fullscreen: true,
  fullscreenButton: false,
  onCancel() {
    modalApi.close();
    init();
  },
  onConfirm() {
    modalApi.close();
    init();
  },
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      spinning.value = true;
      orderDetailRequest.value = modalApi.getData<Record<string, any>>();
      await getOrderDetail();
    }
  },
});

async function getOrderDetail() {
  gridApi.setLoading(true)

  orderDetail.value = await orderApi.fetchOrderDetail(
    orderDetailRequest.value.platform,
    orderDetailRequest.value.platformOrderId,
    orderDetailRequest.value.localAccountId
  );

  // await formApi.setValues(orderDetail.value.order);
  gridApi.setGridOptions({data: orderDetail.value.skus})
  gridApi.setLoading(false)
  spinning.value = false;
}


function init() {
  orderDetail.value = {};
  spinning.value = false;
}


</script>

<template>
  <Modal :title="title">
    <Card :title="`${$t('action.basis')}`" :bordered="false">
      <Spin :spinning="spinning" tip="loading...">
        <!--        <Form></Form>-->
        <Descriptions title="基础信息">

          <Descriptions.Item :label="$t('media.order.bilibili.columns.order_id')">
            {{ orderDetail?.order?.order_id }}
          </Descriptions.Item>

          <Descriptions.Item :label="$t('media.order.bilibili.columns.order_level')">
            {{ orderDetail?.order?.order_level }}
          </Descriptions.Item>

          <Descriptions.Item :label="$t('media.order.bilibili.columns.order_type')">
            <component
              :is="getOrderType(PlatformEnum.Bilibili, orderDetail?.order?.order_type)"></component>
          </Descriptions.Item>

          <Descriptions.Item :label="$t('media.order.bilibili.columns.order_status')">
            <component
              :is="getOrderStatusTag(PlatformEnum.Bilibili, orderDetail?.order?.order_status)"></component>
          </Descriptions.Item>

          <Descriptions.Item :label="$t('media.order.bilibili.columns.pay_type')">
            <component
              :is="getPayMethodTag(PlatformEnum.Bilibili, orderDetail?.order?.order_status)"></component>
          </Descriptions.Item>

          <Descriptions.Item :label="$t('media.order.bilibili.columns.shop_flag')">
            <component :is="shopFlag(orderDetail?.order?.shop_flag)"></component>
          </Descriptions.Item>


          <Descriptions.Item :label="$t('media.order.bilibili.columns.channel_payment_no')">
            {{ orderDetail?.order?.channel_payment_no }}
          </Descriptions.Item>

          <Descriptions.Item :label="$t('media.order.bilibili.columns.cancel_reason')">
            {{ orderDetail?.order?.cancel_reason }}
          </Descriptions.Item>

          <Descriptions.Item :label="$t('media.order.bilibili.columns.buyer_remark')">
            {{ orderDetail?.order?.buyer_words }}
          </Descriptions.Item>

          <Descriptions.Item :label="$t('media.order.bilibili.columns.confirm_status')">
            <component :is="confirmStatus(orderDetail?.order?.confirm_status)"></component>
          </Descriptions.Item>
        </Descriptions>

        <Divider/>

        <Descriptions title="时间信息">
          <Descriptions.Item :label="$t('media.order.bilibili.columns.create_time')">
            {{ formatDateTime(orderDetail?.order?.create_time) }}
          </Descriptions.Item>
          <Descriptions.Item :label="$t('media.order.bilibili.columns.update_time')">
            {{ formatDateTime(orderDetail?.order?.update_time) }}
          </Descriptions.Item>
          <Descriptions.Item :label="$t('media.order.bilibili.columns.finish_time')">
            {{ formatDateTime(orderDetail?.order?.finish_time) }}
          </Descriptions.Item>
          <Descriptions.Item :label="$t('media.order.bilibili.columns.pay_time')">
            {{ formatDateTime(orderDetail?.order?.pay_time) }}
          </Descriptions.Item>
          <Descriptions.Item :label="$t('media.order.bilibili.columns.ship_time')">
            {{ formatDateTime(orderDetail?.order?.ship_time) }}
          </Descriptions.Item>
        </Descriptions>

        <Divider/>

        <Descriptions title="金额信息">
          <Descriptions.Item :label="$t('media.order.bilibili.columns.promotion_amount')">
            {{ orderDetail?.order?.promotion_amount }}
          </Descriptions.Item>
          <Descriptions.Item :label="$t('media.order.bilibili.columns.modify_amount')">
            {{ orderDetail?.order?.origin_amount }}
          </Descriptions.Item>
          <Descriptions.Item :label="$t('media.order.bilibili.columns.pay_amount')">
            {{ orderDetail?.order?.pay_amount }}
          </Descriptions.Item>
          <Descriptions.Item :label="$t('media.order.bilibili.columns.post_amount')">
            {{ orderDetail?.order?.post_amount }}
          </Descriptions.Item>
          <Descriptions.Item :label="$t('media.order.bilibili.columns.tax_amount')">
            {{ orderDetail?.order?.tax_amount }}
          </Descriptions.Item>
          <Descriptions.Item :label="$t('media.order.bilibili.columns.order_amount')">
            {{ orderDetail?.order?.order_amount }}
          </Descriptions.Item>
          <Descriptions.Item :label="$t('media.order.bilibili.columns.post_origin_amount')">
            {{ orderDetail?.order?.post_origin_amount }}
          </Descriptions.Item>
        </Descriptions>

        <Divider/>

        <Descriptions title="订单阶段">

        </Descriptions>

        <Descriptions title="收货信息">

          <Descriptions.Item :label="$t('media.order.bilibili.columns.open_id')">
            {{ orderDetail?.order?.open_id }}
          </Descriptions.Item>

          <Descriptions.Item :label="$t('media.order.bilibili.columns.uname')">
            {{ orderDetail?.order?.uname }}
          </Descriptions.Item>

          <Descriptions.Item :label="$t('media.order.bilibili.columns.post_tel')">
            {{ orderDetail?.order?.post_tel }}
          </Descriptions.Item>

          <Descriptions.Item :label="$t('media.order.bilibili.columns.post_receiver')">
            {{ orderDetail?.order?.post_receiver }}
          </Descriptions.Item>

          <Descriptions.Item :label="$t('media.order.bilibili.columns.post_addr')">
            {{ orderDetail?.order?.post_addr?.city?.name }}
            {{ orderDetail?.order?.post_addr?.province?.name }}
            {{ orderDetail?.order?.post_addr?.town?.name }}
            {{ orderDetail?.order?.post_addr?.detail }}
          </Descriptions.Item>

        </Descriptions>
      </Spin>
    </Card>
    <Divider/>
    <Card :bordered="false">
      <Grid>

        <template #is_comment="{row}">
          <component :is="isComment(row.is_comment)"></component>
        </template>

        <template #goods_type="{row}">
          <component :is="goodsType(row.goods_type)"></component>
        </template>

        <template #order_type="{row}">
          <component :is="orderType(row.order_type)"></component>
        </template>

        <template #order_status="{row}">
          <component :is="getOrderStatusTag(PlatformEnum.Bilibili, row.order_status)"></component>
        </template>

        <template #receive_type="{row}">
          <component :is="receiveType(row.receive_type)"></component>
        </template>
      </Grid>
    </Card>
  </Modal>
</template>

<style scoped>

</style>
