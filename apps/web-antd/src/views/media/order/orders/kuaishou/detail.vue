<script setup lang="ts" name="KuaiShouOrderDetail">
import {useVbenModal} from '@vben/common-ui';
import {h, ref} from "vue";
import {$t} from "@vben/locales";
import {Card, Descriptions, Divider, Spin, Tag} from "ant-design-vue";
import type {OrderDetailRequest} from "#/api/models";
import {orderApi} from "#/api/media";
import type {
  KuaiShouOrder,
  KuaiShouOrderDetailResponse,
} from "#/api/models/media/kuaishou/order";
import {useVbenVxeGrid, type VxeGridProps} from "#/adapter/vxe-table";
import {ConstantTypeEnum} from "@vben/constants";
import {getOrderStatusTag, PlatformEnum} from "#/constants";
import {dateFormat} from "../../../../../utils";

const title: string = `${$t('action.info')}`;
const orderDetailRequest = ref<OrderDetailRequest>();
const orderDetail = ref<KuaiShouOrderDetailResponse>();
const spinning = ref<Boolean>(false);


function payType(payType: number) {
  let color: string;
  let label: string;
  switch (payType) {
    case ConstantTypeEnum.COMMON_ZERO:
      color = 'red';
      label = '未知';
      break;
    case ConstantTypeEnum.COMMON_ONE:
      color = 'blue';
      label = '微信';
      break;
    case ConstantTypeEnum.COMMON_TWO:
      color = 'green';
      label = '支付宝';
      break;
    case ConstantTypeEnum.COMMON_THREE:
      color = 'orange';
      label = '平安';
      break;
    case  99:
      color = 'purple';
      label = '银行转账';
      break;
    case 88:
      color = 'cyan';
      label = '支付宝先用后付';
      break;
  }
  return h(Tag, {color: color}, () => label);
}


function allActivityType(allActivityType: number) {
  let color: string;
  let label: string;
  switch (allActivityType) {
    case ConstantTypeEnum.COMMON_ZERO:
      color = 'red';
      label = '未知';
      break;
    case ConstantTypeEnum.COMMON_ONE:
      color = 'blue';
      label = '非活动[废弃值，不要关注]';
      break;
    case ConstantTypeEnum.COMMON_TWO:
      color = 'green';
      label = '0元抽奖';
      break;
    case ConstantTypeEnum.COMMON_THREE:
      color = 'orange';
      label = '老铁团';
      break;
    case ConstantTypeEnum.COMMON_FOUR:
      color = 'purple';
      label = '一分夺宝';
      break;
    case 5:
      color = 'cyan';
      label = '福袋抽奖';
      break;
    case 6:
      color = 'orange';
      label = '定金预售';
      break;
    case 7:
      color = 'green';
      label = '2022暑期众筹';
      break;
    case 8:
      color = 'orange';
      label = '下单返金币';
      break;
    case 9:
      color = 'red';
      label = '会员充值';
      break;
    case 10:
      color = 'orange';
      label = '万人讲价';
      break;
    case 11:
      color = 'orange';
      label = '万人讲价-预售版';
      break;
    case 12:
      color = 'red';
      label = '买样后返';
      break;
    case 13:
      color = 'green';
      label = '粉丝组合价';
      break;
    case 14:
      color = 'orange';
      label = '搭配购';
      break;
    case 15:
      color = 'green';
      label = '尾款立减';
      break;
    case 16:
      color = 'red';
      label = '顺手买一件';
      break;
    case 17:
      color = 'red';
      label = '多人拼团';
      break;
    case 18:
      color = 'orange';
      label = '赠品活动-主品';
      break;
    case 19:
      color = 'blue';
      label = '赠品活动-赠品';
      break;
    case 20:
      color = 'red';
      label = '万人团活动';
      break;
    case 21:
      color = 'blue';
      label = 'n元m件';
      break;
  }
  return h(Tag, {color: color}, () => label);
}


function cpsType(cpsType: number) {
  let color: string;
  let label: string;
  switch (cpsType) {
    case ConstantTypeEnum.COMMON_ONE:
      color = 'red';
      label = '全部';
      break;
    case ConstantTypeEnum.COMMON_TWO:
      color = 'blue';
      label = '普通订单';
      break;
    case ConstantTypeEnum.COMMON_THREE:
      color = 'green';
      label = '分销订单';
      break;
  }
  return h(Tag, {color: color}, () => label);
}


