<script setup lang="ts" name="OrderDetail">
import {ref} from "vue";
import {Loading, useVbenModal} from '@vben/common-ui';
import {Card} from "ant-design-vue";
import {$t} from "@vben/locales";
import {orderApi} from "#/api/media";

const title: string = `${$t('action.info')}`;
const loading = ref<Boolean>(true);
const orderDetailParams = ref<OrderDetailParams>({});

interface OrderDetailParams {
  platform: string;
  orderId: string;
}


const [Modal, modalApi] = useVbenModal({
  fullscreen: true,
  fullscreenButton: false,
  onCancel() {
    loading.value = false;
    modalApi.close();
  },
  async onConfirm() {
    loading.value = false;
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
    <Loading
      :spinning="loading"
      :text="$t('action.loading_text')"
      class="flex h-full w-full items-center justify-center"
    >
      <Card>


      </Card>
    </Loading>
  </Modal>
</template>

<style scoped>

</style>
