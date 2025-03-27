<script setup lang="ts" name="SelectPlatformPushItem">
import {useVbenForm} from "#/adapter/form";
import {$t} from "@vben/locales";
import {PlatformEnum, PlatformOptions} from "#/constants/locales";
import {useVbenModal} from '@vben/common-ui';
import {Card} from "ant-design-vue";
import {useRouter} from "vue-router";

const router = useRouter()


const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    // 所有表单项
    colon: true,
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  schema: [
    {
      component: 'Select',
      componentProps: {
        placeholder: `${$t('common.select')}`,
        options: PlatformOptions,
        onSelect: platform => {
          switch (platform) {
            case PlatformEnum.KUAISHOU:
              router.push({
                name: "KuaiShouPushItem",
              })
              break;
            case PlatformEnum.Bilibili:
              router.push({
                name: "BilibiliPushItem",
              })
              break;
          }

        }
      },
      fieldName: 'platform',
      label: `${$t('media.seller_address.columns.platform')}`,
      rules: 'required',
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  // wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  handleSubmit: async (values: Record<string, any>) => {
    await modalApi.close();
  }
});


const [Modal, modalApi] = useVbenModal({
  fullscreen: true,
  fullscreenButton: false,
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    await formApi.submitForm();
    emit("pageReload");
  },
});

function handleSetFormValue(row) {
  formApi.setValues(row);
}


</script>

<template>
  <Modal :title="title">
    <Card>
      <Form>

      </Form>
    </Card>
  </Modal>
</template>
