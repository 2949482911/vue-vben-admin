import { BasicColumn, FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Switch, Tag } from 'ant-design-vue';
import { enableMainBody, disableMainBody, getAccountList, getDeptList } from '/@/api/demo/system';

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
    title: '名字',
    dataIndex: 'name',
    width: 200,
  },
  {
    title: '类型',
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
    title: '备注',
    dataIndex: 'remark',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 180,
  },

  {
    title: '状态',
    dataIndex: 'status',
    width: 120,
    customRender: ({ record }) => {
      if (!Reflect.has(record, 'pendingStatus')) {
        record.pendingStatus = false;
      }
      return h(Switch, {
        checked: record.status === 1,
        checkedChildren: '停用',
        unCheckedChildren: '启用',
        loading: record.pendingStatus,
        onChange(checked: CheckedType) {
          record.pendingStatus = true;
          const newStatus = checked ? 1 : 9;
          if (newStatus === 1) {
            enableMainBody(record.id).then(() => {
              record.status = newStatus;
            });
          } else {
            disableMainBody(record.id).then(() => {
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
    label: '权限名字',
    component: 'Input',
    colProps: { span: 6 },
  },

  {
    field: 'type',
    label: '权限类型',
    component: 'Select',
    componentProps: {
      options: dataScopeTypeOptions,
    },
    colProps: { span: 6 },
  },

  {
    field: 'status',
    label: '状态',
    component: 'Select',
    componentProps: {
      options: [
        { label: '启用', value: 1 },
        { label: '停用', value: 9 },
      ],
    },
    colProps: { span: 6 },
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
    label: '权限名字',
    required: true,
    component: 'Input',
  },
  {
    field: 'type',
    label: '权限类型',
    required: true,
    component: 'Select',
    componentProps: {
      options: dataScopeTypeOptions,
    },
  },

  {
    field: 'userIds',
    label: '用户',
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
    label: '部门',
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
    field: 'status',
    label: '状态',
    component: 'RadioButtonGroup',
    defaultValue: 1,
    componentProps: {
      options: [
        { label: '启用', value: 1 },
        { label: '停用', value: 9 },
      ],
    },
  },
  {
    label: '备注',
    field: 'remark',
    component: 'InputTextArea',
  },
];