function commentStatus(commentStatus: number) {
  let color: string = 'red';
  let label: string = '未评价';
  switch (commentStatus) {
    case ConstantTypeEnum.COMMON_ONE:
      color = 'blue';
      label = '已评价';
      break;
  }
  return h(Tag, {color: color}, () => label);
}

function carrierType(carrierType: number) {
  let color: string;
  let label: string;
  switch (carrierType) {
    case ConstantTypeEnum.COMMON_ONE:
      color = 'blue';
      label = '短视频';
      break;

    case ConstantTypeEnum.COMMON_TWO:
      color = 'green';
      label = '直播间';
      break;

    case 7:
      color = 'orange';
      label = '直播回放';
      break;

    case 311:
      color = 'red';
      label = '订单详情页 | 买家端订单列表';
      break;
    case 3 | 29:
      color = 'purple';
      label = '个人店铺页';
      break;
    case 10008:
      color = 'cyan';
      label = '搜索-商详页';
      break;
    case 201:
      color = 'orange';
      label = 'LIVE页面进入RECO';
      break;
    case 478:
      color = 'red';
      label = '买家首页feed';
      break;
    case 100010:
      color = 'green';
      label = '讲解回放';
      break;
  }
  if (carrierType >= 10000 && carrierType <= 20000) {
    color = 'orange';
    label = '微信分享';
  }
  return h(Tag, {color: color}, () => label);
}

