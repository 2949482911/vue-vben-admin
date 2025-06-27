<script setup lang="ts" name="BilibiliReturnOrderDetail">
import {$t} from "@vben/locales";
import {ref} from 'vue';
import type {
  BilibiliReturnOrderDetailResponse,
  MediaReturnOrderDetailRequest
} from "#/api/models/media/return_order";
import {useVbenModal} from '@vben/common-ui';
import {useVbenForm} from "#/adapter/form";
import {Card, Divider, Spin} from "ant-design-vue";
import {returnOrderApi} from "#/api/media";

const title: string = `${$t('action.info')}`;
const spinning = ref<Boolean>(false);

const orderDetailRequest = ref<MediaReturnOrderDetailRequest>();
const returnOrderDetail = ref<BilibiliReturnOrderDetailResponse>();


const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    // 所有表单项
    colon: true,
    disabled: true,
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  schema: [
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {},
      // 字段名
      fieldName: 'after_sale_id',
      label: `${$t('media.return_order.bilibili.columns.after_sale_id')}`
    },
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {},
      // 字段名
      fieldName: 'order_id',
      label: `${$t('media.return_order.bilibili.columns.order_id')}`
    },
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {},
      // 字段名
      fieldName: 'after_sale_status',
      label: `${$t('media.return_order.bilibili.columns.after_sale_status')}`
    },
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {},
      // 字段名
      fieldName: 'refund_type',
      label: `${$t('media.return_order.bilibili.columns.refund_type')}`
    },

    {
      component: 'Input',
      componentProps: {},
      fieldName: 'refund_status',
      label: `${$t('media.return_order.bilibili.columns.refund_status')}`
    },
    {
      component: 'Input',
      componentProps: {},
      fieldName: 'refund_amount',
      label: `${$t('media.return_order.bilibili.columns.refund_amount')}`
    },
    {
      component: 'Input',
      componentProps: {},
      fieldName: 'refund_post_amount',
      label: `${$t('media.return_order.bilibili.columns.refund_post_amount')}`
    },
    {
      component: 'Input',
      componentProps: {},
      fieldName: 'apply_time',
      label: `${$t('media.return_order.bilibili.columns.apply_time')}`
    },
    {
      component: 'Input',
      componentProps: {},
      fieldName: 'update_time',
      label: `${$t('media.return_order.bilibili.columns.update_time')}`
    },
    {
      component: 'Input',
      componentProps: {},
      fieldName: 'reason',
      label: `${$t('media.return_order.bilibili.columns.reason')}`
    },
    {
      component: 'Input',
      componentProps: {},
      fieldName: 'after_sale_type',
      label: `${$t('media.return_order.bilibili.columns.after_sale_type')}`
    },
    {
      component: 'Input',
      componentProps: {},
      fieldName: 'reason_remark',
      label: `${$t('media.return_order.bilibili.columns.reason_remark')}`
    },
    {
      component: 'Input',
      componentProps: {},
      fieldName: 'evidence',
      label: `${$t('media.return_order.bilibili.columns.evidence')}`
    },
    {
      component: 'Input',
      componentProps: {},
      fieldName: 'after_sale_apply_count',
      label: `${$t('media.return_order.bilibili.columns.after_sale_apply_count')}`
    },
    {
      component: 'Input',
      componentProps: {},
      fieldName: 'real_refund_amount',
      label: `${$t('media.return_order.bilibili.columns.real_refund_amount')}`
    },
    {
      component: 'Input',
      componentProps: {},
      fieldName: 'return_address',
      label: `${$t('media.return_order.bilibili.columns.return_address')}`
    },
    {
      component: 'Input',
      componentProps: {},
      fieldName: 'real_refund_amount',
      label: `${$t('media.return_order.bilibili.columns.real_refund_amount')}`
    },
    {
      component: 'Input',
      componentProps: {},
      fieldName: 'got_pkg',
      label: `${$t('media.return_order.bilibili.columns.got_pkg')}`
    },
    {
      component: 'Input',
      componentProps: {},
      fieldName: 'status_deadline',
      label: `${$t('media.return_order.bilibili.columns.status_deadline')}`
    },
    {
      component: 'Input',
      componentProps: {},
      fieldName: 'exchange_sku_info',
      label: `${$t('media.return_order.bilibili.columns.exchange_sku_info')}`
    },
    {
      component: 'Input',
      componentProps: {},
      fieldName: 'part_type',
      label: `${$t('media.return_order.bilibili.columns.part_type')}`
    },
    {
      component: 'Input',
      componentProps: {},
      fieldName: 'refund_fail_reason',
      label: `${$t('media.return_order.bilibili.columns.refund_fail_reason')}`
    },
    {
      component: 'Input',
      componentProps: {},
      fieldName: 'apply_role',
      label: `${$t('media.return_order.bilibili.columns.apply_role')}`
    },
    {
      component: 'Input',
      componentProps: {},
      fieldName: 'refund_time',
      label: `${$t('media.return_order.bilibili.columns.refund_time')}`,
      renderComponentContent: (row) => {
        return {
          default: () => h('div', row.refund_time),
        };
      }
    },
    {
      component: 'Input',
      componentProps: {},
      fieldName: 'return_method',
      label: `${$t('media.return_order.bilibili.columns.return_method')}`
    },
    {
      component: 'Input',
      componentProps: {},
      fieldName: 'arbitrate_info',
      label: `${$t('media.return_order.bilibili.columns.arbitrate_info')}`
    },
    {
      component: 'Input',
      componentProps: {},
      fieldName: 'logistics_info',
      label: `${$t('media.return_order.bilibili.columns.logistics_info')}`
    },
    {
      component: 'Input',
      componentProps: {},
      fieldName: 'record_logs_list',
      label: `${$t('media.return_order.bilibili.columns.record_logs_list')}`
    },
    {
      component: 'Input',
      componentProps: {},
      fieldName: 'order_info',
      label: `${$t('media.return_order.bilibili.columns.order_info')}`
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
});

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
  returnOrderDetail.value = await returnOrderApi.fetchGetReturnOrderDetail(orderDetailRequest.value)
  await formApi.setValues(returnOrderDetail.value.order)
  spinning.value = false
}
</script>

<template>
  <div>
    <Modal :title="title">
      <Card :title="`${$t('action.basis')}`" :bordered="false">
        <Spin :spinning="spinning" tip="loading...">
          <Form>
          </Form>
        </Spin>
      </Card>

      <Divider/>


    </Modal>
  </div>
</template>

<style scoped>

</style>
