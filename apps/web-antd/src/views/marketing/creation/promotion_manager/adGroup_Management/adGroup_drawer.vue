<script lang="ts" setup>
import { useVbenDrawer } from '@vben/common-ui';
import { aManagementApi } from '#/api';
import { useVbenForm } from '#/adapter/form';
import { getAdgroupFormSchema } from './public_adGroupFormItem';
import TimeSelectionPeriod
  from "#/views/marketing/creation/components/timeSelectionPeriod/timeSelectionPeriod.vue";
import { nextTick, ref } from 'vue';

// 控制时间组件挂载状态的开关
const isTimeRendered = ref(false);
// 独立维护的时间响应式值
const scheduleTimeValue = ref('1'.repeat(336));

const [Drawer, drawerApi] = useVbenDrawer({
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      // 1. 进来先强制卸载时间组件，清空可能残存的历史脏状态
      isTimeRendered.value = false;

      const data = drawerApi.getData();
      const targetSchema = getAdgroupFormSchema(data.platform);

      formApi.setState({
        schema: targetSchema,
      });

      // 2. 异步拉取详情数据
      const res = await aManagementApi.fetchAdManagementDetail({
        targetId: data.adgroupId,
        platform: data.platform,
        level: 'adgroup',
      });

      // 3. 将新数据塞给表单内核，确保 slotProps.value 已经变成了最新数据
      formApi.setValues(res);

      // 【重新赋值核心】：显式地将最新获取到的时间段数据塞给独立变量
      scheduleTimeValue.value = res.scheduleTime || '1'.repeat(336);
      // 4. 等待 DOM 和表单状态更新完毕后，重新挂载时间组件
      await nextTick();
      isTimeRendered.value = true;
    } else {
      // 弹框关闭时，顺手将其销毁
      isTimeRendered.value = false;
    }
  },
  async onCancel() {
    drawerApi.close();
    formApi.resetValidate();
  },
  async onConfirm() {
    drawerApi.close();
    formApi.resetValidate();
  },
});

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
    labelClass: 'w-[140px] flex-shrink-0 justify-end pr-3',
  },
  layout: 'horizontal',
  schema: [],
});
</script>
<template>
  <Drawer title="广告组详情">
    <Form>
      <!-- <template #scheduleTime="slotProps">
        <TimeSelectionPeriod v-if="isTimeRendered" class="timeTab" v-model="slotProps.value" />
      </template> -->
    </Form>
    <div class="flex items-start mt-4 ant-form-item">
      <div
        class="w-[140px] flex-shrink-0 justify-end pr-3 flex items-center text-[14px] text-[#323233] h-[32px]"
      >
        广告投放时段
      </div>
      <div class="flex-1 min-w-0">
        <TimeSelectionPeriod
          v-if="isTimeRendered"
          class="timeTab w-full"
          v-model="scheduleTimeValue"
        />
      </div>
    </div>
  </Drawer>
</template>
