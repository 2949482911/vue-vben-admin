<script setup lang="ts" name="OrderDetail">
import {ref} from "vue";
import {Loading, useVbenModal} from '@vben/common-ui';
import {$t} from "@vben/locales";
import {orderApi} from "#/api/media";

const title: string = `${$t('action.info')}`;
const loading = ref<Boolean>(true);
const orderDetailParams = ref<OrderDetailParams>({});
import KuaiShouOrderDetail from "./kuaishouorderdetails.vue";
import type {KuaiShouOrder, KuaiShouOrderSku} from "#/api/models";
import {PlatformEnum} from "#/constants/locales";

interface OrderDetailParams {
  platform: string;
  orderId: string;
}

// order info
const orderInfo = ref<Array<KuaiShouOrder>>();
const orderSkuList = ref<Array<KuaiShouOrderSku>>();

const [Modal, modalApi] = useVbenModal({
  fullscreen: true,
  fullscreenButton: false,
  onCancel() {
    loading.value = false;
    orderInfo.value = {};
    orderSkuList.value = [];
    modalApi.close();
  },
  async onConfirm() {
    loading.value = false;
    orderInfo.value = {};
    orderSkuList.value = [];
    await modalApi.close();
  },
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      loading.value = true;
      orderDetailParams.value = modalApi.getData<OrderDetailParams>();
      const {
        order,
        skuList
      } = await orderApi.fetchOrderDetail(orderDetailParams.value.platform, orderDetailParams.value.orderId);

      orderInfo.value = order;
      // orderSkuList.value = skuList;
    }
    loading.value = false;
  },
});

function handleSetFormValue(row) {
  formApi.setValues(row);
}
</script>

<template>
  <Modal :title="title">
    <KuaiShouOrderDetail :order-info="orderInfo" v-if="orderDetailParams.platform === PlatformEnum.KUAISHOU"/>
  </Modal>
</template>

<style scoped>

</style>
