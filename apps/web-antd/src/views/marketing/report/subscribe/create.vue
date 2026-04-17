<script setup lang="ts">
import { Page, useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { ref, watch } from 'vue'; // 添加 watch
import { useVbenForm } from '#/adapter/form';
import type {
  searchDataFilter,
  ReportSubscriptionItem,
  UpdateSubscribeType
} from '#/api/models';
import { subscribeApi } from '#/api';
import { trimObject } from '#/utils/trim';
import dayjs from 'dayjs';
import { message } from 'ant-design-vue';
import AdReportFilterForm from '../components/AdReportFilterForm.vue';
import MetricTemplate from './components/metricTemplate.vue';
const emit = defineEmits(['pageReload']);
const objectRequest = ref<ReportSubscriptionItem>({});
const isUpdate = ref<Boolean>(false);
const metricList = ref<string[]>([]);
const filterCriteria = ref<searchDataFilter>();
const title = ref<string>('');
const isShowActions = ref(false);
const filterFormRef = ref();
const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  handleSubmit: async (formVal: Record<string, any>) => {
    const params = trimObject(formVal);
    const pushConfig = buildPushConfig(params.pushMethod, params.emailAddress);
    const addSubmitParams: ReportSubscriptionItem = {
      name: params.name,
      type: params.type,
      queryMetric: params.queryMetric,
      config: params.config,
      status: Number(params.status) === 1? 1 : 9,
      subscribeDateTimeRange: params.subscribeDateTimeRange,
      pushConfig
    }
    const updateSubmitParams: UpdateSubscribeType = {
      id: params.id,
      ...addSubmitParams
    }
    if(isUpdate.value) {
      // 调用修改接口
      await subscribeApi.fetchUpdateSubscribe(updateSubmitParams);
      message.success('修改成功');
    } else {
      // 调用新增接口
      await subscribeApi.fetchNewSubscribe(addSubmitParams);
      message.success('新增成功');
     }
  },
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
      component: 'Default' as any,
      fieldName: 'queryMetric',
      label: `${$t('marketing.report.subscribe.metricList')}`,
      rules: 'required'
    },
    {
      component: 'Default' as any,
      help: '选择完毕请点击确认按钮',
      fieldName: 'config',
      label: `${$t('marketing.report.subscribe.filterCriteria')}`,
      rules: 'required'
    },
    {
      component: 'Switch',
      defaultValue: true,
      componentProps: {
        class: 'w-10'
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
});

watch(isUpdate,(newVal) => {
  if(newVal) {
    title.value = "修改订阅"
  } else {
    title.value = "新增订阅"
  }
},{ deep: true, immediate: true });
function handleMetricConfirm(val: string[]) {
  metricList.value = val;
  formApi.setFieldValue('queryMetric', val);
}

const buildPushConfig = (type: string, addressStr: string) => {
  const addressList = addressStr
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
  return [{ [type]: addressList }];
};
/**
 * 编辑回显：解析 pushConfig  => 推送类型 + 推送地址字符串
 */
const parsePushConfig = (pushConfig: { [key: string]: string[] }[] = []) => {
  if (!pushConfig || pushConfig.length === 0) {
    return { pushMethod: '', emailAddress: '' };
  }
  const firstPushItem = pushConfig[0];
  if (!firstPushItem) {
    return { pushMethod: '', emailAddress: '' };
  }
  const pushMethod = Object.keys(firstPushItem)[0] || '';
  const addressList = firstPushItem[pushMethod] || [];
  const emailAddress = addressList.join(',');
  return { pushMethod, emailAddress };
};
async function handleSetFormValue(row: ReportSubscriptionItem) {
  const metricIds = Array.isArray(row.queryMetric) ? row.queryMetric : [];
  const subscribeDateTimeRange = row.subscribeDateTimeRange?.split('~');
  const { pushMethod, emailAddress } = parsePushConfig(row.pushConfig);
  const status = row.status === 1 ? true : false;
  formApi.setValues({
    id: row.id,
    name: row.name,
    queryMetric: metricIds,
    pushMethod,
    emailAddress,
    subscribeDateTimeRange,
    status
  });
  metricList.value = metricIds;
  filterCriteria.value = row.config;
}

const [Drawer, drawerApi] = useVbenDrawer({
  closeOnPressEscape: false,
  async onCancel() {
    await formApi.setFieldValue('queryMetric', null);
    await formApi.resetForm();
    isUpdate.value = false;
    metricList.value = [];
    await drawerApi.close();
  },
  async onConfirm() {
    const configVal = await filterFormRef.value?.getValues()
    formApi.setFieldValue('config', configVal);
    const result = await formApi.validate();
    if (!result.valid) {
      return;
    }
    await formApi.submitForm();
    isUpdate.value = false;
    emit('pageReload');
    await drawerApi.close();
  },
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      objectRequest.value = drawerApi.getData<ReportSubscriptionItem>();
      if (objectRequest.value?.id) {
        isUpdate.value = true;
        handleSetFormValue(objectRequest.value);
      } else {
        isUpdate.value = false;
        metricList.value = [];
        formApi.resetForm();
        filterCriteria.value = {};
      }
    }
  },
});
</script>

<template>
  <div>
    <Page>
      <Drawer class="w-[50%]" :title="title">
        <Form>
          <template #queryMetric>
            <MetricTemplate
              :metricList="metricList"
              @confirm="handleMetricConfirm"
            ></MetricTemplate>
          </template>
          <template #config>
            <AdReportFilterForm 
              :initialValues="filterCriteria"
              ref="filterFormRef" 
              :isShowActions="isShowActions"
              ></AdReportFilterForm>
          </template>
        </Form>
      </Drawer>
    </Page>
  </div>
</template>

<style scoped></style>
