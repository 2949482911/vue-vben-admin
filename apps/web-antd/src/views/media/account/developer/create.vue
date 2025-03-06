<script lang="ts" setup name="CreateDeveloper">
import {ref} from 'vue';
import {useVbenModal} from '@vben/common-ui';
import {$t} from '@vben/locales';
import {Card} from 'ant-design-vue';
import {useVbenForm} from '#/adapter/form';
import type {OrgCreateRequest} from "#/api/models/users";
import {developerApi} from "#/api/media";

const emit = defineEmits(['pageReload']);

const notice = ref<OrgCreateRequest>({});
const platformOptions = [
  {
    "label": "Kauishou",
    "value": "kuaishou"
  },
  {
    "label": "DouYin",
    "value": "douyin"
  }
]
const isUpdate = ref<Boolean>(false);


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
        options: platformOptions,
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
      // 字段名
      fieldName: 'appId',
      // 界面显示的label
      label: `${$t('media.developer.columns.appId')}`,
      rules: 'required',
    },

    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      fieldName: 'appName',
      label: `${$t('media.developer.columns.appName')}`,
      rules: 'required',
    },

    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      // 字段名
      fieldName: 'secret',
      label: `${$t('media.developer.columns.secret')}`,
      rules: 'required',
    },

    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Textarea',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      // 字段名
      fieldName: 'remark',
      label: `${$t('media.developer.columns.remark')}`,
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
