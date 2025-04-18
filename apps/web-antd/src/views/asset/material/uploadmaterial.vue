<script setup lang="ts" name="UploadMaterialModal">
import type {CouponCreateRequest, CouponUpdateRequest} from "#/api/models";
import {ref} from 'vue';
import {useVbenForm} from "#/adapter/form";
import {$t} from "@vben/locales";
import {PlatformOptions} from "#/constants/locales";
import {couponApi} from "#/api/media";
import {useVbenModal} from '@vben/common-ui';
import {Card} from "ant-design-vue";
import {materialAlbumApi, materialApi} from "#/api/asset";

const emit = defineEmits(['pageReload']);

//

async function getMaterialAlbumTree() {
  return await materialAlbumApi.fetchAlbumTree()
}

interface UploadFileParams {
  file: File;
  onError?: (error: Error) => void;
  onProgress?: (progress: { percent: number }) => void;
  onSuccess?: (data: any, file: File) => void;
}

// 文件上传
async function upload_file({
                             file,
                             onError,
                             onProgress,
                             onSuccess,
                           }: UploadFileParams) {
  try {
    onProgress?.({percent: 0});
    const data = await materialApi.fetchUpload(file);
    onProgress?.({percent: 100});
    onSuccess?.(data, file);
  } catch (error) {
    onError?.(error instanceof Error ? error : new Error(String(error)));
  }
}


async function uploadSuccess(response: any) {

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
      dependencies: {
        show: false,
        triggerFields: ["*"]
      },
      fieldName:"width"
    },
    {
      component: 'Input',
      dependencies: {
        show: false,
        triggerFields: ["*"]
      },
      fieldName:"width"
    },

    {
      component: 'ApiTreeSelect',
      componentProps: {
        api: getMaterialAlbumTree,
        labelField: 'name',
        valueField: 'id',
        childrenField: 'children',

      },
      fieldName: "albumId",
      label: $t('asset.album.columns.albumId'),
      rules: "required",
    },

    {
      component: 'Upload',
      componentProps: {
        accept: '.png,.jpg,.jpeg',
        // 自动携带认证信息
        // customRequest,
        customRequest: upload_file,
        beforeUpload: async () => {
          // return await formApi.validateField("")
        },

        disabled: false,
        maxCount: 1,
        multiple: false,
        showUploadList: true,
        // 上传列表的内建样式，支持四种基本样式 text, picture, picture-card 和 picture-circle
        listType: 'picture-card',
      },
      fieldName: 'files',
      label: $t('action.file'),
      renderComponentContent: () => {
        return {
          default: () => $t('tips.upload_image'),
        };
      },
      rules: 'required',
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'lg:grid-cols-1',
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
