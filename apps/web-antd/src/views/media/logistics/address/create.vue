<script lang="ts" setup name="CreateAddress">
import {h, ref} from 'vue';
import {useVbenModal} from '@vben/common-ui';
import {$t} from '@vben/locales';
import {Card} from 'ant-design-vue';
import {useVbenForm} from '#/adapter/form';
import {developerApi, mediaAccountApi} from "#/api/media";
import {PlatformOptions} from "#/constants/locales";
import type {SellerAddressCreate, SellerAddressUpdate} from "#/api/models/media/logistics";

const emit = defineEmits(['pageReload']);

const notice = ref<SellerAddressCreate | SellerAddressUpdate>({});

const isUpdate = ref<Boolean>(false);

function getAddressType(platform: string) {
  return [
    {
      "label": `${$t('media.seller_address.addressType.sendItems')}`,
      "value": 3
    },
    {
      "label": `${$t('media.seller_address.addressType.returnAddress')}`,
      "value": 2
    },
  ]
}

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
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      // 字段名
      fieldName: 'id',
      // 界面显示的label
      dependencies: {
        show: false,
        triggerFields: ["*"]
      }
    },

    {
      component: 'Select',
      componentProps: {
        placeholder: `${$t('common.select')}`,
        options: PlatformOptions,
      },
      fieldName: 'platform',
      label: `${$t('media.seller_address.columns.platform')}`,
      rules: 'required',
    },

    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'ApiSelect',
      // 对应组件的参数
      componentProps: {
        afterFetch: (data: { name: string; id: string }[]) => {
          return data.map((item: any) => ({
            label: `${item.name}-${item.platform}`,
            value: item.id,
          }));
        },
        // 菜单接口
        api: async () => {
          const {items} = await mediaAccountApi.fetchAllMediaOnlineretailers()
          return items
        },
      },
      // 字段名
      fieldName: 'accountId',
      // 界面显示的label
      label: `${$t("media.account.columns.platformAccountId")}`,
      rules: 'required',
    },

    {
      component: 'Select',
      componentProps: {
        options: getAddressType()
      },
      fieldName: 'addressType',
      label: `${$t("media.seller_address.columns.addressType")}`,
      rules: 'required',

    },

    {
      component: 'Input',
      componentProps: {
        options: getAddressType()
      },
      fieldName: 'consignee',
      label: `${$t("media.seller_address.addressType.consignee")}`,
      rules: 'required',

    },
    {
      component: 'Input',
      componentProps: {
        options: getAddressType()
      },
      fieldName: 'mobile',
      label: `${$t("media.seller_address.addressType.mobile")}`,
      rules: 'required',

    },

    {
      component: 'Input',
      componentProps: {
        options: getAddressType()
      },
      fieldName: 'province',
      label: `${$t("media.seller_address.addressType.province")}`,
      rules: 'required',

    },

    {
      component: 'Input',
      componentProps: {
        options: getAddressType()
      },
      fieldName: 'city',
      label: `${$t("media.seller_address.addressType.city")}`,
      rules: 'required',

    },

    {
      component: 'Input',
      componentProps: {
        options: getAddressType()
      },
      fieldName: 'district',
      label: `${$t("media.seller_address.addressType.district")}`,
      rules: 'required',

    },

    {
      component: 'Input',
      componentProps: {
        options: getAddressType()
      },
      fieldName: 'town',
      label: `${$t("media.seller_address.addressType.town")}`,
      rules: 'required',

    },

    {
      component: 'Textarea',
      componentProps: {
        options: getAddressType()
      },
      fieldName: 'address',
      label: `${$t("media.seller_address.addressType.address")}`,
      rules: 'required',
    },

    {
      component: 'Switch',
      defaultValue: false,
      componentProps: {
        class: 'w-auto',
      },
      fieldName: 'defaultAddress',
      label: `${$t("media.seller_address.columns.defaultAddress")}`,
      rules: 'required',

    },

  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  handleSubmit: async (values: Record<string, any>) => {
    if (isUpdate.value) {
      await developerApi.fetchUpdateDeveloper(JSON.stringify(values))
    } else {
      await developerApi.fetchCreateDeveloper(JSON.stringify(values))
    }
    modalApi.close();
  }
});

const [Modal, modalApi] = useVbenModal({
  fullscreen: true,
  fullscreenButton: false,
  onCancel() {
    modalApi.close();
    isUpdate.value = false;
  },
  async onConfirm() {
    await formApi.submitForm();
    emit("pageReload");
    isUpdate.value = false;
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      notice.value = modalApi.getData<Record<string, any>>();
      if (notice.value.id) {
        isUpdate.value = true;
        handleSetFormValue(notice.value);
      } else {
        isUpdate.value = false;
      }
    }
  },
});


function handleSetFormValue(row) {
  formApi.setValues(row);
}

const title: string = notice.value
  ? `${$t('common.edit')}`
  : `${$t('common.create')}`;
</script>
<template>
  <Modal :title="title">
    <Card>
      <Form>

      </Form>
    </Card>
  </Modal>
</template>
