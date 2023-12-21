import { BasicColumn, FormSchema } from '@/components/Table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';
import Icon from '@/components/Icon/Icon.vue';

export const columns: BasicColumn[] = [
  {
    title: '标题',
    dataIndex: 'title',
    width: 200,
    align: 'left',
  },
  {
    title: '类型',
    dataIndex: 'type',
    width: 100,
    customRender: ({ record }) => {
      const type = record.type;
      let color = '';
      let text = '';
      if (type === 1) {
        text = '菜单';
        color = 'green';
      } else if (type === 2) {
        text = '接口';
        color = 'red';
      } else if (type === 3) {
        text = '按钮';
        color = 'blue';
      } else {
        text = '未知';
        color = '';
      }
      return h(Tag, { color: color }, () => text);
    },
  },
  {
    title: '图标',
    dataIndex: 'icon',
    width: 50,
    customRender: ({ record }) => {
      return h(Icon, { icon: record.icon });
    },
  },
  {
    title: '权限标识',
    dataIndex: 'mark',
    width: 180,
  },
  {
    title: '组件',
    dataIndex: 'component',
    width: 180,
  },
  {
    title: '路由',
    dataIndex: 'path',
    width: 180,
  },
  {
    title: '排序',
    dataIndex: 'sort',
    width: 50,
  },

  {
    title: '状态',
    dataIndex: 'status',
    width: 80,
    customRender: ({ record }) => {
      const status = record.status;
      const enable = ~~status === 0;
      const color = enable ? 'green' : 'red';
      const text = enable ? '启用' : '停用';
      return h(Tag, { color: color }, () => text);
    },
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 180,
  },
];

// const isDir = (type: number) => type === 1;
const isInterface = (type: number) => type === 2;
const isMenu = (type: number) => type === 1;
const isButton = (type: number) => type === 3;

export const searchFormSchema: FormSchema[] = [
  {
    field: 'name',
    label: '菜单名称',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'status',
    label: '状态',
    component: 'Select',
    componentProps: {
      options: [
        { label: '启用', value: 0 },
        { label: '停用', value: 1 },
      ],
    },
    colProps: { span: 8 },
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
    field: 'type',
    label: '菜单类型',
    component: 'RadioButtonGroup',
    defaultValue: 1,
    componentProps: {
      options: [
        { label: '菜单', value: 1 },
        { label: '接口', value: 2 },
        { label: '按钮', value: 3 },
      ],
    },
    colProps: { lg: 24, md: 24 },
  },
  {
    field: 'name',
    label: '菜单名称',
    component: 'Input',
    required: true,
  },

  {
    field: 'title',
    label: '标题',
    component: 'Input',
    required: true,
  },

  {
    field: 'parentId',
    label: '上级菜单',
    component: 'TreeSelect',
    componentProps: {
      fieldNames: {
        label: 'title',
        key: 'id',
        value: 'id',
      },
      getPopupContainer: () => document.body,
    },
  },

  {
    field: 'sort',
    label: '排序',
    component: 'InputNumber',
    required: true,
  },
  {
    field: 'icon',
    label: '图标',
    component: 'IconPicker',
    required: true,
    ifShow: ({ values }) => isMenu(values.type),
  },

  {
    field: 'path',
    label: '路由地址',
    component: 'Input',
    required: true,
    ifShow: ({ values }) => isMenu(values.type),
  },

  {
    field: 'redirect',
    label: '重定向地址',
    component: 'Input',
    ifShow: ({ values }) => isMenu(values.type),
  },

  {
    field: 'component',
    label: '组件路径',
    component: 'Input',
    ifShow: ({ values }) => isMenu(values.type),
  },

  {
    field: 'backendUrl',
    label: 'API',
    component: 'Input',
    ifShow: ({ values }) => isInterface(values.type),
    required: true,
  },
  {
    field: 'mark',
    label: '权限标识',
    component: 'Input',
    ifShow: ({ values }) => isInterface(values.type),
    required: ({ values }) => isInterface(values.type),
  },
  {
    field: 'status',
    label: '状态',
    component: 'RadioButtonGroup',
    defaultValue: 1,
    componentProps: {
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 9 },
      ],
    },
  },

  {
    field: 'isInternal',
    label: '内部菜单',
    component: 'RadioButtonGroup',
    defaultValue: 0,
    componentProps: {
      options: [
        { label: '否', value: 0 },
        { label: '是', value: 1 },
      ],
    },
  },

  {
    field: 'show',
    label: '是否显示',
    component: 'RadioButtonGroup',
    defaultValue: '0',
    componentProps: {
      options: [
        { label: '是', value: '0' },
        { label: '否', value: '1' },
      ],
    },
    ifShow: ({ values }) => isButton(values.type),
  },
];
