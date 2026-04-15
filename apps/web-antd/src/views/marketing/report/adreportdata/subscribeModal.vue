<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';
import { $t } from '@vben/locales';
import { subscribeApi } from '#/api';
import { trimObject } from '#/utils/trim';
import dayjs from 'dayjs';
import { ref, nextTick, watch } from 'vue'; // 添加 watch
import { message } from 'ant-design-vue';
import type {
  searchDataFilter,
  ReportSubscriptionItem,
  UpdateSubscribeType,
  TemplateDto
} from '#/api/models';

const objectRequest = ref<ReportSubscriptionItem>({});
const [Form, formApi] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  handleSubmit: async (formVal: Record<string, any>) => {
    const params = trimObject(formVal);
    const pushConfig = buildPushConfig(params.pushMethod, params.emailAddress);
    const addSubmitParams: ReportSubscriptionItem = {
      name: params.name,
      type: params.type,
      queryMetric: objectRequest.value.queryMetric,
      config: objectRequest.value.config,
      status: Number(params.status) === 1? 1 : 9,
      subscribeDateTimeRange: params.subscribeDateTimeRange,
      pushConfig
    }
    await subscribeApi.fetchNewSubscribe(addSubmitParams);
    message.success('订阅成功');
    await modalApi.close()
  },
  layout: 'horizontal',
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      fieldName: 'id',
      dependencies: {
        show: false,
        triggerFields: ['*'],
      },
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      rules: 'required',
      fieldName: 'name',
      label: `${$t('marketing.report.subscribe.name')}`
    },
    {
      component: 'RadioGroup',
      defaultValue: 'day',
      rules: 'required',
      componentProps: {
        options: [
          { label: '日报', value: 'day' },
          { label: '周报', value: 'week' },
          { label: '月报', value: 'month' },
        ],
      },
      fieldName: 'type',
      label: `${$t('marketing.report.subscribe.reportType')}`,
    },
    {
      component: 'Switch',
      defaultValue: true,
      componentProps: {
        class: 'w-50'
      },
      rules: 'required',
      fieldName: 'status',
      label: `${$t('marketing.report.subscribe.subscribeStatus')}`,
    },
    {
      component: 'RangePicker',
      defaultValue: [
        dayjs().subtract(6, 'day').format('YYYY-MM-DD'),
        dayjs().format('YYYY-MM-DD'),
      ],
      componentProps: {
        placeholder: [`${$t('common.select')}`, `${$t('common.select')}`],
        format: ['YYYY-MM-DD', 'YYYY-MM-DD'],
        valueFormat: 'YYYY-MM-DD',
      },
      fieldName: 'subscribeDateTimeRange',
      label: `${$t('marketing.report.subscribe.subscribeDateTimeRange')}`,
      rules: 'required',
    },
    {
      component: 'RadioGroup',
      defaultValue: 'email',
      componentProps: {
        options: [
          { label: '邮箱', value: 'email' },
        ],
      },
      fieldName: 'pushMethod',
      label: `${$t('marketing.report.subscribe.pushMethod')}`,
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: `多个邮箱请用逗号分隔`,
      },
      rules: 'required',
      fieldName: 'emailAddress',
      label: `${$t('marketing.report.subscribe.emailAddress')}`
    },
  ],
  showDefaultActions:false
});
const [Modal,modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
        const result = await formApi.validate();
    if (!result.valid) {
      return
    }
    await formApi.submitForm();
  },
  onOpenChange(isOpen: Boolean) {
    if(isOpen) {
      const row = modalApi.getData<TemplateDto>();
      if(row.id) {
        handleSetFormValue(row);
      }
    }
  },
})
const buildPushConfig = (type: string, addressStr: string) => {
  const addressList = addressStr
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
  return [{ [type]: addressList }];
};
const handleSetFormValue = (row: TemplateDto ) => {
  objectRequest.value.config = row.template
  objectRequest.value.queryMetric = row.template.queryMetric
}
</script>
<template>
  <Modal>
    <Form/>
  </Modal>
</template>



<style lang="scss" scoped>

</style>
