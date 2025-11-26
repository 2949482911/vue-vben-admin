<script lang="ts" setup name="CreateNotice">
import type {
  CreateSystemMetric,
  PlatformMetricMap,
  UpdateMetric,
} from '#/api/models';

import {ref} from 'vue';

import {Page, useVbenModal} from '@vben/common-ui';
import {$t} from '@vben/locales';

import {useVbenForm} from '#/adapter/form';
import {metricApi} from '#/api/core';
import type {VxeGridProps} from "#/adapter/vxe-table";
import {useVbenVxeGrid} from "@vben/plugins/vxe-table";
import {Button, Divider, Select, Input} from 'ant-design-vue';
import {ACTIVE_PLATFORM} from "#/constants/locales";

const emit = defineEmits(['pageReload']);
// 媒体字段映射
const platformMetricMap = ref<PlatformMetricMap[]>([
  {
    platform: 'vivo',
    metricName: '',
  },
]);
const showPlatformMetricMap = ref<Boolean>(true);

// 设置默认指标映射
function defaultPlatformMetricMap() {
  platformMetricMap.value = [
    {
      platform: 'vivo',
      metricName: '',
    }
  ];
  gridApi.setGridOptions({data: platformMetricMap.value});
  gridApi.reload();
}

const objectRequest = ref<CreateSystemMetric | UpdateMetric>({
  platformMetricMap: [],
  tags: [],
  cname: "",
  description: "",
  metricType: 0,
  ename: "",
  formula: "",
  id: "",
  implMethod: ""
});
const isUpdate = ref<Boolean>(false);


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
    formVal.platformMetricMap = platformMetricMap.value;
    await (isUpdate.value
      ? metricApi.fetchUpdateMetric(formVal as UpdateMetric)
      : metricApi.fetchCreateMetric(formVal as CreateSystemMetric));
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
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      // 字段名
      fieldName: 'ename',
      // 界面显示的label
      label: `${$t('marketing.metric.columns.ename')}`,
      rules: 'required',

    },

    {
      component: 'Input',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      rules: 'required',
      fieldName: 'cname',
      label: `${$t('marketing.metric.columns.cname')}`,
    },

    {
      component: 'Textarea',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      rules: 'required',
      fieldName: 'description',
      label: `${$t('marketing.metric.columns.description')}`,
    },

    {
      component: 'Select',
      componentProps: {
        placeholder: `${$t('common.input')}`,
        onSelect: (value: number) => {
          if (value === 1) {
            showPlatformMetricMap.value = true;
          } else {
            showPlatformMetricMap.value = false;
            defaultPlatformMetricMap();
          }
        },
        options: [
          {
            label: `${$t('marketing.metric.metricType.atomic')}`,
            value: 1,
          },
          {
            label: `${$t('marketing.metric.metricType.derive')}`,
            value: 2,
          },
          {
            label: `${$t('marketing.metric.metricType.eventMetric')}`,
            value: 3,
          },
        ]
      },
      defaultValue: 1,
      rules: 'required',
      fieldName: 'metricType',
      label: `${$t('marketing.metric.columns.metricType')}`,
    },

    {
      component: 'Select',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      rules: 'required',
      fieldName: 'formula',
      label: `${$t('marketing.metric.columns.formula')}`,
      dependencies: {
        show: async () => {
          const formVal = await formApi.getValues()
          return formVal["metricType"] === 2;
        },
        triggerFields: ["metricType"]
      }
    },


    {
      component: 'Input',
      componentProps: {
        placeholder: `${$t('common.input')}`,
      },
      rules: 'required',
      fieldName: 'implMethod',
      label: `${$t('marketing.metric.columns.implMethod')}`,
      dependencies: {
        show: async () => {
          const formVal = await formApi.getValues()
          return formVal["metricType"] === 3;
        },
        triggerFields: ["metricType"]
      }
    },

    {
      component: 'InputNumber',
      componentProps: {
        placeholder: `${$t('common.input')}`,
        min: 1,
      },
      defaultValue: 1,
      rules: 'required',
      fieldName: 'sort',
      label: `${$t('marketing.metric.columns.sort')}`,
    },

  ],
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
});


// 原子指标映射
const gridOptions: VxeGridProps<PlatformMetricMap> = {
  border: true,
  checkboxConfig: {
    highlight: true,
  },
  columns: [
    {title: '序号', type: 'seq'},
    {
      field: 'platform',
      title: `${$t('ocpx.behavioraplatform.columns.platform')}`,
      slots: {default: 'platform'},
    },
    {
      field: 'metricName',
      title: `指标名字`,
      slots: {default: 'metricName'},
    }

  ],
  // height: 'auto',
  keepSource: true,
  proxyConfig: {
    enabled: false,
  },
  data: objectRequest.value.platformMetricMap,
  pagerConfig: {
    enabled: false,
  },
};


const [Grid, gridApi] = useVbenVxeGrid({gridOptions});


// 新增映射列
function addPlatformMetric() {
  platformMetricMap.value.push({
    platform: "vivo",
    metricName: "",
  })
  gridApi.setGridOptions({data: platformMetricMap.value})
  gridApi.reload()
}


const [Modal, modalApi] = useVbenModal({
  fullscreen: true,
  fullscreenButton: false,
  closeOnPressEscape: false,
  async onCancel() {
    await formApi.resetForm();
    objectRequest.value = {
      platformMetricMap: [],
      tags: [],
      cname: "",
      description: "",
      metricType: 0,
      ename: "",
      formula: "",
      id: "",
      implMethod: ""
    };
    defaultPlatformMetricMap();
    isUpdate.value = false;
    await modalApi.close();
  },
  async onConfirm() {
    const result = await formApi.validate();
    if (!result.valid) {
      return
    }
    await formApi.submitForm();
    isUpdate.value = false;
    emit('pageReload');
    defaultPlatformMetricMap();

    await modalApi.close();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      objectRequest.value = modalApi.getData<Record<string, any>>() as UpdateMetric | CreateSystemMetric;
      if (objectRequest.value.id) {
        isUpdate.value = true;
        handleSetFormValue(objectRequest.value);
      } else {
        isUpdate.value = false;
      }
    }
  },
});

function handleSetFormValue(row: UpdateMetric | CreateSystemMetric) {
  formApi.setValues(row);
  platformMetricMap.value = row.platformMetricMap;
  gridApi.setGridOptions({data: platformMetricMap.value})
  gridApi.reload();
}

const title: string = isUpdate.value
  ? `${$t('common.edit')}`
  : `${$t('common.create')}`;
</script>
<template>
  <Modal :title="title">
    <Page>
      <Form/>
      <Divider></Divider>
      <Grid v-show="showPlatformMetricMap">
        <template #platform="{seq}">
          <Select :options="ACTIVE_PLATFORM"
                  v-model:value="platformMetricMap[seq-1].platform" width="100%">

          </Select>
        </template>

        <template #metricName="{seq}">
          <Input v-model:value="platformMetricMap[seq-1].metricName"/>
        </template>

        <template #toolbar-tools>
          <Button block class="mt-5" type="dashed" @click="addPlatformMetric"> {{
              $t('common.create')
            }}
          </Button>
        </template>
      </Grid>


    </Page>
  </Modal>
</template>
