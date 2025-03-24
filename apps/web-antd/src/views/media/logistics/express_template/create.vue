<script lang="ts" setup name="CreateExpressTemplate">
import {markRaw, ref} from 'vue';
import {useVbenModal} from '@vben/common-ui';
import {$t} from '@vben/locales';
import {Card, Cascader} from 'ant-design-vue';
import {useVbenForm} from '#/adapter/form';
import {logisticsApi, mediaAccountApi} from "#/api/media";
import {PlatformEnum, PlatformOptions} from "#/constants/locales";
import type {
  District,
  SellerAddressCreate,
  SellerAddressUpdate
} from "#/api/models/media/logistics";

const emit = defineEmits(['pageReload']);

const notice = ref<SellerAddressCreate | SellerAddressUpdate>({});

// 地区
const districtList = ref<Array<District>>([])
const isUpdate = ref<Boolean>(false);

function getCalType(platform: string) {
  return [
    {
      "label": `${$t('media.express_template.calType.piece')}`,
      "value": 1
    },
    {
      "label": `${$t('media.express_template.calType.weight')}`,
      "value": 2
    },
  ]
}


/**
 * form schema
 */
function getSchema(platform: string) {
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
  ];
  if (platform === PlatformEnum.KUAISHOU) {
    schema.push({
      component: 'Select',
      componentProps: {
        options: getCalType()
      },
      fieldName: 'calType',
      label: `${$t("media.express_template.columns.calType")}`,
      rules: 'required',
    },)
  }
  return schema;
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
        onSelect: (value) => {
          formApi.setState((prev) => {
              const currentSchema = prev?.schema ?? [];
              const newSchema = getSchema(value);
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

    {
      component: 'Input',
      fieldName: 'name',
      label: `${$t("media.express_template.columns.name")}`,
      rules: 'required',
    },

    {
      component: markRaw(Cascader),
      componentProps: {
        options: districtList,
        fieldNames: {
          label: 'name',
          value: 'id',
          children: 'children',
        },
        onChange: (value: string[], selectedOptions) => {
          formApi.setValues({
            sendProvinceCode: value[0],
            sendProvinceName: selectedOptions[0].name,
            sendCityCode: value[1],
            sendCityName: selectedOptions[1].name,
            sendDistrictCode: value[2],
            sendDistrictName: selectedOptions[2].name,
          })
        }
      },
      fieldName: 'addressSelect',
      label: `${$t("media.seller_address.addressType.province")}`,
      rules: 'required',
    },

    {
      component: 'Input',
      fieldName: 'sendProvinceName',
      dependencies: {
        show: false,
        triggerFields: ["*"],
      }
    },

    {
      component: 'Input',
      fieldName: 'sendProvinceCode',
      dependencies: {
        show: false,
        triggerFields: ["*"]
      }
    },

    {
      component: 'Input',
      fieldName: 'sendCityName',
      dependencies: {
        show: false,
        triggerFields: ["*"]
      }
    },

    {
      component: 'Input',
      fieldName: 'sendCityCode',
      dependencies: {
        show: false,
        triggerFields: ["*"]
      }
    },


    {
      component: 'Input',
      fieldName: 'sendDistrictCode',
      dependencies: {
        show: false,
        triggerFields: ["*"]
      }
    },

    {
      component: 'Input',
      fieldName: 'sendDistrictName',
      dependencies: {
        show: false,
        triggerFields: ["*"]
      }
    }
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  handleSubmit: async (values: Record<string, any>) => {
    if (isUpdate.value) {
      await logisticsApi.fetchSellerAddressUpdate(JSON.stringify(values))
    } else {
      await logisticsApi.fetchSellerCreateAddress(JSON.stringify(values))
    }
    modalApi.close();
  }
});


function platformSelect(platform: string) {

}

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
    // 获取地区
    logisticsApi.fetchDistrictTree().then(res => {
      districtList.value = res
    })
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
