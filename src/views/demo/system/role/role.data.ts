import { BasicColumn, FormSchema } from '@/components/Table';
import { h } from 'vue';
import { Switch } from 'ant-design-vue';
import { setRoleEnable, setRoleDisable } from '@/api/demo/system';
import { useMessage } from '@/hooks/web/useMessage';

type CheckedType = boolean | string | number;
export const columns: BasicColumn[] = [
  {
    title: '角色名称',
    dataIndex: 'name',
    width: 200,
    sorter: true,
  },
  {
    title: '描述',
    dataIndex: 'comment',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 180,
    sorter: true,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 120,
    sorter: true,
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
    label: '角色名称',
    component: 'Input',
    colProps: { span: 8 },
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
    label: '角色名称',
    required: true,
    component: 'Input',
  },
  {
    field: 'roleType',
    label: '角色类型',
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
    field: 'comment',
    component: 'InputTextArea',
  },
  {
    label: ' ',
    field: 'menuIds',
    slot: 'menu',
    component: 'Input',
  },
];
