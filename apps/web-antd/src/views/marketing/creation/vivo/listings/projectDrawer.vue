<script lang="ts" setup>
import { useVbenDrawer} from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';
import { ADTYPE_SELECT, CONVERSION_SELECT, MEDIA_SELECT, NOTIFICATIONTYPE_SELECT, NOTIFORMAT_SELECT, PROJRCT_SELECT, PROMOTION_SELECT } from '../projectEnum';
import { h, ref } from 'vue';
import { Input, Tag } from 'ant-design-vue';

const [Drawer, drawerApi] = useVbenDrawer({
  closeOnClickModal:false,
  onOpenChange(isOpen) {
    if (isOpen) {
      // 直接读取本地存储
      const info = sessionStorage.getItem('projectInfo');
      if (info) {
        const data = JSON.parse(info);
        projectName.value = data.name || '';
        formApi.setValues(data);
      }
    }
  },
  async onConfirm() {
    if(projectName.value) formApi.setValues({ name: projectName.value });
    const isValidate = await formApi.validate()
    if(!isValidate.valid) return
    const formData = await formApi.getValues()
    console.log(formData,'formData');
    sessionStorage.setItem('projectInfo', JSON.stringify(formData));
    await reset()
  },
  async onCancel() {
    await reset()
  },
});

function reset(){
  projectName.value = '',
  formApi.resetForm(),
  drawerApi.close();
}

const placeholders = [
  { label: '时间', value: '<时间>' },
  { label: '日期', value: '<日期>' },
  { label: '时分秒', value: '<时分秒>' },
  { label: '动态标号', value: '<动态标号>' },
];

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
      label: '计划日限额',
      suffix: () => h('span', { class: 'text-600' }, '毫分'),
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择',
        options: ADTYPE_SELECT,
      },
      defaultValue:0,
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
      defaultValue:0,
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

// 1. 定义一个独立的变量来接管输入框
const projectName = ref<string>('');

// 2. 修改点击逻辑，直接操作这个变量
const handleTagClick = (tagValue: string) => {
  // 1. 获取当前值（去除首尾空格）
  const currentVal = projectName.value.trim();
  
  // 2. 判断是否已经包含该通配符（实现切换功能，可选）
  if (currentVal.includes(tagValue)) {
    // 如果已包含，则移除（包括它前面的下划线）
    const reg = new RegExp(`_?${tagValue}`, 'g');
    projectName.value = currentVal.replace(reg, '');
  } else {
    // 3. 追加逻辑：如果输入框已有内容，先加下划线再接通配符
    const separator = currentVal.length > 0 ? '_' : '';
    projectName.value = currentVal + separator + tagValue;
  }
  
  // 限制长度
  projectName.value = projectName.value.slice(0, 100);
};
</script>

<template>
  <div>
    <Drawer class="w-[50%]" title="新建项目">
      <Form>
        <template #name>
          <div class="flex flex-col gap-2 w-full">
            <Input
              v-model:value="projectName"
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
                  :color="projectName.includes(item.value) ? 'blue' : 'default'"
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
