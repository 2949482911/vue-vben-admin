<script setup lang="ts" name="BilibiliReturnOrderDetail">
import {$t} from "@vben/locales";
import {h, ref} from 'vue';
import type {
  BilibiliReturnOrderDetailResponse,
  MediaReturnOrderDetailRequest
} from "#/api/models/media/return_order";
import {useVbenModal} from '@vben/common-ui';
import {Card, Descriptions, Divider, List, Spin, Tag} from "ant-design-vue";
import {returnOrderApi} from "#/api/media";
import {ConstantTypeEnum} from "@vben/constants";
import {getHandlerType, getReturnStatus, getReturnType, PlatformEnum} from "#/constants";
import {useVbenVxeGrid, type VxeGridProps} from "#/adapter/vxe-table";
import type {BilibiliOrderSku} from "#/api/models/media/bilibili/orders";

const title: string = `${$t('action.info')}`;
const spinning = ref<Boolean>(false);

const orderDetailRequest = ref<MediaReturnOrderDetailRequest>();
const returnOrderDetail = ref<BilibiliReturnOrderDetailResponse>();


function getAfter_sale_status(after_sale_status: number): Map<string, string> {
  let color: string;
  let text: string;
  switch (after_sale_status) {
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
  return h(Tag, {color: color}, () => text);
}


function return_method(return_method: number) {
  let color: string;
  let text: string;
  switch (return_method) {
    case ConstantTypeEnum.COMMON_ZERO: {
      color = "blue";
      text = "未选择";
      break;
    }
    case ConstantTypeEnum.COMMON_ONE: {
      color = "green";
      text = "用户上传物流";
      break;
    }
    case ConstantTypeEnum.COMMON_TWO: {
      color = "red";
      text = "上门取件";
      break;
    }
  }
  return h(Tag, {color: color}, () => text);
}


const gridOptions: VxeGridProps<BilibiliOrderSku> = {
  border: true,
  columns: [
    {title: "序号", type: "seq", width: 50, type: "checkbox", width: 100},
    {
      field: "sku_id",
      title: `${$t("media.return_order.bilibili.sku_columns.sku_id")}`,
      width: 'auto',
    },
    {
      field: "product_image",
      title: `${$t("media.return_order.bilibili.sku_columns.product_image")}`,
      width: 'auto',
    },
    {
      field: "item_quantity",
      title: `${$t("media.return_order.bilibili.sku_columns.item_quantity")}`,
      width: 'auto',
    },
    {
      field: "create_time",
      title: `${$t("media.return_order.bilibili.sku_columns.create_time")}`,
      width: 'auto',
    },
    {
      field: "product_id",
      title: `${$t("media.return_order.bilibili.sku_columns.product_id")}`,
      width: 'auto',
    },
    {
      field: "product_name",
      title: `${$t("media.return_order.bilibili.sku_columns.product_name")}`,
      width: 'auto',
    },
    {
      field: "after_sale_item_num",
      title: `${$t("media.return_order.bilibili.sku_columns.after_sale_item_num")}`,
      width: 'auto',
    },
    {
      field: "sku_refund_amount",
      title: `${$t("media.return_order.bilibili.sku_columns.sku_refund_amount")}`,
      width: 'auto',
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
      spinning.value = true
      orderDetailRequest.value = modalApi.getData<Record<string, any>>();
      await getReturnOrderDetail()
    }
  },
});

function init() {
  returnOrderDetail.value = {};
  spinning.value = false;
}


async function getReturnOrderDetail() {
  gridApi.setLoading(true)
  returnOrderDetail.value = await returnOrderApi.fetchGetReturnOrderDetail(orderDetailRequest.value)
  gridApi.setGridOptions({data: returnOrderDetail.value.skus})
  gridApi.setLoading(false)
  spinning.value = false
}
</script>

