import { BasicColumn, FormSchema } from '@/components/Table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';

export const columns: BasicColumn[] = [
  {
    title: 'id',
    defaultHidden: true,
    dataIndex: 'id',
  },
  {
    title: '标题',
    dataIndex: 'title',
  },
  {
    title: '内容',
    dataIndex: 'content',
  },
  {
    title: '创建人',
    dataIndex: 'createUserName',
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 80,
    customRender: ({ record }) => {
      const status = record.status;
      const enable = ~~status === 1;
      const color = enable ? 'green' : 'red';
      const text = enable ? '启用' : '停用';
      return h(Tag, { color: color }, () => text);
    },
  },
  {
    title: '操作时间',
    dataIndex: 'createTime',
    width: 200,
  },
  {
    title: '编辑人',
    dataIndex: 'updateUserName',
  },
  {
    title: '编辑时间',
    dataIndex: 'updateTime',
    width: 200,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'title',
    label: '标题',
    component: 'Input',
    colProps: { span: 8 },
  },

  {
    field: 'status',
    label: '状态',
    component: 'Select',
    colProps: { span: 8 },
    componentProps: {
      options: [
        { label: '启用', value: 1 },
        { label: '停用', value: 9 },
      ],
    },
  },
];

export const formSchema: FormSchema[] = [
  {
    field: 'id',
    label: 'id',
    component: 'Input',
    ifShow: false,
  },

  {
    field: 'title',
    label: '标题',
    component: 'Input',
    required: true,
  },

  {
    field: 'content',
    label: '内容',
    component: 'InputTextArea',
    required: true,
  },

  {
    field: 'status',
    label: '状态',
    component: 'Select',
    required: true,
    defaultValue: 9,
    componentProps: {
      options: [
        { label: '启用', value: 1 },
        { label: '停用', value: 9 },
      ],
    },
    colProps: { span: 8 },
  },
];
