<script lang="ts" setup>
import {useVbenDrawer} from '@vben/common-ui';
import {useVbenForm} from '#/adapter/form';
import {
  ADTYPE_SELECT,
  CONVERSION_SELECT,
  MEDIA_SELECT,
  NOTIFICATIONTYPE_SELECT,
  NOTIFORMAT_SELECT,
  PROJRCT_SELECT,
  PROMOTION_SELECT
} from '../projectEnum';
import {h, ref} from 'vue';
import {Input, Tag} from 'ant-design-vue';
import { useProjectPlaceholder } from "#/utils/customName";

const { customizeName, handleTagClick, placeholders } = useProjectPlaceholder('', 100);

// 增加一个变量记录打开时的初始 adType，如果改变，广告组就需要跟着清空重新填写
const initialAdType = ref<any>(null);

const [Drawer, drawerApi] = useVbenDrawer({
  closeOnClickModal: false,
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData();
      if (data) {
        customizeName.value = data.name || '';
        initialAdType.value = data.adType;
        formApi.setValues(data);
      } else {
        customizeName.value = '';
        initialAdType.value = null;
        formApi.resetForm();
      }
    }
  },
  onConfirm: async () => {
    try {
      if (customizeName.value) await formApi.setValues({name: customizeName.value});
      const isValidate = await formApi.validate();
      if (!isValidate.valid) return;

      const currentValues = await formApi.getValues();

      // 【逻辑判断】如果初始值存在，且与当前值不同
      const adTypeChanged =
        initialAdType.value !== null &&
        initialAdType.value !== undefined &&
        initialAdType.value !== currentValues.adType;

      const formData = {
        ...(await formApi.getValues()),
        _isConfirmed: true,
        _adTypeChanged: adTypeChanged
      };
      drawerApi.setData(formData);
      customizeName.value = '';
      await drawerApi.close();
    } catch (error) {
      console.error(error);
    }
  },
  onCancel() {
    reset()
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
      class: 'w-[300px]'
    },
  },
  schema: [
    {
      component: 'Default' as any,
      fieldName: 'name',
      label: '项目名字',
      rules: 'required',
      formItemClass: 'items-baseline',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择',
        options: PROJRCT_SELECT,
      },
      fieldName: 'adType',
      label: '推广目标',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择',
        options: MEDIA_SELECT,
      },
      fieldName: 'mediaType',
      label: '媒体类型',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'dailyBudget',
      defaultValue:-1,
      label: '计划日限额',
      suffix: () => h('span', {class: 'text-600'}, '元'),
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择',
        options: ADTYPE_SELECT,
      },
      defaultValue: 0,
      fieldName: 'campaignType',
      label: '广告类型',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择',
        options: NOTIFORMAT_SELECT,
      },
      fieldName: 'pushForm',
      label: '通知形式',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择',
        options: NOTIFICATIONTYPE_SELECT,
      },
      fieldName: 'pushType',
      label: '通知类型',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择',
        options: PROMOTION_SELECT,
      },
      defaultValue: 0,
      fieldName: 'promotionType',
      label: '推广模式',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择',
        options: CONVERSION_SELECT,
      },
      fieldName: 'conversionMonitorType',
      label: '转化监测',
    },
  ],
});

</script>

<template>
  <div>
    <Drawer class="w-[50%]" title="新建项目">
      <Form>
        <template #name>
          <div class="flex flex-col gap-2 w-full">
            <Input
              v-model:value="customizeName"
              placeholder="请输入项目名称"
              :maxlength="100"
              allow-clear
              show-count
              class="w-[300px]"
            />

            <div class="flex flex-wrap items-center gap-2 text-xs mt-1">
              <span class="text-gray-500 font-medium">通配符：</span>
              <template v-for="item in placeholders" :key="item.value">
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

<style lang="scss" scoped>

</style>
