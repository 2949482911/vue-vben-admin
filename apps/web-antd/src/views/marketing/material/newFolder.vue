<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';
import { message, TreeSelect } from 'ant-design-vue';
import { ref, watch } from 'vue';
import type { FolderItem } from "#/api/models";
import { materialLibraryApi } from '#/api/core';

const props = defineProps<{
  treeData: FolderItem[];
  idEdit: any
}
>()

watch(() => props.idEdit, (newVal) => {
  if(newVal.id) titleText.value = '编辑文件夹'
  else titleText.value = '新建文件夹'
  console.log(newVal,'新建文件夹收到了');
})

const emit = defineEmits<{
  (e: 'treeNode'): void
}>();

const titleText = ref<string>('新建文件夹')

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

const [Modal, modalApi] = useVbenModal({
  fullscreenButton: false,
  async onCancel() {
    await formApi.resetForm();
    await modalApi.close();
  },

  async onConfirm() {
    const isValidate = await formApi.validate()
    if(!isValidate.valid) return
    const formData = await formApi.getValues()
    delete formData.parentIdS
    const parentId = getRealParentId(props.treeData, selectedId.value);
    console.log(parentId,'拿的父节点id');
    try{
      await materialLibraryApi.fetchCreateFile({name:formData.name, remark:formData.remark, parentId})
      await message.success('新建成功！')
      await formApi.resetForm();
      emit('treeNode');
      await modalApi.close();
    }catch(err){
      console.log(err);
    }
  },
});

//用来查找父组件id的，因为TreeSelect不能绑定parentId，存在相同的parentId
function getRealParentId(
  treeData: FolderItem[],
  selectedId: string
): string | undefined {
  const currentNode = findNodeById(treeData, selectedId);

  if (!currentNode) return undefined;

  // 你的判断规则
  return currentNode.parentId === '0'
    ? currentNode.id
    : currentNode.parentId;
}

function findNodeById(
  nodes: FolderItem[],
  id: string
): FolderItem | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;

    if (node.children?.length) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

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
