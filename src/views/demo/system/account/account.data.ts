import { isAccountExist } from '/@/api/demo/system';
import { BasicColumn, FormSchema } from '/@/components/Table';

export const columns: BasicColumn[] = [
  {
    title: '用户名',
    dataIndex: 'authName',
    width: 120,
  },
  {
    title: '昵称',
    dataIndex: 'nickname',
    width: 120,
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    width: 120,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 180,
  },
  {
    title: '角色',
    dataIndex: 'roleList',
    width: 200,
  },
  {
    title: '备注',
    dataIndex: 'remark',
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'account',
    label: '用户名',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'nickname',
    label: '昵称',
    component: 'Input',
    colProps: { span: 8 },
  },
];

export const accountFormSchema: FormSchema[] = [
  {
    field: 'id',
    component: 'Input',
    ifShow: false,
  },
  {
    field: 'authName',
    label: '用户名',
    component: 'Input',
    helpMessage: ['本字段演示异步验证', '不能输入带有admin的用户名'],
    rules: [
      {
        required: true,
        message: '请输入用户名',
      },
      {
        validator(_, value) {
          return new Promise((resolve, reject) => {
            isAccountExist(value)
              .then(() => resolve())
              .catch((err) => {
                reject(err.message || '验证失败');
              });
          });
        },
      },
    ],
  },
  {
    field: 'pwd',
    label: '密码',
    component: 'InputPassword',
    required: true,
    ifShow: false,
  },
  {
    label: '角色',
    field: 'roleIds',
    component: 'Select',
    defaultValue: [],
    componentProps: {
      mode: 'multiple',
      allowClear: true,
      fieldNames: {
        label: 'name',
        key: 'id',
        value: 'id',
      },
    },
    required: true,
  },

  {
    label: '数据范围',
    field: 'dataRangeId',
    component: 'Select',
    defaultValue: [],
    componentProps: {
      allowClear: true,
      fieldNames: {
        label: 'name',
        key: 'id',
        value: 'id',
      },
    },
    required: true,
  },

  {
    field: 'orgId',
    label: '所属部门',
    component: 'TreeSelect',
    componentProps: {
      fieldNames: {
        label: 'name',
        key: 'id',
        value: 'id',
      },

      getPopupContainer: () => document.body,
    },
    required: true,
  },
  {
    field: 'nickname',
    label: '昵称',
    component: 'Input',
    required: true,
  },

  {
    label: '邮箱',
    field: 'email',
    component: 'Input',
    required: true,
  },

  {
    label: '密码',
    field: 'password',
    component: 'InputPassword',
    required: true,
    ifShow: ({ values }) => {
      return !values.id;
    },
  },

  {
    label: '电话',
    field: 'phone',
    component: 'Input',
  },

  {
    label: '备注',
    field: 'remark',
    component: 'InputTextArea',
  },
];
