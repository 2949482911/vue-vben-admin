<script lang="ts" setup name="CreateProcess">
import {ref} from 'vue';
import {useVbenModal} from '@vben/common-ui';
import {$t} from '@vben/locales';
import type {FlowableFormItem} from "#/api/models";
import {setupAntd} from "epic-designer/dist/ui/antd";
import {EDesigner, type PageSchema} from "epic-designer";
import {useVbenForm} from "#/adapter/form";
import {flowableFormApi} from "#/api";
// 使用Antd UI
setupAntd();
const emit = defineEmits(['pageReload']);

const notice = ref<FlowableFormItem>({});
const isUpdate = ref<Boolean>(false);
const defaultSchema = ref<PageSchema>()
const designer = ref(null)
// form 提交

const [ModalForm, modalFormApi] = useVbenModal({
  fullscreen: false,
  fullscreenButton: false,
  onCancel() {
    modalFormApi.close();
  },
  async onConfirm() {
    await formApi.submitForm();
    emit("pageReload");
  },
});
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
      component: 'Input',
      fieldName: 'id',
      dependencies: {
        show: false,
        triggerFields: ["*"]
      }
    },
    {
      component: 'Input',
      fieldName: 'name',
      rules: 'required',
      label: `${$t('bpm.flowable_form.columns.name')}`
    },
    {
      component: 'Textarea',
      componentProps: {
        max: 200,
        line: 5
      },
      fieldName: 'remark',
      label: `${$t('bpm.flowable_form.columns.remark')}`,
    },

  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1',
  handleSubmit: async (values: Record<string, any>) => {
    if (isUpdate.value) {
      await flowableFormApi.fetchFormUpdateForm({
        formContent: notice.value.formContent,
        script: notice.value.script,
        ...values
      })
    } else {
      await flowableFormApi.fetchFormCreateForm({
        formContent: notice.value.formContent,
        script: notice.value.script,
        ...values
      })
    }
    await modalFormApi.close();
    await modalApi.close();
  }
});


const [Modal, modalApi] = useVbenModal({
  fullscreen: true,
  fullscreenButton: false,
  showConfirmButton: false,
  showCancelButton: false,
  onClosed() {
    formApi.resetForm()
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      notice.value = modalApi.getData<Record<string, any>>();
      if (notice.value.id) {
        isUpdate.value = true;
        handleSetFormValue(notice.value);
        defaultSchema.value = {
          script: notice.value.script,
          schemas: JSON.parse(notice.value.formContent),
        }
      } else {
        isUpdate.value = false;
      }
    }
  },
});

// submitForm 保存
function submitForm(e: PageSchema) {
  modalFormApi.open()
  notice.value.script = e.script
  notice.value.formContent = JSON.stringify(e.schemas)
}

function handleSetFormValue(row) {
  formApi.setValues(row);
}


const title: string = notice.value
  ? `${$t('common.edit')}`
  : `${$t('common.create')}`;
</script>
<template>
  <Modal :title="title">
    <EDesigner ref="designer" @save="submitForm" :defaultSchema="defaultSchema"/>
  </Modal>

  <ModalForm>
    <Form/>
  </ModalForm>
</template>
<style lang="less">
@import "epic-designer/dist/style.css";
</style>
