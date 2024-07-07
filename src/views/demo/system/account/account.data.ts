import { isAccountExist } from '@/api/demo/system';
import { BasicColumn, FormSchema } from '@/components/Table';
import { useI18n } from '@/hooks/web/useI18n';

const { t } = useI18n();
export const columns: BasicColumn[] = [
  {
    title: `${t('sys.account.column.authName')}`,
    dataIndex: 'authName',
    width: 120,
    sorter: true,
  },
  {
    title: `${t('sys.account.column.nickname')}`,
    dataIndex: 'nickname',
    width: 120,
    sorter: true,
  },
  {
    title: `${t('sys.account.column.email')}`,
    dataIndex: 'email',
    width: 120,
  },
  {
    title: `${t('sys.account.column.phone')}`,
    dataIndex: 'phone',
    width: 120,
    sorter: true,
  },
  {
    title: `${t('common.create_time')}`,
    dataIndex: 'createTime',
    width: 180,
    sorter: true,
  },
  {
    title: `${t('sys.account.column.roleList')}`,
    dataIndex: 'roleList',
    width: 200,
  },
  {
    title: `${t('sys.account.column.remark')}`,
    dataIndex: 'remark',
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: `${t('sys.account.column.authName')}`,
    label: '用户名',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: `${t('sys.account.column.nickname')}`,
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
    field: `${t('sys.account.column.authName')}`,
    label: '用户名',
    component: 'Input',
    ifShow: ({ values }) => {
      return !values.id;
    },
    helpMessage: ['本字段演示异步验证', '不能输入带有admin的用户名'],
    dynamicRules: ({ values }) => {
      // 修改时不做校验
      if (values.id) {
        return [];
      }
      return [
        {
          required: !values.id,
          message: '请输入用户名',
          trigger: 'change',
          validator: (_, value) => {
            return new Promise((resolve, reject) => {
              isAccountExist(value)
                .then(() => resolve())
                .catch((err) => {
                  reject(err.message || '验证失败');
                });
            });
          },
        },
      ];
    },
    // rules: [
    //   {
    //     required: true,
    //     message: '请输入用户名',
    //     trigger: 'change',
    //   },
    //   {
    //     validator(_, value) {
    //       return new Promise((resolve, reject) => {
    //         isAccountExist(value)
    //           .then(() => resolve())
    //           .catch((err) => {
    //             reject(err.message || '验证失败');
    //           });
    //       });
    //     },
    //   },
    // ],
  },
  {
    field: 'authPwd',
    label: `${t('sys.account.column.authPwd')}`,
    component: 'InputPassword',
    required: true,
    ifShow: false,
  },
  {
    label: `${t('sys.account.column.roleList')}`,
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
    label: `${t('sys.account.column.dataRangeId')}`,
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
    label: `${t('sys.account.column.org')}`,
    field: 'orgId',
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
    label: `${t('sys.account.column.nickname')}`,
    field: 'nickname',
    component: 'Input',
    required: true,
  },

  {
    field: `${t('sys.account.column.email')}`,
    label: 'email',
    component: 'Input',
    required: true,
  },

  {
    label: `${t('sys.account.column.phone')}`,
    field: 'phone',
    component: 'Input',
  },

  {
    label: `${t('sys.account.column.remark')}`,
    field: 'remark',
    component: 'InputTextArea',
  },
];
