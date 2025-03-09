<script lang="ts" setup name="AuthAccount">
import {useVbenModal} from '@vben/common-ui';
import {$t} from '@vben/locales';
import {Card} from 'ant-design-vue';
import {useVbenForm} from '#/adapter/form';
import {PlatformOptions} from "#/constants/locales";
import {developerApi} from "#/api/media";

const emit = defineEmits(['pageReload']);

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  // layout: 'horizontal',
  schema: [
    {
      component: 'Select',
      componentProps: {
        placeholder: `${$t('common.select')}`,
        options: PlatformOptions,
      },
      fieldName: 'platform',
      label: `${$t('media.developer.columns.platform')}`,
      rules: 'required',
    },

    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      fieldName: 'accountId',
      label: `${$t('media.developer.auth_account')}`,
      rules: 'required',
    },

  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  // wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  handleSubmit: async (values: Record<string, any>) => {
    const {authUrl} = await developerApi.fetchAuthUrl(values["platform"], values["accountId"])
    await modalApi.close();
    window.open(authUrl, '_blank')
  }
});

const [Modal, modalApi] = useVbenModal({
  fullscreen: false,
  fullscreenButton: false,
  closeOnPressEscape: true,
  class: 'w-[600px]',
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    await formApi.submitForm();
  },
  onOpenChange(isOpen: boolean) {

  },
});

</script>
<template>
  <Modal>
    <Card>
      <Form>

      </Form>
    </Card>
  </Modal>
</template>
