<script setup lang="ts" name="AuthAccount">
import {useVbenModal} from '@vben/common-ui';
import {useVbenForm} from '#/adapter/form';
import {$t} from "@vben/locales";
import {AUTH_ACCOUNT_PLATFORM} from "#/constants/locales";
import {Platform} from "#/constants/enums";
import {advertiserApi} from "#/api/core";
import {onMounted} from "vue";

import {Alert} from 'ant-design-vue';


const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  schema: [
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Select',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: AUTH_ACCOUNT_PLATFORM,
        onSelect: async (value: string) => {
          await handlerAuthUrl(value);
        }
      },
      // 字段名
      fieldName: 'platform',
      defaultValue: Platform.VIVO,
      // 界面显示的label
      label: `${$t('ocpx.platform.title')}`,
      rules: 'required',
    },

    {
      component: 'RadioGroup',
      defaultValue: 1,
      componentProps: {
        options: [
          {
            "label": "自主授权",
            "value": 1,
          },
          {
            "label": "邀请他人授权",
            "value": 2,
          }
        ]
      },
      fieldName: 'field1',
      rules: 'required',
      label: `${$t('marketing.advertiser.authType')}`,
    },
    {
      component: 'Textarea',
      componentProps: {
        readonly: true,
        rows: 12,
        disabled: true
      },
      fieldName: 'authUrl',
      label: `${$t('marketing.advertiser.authUrl')}`,
      dependencies: {
        show: value => {
          return value.field1 === 2
        },
        triggerFields: ['field1']
      }
    }
  ],
});


/**
 * 获取授权url
 * @param platform
 */
async function handlerAuthUrl(platform: string) {
  const url = await advertiserApi.fetchAuthUrl({platform: platform})
  await formApi.setFieldValue("authUrl", url)
}


onMounted(() => {
  handlerAuthUrl(Platform.VIVO);
})


const [Modal, modalApi] = useVbenModal({
  fullscreenButton: false,
  async onCancel() {
    await formApi.resetForm();
    await modalApi.close();
  },

  async onConfirm() {
    const authUrl = await formApi.getValues()
    if (authUrl["field1"] === 1) {
      window.open(authUrl["authUrl"], '_blank');
    }
    await modalApi.close();
  },

  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      await handlerAuthUrl(Platform.VIVO);
    }
  }
});


</script>

<template>
  <div>
    <Modal>
      <Form></Form>

      <Alert type="warning" message="授权链接生成后，将于15分钟后失效，请尽快使用"></Alert>
    </Modal>
  </div>
</template>

<style scoped>

</style>
