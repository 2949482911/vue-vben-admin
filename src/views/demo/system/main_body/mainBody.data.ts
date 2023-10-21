import { BasicColumn, FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Switch } from 'ant-design-vue';
import { enableMainBody, disableMainBody } from '/@/api/demo/system';
import { useMessage } from '/@/hooks/web/useMessage';

type CheckedType = boolean | string | number;
export const columns: BasicColumn[] = [
  {
    title: '主体',
    dataIndex: 'name',
    width: 200,
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    width: 200,
  },
  {
    title: '备注',
    dataIndex: 'comment',
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
          const { createMessage } = useMessage();
          if (newStatus === 1) {
            enableMainBody(record.id).then(() => {
              record.status = newStatus;
            });
          } else {
            disableMainBody(record.id).then(() => {
              record.status = newStatus;
            });
          }
          createMessage.success(`已成功修改主体状态`);
          record.pendingStatus = false;
        },
      });
    },
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'name',
    label: '主体名称',
    component: 'Input',
    colProps: { span: 8 },
  },

  {
    field: 'email',
    label: '邮箱',
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
    label: '主体名称',
    required: true,
    component: 'Input',
  },
  {
    field: 'email',
    label: '邮箱',
    required: true,
    component: 'Input',
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
];
