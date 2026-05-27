<script lang="ts" setup>
import { useVbenDrawer } from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';
import {
  EXTENSION_SELECT,
  DAYLIMIT_SELECT,
  DELIVERMODE_SELECT
} from '../../projectEnum';
import { h, ref } from 'vue';
import { Input, Tag } from 'ant-design-vue';
import { useProjectPlaceholder } from '#/utils/customName';

const PROJECT_PLACEHOLDERS = [
  { label: '时间', value: '<时间>' },
  { label: '日期', value: '<日期>' },
  { label: '时分秒', value: '<时分秒>' },
  { label: '动态标号', value: '<动态标号>' },
] as const; // 使用 as const 保证类型安全

const { customizeName, handleTagClick } = useProjectPlaceholder('', 100);

// 增加一个变量记录打开时的初始 adType，如果改变，广告组就需要跟着清空重新填写
const initialAdType = ref<any>(null);

const [Drawer, drawerApi] = useVbenDrawer({
  closeOnClickModal: false,
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData();
      console.log('data',data)
      if (data) {
        customizeName.value = data.planName || '';
        // initialAdType.value = data.adType;
        formApi.setValues(data);
      } else {
        customizeName.value = '';
        initialAdType.value = null;
        formApi.resetForm();
      }
      
    }
  },
  onConfirm: async () => {
    if (customizeName.value) await formApi.setValues({ planName: customizeName.value });
      const isValidate = await formApi.validate();
      if (!isValidate.valid) return;
      const currentValues = await formApi.getValues();
      drawerApi.setData(currentValues);
      customizeName.value = '';
      await drawerApi.close();
  },
  onCancel() {
    reset();
  },
});

function reset() {
  customizeName.value = '';
  formApi.resetForm();
  drawerApi.close();
}

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-[300px]',
    },
  },
  schema: [
    {
      component: 'Default' as any,
      fieldName: 'planName',
      label: '项目名字',
      rules: 'required',
      formItemClass: 'items-baseline',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择',
        options: EXTENSION_SELECT,
      },
      fieldName: 'extensionType',
      label: '推广目标',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择',
        options: DAYLIMIT_SELECT,
      },
      fieldName: 'dayLimit',
      label: '限制日预算',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
        class:"!w-[300px]",
      },
      dependencies: {
        rules: (val) => {
          if(val.dayLimit === 1) {
            return 'required'
          }
          return ''
        },
        triggerFields: ['dayLimit'],
      },
      fieldName: 'dayBudget',
      defaultValue: -1,
      label: '日预算',
      suffix: () => h('span', { class: 'text-600' }, '元'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择',
        options: DELIVERMODE_SELECT,
      },
      fieldName: 'deliveryMode',
      label: '竞价策略',
      rules: 'required',
    },
  ],
});
</script>

<template>
  <div>
    <Drawer class="w-[50%]" title="新建项目">
      <Form>
        <template #planName>
          <div class="flex flex-col gap-2 w-full">
            <Input
              v-model:value="customizeName"
              placeholder="请输入项目名称"
              :maxlength="100"
              allow-clear
              show-count
              class="!w-[300px]"
            />

            <div class="flex flex-wrap items-center gap-2 text-xs mt-1">
              <span class="text-gray-500 font-medium">通配符：</span>
              <template v-for="item in PROJECT_PLACEHOLDERS" :key="item.value">
                <Tag
                  class="cursor-pointer select-none transition-all hover:border-blue-400"
                  :color="customizeName.includes(item.value) ? 'blue' : 'default'"
                  @click="handleTagClick(item.value)"
                >
                  {{ item.value }}
                </Tag>
              </template>
            </div>
          </div>
        </template>
      </Form>
    </Drawer>
  </div>
</template>

<style lang="scss" scoped></style>
