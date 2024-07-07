import { BasicColumn, FormSchema } from '@/components/Table';
import { h } from 'vue';
import { Switch, Tag } from 'ant-design-vue';
import { getAccountList, getDeptList, enableDataScope, disableDataScope } from '@/api/demo/system';
import { useI18n } from '@/hooks/web/useI18n';

const { t } = useI18n();
type CheckedType = boolean | string | number;

enum dataScopeEnum {
  SELF = 1,
  USER_SCOPE = 2,
  DEPT_SCOPE = 3,
  DEPT_AND_USER_SCOPE = 4,
  ALL_SCOPE = 5,
  BELONG_DEPT = 6,
  BELONG_DEPT_AND_SUB = 7,
  MAIN_SCOPE = 8,
}

const dataScopeTypeOptions = [
  { label: '自己', value: 1 },
  { label: '指定用户', value: 2 },
  { label: '指定部门', value: 3 },
  { label: '指定部门与指定用户', value: 4 },
  { label: '全部数据', value: 5 },
  { label: '所在部门', value: 6 },
  { label: '所在部门及以下部门', value: 7 },
  { label: '主体', value: 8 },
];

export const columns: BasicColumn[] = [
  {
    title: `${t('sys.dataScope.column.name')}`,
    dataIndex: 'name',
    width: 200,
  },
  {
    title: `${t('sys.dataScope.column.type')}`,
    dataIndex: 'type',
    width: 200,
    customRender: ({ record }) => {
      const type = record.type;
      let color = '';
      let text = '';
      dataScopeTypeOptions.forEach((x) => {
        if (x.value === type) {
          text = x.label;
          color = 'green';
        }
      });
      return h(Tag, { color: color }, () => text);
    },
  },
  {
    title: `${t('sys.dataScope.column.remark')}`,
    dataIndex: 'remark',
  },
  {
    title: `${t('common.create_time')}`,
    dataIndex: 'createTime',
    width: 180,
    sorter: true,
  },

  {
    title: `${t('common.status')}`,
    dataIndex: 'status',
    width: 120,
    customRender: ({ record }) => {
      if (!Reflect.has(record, 'pendingStatus')) {
        record.pendingStatus = false;
      }
      return h(Switch, {
        checked: record.status === 1,
        checkedChildren: `${t('common.disable')}`,
        unCheckedChildren: `${t('common.enable')}`,
        loading: record.pendingStatus,
        onChange(checked: CheckedType) {
          record.pendingStatus = true;
          const newStatus = checked ? 1 : 9;
          if (newStatus === 1) {
            enableDataScope(record.id).then(() => {
              record.status = newStatus;
            });
          } else {
            disableDataScope(record.id).then(() => {
              record.status = newStatus;
            });
          }
          record.pendingStatus = false;
        },
      });
    },
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'name',
    label: `${t('sys.dataScope.column.name')}`,
    component: 'Input',
    colProps: { span: 6 },
  },

  {
    field: 'type',
    label: `${t('sys.dataScope.column.type')}`,
    component: 'Select',
    componentProps: {
      options: dataScopeTypeOptions,
    },
    colProps: { span: 6 },
  },

  {
    field: 'status',
    label: `${t('common.status')}`,
    component: 'Select',
    colProps: { span: 8 },
    componentProps: {
      options: [
        { label: `${t('common.enable')}`, value: 1 },
        { label: `${t('common.disable')}`, value: 9 },
      ],
    },
  },
];

export const formSchema: FormSchema[] = [
  {
    field: 'id',
    component: 'Input',
    ifShow: false,
  },
  {
    field: 'name',
    label: `${t('sys.dataScope.column.name')}`,
    required: true,
    component: 'Input',
  },
  {
    field: 'type',
    label: `${t('sys.dataScope.column.type')}`,
    required: true,
    component: 'Select',
    componentProps: {
      options: dataScopeTypeOptions,
    },
  },

  {
    field: 'userIds',
    label: `${t('sys.dataScope.column.user')}`,
    component: 'ApiSelect',
    componentProps: {
      api: getAccountList,
      mode: 'multiple',
      params: {
        page: 1,
        page_size: 1000,
      },
      resultField: 'items',
      labelField: 'nickname',
      // use id as value
      valueField: 'id',
    },
    ifShow: ({ values }) => {
      return (
        values.type == dataScopeEnum.USER_SCOPE || values.type == dataScopeEnum.DEPT_AND_USER_SCOPE
      );
    },
  },

  {
    field: 'orgIds',
    label: `${t('sys.dataScope.column.org')}`,
    component: 'ApiTreeSelect',
    componentProps: {
      api: getDeptList,
      mode: 'multiple',
      resultField: 'result',
      labelField: 'name',
      // use id as value
      valueField: 'id',
    },
    ifShow: ({ values }) => {
      return (
        values.type == dataScopeEnum.DEPT_SCOPE || values.type == dataScopeEnum.DEPT_AND_USER_SCOPE
      );
    },
  },

  {
    label: `${t('sys.dataScope.column.remark')}`,
    field: 'remark',
    component: 'InputTextArea',
  },

  {
    field: 'status',
    label: `${t('common.status')}`,
    component: 'RadioButtonGroup',
    defaultValue: 1,
    componentProps: {
      options: [
        { label: `${t('common.enable')}`, value: 1 },
        { label: `${t('common.disable')}`, value: 9 },
      ],
    },
    required: true,
  },
];