const gridOptions: VxeGridProps<KuaiShouOrder> = {
  border: true,
  pagerConfig: {
    enabled: false
  },
  columns: [
    {title: "序号", type: "seq", width: 50, type: "checkbox", width: 100},
    {title: `${$t('media.order.kuaishou.oid')}`, field: 'oid', width: 'auto'},
    {title: `${$t('media.order.kuaishou.payTime')}`, field: 'payTime', width: 'auto'},
    {title: `${$t('media.order.kuaishou.buyerImage')}`, field: 'buyerImage', width: 'auto'},
    {title: `${$t('media.order.kuaishou.buyerOpenId')}`, field: 'buyerOpenId', width: 'auto'},
    {title: `${$t('media.order.kuaishou.buyerNick')}`, field: 'buyerNick', width: 'auto'},
    {title: `${$t('media.order.kuaishou.sellerOpenId')}`, field: 'sellerOpenId', width: 'auto'},
    {title: `${$t('media.order.kuaishou.sellerNick')}`, field: 'sellerNick', width: 'auto'},
    {title: `${$t('media.order.kuaishou.expressFee')}`, field: 'expressFee', width: 'auto'},
    {title: `${$t('media.order.kuaishou.discountFee')}`, field: 'discountFee', width: 'auto'},
    {title: `${$t('media.order.kuaishou.totalFee')}`, field: 'totalFee', width: 'auto'},
    {
      title: `${$t('media.order.kuaishou.status')}`,
      field: 'status',
      width: 'auto',
      slots: {default: 'status'}
    },
  ],
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
  <Modal>
    <Card :bordered="false">
      <Spin :spinning="spinning" tip="loading...">
        <Descriptions title="基础信息">
          <Descriptions.Item :label="$t('media.order.kuaishou.oid')">
            {{ orderDetail?.order?.oid }}
          </Descriptions.Item>

          <Descriptions.Item :label="$t('media.order.kuaishou.payType')">
            <component :is="payType(orderDetail?.order?.payType)"></component>
          </Descriptions.Item>

          <Descriptions.Item :label="$t('media.order.kuaishou.buyerOpenId')">
            {{ orderDetail?.order?.buyerOpenId }}
          </Descriptions.Item>

          <Descriptions.Item :label="$t('media.order.kuaishou.buyerNick')">
            {{ orderDetail?.order?.buyerNick }}
          </Descriptions.Item>


          <Descriptions.Item :label="$t('media.order.kuaishou.sellerOpenId')">
            {{ orderDetail?.order?.sellerOpenId }}
          </Descriptions.Item>

          <Descriptions.Item :label="$t('media.order.kuaishou.sellerNick')">
            {{ orderDetail?.order?.sellerNick }}
          </Descriptions.Item>

          <Descriptions.Item :label="$t('media.order.kuaishou.remark')">
            {{ orderDetail?.order?.remark }}
          </Descriptions.Item>

          <Descriptions.Item :label="$t('media.order.kuaishou.allActivityType')">
            <div v-for="item in orderDetail?.order?.allActivityType">
              <component :is="allActivityType(item)"/>
            </div>
          </Descriptions.Item>

          <Descriptions.Item :label="$t('media.order.kuaishou.status')">
            <component :is="getOrderStatusTag(PlatformEnum.KUAISHOU, orderDetail?.order?.status)"/>
          </Descriptions.Item>

          <Descriptions.Item :label="$t('media.order.kuaishou.cpsType')">
            <component :is="cpsType(orderDetail?.order?.coType)"/>
          </Descriptions.Item>


          <Descriptions.Item :label="$t('media.order.kuaishou.commentStatus')">
            <component :is="commentStatus(orderDetail?.order?.commentStatus)"/>
          </Descriptions.Item>


          <Descriptions.Item :label="$t('media.order.kuaishou.carrierId')">
            {{ orderDetail?.order?.carrierId }}
          </Descriptions.Item>


          <Descriptions.Item :label="$t('media.order.kuaishou.carrierType')">
            <component :is="carrierType(orderDetail?.order?.carrierType)"></component>
          </Descriptions.Item>


        </Descriptions>

        <Divider/>

        <Descriptions title="金额信息">
          <Descriptions.Item :label="$t('media.order.kuaishou.expressFee')">
            {{ orderDetail?.order?.expressFee }}
          </Descriptions.Item>

          <Descriptions.Item :label="$t('media.order.kuaishou.discountFee')">
            {{ orderDetail?.order?.discountFee }}
          </Descriptions.Item>

          <Descriptions.Item :label="$t('media.order.kuaishou.totalFee')">
            {{ orderDetail?.order?.totalFee }}
          </Descriptions.Item>

          <Descriptions.Item :label="$t('media.order.kuaishou.taxAmount')">
            {{ orderDetail?.order?.orderTaxInfo?.taxAmount }}
          </Descriptions.Item>

          <Descriptions.Item :label="$t('media.order.kuaishou.sellerBearAmount')">
            {{ orderDetail?.order?.orderTaxInfo?.sellerBearAmount }}
          </Descriptions.Item>

        </Descriptions>

        <Divider/>

        <Descriptions title="时间信息">
          <Descriptions.Item :label="$t('media.order.kuaishou.payTime')">
            {{ dateFormat(orderDetail?.order?.payTime) }}
          </Descriptions.Item>

          <Descriptions.Item :label="$t('media.order.kuaishou.sendTime')">
            {{ dateFormat(orderDetail?.order?.sendTime) }}
          </Descriptions.Item>

          <Descriptions.Item :label="$t('media.order.kuaishou.refundTime')">
            {{ dateFormat(orderDetail?.order?.refundTime) }}
          </Descriptions.Item>

          <Descriptions.Item :label="$t('media.order.kuaishou.createTime')">
            {{ dateFormat(orderDetail?.order?.createTime) }}
          </Descriptions.Item>

          <Descriptions.Item :label="$t('media.order.kuaishou.updateTime')">
            {{ dateFormat(orderDetail?.order?.updateTime) }}
          </Descriptions.Item>

          <Descriptions.Item :label="$t('media.order.kuaishou.theDayOfDeliverGoodsTime')">
            {{ dateFormat(orderDetail?.order?.theDayOfDeliverGoodsTime) }}
          </Descriptions.Item>

          <Descriptions.Item :label="$t('media.order.kuaishou.promiseTimeStampOfDelivery')">
            {{ dateFormat(orderDetail?.order?.promiseTimeStampOfDelivery) }}
          </Descriptions.Item>
        </Descriptions>
      </Spin>
    </Card>

    <Card :bordered="false" title="商品信息">
      <Grid>
        <template #status="row">
          <component :is="getOrderStatusTag(PlatformEnum.KUAISHOU, row.status)"></component>
        </template>
      </Grid>
    </Card>
  </Modal>
</template>

<style scoped>

</style>
