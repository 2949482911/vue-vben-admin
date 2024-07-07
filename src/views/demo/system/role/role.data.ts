import { BasicColumn, FormSchema } from '@/components/Table';
import { h } from 'vue';
import { Switch } from 'ant-design-vue';
import { setRoleEnable, setRoleDisable } from '@/api/demo/system';
import { useMessage } from '@/hooks/web/useMessage';
import { useI18n } from '@/hooks/web/useI18n';

const { t } = useI18n();

type CheckedType = boolean | string | number;
export const columns: BasicColumn[] = [
  {
    title: `${t('sys.role.column.name')}`,
    dataIndex: 'name',
    width: 200,
    sorter: true,
  },
  {
    title: `${t('sys.role.column.comment')}`,
    dataIndex: 'comment',
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
    sorter: true,
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
          const { createMessage } = useMessage();
          if (newStatus === 1) {
            setRoleEnable(record.id).then(() => {
              record.status = newStatus;
            });
          } else {
            setRoleDisable(record.id).then(() => {
              record.status = newStatus;
            });
          }
          createMessage.success(`已成功修改角色状态`);
          record.pendingStatus = false;
        },
      });
    },
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'name',
    label: `${t('sys.role.column.name')}`,
    component: 'Input',
    colProps: { span: 8 },
  },

  {
    field: 'status',
    label: `${t('common.status')}`,
    component: 'Select',
    componentProps: {
      options: [
        { label: `${t('common.enable')}`, value: 1 },
        { label: `${t('common.disable')}`, value: 9 },
      ],
    },
    colProps: { span: 8 },
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
    label: `${t('sys.role.column.name')}`,
    required: true,
    component: 'Input',
  },
  {
    field: 'roleType',
    label: `${t('sys.role.column.roleType')}`,
    component: 'Select',
    required: true,
    componentProps: {
      options: [
        { label: '超级管理员', value: 1 },
        { label: '平台管理员', value: 2 },
        { label: '平台用户', value: 3 },
        { label: '主体管理员', value: 4 },
        { label: '主体角色', value: 5 },
      ],
    },
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
  },
  {
    label: `${t('sys.role.column.comment')}`,
    field: 'comment',
    component: 'InputTextArea',
  },
  {
    field: 'menuIds',
    slot: 'menu',
    component: 'Input',
  },
];
