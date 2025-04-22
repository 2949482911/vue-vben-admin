<script setup lang="ts" name="UploadMaterialModal">
import type {CouponCreateRequest, CouponUpdateRequest} from "#/api/models";
import {ref} from 'vue';
import {useVbenForm} from "#/adapter/form";
import {$t} from "@vben/locales";
import {useVbenModal} from '@vben/common-ui';
import {Card} from "ant-design-vue";
import {materialAlbumApi, materialApi} from "#/api/asset";
import type {UploadResponse} from "#/api/models/asset";

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
    const data: UploadResponse = await materialApi.fetchUpload(file);
    onProgress?.({percent: 100});
    setFormData(data)
    onSuccess?.(data, file);
  } catch (error) {
    onError?.(error instanceof Error ? error : new Error(String(error)));
  }
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
      fieldName: "width"
    },

    {
      component: 'Input',
      dependencies: {
        show: false,
        triggerFields: ["*"]
      },
      fieldName: "height"
    },
    {
      component: 'Input',
      dependencies: {
        show: false,
        triggerFields: ["*"]
      },
      fieldName: "fileUrl"
    },

    {
      component: 'Input',
      dependencies: {
        show: false,
        triggerFields: ["*"]
      },
      fieldName: "fileName"
    },
    {
      component: 'Input',
      dependencies: {
        show: false,
        triggerFields: ["*"]
      },
      fieldName: "fileSize"
    },
    {
      component: 'Input',
      dependencies: {
        show: false,
        triggerFields: ["*"]
      },
      fieldName: "fileType"
    },

    {
      component: 'Input',
      dependencies: {
        show: false,
        triggerFields: ["*"]
      },
      fieldName: "fileMd5"
    },

    {
      component: 'Input',
      dependencies: {
        show: false,
        triggerFields: ["*"]
      },
      fieldName: "cover"
    },

    {
      component: 'Input',
      dependencies: {
        show: false,
        triggerFields: ["*"]
      },
      fieldName: "videoDuration"
    },

    {
      component: 'Input',
      dependencies: {
        show: false,
        triggerFields: ["*"]
      },
      fieldName: "thumbnailUrl"
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
      console.log("edit material", values)
    } else {
      await materialApi.fetchCreateMaterial(JSON.stringify(values))
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


// set upload data
function setFormData(response: UploadResponse) {
  formApi.setFieldValue("fileUrl", response.fileUrl);
  formApi.setFieldValue("fileName", response.filename);
  formApi.setFieldValue("fileSize", response.fileSize);
  formApi.setFieldValue("fileType", response.fileType);
  formApi.setFieldValue("fileMd5", response.fileMd5);
  formApi.setFieldValue("cover", response.cover);
  formApi.setFieldValue("videoDuration", response.videoDuration);
  formApi.setFieldValue("thumbnailUrl", response.thumbnailUrl);
  formApi.setFieldValue("width", response.width);
  formApi.setFieldValue("height", response.height);
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
