<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';
import { message, TreeSelect } from 'ant-design-vue';
import { ref, watch } from 'vue';
import type { FolderItem } from "#/api/models";
import { materialLibraryApi } from '#/api/core';
import type { MaterialLibraryFolderType } from './materialType';

const props = defineProps<{
  treeData: FolderItem[];
  idEdit: MaterialLibraryFolderType | null
}
>()

const titleText = ref<string>('新建文件夹')

watch(() => props.idEdit, () => {
  syncFormData();
}, { deep: true });

async function resetText(){
  titleText.value = '新建文件夹';
  selectedId.value = '';
  await formApi.resetForm();
}

const emit = defineEmits<{
  (e: 'treeNode'): void
}>();

const [Form, formApi] = useVbenForm({
  showDefaultActions:false,
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  schema: [
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
      },
      // 字段名
      fieldName: 'name',
      label: '名字',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: '请选择文件夹',
      },
      // 字段名
      fieldName: 'parentIdS',
      label: '素材目录',
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder: '请输入',
      },
      fieldName: 'remark',
      label: '备注',
    }
  ]
})

// 将同步逻辑抽离，确保 watch 和 onOpenChange 都能用到
function syncFormData() {
  const data = props.idEdit;
  console.log('同步数据状态:', data);
  
  if (data && data.id) {
    titleText.value = '编辑文件夹';
    selectedId.value = data.parentId ; // 确保 parentId 存在
    formApi.setValues(data);
  } else {
    // 强制清空，解决第二次打开“新建”还留着旧数据的问题
    resetText()
  }
}

const [Modal, modalApi] = useVbenModal({
  fullscreenButton: false,
  async onCancel() {
    await modalApi.close();
    await resetText()
  },

  async onConfirm() {
    const isValidate = await formApi.validate()
    if(!isValidate.valid) return
    const formData = await formApi.getValues()
    try{
      if(titleText.value==='编辑文件夹'){
        await materialLibraryApi.fetchUpdateFile({id:props.idEdit?.id,name:formData.name, remark:formData.remark, parentId:selectedId.value})
        await message.success('编辑成功！')
      }else{
        await materialLibraryApi.fetchCreateFile({name:formData.name, remark:formData.remark, parentId:selectedId.value})
        await message.success('新建成功！')
      }
      await modalApi.close();
      emit('treeNode');
    }catch(err){
      console.log(err);
    }
    await resetText()
  },
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      // 弹窗打开时，手动执行一次数据同步逻辑
      syncFormData();
    }
  },
});
const selectedId = ref<string>('')

</script>
<template>
  <div>
    <Modal :title="titleText">
      <Form>
        <!-- 级联选择器 -->
        <template #parentIdS>
          <TreeSelect
            :treeData="props.treeData"
            :field-names="{ label: 'name', value: 'id', children: 'children' }"
            v-model:value="selectedId"
            style="width: 100%"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            placeholder="请选择文件夹"
            allow-clear
          >
          </TreeSelect>
        </template>
      </Form>
    </Modal>
  </div>
</template>
