<script lang="ts" setup name="CreateEventSettlement">
import type {CreateEventSettlementRequest, UpdateEventSettlementRequest,} from '#/api/models';
import {Page, useVbenModal} from '@vben/common-ui';
import {ref} from 'vue';
import {$t} from '@vben/locales';

import {useVbenForm} from '#/adapter/form';
import {eventSettlementApi, platformCallbackApi} from '#/api/core/ocpx';
import {PLATFORM} from '#/constants/locales';
import {trimObject} from '#/utils/trim';
import {Card, InputNumber} from 'ant-design-vue';
import {useVbenVxeGrid, type VxeGridProps} from "#/adapter/vxe-table";

const emit = defineEmits(['pageReload']);

const settlementsRule = ref<{
  event: string,
  price: number,
  eventName: string
}[]>([]);




const objectRequest = ref<CreateEventSettlementRequest>({
  name: '',
  platform: '',
  remark: '',
  settlementsRule: []
});
const isUpdate = ref<Boolean>(false);


async function getPlatformCallbackBehaviorTypeItem(platform: string) {
  const data = await platformCallbackApi.fetchPlatformCallbackBehaviorTypeItem(
    platform
  );
  data.forEach((item) => {
    settlementsRule.value.push({
      event: item.value,
      eventName: item.label,
      price: 0,
    });
  });

  gridApi.setGridOptions({data: settlementsRule.value})
}

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  handleSubmit: async (formVal: Record<string, any>) => {

    formVal['settlementsRule'] = settlementsRule.value.map(item => {
      return {
        event: item.event,
        price: item.price,
        eventName: item.eventName
      }
    })
    const params = trimObject(formVal) as UpdateEventSettlementRequest;

    if (isUpdate.value) {
      await eventSettlementApi.fetchEventSettlementUpdate(params);
    } else {
      await eventSettlementApi.fetchEventSettlementCreate(params);
    }
  },
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
        triggerFields: ['*'],
      },
    },
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Select',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
        options: PLATFORM,
        onSelect: async (value: string) => {
          await getPlatformCallbackBehaviorTypeItem(value)
        }
      },
      // 字段名
      fieldName: 'platform',
      // 界面显示的label
      label: `${$t('ocpx.event_settlement.columns.platform')}`,
      rules: 'required',
    },

    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      // 字段名
      fieldName: 'name',
      // 界面显示的label
      label: `${$t('ocpx.event_settlement.columns.name')}`,
      rules: 'required',
    },

    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Textarea',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      // 字段名
      fieldName: 'remark',
      // 界面显示的label
      label: `${$t('ocpx.event_settlement.columns.remark')}`,
    },

  ],
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
});

const [Modal, modalApi] = useVbenModal({
  fullscreen: true,
  fullscreenButton: false,
  closeOnPressEscape: false,
  closable: false,
  onCancel() {
    modalApi.close();
    settlementsRule.value = [];
    gridApi.setGridOptions({data: []});
    formApi.resetForm();
    isUpdate.value = false;
  },
  async onConfirm() {
    const result = await formApi.validate()
    if (!result.valid && settlementsRule.value.length === 0) {
      return
    }
    await formApi.submitForm();
    isUpdate.value = false;
    settlementsRule.value = [];
    gridApi.setGridOptions({data: []});
    emit('pageReload');
    await modalApi.close();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      objectRequest.value = modalApi.getData<Record<string, any>>();
      if (objectRequest.value.id) {
        isUpdate.value = true;
        handleSetFormValue(objectRequest.value);
      } else {
        isUpdate.value = false;
      }
    }
  },
});

function handleSetFormValue(row: UpdateEventSettlementRequest) {
  formApi.setValues(row);
  row.settlementsRule.forEach((item) => {
    settlementsRule.value.push({
      event: item.event,
      eventName: item.eventName,
      price: item.price,
    });
  });
  gridApi.setGridOptions({data: settlementsRule.value})
}

const gridOptions: VxeGridProps<{ event: string, price: number }> = {
  border: true,
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  data: settlementsRule.value,
  columns: [
    {title: '序号', type: 'seq',},
    {
      field: 'eventName',
      title: `${$t('ocpx.event_settlement.columns.eventName')}`,
    },
    {
      field: 'event',
      title: `${$t('ocpx.event_settlement.columns.event')}`,
    },
    {
      field: 'price',
      title: `${$t('ocpx.event_settlement.columns.price')}`,
      slots: {default: 'price'},
    },
  ],
  rowConfig: {
    keyField: 'id',
  },
  keepSource: true,
  proxyConfig: undefined,
  pagerConfig: {
    enabled: false,
  },

};
const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions,
});


function handlePriceChange(row: any, newValue: number) {
  const index = settlementsRule.value.findIndex(item => item.event === row.event);
  if (index !== -1) {
    // 创建新对象触发响应式更新
    const updatedItem = {
      ...settlementsRule.value[index],
      price: newValue
    };
    settlementsRule.value.splice(index, 1, updatedItem);

    // 强制更新表格显示
    gridApi.setGridOptions({data: [...settlementsRule.value]});
  }
}

const title: string = objectRequest.value
  ? `${$t('common.edit')}`
  : `${$t('common.create')}`;
</script>
<template>

  <Modal :title="title">
    <Page>
      <Card>
        <Form>

        </Form>
      </Card>
      <Card>
        <Grid>
          <template #price="{ row }">
            <InputNumber :value="row.price" @change="(value) => handlePriceChange(row, value)"/>
          </template>
        </Grid>
      </Card>
    </Page>
  </Modal>
</template>
