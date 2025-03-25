<script setup lang="ts" name="CreateCoupon">
import type {CouponCreateRequest, CouponUpdateRequest} from "#/api/models";
import {ref} from 'vue';
import {useVbenForm} from "#/adapter/form";
import {$t} from "@vben/locales";
import {PlatformEnum, PlatformOptions} from "#/constants/locales";
import {couponApi, mediaAccountApi} from "#/api/media";
import {useVbenModal} from '@vben/common-ui';
import {Card} from "ant-design-vue";

const emit = defineEmits(['pageReload']);

enum validityTypeEnum {
  period = 1,
  fixed = 2
}

enum receiveChannel {
  //  快手
  detail = 1,
  customer = 74,
  all_chancel = 40,
  activity_chancel = 76,
}

// 卷类型
enum couponTargetType {
  items = 0,
  store = 1,
  category = 2,
  all = 3,
}


// 类型
enum couponFrontType {
  new_fans = 10,
  fans = 11
}

//

const kuaiShouSchema: Array<FormSchema> = [
  {
    component: 'Select',
    fieldName: 'validityType',
    label: `${$t("media.coupon.columns.validityType")}`,
    rules: 'required',
    componentProps: {
      options: [
        {
          label: `${$t("media.coupon.validityType.period")}`,
          value: validityTypeEnum.period
        },
        {
          label: `${$t("media.coupon.validityType.fixed")}`,
          value: validityTypeEnum.fixed
        }
      ]
    }
  },
  {
    component: 'Select',
    fieldName: 'couponTargetType',
    label: `${$t("media.coupon.columns.couponTargetType")}`,
    rules: 'required',
    componentProps: {
      options: [
        {
          label: `${$t("media.coupon.couponTargetType.items")}`,
          value: couponTargetType.items
        },
        {
          label: `${$t("media.coupon.couponTargetType.store")}`,
          value: couponTargetType.store
        },
        {
          label: `${$t("media.coupon.couponTargetType.category")}`,
          value: couponTargetType.category
        },
        {
          label: `${$t("media.coupon.couponTargetType.all")}`,
          value: couponTargetType.all
        },
      ]
    }
  },
  {
    component: 'DatePicker',
    fieldName: 'validStartTime',
    label: `${$t("media.coupon.columns.validStartTime")}`,
    rules: 'required',
    dependencies: {
      show: (value) => {
        return value.validityType === validityTypeEnum.period
      },
      triggerFields: ["validityType"]
    }
  },
  {
    component: 'DatePicker',
    fieldName: 'fixedValidityTime',
    label: `${$t("media.coupon.columns.fixedValidityTime")}`,
    rules: 'required',
    dependencies: {
      show: (value) => {
        return value.validityType === validityTypeEnum.fixed
      },
      triggerFields: ["validityType"]
    }
  },
  {
    component: "Select",
    fieldName: "receiveChannel",
    label: `${$t("media.coupon.columns.receiveChannel")}`,
    componentProps: {
      options: [
        {
          label: `${$t("media.coupon.receiveChannel.detail")}`,
          value: receiveChannel.detail
        },
        {
          label: `${$t("media.coupon.receiveChannel.customer")}`,
          value: receiveChannel.customer
        },
        {
          label: `${$t("media.coupon.receiveChannel.all_chancel")}`,
          value: receiveChannel.all_chancel
        },
        {
          label: `${$t("media.coupon.receiveChannel.activity_chancel")}`,
          value: receiveChannel.activity_chancel
        },
      ]
    }
  },
  {
    component: 'InputNumber',
    fieldName: 'reduceAmount',
    label: `${$t("media.coupon.columns.reduceAmount")}`,
    suffix: () => '¥',
    rules: 'required',
  },
  {
    component: 'DatePicker',
    fieldName: 'receiveStartTime',
    label: `${$t("media.coupon.columns.receiveStartTime")}`,
    rules: 'required',
  },
  {
    component: 'InputNumber',
    fieldName: 'threshold',
    label: `${$t("media.coupon.columns.threshold")}`,
    rules: 'required',
  },


  {
    component: 'DatePicker',
    fieldName: 'validEndTime',
    label: `${$t("media.coupon.columns.validEndTime")}`,
    rules: 'required',
    dependencies: {
      show: (value) => {
        return value.validityType === validityTypeEnum.fixed
      },
      triggerFields: ["validityType"]
    }
  },
  {
    component: 'DatePicker',
    fieldName: 'receiveEndTime',
    label: `${$t("media.coupon.columns.receiveEndTime")}`,
    rules: 'required',
  },
  {
    component: 'InputNumber',
    fieldName: 'totalStock',
    label: `${$t("media.coupon.columns.totalStock")}`,
    rules: 'required',
  },
  {
    component: 'InputNumber',
    fieldName: 'receivePerLimit',
    label: `${$t("media.coupon.columns.receivePerLimit")}`,
    rules: 'required',
  },
  {
    component: 'Select',
    fieldName: 'couponFrontType',
    label: `${$t("media.coupon.columns.couponFrontType")}`,
    componentProps: {
      options: [
        {
          label: `${$t("media.coupon.couponFrontType.new_fans")}`,
          value: couponFrontType.new_fans
        },
        {
          label: `${$t("media.coupon.couponFrontType.fans")}`,
          value: couponFrontType.fans
        },
      ]
    }
  }
]

function getPlatformSchema(platform: string) {
  const schema: Array<FormSchema> = [
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
          const {items} = await mediaAccountApi.fetchAllMediaOnlineretailers(platform)
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
      component: "Input",
      fieldName: "name",
      label: `${$t("media.coupon.columns.name")}`,
      rules: 'required',

    },
  ]

  if (platform === PlatformEnum.KUAISHOU) {
    schema.push(...kuaiShouSchema)
  }
  return schema;
}


const isUpdate = ref<Boolean>(false);
const object = ref<CouponCreateRequest | CouponUpdateRequest>()

const title: string = object.value
  ? `${$t('common.edit')}`
  : `${$t('common.create')}`;

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
        onSelect: platform => {
          formApi.setState((prev) => {
              const currentSchema = prev?.schema ?? [];
              const newSchema = getPlatformSchema(platform);
              return {
                schema: [...currentSchema, ...newSchema],
              };
            }
          )
        }
      },
      fieldName: 'platform',
      label: `${$t('media.seller_address.columns.platform')}`,
      rules: 'required',
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  handleSubmit: async (values: Record<string, any>) => {
    if (isUpdate.value) {
      await couponApi.fetchCouponUpdate(JSON.stringify(values))
    } else {
      await couponApi.fetchCouponCreate(JSON.stringify(values))
    }
    await modalApi.close();
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
      object.value = modalApi.getData<Record<string, any>>();
      if (object.value.id) {
        isUpdate.value = true;
        handleSetFormValue(object.value);
      } else {
        isUpdate.value = false;
      }
    }
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