<template>
  <div>
    <Modal :title="title">
      <Card :title="`${$t('action.basis')}`" :bordered="false">
        <Spin :spinning="spinning" tip="loading...">
          <Descriptions>
            <Descriptions.Item :label="$t('media.return_order.bilibili.columns.after_sale_id')">
              {{ returnOrderDetail?.order?.after_sale_id }}
            </Descriptions.Item>

            <Descriptions.Item :label="$t('media.return_order.bilibili.columns.order_id')">
              {{ returnOrderDetail?.order?.order_id }}
            </Descriptions.Item>

            <Descriptions.Item :label="$t('media.return_order.bilibili.columns.after_sale_status')">
              <component :is="getAfter_sale_status(returnOrderDetail?.order?.after_sale_status)"/>
            </Descriptions.Item>

            <Descriptions.Item :label="$t('media.return_order.bilibili.columns.after_sale_type')">
              <component
                :is="getHandlerType(PlatformEnum.Bilibili, returnOrderDetail?.order?.after_sale_type)"/>
            </Descriptions.Item>

            <Descriptions.Item :label="$t('media.return_order.bilibili.columns.refund_status')">
              <component
                :is="getReturnStatus(PlatformEnum.Bilibili,returnOrderDetail?.order?.refund_status)"/>
            </Descriptions.Item>

            <Descriptions.Item :label="$t('media.return_order.bilibili.columns.refund_type')">
              <component
                :is="getReturnType(PlatformEnum.Bilibili,returnOrderDetail?.order?.refund_type)"/>
            </Descriptions.Item>


            <Descriptions.Item :label="$t('media.return_order.bilibili.columns.reason')">
              {{ returnOrderDetail?.order?.reason }}
            </Descriptions.Item>

            <Descriptions.Item
              :label="$t('media.return_order.bilibili.columns.refund_fail_reason')">
              {{ returnOrderDetail?.order?.refund_fail_reason }}
            </Descriptions.Item>

            <Descriptions.Item :label="$t('media.return_order.bilibili.columns.reason_remark')">
              {{ returnOrderDetail?.order?.reason_remark }}
            </Descriptions.Item>

            <Descriptions.Item
              :label="$t('media.return_order.bilibili.columns.after_sale_apply_count')">
              {{ returnOrderDetail?.order?.after_sale_apply_count }}
            </Descriptions.Item>


            <Descriptions.Item :label="$t('media.return_order.bilibili.columns.return_method')">
              <component :is="return_method(returnOrderDetail?.order?.return_method)"></component>
            </Descriptions.Item>

            <Descriptions.Item :label="$t('media.return_order.bilibili.columns.got_pkg')">
              <Tag v-if="returnOrderDetail?.order?.got_pkg === 0" color="red">
                {{ $t('common.no') }}
              </Tag>
              <Tag v-else color="green">{{ $t('common.yes') }}</Tag>
            </Descriptions.Item>

          </Descriptions>

          <Divider/>


          <Descriptions>
            <Descriptions.Item :label="$t('media.return_order.bilibili.columns.refund_amount')">
              {{ returnOrderDetail?.order?.refund_amount }}
            </Descriptions.Item>

            <Descriptions.Item
              :label="$t('media.return_order.bilibili.columns.real_refund_amount')">
              {{ returnOrderDetail?.order?.real_refund_amount }}
            </Descriptions.Item>

            <Descriptions.Item
              :label="$t('media.return_order.bilibili.columns.refund_post_amount')">
              {{ returnOrderDetail?.order?.refund_post_amount }}
            </Descriptions.Item>

            <Descriptions.Item
              :label="$t('media.return_order.bilibili.columns.real_refund_amount')">
              {{ returnOrderDetail?.order?.real_refund_amount }}
            </Descriptions.Item>

          </Descriptions>

          <Divider/>

          <Descriptions>
            <Descriptions.Item :label="$t('media.return_order.bilibili.columns.apply_time')">
              {{ returnOrderDetail?.order?.apply_time }}
            </Descriptions.Item>

            <Descriptions.Item :label="$t('media.return_order.bilibili.columns.update_time')">
              {{ returnOrderDetail?.order?.update_time }}
            </Descriptions.Item>

            <Descriptions.Item :label="$t('media.return_order.bilibili.columns.status_deadline')">
              {{ returnOrderDetail?.order?.status_deadline }}
            </Descriptions.Item>

            <Descriptions.Item :label="$t('media.return_order.bilibili.columns.refund_time')">
              {{ returnOrderDetail?.order?.refund_time }}
            </Descriptions.Item>

          </Descriptions>

          <Divider/>

          <Descriptions title="仲裁信息">

            <Descriptions.Item
              :label="$t('media.return_order.bilibili.columns.arbitrate_info.arbitrate_id')">
              {{ returnOrderDetail?.order?.arbitrate_info?.arbitrate_id }}
            </Descriptions.Item>

            <Descriptions.Item
              :label="$t('media.return_order.bilibili.columns.arbitrate_info.arbitrate_status')">
              {{ returnOrderDetail?.order?.arbitrate_info?.arbitrate_status }}
            </Descriptions.Item>

            <Descriptions.Item
              :label="$t('media.return_order.bilibili.columns.arbitrate_info.arbitrate_status_deadline')">
              {{ returnOrderDetail?.order?.arbitrate_info?.arbitrate_status_deadline }}
            </Descriptions.Item>

            <Descriptions.Item
              :label="$t('media.return_order.bilibili.columns.arbitrate_info.arbitrate_create_time')">
              {{ returnOrderDetail?.order?.arbitrate_info?.arbitrate_create_time }}
            </Descriptions.Item>

            <Descriptions.Item
              :label="$t('media.return_order.bilibili.columns.arbitrate_info.arbitrate_update_time')">
              {{ returnOrderDetail?.order?.arbitrate_info?.arbitrate_update_time }}
            </Descriptions.Item>

          </Descriptions>

          <Divider/>

          <Descriptions>

            <Descriptions.Item :label="$t('media.return_order.bilibili.columns.evidence')">
              {{ returnOrderDetail?.order?.evidence }}
            </Descriptions.Item>

          </Descriptions>

          <Divider/>

          <Descriptions title="售后记录列表">

            <Descriptions.Item>
              <List>
                <List.Item v-for="item in returnOrderDetail?.order?.record_logs_list">
                  <List.Item.Meta :description="item.text">
                    >
                    <template #title>
                      {{ item.operator }}
                    </template>
                    <template #avatar>
                      {{ item.action }}
                    </template>
                  </List.Item.Meta>
                </List.Item>
              </List>
            </Descriptions.Item>

          </Descriptions>

        </Spin>
      </Card>
      <Card title="商品信息" :bordered="false">
        <Grid>

        </Grid>
      </Card>
    </Modal>
  </div>
</template>

<style scoped>

</style>
