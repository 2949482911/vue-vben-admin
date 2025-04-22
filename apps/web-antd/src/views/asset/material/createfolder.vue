<script setup lang="ts" name="CreateFolder">
import type {CouponCreateRequest, CouponUpdateRequest} from "#/api/models";
import {ref} from 'vue';
import {useVbenForm} from "#/adapter/form";
import {$t} from "@vben/locales";
import {useVbenModal} from '@vben/common-ui';
import {Card} from "ant-design-vue";
import {materialAlbumApi} from "#/api/asset";

const emit = defineEmits(['pageReload']);

//

async function getMaterialAlbumTree() {
  return await materialAlbumApi.fetchAlbumTree()
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
      component: 'Input',
      fieldName: "name",
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      label: $t('asset.album.columns.name'),
      rules: "required",
    },

    {
      component: 'ApiTreeSelect',
      componentProps: {
        api: getMaterialAlbumTree,
        labelField: 'name',
        valueField: 'id',
        childrenField: 'children',

      },
      fieldName: "parentId",
      label: $t('asset.album.columns.albumId'),
    },

    {
      component: 'Textarea',
      label: $t('asset.album.columns.remark'),
      fieldName: "remark"
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'lg:grid-cols-1',
  handleSubmit: async (values: Record<string, any>) => {
    if (isUpdate.value) {
      await materialAlbumApi.fetchAlbumUpdate(JSON.stringify(values))
    } else {
      await materialAlbumApi.fetchAlbumCreate(JSON.stringify(values))
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
